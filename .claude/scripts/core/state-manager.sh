#!/bin/bash
# Universal State Management System
# Single source of truth for all state updates in Claude Code

set -e

# Dynamic path detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CLAUDE_DIR="$PROJECT_DIR/.claude"
BRAIN_DIR="$CLAUDE_DIR/brain/context"
STATE_FILE="$BRAIN_DIR/state/current-state.json"
SESSION_FILE="$BRAIN_DIR/ACTIVE_SESSION.md"
CHECKPOINT_DIR="$BRAIN_DIR/checkpoints"
LOCK_FILE="/tmp/claude-state.lock"

# Parse arguments
MODE="track"  # Default mode
TRIGGER=""
CONTENT=""
FILES=""
TOOL=""
TASK=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --mode=*)
            MODE="${1#*=}"
            shift
            ;;
        --trigger=*)
            TRIGGER="${1#*=}"
            shift
            ;;
        --content=*)
            CONTENT="${1#*=}"
            shift
            ;;
        --files=*)
            FILES="${1#*=}"
            shift
            ;;
        --tool=*)
            TOOL="${1#*=}"
            shift
            ;;
        --task=*)
            TASK="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Lock file to prevent race conditions
acquire_lock() {
    local max_wait=10
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if mkdir "$LOCK_FILE" 2>/dev/null; then
            trap 'release_lock' EXIT
            return 0
        fi
        sleep 0.1
        waited=$((waited + 1))
    done
    echo "Failed to acquire lock after ${max_wait} seconds" >&2
    exit 1
}

release_lock() {
    rmdir "$LOCK_FILE" 2>/dev/null || true
}

# Get current timestamp in YYMMDD_HHmmss format for checkpoints
get_checkpoint_timestamp() {
    date +"%y%m%d_%H%M%S"
}

# Get ISO timestamp for JSON
get_iso_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Initialize state file if it doesn't exist
init_state_file() {
    if [ ! -f "$STATE_FILE" ]; then
        mkdir -p "$(dirname "$STATE_FILE")"
        cat > "$STATE_FILE" <<EOF
{
  "session": {
    "id": "session-$(date +%Y%m%d-%H%M%S)",
    "start_time": "$(get_iso_timestamp)",
    "last_update": "$(get_iso_timestamp)",
    "focus": "",
    "critical_context": []
  },
  "todos": {
    "in_progress": [],
    "pending": [],
    "completed": []
  },
  "activity": {
    "last_prompt": null,
    "last_tool": null,
    "prompt_count": 0,
    "tool_count": 0,
    "files_touched": [],
    "current_task": null
  },
  "today": {
    "files_modified": [],
    "tasks_completed": [],
    "blockers": []
  },
  "git": {
    "branch": "$(git branch --show-current 2>/dev/null || echo 'main')",
    "uncommitted_count": $(git status --porcelain 2>/dev/null | wc -l || echo 0)
  },
  "snapshots": {
    "last_checkpoint": null,
    "checkpoint_count": 0,
    "last_snapshot_time": null
  },
  "prompt_history": []
}
EOF
    fi
}

# Update JSON for activity tracking (lightweight)
update_json_activity() {
    local temp_file="/tmp/claude-state-$$.json"
    
    case "$TRIGGER" in
        prompt)
            # Create prompt entry with timestamp and content
            local prompt_entry=$(jq -n --arg time "$(get_iso_timestamp)" --arg content "$CONTENT" \
                '{time: $time, content: $content}')
            
            jq --arg timestamp "$(get_iso_timestamp)" \
               --argjson prompt "$prompt_entry" \
               '.activity.last_prompt = $timestamp |
                .activity.prompt_count += 1 |
                .session.last_update = $timestamp |
                .prompt_history = ((.prompt_history // []) + [$prompt] | .[-10:])' \
               "$STATE_FILE" > "$temp_file"
            ;;
        tool)
            # Handle files properly
            if [ -n "$FILES" ]; then
                local files_array=$(echo "$FILES" | tr ' ' '\n' | grep -v '^$' | jq -R . | jq -s .)
            else
                local files_array='[]'
            fi
            
            # Check if TodoWrite - if so, update todos and trigger snapshot
            if [ "$TOOL" = "TodoWrite" ]; then
                # Update activity first
                jq --arg timestamp "$(get_iso_timestamp)" \
                   --arg tool "$TOOL" \
                   '.activity.last_tool = $timestamp |
                    .activity.tool_count += 1 |
                    .session.last_update = $timestamp' \
                   "$STATE_FILE" > "$temp_file"
                mv "$temp_file" "$STATE_FILE"
                
                # Update todos from active-todos.json if it exists
                local todos_file="$BRAIN_DIR/active-todos.json"
                if [ -f "$todos_file" ]; then
                    # Merge todos into state
                    jq --slurpfile todos "$todos_file" \
                       '.todos = $todos[0].todos |
                        .session.last_update = $timestamp' \
                       "$STATE_FILE" > "$temp_file"
                    mv "$temp_file" "$STATE_FILE"
                fi
                
                # Note: Todo sync happens when active-todos.json is written
                return
            else
                # Regular tool update
                jq --arg timestamp "$(get_iso_timestamp)" \
                   --arg tool "$TOOL" \
                   --argjson files "$files_array" \
                   '.activity.last_tool = $timestamp |
                    .activity.tool_count += 1 |
                    .activity.files_touched = (.activity.files_touched + $files | unique) |
                    .session.last_update = $timestamp |
                    .today.files_modified = (if .today.files_modified then .today.files_modified + $files | unique else $files end)' \
                   "$STATE_FILE" > "$temp_file"
            fi
            ;;
    esac
    
    mv "$temp_file" "$STATE_FILE"
    
    # Check if we need to trigger an automatic snapshot
    check_snapshot_needed
}

