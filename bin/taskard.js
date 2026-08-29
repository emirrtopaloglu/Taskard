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
  taskard lanes [options]        List active, completed, and blocked taskard lanes
  taskard clean [options]        Clean workspace lanes, diffs, and temporary files
  taskard doctor                 Diagnose harness bridges, skills & configuration health
  taskard config                 Display effective configuration and role routing
  taskard roles                  Display the 7-role tier matrix
  taskard --version              Show installed Taskard version
  taskard --help                 Show this help message

${C.bold}INIT OPTIONS:${C.reset}
  -i, --interactive              Launch guided interactive setup wizard
  -g, --global                   Initialize globally in ~/.taskard and ~/.claude
  --dry-run                      Simulate installation without writing any files
  -f, --force                    Force overwrite symlinks and configuration templates

${C.bold}LANES OPTIONS:${C.reset}
  -g, --global                   Inspect global ~/.taskard/lanes instead of workspace
  --active                       Show only active and in-progress lanes
  --completed                    Show only completed lanes

${C.bold}CLEAN OPTIONS:${C.reset}
  --dry-run                      Simulate cleanup without deleting any files
  -y, --yes, -f, --force         Clean without interactive confirmation prompt
  --completed                    Clean only completed lanes (preserve active/blocked)
  -g, --global                   Clean global ~/.taskard instead of workspace

${C.bold}ALIASES:${C.reset}
  lane, ls, list-lanes           Aliases for 'taskard lanes'
  clear, prune                   Aliases for 'taskard clean'
  check, status, diag            Aliases for 'taskard doctor'
  cfg                            Alias for 'taskard config'
  list                           Alias for 'taskard roles'

${C.bold}DOCUMENTATION & REPO:${C.reset}
  https://github.com/emirrtopaloglu/Taskard
