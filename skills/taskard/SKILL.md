---
name: taskard
description: Multi-harness agent orchestration convention. Selects a risk-appropriate gear, writes source-aware briefs, delegates to named roles, and records evidence.
---

# Taskard

Taskard is a set of agent-read conventions, templates, and install-time integrations. The selected harness runs its own agents and tools. Taskard's CLI can install files and check local package state; it does not orchestrate agents at runtime or prove that a reported command ran.

## 1. Choose a Gear by Risk First

Choose the lowest gear that still covers the task's risk, review needs, and scope. File count and estimated time help size the work, but never lower the gear required by authentication, security, data loss, destructive cleanup, or migrations. A user-requested session gear takes precedence; state any risk that the requested gear leaves uncovered and preserve required data-safety checks.

| Gear | Use when | Typical workflow |
|---|---|---|
| ⚡ **Fast** | A low-risk, isolated change has a clear acceptance check. | One named `implementer`; verify the diff directly. A concise inline report is enough; no `report.md` is required. |
| 🚀 **Pro** *(default)* | A bounded feature or fix needs a brief and focused review. | One source-aware brief, named `implementer`, and scoped `reviewer`; add QA only when impact requires it. |
| 🏛️ **Max** | Risk, cross-boundary work, parallel dependencies, or migration needs several gates. | Record decisions, split independent named-role lanes, use worktrees where available, then review and run QA. |

Duration ranges are planning estimates, not service levels or completion guarantees. If a Fast or Pro task reveals higher risk or new dependencies, reclassify it before continuing.

## 2. Name Roles and Respect Their Boundaries

Every delegate uses one of the named roles in `agents/`; every role definition has `name`, `model`, `color`, and `description` frontmatter. Use `planner` for plans, `implementer` for changes, `reviewer` for read-only review, `debugger` for root-cause fixes, `ui-developer` for interface changes, `explorer` for read-only reconnaissance, and `qa-tester` for running-system checks.

`reviewer` and `explorer` receive native read-only tool profiles where the harness supports them. Other harnesses enforce those limits only through the role instructions. `planner` can write planning artifacts, and `qa-tester` may run commands with side effects; neither has a claim of path-level read-only enforcement. Never imply that prompt wording alone is a technical permission boundary.

## 3. Model and Harness Profiles

`templates/harness-profiles.json` is capability data, not runtime code. Its support values mean:

- **tested** — deterministic package installer or fixture checks cover the listed integration; this does not mean live agent behavior was tested.
- **partial** — Taskard installs or translates part of the harness configuration; untested behavior is stated explicitly.
- **recipe** — documentation explains how to use Taskard conventions with the harness; no native integration is claimed.

Profiles describe model inheritance and native permissions without pinning provider model IDs. Agent defaults and configuration are fallbacks; a session instruction takes precedence. Optional OpenCode role models can be set under `[harness_preferences.models.opencode]` using the provider's full `provider/model` value. Without an override, OpenCode uses the selected provider's model. Configuration is agent-read data and is never mutated at runtime. Harness fallback is a human choice, not automatic paid routing.

## 4. Source-Aware Briefs

For Pro and Max, write a brief with the required metadata and acceptance criteria. A Context Files entry uses `path#Lstart-Lend` and may add a symbol anchor, for example `src/auth.ts#L10-L32 :: validateSession`. Pointers are starting context, not a ban on reading callers, imports, tests, or dependencies. Expand the scope when needed and record why.

Each brief records:

```text
ROLE: <planner|implementer|reviewer|debugger|ui-developer|explorer|qa-tester>
GEAR: FAST|PRO|MAX
ATTEMPT_BUDGET: 1|2
BASE_COMMIT: <40-character commit SHA>
SOURCE_COMMIT: <40-character commit SHA used for pointers>
BLOCKED_BY: NONE|<comma-separated lane IDs>
REQUIRES_REVIEW: YES|NO
REQUIRES_QA: YES|NO
```

Before using pointers, check them at `SOURCE_COMMIT`. If relevant context changed from `SOURCE_COMMIT` to `BASE_COMMIT`, reread current callers and dependencies and refresh the brief or report it as stale. Changes from `BASE_COMMIT` to `HEAD_COMMIT` are the lane's intentional work.

## 5. Attempts and Verification

For implementation work, run a focused failing check before the fix when the change has consequential logic. The expected TDD **Red** result is a baseline observation; it does not count as a failed fix attempt. `ATTEMPT_BUDGET` is the total number of fix attempts, from 1 to 2. After the first unsuccessful fix attempt, one retry may remain. If that retry is unsuccessful, stop the lane and report the blocker and options; do not hide the failure by changing the acceptance criterion.

Implementer, debugger, and UI-developer reports use this contract, in this order, within 15 lines:

```text
STATUS: DONE|DONE_WITH_CONCERNS|BLOCKED|NEEDS_CONTEXT
DIFF_SUMMARY: <changed files and line counts>
BASE_COMMIT: <40-character SHA>
HEAD_COMMIT: <40-character SHA>
ATTEMPTS: <integer within ATTEMPT_BUDGET>
EVIDENCE_COMMAND: <exact command or NONE>
EVIDENCE_EXIT_STATUS: <integer or NONE>
EVIDENCE_FILE: <relative path or NONE>
EVIDENCE_SHA256: <64-character SHA-256 or NONE>
HASH: <same as HEAD_COMMIT, or N/A>
```

Fast work may provide the equivalent fields inline instead of writing a file. Review reports and verification reports are also limited to 15 lines and end with an explicit verdict or status. `taskard verify [--global|-g]` checks live lane metadata, source/commit freshness, report/evidence structure and hashes, dependencies, and declared review/QA gates. It is read-only and does not execute `EVIDENCE_COMMAND` or authenticate an agent claim. A successful empty check means no live lanes were found, not that any work ran. Legacy reports remain displayable, but missing required metadata fails verification. See [Role and Evidence Contracts](references/roles-and-evidence.md) for the exact checks.

## 6. Discipline Routing

Load external skills only when their trigger applies and the skill is installed. This table is guidance; it does not make a missing skill a blocker.

| Phase / condition | Skill | Function |
|---|---|---|
| Workflow start, if available | `using-superpowers` | Skill routing |
| Max scope is unclear | `brainstorming`, `grilling`, `domain-modeling` | Resolve intent and terms before locking a spec |
| Plan or lane briefs are needed | `writing-plans` | Produce actionable, verifiable briefs |
| Independent worktree lanes are needed | `dispatching-parallel-agents`, `using-git-worktrees` | Coordinate isolated work |
| Review feedback arrives | `receiving-code-review` | Verify findings before applying them |
| Root cause is unclear | `systematic-debugging`, `diagnosing-bugs` | Trace the defect through callers |
| Branch is ready for a human decision | `finishing-a-development-branch` | Present completion options |

The implementer role contains the minimum TDD and evidence rules; no external testing skill is required to follow them.

## Disclosed References

- [Project Setup Guide](references/project-setup.md)
- [Memory & Handoff Format](references/memory-and-handoff.md)
- [Cross-Harness Support](references/cross-harness.md)
- [Role and Evidence Contracts](references/roles-and-evidence.md)
