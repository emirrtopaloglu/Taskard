# Taskard

[🇹🇷 Türkçe](README.tr.md)

A multi-harness agent orchestration **convention package** — zero runtime code.

Philosophy: every harness (Claude Code, Codex, OpenCode...) already has its own subagent capability. Taskard layers **doctrine** on top of it: named roles, lane discipline, brief quality, report contracts, human approval gates.

- The main agent (expensive brain) never writes code: it writes specs, splits work, spawns delegates, and judges results
- Every delegate runs under a **named** role (implementer, reviewer, ui-developer, qa-tester, explorer, planner, debugger) — anonymous agents are forbidden
- Every role carries a **mandatory skill contract**: Superpowers / Matt Pocock / Expo skills are the calibration layer agents must use when installed
- Closing reports always carry a **manual test checklist** in plain language — each line one action + expected result
- Model selection belongs to the user: a `config.toml` table + natural-language overrides
- Four memory layers travel inside the `.taskard/` markdown convention
- Cross-harness needs are covered by headless bash recipes inside the skill

## Install

```bash
git clone <repo-url> && cd taskard   # or your existing clone
./install.sh
```

What `install.sh` does:
1. Symlinks the skill to `~/.claude/skills/taskard` and `~/.agents/skills/taskard`
2. Symlinks named agent definitions into `~/.claude/agents/` and `~/.opencode/agent/`
3. Creates `~/.taskard/config.toml` on first run (never overwrites)
4. Appends a marker-wrapped static directive block to `~/.claude/CLAUDE.md` and `~/.claude/AGENTS.md` (idempotent)
5. Installs missing external discipline skills (superpowers + mattpocock) globally via `npx skills`

To update: re-run `./install.sh` — your config is preserved.

External skill dependencies are NOT vendored into the package — installed copies are referenced, so upstream updates flow through automatically. Full list: [`docs/dependencies.md`](docs/dependencies.md).

## Usage

Open your harness in the project directory and say:

```
Run this task through the Taskard workflow
```

Taskard classifies the task into the appropriate gear and executes:
- ⚡ **Nano (<2-3 min):** Fast-lane for 1 file/typo/styling fix. Zero documentation files. Single implementer + instant verification.
- 🚀 **Express (Default, 5-10 min):** For 2-4 files features and component additions. Self-priming brief (`brief.md`) + implementer + scoped mini-review gate. No heavy grilling/spec files.
- 🏛️ **Full (15-30 min):** For complex architecture, multi-lane parallel worktrees, and critical data/auth changes. Full grilling → spec → tasks → DAG → QA → final review.

Your decision points:
- **Mode & Model override** — just say *"run this in full mode with opus for implementation"*
- **2-Strike Circuit Breaker** — a lane retries at most once on error; on the 2nd failure, execution halts and presents 3 clear options
- **Plan approval** — no implementation starts before you approve the plan/spec
- **Live verification & merge** — the human owns the merge gate and live browser validation
- **Risky operations** — anything matching the config list asks for approval first

## Config

`config.toml` is data read by agents, not by code:

```toml
[defaults]
permission_mode = "bypassPermissions"
default_mode = "express"    # "nano" | "express" (default) | "full"
max_attempts = 2            # 2-Strike circuit breaker

[roles]
# Tier 1: Heavy Brains (Strategy, Planning & Final Verdict)
planner = "opus"
debugger = "opus"
reviewer = "opus"

# Tier 2: Fast & Reliable Workers (Active Coding & UI)
implementer = "sonnet"
ui-developer = "sonnet"

# Tier 3: Light & Blazing Fast (Exploration & QA)
# Note: model names vary by harness; Tier 3 = the cheapest/fastest model available on that harness.
explorer = "haiku"
qa-tester = "haiku"

disabled = []   # e.g. ["debugger"] — these roles never get lanes; work falls back

[qa]
enabled = false              # default OFF; runs headless browser/integration tests when enabled
headless_browser = false
run_integration_tests = false
auto_verify_endpoints = false

[risky_operations]
patterns = ["migration", "deploy", "rm -rf", "drop table", "git push --force"]
```

Global: `~/.taskard/config.toml` · Per-project: `<project>/.taskard/config.toml` · Session: whatever you say wins.

Don't want a role? Put it in `disabled` — the project list replaces the global one, your spoken words replace both. Work falls back to the nearest capable role; disabling a gate role (reviewer / qa-tester) is announced at plan approval, never silently skipped.

## Project setup (once per project)

The main agent follows the recipe in the skill: it creates the `.taskard/` tree and appends the directive block to the project's CLAUDE.md/AGENTS.md. To do it manually, see the "Setup recipe" section of the skill.

## Adding a new role

Need another specialist? Add a `<role>.md` definition under `agents/` with a mandatory skill contract (which installed skills this role must use), run `./install.sh` — or simply drop `.claude/agents/<role>.md` into your project. Stack knowledge usually belongs in skills + briefs, not in new roles.

## Architectural principles (short)

1. The main loop never writes code — spec, dispatch, judgment; everything else goes to delegates
2. Anonymous subagents are forbidden — every pair of hands has a role and a name
3. Distillation contract: delegates return evidence-backed reports in ≤15 lines
4. Config files are never mutated at runtime
5. The human owns three gates: plan approval, pre-merge verification, risky-operation list

Full doctrine and decision history: [wayfinder map](.scratch/taskard/map.md) (Turkish).
