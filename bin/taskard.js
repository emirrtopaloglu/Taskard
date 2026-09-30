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
const { spawnSync } = require('node:child_process');
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
  `${C.gray}        Zero-Runtime · 3-Speed Gear · Risk-First${C.reset}\n`);
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
  taskard clean [options]        Archive completed lanes; --all and --purge require confirmation
  taskard verify [options]       Check lane briefs, reports, dependencies, and evidence metadata
  taskard doctor                 Check required harness bridges and configuration health
  taskard config                 Display effective configuration and role routing
  taskard roles                  Display the 7-role tier matrix
  taskard --version              Show installed Taskard version
  taskard --help                 Show this help message

${C.bold}INIT OPTIONS:${C.reset}
  -i, --interactive              Launch guided interactive setup wizard
  -g, --global                   Initialize globally in ~/.taskard and harness user directories
  --install-skills               Resolve optional upstream skills (requires --global; network access)
  --dry-run                      Simulate installation without writing any files
  -f, --force                    Replace Taskard links/profiles and default config files (regular user files are preserved)

${C.bold}LANES OPTIONS:${C.reset}
  -g, --global                   Inspect global ~/.taskard/lanes instead of workspace
  --active                       Show only active and in-progress lanes
  --completed                    Show only completed lanes

${C.bold}CLEAN OPTIONS:${C.reset}
  --dry-run                      Simulate cleanup without deleting any files
  -y, --yes, -f, --force         Clean without interactive confirmation prompt
  --completed                    Archive only eligible completed lanes (default)
  -a, --all                      Confirmed cleanup of all live lanes, tmp files, and diffs
  --purge                        Permanently remove eligible lanes already archived
  -g, --global                   Clean global ~/.taskard instead of workspace

VERIFY OPTIONS:
  -g, --global                   Verify global ~/.taskard lanes against this Git workspace

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

const ROLE_NAMES = ['implementer', 'reviewer', 'planner', 'debugger', 'ui-developer', 'explorer', 'qa-tester'];
const CONFIG_SECTIONS = new Set(['defaults', 'roles', 'qa', 'harness_preferences', 'risky_operations']);
const HARNESS_NAMES = new Set(['claude-code', 'claude', 'opencode', 'codex', 'antigravity', 'cursor']);
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const OPTIONAL_SKILLS_TIMEOUT_MS = 30_000;

function stripTomlComment(line) {
  let quote = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote === '"' && ch === '\\') {
      i++;
      continue;
    }
    if ((ch === '"' || ch === "'") && (!quote || quote === ch)) {
      quote = quote ? '' : ch;
    } else if (ch === '#' && !quote) {
      return line.slice(0, i).trim();
    }
  }
  if (quote) throw new Error('unterminated string');
  return line.trim();
}

function splitTomlArray(value) {
  const parts = [];
  let quote = '';
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote === '"' && ch === '\\') {
      i++;
      continue;
    }
    if ((ch === '"' || ch === "'") && (!quote || quote === ch)) {
      quote = quote ? '' : ch;
    } else if (ch === ',' && !quote) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (quote) throw new Error('unterminated string in array');
  const last = value.slice(start).trim();
  if (last) parts.push(last);
  return parts;
}

function parseTomlString(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'string') throw new Error('expected a string');
    return parsed;
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    const inner = value.slice(1, -1);
    if (inner.includes("'")) throw new Error('unsupported single-quoted string syntax');
    return inner;
  }
  throw new Error('expected a quoted string');
}

function parseTomlValue(rawValue) {
  const value = rawValue.trim();
  if (!value) throw new Error('missing value');
  if (value.startsWith('"') || value.startsWith("'")) return parseTomlString(value);
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error('unterminated array');
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return splitTomlArray(inner).map(parseTomlString);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(?:0|[1-9]\d*)$/.test(value)) {
    const number = Number(value);
    if (!Number.isSafeInteger(number)) throw new Error('integer is outside the safe range');
    return number;
  }
  throw new Error(`unsupported value '${value}'`);
}

function parseSimpleToml(content) {
  const result = {};
  let currentSection = result;
  const explicitSections = new Set();

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = stripTomlComment(rawLine).trim();
    if (!line) continue;

    const sectionMatch = line.match(/^\[([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\]$/);
    if (sectionMatch) {
      const parts = sectionMatch[1].split('.');
      if (parts.some((part) => DANGEROUS_KEYS.has(part))) throw new Error(`line ${index + 1}: unsafe table name`);
      const sectionName = parts.join('.');
      if (explicitSections.has(sectionName)) throw new Error(`line ${index + 1}: duplicate table [${sectionName}]`);
      explicitSections.add(sectionName);

      let current = result;
      for (const part of parts) {
        if (Object.prototype.hasOwnProperty.call(current, part) && (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part]))) {
          throw new Error(`line ${index + 1}: '${part}' is already a value`);
        }
        current[part] ||= {};
        current = current[part];
      }
      currentSection = current;
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex < 1) throw new Error(`line ${index + 1}: expected a table or key = value`);
    const key = line.slice(0, eqIndex).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(key) || DANGEROUS_KEYS.has(key)) throw new Error(`line ${index + 1}: invalid or unsafe key '${key}'`);
    if (Object.prototype.hasOwnProperty.call(currentSection, key)) throw new Error(`line ${index + 1}: duplicate key '${key}'`);
    try {
      currentSection[key] = parseTomlValue(line.slice(eqIndex + 1));
    } catch (error) {
      throw new Error(`line ${index + 1}: ${error.message}`);
    }
  }
  return result;
}

function validateConfig(config, label = 'config.toml') {
  const fail = (where, message) => { throw new Error(`${label}: ${where} ${message}`); };
  const checkTable = (table, where, allowed) => {
    if (!table || typeof table !== 'object' || Array.isArray(table)) fail(where, 'must be a table');
    for (const key of Object.keys(table)) if (!allowed.has(key)) fail(`${where}.${key}`, 'is not a supported setting');
  };
  const checkString = (value, where) => {
    if (typeof value !== 'string' || !value.trim()) fail(where, 'must be a non-empty string');
  };
  const checkStringArray = (value, where) => {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) fail(where, 'must be an array of non-empty strings');
  };

  checkTable(config, 'config', CONFIG_SECTIONS);
  if (config.defaults !== undefined) {
    const defaults = config.defaults;
    checkTable(defaults, '[defaults]', new Set(['permission_mode', 'default_mode', 'max_attempts', 'report_max_lines', 'budget_minutes']));
    if (defaults.permission_mode !== undefined && !['bypassPermissions', 'default'].includes(defaults.permission_mode)) fail('[defaults].permission_mode', 'must be "bypassPermissions" or "default"');
    if (defaults.default_mode !== undefined && !['fast', 'pro', 'max'].includes(defaults.default_mode)) fail('[defaults].default_mode', 'must be "fast", "pro", or "max"');
    for (const [key, min, max] of [['max_attempts', 1, 2], ['report_max_lines', 1, 100], ['budget_minutes', 1, 1440]]) {
      if (defaults[key] !== undefined && (!Number.isInteger(defaults[key]) || defaults[key] < min || defaults[key] > max)) fail(`[defaults].${key}`, `must be an integer from ${min} to ${max}`);
    }
  }
  if (config.roles !== undefined) {
    const roles = config.roles;
    checkTable(roles, '[roles]', new Set([...ROLE_NAMES, 'reviewer_max', 'debugger_max', 'disabled']));
    for (const [role, model] of Object.entries(roles)) {
      if (role !== 'disabled') checkString(model, `[roles].${role}`);
    }
    if (roles.disabled !== undefined) {
      checkStringArray(roles.disabled, '[roles].disabled');
      for (const role of roles.disabled) if (!ROLE_NAMES.includes(role)) fail('[roles].disabled', `contains unknown role '${role}'`);
    }
  }
  if (config.qa !== undefined) {
    const qa = config.qa;
    checkTable(qa, '[qa]', new Set(['enabled', 'headless_browser', 'run_integration_tests', 'auto_verify_endpoints']));
    for (const [key, value] of Object.entries(qa)) if (typeof value !== 'boolean') fail(`[qa].${key}`, 'must be true or false');
  }
  if (config.harness_preferences !== undefined) {
    const prefs = config.harness_preferences;
    checkTable(prefs, '[harness_preferences]', new Set(['primary_harness', 'models', ...ROLE_NAMES]));
    if (prefs.primary_harness !== undefined && !HARNESS_NAMES.has(prefs.primary_harness)) fail('[harness_preferences].primary_harness', 'must name a supported harness');
    for (const role of ROLE_NAMES) {
      if (prefs[role] !== undefined) {
        checkStringArray(prefs[role], `[harness_preferences].${role}`);
        if (prefs[role].some((harness) => !HARNESS_NAMES.has(harness))) fail(`[harness_preferences].${role}`, 'contains an unsupported harness');
      }
    }
    if (prefs.models !== undefined) {
      checkTable(prefs.models, '[harness_preferences].models', new Set(['claude_code', 'opencode']));
      for (const [harness, modelTable] of Object.entries(prefs.models)) {
        checkTable(modelTable, `[harness_preferences].models.${harness}`, new Set(ROLE_NAMES));
        for (const [role, model] of Object.entries(modelTable)) {
          checkString(model, `[harness_preferences].models.${harness}.${role}`);
          if (harness === 'opencode' && !/^[^/\s]+\/[^/\s]+$/.test(model)) fail(`[harness_preferences].models.opencode.${role}`, 'must use provider/model format');
        }
      }
    }
  }
  if (config.risky_operations !== undefined) {
    const risky = config.risky_operations;
    checkTable(risky, '[risky_operations]', new Set(['patterns']));
    if (risky.patterns !== undefined) checkStringArray(risky.patterns, '[risky_operations].patterns');
  }
  return config;
}

