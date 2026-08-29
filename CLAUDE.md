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
