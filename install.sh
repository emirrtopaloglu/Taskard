#!/usr/bin/env bash
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.taskard"
MARK="<!-- taskard:start -->"

mkdir -p "$DEST"
cp -R "$SRC/skills" "$DEST/"
rm -rf "$DEST/agents"
cp -R "$SRC/agents" "$DEST/"
cp -R "$SRC/templates" "$DEST/"

mkdir -p "$HOME/.claude/skills" "$HOME/.claude/agents" "$HOME/.agents/skills" "$HOME/.opencode/agent"
ln -sfn "$DEST/skills/taskard" "$HOME/.claude/skills/taskard"
ln -sfn "$DEST/skills/taskard" "$HOME/.agents/skills/taskard"
for agent_file in "$DEST"/agents/*.md; do
  [ -e "$agent_file" ] || continue
  name="$(basename "$agent_file")"
  ln -sfn "$agent_file" "$HOME/.claude/agents/$name"
  ln -sfn "$agent_file" "$HOME/.opencode/agent/$name"
done

if [ ! -f "$HOME/.taskard/config.toml" ]; then
  cp "$SRC/templates/config.toml" "$HOME/.taskard/config.toml"
fi

CLAUDE_MD="$HOME/.claude/CLAUDE.md"
AGENTS_MD="$HOME/.claude/AGENTS.md"
for target in "$CLAUDE_MD" "$AGENTS_MD"; do
  mkdir -p "$(dirname "$target")"
  touch "$target"
  if ! grep -q "$MARK" "$target"; then
    cat "$SRC/templates/directive-block.md" >> "$target"
    echo "Direktif bloğu eklendi → $target"
  fi
done

echo "Taskard kuruldu → $DEST (kod yok, sadece konvansiyon)"