function mergeConfigs(target, source) {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (!target[key]) target[key] = {};
      mergeConfigs(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
  return target;
}

function loadEffectiveConfig({ includeProject = true } = {}) {
  const tplPath = path.join(PKG_ROOT, 'templates', 'config.toml');
  const globalPath = path.join(HOME, '.taskard', 'config.toml');
  const projectPath = path.join(CWD, '.taskard', 'config.toml');
  const read = (file, label) => validateConfig(parseSimpleToml(fs.readFileSync(file, 'utf8')), label);
  const readOptional = (file, label) => {
    const stat = lstatOrNull(file);
    if (!stat) return null;
    if (stat.isSymbolicLink()) {
      let targetStat;
      try {
        targetStat = fs.statSync(file);
      } catch (error) {
        if (error.code === 'ENOENT') throw new Error(`${label}: broken symbolic link`);
        throw new Error(`${label}: cannot follow symbolic link (${error.message})`);
      }
      if (!targetStat.isFile()) throw new Error(`${label}: symbolic link must point to a regular file`);
    } else if (!stat.isFile()) {
      throw new Error(`${label}: must be a regular file`);
    }
    return read(file, label);
  };

  const config = read(tplPath, 'templates/config.toml');
  let source = 'templates/config.toml (Built-in Defaults)';
  let isProject = false;
  let isGlobal = false;
  const globalConfig = readOptional(globalPath, '~/.taskard/config.toml');
  if (globalConfig) {
    mergeConfigs(config, globalConfig);
    source = '~/.taskard/config.toml (Global)';
    isGlobal = true;
  }
  const projectConfig = includeProject ? readOptional(projectPath, '.taskard/config.toml') : null;
  if (projectConfig) {
    mergeConfigs(config, projectConfig);
    source = '.taskard/config.toml (Workspace)';
    isProject = true;
  }
  validateConfig(config, 'effective config');
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

function detectHarnessIds() {
  const exists = (...parts) => fs.existsSync(path.join(...parts));
  const nativeRoots = resolveGlobalNativeRoots(HOME);
  const found = [];
  if (exists(HOME, '.claude') || exists(CWD, '.claude')) found.push('claude-code');
  if (fs.existsSync(nativeRoots.openCodeConfigDir) || exists(CWD, '.opencode') || exists(CWD, '.config', 'opencode')) found.push('opencode');
  if (exists(HOME, '.agents') || fs.existsSync(nativeRoots.codexHome) || exists(CWD, '.agents')) found.push('codex');
  if (exists(HOME, '.gemini') || exists(HOME, '.antigravity') || exists(CWD, '.gemini') || exists(CWD, '.antigravity')) found.push('antigravity');
  if (exists(HOME, '.cursor') || exists(CWD, '.cursor') || exists(CWD, '.cursorrules')) found.push('cursor');
  return found;
}

function selectHarness(config, detected = detectHarnessIds(), fallback = '') {
  const configured = config.harness_preferences?.primary_harness;
  return configured === 'claude' ? 'claude-code' : configured || detected[0] || fallback;
}

function isPathWithin(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function resolveGlobalNativeRoots(home = HOME, env = process.env) {
  const codexHome = path.resolve(env.CODEX_HOME || path.join(home, '.codex'));
  const openCodeConfigDir = path.resolve(env.OPENCODE_CONFIG_DIR || path.join(env.XDG_CONFIG_HOME || path.join(home, '.config'), 'opencode'));
  const scopedIssue = (label, target) => {
    if (!isPathWithin(home, target)) return `${label} resolves outside HOME and is unsupported by scoped global installation: ${target}`;
    if (hasSymlinkComponent(home, path.relative(home, target))) return `${label} contains a symlinked path and is unsupported by scoped global installation: ${target}`;
    return '';
  };
  return {
    codexHome,
    openCodeConfigDir,
    codexIssue: scopedIssue('CODEX_HOME', codexHome),
    openCodeIssue: scopedIssue('OpenCode config directory', openCodeConfigDir),
  };
}

function resolveHarnessPaths(harness, scopeRoot, installScope, nativeRoots) {
  if (installScope === 'project') {
    return {
      directiveTargets: harness ? [path.join(scopeRoot, 'CLAUDE.md'), path.join(scopeRoot, 'AGENTS.md')] : [],
      roleDirectory: harness === 'claude-code' ? path.join(scopeRoot, '.claude', 'agents')
        : harness === 'opencode' ? path.join(scopeRoot, '.opencode', 'agents') : '',
      issue: '',
    };
  }
  nativeRoots ||= resolveGlobalNativeRoots(scopeRoot);
  if (harness === 'claude-code') {
    return { directiveTargets: [path.join(scopeRoot, '.claude', 'CLAUDE.md'), path.join(scopeRoot, '.claude', 'AGENTS.md')], roleDirectory: path.join(scopeRoot, '.claude', 'agents'), issue: '' };
  }
  if (harness === 'codex') {
    return { directiveTargets: [path.join(nativeRoots.codexHome, 'AGENTS.md')], roleDirectory: '', issue: nativeRoots.codexIssue };
  }
  if (harness === 'opencode') {
    return { directiveTargets: [path.join(nativeRoots.openCodeConfigDir, 'AGENTS.md')], roleDirectory: path.join(nativeRoots.openCodeConfigDir, 'agents'), issue: nativeRoots.openCodeIssue };
  }
  return { directiveTargets: [], roleDirectory: '', issue: harness ? `Global native instructions are unsupported for ${harness} in user scope` : '' };
}

function detectHarnesses() {
  const labels = {
    'claude-code': 'Claude Code',
    opencode: 'OpenCode',
    codex: 'Codex / OpenAgent',
    antigravity: 'Antigravity',
    cursor: 'Cursor',
  };
  return detectHarnessIds().map((id) => labels[id]);
}

function lstatOrNull(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function ensureScopedDirectory(base, target, dryRun = false) {
  const relative = path.relative(base, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside ${base}: ${target}`);
  }
  const baseStat = lstatOrNull(base);
  if (baseStat && (!baseStat.isDirectory() || baseStat.isSymbolicLink())) throw new Error(`Refusing to use non-directory scope root: ${base}`);
  if (!baseStat && !dryRun) fs.mkdirSync(base, { recursive: true });

  let current = base;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = lstatOrNull(current);
    if (stat) {
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`Refusing to use non-directory path: ${current}`);
    } else if (!dryRun) {
      fs.mkdirSync(current);
    }
  }
}

function atomicWriteFile(target, content, mode = 0o644) {
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  let descriptor;
  try {
    descriptor = fs.openSync(temp, 'wx', mode);
    fs.writeFileSync(descriptor, content, 'utf8');
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temp, target);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    try { fs.unlinkSync(temp); } catch (_) {}
    throw error;
  }
}

function writeManagedFile(target, content, { base, dryRun = false, force = false, replaceOnForce = false } = {}) {
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  ensureScopedDirectory(base, path.dirname(target), dryRun);
  const stat = lstatOrNull(target);
  if (stat && (stat.isSymbolicLink() || !stat.isFile())) throw new Error(`Refusing to replace user-owned path: ${target}`);
  if (stat && fs.readFileSync(target, 'utf8') === content) return false;
  if (stat && !(force && replaceOnForce)) throw new Error(`Refusing to overwrite existing file without --force: ${target}`);
  if (!dryRun) atomicWriteFile(target, content, stat ? (stat.mode & 0o777) : 0o644);
  return true;
}

function ensureSymlink(target, source, { base, type, dryRun = false, force = false } = {}) {
  ensureScopedDirectory(base, path.dirname(target), dryRun);
  const stat = lstatOrNull(target);
  if (stat) {
    if (!stat.isSymbolicLink()) throw new Error(`Refusing to replace user-owned path: ${target}`);
    try {
      if (fs.realpathSync(target) === fs.realpathSync(source)) return false;
    } catch (_) {}
    if (!force) throw new Error(`Refusing to replace existing or broken symlink without --force: ${target}`);
    if (!dryRun) fs.unlinkSync(target);
  }
  if (!dryRun) fs.symlinkSync(source, target, type);
  return true;
}

function copyDirRecursive(src, dest, options) {
  ensureScopedDirectory(options.base, dest, options.dryRun);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath, options);
    else if (entry.isFile()) writeManagedFile(destPath, fs.readFileSync(srcPath), { ...options, replaceOnForce: true });
    else throw new Error(`Unsupported source entry: ${srcPath}`);
  }
}

function parseTaskardBlock(content, label) {
  const start = '<!-- taskard:start -->';
  const end = '<!-- taskard:end -->';
  const prefixes = [...content.matchAll(/<!--\s*taskard:/g)];
  const markers = [...content.matchAll(/<!--\s*taskard:[^>]*-->/g)];
  const starts = [...content.matchAll(/<!-- taskard:start -->/g)];
  const ends = [...content.matchAll(/<!-- taskard:end -->/g)];
  const allVersions = [...content.matchAll(/<!-- taskard:v(\d+) -->/g)];
  if (prefixes.length !== markers.length) throw new Error(`${label}: contains a malformed or unclosed Taskard marker`);
  if (markers.length !== starts.length + ends.length + allVersions.length) {
    throw new Error(`${label}: contains an unsupported Taskard marker`);
  }
  if (starts.length !== 1 || ends.length !== 1 || starts[0].index > ends[0].index) {
    throw new Error(`${label}: expected exactly one paired Taskard start/end marker`);
  }
  const block = content.slice(starts[0].index, ends[0].index + end.length);
  const versions = [...block.matchAll(/<!-- taskard:v(\d+) -->/g)];
  if (versions.length !== 1 || allVersions.length !== 1 || allVersions[0].index < starts[0].index || allVersions[0].index >= ends[0].index) {
    throw new Error(`${label}: expected exactly one versioned Taskard marker inside the paired block`);
  }
  return { block, version: versions[0][1], start: starts[0].index, end: ends[0].index + end.length };
}

function syncDirectiveBlock(targetFile, directiveSourcePath, { base, dryRun = false } = {}) {
  const sourceContent = fs.readFileSync(directiveSourcePath, 'utf8');
  const sourceBlock = parseTaskardBlock(sourceContent, directiveSourcePath).block;
  ensureScopedDirectory(base, path.dirname(targetFile), dryRun);
  const stat = lstatOrNull(targetFile);
  if (stat && (stat.isSymbolicLink() || !stat.isFile())) throw new Error(`Refusing to modify user-owned path: ${targetFile}`);
  const existing = stat ? fs.readFileSync(targetFile, 'utf8') : '';
  let replacement;
  if (!existing) replacement = `${sourceContent.trim()}\n`;
  else {
    let oldBlock;
    try {
      oldBlock = parseTaskardBlock(existing, targetFile);
    } catch (error) {
      if (/<!--\s*taskard:/.test(existing)) throw error;
      replacement = `${existing.replace(/\s*$/, '')}\n\n${sourceContent.trim()}\n`;
    }
    if (oldBlock) {
      if (oldBlock.block === sourceBlock) return false;
      replacement = `${existing.slice(0, oldBlock.start)}${sourceBlock}${existing.slice(oldBlock.end)}`;
    }
  }
  if (!dryRun) {
    atomicWriteFile(targetFile, replacement, stat ? (stat.mode & 0o777) : 0o644);
  }
  return true;
}

function readHarnessProfiles(file = path.join(PKG_ROOT, 'templates', 'harness-profiles.json')) {
  const profileData = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (profileData.schemaVersion !== 1 || !profileData.harnesses || typeof profileData.harnesses !== 'object') {
    throw new Error(`${file}: unsupported harness profile schema`);
  }
  return profileData.harnesses;
}

function getConfigPath(config, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value && value[key], config);
}

function parseAgentFrontmatter(agentContent, label) {
  const match = agentContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`${label}: missing agent frontmatter`);
  return { lines: match[1].split(/\r?\n/), body: agentContent.slice(match[0].length) };
}

function buildHarnessAgent(agentContent, role, harness, profiles, config, scope) {
  const profile = profiles[harness];
  if (!profile || !profile.installScope?.includes(scope)) return null;
  const { lines, body } = parseAgentFrontmatter(agentContent, `${role}.md`);
  const fields = [];
  let skipField = false;
  for (const line of lines) {
    if (/^(model|color|mode|tools|permission):/.test(line)) {
      skipField = true;
      continue;
    }
    if (skipField && /^\s+/.test(line)) continue;
    skipField = false;
    fields.push(line);
  }
  const modelProfile = profile.models || {};
  const configuredModel = modelProfile.configTable && getConfigPath(config, modelProfile.configTable);
  const explicitModel = configuredModel && configuredModel[role];
  let model;
  if (explicitModel !== undefined) {
    model = explicitModel;
    if (harness === 'opencode' && !/^[^/\s]+\/[^/\s]+$/.test(model)) throw new Error(`[harness_preferences].models.opencode.${role} must use provider/model format`);
  } else if (modelProfile.source !== 'selected-provider') {
    const configuredRoleModel = (config.roles && config.roles[role]);
    const sourceModel = lines.find((line) => line.startsWith('model:'))?.slice('model:'.length).trim().replace(/^['"]|['"]$/g, '');
    const candidate = configuredRoleModel || sourceModel;
    if (candidate) {
      model = modelProfile.aliases?.[candidate] || (candidate.includes('/') ? candidate : undefined);
      if (!model) throw new Error(`Unknown ${harness} model '${candidate}' for role '${role}'; use a documented alias or provider/model mapping`);
    }
  }

  const extra = [];
  const frontmatter = { ...profile.agentFrontmatter };
  if (model !== undefined) extra.push(`model: ${model}`);
  const originalColor = lines.find((line) => line.startsWith('color:'))?.slice('color:'.length).trim().replace(/^['"]|['"]$/g, '');
  if (originalColor) extra.push(`color: ${harness === 'opencode' ? normalizeOpenCodeColor(originalColor) : originalColor}`);
  for (const [field, value] of Object.entries(frontmatter)) extra.push(`${field}: ${value}`);
  const readOnly = profile.readOnlyRoles?.includes(role) && profile.readOnly;
  if (readOnly?.nativeField === 'tools' && Array.isArray(readOnly.allow)) {
    extra.push(`${readOnly.nativeField}:`);
    for (const tool of readOnly.allow) extra.push(`  - ${tool}`);
  } else if (readOnly?.nativeField === 'permission' && readOnly.rules) {
    extra.push(`${readOnly.nativeField}:`);
    for (const [tool, action] of Object.entries(readOnly.rules)) extra.push(`  ${tool === '*' ? '"*"' : tool}: ${action}`);
  }
  return `---\n${[...fields, ...extra].join('\n')}\n---\n${body}`;
}

function setTomlSetting(content, section, key, value) {
  const lines = content.split(/\r?\n/);
  const header = `[${section}]`;
  let start = lines.indexOf(header);
  if (start === -1) {
    if (lines[lines.length - 1] !== '') lines.push('');
    lines.push(header, `${key} = ${JSON.stringify(value)}`);
    return `${lines.join('\n').replace(/\n*$/, '\n')}`;
  }
  let end = lines.findIndex((line, index) => index > start && /^\s*\[/.test(line));
  if (end === -1) end = lines.length;
  const found = lines.findIndex((line, index) => index > start && index < end && line.match(/^\s*([A-Za-z0-9_-]+)\s*=/)?.[1] === key);
  if (found !== -1) lines[found] = `${key} = ${JSON.stringify(value)}`;
  else lines.splice(start + 1, 0, `${key} = ${JSON.stringify(value)}`);
  return `${lines.join('\n').replace(/\n*$/, '\n')}`;
}

function applyCustomConfig(content, customConfig) {
  if (customConfig.default_mode !== undefined) content = setTomlSetting(content, 'defaults', 'default_mode', customConfig.default_mode);
  if (customConfig.permission_mode !== undefined) content = setTomlSetting(content, 'defaults', 'permission_mode', customConfig.permission_mode);
  if (customConfig.primary_harness !== undefined) content = setTomlSetting(content, 'harness_preferences', 'primary_harness', customConfig.primary_harness);
  return content;
}

function resolveOptionalSkills({ home, dryRun }) {
  const skills = [
    { repo: 'obra/superpowers', name: 'using-superpowers' },
    { repo: 'mattpocock/skills', name: 'grilling' },
  ];
  const isInstalled = (name) => [
    path.join(home, '.claude', 'skills', name),
    path.join(home, '.agents', 'skills', name),
  ].some((candidate) => fs.existsSync(candidate));
  const missing = skills.filter(({ name }) => !isInstalled(name));
  if (!missing.length) return { status: 'Optional upstream skills are already present', failures: [] };
  if (dryRun) return { status: `Dry run: would resolve ${missing.length} optional upstream skill(s); no network request was made`, failures: [] };

  const failures = [];
  for (const skill of missing) {
    const result = spawnSync('npx', [
      '-y', 'skills', 'add', skill.repo,
      '--skill', skill.name,
      '-g', '-y',
    ], {
      cwd: home,
      env: { ...process.env, HOME: home, CI: '1' },
      stdio: 'ignore',
      timeout: OPTIONAL_SKILLS_TIMEOUT_MS,
    });
    if (result.error || result.status !== 0) {
      const detail = result.error?.code === 'ETIMEDOUT'
        ? `timed out after ${OPTIONAL_SKILLS_TIMEOUT_MS}ms`
        : result.error?.message || `exited with status ${result.status ?? 'unknown'}`;
      failures.push(`${skill.repo}/${skill.name} ${detail}`);
    } else if (!isInstalled(skill.name)) {
      failures.push(`${skill.repo}/${skill.name} exited successfully but did not create an expected user skill directory`);
    }
  }
  return {
    status: failures.length
      ? `Optional skill resolution failed: ${failures.join('; ')}`
      : `Optional skills resolved: ${missing.map(({ name }) => name).join(', ')}`,
    failures,
  };
}

function runInit(args, customConfig = null) {
  const startTime = Date.now();
  const dryRun = args.includes('--dry-run');
  const isGlobal = args.includes('--global') || args.includes('-g');
  const installSkills = args.includes('--install-skills');
  const force = args.includes('--force') || args.includes('-f');
  const scopeRoot = isGlobal ? HOME : CWD;
  const installScope = isGlobal ? 'user' : 'project';

  if (installSkills && !isGlobal) throw new Error('--install-skills requires --global because upstream skills are installed in user scope');
  if (!isGlobal && CWD === HOME) throw new Error(`Refusing to initialize inside HOME without --global: ${HOME}`);
  const defaultConfigPath = path.join(PKG_ROOT, 'templates', 'config.toml');
  let config;
  if (force) {
    // Build profile settings from the effective config after the selected layer resets.
    const resetConfig = validateConfig(parseSimpleToml(fs.readFileSync(defaultConfigPath, 'utf8')), 'templates/config.toml');
    if (isGlobal) {
      config = resetConfig;
    } else {
      config = loadEffectiveConfig({ includeProject: false }).config;
      mergeConfigs(config, resetConfig);
      validateConfig(config, 'effective config after project reset');
    }
  } else {
    config = loadEffectiveConfig({ includeProject: !isGlobal }).config;
  }
  const profiles = readHarnessProfiles();
  if (customConfig) {
    config.defaults ||= {};
    config.harness_preferences ||= {};
    if (customConfig.default_mode !== undefined) config.defaults.default_mode = customConfig.default_mode;
    if (customConfig.permission_mode !== undefined) config.defaults.permission_mode = customConfig.permission_mode;
    if (customConfig.primary_harness !== undefined) config.harness_preferences.primary_harness = customConfig.primary_harness;
    validateConfig(config, 'interactive configuration');
  }

  const selectedHarness = selectHarness(config, detectHarnessIds(), 'claude-code');
  const nativeRoots = isGlobal ? resolveGlobalNativeRoots(scopeRoot) : null;
  const selectedNativePaths = resolveHarnessPaths(selectedHarness, scopeRoot, installScope, nativeRoots);
  const openCodeNativePaths = resolveHarnessPaths('opencode', scopeRoot, installScope, nativeRoots);
  if (isGlobal && openCodeNativePaths.issue) throw new Error(openCodeNativePaths.issue);
  if (isGlobal && selectedNativePaths.issue) throw new Error(selectedNativePaths.issue);

  printBanner();

  // 1. Core directories
  const taskardHome = path.join(scopeRoot, '.taskard');
  const skillsSrc = path.join(PKG_ROOT, 'skills');
  const agentsSrc = path.join(PKG_ROOT, 'agents');
  const templatesSrc = path.join(PKG_ROOT, 'templates');
  const copyOptions = { base: scopeRoot, dryRun, force };
  ensureScopedDirectory(scopeRoot, taskardHome, dryRun);
  copyDirRecursive(skillsSrc, path.join(taskardHome, 'skills'), copyOptions);
  copyDirRecursive(agentsSrc, path.join(taskardHome, 'agents'), copyOptions);
  copyDirRecursive(templatesSrc, path.join(taskardHome, 'templates'), copyOptions);
  logStep(1, 'Core Directories & Templates', `${isGlobal ? '~/.taskard' : '.taskard'} (skills, agents, templates ${dryRun ? 'verified' : 'synchronized'})`);

  // 2. Harness Integration & Roles
  const harnessIds = detectHarnessIds();
  const harnessNames = { 'claude-code': 'Claude Code', opencode: 'OpenCode', codex: 'Codex', antigravity: 'Antigravity', cursor: 'Cursor' };
  const targetSkill = path.join(taskardHome, 'skills', 'taskard');
  const claudeSkills = path.join(scopeRoot, '.claude', 'skills');
  const claudeAgents = path.join(scopeRoot, '.claude', 'agents');
  const agentsSkills = path.join(scopeRoot, '.agents', 'skills');
  const openCodeAgents = openCodeNativePaths.roleDirectory;
  const claudeProfiles = path.join(taskardHome, 'claude-agents');
  const openCodeProfiles = path.join(taskardHome, 'opencode-agents');
  const agentFiles = fs.readdirSync(agentsSrc).filter((file) => file.endsWith('.md')).sort();

  for (const skillLink of [path.join(claudeSkills, 'taskard'), path.join(agentsSkills, 'taskard')]) {
    ensureSymlink(skillLink, targetSkill, { base: scopeRoot, type: 'dir', dryRun, force });
  }
  for (const file of agentFiles) {
    const role = file.slice(0, -3);
    const installedAgent = path.join(taskardHome, 'agents', file);
    const source = fs.readFileSync(fs.existsSync(installedAgent) ? installedAgent : path.join(agentsSrc, file), 'utf8');
    for (const [harness, profileRoot, targetRoot] of [
      ['claude-code', claudeProfiles, claudeAgents],
      ['opencode', openCodeProfiles, openCodeAgents],
    ]) {
      const rendered = buildHarnessAgent(source, role, harness, profiles, config, installScope);
      if (rendered === null) continue;
      const profileFile = path.join(profileRoot, file);
      writeManagedFile(profileFile, rendered, { base: scopeRoot, dryRun, force, replaceOnForce: true });
      ensureSymlink(path.join(targetRoot, file), profileFile, { base: scopeRoot, type: 'file', dryRun, force });
    }
  }

  const supportLabels = Object.entries(profiles).map(([id, profile]) => {
    const level = profile.support === 'tested' ? 'deterministic profile fixtures' : profile.support;
    return `${harnessNames[id] || id}: ${level}`;
  });
  const detectedText = harnessIds.length ? `detected ${harnessIds.map((id) => harnessNames[id] || id).join(', ')}` : 'no harness detected';
  logStep(2, 'Harness Profile Export', `${agentFiles.length} Taskard role files exported for ${installScope}; ${detectedText}; ${supportLabels.join('; ')}; live behavior not tested`);

  // 3. Configuration Setup
  const globalConfigPath = path.join(HOME, '.taskard', 'config.toml');
  const projectConfigPath = path.join(CWD, '.taskard', 'config.toml');
  const configTplPath = path.join(templatesSrc, 'config.toml');
  const configPath = isGlobal ? globalConfigPath : projectConfigPath;
  const existingConfigStat = lstatOrNull(configPath);
  if (existingConfigStat && (existingConfigStat.isSymbolicLink() || !existingConfigStat.isFile())) {
    throw new Error(`Refusing to modify user-owned config path: ${configPath}`);
  }
  let configContent;
  if (customConfig) {
    configContent = existingConfigStat && !force
      ? fs.readFileSync(configPath, 'utf8')
      : (isGlobal || force ? fs.readFileSync(configTplPath, 'utf8') : '# Project overrides for ~/.taskard/config.toml.\n');
    configContent = applyCustomConfig(configContent, customConfig);
  } else if (existingConfigStat && !force) {
    configContent = fs.readFileSync(configPath, 'utf8');
  } else if (isGlobal || force) {
    configContent = fs.readFileSync(configTplPath, 'utf8');
  } else {
    configContent = '# Project overrides for ~/.taskard/config.toml.\n';
  }
  validateConfig(parseSimpleToml(configContent), configPath);
  writeManagedFile(configPath, configContent, {
    base: scopeRoot,
    dryRun,
    force: force || Boolean(customConfig),
    replaceOnForce: true,
  });

  const activeGearValue = config.defaults?.default_mode || 'pro';
  const activeGear = activeGearValue === 'pro' ? 'Pro (Default)' : activeGearValue.charAt(0).toUpperCase() + activeGearValue.slice(1);
  const activeSafety = config.defaults?.permission_mode === 'default'
    ? 'default permission preference (harness-dependent)'
    : 'bypassPermissions preference (harness-dependent)';
  logStep(3, 'Configuration Layer', `${isGlobal ? '~/.taskard/config.toml (Global)' : '.taskard/config.toml (Project overrides)'}`);

  // 4. Optional upstream skills are resolved only when explicitly requested.
  const externalResolution = installSkills
    ? resolveOptionalSkills({ home: HOME, dryRun })
    : { status: 'Optional external skills unchanged; use --global --install-skills to resolve them', failures: [] };
  if (externalResolution.failures.length) {
    console.error(`Warning: core install will continue, but optional skill resolution failed: ${externalResolution.failures.join('; ')}`);
  }
  logStep(4, 'Optional External Skills', externalResolution.status);

  // 5. Directive Blocks Injection
  const directiveTpl = path.join(templatesSrc, 'directive-block.md');
  parseTaskardBlock(fs.readFileSync(directiveTpl, 'utf8'), directiveTpl);
  const targets = selectedNativePaths.directiveTargets;

  let injectedCount = 0;
  for (const t of targets) {
    if (syncDirectiveBlock(t, directiveTpl, { base: scopeRoot, dryRun })) injectedCount++;
  }
  logStep(5, 'Harness Directives', `Idempotent directive block synced across ${injectedCount} manifest files`);

  // Elapsed Time
  const duration = Date.now() - startTime;
  const durStr = duration <= 0 ? '<50ms' : `${duration}ms`;

  printRoleRoster();

  // Success Card
  const headerText = externalResolution.failures.length
    ? `TASKARD CORE INSTALLED · OPTIONAL SKILLS FAILED (${durStr})`
    : `TASKARD READY · SYNCHRONIZATION COMPLETE (${durStr})`;
  const headerVisLen = headerText.length;
  let padLen = 69 - headerVisLen;
  if (padLen < 0) padLen = 0;
  const pad = ' '.repeat(padLen);

  console.log(`  ${C.emerald}${C.bold}╭─────────────────────────────────────────────────────────────────────────╮${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.bold}${C.emerald}✨${C.reset}  ${C.bold}${headerText}${C.reset}${pad}  ${C.emerald}│${C.reset}`);
  console.log(`  ${C.emerald}${C.bold}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Speed Gear   :${C.reset} ${C.cyan}${C.bold}${activeGear}${C.reset} ${C.dim}· Fast · Max${C.reset}`);
  console.log(`  ${C.emerald}│${C.reset}  ${C.gray}• Permission Pref:${C.reset} ${C.amber}${C.bold}${activeSafety}${C.reset}`);
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
  console.log(`        ${C.bold}1)${C.reset} ${C.cyan}🚀 Pro${C.reset}     ${C.gray}(Default - bounded feature or fix; about 5-10m)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} ${C.amber}⚡ Fast${C.reset}    ${C.gray}(Low-risk, isolated change with a clear check; under a few minutes)${C.reset}`);
  console.log(`        ${C.bold}3)${C.reset} ${C.purple}🏛️ Max${C.reset}     ${C.gray}(High-risk, cross-boundary or parallel work; about 15-30m)${C.reset}`);
  const gearAns = (await question(`        ${C.bold}Selection [1-3] (1): ${C.reset}`)).trim() || '1';

  let selectedGear = 'pro';
  if (gearAns === '2' || gearAns.toLowerCase() === 'fast' || gearAns.toLowerCase() === 'nano') selectedGear = 'fast';
  else if (gearAns === '3' || gearAns.toLowerCase() === 'max' || gearAns.toLowerCase() === 'full') selectedGear = 'max';

  // 2. Primary Harness
  console.log(`\n  ${C.cyan}${C.bold}[2/3] Primary AI CLI Harness:${C.reset}`);
  console.log(`        ${C.bold}1)${C.reset} Claude Code    ${C.gray}(~/.claude, CLAUDE.md)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} OpenCode       ${C.gray}(~/.opencode, ~/.config/opencode)${C.reset}`);
  console.log(`        ${C.bold}3)${C.reset} Codex          ${C.gray}(~/.agents, ~/.codex)${C.reset}`);
  console.log(`        ${C.bold}4)${C.reset} Antigravity    ${C.gray}(~/.gemini, AGENTS.md)${C.reset}`);
  console.log(`        ${C.bold}5)${C.reset} Cursor         ${C.gray}(.cursorrules, AGENTS.md)${C.reset}`);
  const harnessAns = (await question(`        ${C.bold}Selection [1-5] (${defaultHarnessNum}): ${C.reset}`)).trim() || defaultHarnessNum;

  const harnessMap = { '1': 'claude-code', '2': 'opencode', '3': 'codex', '4': 'antigravity', '5': 'cursor' };
  const selectedHarness = harnessMap[harnessAns] || 'claude-code';

  // 3. Harness permission preference
  console.log(`\n  ${C.cyan}${C.bold}[3/3] Harness Permission Preference:${C.reset}`);
  console.log(`        ${C.bold}1)${C.reset} ${C.emerald}⚡ bypassPermissions${C.reset} ${C.gray}(Preference only; follow this harness's controls)${C.reset}`);
  console.log(`        ${C.bold}2)${C.reset} ${C.amber}🛡️ default${C.reset}            ${C.gray}(Use the harness's default permission behavior)${C.reset}`);
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
  const stat = fs.lstatSync(targetPath);
  if (!stat.isDirectory() || stat.isSymbolicLink()) return stat.size;
  return fs.readdirSync(targetPath).reduce((size, name) => size + getItemSize(path.join(targetPath, name)), 0);
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const LANE_STATUSES = ['ACTIVE', 'BLOCKED', 'DONE', 'DONE_WITH_CONCERNS', 'NEEDS_CONTEXT'];
const REVIEW_VERDICTS = ['FAIL', 'PASS', 'PASS_WITH_NOTES'];

function assertDirectoryScope(targetPath) {
  const stat = lstatOrNull(targetPath);
  if (!stat) return false;
  if (stat.isSymbolicLink()) throw new Error(`Refusing symlinked cleanup scope: ${targetPath}`);
  if (!stat.isDirectory()) throw new Error(`Cleanup scope is not a directory: ${targetPath}`);
  return true;
}

function readRegularFile(targetPath) {
  const stat = lstatOrNull(targetPath);
  if (!stat || stat.isSymbolicLink() || !stat.isFile()) return null;
  return fs.readFileSync(targetPath, 'utf8');
}

function hasSymlinkComponent(rootPath, relativePath) {
  let current = rootPath;
  for (const component of relativePath.split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    const stat = lstatOrNull(current);
    if (stat && stat.isSymbolicLink()) return true;
  }
  return false;
}

function exactField(content, key, allowedValues) {
  const pattern = new RegExp(`^${key}:\\s*([^\\r\\n]*?)\\s*$`);
  const matches = content.split(/\r?\n/).map((line) => line.match(pattern)).filter(Boolean);
  if (matches.length !== 1) return 'UNKNOWN';
  return allowedValues.includes(matches[0][1]) ? matches[0][1] : 'UNKNOWN';
}

function fieldAtPosition(content, key, allowedValues, position) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const line = position === 'last' ? lines[lines.length - 1] : lines[0];
  const match = line && line.match(new RegExp(`^${key}:\\s*([^\\r\\n]*?)\\s*$`));
  return match && allowedValues.includes(match[1]) ? match[1] : 'UNKNOWN';
}

