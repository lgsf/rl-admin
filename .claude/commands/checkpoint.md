# /checkpoint

Creates a manual checkpoint with full snapshot of the current development state.

## Implementation
```bash
#!/bin/bash
# Execute the unified state manager in snapshot mode
"$CLAUDE_PROJECT_DIR/.claude/scripts/core/state-manager.sh" \
  --mode=snapshot \
  --trigger=manual
```

## Usage

```bash
/checkpoint
```

## Description

The `/checkpoint` command creates a comprehensive snapshot that includes:

1. **Checkpoint File** (`YYMMDD_HHmmss_manual.md`)
   - Git status and branch info
   - Modified files list
   - Session metrics (prompts, tool uses)
   - Current task and todos
   - Full session state JSON

2. **ACTIVE_SESSION.md Update**
   - Current focus and metrics
   - Recent activity summary
   - Files in progress
   - Active todos
   - Recovery instructions

3. **current-state.json Update**
   - Snapshot metadata
   - Reset activity counters
   - Update checkpoint count

## Checkpoint Format

Manual checkpoints are saved with the format: `YYMMDD_HHmmss_manual.md`

Example: `250806_154500_manual.md`

## Location

- Checkpoints: `.claude/brain/context/checkpoints/`
- Active Session: `.claude/brain/context/ACTIVE_SESSION.md`
- State JSON: `.claude/brain/context/state/current-state.json`

## When to Use

- Before major changes or risky operations
- After completing significant work
- When switching between tasks
- To preserve important context
- Before ending a session

## Related Commands

- `/restore` - Restore from a checkpoint
- `/task-complete` - Trigger snapshot when completing todos
- `manage-checkpoints.sh stats` - View checkpoint statistics
- `manage-checkpoints.sh list` - List all checkpoints

## Notes

- This creates a FULL snapshot (all 3 files updated together)
- Lightweight tracking happens automatically on prompts/edits (JSON only)
- Manual checkpoints are preserved forever - manage with utility script
- Checkpoints and ACTIVE_SESSION.md are always created in tandem