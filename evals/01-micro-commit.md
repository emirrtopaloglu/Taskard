# Scenario 01 — Micro Commit (Fast Mode Evaluation)

## Prompt (Use Verbatim)

```text
Task: Add a Node.js version requirement (>=18) to the installation section in README.md.
Acceptance: Single file, single commit with message: "docs: add node version requirement"
```

## Expected Behavior

1. **Fast Mode Classification:** Does NOT generate heavy `spec/` or `tasks/` documents.
2. **Single Delegate:** Spawns a single `implementer` with a concise report.
3. **Instant Validation:** Since scope is a single file documentation edit, the main loop validates the diff directly without a heavy review gate.
4. **Minimal Artifact Footprint:** Zero unnecessary runtime artifacts in `.taskard/`.

## Evaluation Criteria

- [ ] Fast mode correctly classified (no `spec/` or `tasks/` boilerplate generated).
- [ ] Subagent launched under explicit named role (`implementer`).
- [ ] Lane ID includes a 4-character random suffix if lane directory is created (`<ts>-<slug>-<suffix>`).
- [ ] Delegate response is a single Humanish telegraph sentence pointing to `report.md`.
- [ ] Diff and evidence verified directly by the main loop.
- [ ] No skill over-firing (did not trigger `grilling`, `brainstorming`, or `wayfinder` for a trivial edit).
- [ ] Output includes no unverified claims.
- [ ] Concludes with a clean manual verification checklist for the human.
