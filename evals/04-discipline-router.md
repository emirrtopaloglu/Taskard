# Scenario 04 — Discipline Router & Skill Precision

## Objective

Verify that speed gear classification functions accurately and that external skills load ONLY when specific trigger conditions are met (zero skill over-firing).

---

## Three Separate Evaluation Runs

### A. Fast Task (⚡ Fast Gear -> Zero Over-Firing)

```text
Run this task through the Taskard workflow: Add a Node >=18 requirement line to README.md and commit.
```

**Checks:**
- [ ] Classified as Fast gear.
- [ ] Heavy discipline skills (`brainstorming`, `grilling`, `wayfinder`) did NOT fire.
- [ ] Closed with single implementer, diff validation, and command evidence.

### B. Standard Feature (🚀 Pro Gear -> Targeted Review Gate)

```text
Run this task through the Taskard workflow: Add persistent language selection toggle (EN/TR) to user settings.
```

**Checks:**
- [ ] Classified as Pro gear; created point-to-range `brief.md`.
- [ ] Implementer executed native Red-Green-Refactor loop.
- [ ] Reviewer gate evaluated diff with `review.md` verdict.
- [ ] Updates provided as Humanish telegraph messages.

### C. Complex Multi-Lane Feature (🏛️ Max Gear -> DAG & Worktrees)

```text
Run this task through the Taskard workflow: Redesign authentication module (independent backend and frontend lanes), including database schema migration.
```

**Checks:**
- [ ] Classified as Max gear with explicit architectural justification.
- [ ] Generated visual execution DAG diagram.
- [ ] Independent lanes isolated via Git worktrees.
- [ ] 2-Strike budget declared in briefs.
- [ ] Concluded with QA validation and Opus final review.
