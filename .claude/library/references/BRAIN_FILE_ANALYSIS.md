# Brain File Creation Analysis

## Current Issues Found

### 1. Checkpoint JSON Files in state/ folder
**Problem**: checkpoint_*.json files are being created in the state/ folder
**Source**: `checkpoint.sh` line 164 creates them
**Should be**: Only in checkpoints/ folder OR not at all (we decided MD is enough)

### 2. Mini-checkpoints Folder
**Problem**: Empty folder still exists
**Source**: 
- `checkpoint.sh` line 34 creates the folder
- `auto-save-session.sh` creates mini checkpoint files
**Should be**: Removed entirely (state.json handles continuous updates)

## What Creates Files in Brain

### 1. Manual Checkpoint Command (`checkpoint.sh`)
**Creates**:
- `.claude/brain/context/checkpoints/checkpoint_*.md` ✅ CORRECT
- `.claude/brain/context/state/checkpoint_*.json` ❌ WRONG LOCATION

### 2. Auto-save Hook (`auto-save-session.sh`)
**Creates**:
- Mini-checkpoints in `mini-checkpoints/` folder ❌ REDUNDANT
**Updates**:
- `.claude/brain/context/ACTIVE_SESSION.md` ✅ CORRECT

### 3. Update JSON State Hook (`update-json-state.sh`)
**Updates**:
- `.claude/brain/context/state/current-state.json` ✅ CORRECT

## File Creation Flow

```
User Action
    ↓
Hook Triggered (post-tool-use)
    ↓
    ├─→ auto-save-session.sh
    │     ├─→ Updates ACTIVE_SESSION.md (timestamp)
    │     └─→ Creates mini-checkpoint (REDUNDANT!)
    │
    └─→ update-json-state.sh
          └─→ Updates current-state.json

Manual /checkpoint
    ↓
checkpoint.sh
    ├─→ Creates checkpoint_*.md in checkpoints/ ✅
    └─→ Creates checkpoint_*.json in state/ ❌
```

## What SHOULD Happen

### Continuous (Every Action)
1. **Update** `brain/context/ACTIVE_SESSION.md` - Current work
2. **Update** `brain/context/state/current-state.json` - Machine state

### Manual Checkpoints Only
1. **Create** `brain/context/checkpoints/checkpoint_*.md` - Full snapshot

### NEVER Create
1. ❌ Mini-checkpoints (redundant with state.json)
2. ❌ JSON checkpoints (redundant with MD checkpoints)

## Files to Fix

1. **checkpoint.sh**:
   - Remove JSON checkpoint creation
   - Remove mini-checkpoints folder creation

2. **auto-save-session.sh**:
   - Remove mini-checkpoint creation
   - Keep ACTIVE_SESSION.md updates

3. **restore.sh**:
   - Remove references to checkpoint JSON files

## Cleanup Needed

1. Delete `mini-checkpoints/` folder
2. Delete checkpoint_*.json from state/ folder
3. Update scripts to stop creating these files