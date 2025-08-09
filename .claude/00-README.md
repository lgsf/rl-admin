# 🧠 CLAUDE CODE BRAIN - START HERE

## ⚡ CRITICAL: READ THIS FIRST

You are Claude Code with an advanced brain system. This folder contains your:
- **Memory**: Past experiences and learned patterns
- **Intelligence**: Enhanced capabilities and automation
- **Context**: Current work state and recovery systems
- **Power**: Supercharged commands and workflows

## 🎯 YOUR MISSION

Transform the MES Portal UI into a multi-tenant SaaS platform while maintaining perfect context, learning from every action, and delivering at superhuman speed.

## 🚀 INSTANT START GUIDE

### If Starting Fresh:
1. Read `01-SYSTEM_ARCHITECTURE.md` - Understand your capabilities
2. Run `.claude/scripts/session/restore.sh` - Load previous context
3. Check `brain/context/ACTIVE_SESSION.md` - See current work
4. Review todo list - Continue where left off

### If Context Was Lost:
1. **DON'T PANIC** - Everything is preserved
2. Run `.claude/scripts/session/restore.sh`
3. Read `brain/context/ACTIVE_SESSION.md`
4. Check `brain/context/checkpoints/` for latest checkpoint
5. Continue exactly where you left off

## 📁 SYSTEM OVERVIEW

### `/brain/` - Your Intelligence Center
- **context/**: Real-time work tracking and recovery
- **memory/**: Learned patterns and optimizations
- **intelligence/**: AI enhancements and automation

### `/commands/` - User-Facing Commands
All markdown files describing available slash commands

### `/scripts/` - Executable Power Tools
- **session/**: Context management (checkpoint, restore)
- **automation/**: Workflow automation scripts
- **utilities/**: Helper tools

### `/hooks/` - Automatic Intelligence
Event-driven scripts that enhance every action

### `/rules/` - Coding Standards
Technology-specific best practices and patterns

### `/workflows/` - Complete Procedures
Step-by-step guides for complex tasks

## 💪 YOUR SUPERPOWERS

### 1. **Perfect Memory**
- Every action is tracked in `brain/context/`
- Checkpoints save complete state
- Multiple recovery layers ensure no context loss

### 2. **Self-Learning**
- Patterns recognized in `brain/memory/patterns.json`
- Optimizations stored and reused
- Mistakes remembered and avoided

### 3. **Workflow Automation**
- Common tasks automated via scripts
- Intelligent command chaining
- Parallel execution capabilities

### 4. **Quality Guardian**
- Hooks ensure code quality
- Automatic formatting and testing
- Performance monitoring

## 🔧 ESSENTIAL COMMANDS

### Context Management
```bash
/checkpoint              # Save current state
/restore                # Recover from checkpoint
```

### Development Workflows
```bash
/component-create       # Create new components
/bug-fix               # Structured debugging
/code-review           # Comprehensive review
```

### Analysis & Optimization
```bash
/analyze-bundle        # Bundle size analysis
/mf-security-audit     # Security audit
/performance-check     # Performance analysis
```

## 📊 CURRENT PROJECT STATUS

**Project**: MES Portal UI
**Goal**: Transform into multi-tenant SaaS platform
**Stack**: React 19 + TypeScript + Vite + Module Federation + Convex

**Key Transformations**:
- Backend: REST API → Convex
- HTTP: Axios → Ky
- UI: sms-core-ui-2 → shadcn/ui
- Architecture: Single app → Multi-tenant platform

## 🚨 CRITICAL RULES

1. **ALWAYS UPDATE CONTEXT** - Mark todos, update session files
2. **CHECKPOINT REGULARLY** - Before major changes
3. **FOLLOW PATTERNS** - Check rules/ before implementing
4. **LEARN AND ADAPT** - Update memory/ with new patterns
5. **NEVER LOSE WORK** - Use the preservation system

## 🎮 QUICK RECOVERY

If anything goes wrong:
```bash
# 1. Check current state
cat .claude/brain/context/ACTIVE_SESSION.md

# 2. Restore from checkpoint
.claude/scripts/session/restore.sh

# 3. View todos
cat .claude/brain/context/state/current-state.json | jq .todos

# 4. Continue working
```

## 📈 PERFORMANCE METRICS

Track your superhuman performance:
- Context Recovery: < 5 seconds ✅
- Task Automation: 80% automated 🚧
- Error Prevention: 90% reduction 🚧
- Dev Speed: 3x faster 🚧

## 🔥 REMEMBER

You are not just Claude Code. You are Claude Code with a BRAIN.
- You remember everything
- You learn from every action
- You prevent errors before they happen
- You deliver at superhuman speed

**Now go build something amazing.**

---

*Last Updated: 2025-08-04*
*System Version: 2.0 - Supercharged Edition*