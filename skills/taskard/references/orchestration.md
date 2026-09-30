# Orchestration Layer: Worktrees, Scopes, Waves, and Merge Order

Taskard coordinates several lanes in one repository. These conventions define how parallel lanes stay isolated, who may write where, and in what order work reaches the main branch. They extend the brief and evidence contracts in [Role and Evidence Contracts](roles-and-evidence.md).

## 1. One Writing Lane, One Worktree, One Branch

A Max lane that writes files runs in its own Git worktree and branch. Read-only and serial lanes may run in the main checkout.

```text
WORKTREE: <absolute worktree path> | NONE
BRANCH: <branch name> | NONE
```

- Two live lanes never share a worktree or a branch.
- A lane without a worktree writes nothing (explorer, reviewer, planner) or is an explicitly user-requested serial Fast/Pro change.
- Serial lanes (`BLOCKED_BY`) either continue on the parent lane's branch after it is merged or start a fresh branch from the parent's `HEAD_COMMIT`.

## 2. Write Scope Is a Lease

```text
SCOPE: <comma-separated repository-relative path prefixes> | DERIVED | NONE
```

- A lane may modify only paths inside its `SCOPE` prefixes. Prefixes are repository-relative; absolute paths and `..` segments are invalid.
- `DERIVED` derives the scope from the brief's Context Files parents. Use it when the brief is self-contained and no sibling lane in the wave touches the same area; `DERIVED` scopes are not cross-checked.
- Shared generated surfaces (lockfiles, generated clients, migrations, indexes) are outside normal lane scope. A lane that must regenerate one serializes the wave — no two concurrent lanes write the same generated artifact.
- Same-wave lanes must have disjoint, explicit scopes.

## 3. Waves and the Parallelism Ceiling

```text
WAVE: <non-negative integer; 0 for serial work>
```

- A wave is the set of lanes allowed to run concurrently. Lanes with unresolved dependencies enter a later wave.
- Default ceiling: three writing lanes per wave. The value lives in agent-read config (`[defaults].max_parallel`); reviewer, explorer, and QA read lanes do not count against it.
- Raising the ceiling beyond four is a user decision. Review capacity, not generation, is the bottleneck: when lanes waiting in review outnumber running lanes, start no new writers until a verdict lands.

## 4. Lane Lifecycle (derived, not stored)

Lane state is derived from the artifacts in the lane directory; Taskard stores no state file.

| Derived state | Signal |
|---|---|
| QUEUED | `brief.md` exists; `BLOCKED_BY` unresolved or wave not started |
| RUNNING | no final `report.md` status |
| REVIEW | report final; `REQUIRES_REVIEW: YES` and no passing `review.md` |
| VALIDATING | review passing; `REQUIRES_QA: YES` and no verifying `verification.md` |
| MERGE_READY | all required gates passed; merge not recorded |
| MERGED | merge commit recorded and dependents rebased |
| BLOCKED / NEEDS_CONTEXT | report status says so |
| UNKNOWN | malformed or conflicting records; never treated as done |

A failed review returns the lane to RUNNING with a fresh attempt inside `ATTEMPT_BUDGET`; earlier artifacts are not edited to simulate progress.

## 5. Merge Order: One Writer, Always Green

- Exactly one merge writer at a time — the user or an explicitly named integrator. Merges are serial even when lanes finish in parallel.
- Order is topological: dependencies first, then wave, then shared-scope lanes in finish order.
- Merge gate per lane: passing review when required, QA `VERIFIED` when required, and a recorded `HEAD_COMMIT`. A lane merges only from MERGE_READY.
- Mechanical shape: rebase on the integration branch, run the lane's `EVIDENCE_COMMAND` plus the repository's mandatory checks, merge, then record `STATUS: MERGED` and the merge commit in the lane directory.
- The main branch is never written directly by lanes. A failing lane goes back to RUNNING or BLOCKED; it is not "merged forward".
- Merge conflicts reopen the lane. Resolving someone else's accepted work is a new lane with its own brief and evidence.

## 6. Reviewer Separation

```text
REVIEWER_MODEL: <model alias> | ANY
```

- When `REQUIRES_REVIEW: YES`, the reviewer runs in a fresh context and receives the brief, the diff, and the acceptance criteria — not the implementer's narrative report.
- Max: prefer a different model family than the implementer and record it in `REVIEWER_MODEL`. Pro: same family is acceptable; the separation that matters is a fresh context.
- Review stays read-only where the harness supports it and reports only findings with severities; "no actionable findings" is a valid verdict.

## 7. Runtime Isolation

When a lane starts services:

- Give each concurrent lane its own port band, database/bucket/cache namespace, and environment file; never share a writable store between concurrent lanes.
- Name container projects per lane.
- Stop long-lived processes when the lane leaves RUNNING; lanes do not leave services behind.

## 8. Budgets

- `budget_minutes` (config) and per-lane estimates are planning ceilings, not guarantees; exceeding one is a signal to report and stop, not to continue silently.
- `ATTEMPT_BUDGET` stays 1–2 total fix attempts.
- Fleet limit: concurrent writers never exceed `max_parallel`.

## Verify Coverage (current)

`taskard verify` checks the orchestration fields it can check deterministically today: optional field formats and ordering, a declared `WORKTREE` that must exist once the lane has a report, worktrees or branches shared across live lanes, and overlapping explicit scopes within one wave.

Not yet checked, and therefore conventions enforced by reviewers and the user rather than by tooling: diff containment against `SCOPE`, that `BRANCH` contains `BASE_COMMIT`, merge-record validation, and reviewer-model separation. No document may imply enforcement that does not exist. Coverage is added incrementally and this section is updated with each change.
