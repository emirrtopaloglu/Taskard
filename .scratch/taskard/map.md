# Taskard architecture decision log

## 2026-09-30 — Reliable convention distribution and evidence
Status: authorized for implementation by the user after critical review.

1. Core remains agent-read Markdown/TOML; deterministic installation, diagnostics, cleanup and conformance checks remain in the existing zero-dependency CLI. No runtime orchestration service is added.
2. Installation is scoped and preserves user data. Broken bridges/config/directive markers are visible errors; package source presence is not installed health.
3. Completed cleanup requires unambiguous successful state and preserves active/shared temporary evidence. Prefer archive before irreversible purge; unknown ownership is preserved.
4. Optional verify checks document contracts and freshness against Git; it cannot prove an agent actually executed claimed tests. Reports bind evidence to source revisions and retain executable command/log references.
5. Risk determines gears before file count; expected TDD Red is not a retry failure. Point-to-range narrows initial context while allowing justified dependency/caller reads.
6. Harness capabilities, models and permissions are declared as data and translated only at explicit install time. Unsupported or untested integrations are labelled instead of claimed universal.
7. Published speed/cost claims require reproducible raw runs and metadata. Fixture/conformance evaluation is separate from real harness performance. No historical result is fabricated.
8. This decision log is deliberately tracked while other .scratch state remains ignored. README languages and doctrine share the same contracts.
9. Harness capability metadata is static `templates/harness-profiles.json` data. It uses support labels (`tested`, `partial`, `recipe`), avoids fixed provider model IDs, and records native read-only profiles only for roles and harnesses that support them.
10. Eval scores are computed from supplied artifacts bound to the fixed scenario source and relative evidence-file hashes. The runner does not spawn paid harnesses; comparative metrics require at least three paired repeats and remain descriptive.
11. Briefs and reports bind work to source/base/head commits. Expected TDD Red is baseline evidence, fix attempts are bounded at one retry, and verification cannot authenticate that a command ran.
