# Git Task Workflow Summary

## Complete Task Development Workflow

### 1️⃣ Task Moves to `ready_for_development` (HUMAN ONLY)
- Human reviews and approves task for development
- Task is now ready for AI/developer to execute

### 2️⃣ Task Moves to `in_development` (AI STARTS HERE)
**MANDATORY GIT SETUP:**
```bash
# 0. CRITICAL: Ensure clean working directory
git status  # Check for uncommitted changes
# If changes exist, handle them FIRST:
#   - Commit and push to current branch, OR
#   - Stash changes temporarily
# NEVER proceed with uncommitted changes

# 1. Checkout main and pull latest
git checkout main
git pull origin main

# 2. Verify clean state (CRITICAL)
git status  # Must show "working tree clean"

# 3. Create task-specific branch
git checkout -b task/TASK-AI-CHAT-004  # Use actual task ID

# 4. Store branch name with task in database
# This branch name will be used later for PR creation
```

### 3️⃣ Development Phase
- Implement all changes on the task branch
- Follow all instruction files
- Write tests, ensure validation passes
- Make commits as needed

### 4️⃣ Before Moving to `developed`
**MANDATORY PUSH:**
```bash
# 1. Stage all changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: Implement TASK-AI-CHAT-004 - Feature description"

# 3. Push to remote task branch
git push origin task/TASK-AI-CHAT-004

# 4. Verify push succeeded
git log origin/task/TASK-AI-CHAT-004 --oneline -1
```

### 5️⃣ Task Moves to `developed`
- All changes are on the task branch
- Branch is pushed to remote
- Task is ready for human review

### 6️⃣ Task Moves to `human_approved` (HUMAN DECISION)
**AUTOMATIC PR CREATION:**
- System retrieves the task branch (`task/TASK-AI-CHAT-004`)
- Creates PR from task branch to main
- No new branch creation needed
- PR includes all task details and validation results

### 7️⃣ Task Moves to `done`
- PR is automatically merged if checks pass
- Task branch is deleted after merge
- Version tag is created
- Task is complete

## Key Rules

### ✅ ALWAYS
- **Ensure clean working directory before starting any task**
- Verify `git status` shows "working tree clean" before creating task branch
- Create a new branch for EACH task when starting development
- Use pattern: `task/{TASK-ID}`
- Push ALL changes before marking as developed
- Store branch name with task for PR creation

### ❌ NEVER
- **Start a task with uncommitted changes in working directory**
- Develop directly on main branch
- Reuse branches from other tasks
- Create new branches during approval (use existing task branch)
- Mark as developed without pushing

## Branch Lifecycle

```
main
  ↓
task/TASK-ABC-001 (created when development starts)
  ↓
[development happens here]
  ↓
push to origin/task/TASK-ABC-001
  ↓
PR created from task/TASK-ABC-001 → main
  ↓
merge & delete branch
  ↓
main (updated with changes)
```

## Example Commands

### Starting a new task (TASK-MVP-020):
```bash
git checkout main
git pull
git checkout -b task/TASK-MVP-020
# ... develop ...
git add .
git commit -m "feat: Implement TASK-MVP-020 - User authentication"
git push origin task/TASK-MVP-020
```

### When task is human-approved:
- PR automatically created from `task/TASK-MVP-020` to `main`
- No manual git commands needed at this stage

## Database Fields

The following fields are stored with each task:
- `gitBranch`: The branch name (e.g., "task/TASK-MVP-020")
- `branchCreatedAt`: Timestamp when branch was created
- `pushedAt`: Timestamp when changes were pushed

These fields ensure the PR creation process knows which branch to use.

## Common Issues & Prevention

### Problem: PR includes unrelated files
**Cause**: Started task with uncommitted changes in working directory  
**Prevention**: Always run `git status` and ensure clean state before creating task branch  
**Fix**: Create new clean branch from main, cherry-pick only task-related commits

### Problem: Merge conflicts with main
**Cause**: Main branch updated while task was in development  
**Prevention**: Pull latest main before creating task branch  
**Fix**: Rebase task branch on latest main or merge main into task branch

### Problem: Lost work from previous task
**Cause**: Started new task without pushing previous work  
**Prevention**: Always push all changes before starting new task  
**Fix**: Check reflog to recover commits, or check local branches