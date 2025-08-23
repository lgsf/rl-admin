# Source Control Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Pre-commit: ALWAYS validate before committing
2. Commit: ALWAYS use exact message format
3. Branch: ALWAYS follow naming pattern
4. Push: ALWAYS after local validation
5. PR: ALWAYS include all required sections

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER commit directly to main/master
❌ NEVER commit secrets or credentials
❌ NEVER commit .env files
❌ NEVER commit node_modules or vendor
❌ NEVER commit generated files
❌ NEVER use generic commit messages
❌ NEVER force push to shared branches
❌ NEVER merge without PR approval
❌ NEVER squash commits without permission
❌ NEVER commit broken code

### REQUIRED ACTIONS
✅ ALWAYS write self-documenting commits
✅ ALWAYS reference issue numbers
✅ ALWAYS run tests before committing
✅ ALWAYS use conventional commits format
✅ ALWAYS create feature branches
✅ ALWAYS rebase before merging
✅ ALWAYS delete merged branches
✅ ALWAYS review before pushing
✅ ALWAYS update .gitignore
✅ ALWAYS sign commits if configured

## COMMIT MESSAGE TEMPLATE (USE EXACTLY)

```
{type}({scope}): {subject}

{body}

{footer}
```

### Type Values (USE ONLY THESE)
```
feat     # New feature for user
fix      # Bug fix for user
docs     # Documentation only changes
style    # Formatting, missing semicolons, etc
refactor # Code change that neither fixes bug nor adds feature
perf     # Code change that improves performance
test     # Adding missing tests
chore    # Updating grunt tasks etc; no production code change
build    # Changes to build system or dependencies
ci       # Changes to CI configuration files and scripts
revert   # Reverts a previous commit
```

### Commit Message Rules
```
# Subject line
- Maximum 50 characters
- Imperative mood: "Add" not "Added" or "Adds"
- No period at end
- Capitalize first letter

# Body (optional)
- Maximum 72 characters per line
- Explain what and why, not how
- Blank line between subject and body
- Bullet points allowed with "-" or "*"

# Footer (optional)
- Reference issues: "Fixes #123"
- Breaking changes: "BREAKING CHANGE: description"
- Co-authors: "Co-authored-by: Name <email>"
```

### Example Commits
```bash
# ✅ CORRECT
feat(auth): Add JWT token refresh mechanism

Implement automatic token refresh when access token expires.
Prevents users from being logged out during active sessions.

Fixes #234

# ✅ CORRECT
fix(api): Resolve null pointer in user endpoint

The getUserById endpoint was crashing when user not found.
Now returns proper 404 response with error message.

Fixes #567

# ❌ WRONG
Fixed bug          # No type, vague
feat: added stuff  # Past tense, vague
update code       # No type, too generic
```

## BRANCH NAMING PATTERN (USE EXACTLY)

```bash
{type}/{issue-number}-{description}

# Examples:
feature/123-user-authentication
fix/456-login-validation-error
chore/789-update-dependencies
hotfix/321-critical-security-patch
release/v1.2.0
```

### Branch Type Prefixes
```
feature/  # New feature development
fix/      # Bug fixes
hotfix/   # Urgent production fixes
chore/    # Maintenance tasks
docs/     # Documentation updates
test/     # Test additions or fixes
refactor/ # Code refactoring
release/  # Release preparation
```

## PRE-COMMIT CHECKLIST (EXECUTE IN ORDER)

```bash
# 1. Check for secrets
git secrets --scan

# 2. Run linter
npm run lint       # or equivalent

# 3. Run formatter
npm run format     # or equivalent

# 4. Run tests
npm test          # or equivalent

# 5. Check types
npm run typecheck # or equivalent

# 6. Verify build
npm run build     # or equivalent

# 7. Check file size
git ls-files -z | xargs -0 du -ch | grep -E "^[0-9\.]+M"

# 8. Review changes
git diff --cached
```

## PULL REQUEST TEMPLATE (USE EXACTLY)

```markdown
## Summary
{One sentence describing the change}

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Description
{Detailed explanation of changes}

## Testing
- [ ] Unit tests pass locally
- [ ] Integration tests pass locally
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)
{Add screenshots for UI changes}

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added for new features
- [ ] All tests passing
- [ ] Breaking changes documented

## Related Issues
Fixes #{issue_number}

## Dependencies
{List any dependencies this PR has}

## Reviewer Notes
{Any specific areas needing attention}
```

## GIT WORKFLOW COMMANDS (EXECUTE EXACTLY)

### Starting New Feature
```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/{issue}-{description}

# 3. Work and commit
git add .
git commit -m "feat({scope}): {message}"

# 4. Keep branch updated
git fetch origin
git rebase origin/main
```

### Before Creating PR
```bash
# 1. Update from main
git fetch origin
git rebase origin/main

# 2. Run all validations
npm run lint && npm run test && npm run build

# 3. Review commits
git log --oneline main..HEAD

# 4. Push to remote
git push origin feature/{issue}-{description}
```

### After PR Approval
```bash
# 1. Ensure updated with main
git fetch origin
git rebase origin/main

# 2. Squash if requested (ONLY if requested)
git rebase -i main

# 3. Push final changes
git push origin feature/{issue}-{description} --force-with-lease

# 4. After merge, clean up
git checkout main
git pull origin main
git branch -d feature/{issue}-{description}
git push origin --delete feature/{issue}-{description}
```

