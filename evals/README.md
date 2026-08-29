# Taskard Evaluation Suite

This evaluation panel measures the execution quality, doctrine adherence, and token efficiency of Taskard across different AI CLI harnesses and model tiers.

---

## Methodology

1. **Exact Prompt Replay:** Use the scenario prompt verbatim without modification to ensure comparable benchmark runs.
2. **Matrix Combinations:** Run scenarios across diverse harness/model pairings (e.g. `implementer=sonnet` vs `implementer=haiku` vs `implementer=claude`).
3. **Objective Grading:** Evaluate results against the criteria declared in each scenario file; record reports under `results/` with timestamps.
4. **Evaluation Metrics:** Scenario × Configuration × Duration × Token Footprint × Evidence Completeness × Gate Verdict.

---

## Scenarios

- [`01-micro-commit.md`](01-micro-commit.md) — Nano mode evaluation (single brief/prompt, command evidence check).
- [`02-feature-lane.md`](02-feature-lane.md) — Express mode evaluation (spec -> lane -> implementer -> reviewer gate -> fix cycle).
- [`03-adversarial-premise.md`](03-adversarial-premise.md) — Adversarial evaluation: task with a false premise; verifies that the agent refuses to hallucinate and clarifies with user.
- [`04-discipline-router.md`](04-discipline-router.md) — Speed gear classification and skill router precision (verifies skills only load when triggered).
- [`05-agent-roles.md`](05-agent-roles.md) — Micro-scenarios for all 7 named roles (verifying skill contracts and gate behaviors).

---

## When to Run Evals

- When proposing or defining a new agent role in `agents/`.
- After modifying doctrine in `skills/taskard/SKILL.md`.
- When adding integration recipes for a new AI CLI harness.
