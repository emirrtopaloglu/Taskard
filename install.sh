#!/usr/bin/env bash
set -euo pipefail

SRC="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"
TMP_DIR=""
cleanup() {
  if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
    rm -rf -- "$TMP_DIR"
  fi
}
trap cleanup EXIT INT TERM

if [ -z "$SRC" ] || [ ! -f "$SRC/bin/taskard.js" ]; then
  if ! command -v git >/dev/null 2>&1; then
    echo "Error: git is required to download Taskard." >&2
    exit 1
  fi
  TMP_DIR="$(mktemp -d)"
  if ! git clone --depth 1 https://github.com/emirrtopaloglu/Taskard.git "$TMP_DIR" >/dev/null 2>&1; then
    echo "Error: Failed to clone Taskard repository. Check your internet connection." >&2
    exit 1
  fi
  SRC="$TMP_DIR"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js 18 or newer is required to install Taskard." >&2
  exit 1
fi
if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' 2>/dev/null; then
  echo "Error: Node.js 18 or newer is required to install Taskard." >&2
  exit 1
fi

if node "$SRC/bin/taskard.js" init --global "$@"; then
  exit 0
else
  status=$?
  exit "$status"
fi
