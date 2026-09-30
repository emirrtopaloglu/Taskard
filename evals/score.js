#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const EVALS_DIR = __dirname;
const scenariosFile = path.join(EVALS_DIR, 'scenarios.json');
const profilesFile = path.join(__dirname, '..', 'templates', 'harness-profiles.json');
const scenariosData = JSON.parse(fs.readFileSync(scenariosFile, 'utf8'));
const profiles = JSON.parse(fs.readFileSync(profilesFile, 'utf8'));
const scenarios = Object.fromEntries(scenariosData.scenarios.map((scenario) => [scenario.id, scenario]));
const METRICS = ['durationMs', 'inputTokens', 'outputTokens', 'tokenTotal', 'costUsd', 'manualInterventions'];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function scenarioDigest(scenario) {
  const sourcePath = path.join(EVALS_DIR, scenario.source);
  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  return sha256(JSON.stringify({
    id: scenario.id,
    source: scenario.source,
    criteria: scenario.criteria,
    sourceText,
  }));
}

function isNonnegativeNumber(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function isNonnegativeSafeInteger(value) {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);
}

function validateEvidencePath(runDir, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || /^[a-z]:[\\/]/i.test(relativePath)) {
    throw new Error(`evidence path must be relative: ${relativePath}`);
  }
  const segments = relativePath.split(/[\\/]/);
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`evidence path contains an unsafe segment: ${relativePath}`);
  }

  let current = runDir;
  for (const segment of segments) {
    current = path.join(current, segment);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`symlinked evidence path is not allowed: ${relativePath}`);
  }
  const resolved = fs.realpathSync(current);
  const relative = path.relative(fs.realpathSync(runDir), resolved);
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
    throw new Error(`evidence path is outside the run directory: ${relativePath}`);
  }
  if (!fs.statSync(current).isFile()) throw new Error(`evidence path is not a file: ${relativePath}`);
  return current;
}

