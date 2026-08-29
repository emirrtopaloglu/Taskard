# Taskard — Cross-Harness Headless Başlatma

Native subagent her zaman birincil tercihtir. Headless veya harici harness gerektiğinde:

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
