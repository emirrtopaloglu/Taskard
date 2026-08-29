# Taskard — Cross-Harness Headless Execution

Native subagents are always the primary choice. When headless execution or external harness delegation is required, use these commands:

## Claude Code
```bash
claude -p "$(cat brief.md)" --model sonnet --permission-mode bypassPermissions
```

## Codex CLI
```bash
codex exec -s danger-full-access --skip-git-repo-check "$(cat brief.md)"
```

## OpenCode
```bash
opencode run -m <provider/model> "$(cat brief.md)"
```

## Antigravity (Google DeepMind)
```bash
agy -p "<prompt>" --dangerously-skip-permissions --output-format json
```
