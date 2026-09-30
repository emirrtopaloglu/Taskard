#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'taskard.js');
const roles = ['implementer', 'reviewer', 'planner', 'debugger', 'ui-developer', 'explorer', 'qa-tester'];
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'taskard-install-test-'));
const tmpBin = path.join(tempRoot, 'bin');
const npxLog = path.join(tempRoot, 'npx.log');
fs.mkdirSync(tmpBin, { recursive: true });
fs.writeFileSync(path.join(tmpBin, 'npx'), `#!/bin/sh
printf '%s|CI=%s\\n' "$*" "$CI" >> "$TASKARD_NPX_LOG"
if [ "$TASKARD_NPX_FAIL" = "1" ]; then exit 17; fi
case "$*" in
  *obra/superpowers*) mkdir -p "$HOME/.agents/skills/using-superpowers" ;;
  *mattpocock/skills*) mkdir -p "$HOME/.agents/skills/grilling" ;;
esac
exit 0
`, { mode: 0o755 });

function fixture(name) {
  const root = path.join(tempRoot, name);
  const home = path.join(root, 'home');
  const cwd = path.join(root, 'project');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(cwd, { recursive: true });
  return { root, home, cwd };
}

function run(command, args, { home, cwd, env = {} }) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      PATH: `${tmpBin}${path.delimiter}${process.env.PATH || ''}`,
      TASKARD_NPX_LOG: npxLog,
      ...env,
    },
  });
}

function cli(args, options) {
  return run(process.execPath, [CLI, ...args], options);
}

function mustSucceed(result, label) {
  assert.equal(result.status, 0, `${label}: ${result.stderr || result.stdout}`);
}

function mustFail(result, label) {
  assert.notEqual(result.status, 0, `${label} unexpectedly succeeded`);
}

