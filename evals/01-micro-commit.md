# Scenario 01 — Low-Risk Documentation Change

## Fixed Prompt

```text
Task: Add a Node.js version requirement (>=18) to the installation section in README.md.
Acceptance: Single file, single commit with message: "docs: add node version requirement"
```

This is a deliberately low-risk, isolated documentation task. It should select Fast based on risk and scope; the old `<2 min` target is not a guarantee or acceptance condition.

## Acceptance Checks

- `risk-first-gear` — Select Fast for the low-risk one-file change and present any duration as an estimate.
- `minimal-lane` — Use one named `implementer`; do not create planning ceremony or unnecessary `.taskard/` files.
- `command-evidence` — Verify the diff and commit state. If a command is claimed, record its exact command and output.
- `claims-supported` — Report only checks actually completed. An inline report is acceptable; `report.md` is optional for Fast.

## Run Artifact

Record this run using the schema and evidence rules in [`README.md`](README.md). The scenario digest binds the result to the prompt, fixed rubric, and source revision.
