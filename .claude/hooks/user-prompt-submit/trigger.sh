#!/bin/bash
# User Prompt Hook - Lightweight tracking only
# Updates current-state.json on every user message

# Read JSON from stdin
json_input=$(cat)

# Extract prompt content from JSON
prompt_content=$(echo "$json_input" | jq -r '.prompt // .message // .content // empty' 2>/dev/null)

# Debug logging
echo "$(date): Prompt received, length: ${#prompt_content}" >> /tmp/prompt-debug.log

# Pass prompt content to state manager
"$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
  --mode=track \
  --trigger=prompt \
  --content="$prompt_content"