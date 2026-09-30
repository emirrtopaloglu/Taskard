# Taskard — Agent Rules & Repository Doctrine

## Non-Negotiable Iron Laws

1. **Keep documentation synchronized:** Installation and usage instructions live in `README.md` and `README.tr.md`. Every commit that alters a skill, agent role, config format, or workflow **MUST** update the documentation.
2. **Zero runtime orchestration:** Taskard conventions are agent-read files (`skills/`, `agents/`, `templates/`) plus an install/diagnostic CLI. No service runs agents at runtime.
3. **Configuration is agent-read data:** Configuration files (`config.toml`) are data read by agents. No mechanism mutates configuration files at runtime.
4. **Wayfinder map is single source of truth:** Architectural decisions are recorded in `.scratch/taskard/map.md`. Do not implement architectural changes without recording them in the decision log.
5. **Mandatory agent name:** When defining a new agent role in `agents/<name>.md`, the frontmatter must include `name:`, `model:`, `color:`, and `description:`. Anonymous agents are forbidden.
6. **No private test project names:** Do not write internal dogfooding project names into documentation, examples, or tests. Use the generic term "test project".
7. **Do not vendor external skills:** External skills are referenced in `docs/dependencies.md` and resolved only with the explicit `--install-skills` option.
8. **Classify speed gear at start:** Choose by risk before file count; authentication, security, data loss, destructive cleanup, and migrations outrank file count. Time ranges are estimates. A requested session gear takes precedence, with uncovered risk stated.
9. **Report evidence honestly:** The verifier checks structure, revision freshness, and recorded evidence hashes. It does not execute evidence commands or authenticate agent claims.

## Verification

```bash
npm test
bash -n install.sh
node bin/taskard.js init --dry-run
node evals/test-score.js
```

<!-- taskard:start -->
<!-- taskard:v3 -->
## Taskard
- Select Fast, Pro, or Max by risk first; auth, security, data loss, destructive cleanup, and migrations outrank file count. Time ranges are estimates; Fast may report inline.
- Delegate only to named roles. Reviewer and explorer receive native read-only profiles where supported; other harnesses enforce role boundaries through instructions only.
- Treat point-to-range pointers as starting context. Check them at SOURCE_COMMIT, detect relevant changes through BASE_COMMIT, and read callers or dependencies when needed.
- Expected TDD Red is a baseline, not a failed fix. ATTEMPT_BUDGET is 1 or 2 total fix attempts, leaving at most one retry.
- Use the 10-field commit/evidence report contract. Report hashes bind recorded files; they do not prove commands ran. Missing freshness metadata is UNVERIFIED.
- Configuration and harness profiles are agent-read data; never mutate them at runtime. Session model overrides take precedence.
- Do not write private dogfooding project names in docs, examples, or tests. Do not vendor external skills.
<!-- taskard:end -->
