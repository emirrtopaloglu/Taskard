<div align="center">

```text
  ████████╗ █████╗ ███████╗██╗  ██╗ █████╗ ██████╗ ██████╗
  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗
     ██║   ███████║███████╗█████╔╝ ███████║██████╔╝██║  ██║
     ██║   ██╔══██║╚════██║╚═██╔═╝ ██╔══██║██╔══██╗██║  ██║
     ██║   ██║  ██║███████║██║  ██╗██║  ██║██║  ██║██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

### Zero-Dependency Agent Workflow Conventions for Developer CLIs

[![CI](https://github.com/emirrtopaloglu/Taskard/actions/workflows/ci.yml/badge.svg)](https://github.com/emirrtopaloglu/Taskard/actions)
[![Version](https://img.shields.io/badge/version-v0.2.1-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Node%20Dependencies-Zero-success.svg)](#)
[![Harness Profiles](https://img.shields.io/badge/Profiles-Claude%20%7C%20OpenCode%20%7C%20Codex%20%7C%20Antigravity%20%7C%20Cursor-orange.svg)](#-harness-support)

[🇹🇷 Türkçe](README.tr.md) · [Roadmap](docs/ROADMAP.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

</div>

---

## What Taskard Does

Taskard provides Markdown role contracts, TOML preferences, harness profile data, and workflow conventions. Its small Node CLI installs and checks those files. The CLI does not run an orchestration service or prove that agents followed a convention.

The workflow gives an agent team a shared way to choose task scope, delegate to named roles, track source context, and report checks. Harnesses execute their own agents and tools.

- **Named roles:** `planner`, `implementer`, `reviewer`, `debugger`, `ui-developer`, `explorer`, and `qa-tester` have explicit contracts.
- **Risk-first gears:** Fast, Pro, and Max scale the work to its risk and review needs. File count is a supporting signal.
- **Source-aware briefs:** Line pointers include a source revision and optional symbol anchor. Delegates can inspect callers and dependencies when needed.
- **TDD and evidence conventions:** Expected Red is kept separate from failed fix attempts. Reports bind commands and evidence files to commits and hashes.
- **Limited native permissions:** Claude Code and OpenCode profiles restrict reviewer and explorer tools. Other harnesses receive instructions without a Taskard-enforced read-only boundary.
- **Agent-read configuration:** Config and profile files are data; Taskard does not mutate them at runtime.

## Install

The Taskard CLI requires Node.js 18 or newer and has no external Node runtime dependencies.

```bash
npx taskard init
```

Other options:

```bash
npx taskard init -i       # interactive setup
npx taskard init --global # global setup
```

Run `npx taskard init` from a project directory for a project install; it does not write to your home directory. `--global` installs under user-level Taskard and harness directories. Existing regular harness files are preserved. `--force` replaces Taskard-managed links and profiles and resets the config in the selected scope. A project force still validates and preserves global config, then exports profiles from the effective config after the project reset. Orphan, malformed, and unfinished Taskard directive markers are rejected before a manifest is changed.

The shell installer is available for a local checkout:

```bash
git clone https://github.com/emirrtopaloglu/Taskard.git
cd Taskard
./install.sh
```

Git is needed when the shell installer must clone Taskard from a remote source. The default install leaves optional external skills unchanged. To opt into network-backed global skill installation, run `./install.sh --install-skills` from a checkout or `npx taskard init --global --install-skills`. This opt-in uses non-interactive requests with a 30-second timeout per package and checks the resulting skill paths. If resolution fails, Taskard reports a partial result and completes the core install; default installs and dry runs make no optional-skill network requests.

Useful commands:

```bash
taskard doctor                 # check required harness bridges and configuration; failures exit nonzero
taskard config                 # inspect agent-read preferences
taskard roles                  # list the seven named roles
taskard lanes                  # list lane records
taskard verify                 # check lane reports, commit freshness, and evidence references
taskard verify --global        # check global lanes
taskard clean --dry-run        # preview cleanup
taskard clean                  # archive eligible completed lanes to .taskard/archive/lanes/
taskard clean --all            # remove all live lanes, tmp files, and diffs after confirmation
taskard clean --purge          # permanently remove eligible completed archives after confirmation
```

`taskard clean` archives eligible completed lanes by default and leaves temporary files and diffs alone. `--all` and `--purge` require an interactive confirmation or `--yes`; `--all --purge` also removes archived lanes. Cleanup refuses symlinked scopes and reports removal failures with a nonzero exit. Each lane has at most one active review record, named `review.md`; multiple active review records make its verdict unknown and keep it out of completed cleanup and archive purge.

`taskard doctor` checks the selected harness's required skill bridge, native role exports when applicable, effective configuration, and versioned directive blocks. A missing or invalid required integration makes it exit nonzero; package source without an installed harness bridge is reported as uninstalled.

Choose the global target with `primary_harness` in `~/.taskard/config.toml`; init otherwise uses the detected harness and defaults to Claude Code when none is detected. Global directives follow that selection: Claude Code uses `~/.claude/CLAUDE.md` and `~/.claude/AGENTS.md`, Codex uses `$CODEX_HOME/AGENTS.md` (default `~/.codex/AGENTS.md`), and OpenCode uses `AGENTS.md` in `$OPENCODE_CONFIG_DIR` (default `${XDG_CONFIG_HOME:-~/.config}/opencode`). OpenCode role exports use the same config directory. Taskard honors these native roots when they resolve inside `HOME`; an outside root is rejected before installation and doctor reports it as unsupported. Antigravity and Cursor are project-only recipe profiles and receive no global native-health claim.

`taskard verify` is read-only. It checks lane contracts, Git freshness, evidence hashes, and referenced source ranges; pointers that traverse symlinks in the recorded source commit or working tree are rejected. It does not execute `EVIDENCE_COMMAND` or authenticate agent claims. An empty lane directory is a successful empty check, not proof that a task or test ran. See [Role, Brief, and Evidence Contracts](skills/taskard/references/roles-and-evidence.md) for its boundaries.

## Use a Workflow

In your harness, describe the task and ask it to use the Taskard workflow. You can request a gear explicitly:

```text
Run this in Fast mode: fix the typo in the page title.
Run this in Max mode: migrate authentication to a new tenant model.
```

A user-requested gear takes precedence. The agent should name uncovered risk and preserve required data-safety checks.

## Choose a Gear by Risk

Choose the lowest gear that covers the task's risk, scope, and review needs. Authentication, security, data loss, destructive cleanup, and migrations outrank file count. The durations below are rough planning estimates, not guarantees.

| Gear | Typical fit | Workflow | Planning estimate |
|---|---|---|---|
| ⚡ **Fast** | Low-risk, isolated change with a clear check | One named implementer; direct diff check. An inline report is enough. | Under a few minutes |
| 🚀 **Pro** *(default)* | Bounded feature or fix | Source-aware brief, implementer, focused reviewer; QA when impact requires it. | About 5–10 minutes |
| 🏛️ **Max** | High-risk, cross-boundary, or parallel work | Record decisions, split independent named-role lanes, then review and QA. | About 15–30 minutes |

If a task reveals higher risk or new dependencies, reclassify before continuing. Max does not require a diagram; describe the lane dependencies clearly.

## The Seven Roles

| Role | Default model alias | Responsibility |
|---|---|---|
| `planner` | `opus` | Turns intent into risk-aware specs and source-aware briefs. |
| `implementer` | `sonnet` | Makes scoped changes using TDD and bounded fix attempts. |
| `reviewer` | `sonnet` | Reviews changes read-only and records cited findings. |
| `debugger` | `sonnet` | Reproduces defects and fixes the shared root cause. |
| `ui-developer` | `sonnet` | Builds accessible web or mobile interfaces. |
| `explorer` | `haiku` | Maps relevant structure, conventions, and risks without editing. |
| `qa-tester` | `haiku` | Checks observable behavior against a running system. |

These are aliases and defaults, not fixed provider model IDs or availability guarantees. Session instructions take precedence. See [`agents/`](agents/) for complete contracts.

## Configuration and Model Selection

Configuration in `~/.taskard/config.toml` and `.taskard/config.toml` is agent-read data. Project values may override global defaults; session instructions take precedence. Taskard does not mutate config files at runtime.

`templates/harness-profiles.json` records each harness's install scope, support level, model inheritance, and native permission fields. Harness-specific role overrides take precedence over `[roles]` for exported native profiles. Claude Code accepts model aliases, while OpenCode requires provider/model IDs:

```toml
[harness_preferences.models.claude_code]
reviewer = "haiku"

