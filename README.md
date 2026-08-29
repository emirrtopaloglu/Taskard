# Taskard

[🇹🇷 Türkçe](README.tr.md)

A multi-harness agent orchestration **convention package** — zero runtime code.

Philosophy: every harness (Claude Code, Codex, OpenCode, Antigravity...) already has its own subagent capability. Taskard layers **doctrine** on top of it: named roles, point-to-range brief standards, lean gear shifting, embedded TDD/evidence contracts, and human approval gates.

- The main agent (expensive brain) never writes code: classifies tasks, writes point-to-range briefs, spawns delegates, and judges results
- Every delegate runs under a **named** role (implementer, reviewer, ui-developer, qa-tester, explorer, planner, debugger) — anonymous agents are forbidden
- **Embedded TDD & Verification:** `implementer` runs the Red-Green-Refactor loop and provides command output proof natively without external skill bloat
- **Point-to-Range Briefs:** Never copy code into briefs; provide only target file paths and line ranges (`path/file.ts#L40-L65`)
- **Smart Model Tiering:** Express mode uses `sonnet` for reviewer and debugger; Full mode uses `opus` for deep architecture/security
- Closing reports always carry a **manual test checklist** in plain language — each line one action + expected result
- Model selection belongs to the user: a `config.toml` table + natural-language overrides

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
- ⚡ **Nano (< 1-2 min - Aggressive Default):** Fast-lane for 1 file/typo/styling fix. Zero `.taskard/` files. Single implementer + instant verification in main loop.
- 🚀 **Express (Default, 5-10 min):** For 2-4 files features and component additions. Point-to-range `brief.md` + implementer + sonnet mini-review gate.
- 🏛️ **Full (15-30 min):** For complex architecture, multi-lane parallel worktrees, and critical data/auth changes. Full grilling → spec → tasks → DAG → QA → opus final review.

Your decision points:
- **Mode & Model override** — just say *"run this in full mode with opus for implementation"*
- **2-Strike Circuit Breaker** — a lane retries at most once on error; on the 2nd failure, execution halts and presents 3 clear options
- **Plan approval** — no implementation starts before you approve the plan/spec in Full mode
- **Live verification & merge** — the human owns the merge gate and live validation
- **Risky operations** — anything matching the config list asks for approval first

## Config

`config.toml` is data read by agents, not by code:

```toml
[defaults]
permission_mode = "bypassPermissions"
default_mode = "express"    # "nano" | "express" (default) | "full"
max_attempts = 2            # 2-Strike circuit breaker

[roles]
# Express Mode Defaults (Tier 2 Fast & Balanced):
implementer = "sonnet"
ui-developer = "sonnet"
reviewer = "sonnet"         # Express scoped mini-review
debugger = "sonnet"         # Express targeted bug fixing

# Full Mode Heavy Brains (Tier 1 Architecture & Security):
planner = "opus"
reviewer_full = "opus"      # Full deep architecture/security review
debugger_full = "opus"      # Full complex root-cause diagnosis

# Tier 3: Light & Blazing Fast (Exploration & QA):
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

## Architectural Principles (Short)

1. The main loop never writes code — spec, point-to-range brief, dispatch, judgment; everything else goes to delegates
2. Anonymous subagents are forbidden — every pair of hands has a role and a name
3. Distillation contract: delegates return evidence-backed reports in ≤15 lines
4. Config files are never mutated at runtime
5. The human owns three gates: plan approval, pre-merge verification, risky-operation list

Full doctrine and decision history: [wayfinder map](.scratch/taskard/map.md) (Turkish).
