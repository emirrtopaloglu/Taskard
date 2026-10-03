# Taskard Roadmap

## v0.2.1 — Current Published Version (2026-10-03)

The package version in `package.json` is **0.2.1**. This patch sets `effort: high` on all seven role definitions.

## v0.2.0 (2026-10-01)

This release lands the hardening work and the orchestration layer on top of the zero-dependency initializer and CLI, seven named role definitions, Fast/Pro/Max convention, templates, and local validation suite. The conventions are read by agents; Taskard does not run a runtime orchestrator.

No reproducible raw benchmark runs are published. Earlier savings figures have been removed because the baseline, run artifacts, and methodology were not available for verification.

Included in v0.2.0:

- Risk-first gear selection, source-aware briefs, bounded fix attempts, and consistent report metadata.
- An orchestration layer for parallel Max lanes: optional worktree/branch/scope/wave/reviewer metadata on briefs, a serial user-owned merge order, and incremental `verify` coverage for shared worktrees, same-wave scope overlaps, and missing declared worktrees.
- Capability-based harness profile data and tested/partial/recipe support labels. “Tested” means local installer/profile checks, not live agent behavior.
- A standard-library artifact scorer for fixed scenarios. It validates supplied run metadata and evidence hashes, scores recorded checks, and reports paired metrics only after at least three repeats. It does not start paid harness runs.
- Current benchmark status: no fresh live runs or comparable historical artifacts have been supplied.

## Planned

- Improve harness-specific install recipes as their formats are tested.
- Add optional memory handoff conventions when a reproducible use case is available.
- Expand scenario coverage as new role or workflow contracts are introduced.

## Horizon

- A separate visual execution inspector, if users request one.
- Project-board synchronization, if users request it.
- Automatic rate-limit fallback remains unimplemented; model and harness selection stay with the user.
