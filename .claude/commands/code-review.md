---
allowed-tools: Bash(git diff:*), Bash(git log:*), Read, Grep, LS
description: Perform a comprehensive code review of recent changes
---

# Code Review

## Git Analysis
!`git status --porcelain`
!`git diff --staged`
!`git diff HEAD`

## Review Checklist

### 1. Code Quality
- [ ] Code follows project conventions
- [ ] No unnecessary complexity
- [ ] DRY principles followed
- [ ] Clear variable/function names
- [ ] Proper error handling

### 2. Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] XSS prevention measures
- [ ] CORS properly configured
- [ ] Authentication checks

### 3. Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization used
- [ ] Bundle size impact assessed
- [ ] Database queries optimized
- [ ] Caching implemented where needed

### 4. Testing
- [ ] Unit tests added/updated
- [ ] Integration tests if needed
- [ ] Edge cases covered
- [ ] Test coverage maintained

### 5. Documentation
- [ ] Code comments where needed
- [ ] README updated if required
- [ ] API documentation current
- [ ] CHANGELOG entry added

## Output Format
Provide:
1. Summary of changes
2. Issues found (if any)
3. Suggestions for improvement
4. Security concerns
5. Performance impact assessment