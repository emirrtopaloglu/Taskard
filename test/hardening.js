#!/usr/bin/env node

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'taskard.js');
let failures = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function workspace(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskard-hardening-'));
  const home = path.join(dir, 'home');
  fs.mkdirSync(home);
  try {
    fn(dir, home);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function runCli(cwd, home, ...args) {
  const isolatedEnv = { ...process.env };
  for (const key of ['CODEX_HOME', 'OPENCODE_CONFIG_DIR', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME']) delete isolatedEnv[key];
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...isolatedEnv,
      HOME: home,
      CODEX_HOME: path.join(home, '.codex'),
      XDG_CONFIG_HOME: path.join(home, '.config'),
      XDG_CACHE_HOME: path.join(home, '.cache'),
      XDG_DATA_HOME: path.join(home, '.local', 'share'),
    },
  });
}

function laneDir(root, id) {
  return path.join(root, '.taskard', 'lanes', id);
}

function writeLane(root, id, { brief = '', report = '', review = '', qa = '' } = {}) {
  const dir = laneDir(root, id);
  fs.mkdirSync(dir, { recursive: true });
  if (brief) fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  if (report) fs.writeFileSync(path.join(dir, 'report.md'), report);
  if (review) fs.writeFileSync(path.join(dir, 'review.md'), review);
  if (qa) fs.writeFileSync(path.join(dir, 'verification.md'), qa);
  return dir;
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function initRepo(dir) {
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'sample.js'), 'module.exports = 1;\n');
  git(dir, 'init', '--quiet');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'test');
  git(dir, 'add', 'src/sample.js');
  git(dir, 'commit', '--quiet', '-m', 'fixture');
  return git(dir, 'rev-parse', 'HEAD');
}

function validBrief(id, commit, blockedBy = 'NONE', extra = '') {
  return `# Brief: ${id}\n\n## Lane Metadata\nROLE: implementer\nGEAR: MAX\nATTEMPT_BUDGET: 2\nBASE_COMMIT: ${commit}\nSOURCE_COMMIT: ${commit}\nBLOCKED_BY: ${blockedBy}\nREQUIRES_REVIEW: NO\nREQUIRES_QA: NO\n\n## Objective\nMake the fixture pass.\n\n## Context Files\n- src/sample.js#L1-L1 (symbol: module.exports)\n\n## Acceptance Criteria\n- The sample exports one value.\n\n## Non-Goals\n- None.\n${extra}`;
}

function validReport(dir, commit, { attempts = 1, overrides = {} } = {}) {
  const evidencePath = path.join(dir, 'evidence.log');
  fs.writeFileSync(evidencePath, 'fixture command passed\n');
  const digest = crypto.createHash('sha256').update(fs.readFileSync(evidencePath)).digest('hex');
  const fields = {
    STATUS: 'DONE',
    DIFF_SUMMARY: 'src/sample.js (+1, -0)',
    BASE_COMMIT: commit,
    HEAD_COMMIT: commit,
    ATTEMPTS: String(attempts),
    EVIDENCE_COMMAND: 'node check.js',
    EVIDENCE_EXIT_STATUS: '0',
    EVIDENCE_FILE: 'evidence.log',
    EVIDENCE_SHA256: digest,
    HASH: commit,
    ...overrides,
  };
  return Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n') + '\n';
}

function makeVerifiedLane(root, id, commit, options = {}) {
  const dir = writeLane(root, id, { brief: validBrief(id, commit, options.blockedBy || 'NONE') });
  const report = validReport(dir, commit, options);
  fs.writeFileSync(path.join(dir, 'report.md'), report);
  if (options.review) fs.writeFileSync(path.join(dir, 'review.md'), options.review);
  if (options.qa) fs.writeFileSync(path.join(dir, 'verification.md'), options.qa);
  if (options.requiresReview) {
    const brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8').replace('REQUIRES_REVIEW: NO', 'REQUIRES_REVIEW: YES');
    fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  }
  if (options.requiresQa) {
    const brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8').replace('REQUIRES_QA: NO', 'REQUIRES_QA: YES');
    fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  }
  return dir;
}

test('clean and lanes reject DONE+FAIL', () => workspace((dir, home) => {
  writeLane(dir, 'done-failed-review', {
    brief: '# Brief: Mixed result\n',
    report: 'STATUS: DONE\n',
    review: 'Finding: regression\n\nVERDICT: FAIL\n',
  });
  const clean = runCli(dir, home, 'clean', '--yes');
  assert.equal(clean.status, 0, clean.stderr);
  assert.ok(fs.existsSync(laneDir(dir, 'done-failed-review')));
  const lanes = runCli(dir, home, 'lanes');
  assert.match(lanes.stdout, /\[BLOCKED\]/);
}));

