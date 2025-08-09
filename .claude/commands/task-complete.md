# /task-complete

Creates a snapshot when completing a significant task or todo item.

## Implementation
```bash
#!/bin/bash
# Execute the unified state manager in snapshot mode
"$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
  --mode=snapshot \
  --trigger=task-complete \
  --task="$1"
```

## Usage

```bash
/task-complete "Implemented user authentication"
```

## Description

The `/task-complete` command should be triggered when Claude completes a significant task from the todo list. It creates a full snapshot to preserve the state at this milestone.

Creates:
1. Checkpoint file (`YYMMDD_HHmmss_task-complete.md`)
2. Updates ACTIVE_SESSION.md
3. Updates current-state.json

## When Claude Should Use This

- After completing a todo item marked as "completed" 
- When finishing a major implementation
- After fixing a significant bug
- When completing a feature request
- After major refactoring work

## Notes

- This is primarily for Claude to use when marking todos as complete
- Creates a full snapshot (all 3 files)
- Helps track progress through tasks
- Provides recovery points at task boundaries