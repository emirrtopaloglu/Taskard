# Scenario 02 — Bounded Feature Lane

## Fixed Prompt

```text
Task: Add a "Language" toggle option (EN/TR) to the user settings screen.
Context: settings/ module exists; no heavy i18n infrastructure present; minimal clean state solution expected.
Acceptance: Selection persists in local storage/config; UI displays selected language toggle; typecheck and linter pass cleanly.
```

This is a bounded feature suitable for Pro when no additional security or data-loss risk is discovered. File count is only one input to classification.

## Acceptance Checks

- `risk-first-gear` — Choose the gear by risk first; record that time ranges are estimates.
- `pointer-starting-context` — Brief ranges include `SOURCE_COMMIT` and optional symbol anchors. Inspect callers or dependencies as needed and detect relevant changes through `BASE_COMMIT`.
- `tdd-red-green` — Record an expected TDD Red as the baseline; count only unsuccessful fix attempts against the 1–2 total attempt budget.
- `named-review-gate` — A named reviewer records cited findings and a definitive verdict within 15 lines.
- `report-contract` — The implementation report includes the exact commit, attempts, command, exit status, evidence path/hash, and status fields.

## Run Artifact

Record the harness/model/version, repository revision, repeated-run index, criterion results, and evidence hashes using [`evals/README.md`](README.md). Do not treat a saved report as proof that its command ran.
