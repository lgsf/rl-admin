#!/bin/bash
# Post Tool Use Hook - Handles tool tracking and todo updates
# Reads JSON from stdin and processes tool usage

# Read JSON from stdin
json_input=$(cat)

# Extract tool name and file path from JSON
tool_name=$(echo "$json_input" | jq -r '.tool_name // empty')
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Debug logging
echo "$(date): Tool=$tool_name, File=$file_path" >> /tmp/hook-debug.log
echo "$json_input" >> /tmp/hook-json.log

# Check if TodoWrite was used
if [ "$tool_name" = "TodoWrite" ]; then
  echo "TodoWrite detected - triggering todo sync" >> /tmp/hook-debug.log
  "$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
    --mode=snapshot \
    --trigger=todo \
    --tool="TodoWrite"
# Check if active-todos.json was written
elif [[ "$file_path" == *"active-todos.json"* ]]; then
  echo "active-todos.json written - triggering todo sync" >> /tmp/hook-debug.log
  "$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
    --mode=snapshot \
    --trigger=todo \
    --tool="TodoSync"
else
  # Regular tool tracking
  "$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
    --mode=track \
    --trigger=tool \
    --tool="$tool_name" \
    --files="$file_path"
fi