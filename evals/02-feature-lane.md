# Scenario 02 — Feature Lane (Express Mode Evaluation)

## Prompt (Use Verbatim)

```text
Task: Add a "Language" toggle option (EN/TR) to the user settings screen.
Context: settings/ module exists; no heavy i18n infrastructure present; minimal clean state solution expected.
Acceptance: Selection persists in local storage/config; UI displays selected language toggle; typecheck and linter pass cleanly.
```

## Expected Behavior

1. **Express Mode Execution:** Creates a point-to-range `brief.md` + `implementer` + scoped `reviewer` gate.
2. **Review Gate Enforcement:** Reviewer evaluates the diff against standards and returns a structured verdict (`PASS` / `FAIL`).
3. **Targeted Fix Loop:** If review finds issues, fixes are performed via targeted delegate execution rather than inline main-loop coding.
4. **Evidence-Backed Report:** Report contains raw linter and typecheck command output proof.

## Evaluation Criteria

- [ ] Express mode correctly identified (point-to-range `brief.md` created with `## Context Files` line pointers).
- [ ] Subagents spawned with explicit named roles (`implementer`, `reviewer`).
- [ ] Implementer applies native TDD and provides command evidence in `report.md`.
- [ ] Reviewer provides `file:line` cited findings with a definitive verdict in `review.md`.
- [ ] Fix cycle does not violate the 2-Strike Circuit Breaker.
- [ ] Merge and live acceptance decision is left to the human.
