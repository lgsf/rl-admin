#!/bin/bash

# Claude Brain System - Manual Checkpoint Creator
# Creates a manual checkpoint of the current state

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BRAIN_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")/brain"
CHECKPOINT_DIR="$BRAIN_DIR/context/checkpoints"
STATE_FILE="$BRAIN_DIR/context/state/current-state.json"
ACTIVE_SESSION="$BRAIN_DIR/context/ACTIVE_SESSION.md"

# Create checkpoint directory if not exists
mkdir -p "$CHECKPOINT_DIR"

# Generate timestamp
TIMESTAMP=$(date +%y%m%d_%H%M%S)
CHECKPOINT_FILE="$CHECKPOINT_DIR/${TIMESTAMP}_manual.md"

# Create checkpoint
echo "# Manual Checkpoint - $TIMESTAMP" > "$CHECKPOINT_FILE"
echo "" >> "$CHECKPOINT_FILE"
echo "**Created**: $(date)" >> "$CHECKPOINT_FILE"
echo "**Type**: Manual" >> "$CHECKPOINT_FILE"
echo "" >> "$CHECKPOINT_FILE"

# Add session info if exists
if [ -f "$ACTIVE_SESSION" ]; then
    echo "## Active Session" >> "$CHECKPOINT_FILE"
    echo '```' >> "$CHECKPOINT_FILE"
    cat "$ACTIVE_SESSION" >> "$CHECKPOINT_FILE"
    echo '```' >> "$CHECKPOINT_FILE"
    echo "" >> "$CHECKPOINT_FILE"
fi

# Add current state if exists
if [ -f "$STATE_FILE" ]; then
    echo "## Current State" >> "$CHECKPOINT_FILE"
    echo '```json' >> "$CHECKPOINT_FILE"
    jq '.' "$STATE_FILE" >> "$CHECKPOINT_FILE" 2>/dev/null || cat "$STATE_FILE" >> "$CHECKPOINT_FILE"
    echo '```' >> "$CHECKPOINT_FILE"
    echo "" >> "$CHECKPOINT_FILE"
fi

# Add todos if exist
TODOS_FILE="$BRAIN_DIR/context/active-todos.json"
if [ -f "$TODOS_FILE" ]; then
    echo "## Active Todos" >> "$CHECKPOINT_FILE"
    echo '```json' >> "$CHECKPOINT_FILE"
    jq '.' "$TODOS_FILE" >> "$CHECKPOINT_FILE" 2>/dev/null || cat "$TODOS_FILE" >> "$CHECKPOINT_FILE"
    echo '```' >> "$CHECKPOINT_FILE"
fi

echo "✅ Checkpoint created: $CHECKPOINT_FILE"

# Update state to record checkpoint
if [ -f "$STATE_FILE" ] && command -v jq >/dev/null 2>&1; then
    TEMP_FILE=$(mktemp)
    jq --arg checkpoint "${TIMESTAMP}_manual.md" \
       --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       '.snapshots.last_checkpoint = $checkpoint | 
        .snapshots.last_snapshot_time = $time |
        .snapshots.checkpoint_count = (.snapshots.checkpoint_count // 0) + 1' \
       "$STATE_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$STATE_FILE"
fi