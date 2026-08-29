# Taskard — Agent Rules & Repository Doctrine

## Non-Negotiable Iron Laws

1. **Keep documentation synchronized:** Installation and usage instructions live in `README.md` and `README.tr.md`. Every commit that alters a skill, agent role, config format, or workflow **MUST** update the documentation.
2. **Zero runtime in core conventions:** Taskard is a pure convention package (`skills/`, `agents/`, `templates/`). The core orchestration layer contains no runtime code.
3. **Configuration is agent-read data:** Configuration files (`config.toml`) are data read by agents. No mechanism mutates configuration files at runtime.
4. **Wayfinder map is single source of truth:** Architectural decisions are recorded in `.scratch/taskard/map.md`. Do not implement architectural changes without recording them in the decision log.
5. **Mandatory agent name:** When defining a new agent role in `agents/<name>.md`, the frontmatter must include `name:`, `model:`, `color:`, and `description:`. Anonymous agents are forbidden.
6. **No private test project names:** Do not write internal dogfooding project names into documentation, examples, or tests. Use the generic term "test project".
7. **Do not vendor external skills:** External skills are referenced dynamically in `docs/dependencies.md` and resolved via `npx skills` during installation.
8. **Classify speed gear at start:** Every workflow starts by selecting a gear (⚡ Nano / 🚀 Express [Default] / 🏛️ Full). Session overrides take immediate precedence.

## Verification

```bash
npm test
bash -n install.sh
node bin/taskard.js init --dry-run
```
