#!/bin/bash

# Claude Code Command: /restore
# Restores development state from the most recent checkpoint

set -e

# Dynamic path detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CHECKPOINT_DIR="$PROJECT_DIR/.claude/brain/context/checkpoints"
SESSION_STATE_DIR="$PROJECT_DIR/.claude/brain/context/state"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[RESTORE]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Already in project dir from path detection

# Find latest checkpoint (including auto checkpoints)
latest_checkpoint=$(ls -t "$CHECKPOINT_DIR"/*.md 2>/dev/null | head -1)
# JSON checkpoints removed - only using markdown checkpoints
latest_session_state=$(ls -t "$SESSION_STATE_DIR"/current-state.json 2>/dev/null | head -1)

if [[ -z "$latest_checkpoint" ]]; then
    error "No checkpoints found. Create one with: /checkpoint"
    exit 1
fi

log "Restoring from latest checkpoint..."
info "Checkpoint: $(basename "$latest_checkpoint")"

# Display checkpoint information
echo -e "\n${BLUE}=== CHECKPOINT CONTEXT ===${NC}"
if [[ -n "$latest_session_state" ]]; then
    echo "Checkpoint Date: $(jq -r '.timestamp' "$latest_session_state" | sed 's/\(.\{8\}\)\(.\{6\}\)/\1 \2/')"
    echo "Git Branch: $(jq -r '.git.branch' "$latest_session_state")"
    echo "Git Commit: $(jq -r '.git.commit_short' "$latest_session_state")"
    echo "Modified Files: $(jq -r '.git.modified_files' "$latest_session_state")"
    
    # Process status
    dev_server=$(jq -r '.processes.dev_server' "$latest_session_state")
    vitest=$(jq -r '.processes.vitest' "$latest_session_state")
    
    echo "Previous Dev Server: $([ "$dev_server" = "true" ] && echo "✅ Running" || echo "❌ Stopped")"
    echo "Previous Vitest: $([ "$vitest" = "true" ] && echo "✅ Running" || echo "❌ Stopped")"
fi
echo -e "${BLUE}=========================${NC}\n"

# Show key sections from checkpoint
echo -e "${BLUE}=== DEVELOPMENT CONTEXT ===${NC}"
sed -n '/### Current Development Focus/,/### Running Processes/p' "$latest_checkpoint" | head -n -1
echo -e "${BLUE}==========================${NC}\n"

# Verify git status
current_branch=$(git branch --show-current)
if [[ -n "$latest_session_state" ]]; then
    checkpoint_branch=$(jq -r '.git.branch' "$latest_session_state")
    if [[ "$current_branch" != "$checkpoint_branch" ]]; then
        warn "Branch mismatch! Current: $current_branch, Checkpoint: $checkpoint_branch"
        read -p "Switch to checkpoint branch '$checkpoint_branch'? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout "$checkpoint_branch" || warn "Failed to switch branch"
        fi
    fi
fi

# Check dependencies
if [[ ! -d "node_modules" ]]; then
    warn "node_modules missing - running npm install..."
    npm install
fi

# Check if processes should be restarted
echo -e "\n${BLUE}=== PROCESS RESTORATION ===${NC}"

# Check if dev server should be running
if [[ -n "$latest_session_state" ]] && [[ $(jq -r '.processes.dev_server' "$latest_session_state") == "true" ]]; then
    if ! pgrep -f "vite" > /dev/null; then
        info "Dev server was running - would you like to restart it?"
        echo "Run: npm run serve"
    else
        info "Dev server is already running"
    fi
fi

# Check if tests should be running
if [[ -n "$latest_session_state" ]] && [[ $(jq -r '.processes.vitest' "$latest_session_state") == "true" ]]; then
    if ! pgrep -f "vitest" > /dev/null; then
        info "Vitest was running - would you like to restart it?"
        echo "Run: npx vitest"
    else
        info "Vitest is already running"
    fi
fi

# Display next steps from checkpoint
echo -e "\n${BLUE}=== NEXT STEPS ===${NC}"
sed -n '/### Next Session Action Items/,/---/p' "$latest_checkpoint" | head -n -1
echo -e "${BLUE}================${NC}\n"

# Show quick commands
echo -e "${GREEN}=== QUICK COMMANDS ===${NC}"
echo "Start dev server:     npm run serve"
echo "Run unit tests:       npx vitest"
echo "Run E2E tests:        npx playwright test"
echo "Check session:        ./.claude/session-manager.sh status"
echo "Create checkpoint:    /checkpoint"
echo "View full context:    cat $latest_checkpoint"
echo -e "${GREEN}==================${NC}\n"

# Display recent todos if available
if [[ -f ".claude/brain/memory/todos.json" ]]; then
    echo -e "${BLUE}=== CURRENT TODOS ===${NC}"
    cat ".claude/brain/memory/todos.json" | jq -r '.[] | "- [\(.status == "completed" and "x" or " ")] \(.content) (\(.status))"' 2>/dev/null || echo "Could not parse todos"
    echo -e "${BLUE}==================${NC}\n"
fi

# Check for test infrastructure status
if [[ -f ".claude/brain/context/TEST_IMPLEMENTATION_STATUS.md" ]]; then
    info "Test infrastructure status available in: .claude/brain/context/TEST_IMPLEMENTATION_STATUS.md"
fi

log "Context restored successfully!"
log "Full checkpoint details: $latest_checkpoint"

# Log the restoration
echo "$(date): Restored from checkpoint $(basename "$latest_checkpoint")" >> ".claude/logs/restorations.log"