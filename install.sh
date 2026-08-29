#!/usr/bin/env bash
set -euo pipefail

START_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || date +%s000 2>/dev/null || echo 0)
SRC="$(cd "$(dirname "$0")" 2>/dev/null && pwd || echo "")"
DEST="$HOME/.taskard"
MARK="<!-- taskard:start -->"
TMP_DIR=""
CLEANUP_TMP=0

cleanup() {
  if [ "$CLEANUP_TMP" -eq 1 ] && [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
}
trap cleanup EXIT INT TERM

if [ -z "$SRC" ] || [ ! -d "$SRC/skills" ] || [ ! -d "$SRC/agents" ]; then
  TMP_DIR="$(mktemp -d)"
  CLEANUP_TMP=1
  git clone --depth 1 https://github.com/emirrtopaloglu/Taskard.git "$TMP_DIR" >/dev/null 2>&1 || {
    echo "Error: Failed to clone Taskard repository. Check your internet connection." >&2
    exit 1
  }
  SRC="$TMP_DIR"
fi

# --- Modern Color Palette ---
if [ -t 1 ]; then
  RESET="\033[0m"
  BOLD="\033[1m"
  DIM="\033[2m"
  ITALIC="\033[3m"
  
  C_VIOLET="\033[38;2;168;85;247m"   # #a855f7
  C_PURPLE="\033[38;2;192;132;252m"  # #c084fc
  C_CYAN="\033[38;2;56;189;248m"     # #38bdf8
  C_BLUE="\033[38;2;96;165;250m"     # #60a5fa
  C_EMERALD="\033[38;2;52;211;153m"  # #34d399
  C_AMBER="\033[38;2;251;191;36m"    # #fbbf24
  C_ROSE="\033[38;2;251;113;133m"    # #fb7185
  C_GRAY="\033[38;2;148;163;184m"    # #94a3b8
  C_DARK="\033[38;2;71;85;105m"      # #475569
else
  RESET="" BOLD="" DIM="" ITALIC=""
  C_VIOLET="" C_PURPLE="" C_CYAN="" C_BLUE="" C_EMERALD="" C_AMBER="" C_ROSE="" C_GRAY="" C_DARK=""
fi

# --- ASCII Banner ---
echo -e "\n${C_VIOLET}${BOLD}"
cat << 'EOF'
  ████████╗ █████╗ ███████╗██╗  ██╗ █████╗ ██████╗ ██████╗ 
  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗
     ██║   ███████║███████╗█████╔╝ ███████║██████╔╝██║  ██║
     ██║   ██╔══██║╚════██║██╔═██╗ ██╔══██║██╔══██╗██║  ██║
     ██║   ██║  ██║███████║██║  ██╗██║  ██║██║  ██║██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
EOF
echo -e "${RESET}${C_CYAN}${BOLD}     ◈ MULTI-HARNESS AGENT ORCHESTRATION CONVENTION ◈${RESET}"
echo -e "${C_GRAY}        Zero-Runtime · 3-Speed Gear · Aggressive Tiering${RESET}\n"

# --- Step Logger ---
log_step() {
  local num="$1"
  local title="$2"
  local detail="$3"
  echo -e "  ${C_CYAN}${BOLD}[${num}/5]${RESET} ${BOLD}${title}${RESET}"
  echo -e "        ${C_EMERALD}✔${RESET} ${C_GRAY}${detail}${RESET}"
}

# 1. Core Directories & Templates
mkdir -p "$DEST"
cp -R "$SRC/skills" "$DEST/"
rm -rf "$DEST/agents"
cp -R "$SRC/agents" "$DEST/"
cp -R "$SRC/templates" "$DEST/"
log_step "1" "Core Directories & Templates" "~/.taskard (skills, agents, templates synchronized)"

# 2. Harness Integration & Roles
mkdir -p "$HOME/.claude/skills" "$HOME/.claude/agents" "$HOME/.agents/skills" "$HOME/.opencode/agent" "$HOME/.opencode/agents" "$HOME/.config/opencode/agent" "$HOME/.config/opencode/agents"
ln -sfn "$DEST/skills/taskard" "$HOME/.claude/skills/taskard"
ln -sfn "$DEST/skills/taskard" "$HOME/.agents/skills/taskard"

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
    rm -f "$dest_dir/$name.md"
    if [ -n "$oc" ]; then
      sed "s/^color:.*/color: $oc/" "$src" > "$dest_dir/$name.md"
    else
      grep -v '^color:' "$src" > "$dest_dir/$name.md"
    fi
  done
}

