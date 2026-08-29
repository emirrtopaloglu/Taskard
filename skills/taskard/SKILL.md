---
name: taskard
description: Multi-harness agent orchestration convention. Classifies tasks (Fast/Pro/Max), writes point-to-range briefs, delegates to named subagents, and operates quality gates.
---

# Taskard

Execute tasks following the Taskard orchestration workflow. The main agent coordinates and judges; it never writes code directly or runs tests. Its legitimate action is to delegate work to named roles.

## 1. Speed Gear Selection (3-Speed Transmission)

Classify the task complexity at the start of execution. Session instructions (e.g., *"run this in fast mode"*, *"use max mode"*) take immediate precedence.

| Mode | Duration | Scope & Ceremony Level |
|---|---|---|
| ⚡ **FAST** | **< 1-2 min** | **Aggressive Default / Zero Overhead:** 1 file, typo, CSS/styling, single function fix, config. Writes zero files to `.taskard/`. Spawns a single `implementer`, produces diff, main agent validates and presents immediately. No separate reviewer subagent. |
| 🚀 **PRO** *(Default)* | **5-10 min** | **Lightweight Documentation:** 2–4 files, standard features, new components, endpoints, small refactors. No grilling or heavy specification. Single `brief.md` + single `implementer` + single `reviewer` (mini-review) gate. |
| 🏛️ **MAX** *(Graph)* | **15-30 min** | **Full Architectural Rigor:** Complex architecture, ≥2 parallel lanes (git worktrees), database migrations, authentication. Grilling/Product decisions (`grill-with-docs`/`grill-me`) → Spec (`context/specs/`) → Tasks (`tasks/`) → Parallel Lane DAG → QA → Opus Final Review. |

> **Ratchet Rule:** If scope expands during Fast or Pro (>4 files, unexpected dependencies), ratchet the workflow up to the next gear immediately.

## 2. Discipline Router (Pull-Based)

If `using-superpowers` is present in the environment, start with its routing; otherwise, consult this table. **Do not load skills unless the specific trigger condition is met.** A missing skill does not block execution; core role contracts govern behavior.

| Phase / Condition | Skill | Function |
|---|---|---|
| Workflow start | `using-superpowers` | Skill router (if available) |
| Pre-spec exploration (Max) | `brainstorming` | Clarify intent and requirements |
| Alignment & decisions (Max) | `grilling` + `domain-modeling` | Question assumptions and terms for high-risk work |
| Product decision round | `grill-with-docs` / `grill-me` | Resolve current vs target state differences before locking spec |
| Ambiguous multi-session scope | `wayfinder` | Multi-session scope mapping |
| Architectural seam design | `codebase-design` | Module boundary and interface design |
| Plan documentation (Max) | `writing-plans` | Extract actionable briefs from specifications |
| Parallel lanes (Max) | `dispatching-parallel-agents` + `using-git-worktrees` | Isolate ≥2 independent worktree lanes |
| Merge conflict | `resolving-merge-conflicts` | Worktree merge conflict resolution |
| Review feedback cycle | `receiving-code-review` | Verify and apply review findings |
| Blocker diagnosis (2nd failure) | `systematic-debugging` | Root-cause analysis (Circuit Breaker) |
| Completion integration | `finishing-a-development-branch` | Post-green merge options |

*(Note: TDD and verification contracts are embedded directly into the `implementer` role; external skill loading is not required.)*

## 3. Core Iron Laws

1. **Never mutate configuration files at runtime.**
2. **The main agent never writes code directly.**
3. **Anonymous subagents are forbidden** (every delegate must run under an explicit named role).
4. **Report verifiable evidence, not assertions of success.**
5. **2-Strike Circuit Breaker:** Maximum 1 retry attempt per lane; on the 2nd error, execution HALTS and presents 3 clear options: (1) Technical clarification, (2) Alternative path, (3) Pass control to human.
6. **Dangerous operations require explicit human approval** (per config `risky_operations`).

## 4. Self-Priming Brief & Point-to-Range Standard

In Pro and Max modes, create `.taskard/lanes/<ts>-<slug>-<suffix>/brief.md` for each lane (suffix: 4 random characters, e.g., `-a3f2`).

- **Verify Premises Before Writing:** Inspect assumptions with `ls` or `grep` before writing briefs. If a premise is invalid, clarify with the user.
- **Point-to-Range Rule:**
  1. Never paste raw code or function bodies into briefs.
  2. Provide only target file paths and line ranges: `## Context Files: src/auth/session.ts#L40-L65`.
  3. The delegate reads only the specified line slices on startup (`view_file` StartLine/EndLine).
- **Brief Structure:**
  - `## Context Files` (Mandatory): Target code line ranges and prerequisite lane report paths.
  - `## Acceptance Criteria`: Concrete, verifiable requirements.
  - `## Non-Goals`: Areas outside the lane scope.
  - `## Disciplines`: `Budget: max 1 retry (2-Strike) · Native TDD & Evidence Required`.

## 5. Tiered Model Matrix (Smart Tiering)

| Role | Pro Mode (Default) | Max Mode (Architectural Rigor) |
|---|:---:|:---:|
| **`planner`** | *(Skipped)* | **`opus`** |
| **`reviewer`** | **`sonnet`** *(Focused mini-review)* | **`opus`** *(Deep architecture & security)* |
| **`debugger`** | **`sonnet`** *(Targeted fix)* | **`opus`** *(Complex root-cause)* |
| **`implementer`** | **`sonnet`** | **`sonnet`** |
| **`ui-developer`** | **`sonnet`** | **`sonnet`** |
| **`explorer`** | **`haiku`** *(Fast scan)* | **`haiku`** |
| **`qa-tester`** | **`haiku`** | **`haiku`** |

*Precedence:* `agents/*.md` < `~/.taskard/config.toml` < `.taskard/config.toml` < Session Prompts.

## 6. Quality Gates & Report Contract

- **Report Gate (`report.md` - ≤15 lines):**
  ```
  STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
  DIFF_SUMMARY: Changed files (+X, -Y)
  EVIDENCE: Executed test command and raw output
  HASH: Git commit hash (if created)
  ```
  *If all four fields are not present in exact order, reject the report and request one formatting correction (does not count against the 2-Strike budget).*

- **Review Gate:**
  - **Fast:** No separate subagent; main orchestrator validates diff directly.
  - **Pro:** Scoped `reviewer` (`sonnet` with ≤5 lines of findings, standards + diff).
  - **Max:** `reviewer` (`opus`) + `qa-tester` on external impact changes + `final review`.

- **Telegraph Output & Close:**
  - Provide single-sentence Humanish progress updates at each stage (do not dump raw status codes into chat).
  - At conclusion, present a plain-language **"Manual Verification Checklist"** for the human.
  - The human always owns the final merge and live verification decision.

---

## Disclosed References
- [Project Setup Guide](references/project-setup.md)
- [Memory & Handoff Format](references/memory-and-handoff.md)
- [Cross-Harness Headless Execution](references/cross-harness.md)
