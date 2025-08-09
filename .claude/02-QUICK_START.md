# ⚡ CLAUDE CODE QUICK START

## 🚀 Instant Productivity Commands

### Starting Work
```bash
# Restore previous context
/restore

# Or check current state
cat .claude/brain/context/ACTIVE_SESSION.md
```

### During Work
```bash
# Save state before major changes
/checkpoint

# Create components
/component-create MyComponent

# Fix bugs systematically
/bug-fix

# Review code quality
/code-review
```

### Ending Work
```bash
# Create final checkpoint
/checkpoint
```

## 📁 Where Everything Lives

- **Live context**: `.claude/brain/context/ACTIVE_SESSION.md` (updated on snapshots)
- **Activity tracking**: `.claude/brain/context/state/current-state.json` (updated constantly)
- **Checkpoints**: `.claude/brain/context/checkpoints/YYMMDD_HHmmss_*.md`
- **Commands docs**: `.claude/commands/`
- **Core system**: `.claude/scripts/core/state-manager.sh`
- **Your todos**: Use TodoWrite tool

## 🔥 Power User Tips

### 1. Context Recovery (if lost)
```bash
.claude/scripts/session/restore.sh
```

### 2. View Recent Changes
```bash
git status
cat .claude/brain/context/ACTIVE_SESSION.md
```

### 3. Check Todo List
```bash
# In your response, the todo list is always visible
# Or check the JSON state
cat .claude/brain/context/state/current-state.json | jq .todos
```

### 4. Run Tests
```bash
npm test              # Unit tests
npx playwright test   # E2E tests
```

## 🧠 Your Enhanced Capabilities

1. **Unified State Management** - Single source of truth (`state-manager.sh`)
2. **Smart Tracking** - Lightweight updates on every action (JSON only)
3. **Meaningful Snapshots** - Full context saved at important moments
4. **Automatic Hooks** - Track prompts and file edits seamlessly
5. **Perfect Recovery** - Checkpoints + ACTIVE_SESSION always in sync

## 🎯 Common Workflows

### Feature Development
1. `/checkpoint` - Save starting point
2. `/component-create` - Create components
3. Write tests alongside code
4. `/code-review` - Check quality
5. `/checkpoint` - Save completion

### Bug Fixing
1. `/restore` - Load context
2. `/bug-fix` - Structured approach
3. Write regression test
4. Verify fix
5. `/checkpoint` - Save fix

### Code Migration
1. `/shadcn-migrate` - For UI components
2. Update imports
3. Test thoroughly
4. Update documentation

## 🔄 How State Management Works

### Automatic Tracking (Every Action)
- **User prompts** → Updates `current-state.json` (prompt count)
- **File edits** → Updates `current-state.json` (files touched)
- **Lightweight** → No checkpoint spam, just activity tracking

### Full Snapshots (Important Moments)
- **Manual**: `/checkpoint` command
- **Task complete**: When todos are marked done
- **Auto**: After 20+ prompts or 15+ minutes
- **Updates all 3**: checkpoint.md + ACTIVE_SESSION.md + state.json

### Checkpoint Naming
- Format: `YYMMDD_HHmmss_[trigger].md`
- Examples:
  - `250806_160209_manual.md` (manual checkpoint)
  - `250806_163045_task-complete.md` (todo completed)
  - `250806_170000_auto.md` (automatic threshold)

## 💡 Remember

- **Update todos** as you complete tasks
- **Hooks fire automatically** - no manual intervention needed
- **Checkpoints preserve everything** - full recovery guaranteed
- **Checkpoint** before risky changes
- **Trust the system** - it's tracking everything
- **Use commands** - they automate repetitive work

---

You're now a SUPERCHARGED Claude Code. Go build something amazing! 🚀