agent_count=0
for agent_file in "$DEST"/agents/*.md; do
  [ -e "$agent_file" ] || continue
  name="$(basename "$agent_file")"
  ln -sfn "$agent_file" "$HOME/.claude/agents/$name"
  sync_opencode_agent "$agent_file"
  agent_count=$((agent_count + 1))
done
log_step "2" "Harness Bridges & Roles" "Claude Code & OpenCode (${agent_count} roles connected)"

# 3. Global Configuration
if [ ! -f "$HOME/.taskard/config.toml" ]; then
  cp "$SRC/templates/config.toml" "$HOME/.taskard/config.toml"
  log_step "3" "Configuration Layer" "~/.taskard/config.toml (created - Pro Default)"
else
  log_step "3" "Configuration Layer" "~/.taskard/config.toml (preserved - Pro Default)"
fi

# 4. External Skills Resolution
ensure_external_skills() {
  local missing=0
  for s in grilling using-superpowers; do
    if [ ! -d "$HOME/.agents/skills/$s" ] && [ ! -d "$HOME/.claude/skills/$s" ]; then
      missing=1
    fi
  done
  if [ "$missing" = "0" ]; then
    log_step "4" "Discipline Standards" "Superpowers & Matt Pocock (active)"
    return 0
  fi
  if command -v npx >/dev/null 2>&1; then
    echo -e "        ${C_AMBER}⚡ Resolving external packages via npx skills...${RESET}"
    npx -y skills add obra/superpowers --global >/dev/null 2>&1 || true
    npx -y skills add mattpocock/skills --global >/dev/null 2>&1 || true
    log_step "4" "Discipline Standards" "Resolved and connected via npx"
  else
    log_step "4" "Discipline Standards" "npx not found (manual installation recommended)"
  fi
}
ensure_external_skills

# 5. Directive Blocks
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
AGENTS_MD="$HOME/.claude/AGENTS.md"

sync_block() {
  local target="$1"
  mkdir -p "$(dirname "$target")"
  touch "$target"
  local want have
  want="$(awk '/taskard:start/{f=1} f{print} /taskard:end/{exit}' "$SRC/templates/directive-block.md" | sed 's/[[:space:]]*$//' | shasum -a 256 | cut -d' ' -f1)"
  have="$(awk '/taskard:start/{f=1} f{print} /taskard:end/{exit}' "$target" | sed 's/[[:space:]]*$//' | shasum -a 256 | cut -d' ' -f1)"
  if [ "$want" = "$have" ]; then
    return 0
  fi
  if grep -q "$MARK" "$target"; then
    awk -v s="$MARK" -v e="<!-- taskard:end -->" '$0~s{skip=1;next} $0~e{skip=0;next} !skip{print}' "$target" > "$target.tmp" && mv "$target.tmp" "$target"
  fi
  cat "$SRC/templates/directive-block.md" >> "$target"
}

for target in "$CLAUDE_MD" "$AGENTS_MD"; do
  sync_block "$target"
done
log_step "5" "Harness Directives" "CLAUDE.md & AGENTS.md directive blocks up to date"

# --- Elapsed Time ---
END_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || date +%s000 2>/dev/null || echo 0)
DURATION=$((END_TIME - START_TIME))
if [ "$DURATION" -le 0 ] || [ "$START_TIME" -eq 0 ]; then
  DUR_STR="<100ms"
else
  DUR_STR="${DURATION}ms"
fi

# --- 1. Role Roster Card ---
echo -e "\n  ${C_VIOLET}${BOLD}╭────────────────────────────── ROLE ROSTER ──────────────────────────────╮${RESET}"
echo -e "  ${C_VIOLET}│${RESET}  ${C_PURPLE}${BOLD}STRATEGY (Tier 1)${RESET}       ${C_BLUE}${BOLD}EXECUTION (Tier 2)${RESET}      ${C_EMERALD}${BOLD}ASSIST (Tier 3)${RESET}        ${C_VIOLET}│${RESET}"
echo -e "  ${C_VIOLET}│${RESET}  ${C_PURPLE}●${RESET} planner  ${DIM}[opus]${RESET}        ${C_BLUE}●${RESET} implementer  ${DIM}[sonnet]${RESET} ${C_EMERALD}●${RESET} explorer  ${DIM}[haiku]${RESET}    ${C_VIOLET}│${RESET}"
echo -e "  ${C_VIOLET}│${RESET}  ${C_PURPLE}●${RESET} reviewer ${DIM}[sonnet/opus]${RESET} ${C_BLUE}●${RESET} ui-developer ${DIM}[sonnet]${RESET} ${C_EMERALD}●${RESET} qa-tester ${DIM}[haiku]${RESET}    ${C_VIOLET}│${RESET}"
echo -e "  ${C_VIOLET}│${RESET}  ${C_PURPLE}●${RESET} debugger ${DIM}[sonnet/opus]${RESET}                                                   ${C_VIOLET}│${RESET}"
echo -e "  ${C_VIOLET}${BOLD}╰─────────────────────────────────────────────────────────────────────────╯${RESET}"

# --- 2. Success Card ---
HEADER_TEXT="TASKARD READY · SYNCHRONIZATION COMPLETE (${DUR_STR})"
HEADER_VIS_LEN=$((44 + ${#DUR_STR}))
HEADER_PAD_LEN=$((69 - HEADER_VIS_LEN))
if [ "$HEADER_PAD_LEN" -lt 0 ]; then HEADER_PAD_LEN=0; fi
HEADER_PAD=$(printf '%*s' "$HEADER_PAD_LEN" "")

echo -e "\n  ${C_EMERALD}${BOLD}╭─────────────────────────────────────────────────────────────────────────╮${RESET}"
echo -e "  ${C_EMERALD}│${RESET}  ${BOLD}${C_EMERALD}✨${RESET}  ${BOLD}${HEADER_TEXT}${RESET}${HEADER_PAD}  ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}${BOLD}├─────────────────────────────────────────────────────────────────────────┤${RESET}"
echo -e "  ${C_EMERALD}│${RESET}  ${C_GRAY}• Speed Gear   :${RESET} ${C_CYAN}${BOLD}Pro (Default)${RESET} ${DIM}· Fast · Max${RESET}                          ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}│${RESET}  ${C_GRAY}• Safety       :${RESET} ${C_AMBER}${BOLD}2-Strike Circuit Breaker${RESET} ${DIM}· 3 Approval Gates${RESET}         ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}│${RESET}  ${C_GRAY}• Config File  :${RESET} ${C_DARK}~/.taskard/config.toml${RESET}                                 ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}│${RESET}                                                                         ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}│${RESET}  ${BOLD}🚀 Quick Start:${RESET}                                                         ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}│${RESET}     ${C_AMBER}${BOLD}\"Run this task through the Taskard workflow\"${RESET}                     ${C_EMERALD}│${RESET}"
echo -e "  ${C_EMERALD}${BOLD}╰─────────────────────────────────────────────────────────────────────────╯${RESET}\n"



