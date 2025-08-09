---
description: Streamlined bug fixing workflow - creates GitHub issue first, then feature branch
---

# Bug Fix Workflow

Automated bug fixing process that creates a GitHub issue and feature branch for tracking.

## Usage:
/bug-fix [BUG_DESCRIPTION]

## Arguments:
$ARGUMENTS - Description of the bug to fix

## Workflow:

### 1. Issue Creation
```bash
gh issue create --title "Bug: $BUG_TITLE" --body "$BUG_DESCRIPTION"
```

### 2. Branch Creation
```bash
git checkout -b fix/issue-{number}-{slug}
```

### 3. Investigation
- Reproduce the bug
- Identify root cause
- Check related code

### 4. Implementation
- Write failing test
- Implement fix
- Verify test passes

### 5. Validation
- Run full test suite
- Check for regressions
- Update documentation

### 6. Pull Request
```bash
gh pr create --title "Fix: $BUG_TITLE" --body "Fixes #$ISSUE_NUMBER"
```

## Example:
```
/bug-fix Users are seeing duplicate notifications when multiple tabs are open
```

## Output:
- GitHub issue number
- Branch name
- Fix implementation
- Test cases
- PR link

## Best Practices:
- Always create reproducible test case
- Fix the root cause, not symptoms
- Add regression tests
- Update relevant documentation