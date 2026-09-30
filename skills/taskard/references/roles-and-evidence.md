# Role, Brief, and Evidence Contracts

## Brief Metadata

Pro and Max lane briefs include these fields in this order. `ATTEMPT_BUDGET` is the total number of fix attempts, not the number of retries.

```text
ROLE: planner|implementer|reviewer|debugger|ui-developer|explorer|qa-tester
GEAR: FAST|PRO|MAX
ATTEMPT_BUDGET: 1|2
BASE_COMMIT: <40-character commit SHA>
SOURCE_COMMIT: <40-character source snapshot SHA>
BLOCKED_BY: NONE|<comma-separated lane IDs>
REQUIRES_REVIEW: YES|NO
REQUIRES_QA: YES|NO
```

Context entries use `path#Lstart-Lend` and may include a symbol anchor, such as `src/auth.ts#L10-L32 :: validateSession`. The brief contains pointers rather than copied code. Delegates start from those ranges, then inspect relevant callers, imports, tests, and dependencies. Before implementation, check pointer context at `SOURCE_COMMIT` and detect relevant changes from `SOURCE_COMMIT` to `BASE_COMMIT`. Reread changed context or refresh the brief. Changes from `BASE_COMMIT` to `HEAD_COMMIT` are intentional lane work.

## Implementation Report

Implementer, debugger, and UI-developer `report.md` files use this exact order and stay within 15 lines:

```text
STATUS: DONE|DONE_WITH_CONCERNS|BLOCKED|NEEDS_CONTEXT
DIFF_SUMMARY: <changed files and line counts>
BASE_COMMIT: <40-character SHA>
HEAD_COMMIT: <40-character SHA>
ATTEMPTS: <integer from 1 through ATTEMPT_BUDGET>
EVIDENCE_COMMAND: <exact command or NONE>
EVIDENCE_EXIT_STATUS: <integer or NONE>
EVIDENCE_FILE: <relative path or NONE>
EVIDENCE_SHA256: <64-character SHA-256 or NONE>
HASH: <same as HEAD_COMMIT, or N/A>
```

Keep command output in the referenced evidence file. `EVIDENCE_SHA256` binds the report to those bytes; it does not authenticate command execution. Fast work may report the same fields inline rather than create `report.md`. If no check ran, say `NONE` and use a concern or blocked status as appropriate.

Expected TDD **Red** is recorded as the pre-fix baseline and does not consume an attempt. The first unsuccessful fix may be followed by one retry when `ATTEMPT_BUDGET` is 2. Stop after the final unsuccessful fix attempt and report the blocker.

## Role Output Limits

- Implementer, debugger, and UI-developer reports: at most 15 lines and the exact report fields above.
- Reviewer `review.md`: the single active review record for a lane, at most 15 lines; include `BASE_COMMIT`, `HEAD_COMMIT`, cited findings, and `VERDICT: PASS|PASS_WITH_NOTES|FAIL|UNVERIFIED`. Keep review history outside the lane's active `review*.md` namespace; multiple active review files make the verdict unknown and keep the lane out of completed cleanup and archive purge.
- QA `verification.md`: at most 15 lines; include `STATUS`, commit references, verified criteria and actual commands, evidence reference/hash, and gaps.
- Planner briefs and explorer maps: at most 15 lines for a summary unless the user asked for the full planning artifact.

Native permissions can restrict reviewer and explorer in Claude Code and OpenCode. In other harnesses, their read-only contract is an instruction, not a technical block. Planner may write planning artifacts. QA needs commands that may have side effects and has no Taskard read-only profile; use a test environment and the active harness permissions.

## Verify Limits

`taskard verify [--global|-g]` is a read-only check of every live lane in the selected `.taskard/lanes` directory. A missing lane directory succeeds as an empty check; a non-Git working directory fails. It reports nonzero for malformed or missing briefs/reports, invalid role/gear/budget, escaped or out-of-bounds source pointers, relevant source-context changes or dirty pointed files, stale report commits, unsuccessful or missing evidence commands, evidence hash mismatches, attempts over budget, incomplete lanes, failed/unknown review verdicts, unmet declared review/QA gates, missing/cyclic dependencies, or symlinked lane scope.

Zero means no checked violation was found; it does not mean any lane or test ran. Verify checks report structure, Git/log references, evidence file presence and digest, and declared gate results. It does not execute the supplied `EVIDENCE_COMMAND`, authenticate who ran a command, prove output came from it, or establish live behavior. Old report formats remain visible in lane listings, but missing required metadata fails verification rather than being treated as success.