[harness_preferences.models.opencode]
reviewer = "provider/model"
debugger = "provider/model"
```

When no OpenCode role override is set, the selected provider's model is used. Session instructions take precedence over all configured defaults. Taskard does not perform automatic or paid harness fallback. `permission_mode` and `risky_operations` are preferences for agents and supported harness settings; they are not a cross-harness runtime safety system.

The CLI supports its documented TOML subset: single-line tables and assignments with strings, integers, booleans, and single-line string arrays (including valid trailing commas), plus comments. It rejects malformed or unsafe keys, unsupported settings, wrong types, and out-of-range numbers.

## Harness Support

| Harness | Status | Current scope |
|---|---|---|
| Claude Code | **tested** | Deterministic install/profile checks cover role files and reviewer/explorer allowlists. Live agent behavior is untested. |
| OpenCode | **tested** | Deterministic checks cover role export, `mode: subagent`, and reviewer/explorer permissions. Live agent behavior is untested. |
| Codex | **partial** | Shared skill and project instructions are available; native role export and read-only profiles are not covered. |
| Antigravity | **recipe** | Use project instructions and shared conventions manually. |
| Cursor | **recipe** | Use project instructions and shared conventions manually. |

“Tested” means deterministic installer or profile fixture checks only, not live agent runs or a verified list of available models. See [Cross-Harness Support](skills/taskard/references/cross-harness.md) for details.

## Attempts and Evidence

For consequential logic, record a focused pre-fix check. Its expected TDD **Red** is baseline evidence and does not count as a failed fix. `ATTEMPT_BUDGET` is the total number of fix attempts: 1 or 2, so at most one retry follows the first unsuccessful fix attempt.

Implementation reports use ten ordered fields: status, diff summary, base/head commit, attempt count, exact command, exit status, evidence path and SHA-256, and commit hash. Fast work may report these inline instead of writing `report.md`. Review and verification reports are capped at 15 lines.

Hashes bind a report to the recorded file bytes, but cannot prove that a command ran or that an agent claim is true. Missing or stale metadata fails verification and cannot be treated as verified work. Full field definitions are in [Role, Brief, and Evidence Contracts](skills/taskard/references/roles-and-evidence.md).

## Orchestration Layer

Parallel Max lanes follow one worktree, scope, and wave contract: a writing lane declares `WORKTREE`, `BRANCH`, and `SCOPE` in its brief, same-wave lanes keep disjoint explicit scopes, and the default ceiling is three concurrent writers (`[defaults].max_parallel`). Merges stay serial — one writer at a time — and only from lanes whose gates passed; the main branch is never written directly by a lane.

`taskard verify` checks what it can check deterministically today: optional field formats and ordering, worktrees or branches shared across live lanes, overlapping explicit scopes within one wave, and missing declared worktrees once a lane has a report. Coverage that does not exist yet is listed explicitly and remains a reviewer convention. See [Orchestration Layer](skills/taskard/references/orchestration.md).

## Benchmark Status

No comparable live benchmark runs or raw historical artifacts are published. The evaluation suite defines fixed prompts and a standard-library scorer for supplied run artifacts; it does not start paid model runs. The scorer's self-check uses synthetic fixtures, not benchmark measurements. See [Evaluation Method](evals/README.md).

Recorded `durationMs` and `costUsd` values must be finite and non-negative. Token counts and `manualInterventions` must be non-negative safe integers; unavailable values may be `null`.

## Contribute and Verify

```bash
npm test
bash -n install.sh
node --check bin/taskard.js
node bin/taskard.js init --dry-run
```

`npm test` runs structural validation, installer regressions, cleanup/verification safety checks, and scorer fixture checks.

Use an isolated home and project directory for installer tests. Do not install optional external skills or write to the current user's global config as part of the test run.

## License

Taskard is open source under the [MIT License](LICENSE).
