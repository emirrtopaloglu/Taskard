# Taskard Roadmap

## v0.1.3 — Current Published Version

The package version in `package.json` is **0.1.3**. This release contains the zero-dependency initializer and CLI, seven named role definitions, Fast/Pro/Max convention, templates, and local validation suite. The conventions are read by agents; Taskard does not run a runtime orchestrator.

No reproducible raw benchmark runs are published. Earlier savings figures have been removed because the baseline, run artifacts, and methodology were not available for verification.

## Unreleased Hardening Work

The following changes are being prepared for a later release; they are not part of the published v0.1.3 package until released:

- Risk-first gear selection, source-aware briefs, bounded fix attempts, and consistent report metadata.
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