`);
}

function stripTomlComment(str) {
  let inQuotes = false;
  let quoteChar = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch === '"' || ch === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuotes = false;
      }
    } else if (ch === '#' && !inQuotes) {
      return str.slice(0, i).trim();
    }
  }
  return str.trim();
}

function parseSimpleToml(content) {
  const result = {};
  let currentSection = result;

  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const sectionMatch = line.match(/^\[([^\]]+)\]/);
    if (sectionMatch) {
      const parts = sectionMatch[1].trim().split('.');
      let curr = result;
      for (const p of parts) {
        curr[p] = curr[p] || {};
        curr = curr[p];
      }
      currentSection = curr;
      continue;
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      const key = line.slice(0, eqIdx).trim();
      let rawVal = stripTomlComment(line.slice(eqIdx + 1).trim());

      let val = rawVal;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (/^-?\d+(\.\d+)?$/.test(val) && val !== '') {
        val = Number(val);
      } else if (val.startsWith('[') && val.endsWith(']')) {
        const inner = val.slice(1, -1).trim();
        if (!inner) {
          val = [];
        } else {
          const items = [];
          let current = '';
          let inQuotes = false;
          let quoteChar = '';
          for (let i = 0; i < inner.length; i++) {
            const ch = inner[i];
            if ((ch === '"' || ch === "'") && (i === 0 || inner[i - 1] !== '\\')) {
              if (!inQuotes) {
                inQuotes = true;
                quoteChar = ch;
              } else if (quoteChar === ch) {
                inQuotes = false;
              }
              current += ch;
            } else if (ch === ',' && !inQuotes) {
              items.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
          if (current.trim()) items.push(current.trim());
          val = items.map((s) => {
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
              return s.slice(1, -1);
            }
            return s;
          });
        }
      }
      currentSection[key] = val;
    }
  }
  return result;
}

function mergeConfigs(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      mergeConfigs(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function loadEffectiveConfig() {
  const tplPath = path.join(PKG_ROOT, 'templates', 'config.toml');
  const globalPath = path.join(HOME, '.taskard', 'config.toml');
  const projectPath = path.join(CWD, '.taskard', 'config.toml');

  let config = {};
  if (fs.existsSync(tplPath)) {
    try {
      config = parseSimpleToml(fs.readFileSync(tplPath, 'utf8'));
    } catch (_) {}
  }

  let source = 'templates/config.toml (Built-in Defaults)';
  let isProject = false;
  let isGlobal = false;

  if (fs.existsSync(globalPath)) {
    try {
      const globalCfg = parseSimpleToml(fs.readFileSync(globalPath, 'utf8'));
      mergeConfigs(config, globalCfg);
      source = '~/.taskard/config.toml (Global)';
      isGlobal = true;
    } catch (_) {}
  }

  if (fs.existsSync(projectPath)) {
    try {
      const projectCfg = parseSimpleToml(fs.readFileSync(projectPath, 'utf8'));
      mergeConfigs(config, projectCfg);
      source = '.taskard/config.toml (Workspace)';
      isProject = true;
    } catch (_) {}
  }

  return { config, source, isProject, isGlobal, globalPath, projectPath };
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
  if (fs.existsSync(path.join(HOME, '.gemini', 'antigravity-cli')) || fs.existsSync(path.join(HOME, '.gemini')) || fs.existsSync(path.join(HOME, '.antigravity'))) {
    found.push('Antigravity');
  }
  if (fs.existsSync(path.join(CWD, '.cursor')) || fs.existsSync(path.join(CWD, '.cursorrules')) || fs.existsSync(path.join(HOME, '.cursor'))) {
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

function runInit(args, customConfig = null) {
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

  let activeGear = 'Pro (Default)';
  let activeSafety = '2-Strike Circuit Breaker · 3 Approval Gates';

  if (!dryRun) {
    let configContent = fs.readFileSync(configTplPath, 'utf8');
    if (customConfig) {
      if (customConfig.default_mode) {
        configContent = configContent.replace(/^default_mode\s*=\s*"[^"]*"/m, `default_mode = "${customConfig.default_mode}"`);
        activeGear = customConfig.default_mode.charAt(0).toUpperCase() + customConfig.default_mode.slice(1);
      }
      if (customConfig.permission_mode) {
        configContent = configContent.replace(/^permission_mode\s*=\s*"[^"]*"/m, `permission_mode = "${customConfig.permission_mode}"`);
        activeSafety = customConfig.permission_mode === 'bypassPermissions'
          ? 'bypassPermissions (Autonomous)'
          : 'Manual Confirmation Mode';
      }
      if (customConfig.primary_harness) {
        if (configContent.includes('[harness_preferences]')) {
          configContent = configContent.replace(/\[harness_preferences\]/, `[harness_preferences]\nprimary_harness = "${customConfig.primary_harness}"`);
        }
      }
    }

    if (!fs.existsSync(globalConfigPath) || (isGlobal && customConfig)) {
      fs.writeFileSync(globalConfigPath, configContent, 'utf8');
    }
    if (!isGlobal && CWD !== HOME) {
      fs.mkdirSync(path.join(CWD, '.taskard'), { recursive: true });
      if (!fs.existsSync(projectConfigPath) || customConfig) {
        fs.writeFileSync(projectConfigPath, configContent, 'utf8');
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
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Speed Gear   :${C.reset} ${C.cyan}${C.bold}${activeGear}${C.reset} ${C.dim}· Fast · Max${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Safety       :${C.reset} ${C.amber}${C.bold}${activeSafety}${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Config File  :${C.reset} ${C.dark}${isGlobal ? '~/.taskard/config.toml' : '.taskard/config.toml'}${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.bold}🚀 Quick Start:${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}     ${C.amber}${C.bold}"Run this task through the Taskard workflow"${C.reset}`);
  console.log(`  ${C.emerald}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

async function runInteractiveInit(args) {
  const readline = require('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  printBanner();
  console.log(`  ${C.violet}${C.bold}╭────────────────────── TASKARD INTERACTIVE WIZARD ──────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Interactive Workspace & Harness Configuration Setup${C.reset}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);

  // Detect harness to provide smart default
  const detectedHarnesses = detectHarnesses();
  let defaultHarnessNum = '1';
  if (detectedHarnesses.some((h) => h.includes('OpenCode'))) defaultHarnessNum = '2';
  else if (detectedHarnesses.some((h) => h.includes('Codex'))) defaultHarnessNum = '3';
  else if (detectedHarnesses.some((h) => h.includes('Antigravity'))) defaultHarnessNum = '4';
  else if (detectedHarnesses.some((h) => h.includes('Cursor'))) defaultHarnessNum = '5';

  // 1. Speed Gear
  console.log(`  ${C.cyan}${C.bold}[1/3] Default Speed Gear:${C.reset}`);
  console.log(`        ${C.bold}1)${C.reset} ${C.cyan}🚀 Express${C.reset}  ${C.gray}(Default - 5-10m, lightweight brief + review gate)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} ${C.amber}⚡ Nano${C.reset}     ${C.gray}(Fast - <2m, zero overhead, single fix)${C.reset}`);
  console.log(`        ${C.bold}3)${C.reset} ${C.purple}🏛️ Full${C.reset}     ${C.gray}(Rigor - 15-30m, worktree DAG, QA & opus review)${C.reset}`);
  const gearAns = (await question(`        ${C.bold}Selection [1-3] (1): ${C.reset}`)).trim() || '1';

  let selectedGear = 'express';
  if (gearAns === '2' || gearAns.toLowerCase() === 'nano' || gearAns.toLowerCase() === 'fast') selectedGear = 'nano';
  else if (gearAns === '3' || gearAns.toLowerCase() === 'full' || gearAns.toLowerCase() === 'max') selectedGear = 'full';

  // 2. Primary Harness
  console.log(`\n  ${C.cyan}${C.bold}[2/3] Primary AI CLI Harness:${C.reset}`);
  console.log(`        ${C.bold}1)${C.reset} Claude Code    ${C.gray}(~/.claude, CLAUDE.md)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} OpenCode       ${C.gray}(~/.opencode, ~/.config/opencode)${C.reset}`);
  console.log(`        ${C.bold}3)${C.reset} Codex          ${C.gray}(~/.agents, ~/.codex)${C.reset}`);
  console.log(`        ${C.bold}4)${C.reset} Antigravity    ${C.gray}(~/.gemini, AGENTS.md)${C.reset}`);
  console.log(`        ${C.bold}5)${C.reset} Cursor         ${C.gray}(.cursorrules, AGENTS.md)${C.reset}`);
  const harnessAns = (await question(`        ${C.bold}Selection [1-5] (${defaultHarnessNum}): ${C.reset}`)).trim() || defaultHarnessNum;

  const harnessMap = { '1': 'claude', '2': 'opencode', '3': 'codex', '4': 'antigravity', '5': 'cursor' };
  const selectedHarness = harnessMap[harnessAns] || 'claude';

  // 3. Permission Level
  console.log(`\n  ${C.cyan}${C.bold}[3/3] Security & Permission Level:${C.reset}`);
  console.log(`        ${C.bold}1)${C.reset} ${C.emerald}⚡ bypassPermissions${C.reset} ${C.gray}(Autonomous tool execution with 3 approval gates - Recommended)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} ${C.amber}🛡️ default / manual${C.reset}   ${C.gray}(Prompt for every tool action, manual confirmation)${C.reset}`);
  const permAns = (await question(`        ${C.bold}Selection [1-2] (1): ${C.reset}`)).trim() || '1';

  const selectedPerm = (permAns === '2' || permAns.toLowerCase() === 'manual' || permAns.toLowerCase() === 'default')
    ? 'default'
    : 'bypassPermissions';

  rl.close();
  console.log(`\n  ${C.emerald}✔${C.reset} ${C.gray}Configuration applied: ${C.bold}${selectedGear}${C.reset} | ${C.bold}${selectedHarness}${C.reset} | ${C.bold}${selectedPerm}${C.reset}\n`);

  runInit(args, {
    default_mode: selectedGear,
    primary_harness: selectedHarness,
    permission_mode: selectedPerm,
  });
}

