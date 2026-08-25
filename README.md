# Taskard

[🇹🇷 Türkçe](README.tr.md)

A multi-harness agent orchestration **convention package** — no runtime code outside `apps/`.

Philosophy: every harness (Claude Code, Codex, OpenCode...) already has its own subagent capability. Taskard layers **doctrine** on top of it: named roles, lane discipline, brief quality, report contracts, human approval gates.

- The main agent (expensive brain) never writes code: it writes specs, splits work, spawns delegates, and judges results
- Every delegate runs under a **named** role (implementer, reviewer, frontend-developer) — anonymous agents are forbidden
- Model selection belongs to the user: a `config.toml` table + natural-language overrides
- Four memory layers travel inside the `.taskard/` markdown convention
- Cross-harness needs are covered by headless bash recipes inside the skill

## Install

```bash
git clone <repo-url> && cd taskard   # or your existing clone
./install.sh
```

What `install.sh` does (no code, just files):
1. Symlinks the skill to `~/.claude/skills/taskard` and `~/.agents/skills/taskard`
2. Symlinks named agent definitions into `~/.claude/agents/` and `~/.opencode/agent/`
3. Creates `~/.taskard/config.toml` on first run (never overwrites)
4. Appends a marker-wrapped static directive block to `~/.claude/CLAUDE.md` and `~/.claude/AGENTS.md` (idempotent)
5. Installs missing external discipline skills (superpowers + mattpocock) globally via `npx skills`
6. Copies the Deck viewer (read-only `.taskard` monitor) to `~/.taskard/deck/`

To update: re-run `./install.sh` — your config is preserved.

External skill dependencies are NOT vendored into the package — installed copies are referenced, so upstream updates flow through automatically. Full list: [`docs/dependencies.md`](docs/dependencies.md).

## Deck

A read-only live monitor for `.taskard` lanes. Installed by `install.sh` under `~/.taskard/deck/`.

```bash
node ~/.taskard/deck/server.mjs          # → http://localhost:7420
node ~/.taskard/deck/server.mjs --demo   # sample data
```

Writes to no files; purely observational.

## Usage

Open your harness in the project directory and say:

```
Run this task through the Taskard workflow
```

The main agent grills you → writes a spec (`.taskard/context/specs/`) → splits it into tasks (`T-001-slug.md`) → opens a lane per task → runs them through named delegates → reports back in short summaries.

Your decision points:
- **Model/role override** — just say *"use opus for this implementation"*
- **Plan approval** — no implementation starts before you approve the spec
- **Live verification** — you test the app before merge; the merge call is yours
- **Risky operations** — anything matching the config list asks for approval first

**Scale ladder:** micro tasks (single step, ~10 min) run on a single brief — no spec/tasks files, and if no new code is produced an independent evidence check replaces the reviewer gate. Full ceremony is for standard tasks.

## Config

`config.toml` is data read by agents, not by code:

```toml
[defaults]
permission_mode = "bypassPermissions"

[roles]
planner = "opus"
implementer = "sonnet"
reviewer = "opus"

[risky_operations]
patterns = ["migration", "deploy", "rm -rf", "drop table", "git push --force"]
```

Global: `~/.taskard/config.toml` · Per-project: `<project>/.taskard/config.toml` · Session: whatever you say wins.

## Project setup (once per project)

The main agent follows the recipe in the skill: it creates the `.taskard/` tree and appends the directive block to the project's CLAUDE.md/AGENTS.md. To do it manually, see the "Setup recipe" section of the skill.

## Adding a new role

Need a domain specialist (e.g. mobile-developer, data-engineer)? Add a `<role>.md` definition under `agents/`, run `./install.sh` — or simply drop `.claude/agents/<role>.md` into your project.

## Architectural principles (short)

1. The main loop never writes code — spec, dispatch, judgment; everything else goes to delegates
2. Anonymous subagents are forbidden — every pair of hands has a role and a name
3. Distillation contract: delegates return evidence-backed reports in ≤15 lines
4. Config files are never mutated at runtime
5. The human owns three gates: plan approval, pre-merge verification, risky-operation list

Full doctrine and decision history: [wayfinder map](.scratch/taskard/map.md) (Turkish).