test('historical DONE text does not override BLOCKED', () => workspace((dir, home) => {
  writeLane(dir, 'blocked-history', {
    report: 'STATUS: BLOCKED\nHISTORY: STATUS: DONE\n',
  });
  const clean = runCli(dir, home, 'clean', '--yes');
  assert.equal(clean.status, 0, clean.stderr);
  assert.ok(fs.existsSync(laneDir(dir, 'blocked-history')));
  const lanes = runCli(dir, home, 'lanes');
  assert.match(lanes.stdout, /\[BLOCKED\]/);
}));

test('review-only FAIL remains protected', () => workspace((dir, home) => {
  writeLane(dir, 'review-only', { review: 'Earlier verdict: PASS\n\nVERDICT: FAIL\n' });
  const clean = runCli(dir, home, 'clean', '--yes');
  assert.equal(clean.status, 0, clean.stderr);
  assert.ok(fs.existsSync(laneDir(dir, 'review-only')));
}));

test('conflicting active reviews stay unknown and survive cleanup and purge', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'ambiguous-review', commit, { review: 'VERDICT: PASS\n' });
  fs.writeFileSync(path.join(lane, 'review-round2.md'), 'VERDICT: FAIL\n');
  const archivedLane = path.join(dir, '.taskard', 'archive', 'lanes', 'ambiguous-review');
  fs.mkdirSync(archivedLane, { recursive: true });
  fs.writeFileSync(path.join(archivedLane, 'report.md'), 'STATUS: DONE\n');
  fs.writeFileSync(path.join(archivedLane, 'review.md'), 'VERDICT: PASS\n');
  fs.writeFileSync(path.join(archivedLane, 'review-round2.md'), 'VERDICT: FAIL\n');

  const lanes = runCli(dir, home, 'lanes');
  assert.match(lanes.stdout, /ambiguous-review.*\[UNKNOWN\]/s);
  const verify = runCli(dir, home, 'verify');
  assert.notEqual(verify.status, 0, verify.stdout + verify.stderr);
  assert.match(verify.stdout + verify.stderr, /review verdict is missing or invalid/i);

  const dryRun = runCli(dir, home, 'clean', '--dry-run');
  assert.equal(dryRun.status, 0, dryRun.stderr);
  assert.match(dryRun.stdout, /0 items/);
  assert.ok(fs.existsSync(lane), 'dry-run must leave the ambiguous lane in place');

  const archive = runCli(dir, home, 'clean', '--yes');
  assert.equal(archive.status, 0, archive.stderr);
  assert.ok(fs.existsSync(lane), 'completed cleanup must preserve ambiguous review state');
  assert.ok(fs.existsSync(archivedLane), 'completed cleanup must preserve ambiguous archived evidence');

  const purgeDryRun = runCli(dir, home, 'clean', '--purge', '--dry-run');
  assert.equal(purgeDryRun.status, 0, purgeDryRun.stderr);
  assert.match(purgeDryRun.stdout, /0 items/);

  const purge = runCli(dir, home, 'clean', '--purge', '--yes');
  assert.equal(purge.status, 0, purge.stderr);
  assert.ok(fs.existsSync(lane), 'explicit archive purge must not remove an ambiguous live lane');
  assert.ok(fs.existsSync(archivedLane), 'explicit archive purge must preserve ambiguous archived evidence');
}));

test('completed cleanup preserves unrelated tmp and diffs while archiving the lane', () => workspace((dir, home) => {
  const lane = writeLane(dir, 'completed', { report: 'STATUS: DONE\n' });
  const tmp = path.join(dir, '.taskard', 'tmp', 'active.tmp');
  const diff = path.join(dir, '.taskard', 'diffs', 'working.diff');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.mkdirSync(path.dirname(diff), { recursive: true });
  fs.writeFileSync(tmp, 'active temporary evidence');
  fs.writeFileSync(diff, 'unrelated diff');
  const clean = runCli(dir, home, 'clean', '--yes');
  assert.equal(clean.status, 0, clean.stderr);
  assert.ok(!fs.existsSync(lane));
  assert.ok(fs.existsSync(path.join(dir, '.taskard', 'archive', 'lanes', 'completed', 'report.md')));
  assert.ok(fs.existsSync(tmp));
  assert.ok(fs.existsSync(diff));
  assert.match(clean.stdout, /0 B logical file bytes freed/);
}));

test('--purge explicitly removes an archived completed lane', () => workspace((dir, home) => {
  writeLane(dir, 'purge-me', { report: 'STATUS: DONE\n' });
  const archivePath = path.join(dir, '.taskard', 'archive', 'lanes', 'purge-me');
  const archive = runCli(dir, home, 'clean', '--yes');
  assert.equal(archive.status, 0, archive.stderr);
  assert.ok(fs.existsSync(archivePath));
  const purge = runCli(dir, home, 'clean', '--purge', '--yes');
  assert.equal(purge.status, 0, purge.stderr);
  assert.ok(!fs.existsSync(archivePath));
}));

