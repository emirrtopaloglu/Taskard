# Taskard — Agent Rules & Repository Doctrine

## Non-Negotiable Iron Laws

1. **Keep documentation synchronized:** Installation and usage instructions live in `README.md` and `README.tr.md`. Every commit that alters a skill, agent role, config format, or workflow **MUST** update the documentation.
2. **Zero runtime in core conventions:** Taskard is a pure convention package (`skills/`, `agents/`, `templates/`). The core orchestration layer contains no runtime code.
3. **Configuration is agent-read data:** Configuration files (`config.toml`) are data read by agents. No mechanism mutates configuration files at runtime.
4. **Wayfinder map is single source of truth:** Architectural decisions are recorded in `.scratch/taskard/map.md`. Do not implement architectural changes without recording them in the decision log.
5. **Mandatory agent name:** When defining a new agent role in `agents/<name>.md`, the frontmatter must include `name:`, `model:`, `color:`, and `description:`. Anonymous agents are forbidden.
6. **No private test project names:** Do not write internal dogfooding project names into documentation, examples, or tests. Use the generic term "test project".
7. **Do not vendor external skills:** External skills are referenced dynamically in `docs/dependencies.md` and resolved via `npx skills` during installation.
8. **Classify speed gear at start:** Every workflow starts by selecting a gear (⚡ Fast / 🚀 Pro [Default] / 🏛️ Max). Session overrides take immediate precedence.

## Verification

```bash
npm test
bash -n install.sh
node bin/taskard.js init --dry-run
```

<!-- taskard:start -->
<!-- taskard:v2 -->
## Taskard
- Model routing: Pro mode uses sonnet for reviewer/debugger; Max mode uses opus; session prompts override both (~/.taskard/config.toml).
- Subagents execute only under explicit named roles (implementer, reviewer, ui-developer, qa-tester...) — anonymous agents are forbidden.
- Implementer operates with native TDD (Red-Green-Refactor) and command verification without external skill dependencies.
- Point-to-range standard: never copy code blocks into briefs; specify target file paths and line ranges (file#L10-L40); delegates read only the specified lines.
- Classify speed gear at start: 1-file fix uses Fast (<2m, zero overhead); 2-4 files use Pro (single brief + sonnet mini-review); complex work uses Max.
- Subagents default to bypassPermissions; humans own three gates: plan approval, pre-merge verification, and risky_operations.
- Never mutate config files at runtime; 2-Strike rule halts execution on 2nd error and presents 3 options to human.
- Telegraph output is Humanish: full sentences, clear meaning, no raw status code dumps.
<!-- taskard:end -->