function promptConfirm(question) {
  return new Promise((resolve) => {
    const readline = require('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function getItemSize(targetPath) {
  let size = 0;
  try {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink()) {
      return 0;
    }
    if (!stat.isDirectory()) {
      return stat.size;
    }
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(targetPath, e.name);
      if (e.isDirectory()) {
        size += getItemSize(full);
      } else if (e.isFile()) {
        size += fs.statSync(full).size;
      }
    }
  } catch (_) {}
  return size;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function runClean(args) {
  printBanner();
  const dryRun = args.includes('--dry-run');
  const yesFlag = args.includes('--yes') || args.includes('-y') || args.includes('--force') || args.includes('-f');
  const cleanAll = args.includes('--all') || args.includes('-a');
  const completedOnly = args.includes('--completed') || !cleanAll;
  const isGlobal = args.includes('--global') || args.includes('-g');

  const baseDir = isGlobal
    ? path.join(HOME, '.taskard')
    : (fs.existsSync(path.join(CWD, '.taskard')) ? path.join(CWD, '.taskard') : path.join(CWD, '.taskard'));
  const displayBase = isGlobal ? '~/.taskard' : '.taskard';

  const lanesDir = path.join(baseDir, 'lanes');
  const tmpDir = path.join(baseDir, 'tmp');
  const diffsDir = path.join(baseDir, 'diffs');

  const targets = [];

  // 1. Lanes
  if (fs.existsSync(lanesDir)) {
    const entries = fs.readdirSync(lanesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    for (const name of entries) {
      const lanePath = path.join(lanesDir, name);
      const reportPath = path.join(lanePath, 'report.md');
      let isCompleted = false;

      if (fs.existsSync(reportPath)) {
        try {
          const report = fs.readFileSync(reportPath, 'utf8');
          if (
            report.includes('STATUS: DONE') ||
            report.includes('STATUS: DONE_WITH_CONCERNS') ||
            report.includes('STATUS: PASS') ||
            report.includes('STATUS: PASS_WITH_NOTES')
          ) {
            isCompleted = true;
          }
        } catch (_) {}
      } else {
        const reviewPath = path.join(lanePath, 'review.md');
        if (fs.existsSync(reviewPath)) {
          try {
            const rev = fs.readFileSync(reviewPath, 'utf8');
            if (rev.includes('PASS')) isCompleted = true;
          } catch (_) {}
        }
      }

      if (cleanAll || isCompleted) {
        const size = getItemSize(lanePath);
        targets.push({
          type: 'lane',
          name,
          path: lanePath,
          relPath: isGlobal ? `~/.taskard/lanes/${name}` : (path.relative(CWD, lanePath) || `.taskard/lanes/${name}`),
          size,
          sizeStr: formatBytes(size),
          isCompleted,
        });
      }
    }
  }

  // 2. Tmp directory
  if (fs.existsSync(tmpDir)) {
    const entries = fs.readdirSync(tmpDir);
    for (const name of entries) {
      const itemPath = path.join(tmpDir, name);
      const size = getItemSize(itemPath);
      targets.push({
        type: 'tmp',
        name,
        path: itemPath,
        relPath: isGlobal ? `~/.taskard/tmp/${name}` : (path.relative(CWD, itemPath) || `.taskard/tmp/${name}`),
        size,
        sizeStr: formatBytes(size),
        isCompleted: false,
      });
    }
  }

  // 3. Diffs directory
  if (fs.existsSync(diffsDir)) {
    const entries = fs.readdirSync(diffsDir);
    for (const name of entries) {
      const itemPath = path.join(diffsDir, name);
      const size = getItemSize(itemPath);
      targets.push({
        type: 'diff',
        name,
        path: itemPath,
        relPath: isGlobal ? `~/.taskard/diffs/${name}` : (path.relative(CWD, itemPath) || `.taskard/diffs/${name}`),
        size,
        sizeStr: formatBytes(size),
        isCompleted: false,
      });
    }
  }

  const totalBytes = targets.reduce((acc, t) => acc + t.size, 0);
  const totalSizeStr = formatBytes(totalBytes);
  const scopeStr = cleanAll ? ' (all lanes)' : ' (completed lanes only)';

  console.log(`  ${C.violet}${C.bold}╭─────────────────────────── TASKARD WORKSPACE CLEANUP ───────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Target Scope:${C.reset} ${C.emerald}${displayBase}/${scopeStr}${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Items Found :${C.reset} ${targets.length === 0 ? `${C.emerald}0 items (Workspace is clean)${C.reset}` : `${C.amber}${targets.length} item(s)${C.reset} ${C.dim}(reclaimable: ${totalSizeStr})${C.reset}`}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);

  if (targets.length === 0) {
    if (completedOnly) {
      console.log(`  ${C.emerald}✔${C.reset} ${C.gray}No completed lanes or temporary files found to clean in ${displayBase}/${C.reset}\n`);
    } else {
      console.log(`  ${C.emerald}✔${C.reset} ${C.gray}Workspace is clean. No lanes or temporary files found to clean in ${displayBase}/${C.reset}\n`);
    }
    return;
  }

  console.log(`  ${C.bold}Target Items (${targets.length}):${C.reset}`);
  for (const t of targets) {
    const tag = t.isCompleted ? ` ${C.emerald}[DONE]${C.reset}` : '';
    console.log(`    ${C.rose}✖${C.reset} ${C.gray}${t.relPath}${C.reset} ${C.dim}(${t.sizeStr})${C.reset}${tag}`);
  }

  if (dryRun) {
    console.log(`\n  ${C.amber}${C.bold}[DRY-RUN]${C.reset} ${C.gray}Simulation only. ${targets.length} item(s) (${totalSizeStr}) would be removed.${C.reset}\n`);
    return;
  }

  if (!yesFlag) {
    const isInteractive = Boolean(process.stdout.isTTY && process.stdin.isTTY);
    if (!isInteractive) {
      console.error(`\n  ${C.rose}✖ Error:${C.reset} Confirmation required in non-interactive mode. Use ${C.bold}--yes (-y)${C.reset} or ${C.bold}--force (-f)${C.reset} to clean.\n`);
      process.exit(1);
    }

    const answer = await promptConfirm(`\n  ${C.amber}?${C.reset} ${C.bold}Are you sure you want to permanently delete these ${targets.length} item(s) (${totalSizeStr})? [y/N] ${C.reset}`);
    if (answer !== 'y' && answer !== 'yes') {
      console.log(`\n  ${C.gray}✖ Cleanup aborted by user.${C.reset}\n`);
      return;
    }
  }

  let deletedCount = 0;
  for (const t of targets) {
    try {
      if (fs.existsSync(t.path)) {
        fs.rmSync(t.path, { recursive: true, force: true });
        deletedCount++;
      }
    } catch (err) {
      console.error(`  ${C.rose}Failed to remove ${t.relPath}: ${err.message}${C.reset}`);
    }
  }

  console.log(`\n  ${C.emerald}✔${C.reset} ${C.bold}Cleanup complete:${C.reset} ${C.emerald}${deletedCount} item(s) removed${C.reset}, ${C.bold}${totalSizeStr}${C.reset} ${C.gray}freed.${C.reset}\n`);
}

function runLanes(args) {
  printBanner();
  const showActive = args.includes('--active');
  const showCompleted = args.includes('--completed');
  const isGlobal = args.includes('--global') || args.includes('-g');

  const baseDir = isGlobal
    ? path.join(HOME, '.taskard')
    : (fs.existsSync(path.join(CWD, '.taskard', 'lanes'))
        ? path.join(CWD, '.taskard')
        : (fs.existsSync(path.join(CWD, 'lanes')) ? CWD : path.join(CWD, '.taskard')));

  const lanesDir = path.join(baseDir, 'lanes');
  const displayPath = isGlobal ? '~/.taskard/lanes/' : (path.relative(CWD, lanesDir) ? `${path.relative(CWD, lanesDir)}/` : '.taskard/lanes/');

  console.log(`  ${C.violet}${C.bold}╭───────────────────────────── TASKARD WORKSPACE LANES ─────────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Inspection Directory:${C.reset} ${C.emerald}${displayPath}${C.reset}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);

  if (!fs.existsSync(lanesDir)) {
    console.log(`  ${C.amber}▲${C.reset} ${C.gray}No active or completed lanes found in .taskard/lanes/${C.reset}\n`);
    return;
  }

  const entries = fs.readdirSync(lanesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (entries.length === 0) {
    console.log(`  ${C.amber}▲${C.reset} ${C.gray}No active or completed lanes found in .taskard/lanes/${C.reset}\n`);
    return;
  }

  entries.sort();

  const laneData = [];
  let completedCount = 0;
  let activeCount = 0;
  let blockedCount = 0;
  let needsContextCount = 0;

  for (const name of entries) {
    const lanePath = path.join(lanesDir, name);
    const reportPath = path.join(lanePath, 'report.md');
    const briefPath = path.join(lanePath, 'brief.md');

    let title = '';
    if (fs.existsSync(briefPath)) {
      try {
        const briefContent = fs.readFileSync(briefPath, 'utf8');
        const titleMatch = briefContent.match(/^#\s*(?:Brief:\s*|Taskard Lane Brief:\s*)?([^\r\n]+)/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
        } else {
          const objMatch = briefContent.match(/##\s*Objective\s*\r?\n([^\r\n]+)/i);
          if (objMatch) {
            title = objMatch[1].trim();
          }
        }
      } catch (_) {}
    }

    let status = 'ACTIVE';
    let diffSummary = 'None';
    let attempts = '1';

    if (fs.existsSync(reportPath)) {
      try {
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        const statusMatch = reportContent.match(/^STATUS:\s*([^\r\n]+)/m);
        if (statusMatch) {
          const raw = statusMatch[1].trim().toUpperCase();
          if (raw.includes('DONE') || raw.includes('PASS')) {
            status = 'DONE';
          } else if (raw.includes('BLOCK') || raw.includes('FAIL')) {
            status = 'BLOCKED';
          } else if (raw.includes('CONTEXT')) {
            status = 'NEEDS_CONTEXT';
          } else {
            status = 'ACTIVE';
          }
        }

        const diffMatch = reportContent.match(/^DIFF_SUMMARY:\s*([^\r\n]+)/m);
        if (diffMatch) {
          diffSummary = diffMatch[1].trim();
        }

        const attemptsMatch = reportContent.match(/^ATTEMPTS:\s*([^\r\n]+)/m);
        if (attemptsMatch) {
          attempts = attemptsMatch[1].trim();
        }
      } catch (_) {
        status = 'ACTIVE';
      }
    }

    let verdict = 'Pending';
    try {
      const laneFiles = fs.readdirSync(lanePath);
      const reviewFiles = laneFiles.filter((f) => f.startsWith('review') && f.endsWith('.md')).sort();
      if (reviewFiles.length > 0) {
        const latestReview = reviewFiles[reviewFiles.length - 1];
        const revContent = fs.readFileSync(path.join(lanePath, latestReview), 'utf8');
        const verdictMatch = revContent.match(/^VERDICT:\s*([^\r\n]+)/m);
        if (verdictMatch) {
          verdict = verdictMatch[1].trim().toUpperCase();
        } else {
          verdict = 'REVIEWED';
        }
      } else if (status === 'DONE') {
        verdict = 'N/A';
      }
    } catch (_) {}

    if (status === 'DONE') completedCount++;
    else if (status === 'BLOCKED') blockedCount++;
    else if (status === 'NEEDS_CONTEXT') needsContextCount++;
    else activeCount++;

    if (showActive && status === 'DONE') continue;
    if (showCompleted && status !== 'DONE') continue;

    laneData.push({
      name,
      path: lanePath,
      relPath: isGlobal ? `~/.taskard/lanes/${name}` : (path.relative(CWD, lanePath) || `.taskard/lanes/${name}`),
      title,
      status,
      diffSummary,
      attempts,
      verdict,
    });
  }

  for (let i = 0; i < laneData.length; i++) {
    const lane = laneData[i];
    const statusBadge = lane.status === 'DONE' ? `${C.emerald}${C.bold}[DONE]${C.reset}`
      : lane.status === 'BLOCKED' ? `${C.rose}${C.bold}[BLOCKED]${C.reset}`
      : lane.status === 'NEEDS_CONTEXT' ? `${C.amber}${C.bold}[NEEDS_CONTEXT]${C.reset}`
      : `${C.cyan}${C.bold}[ACTIVE]${C.reset}`;

    const verdictColor = lane.verdict === 'PASS' ? C.emerald
      : lane.verdict.includes('CONCERNS') ? C.amber
      : (lane.verdict === 'FAIL' || lane.verdict === 'BLOCKED') ? C.rose
      : C.gray;

    console.log(`  ${C.bold}${C.purple}●${C.reset} ${C.bold}${lane.name}${C.reset} ${statusBadge}`);
    if (lane.title) {
      console.log(`    ${C.gray}Objective   :${C.reset} ${lane.title}`);
    }
    console.log(`    ${C.gray}Review      :${C.reset} ${verdictColor}${lane.verdict}${C.reset} ${C.dim}· Attempts: ${lane.attempts}${C.reset}`);
    if (lane.diffSummary && lane.diffSummary !== 'None' && lane.diffSummary !== 'N/A') {
      console.log(`    ${C.gray}Diff        :${C.reset} ${C.cyan}${lane.diffSummary}${C.reset}`);
    }
    console.log(`    ${C.gray}Path        :${C.reset} ${C.dark}${lane.relPath}${C.reset}`);
    if (i < laneData.length - 1) {
      console.log(`  ${C.dark}─────────────────────────────────────────────────────────────────────────${C.reset}`);
    }
  }

  console.log(`\n  ${C.violet}${C.bold}╭─────────────────────────────── LANES SUMMARY ──────────────────────────────╮${C.reset}`);
  const summaryParts = [
    `${C.emerald}${C.bold}${completedCount} completed${C.reset}`,
    `${C.cyan}${C.bold}${activeCount} active${C.reset}`,
  ];
  if (blockedCount > 0) summaryParts.push(`${C.rose}${C.bold}${blockedCount} blocked${C.reset}`);
  if (needsContextCount > 0) summaryParts.push(`${C.amber}${C.bold}${needsContextCount} needs context${C.reset}`);

  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Total Lanes :${C.reset} ${C.bold}${entries.length}${C.reset}  (${summaryParts.join(', ')})`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

function runDoctor(args) {
  printBanner();
  console.log(`  ${C.violet}${C.bold}╭─────────────────────────── TASKARD SYSTEM DOCTOR ───────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Diagnostic health inspection for multi-harness agent environment${C.reset}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);

  let totalChecks = 0;
  let passedChecks = 0;
  let warningChecks = 0;

  // 1. Harness Detection
  totalChecks++;
  const harnesses = detectHarnesses();
  const hasSpecificHarness = !harnesses.includes('Standard Universal (Claude Code / OpenCode compatible)');
  console.log(`  ${C.cyan}${C.bold}[1/5]${C.reset} ${C.bold}Harness Detection${C.reset}`);
  if (hasSpecificHarness) {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Detected: ${C.bold}${harnesses.join(', ')}${C.reset}`);
  } else {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Universal compatibility mode active (${harnesses[0]})${C.reset}`);
  }

  // 2. Skills Symlink Health
  totalChecks++;
  const taskardHome = path.join(HOME, '.taskard');
  const claudeSkillLink = path.join(HOME, '.claude', 'skills', 'taskard');
  const agentsSkillLink = path.join(HOME, '.agents', 'skills', 'taskard');
  const localSkillMd = path.join(PKG_ROOT, 'skills', 'taskard', 'SKILL.md');
  const globalSkillMd = path.join(taskardHome, 'skills', 'taskard', 'SKILL.md');

  const claudeSkillExists = fs.existsSync(claudeSkillLink);
  const agentsSkillExists = fs.existsSync(agentsSkillLink);
  const skillMdExists = fs.existsSync(localSkillMd) || fs.existsSync(globalSkillMd);

  console.log(`  ${C.cyan}${C.bold}[2/5]${C.reset} ${C.bold}Skills Symlink & Health${C.reset}`);
  if (skillMdExists && (claudeSkillExists || agentsSkillExists || fs.existsSync(taskardHome))) {
    passedChecks++;
    const linksFound = [];
    if (claudeSkillExists) linksFound.push('~/.claude/skills/taskard');
    if (agentsSkillExists) linksFound.push('~/.agents/skills/taskard');
    const linksDesc = linksFound.length > 0 ? linksFound.join(', ') : 'Package skill core';
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Skill symlinks verified: ${linksDesc} (SKILL.md readable)${C.reset}`);
  } else if (skillMdExists) {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Package skill source verified (Run 'taskard init' to link harnesses)${C.reset}`);
  } else {
    warningChecks++;
    console.log(`        ${C.rose}✖${C.reset} ${C.gray}Taskard skill not linked. Run 'npx taskard init'${C.reset}`);
  }

  // 3. 7 Agent Definitions Presence
  totalChecks++;
  const requiredRoles = ['implementer', 'reviewer', 'planner', 'debugger', 'ui-developer', 'explorer', 'qa-tester'];
  const agentsSrcDir = path.join(PKG_ROOT, 'agents');
  const globalAgentsDir = path.join(taskardHome, 'agents');
  const claudeAgentsDir = path.join(HOME, '.claude', 'agents');

  let validRolesCount = 0;
  for (const role of requiredRoles) {
    const candidatePaths = [
      path.join(globalAgentsDir, `${role}.md`),
      path.join(claudeAgentsDir, `${role}.md`),
      path.join(agentsSrcDir, `${role}.md`),
    ];
    let foundRole = false;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('name:') && content.includes('model:') && content.includes('description:')) {
          foundRole = true;
          break;
        }
      }
    }
    if (foundRole) validRolesCount++;
  }

  console.log(`  ${C.cyan}${C.bold}[3/5]${C.reset} ${C.bold}Agent Role Definitions (7 Roles)${C.reset}`);
  if (validRolesCount === requiredRoles.length) {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}All 7 role contracts validated (${requiredRoles.join(', ')})${C.reset}`);
  } else {
    warningChecks++;
    console.log(`        ${C.amber}▲${C.reset} ${C.gray}${validRolesCount}/7 roles verified. Run 'taskard init' to sync missing roles.${C.reset}`);
  }

  // 4. Configuration Health
  totalChecks++;
  const globalConfigPath = path.join(taskardHome, 'config.toml');
  const projectConfigPath = path.join(CWD, '.taskard', 'config.toml');
  const templateConfigPath = path.join(PKG_ROOT, 'templates', 'config.toml');

  let configHealthy = false;
  const configLocations = [];

  if (fs.existsSync(projectConfigPath)) {
    try {
      parseSimpleToml(fs.readFileSync(projectConfigPath, 'utf8'));
      configLocations.push('.taskard/config.toml (Workspace)');
      configHealthy = true;
    } catch (_) {}
  }
  if (fs.existsSync(globalConfigPath)) {
    try {
      parseSimpleToml(fs.readFileSync(globalConfigPath, 'utf8'));
      configLocations.push('~/.taskard/config.toml (Global)');
      configHealthy = true;
    } catch (_) {}
  }
  if (!configHealthy && fs.existsSync(templateConfigPath)) {
    try {
      parseSimpleToml(fs.readFileSync(templateConfigPath, 'utf8'));
      configLocations.push('templates/config.toml (Built-in)');
      configHealthy = true;
    } catch (_) {}
  }

  console.log(`  ${C.cyan}${C.bold}[4/5]${C.reset} ${C.bold}Configuration Layer${C.reset}`);
  if (configHealthy) {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Valid configuration source: ${configLocations.join(', ')}${C.reset}`);
  } else {
    warningChecks++;
    console.log(`        ${C.amber}▲${C.reset} ${C.gray}No valid config.toml found. Run 'taskard init'${C.reset}`);
  }

  // 5. Directive Block Markers
  totalChecks++;
  const directiveTargets = [
    path.join(CWD, 'CLAUDE.md'),
    path.join(CWD, 'AGENTS.md'),
    path.join(HOME, '.claude', 'CLAUDE.md'),
    path.join(HOME, '.claude', 'AGENTS.md'),
  ];
  let markersFound = 0;
  const syncedFiles = [];
  for (const t of directiveTargets) {
    if (fs.existsSync(t)) {
      const content = fs.readFileSync(t, 'utf8');
      if (content.includes('<!-- taskard:start -->') && content.includes('<!-- taskard:end -->')) {
        markersFound++;
        syncedFiles.push(path.basename(t));
      }
    }
  }

  console.log(`  ${C.cyan}${C.bold}[5/5]${C.reset} ${C.bold}Directive Block Markers${C.reset}`);
  if (markersFound > 0) {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}<!-- taskard:start --> markers verified in ${markersFound} file(s) [${[...new Set(syncedFiles)].join(', ')}]${C.reset}`);
  } else {
    passedChecks++;
    console.log(`        ${C.emerald}✔${C.reset} ${C.gray}Directive block ready for synchronization across CLAUDE.md / AGENTS.md${C.reset}`);
  }

  // Diagnostics Summary Card
  const allGreen = warningChecks === 0;
  const statusLabel = allGreen ? 'Healthy · All systems operational' : 'Warnings detected · Run taskard init';
  const statusColor = allGreen ? C.emerald : C.amber;

  console.log(`\n  ${statusColor}${C.bold}╭───────────────────────────── DIAGNOSTICS SUMMARY ────────────────────────────╮${C.reset}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Status        :${C.reset} ${statusColor}${C.bold}${statusLabel}${C.reset}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Checks passed :${C.reset} ${C.bold}${passedChecks} / ${totalChecks}${C.reset} ${warningChecks > 0 ? `${C.amber}(${warningChecks} warnings)${C.reset}` : ''}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Harnesses     :${C.reset} ${harnesses.join(', ')}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Role Roster   :${C.reset} 7 roles active (implementer, reviewer, planner, debugger...)`);
  console.log(`  ${statusColor}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