function parseLaneState(lanePath) {
  const reportPath = path.join(lanePath, 'report.md');
  const report = readRegularFile(reportPath);
  let status = report === null ? (lstatOrNull(reportPath) ? 'UNKNOWN' : 'ACTIVE')
    : fieldAtPosition(report, 'STATUS', LANE_STATUSES, 'first');

  let verdict = 'Pending';
  try {
    const reviews = fs.readdirSync(lanePath).filter((name) => name.startsWith('review') && name.endsWith('.md'));
    if (reviews.length > 1 || (reviews.length === 1 && reviews[0] !== 'review.md')) {
      verdict = 'UNKNOWN';
    } else if (reviews.length === 1) {
      const review = readRegularFile(path.join(lanePath, 'review.md'));
      verdict = review === null ? 'UNKNOWN' : fieldAtPosition(review, 'VERDICT', REVIEW_VERDICTS, 'last');
    }
  } catch (_) {
    verdict = 'UNKNOWN';
  }

  if (verdict === 'FAIL') status = 'BLOCKED';
  else if (verdict === 'UNKNOWN' && (status === 'DONE' || status === 'DONE_WITH_CONCERNS')) status = 'UNKNOWN';

  return { status, verdict };
}

function isCompletedStatus(status) {
  return status === 'DONE' || status === 'DONE_WITH_CONCERNS';
}

