# Scenario 05 — Named Role Contracts

Each role prompt is a separate run artifact. Record the role, harness, model and version for each run; role defaults may resolve to different models.

## `05-planner`

```text
Taskard workflow: Plan a small feature allowing users to export their notes as a plain .txt file. Generate specification and lane tasks.
```

- `acceptance-concrete` — Briefs use observable criteria such as generating a `.txt` payload.
- `planner-write-boundary` — Planner may write planning artifacts but does not modify production code.

## `05-explorer`

```text
Taskard workflow: Investigate error-handling patterns in this repository before lane creation.
```

- `explorer-readonly` — Explorer makes no file changes and cites relevant source ranges.
- `read-only-enforcement` — Claude Code and OpenCode use native read-only profiles; other harnesses are reported as instruction-only.

## `05-implementer`

```text
Taskard workflow: Add hour:minute formatting support to formatDate in utils/date.ts.
```

- `red-test-before-fix` — Run and record an expected failing check before the fix when the logic is consequential.
- `single-retry` — Count failed fix attempts separately from expected Red; allow at most one retry.
- `report-evidence` — Include commit references, actual command/exit status, evidence file/hash, and attempt count.

## `05-ui-web`

```text
Taskard workflow: Add a dark mode toggle button to the settings page.
```

- `accessible-contract` — Include accessible interaction and the states relevant to the feature.
- `manual-visual-evidence` — Record exact manual visual checks when automation cannot verify the UI.

## `05-ui-mobile`

```text
Taskard workflow: Add a logout action button to the profile screen in an Expo app.
```

- `platform-contract` — Apply platform conventions only when the target is confirmed; label unavailable native enforcement.
- `manual-visual-evidence` — Record exact manual visual checks when automation cannot verify the UI.

## `05-debugger`

```text
Taskard workflow: Investigate flaky test <test-name> in the test suite and isolate the root cause.
```

- `root-cause` — Reproduce the issue and cite the shared root cause, not just a caller symptom.
- `single-retry` — Count failed fix attempts separately from expected Red; allow at most one retry.
- `report-evidence` — Include commit references, actual command/exit status, evidence file/hash, and attempt count.

## `05-qa`

```text
Taskard workflow: An external-impact lane (auth/database migration) passed review gate; run runtime verification.
```

- `qa-runtime-criteria` — Check the running system and report commands actually executed; source review alone is not runtime verification.
- `verify-authenticity-limits` — Distinguish recorded output and hashes from authenticated execution.

## `05-gates`

```text
Taskard workflow: Decide whether QA should run for an API, schema migration, authentication change, and an internal-only change.
```

- `risk-triggers-qa` — Trigger QA based on external impact and risk, not file count alone.
- `disabled-qa-checklist` — If QA is disabled or unavailable, give the human a manual verification checklist.

Role reports and reviews have a shared 15-line ceiling. These scenarios evaluate convention adherence; the recorded results do not prove behavior for all prompts or models.