function runConfig() {
  printBanner();
  const { config, source } = loadEffectiveConfig();
  const defaults = config.defaults || {};
  const roles = config.roles || {};
  const qa = config.qa || {};
  const risky = config.risky_operations || {};

  console.log(`  ${C.cyan}${C.bold}╭─────────────────────────── TASKARD CONFIGURATION ───────────────────────────╮${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}Effective Source:${C.reset} ${C.emerald}${source}${C.reset}`);
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.violet}[DEFAULTS & GOVERNANCE]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Speed Gear         :${C.reset} ${C.bold}${C.cyan}${defaults.default_mode || 'pro'}${C.reset} ${C.dim}[fast | pro | max]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Permission Mode    :${C.reset} ${C.bold}${defaults.permission_mode || 'bypassPermissions'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Circuit Breaker    :${C.reset} ${C.amber}${C.bold}2-Strike${C.reset} ${C.gray}(max_attempts = ${defaults.max_attempts ?? 2})${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Report Max Lines   :${C.reset} ${defaults.report_max_lines ?? 15} lines ${C.dim}(strict contract)${C.reset}`);
  if (defaults.budget_minutes) {
    console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Budget Ceiling     :${C.reset} ${defaults.budget_minutes} minutes`);
  }
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.purple}${C.bold}[ROLE ROUTING & MODEL TIERS]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.purple}${C.bold}Strategy (Tier 1)${C.reset}   : planner -> ${C.bold}${roles.planner || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         reviewer_max -> ${C.bold}${roles.reviewer_max || roles.reviewer_full || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         debugger_max -> ${C.bold}${roles.debugger_max || roles.debugger_full || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.blue}${C.bold}Execution (Tier 2)${C.reset}  : implementer -> ${C.bold}${roles.implementer || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         ui-developer -> ${C.bold}${roles['ui-developer'] || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         reviewer -> ${C.bold}${roles.reviewer || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         debugger -> ${C.bold}${roles.debugger || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.emerald}${C.bold}Assist (Tier 3)${C.reset}     : explorer -> ${C.bold}${roles.explorer || 'haiku'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         qa-tester -> ${C.bold}${roles['qa-tester'] || 'haiku'}${C.reset}`);
  const disabledStr = Array.isArray(roles.disabled) && roles.disabled.length > 0 ? roles.disabled.join(', ') : 'None';
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Disabled Roles     :${C.reset} ${disabledStr}`);
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.rose}[RISKY OPERATIONS (APPROVAL GATED)]${C.reset}`);
  const patternsList = Array.isArray(risky.patterns) ? risky.patterns.join(', ') : 'migration, deploy, rm -rf, drop table, git push --force';
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Patterns           :${C.reset} ${C.rose}${patternsList}${C.reset}`);
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.emerald}[QA SYSTEM VERIFICATION]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• QA Gate Enabled    :${C.reset} ${qa.enabled ? `${C.emerald}true${C.reset}` : `${C.dim}false (default OFF)${C.reset}`}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Headless Browser   :${C.reset} ${qa.headless_browser ? `${C.emerald}true${C.reset}` : `${C.dim}false${C.reset}`} ${C.dim}(agent-browser / playwright-cli)${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Integration Tests  :${C.reset} ${qa.run_integration_tests ? `${C.emerald}true${C.reset}` : `${C.dim}false${C.reset}`} ${C.dim}(npm test, pytest)${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Auto Endpoints     :${C.reset} ${qa.auto_verify_endpoints ? `${C.emerald}true${C.reset}` : `${C.dim}false${C.reset}`} ${C.dim}(HTTP curl verification)${C.reset}`);
  console.log(`  ${C.cyan}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

// CLI Dispatcher
async function main() {
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

  if (command === 'doctor' || command === 'check' || command === 'status' || command === 'diag') {
    runDoctor(args);
    process.exit(0);
  }

  if (command === 'config' || command === 'cfg') {
    runConfig();
    process.exit(0);
  }

  if (command === 'roles' || command === 'list') {
    printRoleRoster();
    process.exit(0);
  }

  if (command === 'clean' || command === 'clear' || command === 'prune') {
    await runClean(args);
    process.exit(0);
  }

  if (command === 'lanes' || command === 'lane' || command === 'ls' || command === 'list-lanes') {
    runLanes(args);
    process.exit(0);
  }

  if (command === 'init' || command === 'install') {
    const isInteractive = args.includes('--interactive') || args.includes('-i');
    if (isInteractive && isTTY) {
      await runInteractiveInit(args);
      process.exit(0);
    } else {
      runInit(args);
      process.exit(0);
    }
  }

  // Fallback to help for unknown commands
  console.error(`${C.rose}Unknown command: ${command}${C.reset}\n`);
  printHelp();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

