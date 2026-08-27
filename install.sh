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

mkdir -p "$HOME/.claude/skills" "$HOME/.claude/agents" "$HOME/.agents/skills" "$HOME/.opencode/agent" "$HOME/.opencode/agents" "$HOME/.config/opencode/agent" "$HOME/.config/opencode/agents"
ln -sfn "$DEST/skills/taskard" "$HOME/.claude/skills/taskard"
ln -sfn "$DEST/skills/taskard" "$HOME/.agents/skills/taskard"

# Claude Code renk adları → opencode tema tokenları (şema: "#RRGGBB" | primary|secondary|accent|success|warning|error|info).
# Kaynak .md tek kaynaktır; opencode'a SYMLINK değil ÇEVİRİLMİŞ KOPYA yazılır — renk değeri iki harness'ta da geçerli kalır.
color_for_opencode() {
  case "$1" in
    blue)            echo "primary" ;;
    purple)          echo "secondary" ;;
    orange|pink)     echo "accent" ;;
    green)           echo "success" ;;
    yellow)          echo "warning" ;;
    red)             echo "error" ;;
    cyan)            echo "info" ;;
    primary|secondary|accent|success|warning|error|info) echo "$1" ;;
    *)
      if [[ "$1" =~ ^#[0-9a-fA-F]{6}$ ]]; then
        echo "$1"
      else
        echo ""
      fi
      ;;
  esac
}

sync_opencode_agent() {
  local src="$1"
  local name
  name="$(basename "$src" .md)"
  local c oc
  c="$(awk '/^color:[[:space:]]*/{print $2; exit}' "$src" | tr -d '"'\'' ')"
  oc="$(color_for_opencode "$c")"
  for dest_dir in "$HOME/.config/opencode/agent" "$HOME/.config/opencode/agents" "$HOME/.opencode/agent" "$HOME/.opencode/agents"; do
    mkdir -p "$dest_dir"
    rm -f "$dest_dir/$name.md"   # önce kaldır: symlink ise > yönlendirmesi hedefi bozar
    if [ -n "$oc" ]; then
      sed "s/^color:.*/color: $oc/" "$src" > "$dest_dir/$name.md"
    else
      grep -v '^color:' "$src" > "$dest_dir/$name.md"
    fi
  done
}

for agent_file in "$DEST"/agents/*.md; do
  [ -e "$agent_file" ] || continue
  name="$(basename "$agent_file")"
  ln -sfn "$agent_file" "$HOME/.claude/agents/$name"
  sync_opencode_agent "$agent_file"
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
  local want have
  want="$(awk '/taskard:start/{f=1} f{print} /taskard:end/{exit}' "$SRC/templates/directive-block.md" | sed 's/[[:space:]]*$//' | shasum -a 256 | cut -d' ' -f1)"
  have="$(awk '/taskard:start/{f=1} f{print} /taskard:end/{exit}' "$target" | sed 's/[[:space:]]*$//' | shasum -a 256 | cut -d' ' -f1)"
  if [ "$want" = "$have" ]; then return 0; fi
  if grep -q "$MARK" "$target"; then
    awk -v s="$MARK" -v e="<!-- taskard:end -->" '$0~s{skip=1;next} $0~e{skip=0;next} !skip{print}' "$target" > "$target.tmp" && mv "$target.tmp" "$target"
    echo "Direktif bloğu güncellendi → $target"
  else
    echo "Direktif bloğu kuruldu → $target"
  fi
  cat "$SRC/templates/directive-block.md" >> "$target"
}

for target in "$CLAUDE_MD" "$AGENTS_MD"; do
  sync_block "$target"
done

echo "Taskard kuruldu → $DEST"
