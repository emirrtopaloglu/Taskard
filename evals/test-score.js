#!/usr/bin/env node

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { scoreRun, summarizeRuns, scenarios, scenarioDigest } = require('./score');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taskard-eval-test-'));
const scenario = scenarios['01-micro-commit'];
const scenarioSha256 = scenarioDigest(scenario);
assert.notEqual(scenarioDigest({ ...scenario, criteria: scenario.criteria.slice(1) }), scenarioSha256);

function writeRun(series, repeat, overrides = {}) {
  const dir = path.join(root, `${series}-${repeat}`);
  const evidenceDir = path.join(dir, 'evidence');
  fs.mkdirSync(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'transcript.txt');
  fs.writeFileSync(evidencePath, `fixture evidence ${series} ${repeat}\n`);

  const evidenceFiles = [{
    id: 'transcript',
    path: 'evidence/transcript.txt',
    sha256: crypto.createHash('sha256').update(fs.readFileSync(evidencePath)).digest('hex'),
  }];
  const run = {
    schemaVersion: 1,
    runId: `${series}-${repeat}`,
    scenarioId: scenario.id,
    scenarioSha256,
    comparisonId: 'fixture-comparison',
    series,
    repeat,
    harnessId: 'claude-code',
    harnessVersion: 'fixture-1.0',
    model: 'fixture-model-1',
    subjectRevision: 'a'.repeat(40),
    taskardRevision: series === 'taskard' ? 'b'.repeat(40) : null,
    startedAt: '2026-09-30T10:00:00.000Z',
    durationMs: series === 'baseline' ? 1000 : 800,
    metrics: {
      inputTokens: series === 'baseline' ? 1000 : 900,
      outputTokens: 100,
      costUsd: series === 'baseline' ? 10 : 8,
      manualInterventions: 0,
    },
    checks: scenario.criteria.map((criterion) => ({
      id: criterion.id,
      status: 'pass',
      evidence: ['transcript'],
    })),
    evidenceFiles,
    ...overrides,
  };
  const runPath = path.join(dir, 'run.json');
  fs.writeFileSync(runPath, `${JSON.stringify(run, null, 2)}\n`);
  return { dir, runPath, run, evidencePath };
}

try {
  const passing = writeRun('taskard', 1);
  const scored = scoreRun(passing.runPath);
  assert.equal(scored.valid, true);
  assert.equal(scored.score, 1);

  const failedCheck = writeRun('taskard', 2, {
    checks: scenario.criteria.map((criterion, index) => ({
      id: criterion.id,
      status: index === 0 ? 'fail' : 'pass',
      evidence: ['transcript'],
    })),
  });
  assert.equal(scoreRun(failedCheck.runPath).score, (scenario.criteria.length - 1) / scenario.criteria.length);

  const missingMetadata = writeRun('taskard', 3, { harnessVersion: '' });
  assert.equal(scoreRun(missingMetadata.runPath).valid, false);

  const tampered = writeRun('taskard', 4);
  fs.appendFileSync(tampered.evidencePath, 'changed after hashing\n');
  assert.equal(scoreRun(tampered.runPath).valid, false);

  const escaped = writeRun('taskard', 5, {
    evidenceFiles: [{ id: 'transcript', path: '../outside.txt', sha256: '0'.repeat(64) }],
  });
  assert.equal(scoreRun(escaped.runPath).valid, false);

  const outsidePath = path.join(root, 'outside.txt');
  fs.writeFileSync(outsidePath, 'outside evidence\n');
  const linked = writeRun('taskard', 6);
  fs.unlinkSync(linked.evidencePath);
  fs.symlinkSync(outsidePath, linked.evidencePath);
  linked.run.evidenceFiles[0].sha256 = crypto.createHash('sha256').update(fs.readFileSync(outsidePath)).digest('hex');
  fs.writeFileSync(linked.runPath, `${JSON.stringify(linked.run, null, 2)}\n`);
  assert.equal(scoreRun(linked.runPath).valid, false);

  const paired = [];
  for (let repeat = 1; repeat <= 3; repeat++) {
    paired.push(scoreRun(writeRun('baseline', repeat).runPath));
    paired.push(scoreRun(writeRun('taskard', repeat, { runId: `paired-taskard-${repeat}` }).runPath));
  }
  const summary = summarizeRuns(paired);
  assert.equal(summary.groups.length, 1);
  assert.equal(summary.groups[0].comparisons.durationMs.reportable, true);
  assert.equal(summary.groups[0].comparisons.durationMs.medianReductionPercent, 20);

  const shortSummary = summarizeRuns(paired.filter((result) => result.run.series === 'baseline' || result.run.repeat < 3));
  assert.equal(shortSummary.groups[0].comparisons.durationMs.reportable, false);
  assert.equal(shortSummary.groups[0].comparisons.durationMs.pairedSamples, 2);

  const mixedRevisions = [];
  for (let repeat = 1; repeat <= 3; repeat++) {
    mixedRevisions.push(scoreRun(writeRun('baseline', repeat, { comparisonId: 'mixed-revision' }).runPath));
    mixedRevisions.push(scoreRun(writeRun('taskard', repeat, {
      comparisonId: 'mixed-revision',
      runId: `mixed-taskard-${repeat}`,
      ...(repeat === 3 ? { taskardRevision: 'c'.repeat(40) } : {}),
    }).runPath));
  }
  const mixedSummary = summarizeRuns(mixedRevisions);
  assert.equal(mixedSummary.groups[0].comparisons.durationMs.reportable, false);
  assert.equal(mixedSummary.groups[0].comparisons.durationMs.reason, 'taskard_revision_mismatch');

  const duplicateSlots = [
    scoreRun(writeRun('baseline', 1, { comparisonId: 'duplicate-slot', runId: 'duplicate-baseline-a' }).runPath),
    scoreRun(writeRun('baseline', 1, { comparisonId: 'duplicate-slot', runId: 'duplicate-baseline-b' }).runPath),
    scoreRun(writeRun('taskard', 1, { comparisonId: 'duplicate-slot', runId: 'duplicate-taskard' }).runPath),
  ];
  const duplicateSummary = summarizeRuns(duplicateSlots);
  assert.equal(duplicateSummary.invalidRuns.length, 2);
  assert.equal(duplicateSummary.groups[0].series.baseline.runs, 0);
  assert.equal(duplicateSummary.groups[0].comparisons.durationMs.reportable, false);
  console.log('PASS: fixture self-check validates evidence, fixed rubric, and three-pair threshold');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
