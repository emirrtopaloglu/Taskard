#!/usr/bin/env node

/**
 * Taskard Automated Validation Test Suite
 * Validates role contracts, templates, shell syntax, and CLI functionality.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;

function pass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function fail(msg) {
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`);
  failures++;
}

console.log('\n--- 🧪 Taskard Validation Suite ---\n');

// 1. Shell Syntax Check
try {
  execSync('bash -n install.sh', { cwd: ROOT, stdio: 'pipe' });
  pass('install.sh shell syntax is valid');
} catch (err) {
  fail(`install.sh shell syntax error: ${err.message}`);
}

// 2. Node CLI Syntax Check
try {
  execSync('node --check bin/taskard.js', { cwd: ROOT, stdio: 'pipe' });
  pass('bin/taskard.js JavaScript syntax is valid');
} catch (err) {
  fail(`bin/taskard.js syntax error: ${err.message}`);
}

// 3. CLI Functional Test (Dry-run & Commands)
try {
  const versionOut = execSync('node bin/taskard.js --version', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (versionOut.includes('taskard v')) {
    pass(`CLI version command verified (${versionOut.trim()})`);
  } else {
    fail(`CLI version command unexpected output: ${versionOut}`);
  }

  const dryRunOut = execSync('node bin/taskard.js init --dry-run', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (dryRunOut.includes('TASKARD READY')) {
    pass('CLI init --dry-run executed successfully');
  } else {
    fail(`CLI init --dry-run did not produce expected output`);
  }

  const rolesOut = execSync('node bin/taskard.js roles', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (rolesOut.includes('ROLE ROSTER')) {
    pass('CLI roles command executed successfully');
  } else {
    fail(`CLI roles command did not produce expected output`);
  }

  // CLI Doctor Command Test
  const doctorOut = execSync('node bin/taskard.js doctor', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (doctorOut.includes('TASKARD SYSTEM DOCTOR') && doctorOut.includes('Harness Detection') && doctorOut.includes('Checks passed')) {
    pass('CLI doctor command executed successfully with health diagnosis');
  } else {
    fail(`CLI doctor command unexpected output: ${doctorOut}`);
  }

  // CLI Doctor aliases (check, status, diag)
  const checkOut = execSync('node bin/taskard.js check', { cwd: ROOT, stdio: 'pipe' }).toString();
  const statusOut = execSync('node bin/taskard.js status', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (checkOut.includes('TASKARD SYSTEM DOCTOR') && statusOut.includes('TASKARD SYSTEM DOCTOR')) {
    pass('CLI doctor aliases (check, status) executed successfully');
  } else {
    fail('CLI doctor aliases did not produce expected output');
  }

  // CLI Config Command Test
  const configOut = execSync('node bin/taskard.js config', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (configOut.includes('TASKARD CONFIGURATION') && configOut.includes('Speed Gear') && configOut.includes('implementer') && configOut.includes('Effective Source')) {
    pass('CLI config command executed successfully with effective config inspection');
  } else {
    fail(`CLI config command unexpected output: ${configOut}`);
  }

  // CLI Config alias (cfg)
  const cfgOut = execSync('node bin/taskard.js cfg', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (cfgOut.includes('TASKARD CONFIGURATION') && cfgOut.includes('Speed Gear')) {
    pass('CLI config alias (cfg) executed successfully');
  } else {
    fail('CLI config alias did not produce expected output');
  }

  // CLI Lanes Command Test
  const lanesOut = execSync('node bin/taskard.js lanes', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (lanesOut.includes('TASKARD WORKSPACE LANES') && (lanesOut.includes('Total Lanes') || lanesOut.includes('No active'))) {
    pass('CLI lanes command executed successfully with status cards and summary');
  } else {
    fail(`CLI lanes command unexpected output: ${lanesOut}`);
  }

  // CLI Lane Aliases Test (lane, ls, list-lanes)
  const laneAliasOut = execSync('node bin/taskard.js lane', { cwd: ROOT, stdio: 'pipe' }).toString();
  const lsAliasOut = execSync('node bin/taskard.js ls', { cwd: ROOT, stdio: 'pipe' }).toString();
  const listLanesAliasOut = execSync('node bin/taskard.js list-lanes', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (laneAliasOut.includes('TASKARD WORKSPACE LANES') && lsAliasOut.includes('TASKARD WORKSPACE LANES') && listLanesAliasOut.includes('TASKARD WORKSPACE LANES')) {
    pass('CLI lane aliases (lane, ls, list-lanes) executed successfully');
  } else {
    fail('CLI lane aliases did not produce expected output');
  }

  // CLI Clean Command Dry-Run Test
  const cleanDryOut = execSync('node bin/taskard.js clean --dry-run', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (cleanDryOut.includes('TASKARD WORKSPACE CLEANUP') && cleanDryOut.includes('[DRY-RUN]')) {
    pass('CLI clean --dry-run executed successfully');
  } else {
    fail(`CLI clean --dry-run unexpected output: ${cleanDryOut}`);
  }

  // CLI Clean Aliases Test (clear, prune)
  const clearDryOut = execSync('node bin/taskard.js clear --dry-run', { cwd: ROOT, stdio: 'pipe' }).toString();
  const pruneDryOut = execSync('node bin/taskard.js prune --dry-run', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (clearDryOut.includes('TASKARD WORKSPACE CLEANUP') && pruneDryOut.includes('TASKARD WORKSPACE CLEANUP')) {
    pass('CLI clean aliases (clear, prune) executed successfully');
  } else {
    fail('CLI clean aliases did not produce expected output');
  }

  // CLI Clean --completed Dry-Run Test
  const cleanCompletedDryOut = execSync('node bin/taskard.js clean --dry-run --completed', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (cleanCompletedDryOut.includes('TASKARD WORKSPACE CLEANUP') && cleanCompletedDryOut.includes('completed lanes only')) {
    pass('CLI clean --dry-run --completed executed successfully');
  } else {
    fail(`CLI clean --dry-run --completed unexpected output: ${cleanCompletedDryOut}`);
  }

  // CLI Clean & Confirmation Functional Test in Isolated Temp Workspace
  const testWorkspace = path.join(os.tmpdir(), `taskard-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  try {
    const dummyLaneDir = path.join(testWorkspace, '.taskard', 'lanes', 'test-lane-01');
    const dummyTmpDir = path.join(testWorkspace, '.taskard', 'tmp');
    const dummyDiffsDir = path.join(testWorkspace, '.taskard', 'diffs');
    fs.mkdirSync(dummyLaneDir, { recursive: true });
    fs.mkdirSync(dummyTmpDir, { recursive: true });
    fs.mkdirSync(dummyDiffsDir, { recursive: true });

    fs.writeFileSync(path.join(dummyLaneDir, 'brief.md'), '# Brief: Test Lane\n## Objective\nDummy test lane for cleanup verification\n');
    fs.writeFileSync(path.join(dummyLaneDir, 'report.md'), 'STATUS: DONE\nDIFF_SUMMARY: test.js (+1, -0)\n');
    fs.writeFileSync(path.join(dummyTmpDir, 'cache.tmp'), 'dummy cache content');
    fs.writeFileSync(path.join(dummyDiffsDir, 'patch.diff'), 'diff --git a/test b/test');

    // Run clean without flags in non-interactive mode -> must abort safely with exit code 1
    try {
      execSync(`node "${path.join(ROOT, 'bin', 'taskard.js')}" clean`, { cwd: testWorkspace, stdio: 'pipe' });
      fail('CLI clean without confirmation flags in non-interactive mode should exit with code 1');
    } catch (cleanErr) {
      if (cleanErr.status === 1 || cleanErr.stderr.toString().includes('Confirmation required')) {
        pass('CLI clean safely refuses non-interactive execution without --yes / --force');
      } else {
        fail(`CLI clean unexpected error: ${cleanErr.message}`);
      }
    }

    // Run clean --yes
    const cleanYesOut = execSync(`node "${path.join(ROOT, 'bin', 'taskard.js')}" clean --yes`, { cwd: testWorkspace, stdio: 'pipe' }).toString();
    if (cleanYesOut.includes('TASKARD WORKSPACE CLEANUP') && cleanYesOut.includes('Cleanup complete') && cleanYesOut.includes('freed')) {
      pass('CLI clean --yes successfully deleted target items');
    } else {
      fail(`CLI clean --yes unexpected output: ${cleanYesOut}`);
    }

    // Verify lanes and tmp items were deleted
    const remainingLanes = fs.readdirSync(path.join(testWorkspace, '.taskard', 'lanes'));
    if (remainingLanes.length === 0) {
      pass('CLI clean --yes verified: target lane directory was cleanly deleted');
    } else {
      fail(`CLI clean --yes left files: ${remainingLanes.join(', ')}`);
    }

    // Run clean again on already clean workspace
    const cleanAgainOut = execSync(`node "${path.join(ROOT, 'bin', 'taskard.js')}" clean --yes`, { cwd: testWorkspace, stdio: 'pipe' }).toString();
    if (cleanAgainOut.includes('Workspace is clean') || cleanAgainOut.includes('0 items')) {
      pass('CLI clean on clean workspace reports workspace is clean');
    } else {
      fail(`CLI clean on clean workspace unexpected output: ${cleanAgainOut}`);
    }
  } finally {
    try {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    } catch (_) {}
  }

  // CLI Help Documentation Check
  const helpOut = execSync('node bin/taskard.js --help', { cwd: ROOT, stdio: 'pipe' }).toString();
  if (helpOut.includes('clean') && helpOut.includes('lanes') && helpOut.includes('--completed') && helpOut.includes('--yes')) {
    pass('CLI help output documents new commands (clean, lanes, --completed, --yes)');
  } else {
    fail(`CLI help output missing new command documentation: ${helpOut}`);
  }
} catch (err) {
  fail(`CLI command execution failed: ${err.message}`);
}

// 4. Agent Role Frontmatter Validator
const AGENTS_DIR = path.join(ROOT, 'agents');
if (!fs.existsSync(AGENTS_DIR)) {
  fail('agents/ directory not found');
} else {
  const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  const requiredAgents = ['implementer.md', 'reviewer.md', 'planner.md', 'debugger.md', 'ui-developer.md', 'explorer.md', 'qa-tester.md'];
  
  for (const req of requiredAgents) {
    if (!agentFiles.includes(req)) {
      fail(`Required agent role missing: ${req}`);
    }
  }

  for (const file of agentFiles) {
    const filePath = path.join(AGENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    if (!content.startsWith('---')) {
      fail(`Agent ${file} is missing YAML frontmatter opening ---`);
      continue;
    }

    const endOfFrontmatter = content.indexOf('\n---', 3);
    if (endOfFrontmatter === -1) {
      fail(`Agent ${file} is missing YAML frontmatter closing ---`);
      continue;
    }

    const frontmatter = content.substring(3, endOfFrontmatter);
    const hasName = /^name:\s*([a-zA-Z0-9_-]+)/m.test(frontmatter);
    const hasModel = /^model:\s*([a-zA-Z0-9_-]+)/m.test(frontmatter);
    const hasDesc = /^description:\s*.+/m.test(frontmatter);
    const hasColor = /^color:\s*.+/m.test(frontmatter);

    if (!hasName) fail(`Agent ${file} missing 'name:' in frontmatter (Taskard Iron Law)`);
    if (!hasModel) fail(`Agent ${file} missing 'model:' in frontmatter`);
    if (!hasDesc) fail(`Agent ${file} missing 'description:' in frontmatter`);
    if (!hasColor) fail(`Agent ${file} missing 'color:' in frontmatter`);

    if (hasName && hasModel && hasDesc && hasColor) {
      pass(`Agent role ${file} frontmatter contract validated`);
    }
  }
}

// 5. Templates Integrity Check
const configTpl = path.join(ROOT, 'templates', 'config.toml');
const directiveTpl = path.join(ROOT, 'templates', 'directive-block.md');

if (!fs.existsSync(configTpl)) {
  fail('templates/config.toml is missing');
} else {
  const cfg = fs.readFileSync(configTpl, 'utf8');
  if (cfg.includes('[defaults]') && cfg.includes('[roles]')) {
    pass('templates/config.toml schema verified');
  } else {
    fail('templates/config.toml missing required sections');
  }
}

if (!fs.existsSync(directiveTpl)) {
  fail('templates/directive-block.md is missing');
} else {
  const dir = fs.readFileSync(directiveTpl, 'utf8');
  if (dir.includes('<!-- taskard:start -->') && dir.includes('<!-- taskard:end -->')) {
    pass('templates/directive-block.md markers verified');
  } else {
    fail('templates/directive-block.md missing taskard start/end markers');
  }
}

// 6. Evals Integrity Check
const EVALS_DIR = path.join(ROOT, 'evals');
if (!fs.existsSync(EVALS_DIR)) {
  fail('evals/ directory is missing');
} else {
  const evalFiles = fs.readdirSync(EVALS_DIR).filter(f => f.endsWith('.md'));
  if (evalFiles.length >= 5) {
    pass(`Found ${evalFiles.length} eval scenario definitions in evals/`);
  } else {
    fail(`Expected at least 5 eval files in evals/, found ${evalFiles.length}`);
  }
}

console.log('\n-----------------------------------');
if (failures === 0) {
  console.log('\x1b[32m✨ All validation tests passed successfully!\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m💥 Validation failed with ${failures} error(s).\x1b[0m\n`);
  process.exit(1);
}
