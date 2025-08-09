# /restore

Restores development state from a checkpoint.

## Script Path
`.claude/scripts/session/restore.sh`

## Usage

```bash
/restore                    # Interactive selection
/restore [checkpoint_id]    # Restore specific checkpoint
```

## Description

The `/restore` command helps you recover your development state from a previously saved checkpoint. It can:

- List available checkpoints for selection
- Restore git state
- Restore file contents
- Update session state
- Resume from exact point of checkpoint

## Examples

```bash
# Interactive restore (shows list to choose from)
/restore

# Restore specific checkpoint
/restore 250804_210548_manual
/restore prompt_250804_192510
```

## Features

- **Interactive Selection**: Choose from list of available checkpoints
- **Full State Recovery**: Restores git state, files, and context
- **Safe Operation**: Creates backup before restoring
- **Quick Recovery**: Get back to work in seconds

## Related Commands

- `/checkpoint` - Create a new checkpoint
- `manage-checkpoints.sh list` - List all checkpoints
- `manage-checkpoints.sh view [checkpoint]` - Preview checkpoint contents

## Notes

- Checkpoints contain full context including git state
- Restore creates a backup before applying changes
- Use after context loss or when switching tasks