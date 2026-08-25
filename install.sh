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
rm -rf "$DEST/deck"
mkdir -p "$DEST/deck"
cp -R "$SRC/apps/deck/server" "$SRC/apps/deck/dist" "$SRC/apps/deck/README.md" "$DEST/deck/"
ln -sfn server/server.mjs "$DEST/deck/server.mjs"

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

sync_block() {
  local target="$1"
  mkdir -p "$(dirname "$target")"
  touch "$target"
  local block_ver
  block_ver="$(grep -o 'taskard:v[0-9]*' "$SRC/templates/directive-block.md" | head -1)"
  if grep -q "$block_ver" "$target"; then return 0; fi
  if grep -q "$MARK" "$target"; then
    awk -v s="$MARK" -v e="<!-- taskard:end -->" '$0~s{skip=1;next} $0~e{skip=0;next} !skip{print}' "$target" > "$target.tmp" && mv "$target.tmp" "$target"
    echo "Eski direktif bloğu kaldırıldı → $target"
  fi
  cat "$SRC/templates/directive-block.md" >> "$target"
  echo "Direktif bloğu kuruldu ($block_ver) → $target"
}

for target in "$CLAUDE_MD" "$AGENTS_MD"; do
  sync_block "$target"
done

echo "Taskard kuruldu → $DEST (kod yok, sadece konvansiyon) · Deck izleyici: node ~/.taskard/deck/server.mjs"
