#!/usr/bin/env node

/**
 * Taskard Automated Validation Test Suite
 * Validates role contracts, templates, shell syntax, and CLI functionality.
 */

const fs = require('node:fs');
const path = require('node:path');
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