try {
  const local = fixture('local');
  mustSucceed(cli(['init'], local), 'local init');
  assert.ok(fs.existsSync(path.join(local.cwd, '.taskard', 'config.toml')));
  assert.ok(!fs.existsSync(path.join(local.home, '.taskard')));
  assert.ok(!fs.existsSync(path.join(local.home, '.claude')));
  assert.ok(fs.lstatSync(path.join(local.cwd, '.claude', 'skills', 'taskard')).isSymbolicLink());
  assert.ok(fs.lstatSync(path.join(local.cwd, '.agents', 'skills', 'taskard')).isSymbolicLink());
  for (const role of roles) {
    assert.ok(fs.lstatSync(path.join(local.cwd, '.claude', 'agents', `${role}.md`)).isSymbolicLink(), `missing local ${role} link`);
  }
  const localConfig = path.join(local.cwd, '.taskard', 'config.toml');
  fs.appendFileSync(localConfig, '\n# user change\n');
  mustSucceed(cli(['init'], local), 'repeat local init');
  assert.match(fs.readFileSync(localConfig, 'utf8'), /# user change/);

  const global = fixture('global');
  const globalInstall = cli(['init', '--global'], global);
  mustSucceed(globalInstall, 'fresh global init');
  assert.match(globalInstall.stdout, /Harness Profile Export/);
  assert.match(globalInstall.stdout, /live behavior not tested/);
  const globalConfig = path.join(global.home, '.taskard', 'config.toml');
  assert.ok(fs.lstatSync(path.join(global.home, '.claude', 'skills', 'taskard')).isSymbolicLink());
  assert.ok(fs.lstatSync(path.join(global.home, '.agents', 'skills', 'taskard')).isSymbolicLink());
  for (const role of roles) {
    assert.ok(fs.lstatSync(path.join(global.home, '.claude', 'agents', `${role}.md`)).isSymbolicLink(), `missing global ${role} link`);
  }
  const globalOpenCodeReviewer = fs.readFileSync(path.join(global.home, '.config', 'opencode', 'agents', 'reviewer.md'), 'utf8');
  assert.match(globalOpenCodeReviewer, /^mode: subagent$/m);
  assert.doesNotMatch(globalOpenCodeReviewer, /^model:/m);
  assert.match(globalOpenCodeReviewer, /^  "\*": deny$/m);
  assert.doesNotMatch(globalOpenCodeReviewer, /^  bash: allow$/m);
  const globalClaudeReviewer = fs.readFileSync(path.join(global.home, '.claude', 'agents', 'reviewer.md'), 'utf8');
  assert.match(globalClaudeReviewer, /^  - Read$/m);
  assert.doesNotMatch(globalClaudeReviewer, /^  - Bash$/m);
  mustSucceed(cli(['init', '--global'], global), 'repeat global init');
  fs.appendFileSync(globalConfig, '\n# preserve me\n');
  mustSucceed(cli(['init', '--global'], global), 'preserve global config by default');
  assert.match(fs.readFileSync(globalConfig, 'utf8'), /# preserve me/);
  const installedDoctor = cli(['doctor'], global);
  mustSucceed(installedDoctor, 'installed doctor');
  assert.match(installedDoctor.stdout, /Healthy · installed bridge verified/);
  mustSucceed(cli(['init', '--global', '--force'], global), 'force documented defaults');
  assert.doesNotMatch(fs.readFileSync(globalConfig, 'utf8'), /# preserve me/);

  const mapped = fixture('model-mapping');
  fs.mkdirSync(path.join(mapped.home, '.taskard'), { recursive: true });
  fs.writeFileSync(path.join(mapped.home, '.taskard', 'config.toml'), '[harness_preferences.models.opencode]\nreviewer = "anthropic/claude-sonnet-4-6"\n');
  mustSucceed(cli(['init', '--global'], mapped), 'install explicit OpenCode model mapping');
  assert.match(fs.readFileSync(path.join(mapped.home, '.config', 'opencode', 'agents', 'reviewer.md'), 'utf8'), /^model: anthropic\/claude-sonnet-4-6$/m);
  assert.equal(fs.existsSync(npxLog), false, 'installer must not invoke optional skill resolution non-interactively');

  const drySkills = fixture('dry-skills');
  const drySkillsInstall = cli(['init', '--global', '--install-skills', '--dry-run'], drySkills);
  mustSucceed(drySkillsInstall, 'dry-run optional skill preview');
  assert.match(drySkillsInstall.stdout, /Dry run: would resolve .*no network request was made/);
  assert.equal(fs.existsSync(npxLog), false, 'dry run must not invoke npx');
  assert.equal(fs.existsSync(path.join(drySkills.home, '.taskard')), false, 'dry run must not write user files');

  const localSkills = fixture('local-skills');
  const localSkillsInstall = cli(['init', '--install-skills'], localSkills);
  mustFail(localSkillsInstall, 'local install must reject global skill resolution');
  assert.match(localSkillsInstall.stderr, /--install-skills requires --global/);
  assert.equal(fs.existsSync(path.join(localSkills.cwd, '.taskard')), false, 'rejected local skill resolution must not partially install');

  const skills = fixture('optional-skills');
  mustSucceed(cli(['init', '--global', '--install-skills'], skills), 'opt-in optional skill resolution');
  const skillsCalls = fs.readFileSync(npxLog, 'utf8').trim().split(/\r?\n/);
  assert.equal(skillsCalls.length, 2, 'only missing optional skill packages should be requested');
  assert.ok(skillsCalls.every((call) => call.includes('-g -y') && call.endsWith('|CI=1')), 'resolver calls must be global and non-interactive');
  assert.ok(skillsCalls.some((call) => call.includes('--skill using-superpowers')));
  assert.ok(skillsCalls.some((call) => call.includes('--skill grilling')));
  mustSucceed(cli(['init', '--global', '--install-skills'], skills), 'repeat optional skill resolution');
  assert.equal(fs.readFileSync(npxLog, 'utf8').trim().split(/\r?\n/).length, 2, 'repeat install must not request already installed skills');

  const failedSkills = fixture('optional-skills-fail');
  const failedSkillsInstall = cli(['init', '--global', '--install-skills'], { ...failedSkills, env: { TASKARD_NPX_FAIL: '1' } });
  mustSucceed(failedSkillsInstall, 'core install reports optional skill failure without hiding it');
  assert.match(failedSkillsInstall.stderr, /optional skill resolution failed/i);
  assert.match(failedSkillsInstall.stdout, /CORE INSTALLED.*OPTIONAL SKILLS FAILED/i);
  assert.doesNotMatch(failedSkillsInstall.stdout, /TASKARD READY/);
  assert.ok(fs.existsSync(path.join(failedSkills.home, '.taskard', 'config.toml')), 'core install should complete when optional resolution fails');

  const conflict = fixture('conflict');
  const userRole = path.join(conflict.home, '.claude', 'agents', 'reviewer.md');
  fs.mkdirSync(path.dirname(userRole), { recursive: true });
  fs.writeFileSync(userRole, 'user-owned role');
  mustFail(cli(['init', '--global'], conflict), 'role conflict without force');
  assert.equal(fs.readFileSync(userRole, 'utf8'), 'user-owned role');
  mustFail(cli(['init', '--global', '--force'], conflict), 'role conflict with force');
  assert.equal(fs.readFileSync(userRole, 'utf8'), 'user-owned role');

  const broken = fixture('broken-link');
  const brokenSkill = path.join(broken.home, '.agents', 'skills', 'taskard');
  fs.mkdirSync(path.dirname(brokenSkill), { recursive: true });
  fs.symlinkSync(path.join(broken.root, 'missing-skill'), brokenSkill, 'dir');
  mustFail(cli(['init', '--global'], broken), 'broken link conflict without force');
  assert.equal(fs.readlinkSync(brokenSkill), path.join(broken.root, 'missing-skill'));
  mustSucceed(cli(['init', '--global', '--force'], broken), 'repair broken link with force');
  assert.equal(fs.realpathSync(brokenSkill), fs.realpathSync(path.join(broken.home, '.taskard', 'skills', 'taskard')));

  const directive = fixture('malformed-directive');
  const directivePath = path.join(directive.cwd, 'CLAUDE.md');
  const malformed = 'before\n<!-- taskard:start -->\nuser content\n';
  fs.writeFileSync(directivePath, malformed);
  mustFail(cli(['init'], directive), 'unpaired directive marker');
  assert.equal(fs.readFileSync(directivePath, 'utf8'), malformed);

  const sourceOnly = fixture('source-only');
  const sourceDoctor = cli(['doctor'], sourceOnly);
  mustFail(sourceDoctor, 'source-only doctor');
  assert.match(sourceDoctor.stdout, /uninstalled/i);
  assert.doesNotMatch(sourceDoctor.stdout, /Healthy · All systems operational/);

  const invalid = fixture('invalid-config');
  fs.mkdirSync(path.join(invalid.cwd, '.taskard'), { recursive: true });
  fs.writeFileSync(path.join(invalid.cwd, '.taskard', 'config.toml'), '[defaults]\ndefault_mode = "false"\n');
  const configDoctor = cli(['doctor'], invalid);
  mustFail(configDoctor, 'invalid config doctor');
  assert.match(configDoctor.stdout, /config/i);
  const configCommand = cli(['config'], invalid);
  mustFail(configCommand, 'invalid config display');
  for (const badConfig of [
    '[qa]\nenabled = "false"\n',
    '[defaults]\nmax_attempts = 3\n',
    '[defaults]\nunknown_setting = true\n',
    '[roles]\n__proto__ = "polluted"\n',
    '[defaults]\ndefault_mode = "pro"\ndefault_mode = "fast"\n',
    '[defaults]\ndefault_mode = true\n',
    '[harness_preferences.models.opencode]\nreviewer = "sonnet"\n',
  ]) {
    fs.writeFileSync(path.join(invalid.cwd, '.taskard', 'config.toml'), badConfig);
    mustFail(cli(['config'], invalid), `reject config ${JSON.stringify(badConfig)}`);
  }

  const brokenConfig = fixture('broken-config-link');
  fs.mkdirSync(path.join(brokenConfig.cwd, '.taskard'), { recursive: true });
  fs.symlinkSync(path.join(brokenConfig.root, 'missing-config.toml'), path.join(brokenConfig.cwd, '.taskard', 'config.toml'));
  const brokenConfigOutput = cli(['config'], brokenConfig);
  mustFail(brokenConfigOutput, 'broken config symlink');
  assert.match(brokenConfigOutput.stderr, /broken symbolic link/i);

  const trailingComma = fixture('trailing-comma-array');
  fs.mkdirSync(path.join(trailingComma.cwd, '.taskard'), { recursive: true });
  fs.writeFileSync(path.join(trailingComma.cwd, '.taskard', 'config.toml'), '[risky_operations]\npatterns = ["deploy", "migration",]\n');
  const trailingCommaConfig = cli(['config'], trailingComma);
  mustSucceed(trailingCommaConfig, 'valid trailing-comma TOML array');
  assert.match(trailingCommaConfig.stdout, /Patterns\s+: deploy, migration/);

  const forceProject = fixture('force-project-config');
  fs.mkdirSync(path.join(forceProject.cwd, '.taskard'), { recursive: true });
  const forceProjectConfig = path.join(forceProject.cwd, '.taskard', 'config.toml');
  fs.writeFileSync(forceProjectConfig, '[defaults]\ndefault_mode = "not-a-mode"\n');
  mustSucceed(cli(['init', '--force'], forceProject), 'force resets invalid selected project config');
  assert.match(fs.readFileSync(forceProjectConfig, 'utf8'), /default_mode = "pro"/);
  assert.doesNotMatch(fs.readFileSync(forceProjectConfig, 'utf8'), /not-a-mode/);

  const forceGlobal = fixture('force-global-config');
  fs.mkdirSync(path.join(forceGlobal.home, '.taskard'), { recursive: true });
  const forceGlobalConfig = path.join(forceGlobal.home, '.taskard', 'config.toml');
  fs.writeFileSync(forceGlobalConfig, '[qa]\nenabled = "not-a-bool"\n');
  mustSucceed(cli(['init', '--global', '--force'], forceGlobal), 'force resets invalid selected global config');
  assert.match(fs.readFileSync(forceGlobalConfig, 'utf8'), /default_mode = "pro"/);
  assert.doesNotMatch(fs.readFileSync(forceGlobalConfig, 'utf8'), /not-a-bool/);

  const forceProjectGlobalModel = fixture('force-project-global-model');
  fs.mkdirSync(path.join(forceProjectGlobalModel.home, '.taskard'), { recursive: true });
  fs.mkdirSync(path.join(forceProjectGlobalModel.cwd, '.taskard'), { recursive: true });
  fs.writeFileSync(path.join(forceProjectGlobalModel.home, '.taskard', 'config.toml'), '[roles]\nreviewer = "opus"\n');
  fs.writeFileSync(path.join(forceProjectGlobalModel.cwd, '.taskard', 'config.toml'), '[defaults]\ndefault_mode = "not-a-mode"\n');
  mustSucceed(cli(['init', '--force'], forceProjectGlobalModel), 'project force aligns exported role with reset config');
  const forcedProjectConfig = fs.readFileSync(path.join(forceProjectGlobalModel.cwd, '.taskard', 'config.toml'), 'utf8');
  const forcedClaudeReviewer = fs.readFileSync(path.join(forceProjectGlobalModel.cwd, '.claude', 'agents', 'reviewer.md'), 'utf8');
  assert.match(forcedProjectConfig, /^reviewer = "sonnet"/m);
  assert.match(forcedClaudeReviewer, /^model: sonnet$/m);
  assert.doesNotMatch(forcedClaudeReviewer, /^model: opus$/m);

  const invalidOtherScope = fixture('force-invalid-other-scope');
  fs.mkdirSync(path.join(invalidOtherScope.home, '.taskard'), { recursive: true });
  fs.mkdirSync(path.join(invalidOtherScope.cwd, '.taskard'), { recursive: true });
  const invalidGlobalBytes = '[defaults]\ndefault_mode = "not-a-mode"\n';
  const validProjectBytes = '# keep the selected project config unchanged when its global layer is invalid\n';
  fs.writeFileSync(path.join(invalidOtherScope.home, '.taskard', 'config.toml'), invalidGlobalBytes);
  const invalidOtherProjectPath = path.join(invalidOtherScope.cwd, '.taskard', 'config.toml');
  fs.writeFileSync(invalidOtherProjectPath, validProjectBytes);
  mustFail(cli(['init', '--force'], invalidOtherScope), 'project force must not ignore invalid global config');
  assert.equal(fs.readFileSync(path.join(invalidOtherScope.home, '.taskard', 'config.toml'), 'utf8'), invalidGlobalBytes);
  assert.equal(fs.readFileSync(invalidOtherProjectPath, 'utf8'), validProjectBytes);

  const orphanVersion = fixture('orphan-version-marker');
  const orphanManifest = path.join(orphanVersion.cwd, 'CLAUDE.md');
  const orphanManifestBytes = 'User instructions\n\n<!-- taskard:v2 -->\n\nKeep this file intact.\n';
  fs.writeFileSync(orphanManifest, orphanManifestBytes);
  mustFail(cli(['init'], orphanVersion), 'init rejects orphan Taskard version marker');
  assert.equal(fs.readFileSync(orphanManifest, 'utf8'), orphanManifestBytes, 'orphan marker manifest bytes must remain unchanged');
  const orphanDoctor = cli(['doctor'], orphanVersion);
  mustFail(orphanDoctor, 'doctor rejects orphan Taskard version marker');
  assert.match(orphanDoctor.stdout, /directive|version|unhealthy/i);

  for (const [name, marker] of [
    ['unclosed-version-marker', '<!-- taskard:v2'],
    ['unclosed-start-marker', '<!-- taskard:start'],
    ['unclosed-end-marker', '<!-- taskard:end'],
  ]) {
    const unclosedMarker = fixture(name);
    mustSucceed(cli(['init'], unclosedMarker), `${name} healthy fixture install`);
    const manifest = path.join(unclosedMarker.cwd, 'CLAUDE.md');
    const manifestBytes = `User instructions\n\n${marker}\n\nKeep this file intact.\n`;
    fs.writeFileSync(manifest, manifestBytes);
    mustFail(cli(['init'], unclosedMarker), `init rejects ${name}`);
    assert.equal(fs.readFileSync(manifest, 'utf8'), manifestBytes, `${name} manifest bytes must remain unchanged`);
    const doctor = cli(['doctor'], unclosedMarker);
    mustFail(doctor, `doctor rejects ${name}`);
    assert.match(doctor.stdout, /directive|version|unhealthy/i);
  }

  const precedence = fixture('precedence');
  fs.mkdirSync(path.join(precedence.home, '.taskard'), { recursive: true });
  fs.mkdirSync(path.join(precedence.cwd, '.taskard'), { recursive: true });
  fs.writeFileSync(path.join(precedence.home, '.taskard', 'config.toml'), '[defaults]\ndefault_mode = "max"\npermission_mode = "default"\n');
  fs.writeFileSync(path.join(precedence.cwd, '.taskard', 'config.toml'), '[defaults]\ndefault_mode = "fast"\n');
  const configOutput = cli(['config'], precedence);
  mustSucceed(configOutput, 'effective config display');
  assert.match(configOutput.stdout, /Speed Gear\s+: fast/);
  assert.match(configOutput.stdout, /Permission Pref\s+: default/);
  assert.match(configOutput.stdout, /\.taskard\/config\.toml \(Workspace\)/);

  const shell = fixture('shell');
  const shellInstall = run('bash', [path.join(ROOT, 'install.sh')], shell);
  mustSucceed(shellInstall, 'shell bootstrap install');
  for (const role of roles) {
    assert.ok(fs.lstatSync(path.join(shell.home, '.claude', 'agents', `${role}.md`)).isSymbolicLink(), `shell missing ${role} link`);
  }
  assert.ok(fs.lstatSync(path.join(shell.home, '.claude', 'skills', 'taskard')).isSymbolicLink());
  assert.ok(fs.lstatSync(path.join(shell.home, '.agents', 'skills', 'taskard')).isSymbolicLink());
  const shellUserFile = path.join(shell.home, '.claude', 'agents', 'reviewer.md');
  fs.unlinkSync(shellUserFile);
  fs.writeFileSync(shellUserFile, 'preserve shell conflict');
  const shellConflict = run('bash', [path.join(ROOT, 'install.sh')], shell);
  mustFail(shellConflict, 'shell role conflict');
  assert.equal(fs.readFileSync(shellUserFile, 'utf8'), 'preserve shell conflict');

  const help = cli(['--help'], shell);
  mustSucceed(help, 'installer help');
  assert.match(help.stdout, /--install-skills.*requires --global/);

  console.log('PASS: isolated installer, config, profile, directive and doctor regressions');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