test('--all requires explicit confirmation in non-interactive mode', () => workspace((dir, home) => {
  const file = path.join(dir, '.taskard', 'tmp', 'keep.tmp');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, 'keep');
  const clean = runCli(dir, home, 'clean', '--all');
  assert.notEqual(clean.status, 0);
  assert.ok(fs.existsSync(file));
}));

test('--all refuses to traverse a symlinked lane scope', () => workspace((dir, home) => {
  const outside = path.join(dir, 'outside');
  fs.mkdirSync(path.join(outside, 'completed'), { recursive: true });
  fs.writeFileSync(path.join(outside, 'completed', 'report.md'), 'STATUS: DONE\n');
  fs.mkdirSync(path.join(dir, '.taskard'), { recursive: true });
  fs.symlinkSync(outside, path.join(dir, '.taskard', 'lanes'));
  const clean = runCli(dir, home, 'clean', '--all', '--yes');
  assert.notEqual(clean.status, 0);
  assert.ok(fs.existsSync(path.join(outside, 'completed', 'report.md')));
}));

test('--all reports only successful logical bytes when removal fails', () => {
  if (typeof process.getuid === 'function' && process.getuid() === 0) {
    console.log('SKIP removal-permission fixture requires a non-root test process');
    return;
  }
  workspace((dir, home) => {
    const tmp = path.join(dir, '.taskard', 'tmp');
    const locked = path.join(tmp, 'locked');
    fs.mkdirSync(locked, { recursive: true });
    fs.writeFileSync(path.join(locked, 'keep.txt'), '1234567');
    fs.writeFileSync(path.join(tmp, 'remove.txt'), '12345');
    fs.chmodSync(locked, 0o555);
    try {
      const clean = runCli(dir, home, 'clean', '--all', '--yes');
      assert.notEqual(clean.status, 0);
      assert.ok(fs.existsSync(path.join(locked, 'keep.txt')));
      assert.ok(!fs.existsSync(path.join(tmp, 'remove.txt')));
      assert.match(clean.stdout + clean.stderr, /5 B logical file bytes freed/);
    } finally {
      fs.chmodSync(locked, 0o755);
    }
  });
});

test('unknown lane status remains visible and is not cleaned', () => workspace((dir, home) => {
  writeLane(dir, 'unknown-status', { report: 'STATUS: DONEISH\n' });
  const clean = runCli(dir, home, 'clean', '--yes');
  assert.equal(clean.status, 0, clean.stderr);
  assert.ok(fs.existsSync(laneDir(dir, 'unknown-status')));
  const lanes = runCli(dir, home, 'lanes');
  assert.match(lanes.stdout, /\[UNKNOWN\]/);
}));

test('verify accepts current evidence and required review/QA records', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  makeVerifiedLane(dir, 'valid', commit, {
    requiresReview: true,
    requiresQa: true,
    review: 'VERDICT: PASS_WITH_NOTES\n',
    qa: 'STATUS: VERIFIED\n',
  });
  const result = runCli(dir, home, 'verify');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /valid.*PASS|PASS.*valid/s);
}));

test('verify rejects malformed report field order', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'malformed', commit);
  const reportPath = path.join(lane, 'report.md');
  const report = fs.readFileSync(reportPath, 'utf8').replace('STATUS: DONE\nDIFF_SUMMARY:', 'DIFF_SUMMARY: moved\nSTATUS: DONE\nDIFF_SUMMARY:');
  fs.writeFileSync(reportPath, report);
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /report|field|order/i);
}));

test('verify rejects an evidence file whose digest changed', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'bad-digest', commit);
  fs.writeFileSync(path.join(lane, 'evidence.log'), 'changed after report\n');
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /SHA256|digest/i);
}));

test('verify rejects stale HEAD evidence', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  makeVerifiedLane(dir, 'stale', commit);
  fs.writeFileSync(path.join(dir, 'src', 'sample.js'), 'module.exports = 2;\n');
  git(dir, 'add', 'src/sample.js');
  git(dir, 'commit', '--quiet', '-m', 'new head');
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /stale|HEAD|commit/i);
}));

