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
12. Native global directives follow the selected harness through one shared resolver: Claude uses its existing paired files, Codex uses `CODEX_HOME/AGENTS.md` (default `~/.codex/AGENTS.md`), and OpenCode uses `AGENTS.md` in its resolved config directory, shared with the OpenCode role export root. Global native roots must remain inside `HOME` to preserve scoped filesystem safety; unsupported roots fail before writes and doctor reports them unhealthy.
13. Claude's `harness_preferences.models.claude_code` is the explicit native export override and takes precedence over `[roles]` for the same role; session instructions remain the top-level override.
14. A live lane has at most one active review record, canonically named `review.md`. Multiple active review records make the verdict `UNKNOWN`, keeping the lane out of completed cleanup and archive purge; historical reviews belong outside the active lane review namespace. Cleanup never infers chronology from filenames or mtimes.

## 2026-09-30 — Orchestration layer for parallel lanes

Status: shipped as agent-read conventions plus incremental verify coverage; enforcement grows only where deterministic checks exist.

15. Max writing lanes gain optional orchestration metadata after the base brief fields: `WORKTREE`, `BRANCH`, `SCOPE`, `WAVE`, `REVIEWER_MODEL`. Base fields and ordering are unchanged so existing briefs keep verifying.
16. One writing lane never shares its worktree, branch, or explicit scope with another live lane. Same-wave explicit scopes must be disjoint; `DERIVED` scopes are not cross-checked and the docs say so.
17. The concurrent writer ceiling defaults to 3 and lives in agent-read config (`[defaults].max_parallel`, validated integer 1–8). It is a convention for agents and reviewers, not a runtime limiter.
18. Merges are serial and user-owned; lanes never write the main branch. Merge records, dependency rebases, and conflict handling are documented conventions until tooling verifies them.
19. `verify` coverage remains incremental and labelled: it now checks optional field formats and ordering, missing declared worktrees once a report exists, shared worktrees/branches, and same-wave scope overlap. Diff containment, branch ancestry, merge records, and reviewer-model separation are explicitly "not yet checked" in orchestration.md; no document may imply enforcement that does not exist.
