# Scenario 05 — Agent Roles & Behavioral Contracts (7 Roles × Micro-Scenarios)

## Objective

Verify that all 7 agent role contracts behave accurately in isolation: skill contracts trigger on demand, gate behaviors enforce boundaries, and reports conform to the ≤15-line contract. Each micro-scenario runs in an isolated session.

---

## Common Verification Checks (Applied to Every Role)

- [ ] Subagent launched under explicit named role (no anonymous agents).
- [ ] Conforms to report contract (status code + command evidence + ≤15 lines).
- [ ] Completion response is a single Humanish telegraph pointer.
- [ ] Discipline skills invoked according to role contract.

---

## Micro-Scenarios

### 1. `planner`
```text
Taskard workflow: Plan a small feature allowing users to export their notes as a plain .txt file. Generate specification and lane tasks.
```
- [ ] Briefs contain verifiable acceptance criteria (*"Export button generates .txt payload"*, not vague statements).
- [ ] `brainstorming` / `writing-plans` skill contract applied.
- [ ] Never modified production code (writes only to `.taskard/`).

### 2. `explorer`
```text
Taskard workflow: Investigate error-handling patterns in this repository before lane creation.
```
- [ ] Operated strictly read-only (zero file modifications).
- [ ] Every finding carries an exact `file:line` citation.
- [ ] Map output ≤20 lines with Structure, Conventions, and Risks sections.

### 3. `implementer`
```text
Taskard workflow: Add hour:minute formatting support to formatDate in utils/date.ts.
```
- [ ] Wrote a failing test first (native TDD Red-Green-Refactor loop).
- [ ] Included raw command and pass/fail evidence in `report.md`.
- [ ] Refrained from opportunistic refactoring outside target lines.

### 4. `ui-developer` (Web)
```text
Taskard workflow: Add a dark mode toggle button to the settings page.
```
- [ ] `frontend-design` contract applied.
- [ ] Handled interaction states (`loading`, `empty`, `error`, `active`).
- [ ] Documented manual visual verification items in `report.md`.

### 5. `ui-developer` (Mobile / Expo)
```text
Taskard workflow: Add a logout action button to the profile screen in an Expo app.
```
- [ ] Selected platform Expo skills (`expo-native-ui` / `expo-router`).
- [ ] Adhered to Apple HIG / Android Material conventions.

### 6. `debugger`
```text
Taskard workflow: Investigate flaky test <test-name> in the test suite and isolate the root cause.
```
- [ ] Reproduced the defect with a minimal test case or command.
- [ ] Identified root cause with a single concise sentence and `file:line` citation.
- [ ] Applied minimal targeted intervention without breaking adjacent logic.
- [ ] Applied `systematic-debugging` / `diagnosing-bugs` discipline.

### 7. `qa-tester`
```text
Taskard workflow: An external-impact lane (auth/database migration) passed review gate; run runtime verification.
```
- [ ] Evaluated the running system directly rather than reading code diffs.
- [ ] `verification.md` contains verified behaviors and identified gaps.
- [ ] Did not write code; reported defects as new actionable brief items.

---

## Gate Integration Checks

- [ ] `qa-tester` gate triggers on external-impact tasks (API, schema migration, auth).
- [ ] Internal-only tasks skip heavy QA runtime gates.
- [ ] If `qa-tester` is disabled in `config.toml`, manual verification checklist is presented to the human.
