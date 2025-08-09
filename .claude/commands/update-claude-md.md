---
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Read, Write
description: Automatically update CLAUDE.md file based on recent code changes
---

# Update Claude.md File

## Current Claude.md State
@CLAUDE.md

## Git Analysis

### Current Repository Status
!`git status --porcelain`

### Recent Changes (Last 10 commits)
!`git log --oneline -10`

### Recent Diff Analysis
!`git diff HEAD~5 --name-only | head -20`

## Project Structure Changes
Search for new patterns, directories, or significant file changes.

## Your Task

Update the CLAUDE.md file to reflect:

1. **New Module Federation improvements** if implemented
2. **shadcn/ui migration progress** once started
3. **New commands and hooks** from .claude directory
4. **Architecture changes** from recent commits
5. **Updated development workflows**
6. **Security enhancements** added
7. **Performance optimizations** implemented

### Key Sections to Update:
- Technology Stack (if dependencies changed)
- Architecture patterns (if new patterns introduced)
- Essential Commands (if new scripts added)
- Development Workflow (if processes changed)
- Recent Updates section with timestamp

### Guidelines:
- Keep existing valuable information
- Add new significant changes only
- Update version numbers if changed
- Note breaking changes clearly
- Keep it concise and actionable