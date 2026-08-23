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

ensure_external_skills() {
  local missing=0
  for s in test-driven-development grilling using-superpowers; do
    if [ ! -d "$HOME/.agents/skills/$s" ] && [ ! -d "$HOME/.claude/skills/$s" ]; then
      missing=1
    fi
  done
  if [ "$missing" = "0" ]; then return 0; fi
  if command -v npx >/dev/null 2>&1; then
    echo "Dış disiplin skill'leri kuruluyor (superpowers + mattpocock)..."
    npx -y skills add obra/superpowers --global || echo "UYARI: superpowers kurulumu başarısız" >&2
    npx -y skills add mattpocock/skills --global || echo "UYARI: mattpocock/skills kurulumu başarısız" >&2
  else
    echo "UYARI: npx bulunamadı — şu komutları elle çalıştır:" >&2
    echo "  npx skills add obra/superpowers --global" >&2
    echo "  npx skills add mattpocock/skills --global" >&2
  fi
}
ensure_external_skills

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