## MERGE STRATEGIES (USE APPROPRIATE)

### Feature Branches
```bash
# Rebase and merge (preferred for clean history)
git checkout feature/branch
git rebase main
git checkout main
git merge --no-ff feature/branch
```

### Hotfixes
```bash
# Direct merge (preserve urgency trail)
git checkout main
git merge --no-ff hotfix/branch
git tag -a v1.0.1 -m "Hotfix: {description}"
```

### Release Branches
```bash
# Create release branch
git checkout -b release/v1.2.0 main

# Merge back to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# Merge to develop if exists
git checkout develop
git merge --no-ff release/v1.2.0
```

## CONFLICT RESOLUTION PATTERN

```bash
# 1. Identify conflicts
git status

# 2. For each conflicted file
git diff {file}

# 3. Resolve conflicts
# Keep incoming changes for dependency updates
# Keep current changes for feature logic
# Merge both for independent additions

# 4. Mark as resolved
git add {file}

# 5. Continue rebase/merge
git rebase --continue  # or
git merge --continue

# 6. Verify resolution
npm test
```

## ROLLBACK PROCEDURES

### Revert Last Commit
```bash
# Soft revert (keep changes)
git reset --soft HEAD~1

# Hard revert (discard changes)
git reset --hard HEAD~1

# Create revert commit
git revert HEAD
```

### Revert Specific Commit
```bash
# Find commit hash
git log --oneline

# Revert it
git revert {commit-hash}
```

### Emergency Production Rollback
```bash
# 1. Create hotfix from last stable
git checkout -b hotfix/emergency-rollback {last-stable-tag}

# 2. Revert problematic commits
git revert {commit-hash}

# 3. Fast-track merge
git checkout main
git merge --no-ff hotfix/emergency-rollback

# 4. Tag and deploy
git tag -a v1.0.1-hotfix -m "Emergency rollback"
git push origin main --tags
```

## REPOSITORY RULES

### .gitignore Requirements
```gitignore
# ALWAYS include these
.env
.env.*
!.env.example
node_modules/
dist/
build/
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.swo
coverage/
.nyc_output/
```

### File Size Limits
```bash
# Files > 100MB: Use Git LFS
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.pdf"

# Add to .gitattributes
*.psd filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
*.pdf filter=lfs diff=lfs merge=lfs -text
```

## COMMIT SIGNING (IF CONFIGURED)

```bash
# Configure GPG
git config --global user.signingkey {GPG-KEY-ID}
git config --global commit.gpgsign true

# Verify signature
git log --show-signature -1
```

## AUTOMATION HOOKS

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run tests
npm test || exit 1

# Check for secrets
git secrets --pre_commit_hook || exit 1

# Lint code
npm run lint || exit 1

echo "Pre-commit checks passed"
```

### Commit Message Hook
```bash
#!/bin/sh
# .git/hooks/commit-msg

# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: type(scope): subject"
    exit 1
fi
```

## REVIEW CHECKLIST

Before approving ANY pull request:
- [ ] Code follows all conventions
- [ ] Tests are comprehensive
- [ ] No security vulnerabilities
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented code
- [ ] No TODO comments without issue numbers
- [ ] Dependencies justified
- [ ] Breaking changes documented

## COMMON ANTIPATTERNS TO AVOID

```bash
# ❌ NEVER DO THIS
git add .                    # Without reviewing changes
git commit -m "fix"         # Vague message
git push --force            # On shared branches
git merge without PR        # Bypassing review

# ✅ ALWAYS DO THIS
git add -p                  # Review each change
git commit -m "fix(auth): resolve JWT expiration issue"
git push --force-with-lease # Safer force push
git merge after PR approval # Proper review process
```

## GIT AUTOMATION FOR TASK COMPLETION

### Automated Workflow Trigger
When task moves: `developed` → `human_approved` → Automatic Git Operations → `done`

### Automated Operations Sequence
1. **Version Bump Calculation**: Based on task ID pattern (BREAKING=major, MVP/FEATURE=minor, FIX=patch)
2. **Branch Creation**: From latest main with pattern `feature/{category}/{task-id}-{kebab-case-title}`
3. **Commit & Push**: With comprehensive task details
4. **Pull Request Creation**: Via GitHub API with auto-merge label
5. **CI/CD Checks**: Wait for GitHub Actions completion
6. **Auto-merge**: On successful checks
7. **Tag Creation**: With semantic version
8. **Task Update**: Move to done column

### GitHub Actions Required
- `.github/workflows/ci.yml`: Runs tests, linting, typecheck, build
- `.github/workflows/auto-merge.yml`: Merges PRs with auto-merge label
- `.github/workflows/release.yml`: Creates releases for version tags

### Intelligent Merge Conflict Resolution
- **Auto-generated files**: Take incoming changes
- **Lock files**: Take incoming and regenerate
- **Package.json**: Merge dependencies
- **Import statements**: Union both
- **Test files**: Keep ours
- **Other files**: Manual resolution with PR notification

### Integration with Convex
Tasks automatically trigger Git workflow via `convex/gitIntegration.ts` when moved to human_approved.

---

**Version**: 1.1.0  
**Updated**: 2024-08-09  
**Status**: Active with Git Automation