# Scenario 04 — Gear and Skill Routing

This scenario has three independent run artifacts so each fixed prompt, harness/model version, and set of checks stays reproducible.

## A. Fast Task — `04-fast`

```text
Run this task through the Taskard workflow: Add a Node >=18 requirement line to README.md and commit.
```

- `fast-classification` — Select Fast because the change is low-risk and isolated; duration is only an estimate.
- `no-overfiring` — Do not load grilling, brainstorming, or wayfinder without a trigger.
- `inline-proof` — Use a concise inline report when sufficient; include only verified evidence.

## B. Standard Feature — `04-pro`

```text
Run this task through the Taskard workflow: Add persistent language selection toggle (EN/TR) to user settings.
```

- `pro-classification` — Select Pro based on risk and scope, then create a source-aware brief.
- `fixed-review` — Run the named reviewer gate and record its actual verdict.
- `evidence-tied` — Bind evidence to the base/head commits and label missing checks unverified.

## C. High-Risk Feature — `04-max`

```text
Run this task through the Taskard workflow: Redesign authentication module (independent backend and frontend lanes), including database schema migration.
```

- `max-risk-routing` — Choose Max because authentication and migration risk outrank file count.
- `multi-lane-isolation` — Use named lanes and isolate independent changes when worktrees are available.
- `quality-gates` — Report review and QA as executed, unavailable, or pending; do not imply a gate ran when it did not.

## Scoring

Score A, B, and C separately with the fixed criteria in [`scenarios.json`](scenarios.json). Do not require a visual DAG; a concise dependency description is enough when it communicates the actual lane relationships.
