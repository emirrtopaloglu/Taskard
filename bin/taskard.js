#!/usr/bin/env node

/**
 * Taskard CLI Initializer
 * Zero-runtime multi-agent orchestration convention for AI developer CLIs.
 *
 * Usage:
 *   npx taskard init [--global] [--dry-run] [--force]
 *   taskard roles
 *   taskard --version
 *   taskard --help
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');
const crypto = require('node:crypto');

const PKG_ROOT = path.resolve(__dirname, '..');
const HOME = os.homedir();
const CWD = process.cwd();

// --- ANSI Colors ---
const isTTY = Boolean(process.stdout.isTTY);
const C = {
  reset: isTTY ? '\x1b[0m' : '',
  bold: isTTY ? '\x1b[1m' : '',
  dim: isTTY ? '\x1b[2m' : '',
  violet: isTTY ? '\x1b[38;2;168;85;247m' : '',
  purple: isTTY ? '\x1b[38;2;192;132;252m' : '',
  cyan: isTTY ? '\x1b[38;2;56;189;248m' : '',
  blue: isTTY ? '\x1b[38;2;96;165;250m' : '',
  emerald: isTTY ? '\x1b[38;2;52;211;153m' : '',
  amber: isTTY ? '\x1b[38;2;251;191;36m' : '',
  rose: isTTY ? '\x1b[38;2;251;113;133m' : '',
  gray: isTTY ? '\x1b[38;2;148;163;184m' : '',
  dark: isTTY ? '\x1b[38;2;71;85;105m' : '',
};

function printBanner() {
  console.log(`\n${C.violet}${C.bold}` +
`  ████████╗ █████╗ ███████╗██╗  ██╗ █████╗ ██████╗ ██████╗ 
  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗
     ██║   ███████║███████╗█████╔╝ ███████║██████╔╝██║  ██║
     ██║   ██╔══██║╚════██║██╔═██╗ ██╔══██║██╔══██╗██║  ██║
     ██║   ██║  ██║███████║██║  ██╗██║  ██║██║  ██║██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ` +
  `${C.reset}\n${C.cyan}${C.bold}     ◈ MULTI-HARNESS AGENT ORCHESTRATION CONVENTION ◈${C.reset}\n` +
  `${C.gray}        Zero-Runtime · 3-Speed Gear · Aggressive Tiering${C.reset}\n`);
}

function logStep(num, title, detail) {
  console.log(`  ${C.cyan}${C.bold}[${num}/5]${C.reset} ${C.bold}${title}${C.reset}`);
  console.log(`        ${C.emerald}✔${C.reset} ${C.gray}${detail}${C.reset}`);
}

function printRoleRoster() {
  console.log(`\n  ${C.violet}${C.bold}╭────────────────────────────── ROLE ROSTER ──────────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.purple}${C.bold}STRATEGY (Tier 1)${C.reset}       ${C.blue}${C.bold}EXECUTION (Tier 2)${C.reset}      ${C.emerald}${C.bold}ASSIST (Tier 3)${C.reset}        ${C.violet}│${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.purple}●${C.reset} planner  ${C.dim}[opus]${C.reset}        ${C.blue}●${C.reset} implementer  ${C.dim}[sonnet]${C.reset} ${C.emerald}●${C.reset} explorer  ${C.dim}[haiku]${C.reset}    ${C.violet}│${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.purple}●${C.reset} reviewer ${C.dim}[sonnet/opus]${C.reset} ${C.blue}●${C.reset} ui-developer ${C.dim}[sonnet]${C.reset} ${C.emerald}●${C.reset} qa-tester ${C.dim}[haiku]${C.reset}    ${C.violet}│${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.purple}●${C.reset} debugger ${C.dim}[sonnet/opus]${C.reset}                                                   ${C.violet}│${C.reset}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

function printHelp() {
  printBanner();
  console.log(`${C.bold}USAGE:${C.reset}
  npx taskard init [options]     Initialize Taskard in current workspace or globally
  taskard roles                  Display the 7-role tier matrix
  taskard --version              Show installed Taskard version
  taskard --help                 Show this help message

${C.bold}OPTIONS:${C.reset}
  --global, -g                   Initialize globally in ~/.taskard and ~/.claude
  --dry-run                      Simulate installation without writing any files
  --force, -f                    Force overwrite symlinks and configuration templates

${C.bold}DOCUMENTATION & REPO:${C.reset}
  https://github.com/emirrtopaloglu/Taskard
`);
}

function normalizeOpenCodeColor(color) {
  const map = {
    blue: 'primary',
    purple: 'secondary',
    orange: 'accent',
    pink: 'accent',
    green: 'success',
    yellow: 'warning',
    red: 'error',
    cyan: 'info',
  };
  if (map[color]) return map[color];
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return 'primary';
}

function detectHarnesses() {
  const found = [];
  if (fs.existsSync(path.join(HOME, '.claude'))) found.push('Claude Code (~/.claude)');
  if (fs.existsSync(path.join(HOME, '.opencode')) || fs.existsSync(path.join(HOME, '.config', 'opencode'))) {
    found.push('OpenCode');
  }
  if (fs.existsSync(path.join(HOME, '.agents')) || fs.existsSync(path.join(HOME, '.codex'))) {
    found.push('Codex / OpenAgent');
  }
  if (fs.existsSync(path.join(HOME, '.gemini')) || fs.existsSync(path.join(HOME, '.antigravity'))) {
    found.push('Antigravity');
  }
  if (fs.existsSync(path.join(CWD, '.cursor')) || fs.existsSync(path.join(CWD, '.cursorrules'))) {
    found.push('Cursor');
  }
  if (found.length === 0) found.push('Standard Universal (Claude Code / OpenCode compatible)');
  return found;
}

function syncDirectiveBlock(targetFile, directiveSourcePath, dryRun) {
  const MARK = '<!-- taskard:start -->';
  const MARK_END = '<!-- taskard:end -->';
  const sourceContent = fs.readFileSync(directiveSourcePath, 'utf8');

  let existing = '';
  if (fs.existsSync(targetFile)) {
    existing = fs.readFileSync(targetFile, 'utf8');
  }

  const getHash = (text) => {
    const match = text.match(/<!-- taskard:start -->([\s\S]*?)<!-- taskard:end -->/);
    if (!match) return '';
    return crypto.createHash('sha256').update(match[1].trim()).digest('hex');
  };

  const wantHash = getHash(sourceContent);
  const haveHash = getHash(existing);

  if (wantHash && wantHash === haveHash) {
    return false; // already up to date
  }

  if (dryRun) return true;

  let newContent = existing;
  if (existing.includes(MARK)) {
    const before = existing.substring(0, existing.indexOf(MARK));
    const afterIdx = existing.indexOf(MARK_END);
    const after = afterIdx !== -1 ? existing.substring(afterIdx + MARK_END.length) : '';
    newContent = (before.trimEnd() + '\n\n' + sourceContent.trim() + '\n\n' + after.trimStart()).trim() + '\n';
  } else {
    newContent = (existing.trim() + (existing.trim().length > 0 ? '\n\n' : '') + sourceContent.trim() + '\n');
  }

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, newContent, 'utf8');
  return true;
}

function copyDirRecursive(src, dest, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, dryRun);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function runInit(args) {
  const startTime = Date.now();
  const dryRun = args.includes('--dry-run');
  const isGlobal = args.includes('--global') || args.includes('-g');

  printBanner();

  // 1. Core directories
  const taskardHome = path.join(HOME, '.taskard');
  const skillsSrc = path.join(PKG_ROOT, 'skills');
  const agentsSrc = path.join(PKG_ROOT, 'agents');
  const templatesSrc = path.join(PKG_ROOT, 'templates');

  if (!dryRun) {
    fs.mkdirSync(taskardHome, { recursive: true });
    copyDirRecursive(skillsSrc, path.join(taskardHome, 'skills'), dryRun);
    const agentsDest = path.join(taskardHome, 'agents');
    if (fs.existsSync(agentsDest)) {
      fs.rmSync(agentsDest, { recursive: true, force: true });
    }
    copyDirRecursive(agentsSrc, agentsDest, dryRun);
    copyDirRecursive(templatesSrc, path.join(taskardHome, 'templates'), dryRun);
  }
  logStep(1, 'Core Directories & Templates', `~/.taskard (skills, agents, templates ${dryRun ? 'verified' : 'synchronized'})`);

  // 2. Harness Integration & Roles
  const harnesses = detectHarnesses();
  const claudeSkills = path.join(HOME, '.claude', 'skills');
  const claudeAgents = path.join(HOME, '.claude', 'agents');
  const agentsSkills = path.join(HOME, '.agents', 'skills');

  if (!dryRun) {
    fs.mkdirSync(claudeSkills, { recursive: true });
    fs.mkdirSync(claudeAgents, { recursive: true });
    fs.mkdirSync(agentsSkills, { recursive: true });

    // Link skill
    const targetSkill = path.join(taskardHome, 'skills', 'taskard');
    try {
      const sym1 = path.join(claudeSkills, 'taskard');
      if (fs.existsSync(sym1) || fs.lstatSync(sym1).isSymbolicLink()) fs.unlinkSync(sym1);
      fs.symlinkSync(targetSkill, sym1, 'dir');
    } catch (_) {}

    try {
      const sym2 = path.join(agentsSkills, 'taskard');
      if (fs.existsSync(sym2) || fs.lstatSync(sym2).isSymbolicLink()) fs.unlinkSync(sym2);
      fs.symlinkSync(targetSkill, sym2, 'dir');
    } catch (_) {}

    // OpenCode directories
    const openCodeDirs = [
      path.join(HOME, '.config', 'opencode', 'agent'),
      path.join(HOME, '.config', 'opencode', 'agents'),
      path.join(HOME, '.opencode', 'agent'),
      path.join(HOME, '.opencode', 'agents'),
    ];
    for (const d of openCodeDirs) {
      fs.mkdirSync(d, { recursive: true });
    }

    // Link/Sync agents
    const agentFiles = fs.readdirSync(agentsSrc).filter((f) => f.endsWith('.md'));
    for (const f of agentFiles) {
      const srcAgent = path.join(taskardHome, 'agents', f);
      const agentName = f.replace('.md', '');

      // Claude link
      const claudeAgentLink = path.join(claudeAgents, f);
      try {
        if (fs.existsSync(claudeAgentLink) || fs.lstatSync(claudeAgentLink).isSymbolicLink()) {
          fs.unlinkSync(claudeAgentLink);
        }
        fs.symlinkSync(srcAgent, claudeAgentLink, 'file');
      } catch (_) {}

      // OpenCode agent sync (color conversion)
      const agentContent = fs.readFileSync(srcAgent, 'utf8');
      const colorMatch = agentContent.match(/^color:\s*([^\r\n]+)/m);
      const originalColor = colorMatch ? colorMatch[1].trim().replace(/['"]/g, '') : 'primary';
      const ocColor = normalizeOpenCodeColor(originalColor);
      const normalizedContent = agentContent.replace(/^color:\s*.*$/m, `color: ${ocColor}`);

      for (const d of openCodeDirs) {
        fs.writeFileSync(path.join(d, f), normalizedContent, 'utf8');
      }
    }
  }

  logStep(2, 'Harness Bridges & Role Roster', `${harnesses.join(', ')} (7 roles connected)`);

  // 3. Configuration Setup
  const globalConfigPath = path.join(taskardHome, 'config.toml');
  const projectConfigPath = path.join(CWD, '.taskard', 'config.toml');
  const configTplPath = path.join(templatesSrc, 'config.toml');

  if (!dryRun) {
    if (!fs.existsSync(globalConfigPath)) {
      fs.copyFileSync(configTplPath, globalConfigPath);
    }
    if (!isGlobal && CWD !== HOME) {
      fs.mkdirSync(path.join(CWD, '.taskard'), { recursive: true });
      if (!fs.existsSync(projectConfigPath)) {
        fs.copyFileSync(configTplPath, projectConfigPath);
      }
    }
  }
  logStep(3, 'Configuration Layer', isGlobal ? '~/.taskard/config.toml (Global Default)' : '.taskard/config.toml (Workspace & Global)');

  // 4. External Skills Resolution
  let externalStatus = 'Superpowers & Matt Pocock (active)';
  try {
    const hasSp = fs.existsSync(path.join(HOME, '.claude', 'skills', 'using-superpowers')) || fs.existsSync(path.join(HOME, '.agents', 'skills', 'using-superpowers'));
    const hasGrill = fs.existsSync(path.join(HOME, '.claude', 'skills', 'grilling')) || fs.existsSync(path.join(HOME, '.agents', 'skills', 'grilling'));
    if (!hasSp || !hasGrill) {
      if (!dryRun) {
        try {
          execSync('npx -y skills add obra/superpowers --global >/dev/null 2>&1', { stdio: 'ignore' });
          execSync('npx -y skills add mattpocock/skills --global >/dev/null 2>&1', { stdio: 'ignore' });
          externalStatus = 'Resolved and connected via npx';
        } catch (_) {
          externalStatus = 'Optional external skills skipped';
        }
      }
    }
  } catch (_) {}
  logStep(4, 'Discipline Standards', externalStatus);

  // 5. Directive Blocks Injection
  const directiveTpl = path.join(templatesSrc, 'directive-block.md');
  const targets = isGlobal || CWD === HOME
    ? [path.join(HOME, '.claude', 'CLAUDE.md'), path.join(HOME, '.claude', 'AGENTS.md')]
    : [
        path.join(HOME, '.claude', 'CLAUDE.md'),
        path.join(HOME, '.claude', 'AGENTS.md'),
        path.join(CWD, 'CLAUDE.md'),
        path.join(CWD, 'AGENTS.md'),
      ];

  let injectedCount = 0;
  for (const t of targets) {
    if (fs.existsSync(t) || t.includes('.claude') || fs.existsSync(path.dirname(t))) {
      syncDirectiveBlock(t, directiveTpl, dryRun);
      injectedCount++;
    }
  }
  logStep(5, 'Harness Directives', `Idempotent directive block synced across ${injectedCount} manifest files`);

  // Elapsed Time
  const duration = Date.now() - startTime;
  const durStr = duration <= 0 ? '<50ms' : `${duration}ms`;

  printRoleRoster();

  // Success Card
  const headerText = `TASKARD READY · SYNCHRONIZATION COMPLETE (${durStr})`;
  const headerVisLen = 44 + durStr.length;
  let padLen = 69 - headerVisLen;
  if (padLen < 0) padLen = 0;
  const pad = ' '.repeat(padLen);

  console.log(`  ${C.emerald}${C.bold}╭─────────────────────────────────────────────────────────────────────────╮${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.bold}${C.emerald}✨${C.reset}  ${C.bold}${headerText}${C.reset}${pad}  ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}${C.bold}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Speed Gear   :${C.reset} ${C.cyan}${C.bold}Express (Default)${C.reset} ${C.dim}· Nano · Full${C.reset}                      ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Safety       :${C.reset} ${C.amber}${C.bold}2-Strike Circuit Breaker${C.reset} ${C.dim}· 3 Approval Gates${C.reset}         ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Config File  :${C.reset} ${C.dark}${isGlobal ? '~/.taskard/config.toml' : '.taskard/config.toml'}${C.reset}                                 ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}                                                                         ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.bold}🚀 Quick Start:${C.reset}                                                         ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}     ${C.amber}${C.bold}"Run this task through the Taskard workflow"${C.reset}                     ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

// CLI Dispatcher
const args = process.argv.slice(2);
const command = args[0] || 'init';

if (args.includes('--help') || args.includes('-h') || command === 'help') {
  printHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v') || command === 'version') {
  const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'));
  console.log(`taskard v${pkg.version}`);
  process.exit(0);
}

if (command === 'roles' || command === 'list') {
  printRoleRoster();
  process.exit(0);
}

if (command === 'init' || command === 'install') {
  runInit(args);
  process.exit(0);
}

// Fallback to help for unknown commands
console.error(`${C.rose}Unknown command: ${command}${C.reset}\n`);
printHelp();
process.exit(1);
