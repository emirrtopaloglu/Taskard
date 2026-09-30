# Taskard Evaluation Scenarios

These fixed prompts and acceptance checks measure observable workflow behavior. They are not benchmark results. The repository currently has no fresh live harness runs or comparable historical run artifacts.

## Run a Scenario

Use the prompt verbatim from its scenario file and record each check as `pass`, `fail`, or `unverified`. Keep command output, conversation excerpts, and other evidence in files next to the run artifact. A scorer fixture is not a live harness run.

The `scenarioSha256` digest binds the scenario ID, source path, fixed rubric record, and scenario Markdown. Generate it with `node evals/score.js --scenario-hash 01-micro-commit`. A prompt or rubric edit makes older artifacts stale for current comparisons.

Each artifact is one JSON object. Required fields:

```json
{
  "schemaVersion": 1,
  "runId": "unique-run-id",
  "scenarioId": "01-micro-commit",
  "scenarioSha256": "64-character SHA-256 from --scenario-hash",
  "comparisonId": "same value for paired baseline and Taskard runs",
  "series": "baseline",
  "repeat": 1,
  "harnessId": "claude-code",
  "harnessVersion": "exact version reported by the harness",
  "model": "exact model identifier reported by the provider",
  "subjectRevision": "40- or 64-character project commit SHA",
  "taskardRevision": null,
  "startedAt": "2026-09-30T10:00:00.000Z",
  "durationMs": null,
  "metrics": {
    "inputTokens": null,
    "outputTokens": null,
    "costUsd": null,
    "manualInterventions": null
  },
  "checks": [
    { "id": "risk-first-gear", "status": "unverified", "evidence": [], "reason": "Run not yet performed" }
  ],
  "evidenceFiles": []
}
```

The snippet shows field shape only; its placeholders and unfinished checks make it invalid for scoring. Use a profile key from [`../templates/harness-profiles.json`](../templates/harness-profiles.json) for `harnessId`. For a Taskard run, set `series` to `taskard` and record its commit in `taskardRevision`; for a baseline run, `taskardRevision` is `null`. `subjectRevision` is the project commit used by both paired runs.

Each `checks` array must contain exactly the IDs listed for that scenario in [`scenarios.json`](scenarios.json). A passing or failing check must cite one or more evidence IDs. An unverified check has a short `reason`. `evidenceFiles` entries have the shape `{"id":"transcript","path":"evidence/transcript.txt","sha256":"<64 lowercase hex characters>"}`. Paths are relative to the directory containing the JSON artifact; absolute paths, `..`, symlinks, missing files, and hash mismatches are rejected.

`durationMs` and `costUsd` accept finite non-negative numbers or `null`. `inputTokens`, `outputTokens`, and `manualInterventions` are non-negative safe-integer counters or `null` when unavailable. Record only values captured from the run; the scorer does not infer or fill in missing numbers. Preserve the command and raw output in an evidence file referenced by a check.

## Score Supplied Artifacts

```bash
node evals/score.js path/to/run.json path/to/paired-run.json
node evals/test-score.js
```

`score.js` reads only the supplied JSON files and their relative evidence files. It does not start a harness, call an API, write output files, or perform live verification. It checks required metadata, scenario freshness, fixed rubric IDs, duplicate repeat slots, evidence paths, and SHA-256 hashes, then scores the recorded check statuses as an unweighted pass count. The result is only as trustworthy as the submitted evidence; a hash proves byte integrity after capture, not that the named command executed or that an agent's claim is true.

## Baseline and Comparison Method

For a useful comparison, run the same prompt, harness/version, model, project commit, Taskard revision, and environment once with Taskard enabled (`series: taskard`) and once with Taskard instructions disabled (`series: baseline`). Keep all other settings fixed. `comparisonId` identifies that matched setup. If those conditions differ, use a different ID and do not describe the groups as a controlled comparison. The scorer suppresses deltas if paired Taskard runs use different Taskard revisions.

The scorer groups by scenario, harness, harness version, model, project revision, and comparison ID. It reports per-series sample counts and medians. A metric-level percent reduction is emitted only when at least **three paired repeats** have numeric values for that metric. Unmatched runs remain visible as raw series summaries. A reduction is descriptive; the scorer does not calculate confidence intervals or establish causation.

## Current Evidence Status

`node evals/test-score.js` uses synthetic fixture artifacts to exercise scoring, rubric freshness, hash and path rejection, duplicate-repeat rejection, mixed-revision suppression, and the three-pair threshold. These fixture assertions are not benchmark measurements. No live Taskard-versus-baseline runs, raw benchmark logs, or savings claims are published; fresh live runs remain pending.

## Scenario Files

- [`01-micro-commit.md`](01-micro-commit.md) — Low-risk documentation change.
- [`02-feature-lane.md`](02-feature-lane.md) — Bounded feature lane.
- [`03-adversarial-premise.md`](03-adversarial-premise.md) — False-premise preflight.
- [`04-discipline-router.md`](04-discipline-router.md) — Independent Fast, Pro, and Max runs.
- [`05-agent-roles.md`](05-agent-roles.md) — Separate named-role runs and gate checks.