# Check if automatic snapshot is needed
check_snapshot_needed() {
    local prompt_count=$(jq -r '.activity.prompt_count' "$STATE_FILE")
    local last_snapshot=$(jq -r '.snapshots.last_snapshot_time // "1970-01-01T00:00:00Z"' "$STATE_FILE")
    local current_time=$(date +%s)
    local last_snapshot_unix=$(date -d "$last_snapshot" +%s 2>/dev/null || echo 0)
    local time_since_snapshot=$((current_time - last_snapshot_unix))
    
    # Auto-snapshot after 20 prompts AND 15+ minutes (900 seconds)
    if [ $prompt_count -gt 20 ] && [ $time_since_snapshot -gt 900 ]; then
        echo "Auto-triggering snapshot (prompts: $prompt_count, time: ${time_since_snapshot}s)" >&2
        MODE="snapshot"
        TRIGGER="auto"
        create_snapshot
    fi
    
    # Or if significant file changes
    local files_count=$(jq -r '.activity.files_touched | length' "$STATE_FILE")
    if [ $files_count -gt 10 ]; then
        echo "Auto-triggering snapshot (files modified: $files_count)" >&2
        MODE="snapshot"
        TRIGGER="significant"
        create_snapshot
    fi
}

# Create checkpoint file using naming convention: YYMMDD_HHmmss_[trigger].md
create_checkpoint() {
    local timestamp=$(get_checkpoint_timestamp)
    local checkpoint_file="$CHECKPOINT_DIR/${timestamp}_${TRIGGER}.md"
    
    mkdir -p "$CHECKPOINT_DIR"
    
    # Get git status
    local git_status=$(cd "$PROJECT_DIR" && git status --short 2>/dev/null || echo "Not a git repository")
    local git_branch=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "unknown")
    local modified_files=$(cd "$PROJECT_DIR" && git diff --name-only 2>/dev/null | wc -l || echo "0")
    
    # Create checkpoint content
    cat > "$checkpoint_file" <<EOF
# $(date "+%Y-%m-%d %H:%M:%S") - $TRIGGER
**Type**: $(echo $TRIGGER | sed 's/\b\(.\)/\u\1/g') Checkpoint
**Checkpoint ID**: ${timestamp}_${TRIGGER}
**Trigger**: $TRIGGER
**Session Duration**: $(jq -r '.session.duration_minutes' "$STATE_FILE") minutes

## Quick Context
- **Git Branch**: $git_branch
- **Modified Files**: $modified_files
- **Files Touched This Session**: $(jq -r '.activity.files_touched | length' "$STATE_FILE")
- **Prompts**: $(jq -r '.activity.prompt_count' "$STATE_FILE")
- **Tool Uses**: $(jq -r '.activity.tool_count' "$STATE_FILE")

## Current Task
$(jq -r '.activity.current_task // "No active task"' "$STATE_FILE")