function validateRun(run, runDir) {
  const errors = [];
  const requireText = (field) => {
    if (typeof run[field] !== 'string' || !run[field].trim()) errors.push(`${field} must be a non-empty string`);
  };
  const requireSha = (field, nullable = false) => {
    if (nullable && run[field] === null) return;
    if (typeof run[field] !== 'string' || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(run[field])) {
      errors.push(`${field} must be a 40- or 64-character commit SHA${nullable ? ' or null' : ''}`);
    }
  };

  if (run.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  requireText('runId');
  requireText('scenarioId');
  requireText('scenarioSha256');
  requireText('comparisonId');
  requireText('harnessId');
  requireText('harnessVersion');
  requireText('model');
  requireText('startedAt');
  if (!scenarios[run.scenarioId]) errors.push(`unknown scenarioId: ${run.scenarioId}`);
  if (!profiles.harnesses[run.harnessId]) errors.push(`unknown harnessId: ${run.harnessId}`);
  if (!['baseline', 'taskard'].includes(run.series)) errors.push('series must be baseline or taskard');
  if (!Number.isInteger(run.repeat) || run.repeat < 1) errors.push('repeat must be a positive integer');
  if (!Number.isFinite(Date.parse(run.startedAt)) || !run.startedAt.endsWith('Z')) errors.push('startedAt must be an ISO timestamp in UTC');
  if (!isNonnegativeNumber(run.durationMs)) errors.push('durationMs must be a non-negative number or null');
  requireSha('subjectRevision');
  requireSha('taskardRevision', run.series === 'baseline');
  if (run.series === 'taskard' && (!run.taskardRevision || typeof run.taskardRevision !== 'string')) {
    errors.push('taskardRevision is required for a Taskard run');
  }
  if (run.series === 'baseline' && run.taskardRevision !== null) errors.push('taskardRevision must be null for a baseline run');

  if (!run.metrics || typeof run.metrics !== 'object' || Array.isArray(run.metrics)) {
    errors.push('metrics must be an object');
  } else {
    for (const field of ['inputTokens', 'outputTokens', 'manualInterventions']) {
      if (!(field in run.metrics) || !isNonnegativeSafeInteger(run.metrics[field])) {
        errors.push(`metrics.${field} must be a non-negative safe integer or null`);
      }
    }
    if (!('costUsd' in run.metrics) || !isNonnegativeNumber(run.metrics.costUsd)) {
      errors.push('metrics.costUsd must be a non-negative number or null');
    }
  }

  const scenario = scenarios[run.scenarioId];
  if (scenario && typeof run.scenarioSha256 === 'string') {
    const expectedHash = scenarioDigest(scenario);
    if (!/^[a-f0-9]{64}$/i.test(run.scenarioSha256) || run.scenarioSha256.toLowerCase() !== expectedHash) {
      errors.push('scenarioSha256 does not match the current scenario rubric and source');
    }
  }

  const evidence = new Map();
  if (!Array.isArray(run.evidenceFiles)) {
    errors.push('evidenceFiles must be an array');
  } else {
    for (const item of run.evidenceFiles) {
      if (!item || typeof item.id !== 'string' || !item.id || evidence.has(item.id)) {
        errors.push('evidenceFiles must have unique non-empty ids');
        continue;
      }
      if (!/^[a-f0-9]{64}$/i.test(item.sha256 || '')) {
        errors.push(`evidence ${item.id} must include a SHA-256 hash`);
        continue;
      }
      try {
        const evidencePath = validateEvidencePath(runDir, item.path);
        if (sha256(fs.readFileSync(evidencePath)) !== item.sha256.toLowerCase()) {
          errors.push(`evidence hash mismatch: ${item.id}`);
        }
        evidence.set(item.id, evidencePath);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  let passed = 0;
  let failed = 0;
  let unverified = 0;
  if (!Array.isArray(run.checks)) {
    errors.push('checks must be an array');
  } else if (scenario) {
    const required = new Set(scenario.criteria.map((criterion) => criterion.id));
    const seen = new Set();
    for (const check of run.checks) {
      if (!check || typeof check.id !== 'string' || !required.has(check.id) || seen.has(check.id)) {
        errors.push(`check id is unknown or duplicated: ${check && check.id}`);
        continue;
      }
      seen.add(check.id);
      if (!['pass', 'fail', 'unverified'].includes(check.status)) {
        errors.push(`check ${check.id} status must be pass, fail, or unverified`);
        continue;
      }
      const refs = check.evidence;
      if (!Array.isArray(refs) || refs.some((id) => typeof id !== 'string' || !evidence.has(id))) {
        errors.push(`check ${check.id} references missing evidence`);
        continue;
      }
      if (check.status !== 'unverified' && refs.length === 0) errors.push(`check ${check.id} needs evidence`);
      if (check.status === 'unverified' && (typeof check.reason !== 'string' || !check.reason.trim())) {
        errors.push(`unverified check ${check.id} needs a reason`);
      }
      if (check.status === 'pass') passed++;
      if (check.status === 'fail') failed++;
      if (check.status === 'unverified') unverified++;
    }
    for (const id of required) if (!seen.has(id)) errors.push(`missing required check: ${id}`);
  }

  if (errors.length) throw new Error(errors.join('; '));
  const total = scenarios[run.scenarioId].criteria.length;
  return { run, score: passed / total, checks: { passed, failed, unverified, total } };
}

function scoreRun(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    if (fs.lstatSync(absolutePath).isSymbolicLink()) throw new Error('run artifact must not be a symlink');
    const run = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    const result = validateRun(run, path.dirname(absolutePath));
    return { valid: true, file: absolutePath, ...result };
  } catch (error) {
    return { valid: false, file: path.resolve(filePath), error: error.message };
  }
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function metricValue(run, metric) {
  if (metric === 'durationMs') return run.durationMs;
  if (metric === 'tokenTotal') {
    const { inputTokens, outputTokens } = run.metrics;
    return inputTokens === null || outputTokens === null ? null : inputTokens + outputTokens;
  }
  return run.metrics[metric];
}

function summarizeRuns(results) {
  const invalidRuns = results.filter((result) => !result.valid).map(({ file, error }) => ({ file, error }));
  const candidates = results.filter((result) => result.valid);
  const slots = new Map();
  for (const result of candidates) {
    const { run } = result;
    const comparisonKey = [run.scenarioId, run.harnessId, run.harnessVersion, run.model, run.subjectRevision, run.comparisonId].join('\u0000');
    const slotKey = `${comparisonKey}\u0000${run.series}\u0000${run.repeat}`;
    if (!slots.has(slotKey)) slots.set(slotKey, []);
    slots.get(slotKey).push(result);
  }
  const duplicateResults = new Set();
  for (const repeated of slots.values()) {
    if (repeated.length < 2) continue;
    for (const result of repeated) {
      duplicateResults.add(result);
      invalidRuns.push({
        file: result.file,
        error: `duplicate ${result.run.series} repeat ${result.run.repeat} in comparison group`,
      });
    }
  }
  const valid = candidates.filter((result) => !duplicateResults.has(result));
  const groups = new Map();
  for (const result of valid) {
    const { run } = result;
    const key = [run.scenarioId, run.harnessId, run.harnessVersion, run.model, run.subjectRevision, run.comparisonId].join('\u0000');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(result);
  }

  const summaries = [...groups.values()].map((group) => {
    const first = group[0].run;
    const bySeries = Object.fromEntries(['baseline', 'taskard'].map((series) => {
      const items = group.filter((item) => item.run.series === series);
      const perMetric = Object.fromEntries(METRICS.map((metric) => {
        const values = items.map((item) => metricValue(item.run, metric)).filter((value) => value !== null);
        return [metric, { samples: values.length, median: median(values) }];
      }));
      return [series, { runs: items.length, behaviorScoreMedian: median(items.map((item) => item.score)), metrics: perMetric }];
    }));

    const byRepeat = (series) => new Map(group.filter((item) => item.run.series === series).map((item) => [item.run.repeat, item.run]));
    const baseline = byRepeat('baseline');
    const taskard = byRepeat('taskard');
    const taskardRevisions = new Set(group
      .filter((item) => item.run.series === 'taskard')
      .map((item) => item.run.taskardRevision));
    const revisionMismatch = taskardRevisions.size > 1;
    const comparisons = Object.fromEntries(METRICS.map((metric) => {
      const reductions = [];
      for (const [repeat, baseRun] of baseline) {
        if (!taskard.has(repeat)) continue;
        const base = metricValue(baseRun, metric);
        const actual = metricValue(taskard.get(repeat), metric);
        if (base !== null && actual !== null && base > 0) reductions.push(((base - actual) / base) * 100);
      }
      const pairedSamples = reductions.length;
      const reportable = pairedSamples >= 3 && !revisionMismatch;
      return [metric, {
        pairedSamples,
        reportable,
        medianReductionPercent: reportable ? Math.round(median(reductions) * 100) / 100 : null,
        ...(!reportable ? { reason: revisionMismatch ? 'taskard_revision_mismatch' : 'insufficient_paired_repeats' } : {}),
      }];
    }));

    return {
      scenarioId: first.scenarioId,
      harnessId: first.harnessId,
      harnessVersion: first.harnessVersion,
      model: first.model,
      subjectRevision: first.subjectRevision,
      comparisonId: first.comparisonId,
      series: bySeries,
      comparisons,
    };
  });

  return {
    validRuns: valid.length,
    invalidRuns,
    groups: summaries,
  };
}

function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: node evals/score.js <run.json> [run.json ...]\n       node evals/score.js --scenario-hash <scenario-id>');
    process.exit(0);
  }
  if (args.length === 2 && args[0] === '--scenario-hash') {
    const scenario = scenarios[args[1]];
    if (!scenario) {
      console.error(`Unknown scenario id: ${args[1]}`);
      process.exit(2);
    }
    console.log(scenarioDigest(scenario));
    process.exit(0);
  }
  if (!args.length) {
    console.error('Usage: node evals/score.js <run.json> [run.json ...]\n       node evals/score.js --scenario-hash <scenario-id>');
    process.exit(2);
  }
  const summary = summarizeRuns(args.map(scoreRun));
  console.log(JSON.stringify(summary, null, 2));
  if (summary.invalidRuns.length) process.exitCode = 1;
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { scoreRun, summarizeRuns, scenarios, scenarioDigest };
