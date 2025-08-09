# Claude Code Commands

This directory contains documentation for all available slash commands. The actual executable scripts are located in `.claude/scripts/`.

## Command Categories

### Session Management
- `/checkpoint` - Save current development state
- `/restore` - Restore from previous checkpoint

### Development
- `/component-create` - Create new React components
- `/bug-fix` - Structured bug fixing workflow
- `/code-review` - Comprehensive code review

### Analysis
- `/analyze-bundle` - Analyze bundle size and composition
- `/mf-security-audit` - Module Federation security audit

### Migration
- `/shadcn-migrate` - Migrate components to shadcn/ui
- `/convex-function` - Create Convex backend functions

### AI Enhancement
- `/lyra` - AI-powered prompt optimization
- `/ultrathink` - Deep thinking mode for complex problems

### Utilities
- `/update-claude-md` - Update project documentation

## Usage

To use any command, simply type the command name in your message. For example:
- `/checkpoint` to save your current state
- `/component-create Button` to create a new Button component

## Script Locations

The executable scripts for these commands are organized in:
- `.claude/scripts/session/` - Session management scripts
- `.claude/scripts/automation/` - Automation workflows
- `.claude/scripts/utilities/` - Utility scripts

## Adding New Commands

1. Create a new `.md` file in this directory documenting the command
2. Create the executable script in the appropriate scripts subfolder
3. Update this README with the new command