function isCleanupEligible(state) {
  return isCompletedStatus(state.status) && state.verdict !== 'FAIL' && state.verdict !== 'UNKNOWN';
}

async function runClean(args) {
  printBanner();
  const dryRun = args.includes('--dry-run');
  const yesFlag = args.includes('--yes') || args.includes('-y') || args.includes('--force') || args.includes('-f');
  const cleanAll = args.includes('--all') || args.includes('-a');
  const purge = args.includes('--purge');
  const isGlobal = args.includes('--global') || args.includes('-g');
  const baseDir = path.join(isGlobal ? HOME : CWD, '.taskard');
  const displayBase = isGlobal ? '~/.taskard' : '.taskard';
  const lanesDir = path.join(baseDir, 'lanes');
  const tmpDir = path.join(baseDir, 'tmp');
  const diffsDir = path.join(baseDir, 'diffs');
  const archiveDir = path.join(baseDir, 'archive');
  const archiveLanesDir = path.join(archiveDir, 'lanes');
  const targets = [];
  if (!assertDirectoryScope(baseDir)) {
    console.log(`  ${C.violet}${C.bold}╭─────────────────────────── TASKARD WORKSPACE CLEANUP ───────────────────────────╮${C.reset}`);
    console.log(`  ${C.violet}│${C.reset}  ${C.bold}Target Scope:${C.reset} ${displayBase}${cleanAll ? ' (all live lanes, tmp, and diffs)' : ' (completed lanes only)'}`);
    console.log(`  ${C.violet}│${C.reset}  ${C.emerald}0 items${C.reset} · No completed lanes to archive; workspace is clean.`);
    console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}`);
    if (dryRun) console.log(`\n  ${C.amber}${C.bold}[DRY-RUN]${C.reset} ${C.gray}Simulation only. No items would be removed.${C.reset}`);
    console.log('');
    return true;
  }
  assertDirectoryScope(lanesDir);
  if (cleanAll) {
    assertDirectoryScope(tmpDir);
    assertDirectoryScope(diffsDir);
  }
  if (!cleanAll || purge) {
    assertDirectoryScope(archiveDir);
    assertDirectoryScope(archiveLanesDir);
  }

  const addTarget = (type, name, targetPath, isCompleted = false) => {
    const size = getItemSize(targetPath);
    const rel = path.relative(isGlobal ? HOME : CWD, targetPath);
    targets.push({ type, name, path: targetPath, relPath: isGlobal ? `~/${rel}` : (rel || `.taskard/${name}`), size, sizeStr: formatBytes(size), isCompleted });
  };

  if (purge && !cleanAll) {
    if (lstatOrNull(archiveLanesDir)) {
      for (const entry of fs.readdirSync(archiveLanesDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const lanePath = path.join(archiveLanesDir, entry.name);
        if (isCleanupEligible(parseLaneState(lanePath))) addTarget('archive', entry.name, lanePath, true);
      }
    }
  } else if (lstatOrNull(lanesDir)) {
    for (const entry of fs.readdirSync(lanesDir, { withFileTypes: true })) {
      if (!cleanAll && !entry.isDirectory()) continue;
      const lanePath = path.join(lanesDir, entry.name);
      if (entry.isSymbolicLink()) {
        if (cleanAll) addTarget('lane', entry.name, lanePath, false);
        continue;
      }
      const state = entry.isDirectory() ? parseLaneState(lanePath) : { status: 'UNKNOWN', verdict: 'UNKNOWN' };
      if (cleanAll || isCleanupEligible(state)) addTarget('lane', entry.name, lanePath, isCleanupEligible(state));
    }
  }

  if (cleanAll) {
    for (const [type, dir] of [['tmp', tmpDir], ['diff', diffsDir]]) {
      if (!lstatOrNull(dir)) continue;
      for (const name of fs.readdirSync(dir)) addTarget(type, name, path.join(dir, name));
    }
  }

  if (purge && cleanAll && lstatOrNull(archiveLanesDir)) {
    for (const entry of fs.readdirSync(archiveLanesDir, { withFileTypes: true })) {
      if (entry.isDirectory() || entry.isSymbolicLink()) addTarget('archive', entry.name, path.join(archiveLanesDir, entry.name));
    }
  }

  const totalBytes = targets.reduce((acc, t) => acc + t.size, 0);
  const totalSizeStr = formatBytes(totalBytes);
  const scopeStr = cleanAll ? (purge ? ' (all workspace items, including archive)' : ' (all live lanes, tmp, and diffs)')
    : purge ? ' (completed archive purge)' : ' (completed lanes, reversible archive)';

  console.log(`  ${C.violet}${C.bold}╭─────────────────────────── TASKARD WORKSPACE CLEANUP ───────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Target Scope:${C.reset} ${C.emerald}${displayBase}/${scopeStr}${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Items Found :${C.reset} ${targets.length === 0 ? `${C.emerald}0 items (Workspace is clean)${C.reset}` : `${C.amber}${targets.length} item(s)${C.reset} ${C.dim}(logical size: ${totalSizeStr})${C.reset}`}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);

  if (targets.length === 0) {
    console.log(`  ${C.emerald}✔${C.reset} ${C.gray}No eligible items found to clean in ${displayBase}/${C.reset}\n`);
    return true;
  }

  console.log(`  ${C.bold}Target Items (${targets.length}):${C.reset}`);
  for (const t of targets) {
    const tag = t.type === 'archive' ? ` ${C.amber}[ARCHIVE]${C.reset}` : t.isCompleted ? ` ${C.emerald}[DONE]${C.reset}` : '';
    console.log(`    ${C.rose}✖${C.reset} ${C.gray}${t.relPath}${C.reset} ${C.dim}(${t.sizeStr})${C.reset}${tag}`);
  }

  if (dryRun) {
    console.log(`\n  ${C.amber}${C.bold}[DRY-RUN]${C.reset} ${C.gray}Simulation only. ${targets.length} item(s) (${totalSizeStr}) would be archived or removed.${C.reset}\n`);
    return true;
  }

  if (!yesFlag) {
    const isInteractive = Boolean(process.stdout.isTTY && process.stdin.isTTY);
    if (!isInteractive) {
      throw new Error('Confirmation required in non-interactive mode. Use --yes (-y) or --force (-f) to clean.');
    }

    const action = cleanAll || purge ? 'permanently remove' : 'archive';
    const answer = await promptConfirm(`\n  ${C.amber}?${C.reset} ${C.bold}Are you sure you want to ${action} these ${targets.length} item(s) (${totalSizeStr})? [y/N] ${C.reset}`);
    if (answer !== 'y' && answer !== 'yes') {
      console.log(`\n  ${C.gray}✖ Cleanup aborted by user.${C.reset}\n`);
      return true;
    }
  }

  let deletedCount = 0;
  let archivedCount = 0;
  let freedBytes = 0;
  let failedCount = 0;
  for (const t of targets) {
    try {
      if (!lstatOrNull(t.path)) continue;
      if (t.type === 'lane' && !cleanAll && !purge) {
        fs.mkdirSync(archiveLanesDir, { recursive: true });
        assertDirectoryScope(archiveDir);
        assertDirectoryScope(archiveLanesDir);
        const archivedPath = path.join(archiveLanesDir, t.name);
        if (lstatOrNull(archivedPath)) throw new Error('archive destination already exists');
        fs.renameSync(t.path, archivedPath);
        archivedCount++;
      } else {
        fs.rmSync(t.path, { recursive: true, force: false });
        deletedCount++;
        freedBytes += t.size;
      }
    } catch (err) {
      console.error(`  ${C.rose}Failed to process ${t.relPath}: ${err.message}${C.reset}`);
      if (t.type !== 'lane' || cleanAll || purge) {
        try {
          const remaining = lstatOrNull(t.path) ? getItemSize(t.path) : 0;
          freedBytes += Math.max(0, t.size - remaining);
        } catch (_) {}
      }
      failedCount++;
    }
  }

  const summaryColor = failedCount ? C.rose : C.emerald;
  console.log(`\n  ${summaryColor}${failedCount ? '✖' : '✔'}${C.reset} ${C.bold}Cleanup ${failedCount ? 'finished with errors' : 'complete'}:${C.reset} ${C.emerald}${archivedCount} item(s) archived, ${deletedCount} removed${C.reset}, ${C.bold}${formatBytes(freedBytes)}${C.reset} ${C.gray}logical file bytes freed.${C.reset}${failedCount ? ` ${failedCount} item(s) failed.` : ''}\n`);
  if (failedCount) throw new Error(`Cleanup failed for ${failedCount} item(s)`);
  return true;
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
  let unknownCount = 0;

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

    const laneState = parseLaneState(lanePath);
    const status = laneState.status;
    let diffSummary = 'None';
    let attempts = '1';

    const reportContent = readRegularFile(reportPath);
    if (reportContent !== null) {
      const exactValue = (key) => {
        const pattern = new RegExp(`^${key}:\\s*([^\\r\\n]*?)\\s*$`);
        const matches = reportContent.split(/\r?\n/).map((line) => line.match(pattern)).filter(Boolean);
        return matches.length === 1 ? matches[0][1] : null;
      };
      diffSummary = exactValue('DIFF_SUMMARY') || 'None';
      const attemptsValue = exactValue('ATTEMPTS');
      attempts = attemptsValue && /^[1-9]\d*$/.test(attemptsValue) ? attemptsValue : '?';
    } else if (lstatOrNull(reportPath)) {
      attempts = '?';
    }

    const verdict = laneState.verdict;

    if (isCompletedStatus(status)) completedCount++;
    else if (status === 'BLOCKED') blockedCount++;
    else if (status === 'NEEDS_CONTEXT') needsContextCount++;
    else if (status === 'ACTIVE') activeCount++;
    else unknownCount++;

    if (showActive && isCompletedStatus(status)) continue;
    if (showCompleted && !isCompletedStatus(status)) continue;

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
      : lane.status === 'DONE_WITH_CONCERNS' ? `${C.amber}${C.bold}[DONE_WITH_CONCERNS]${C.reset}`
      : lane.status === 'BLOCKED' ? `${C.rose}${C.bold}[BLOCKED]${C.reset}`
      : lane.status === 'NEEDS_CONTEXT' ? `${C.amber}${C.bold}[NEEDS_CONTEXT]${C.reset}`
      : lane.status === 'UNKNOWN' ? `${C.rose}${C.bold}[UNKNOWN]${C.reset}`
      : `${C.cyan}${C.bold}[ACTIVE]${C.reset}`;

    const verdictColor = lane.verdict === 'PASS' ? C.emerald
      : lane.verdict === 'PASS_WITH_NOTES' ? C.amber
      : lane.verdict === 'FAIL' ? C.rose
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
  if (unknownCount > 0) summaryParts.push(`${C.rose}${C.bold}${unknownCount} unknown${C.reset}`);

  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Total Lanes :${C.reset} ${C.bold}${entries.length}${C.reset}  (${summaryParts.join(', ')})`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
}

const VALID_ROLES = ['debugger', 'explorer', 'implementer', 'planner', 'qa-tester', 'reviewer', 'ui-developer'];
const VERIFY_REPORT_FIELDS = ['STATUS', 'DIFF_SUMMARY', 'BASE_COMMIT', 'HEAD_COMMIT', 'ATTEMPTS', 'EVIDENCE_COMMAND', 'EVIDENCE_EXIT_STATUS', 'EVIDENCE_FILE', 'EVIDENCE_SHA256', 'HASH'];

function gitResult(cwd, args) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

function gitOutput(cwd, args) {
  const result = gitResult(cwd, args);
  if (result.status !== 0) throw new Error((result.stderr || 'git command failed').trim());
  return result.stdout.trim();
}

function gitSymlinkComponent(cwd, revision, relativePath) {
  let current = '';
  for (const component of relativePath.split('/').filter(Boolean)) {
    current = current ? `${current}/${component}` : component;
    const result = gitResult(cwd, ['--literal-pathspecs', 'ls-tree', '-z', revision, '--', current]);
    if (result.status !== 0) return { error: true };
    for (const entry of result.stdout.split('\0').filter(Boolean)) {
      const tab = entry.indexOf('\t');
      if (tab < 0 || entry.slice(tab + 1) !== current) continue;
      const mode = entry.slice(0, tab).split(' ')[0];
      if (mode === '120000') return { symlinkPath: current };
    }
  }
  return { symlinkPath: null };
}

function sectionBody(content, title) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${title}\\s*$`, 'i').test(line));
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end);
}

