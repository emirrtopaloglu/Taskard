# Contributing to Taskard

Taskard is a set of agent workflow conventions with a small install and diagnostic CLI for developer harnesses. It does not run agents in a Taskard orchestration service.

## Project Rules

1. **Keep the core declarative.** Role contracts, skills, configuration, and harness profiles live in `skills/`, `agents/`, and `templates/`. Do not add a runtime orchestration service.
2. **Use named roles.** Every `agents/<name>.md` frontmatter has `name`, `model`, `color`, and `description`. Model names are defaults or aliases; harness availability and session overrides take precedence.
3. **Treat pointers as starting context.** Briefs use `path#Lstart-Lend`, record `SOURCE_COMMIT` and `BASE_COMMIT`, and do not paste source code. Delegates may read callers, imports, tests, or dependencies and should state why scope expanded. Detect relevant changes from source to base.
4. **Do not vendor external skills.** Reference optional upstream skills in `docs/dependencies.md`; resolution is an explicit global install option, not a default test or install side effect.
5. **Keep private project names and credentials out of docs, tests, and examples.** Use generic terms such as “test project.”
6. **Keep documentation synchronized.** Changes to skills, roles, config, profiles, or workflow must update both `README.md` and `README.tr.md`.
7. **Keep claims tied to evidence.** Harness support labels describe local installer/profile checks, partial integration, or a recipe. They do not imply live agent behavior. Eval fixtures are scorer self-checks, not benchmark runs.
8. **Choose gears by risk first.** Authentication, security, data loss, destructive cleanup, and migrations outrank file count. Time ranges are estimates.

## Proposing a Role

The standard roster has seven roles: `planner`, `implementer`, `reviewer`, `debugger`, `ui-developer`, `explorer`, and `qa-tester`. Before adding another role, explain why the task cannot use an existing role with an optional skill. Include its frontmatter and input/output contract, and add an eval scenario with fixed acceptance checks.

Reviewer and explorer should use positive native read-only profiles where a harness supports them. Do not claim a role is technically read-only in harnesses that only receive prompt instructions. Planner may write planning artifacts; QA needs command execution and may cause side effects.

## Changing Workflow or Profiles

- Record architecture decisions in `.scratch/taskard/map.md` and keep that decision log tracked.
- Keep `templates/harness-profiles.json` declarative. Do not pin unverified provider model IDs or add general runtime adapters.
- Keep configuration agent-read; do not mutate TOML during runtime.
- Preserve the expected Red versus unsuccessful fix distinction and the 1–2 total-attempt budget.
- Follow the brief and report contracts in `skills/taskard/references/roles-and-evidence.md`.

## CLI and Evaluation Tooling

The CLI targets Node.js 18 or newer and uses Node standard libraries. Run installation checks with an isolated home and working directory; do not install optional external skills or write to the contributor's global configuration during tests.

The eval scorer reads only supplied artifacts and evidence files. It does not launch harnesses or paid models. Comparative claims require at least three paired repeats with the same scenario, harness/version, model, and project revision; no live benchmark results should be invented.

## Local Verification

```bash
npm test
bash -n install.sh
node --check bin/taskard.js
node bin/taskard.js init --dry-run
node evals/test-score.js
```

## Pull Requests

Use a conventional commit message (`feat:`, `fix:`, `docs:`, or `chore:`). Update both READMEs when user-facing behavior changes. Run the repository checks, link evidence to the tested source revision, and leave merge decisions to maintainers.
