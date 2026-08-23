#!/usr/bin/env bash
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.taskard"

if ! command -v node >/dev/null 2>&1; then
  echo "HATA: node bulunamadı (https://nodejs.org)" >&2
  exit 1
fi

mkdir -p "$DEST"
cp -R "$SRC/src" "$DEST/"
cp -R "$SRC/bin" "$DEST/"
cp -R "$SRC/skills" "$DEST/"

mkdir -p "$HOME/.claude/skills" "$HOME/.agents/skills"
ln -sfn "$DEST/skills/taskard" "$HOME/.claude/skills/taskard"
ln -sfn "$DEST/skills/taskard" "$HOME/.agents/skills/taskard"

if [ ! -f "$HOME/.taskard/config.toml" ]; then
  cp "$SRC/templates/config.toml" "$HOME/.taskard/config.toml"
fi

echo "Taskard kuruldu → $DEST"
echo "Doğrulama: node $DEST/bin/taskard.js status"