function oneMetadataValue(lines, key) {
  const pattern = new RegExp(`^${key}:\\s*([^\\r\\n]*?)\\s*$`);
  const matches = lines.map((line) => line.match(pattern)).filter(Boolean);
  return matches.length === 1 ? matches[0][1] : null;
}

function resolveCommit(cwd, value) {
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(value || '')) return null;
  try {
    const resolved = gitOutput(cwd, ['rev-parse', '--verify', `${value}^{commit}`]).toLowerCase();
    return resolved === value.toLowerCase() ? resolved : null;
  } catch (_) {
    return null;
  }
}

function isAncestor(cwd, ancestor, descendant) {
  return gitResult(cwd, ['merge-base', '--is-ancestor', ancestor, descendant]).status === 0;
}

function parseLaneBrief(brief, laneId, repoRoot, issues) {
  const headings = ['Objective', 'Context Files', 'Acceptance Criteria', 'Non-Goals', 'Lane Metadata'];
  const sections = {};
  for (const heading of headings) {
    sections[heading] = sectionBody(brief, heading);
    if (!sections[heading]) issues.push(`brief is missing ## ${heading}`);
    else if (!sections[heading].some((line) => line.trim())) issues.push(`brief ## ${heading} is empty`);
  }

  const metadataLines = sections['Lane Metadata'] || [];
  const keys = ['ROLE', 'GEAR', 'ATTEMPT_BUDGET', 'BASE_COMMIT', 'SOURCE_COMMIT', 'BLOCKED_BY', 'REQUIRES_REVIEW', 'REQUIRES_QA'];
  const indexes = keys.map((key) => metadataLines.findIndex((line) => line.startsWith(`${key}:`)));
  if (indexes.some((index) => index < 0) || indexes.some((index, i) => i > 0 && index <= indexes[i - 1])) {
    issues.push(`brief metadata fields must appear once in order: ${keys.join(', ')}`);
  }
  const metadata = Object.fromEntries(keys.map((key) => [key, oneMetadataValue(metadataLines, key)]));
  for (const key of keys) if (metadata[key] === null) issues.push(`brief metadata ${key} is missing or duplicated`);
  if (!VALID_ROLES.includes(metadata.ROLE)) issues.push(`invalid or missing ROLE: ${metadata.ROLE || 'missing'}`);
  if (!['FAST', 'PRO', 'MAX'].includes(metadata.GEAR)) issues.push(`invalid or missing GEAR: ${metadata.GEAR || 'missing'}`);
  const budget = Number(metadata.ATTEMPT_BUDGET);
  if (!/^[12]$/.test(metadata.ATTEMPT_BUDGET || '')) issues.push('ATTEMPT_BUDGET must be 1 or 2 total attempts');
  if (!['YES', 'NO'].includes(metadata.REQUIRES_REVIEW)) issues.push('REQUIRES_REVIEW must be YES or NO');
  if (!['YES', 'NO'].includes(metadata.REQUIRES_QA)) issues.push('REQUIRES_QA must be YES or NO');

  const baseCommit = resolveCommit(repoRoot, metadata.BASE_COMMIT);
  const sourceCommit = resolveCommit(repoRoot, metadata.SOURCE_COMMIT);
  if (!baseCommit) issues.push('BASE_COMMIT is missing or does not resolve to a commit');
  if (!sourceCommit) issues.push('SOURCE_COMMIT is missing or does not resolve to a commit');
  if (baseCommit && sourceCommit && !isAncestor(repoRoot, sourceCommit, baseCommit)) issues.push('SOURCE_COMMIT must be an ancestor of BASE_COMMIT');

  let blockedBy = [];
  if (metadata.BLOCKED_BY === 'NONE') {
    blockedBy = [];
  } else if (/^[A-Za-z0-9][A-Za-z0-9._-]*(?:\s*,\s*[A-Za-z0-9][A-Za-z0-9._-]*)*$/.test(metadata.BLOCKED_BY || '')) {
    blockedBy = metadata.BLOCKED_BY.split(',').map((value) => value.trim());
    if (new Set(blockedBy).size !== blockedBy.length) issues.push('BLOCKED_BY contains duplicate lane references');
    if (blockedBy.includes(laneId)) issues.push('BLOCKED_BY cannot reference its own lane');
  } else {
    issues.push('BLOCKED_BY must be NONE or comma-separated lane directory names');
  }

  const contextLines = sections['Context Files'] || [];
  const pointerPattern = /^\s*[-*]\s+`?([^`\s]+)`?#L(\d+)-L(\d+)(?:\s+\(symbol:\s*[^)]+\))?\s*$/;
  const pointers = [];
  for (const line of contextLines) {
    if (!line.trim()) continue;
    const match = line.match(pointerPattern);
    if (!match) {
      issues.push(`invalid Context Files pointer: ${line.trim()}`);
      continue;
    }
    const [, fileName, startText, endText] = match;
    const start = Number(startText);
    const end = Number(endText);
    const resolvedPath = path.resolve(repoRoot, fileName);
    const relativePath = path.relative(repoRoot, resolvedPath);
    if (path.isAbsolute(fileName) || relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) {
      issues.push(`pointer escapes repository scope: ${fileName}`);
      continue;
    }
    if (!start || end < start) {
      issues.push(`invalid line range for ${fileName}`);
      continue;
    }
    pointers.push({ fileName: relativePath.split(path.sep).join('/'), start, end, sourceCommit, baseCommit });
  }
  if (!pointers.length) issues.push('brief needs at least one scoped Context Files pointer');
  for (const pointer of pointers) {
    if (!pointer.sourceCommit || !pointer.baseCommit) continue;
    const symlink = gitSymlinkComponent(repoRoot, pointer.sourceCommit, pointer.fileName);
    if (symlink.error) {
      issues.push(`could not inspect SOURCE_COMMIT pointer path: ${pointer.fileName}`);
      continue;
    }
    if (symlink.symlinkPath) {
      issues.push(`pointer traverses a Git symlink at SOURCE_COMMIT: ${symlink.symlinkPath}`);
      continue;
    }
    if (hasSymlinkComponent(repoRoot, pointer.fileName)) {
      issues.push(`pointer traverses a symlink path component in the working tree: ${pointer.fileName}`);
      continue;
    }
    const blob = gitResult(repoRoot, ['show', `${pointer.sourceCommit}:${pointer.fileName}`]);
    if (blob.status !== 0) {
      issues.push(`pointer missing at SOURCE_COMMIT: ${pointer.fileName}`);
      continue;
    }
    const sourceLines = blob.stdout.split(/\r?\n/);
    if (sourceLines[sourceLines.length - 1] === '') sourceLines.pop();
    if (pointer.end > sourceLines.length) issues.push(`pointer line range exceeds SOURCE_COMMIT file: ${pointer.fileName}`);
    const stale = gitResult(repoRoot, ['diff', '--quiet', pointer.sourceCommit, pointer.baseCommit, '--', pointer.fileName]);
    if (stale.status === 1) issues.push(`stale context: ${pointer.fileName} changed between SOURCE_COMMIT and BASE_COMMIT`);
    else if (stale.status !== 0) issues.push(`could not compare pointer revisions for ${pointer.fileName}`);
    const working = gitResult(repoRoot, ['diff', '--quiet', 'HEAD', '--', pointer.fileName]);
    if (working.status === 1) issues.push(`stale evidence: pointed file has uncommitted changes: ${pointer.fileName}`);
    else if (working.status !== 0) issues.push(`could not compare pointed file with HEAD: ${pointer.fileName}`);
  }
  return { metadata, budget, baseCommit, sourceCommit, blockedBy };
}

function validateLaneReport(lanePath, metadata, budget, headCommit, repoRoot, issues) {
  const report = readRegularFile(path.join(lanePath, 'report.md'));
  if (report === null) {
    issues.push('report.md is missing or is not a regular file');
    return;
  }
  const lines = report.split(/\r?\n/);
  if (lines.filter(Boolean).length > 15) issues.push('report.md must stay within 15 nonempty lines');
  for (const key of VERIFY_REPORT_FIELDS) {
    if (lines.filter((line) => line.startsWith(`${key}:`)).length !== 1) issues.push(`report field ${key} must appear exactly once`);
  }
  const ordered = lines.slice(0, VERIFY_REPORT_FIELDS.length).map((line) => line.match(/^([A-Z0-9_]+):\s*(.*?)\s*$/));
  const actualOrder = ordered.map((match) => match && match[1]);
  if (actualOrder.some((key, index) => key !== VERIFY_REPORT_FIELDS[index])) issues.push(`report fields must appear in order: ${VERIFY_REPORT_FIELDS.join(', ')}`);
  const fields = Object.fromEntries(ordered.filter(Boolean).map((match) => [match[1], match[2]]));
  for (const key of VERIFY_REPORT_FIELDS) if (!fields[key]) issues.push(`report field ${key} is empty or misplaced`);
  if (!['DONE', 'DONE_WITH_CONCERNS', 'BLOCKED', 'NEEDS_CONTEXT', 'ACTIVE'].includes(fields.STATUS)) issues.push(`invalid report STATUS: ${fields.STATUS || 'missing'}`);
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(fields.BASE_COMMIT || '')) issues.push('report BASE_COMMIT is invalid');
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(fields.HEAD_COMMIT || '')) issues.push('report HEAD_COMMIT is invalid');
  if (fields.BASE_COMMIT && fields.BASE_COMMIT.toLowerCase() !== String(metadata.BASE_COMMIT).toLowerCase()) issues.push('report BASE_COMMIT does not match brief metadata');
  if (fields.HEAD_COMMIT && fields.HEAD_COMMIT.toLowerCase() !== headCommit) issues.push('stale report: HEAD_COMMIT does not match current Git HEAD');
  if (fields.BASE_COMMIT) {
    const resolvedBase = resolveCommit(repoRoot, fields.BASE_COMMIT);
    if (!resolvedBase) issues.push('report BASE_COMMIT does not resolve to a commit');
    else if (!isAncestor(repoRoot, resolvedBase, headCommit)) issues.push('report BASE_COMMIT is not an ancestor of current HEAD');
  }
  const attempts = Number(fields.ATTEMPTS);
  if (!/^[1-9]\d*$/.test(fields.ATTEMPTS || '') || attempts > budget || attempts > 2) issues.push(`ATTEMPTS must be 1..${Number.isFinite(budget) ? budget : 2}`);
  if (!/^0$/.test(fields.EVIDENCE_EXIT_STATUS || '')) issues.push('EVIDENCE_EXIT_STATUS must be 0 for a passing report');
  if (!/^[a-f0-9]{64}$/i.test(fields.EVIDENCE_SHA256 || '')) issues.push('EVIDENCE_SHA256 must be a 64-digit SHA-256');
  if (fields.HASH !== 'N/A' && fields.HASH && fields.HASH.toLowerCase() !== String(fields.HEAD_COMMIT).toLowerCase()) issues.push('HASH must be N/A or match HEAD_COMMIT');

  if (fields.EVIDENCE_FILE) {
    const evidencePath = path.resolve(lanePath, fields.EVIDENCE_FILE);
    const relative = path.relative(lanePath, evidencePath);
    if (path.isAbsolute(fields.EVIDENCE_FILE) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
      issues.push('EVIDENCE_FILE must stay inside the lane directory');
    } else if (hasSymlinkComponent(lanePath, relative)) {
      issues.push('EVIDENCE_FILE cannot traverse a symlink');
    } else {
      const stat = lstatOrNull(evidencePath);
      if (!stat || stat.isSymbolicLink() || !stat.isFile()) {
        issues.push('EVIDENCE_FILE is missing or not a regular file');
      } else if (/^[a-f0-9]{64}$/i.test(fields.EVIDENCE_SHA256 || '')) {
        const digest = crypto.createHash('sha256').update(fs.readFileSync(evidencePath)).digest('hex');
        if (digest !== fields.EVIDENCE_SHA256.toLowerCase()) issues.push('stale evidence: EVIDENCE_SHA256 does not match EVIDENCE_FILE');
      }
    }
  }
  if (!fields.EVIDENCE_COMMAND || !fields.EVIDENCE_COMMAND.trim()) issues.push('EVIDENCE_COMMAND must be nonempty');
  if (['BLOCKED', 'NEEDS_CONTEXT', 'ACTIVE'].includes(fields.STATUS)) issues.push(`lane report status is incomplete: ${fields.STATUS}`);
}

function runVerify(args) {
  printBanner();
  const isGlobal = args.includes('--global') || args.includes('-g');
  const baseDir = path.join(isGlobal ? HOME : CWD, '.taskard');
  const lanesDir = path.join(baseDir, 'lanes');
  let repoRoot;
  let headCommit;
  try {
    repoRoot = gitOutput(CWD, ['rev-parse', '--show-toplevel']);
    headCommit = gitOutput(repoRoot, ['rev-parse', 'HEAD']).toLowerCase();
  } catch (_) {
    console.error(`  ${C.rose}FAIL${C.reset} verify requires a Git working tree.`);
    return false;
  }
  if (!assertDirectoryScope(baseDir)) {
    console.log('  No Taskard workspace found to verify.');
    return true;
  }
  assertDirectoryScope(lanesDir);
  if (!lstatOrNull(lanesDir)) {
    console.log('  No Taskard lanes found to verify.');
    return true;
  }

  const lanes = [];
  const scopeIssues = [];
  for (const entry of fs.readdirSync(lanesDir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) {
      scopeIssues.push(`${entry.name}: symlinked lane entry is not verified`);
      continue;
    }
    if (!entry.isDirectory()) continue;
    const lanePath = path.join(lanesDir, entry.name);
    const issues = [];
    const brief = readRegularFile(path.join(lanePath, 'brief.md'));
    if (brief === null) {
      lanes.push({ id: entry.name, path: lanePath, issues: ['brief.md is missing or is not a regular file'], blockedBy: [] });
      continue;
    }
    const parsed = parseLaneBrief(brief, entry.name, repoRoot, issues);
    if (parsed.baseCommit && !isAncestor(repoRoot, parsed.baseCommit, headCommit)) issues.push('brief BASE_COMMIT is not an ancestor of current HEAD');
    if (parsed.sourceCommit && !isAncestor(repoRoot, parsed.sourceCommit, headCommit)) issues.push('brief SOURCE_COMMIT is not an ancestor of current HEAD');
    validateLaneReport(lanePath, parsed.metadata, parsed.budget, headCommit, repoRoot, issues);
    const state = parseLaneState(lanePath);
    if (state.verdict === 'FAIL') issues.push('review verdict is FAIL');
    else if (state.verdict === 'UNKNOWN') issues.push('review verdict is missing or invalid');
    if (parsed.metadata.REQUIRES_REVIEW === 'YES' && !['PASS', 'PASS_WITH_NOTES'].includes(state.verdict)) issues.push('brief requires a passing review verdict');
    if (parsed.metadata.REQUIRES_QA === 'YES') {
      const qa = readRegularFile(path.join(lanePath, 'verification.md'));
      const status = qa === null ? 'UNKNOWN' : exactField(qa, 'STATUS', ['VERIFIED', 'VERIFIED_WITH_GAPS', 'FAILED']);
      if (status !== 'VERIFIED') issues.push(`brief requires QA STATUS: VERIFIED (found ${status})`);
    }
    lanes.push({ id: entry.name, path: lanePath, issues, blockedBy: parsed.blockedBy });
  }

  const laneIds = new Set(lanes.map((lane) => lane.id));
  for (const lane of lanes) for (const dependency of lane.blockedBy) {
    if (!laneIds.has(dependency)) lane.issues.push(`BLOCKED_BY references missing lane: ${dependency}`);
  }
  const graph = new Map(lanes.map((lane) => [lane.id, lane.blockedBy.filter((dependency) => laneIds.has(dependency))]));
  const visiting = new Set();
  const visited = new Set();
  const cycleIds = new Set();
  function visit(id, trail = []) {
    if (visiting.has(id)) {
      const start = trail.indexOf(id);
      for (const cycleId of trail.slice(start < 0 ? 0 : start)) cycleIds.add(cycleId);
      cycleIds.add(id);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of graph.get(id) || []) visit(dependency, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const lane of lanes) visit(lane.id);
  for (const id of cycleIds) {
    const lane = lanes.find((item) => item.id === id);
    if (lane) lane.issues.push('BLOCKED_BY dependency cycle detected');
  }

  let failed = scopeIssues.length;
  for (const lane of lanes) {
    if (lane.issues.length) {
      failed++;
      for (const issue of lane.issues) console.error(`  ${C.rose}FAIL${C.reset} ${lane.id}: ${issue}`);
    } else {
      console.log(`  ${C.emerald}PASS${C.reset} ${lane.id}: metadata and evidence checks passed`);
    }
  }
  for (const issue of scopeIssues) console.error(`  ${C.rose}FAIL${C.reset} ${issue}`);
  console.log(`\n  ${lanes.length} lane(s) checked; ${failed} lane issue(s). Verify checks evidence metadata and does not authenticate that commands ran.`);
  return failed === 0;
}

function runDoctor(args) {
  printBanner();
  console.log(`  ${C.violet}${C.bold}╭─────────────────────────── TASKARD SYSTEM DOCTOR ───────────────────────────╮${C.reset}`);
  console.log(`  ${C.violet}│${C.reset}  ${C.bold}Diagnostic health inspection for multi-harness agent environment${C.reset}`);
  console.log(`  ${C.violet}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
  let passed = 0;
  let failed = 0;
  const report = (step, title, ok, detail) => {
    console.log(`  ${C.cyan}${C.bold}[${step}/5]${C.reset} ${C.bold}${title}${C.reset}`);
    console.log(`        ${ok ? `${C.emerald}✔` : `${C.rose}✖`}${C.reset} ${C.gray}${detail}${C.reset}`);
    if (ok) passed++;
    else failed++;
  };

  let effective;
  let configError = '';
  try {
    effective = loadEffectiveConfig();
  } catch (error) {
    configError = error.message;
  }
  const config = effective?.config || {};
  const detectedIds = detectHarnessIds();
  const selectedHarness = selectHarness(config, detectedIds);
  const displayNames = { 'claude-code': 'Claude Code', opencode: 'OpenCode', codex: 'Codex / OpenAgent', antigravity: 'Antigravity', cursor: 'Cursor' };
  const installedRoots = [CWD, HOME].filter((root, index, all) => all.indexOf(root) === index)
    .filter((root) => fs.existsSync(path.join(root, '.taskard', 'skills', 'taskard', 'SKILL.md')));
  const scopeRoot = installedRoots[0] || CWD;
  const installScope = scopeRoot === HOME ? 'user' : 'project';
  let profiles = {};
  let profileError = '';
  try { profiles = readHarnessProfiles(); } catch (error) { profileError = error.message; }
  const selectedProfile = profiles[selectedHarness];
  const scopeSupported = Boolean(selectedProfile?.installScope?.includes(installScope));
  const nativePaths = resolveHarnessPaths(selectedHarness, scopeRoot, installScope);

  report(1, 'Harness Detection', Boolean(selectedHarness && selectedProfile && scopeSupported), selectedHarness
    ? `${profileError || `Selected ${displayNames[selectedHarness] || selectedHarness} (${installScope} install scope)`}${selectedProfile && !scopeSupported ? `; ${selectedHarness} does not support this scope` : ''}`
    : 'No harness integration is installed; package source alone is uninstalled');

  let skillLink = '';
  let roleDirectory = '';
  let expectedRoleDirectory = '';
  if (selectedHarness === 'claude-code') {
    skillLink = path.join(scopeRoot, '.claude', 'skills', 'taskard');
    roleDirectory = nativePaths.roleDirectory;
    expectedRoleDirectory = path.join(scopeRoot, '.taskard', 'claude-agents');
  } else if (selectedHarness === 'opencode') {
    skillLink = path.join(scopeRoot, '.agents', 'skills', 'taskard');
    roleDirectory = nativePaths.roleDirectory;
    expectedRoleDirectory = path.join(scopeRoot, '.taskard', 'opencode-agents');
  } else if (selectedHarness) {
    skillLink = path.join(scopeRoot, '.agents', 'skills', 'taskard');
  }
  const expectedSkill = path.join(scopeRoot, '.taskard', 'skills', 'taskard');
  let skillHealthy = false;
  try {
    const stat = lstatOrNull(skillLink);
    skillHealthy = Boolean(stat?.isSymbolicLink() && fs.realpathSync(skillLink) === fs.realpathSync(expectedSkill)
      && fs.existsSync(path.join(skillLink, 'SKILL.md')));
  } catch (_) {}
  report(2, 'Installed Skill Bridge', Boolean(selectedHarness && skillHealthy), skillHealthy
    ? `Verified ${path.relative(scopeRoot, skillLink)}`
    : selectedHarness ? `Required skill bridge is missing or broken: ${skillLink}` : 'Uninstalled; no required skill bridge can be checked');

  let roleHealthy = Boolean(selectedProfile && selectedProfile.capabilities?.subagents !== 'native') && !nativePaths.issue;
  let validRoles = 0;
  if (selectedHarness && selectedProfile?.capabilities?.subagents === 'native' && scopeSupported && !nativePaths.issue) {
    for (const role of ROLE_NAMES) {
      const target = path.join(roleDirectory, `${role}.md`);
      const expected = path.join(expectedRoleDirectory, `${role}.md`);
      try {
        const stat = lstatOrNull(target);
        if (!stat?.isSymbolicLink() || fs.realpathSync(target) !== fs.realpathSync(expected)) continue;
        const content = fs.readFileSync(target, 'utf8');
        const { lines } = parseAgentFrontmatter(content, target);
        if (!lines.some((line) => line === `name: ${role}`)) continue;
        if (selectedHarness === 'opencode' && !lines.includes('mode: subagent')) continue;
        if (selectedProfile.readOnlyRoles?.includes(role)) {
          const readOnly = selectedProfile.readOnly;
          if (readOnly.nativeField === 'tools' && !readOnly.allow.every((tool) => content.includes(`  - ${tool}`))) continue;
          if (readOnly.nativeField === 'permission' && !Object.entries(readOnly.rules).every(([tool, action]) => content.includes(`  ${tool === '*' ? '"*"' : tool}: ${action}`))) continue;
        }
        validRoles++;
      } catch (_) {}
    }
    roleHealthy = validRoles === ROLE_NAMES.length;
  }
  report(3, 'Installed Role Bridge', roleHealthy, roleHealthy
    ? selectedProfile?.capabilities?.subagents === 'native'
      ? `Verified all ${ROLE_NAMES.length} ${displayNames[selectedHarness] || selectedHarness} role links and native restrictions`
      : `${displayNames[selectedHarness] || selectedHarness} uses ${selectedProfile?.capabilities?.subagents || 'declared'} role instructions`
    : nativePaths.issue || (selectedHarness ? `${validRoles}/${ROLE_NAMES.length} required role definitions are valid under ${roleDirectory}` : 'Uninstalled; package roles are not an installed bridge'));

  const configHealthy = !configError && Boolean(effective);
  report(4, 'Effective Configuration', configHealthy, configHealthy
    ? `${effective.source}; speed=${config.defaults?.default_mode || 'pro'}, permission=${config.defaults?.permission_mode || 'bypassPermissions'}`
    : `Invalid effective configuration: ${configError || 'no valid configuration source'}`);

  const directiveTargets = nativePaths.directiveTargets;
  let directiveHealthy = Boolean(directiveTargets.length) && !nativePaths.issue;
  const templateBlock = parseTaskardBlock(fs.readFileSync(path.join(PKG_ROOT, 'templates', 'directive-block.md'), 'utf8'), 'directive template');
  for (const target of nativePaths.issue ? [] : directiveTargets) {
    try {
      const installedBlock = parseTaskardBlock(fs.readFileSync(target, 'utf8'), target);
      if (installedBlock.version !== templateBlock.version || installedBlock.block !== templateBlock.block) directiveHealthy = false;
    } catch (_) { directiveHealthy = false; }
  }
  report(5, 'Versioned Directive Blocks', directiveHealthy, directiveHealthy
    ? `Verified taskard:v${templateBlock.version} block${directiveTargets.length === 1 ? '' : 's'} in ${directiveTargets.map((target) => path.relative(scopeRoot, target)).join(', ')}`
    : nativePaths.issue || (selectedHarness ? `Required versioned directive block is missing or stale: ${directiveTargets.join(', ')}` : 'Uninstalled; no harness directives are active'));

  const healthy = failed === 0;
  const statusLabel = healthy ? 'Healthy · installed bridge verified' : selectedHarness ? 'Unhealthy · required integration is missing or invalid' : 'Uninstalled · run taskard init to create a harness bridge';
  const statusColor = healthy ? C.emerald : C.rose;
  console.log(`\n  ${statusColor}${C.bold}╭───────────────────────────── DIAGNOSTICS SUMMARY ────────────────────────────╮${C.reset}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Status        :${C.reset} ${statusColor}${C.bold}${statusLabel}${C.reset}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Checks passed :${C.reset} ${C.bold}${passed} / 5${C.reset} ${failed ? `${C.rose}(${failed} failed)${C.reset}` : ''}`);
  console.log(`  ${statusColor}│${C.reset}  ${C.bold}Harness       :${C.reset} ${displayNames[selectedHarness] || 'none detected'}`);
  console.log(`  ${statusColor}${C.bold}╰─────────────────────────────────────────────────────────────────────────╯${C.reset}\n`);
  return healthy;
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
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.violet}[DEFAULTS & AGENT-READ PREFERENCES]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Speed Gear         :${C.reset} ${C.bold}${C.cyan}${defaults.default_mode || 'pro'}${C.reset} ${C.dim}[fast | pro | max]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Permission Pref    :${C.reset} ${C.bold}${defaults.permission_mode || 'bypassPermissions'}${C.reset} ${C.dim}(harness-dependent)${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Circuit Breaker    :${C.reset} ${C.amber}${C.bold}2-Strike${C.reset} ${C.gray}(max_attempts = ${defaults.max_attempts ?? 2})${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Report Max Lines   :${C.reset} ${defaults.report_max_lines ?? 15} lines ${C.dim}(strict contract)${C.reset}`);
  if (defaults.budget_minutes) {
    console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Budget Ceiling     :${C.reset} ${defaults.budget_minutes} minutes`);
  }
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.purple}${C.bold}[ROLE DEFAULTS & MODEL TIERS]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.purple}${C.bold}Strategy (Tier 1)${C.reset}   : planner default -> ${C.bold}${roles.planner || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         reviewer_max default -> ${C.bold}${roles.reviewer_max || roles.reviewer_full || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         debugger_max default -> ${C.bold}${roles.debugger_max || roles.debugger_full || 'opus'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.blue}${C.bold}Execution (Tier 2)${C.reset}  : implementer default -> ${C.bold}${roles.implementer || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         ui-developer default -> ${C.bold}${roles['ui-developer'] || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         reviewer default -> ${C.bold}${roles.reviewer || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         debugger default -> ${C.bold}${roles.debugger || 'sonnet'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.emerald}${C.bold}Assist (Tier 3)${C.reset}     : explorer default -> ${C.bold}${roles.explorer || 'haiku'}${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}                         qa-tester default -> ${C.bold}${roles['qa-tester'] || 'haiku'}${C.reset}`);
  for (const [harness, label] of [['claude_code', 'Claude Code'], ['opencode', 'OpenCode']]) {
    for (const [role, model] of Object.entries(config.harness_preferences?.models?.[harness] || {})) {
      console.log(`  ${C.cyan}│${C.reset}                         ${label} ${role} override -> ${C.bold}${model}${C.reset}`);
    }
  }
  const disabledStr = Array.isArray(roles.disabled) && roles.disabled.length > 0 ? roles.disabled.join(', ') : 'None';
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Disabled Roles     :${C.reset} ${disabledStr}`);
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.rose}[RISKY OPERATION PATTERNS (AGENT-READ)]${C.reset}`);
  const patternsList = Array.isArray(risky.patterns) ? risky.patterns.join(', ') : 'migration, deploy, rm -rf, drop table, git push --force';
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• Patterns           :${C.reset} ${C.rose}${patternsList}${C.reset}`);
  console.log(`  ${C.cyan}├─────────────────────────────────────────────────────────────────────────┤${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.bold}${C.emerald}[QA PREFERENCES (AGENT-READ)]${C.reset}`);
  console.log(`  ${C.cyan}│${C.reset}  ${C.gray}• QA Preference      :${C.reset} ${qa.enabled ? `${C.emerald}true${C.reset}` : `${C.dim}false (default OFF)${C.reset}`}`);
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
    process.exitCode = runDoctor(args) ? 0 : 1;
    return;
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

  if (command === 'verify') {
    process.exit(runVerify(args) ? 0 : 1);
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