## Files Modified
\`\`\`
$(jq -r '.activity.files_touched | .[]' "$STATE_FILE" 2>/dev/null || echo "None")
\`\`\`

## Git Status
\`\`\`
$git_status
\`\`\`

## Session State
\`\`\`json
$(cat "$STATE_FILE")
\`\`\`

---
*Checkpoint created by unified state management system*
EOF
    
    echo "$checkpoint_file"
}

# Update ACTIVE_SESSION.md
update_active_session() {
    local checkpoint_file="$1"
    local timestamp=$(get_iso_timestamp)
    
    # Read current todos from state JSON
    local todos=""
    if [ -f "$STATE_FILE" ]; then
        todos=$(jq -r '
            .todos | 
            [
                (.in_progress // [] | map("- [ ] [IN PROGRESS] " + .content)),
                (.pending // [] | map("- [ ] " + .content)),
                (.completed // [] | map("- [x] " + .content))
            ] | 
            flatten | 
            join("\n")
        ' "$STATE_FILE" 2>/dev/null || echo "- No todos available")
    fi
    
    cat > "$SESSION_FILE" <<EOF
# ACTIVE SESSION STATE - LIVE CONTEXT
**Last Update**: $(date "+%Y-%m-%d %H:%M:%S")
**Trigger**: $TRIGGER
**Latest Checkpoint**: $(basename "$checkpoint_file")

## SESSION METRICS
- **Duration**: $(jq -r '.session.duration_minutes' "$STATE_FILE") minutes
- **Prompts**: $(jq -r '.activity.prompt_count' "$STATE_FILE")
- **Tool Uses**: $(jq -r '.activity.tool_count' "$STATE_FILE")
- **Files Modified**: $(jq -r '.activity.files_touched | length' "$STATE_FILE")
- **Checkpoints**: $(jq -r '.snapshots.checkpoint_count' "$STATE_FILE")

## CURRENT FOCUS
$(jq -r '.activity.current_task // "No active task"' "$STATE_FILE")

## RECENT ACTIVITY
- **Last Prompt**: $(jq -r '.activity.last_prompt // "None"' "$STATE_FILE")
- **Last Tool Use**: $(jq -r '.activity.last_tool // "None"' "$STATE_FILE")

## FILES IN PROGRESS
$(jq -r '.activity.files_touched | map("- " + .) | .[]' "$STATE_FILE" 2>/dev/null || echo "- None")

## ACTIVE TODOS
$todos

## RECOVERY INSTRUCTIONS
If context lost, run: \`/restore\` or check latest checkpoint:
\`$checkpoint_file\`

---
*Updated by state-manager.sh on $TRIGGER trigger*
EOF
}

# Update JSON for snapshot events
update_json_snapshot() {
    local checkpoint_name="$1"
    local temp_file="/tmp/claude-state-$$.json"
    
    jq --arg timestamp "$(get_iso_timestamp)" \
       --arg checkpoint "$(basename "$checkpoint_name")" \
       --arg trigger "$TRIGGER" \
       '.snapshots.last_checkpoint = $checkpoint |
        .snapshots.checkpoint_count += 1 |
        .snapshots.last_snapshot_time = $timestamp |
        .activity.prompt_count = 0 |
        .activity.files_touched = [] |
        .session.last_update = $timestamp' \
       "$STATE_FILE" > "$temp_file"
    
    mv "$temp_file" "$STATE_FILE"
}

# Create full snapshot (checkpoint + session + json)
create_snapshot() {
    echo "Creating snapshot for trigger: $TRIGGER" >&2
    
    # If todo trigger, sync todos first
    if [ "$TRIGGER" = "todo" ]; then
        local todos_file="$BRAIN_DIR/active-todos.json"
        if [ -f "$todos_file" ]; then
            echo "Syncing todos from active-todos.json" >&2
            local temp_file="/tmp/claude-state-$$.json"
            jq --slurpfile todos "$todos_file" \
               '.todos = $todos[0].todos' \
               "$STATE_FILE" > "$temp_file"
            mv "$temp_file" "$STATE_FILE"
        fi
    fi
    
    # Create checkpoint file
    local checkpoint_file=$(create_checkpoint)
    echo "Created checkpoint: $checkpoint_file" >&2
    
    # Update ACTIVE_SESSION.md
    update_active_session "$checkpoint_file"
    echo "Updated ACTIVE_SESSION.md" >&2
    
    # Update JSON with snapshot info
    update_json_snapshot "$checkpoint_file"
    echo "Updated state JSON" >&2
}

# Main execution
main() {
    acquire_lock
    init_state_file
    
    # Determine mode based on trigger if not explicitly set
    case "$TRIGGER" in
        prompt|tool)
            [ "$MODE" = "track" ] && MODE="track" || MODE="$MODE"
            ;;
        manual|task-complete|auto|idle|significant|todo)
            MODE="snapshot"
            ;;
        *)
            echo "Unknown trigger: $TRIGGER" >&2
            exit 1
            ;;
    esac
    
    # Execute based on mode
    case "$MODE" in
        track)
            update_json_activity
            ;;
        snapshot)
            create_snapshot
            ;;
        *)
            echo "Unknown mode: $MODE" >&2
            exit 1
            ;;
    esac
    
    release_lock
}

# Run main function
main