test('verify rejects pointer context changed between SOURCE_COMMIT and BASE_COMMIT', () => workspace((dir, home) => {
  const source = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'stale-context', source);
  fs.writeFileSync(path.join(dir, 'src', 'sample.js'), 'module.exports = 4;\n');
  git(dir, 'add', 'src/sample.js');
  git(dir, 'commit', '--quiet', '-m', 'change pointed context');
  const base = git(dir, 'rev-parse', 'HEAD');
  const briefPath = path.join(lane, 'brief.md');
  fs.writeFileSync(briefPath, fs.readFileSync(briefPath, 'utf8').replace(`BASE_COMMIT: ${source}`, `BASE_COMMIT: ${base}`));
  fs.writeFileSync(path.join(lane, 'report.md'), validReport(lane, base));
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /stale context/i);
}));

test('verify rejects tracked symlink pointers that escape the repository', () => workspace((dir, home) => {
  initRepo(dir);
  const outside = path.join(dir, 'outside.js');
  fs.writeFileSync(outside, 'module.exports = "outside";\n');
  fs.symlinkSync(outside, path.join(dir, 'src', 'link.js'));
  git(dir, 'add', 'src/link.js');
  git(dir, 'commit', '--quiet', '-m', 'add external symlink');
  const commit = git(dir, 'rev-parse', 'HEAD');
  const lane = makeVerifiedLane(dir, 'symlink-pointer', commit);
  const briefPath = path.join(lane, 'brief.md');
  fs.writeFileSync(briefPath, fs.readFileSync(briefPath, 'utf8').replace('src/sample.js#L1-L1', 'src/link.js#L1-L1'));
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /symlink/i);
}));

test('verify rejects pointers beneath tracked symlink path components', () => workspace((dir, home) => {
  initRepo(dir);
  const outside = path.join(dir, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'nested.js'), 'module.exports = "outside";\n');
  fs.symlinkSync(outside, path.join(dir, 'src', 'bridge'));
  git(dir, 'add', 'src/bridge');
  git(dir, 'commit', '--quiet', '-m', 'add external directory symlink');
  const commit = git(dir, 'rev-parse', 'HEAD');
  const lane = makeVerifiedLane(dir, 'symlink-component', commit);
  const briefPath = path.join(lane, 'brief.md');
  fs.writeFileSync(briefPath, fs.readFileSync(briefPath, 'utf8').replace('src/sample.js#L1-L1', 'src/bridge/nested.js#L1-L1'));
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /Git symlink at SOURCE_COMMIT/i);
}));

test('verify permits pointed-file edits committed after BASE_COMMIT', () => workspace((dir, home) => {
  const base = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'base-to-head-edit', base);
  fs.writeFileSync(path.join(dir, 'src', 'sample.js'), 'module.exports = 5;\n');
  git(dir, 'add', 'src/sample.js');
  git(dir, 'commit', '--quiet', '-m', 'edit after lane base');
  const head = git(dir, 'rev-parse', 'HEAD');
  fs.writeFileSync(path.join(lane, 'report.md'), validReport(lane, base, {
    overrides: { HEAD_COMMIT: head, HASH: head },
  }));
  const result = runCli(dir, home, 'verify');
  assert.equal(result.status, 0, result.stderr + result.stdout);
}));

test('verify rejects dependency cycles', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  makeVerifiedLane(dir, 'alpha', commit, { blockedBy: 'beta' });
  makeVerifiedLane(dir, 'beta', commit, { blockedBy: 'alpha' });
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /cycle/i);
}));

test('verify rejects missing BLOCKED_BY references', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  makeVerifiedLane(dir, 'dependent', commit, { blockedBy: 'missing-lane' });
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /missing lane/i);
}));

test('verify rejects pointers outside the repository and over-budget attempts', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  const lane = makeVerifiedLane(dir, 'bad-brief', commit, { attempts: 3 });
  const briefPath = path.join(lane, 'brief.md');
  fs.writeFileSync(briefPath, fs.readFileSync(briefPath, 'utf8').replace('src/sample.js#L1-L1', '../outside.js#L1-L1'));
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /pointer|attempt/i);
}));

test('verify rejects uncommitted edits to pointed files', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  makeVerifiedLane(dir, 'dirty-pointer', commit);
  fs.writeFileSync(path.join(dir, 'src', 'sample.js'), 'module.exports = 3;\n');
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /uncommitted changes/i);
}));

test('verify refuses a symlinked .taskard root', () => workspace((dir, home) => {
  const commit = initRepo(dir);
  const outside = path.join(dir, 'outside-taskard');
  fs.mkdirSync(path.join(outside, 'lanes'), { recursive: true });
  writeLane(outside, 'outside-lane', { brief: validBrief('outside-lane', commit) });
  fs.symlinkSync(outside, path.join(dir, '.taskard'));
  const result = runCli(dir, home, 'verify');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /symlinked/i);
}));

if (failures) {
  console.error(`${failures} hardening regression(s) failed`);
  process.exitCode = 1;
} else {
  console.log('All Task 2 hardening regressions passed');
}
