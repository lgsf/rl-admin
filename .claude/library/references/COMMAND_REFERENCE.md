# Claude Code Command Reference

## Command Overview

### Session Management Commands

#### `/checkpoint` (bash executable)
**Purpose**: Creates a comprehensive snapshot of current development state
**Usage**: `/checkpoint`
**Creates**:
- Markdown checkpoint file with full context
- JSON state file for programmatic access
- Captures: git status, running processes, test status, todos, architecture context
**Recovery**: Use with `/restore` command

#### `/restore` (bash executable)
**Purpose**: Restores development context from latest checkpoint
**Usage**: `/restore`
**Features**:
- Shows checkpoint context and development focus
- Suggests process restoration (dev server, tests)
- Displays next action items
- Provides quick commands for resuming work

### Development Commands

#### `/analyze-bundle`
**Purpose**: Analyze webpack/vite bundle size and composition
**Features**:
- Visual bundle analysis
- Size comparison between builds
- Remote bundle analysis for Module Federation
- Identifies optimization opportunities

#### `/bug-fix`
**Purpose**: Structured workflow for fixing bugs
**Process**:
1. Reproduce the issue
2. Identify root cause
3. Implement fix
4. Write tests
5. Verify fix
6. Update documentation

#### `/code-review`
**Purpose**: Comprehensive code review workflow
**Checks**:
- Code style and formatting
- Security vulnerabilities
- Performance issues
- Test coverage
- Documentation completeness
- Architecture compliance

#### `/component-create`
**Purpose**: Generate new React components with boilerplate
**Options**:
- `--page`: Create page component
- `--dialog`: Create dialog component
- `--form`: Create form component
- `--table`: Create table component
**Includes**: TypeScript types, tests, stories, documentation

#### `/convex-function`
**Purpose**: Create Convex backend functions
**Types**:
- Query functions
- Mutation functions
- Action functions
**Features**: Type-safe schemas, authentication, permissions

#### `/lyra`
**Purpose**: AI-powered prompt optimization
**Use Cases**:
- Optimize prompts for better AI responses
- Convert vague requests to specific instructions
- Add technical context to prompts

#### `/mf-security-audit`
**Purpose**: Security audit for Module Federation setup
**Checks**:
- Remote origin validation
- Version integrity
- CSP headers
- Permission-based loading
- Runtime isolation

#### `/shadcn-migrate`
**Purpose**: Migrate components from sms-core-ui-2 to shadcn/ui
**Process**:
1. Analyze existing component
2. Map to shadcn/ui equivalent
3. Generate migration code
4. Update imports and styles
5. Create tests

#### `/ultrathink`
**Purpose**: Deep thinking mode for complex problems
**Features**:
- Extended analysis time
- Multiple solution exploration
- Trade-off analysis
- Architecture recommendations

#### `/update-claude-md`
**Purpose**: Update CLAUDE.md based on recent changes
**Updates**:
- Technology decisions
- Architecture changes
- New patterns
- Development priorities

## Hook System

### Event Types

#### `SessionStart`
- Runs when Claude Code session begins
- Shows git status, environment info
- Loads project context

#### `UserPromptSubmit`
- Processes user prompts before execution
- Logs prompts for analysis
- Injects contextual tips

#### `PreToolUse`
- Validates operations before execution
- Security checks for bash commands
- Type checking for edits

#### `PostToolUse`
- Runs after tool execution
- Formats code
- Runs tests
- Updates session state

#### `Notification`
- Cross-platform notifications
- Logs all notifications

#### `Stop`
- Session cleanup
- Creates session summary
- Saves uncommitted changes

## Context Preservation Architecture

### Layer 1: Real-Time Tracking
- `ACTIVE_SESSION.md` - Current work state
- `current-state.json` - Machine-readable state
- Mini-checkpoints after significant changes

### Layer 2: Progress Management
- TodoWrite tool integration
- Development tracker updates
- Changelog generation

### Layer 3: Recovery System
- Checkpoint/restore commands
- Session state persistence
- Multiple recovery points

### Layer 4: Documentation
- CLAUDE.md for project context
- Rule files for standards
- Decision records

## Best Practices

### For Maximum Productivity

1. **Start Sessions with Context**
   ```bash
   /restore  # Load previous context
   ```

2. **Regular Checkpoints**
   ```bash
   /checkpoint  # Before major changes
   ```

3. **Use Specialized Commands**
   - `/bug-fix` for debugging
   - `/component-create` for new components
   - `/code-review` before commits

4. **Track Everything**
   - Use TodoWrite for all tasks
   - Update ACTIVE_SESSION.md frequently
   - Commit with descriptive messages

### For Context Preservation

1. **Always Update State**
   - Mark todos as completed immediately
   - Update ACTIVE_SESSION.md when switching focus
   - Create checkpoints before breaks

2. **Use Hooks Effectively**
   - Let auto-save hooks track changes
   - Review hook logs for patterns
   - Customize hooks for your workflow

3. **Document Decisions**
   - Create decision records
   - Update rule files
   - Keep CLAUDE.md current

## Troubleshooting

### Lost Context
1. Check `ACTIVE_SESSION.md`
2. Run `/restore`
3. Review `current-state.json`
4. Check mini-checkpoints

### Command Not Working
1. Check file permissions
2. Verify paths in command
3. Check logs in `.claude/logs/`
4. Review hook output

### Hook Issues
1. Check `settings.toml` syntax
2. Verify script permissions
3. Check hook logs
4. Test hooks individually

## Advanced Usage

### Custom Commands
Create new commands in `.claude/commands/`:
```markdown
# command-name.md
Description and implementation
```

### Custom Hooks
Add to `settings.toml`:
```toml
[[hooks]]
event = "EventType"
command = "script content"
```

### Integration with CI/CD
- Use hooks for automated testing
- Checkpoint before deployments
- Track deployment history

---

This reference is part of the bulletproof context system. Keep it updated as new commands and patterns emerge.