# Task Execution Workflow Instructions - AI Enforced

## EXECUTION PRIORITY ORDER
1. Column Validation: ALWAYS verify "ready_for_development" column (HUMAN-PLACED ONLY)
2. Status Update: ALWAYS move to "in_development" before starting
3. Task Execution: ALWAYS follow ALL referenced instructions
4. Validation: ALWAYS run ALL checklists before completion
5. Completion: ALWAYS move to "developed" after success
6. Failure: ALWAYS keep in "in_development" if incomplete

## ⚠️ CRITICAL RESTRICTION - NEVER VIOLATE
**NEVER move tasks TO ready_for_development column**
- This column is HUMAN-ONLY
- NO automated moves allowed
- NO exceptions, NO overrides
- See: critical-column-restrictions.md for details

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER move any task TO "ready_for_development" column (HUMAN-ONLY)
❌ NEVER start a task with uncommitted changes in working directory
❌ NEVER create task branch without clean working tree
❌ NEVER start a task not in "ready_for_development" column
❌ NEVER execute without moving to "in_development" first
❌ NEVER mark complete without running validation checklists
❌ NEVER move to "developed" with failing tests
❌ NEVER move to "developed" with TypeScript errors
❌ NEVER move to "developed" with lint errors
❌ NEVER skip instruction references in task specification
❌ NEVER execute partial implementation
❌ NEVER leave task in wrong column after execution
❌ NEVER proceed if column transition fails

### REQUIRED ACTIONS
✅ ALWAYS ensure clean working directory before starting
✅ ALWAYS verify `git status` shows "working tree clean"
✅ ALWAYS check task column before starting
✅ ALWAYS use Convex to update task status
✅ ALWAYS read task specification completely
✅ ALWAYS follow TDD approach (tests first)
✅ ALWAYS run validation checklists
✅ ALWAYS update task column on completion
✅ ALWAYS report column transition status
✅ ALWAYS rollback on failure
✅ ALWAYS use TodoWrite tool to track progress
✅ ALWAYS verify drag-and-drop still works (if frontend)

## TASK EXECUTION WORKFLOW (MANDATORY SEQUENCE)

### PHASE 1: PRE-EXECUTION VALIDATION

```typescript
// Required validation before ANY task execution
interface PreExecutionValidation {
  taskId: string;
  currentColumn: string;
  validationChecks: {
    isInCorrectColumn: boolean;
    hasRequiredDependencies: boolean;
    hasCompleteSpecification: boolean;
    instructionsAvailable: boolean;
  };
}
```

#### Step 1.1: Retrieve Task Information
```bash
# Query task from database
npx convex run tasks:getTasksByBoard | grep "{TASK_ID}"
```

#### Step 1.2: Validate Column Status
- **Expected Column**: `ready_for_development`
- **Valid Previous Columns**: `new_task` (after human review)
- **Invalid Columns**: `in_development`, `developed`, `human_approved`, `done`

#### Step 1.3: Column Validation Error Response
If task is NOT in "ready_for_development":
```
❌ VALIDATION ERROR: Task Execution Blocked

Task ID: {TASK_ID}
Current Column: {CURRENT_COLUMN}
Required Column: ready_for_development

REASON: Only tasks in the "Ready for Development" column can be executed.

ACTION REQUIRED:
1. Human must review the task in its current column
2. Human must explicitly move task to "Ready for Development"
3. Only then can execution begin

This ensures proper workflow and human oversight.
```

### PHASE 2: TASK STATUS UPDATE & GIT SETUP

#### Step 2.1: Move Task to "In Development"
```typescript
// Convex mutation to update task status
await updateTaskColumn({
  taskId: TASK_ID,
  fromColumn: "ready_for_development",
  toColumn: "in_development",
  timestamp: Date.now(),
  executedBy: "ai_agent"
});
```

#### Step 2.2: Ensure Clean Working Directory & Create Branch
```bash
# CRITICAL: Ensure clean working directory FIRST
# 0. Check for uncommitted changes
git status
# If changes exist, handle them:
#   - Commit and push to current branch
#   - Or stash temporarily: git stash
# NEVER proceed with uncommitted changes

# 1. Ensure on main and updated
git checkout main
git pull origin main

# 2. Verify clean state (MANDATORY)
git status  # Must show "working tree clean"

# 3. Create task-specific branch
git checkout -b task/{TASK_ID}
# Example: git checkout -b task/TASK-AI-CHAT-004

# 4. Verify branch creation
git branch --show-current
```

**CRITICAL**: Store branch name with task for later PR creation:
```typescript
await updateTask({
  taskId: TASK_ID,
  gitBranch: `task/${TASK_ID}`,
  branchCreatedAt: Date.now()
});
```

#### Step 2.3: Verify Column Update
- Confirm task is now in "in_development"
- Confirm git branch is created and checked out
- Log the transition in activity history
- Start execution timer

#### Step 2.4: Create TodoWrite Entry
```typescript
TodoWrite.create([
  {
    content: `Execute ${TASK_ID}: ${TASK_TITLE}`,
    status: "in_progress",
    id: generateId()
  }
]);
```

### PHASE 3: TASK EXECUTION

#### Step 3.1: Read Task Specification
- Extract all task details from database
- Identify instruction references
- List acceptance criteria
- Note validation steps

#### Step 3.2: Load Referenced Instructions
For each instruction reference in task:
```typescript
instructionReferences.forEach(ref => {
  readInstruction(ref.file);
  applyRules(ref.rules);
  enforceConstraints(ref.sections);
});
```

#### Step 3.3: Execute Implementation
1. **TDD Approach** (MANDATORY):
   - Write tests FIRST
   - Verify tests fail
   - Implement code
   - Verify tests pass

2. **Follow Task Steps**:
   - Execute each implementation step in order
   - Run validation command after each step
   - Verify expected outcome

3. **Apply Domain Rules**:
   - Frontend: Follow frontend.md
   - Backend: Follow backend.md
   - Testing: Follow unit-testing.md

### PHASE 4: VALIDATION & VERIFICATION

#### Step 4.1: Run Automated Validation
```bash
# MANDATORY validation commands (ALL must pass)
npm run lint          # No linting errors
npm run typecheck     # No TypeScript errors
npm test              # All tests pass
npm run build         # Build succeeds
```

#### Step 4.2: Verify Acceptance Criteria
For each criterion in task.acceptanceCriteria:
- [ ] Execute validation step
- [ ] Verify expected result
- [ ] Document completion

#### Step 4.3: Special Validations
For frontend tasks:
- [ ] Component under 50 lines
- [ ] No custom CSS (Tailwind only)
- [ ] Drag-and-drop still works
- [ ] Modal/UI interactions work

For backend tasks:
- [ ] Convex functions deployed
- [ ] Real-time sync works
- [ ] No direct database access

### PHASE 5: TASK COMPLETION

#### Step 5.1: Push Changes to Task Branch
**MANDATORY BEFORE MARKING AS DEVELOPED**:
```bash
# 1. Stage all changes
git add .

# 2. Commit with proper message
git commit -m "feat: Implement {TASK_ID} - {TASK_TITLE}

Task implementation complete with all validations passing.
- Tests: ✅ All passing
- TypeScript: ✅ No errors
- Linting: ✅ Clean
- Build: ✅ Successful

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push to task branch
git push origin task/{TASK_ID}

# 4. Verify push succeeded
git log origin/task/{TASK_ID} --oneline -1
```

#### Step 5.2: Successful Completion
If ALL validations pass AND changes are pushed:
```typescript
// Move task to developed column
await updateTaskColumn({
  taskId: TASK_ID,
  fromColumn: "in_development",
  toColumn: "developed",
  timestamp: Date.now(),
  completedBy: "ai_agent",
  gitBranch: `task/${TASK_ID}`,
  pushedAt: Date.now(),
  validationResults: {
    testsPass: true,
    lintPass: true,
    typeCheckPass: true,
    buildPass: true,
    acceptanceCriteriaPass: true
  }
});
```

#### Step 5.2: Completion Report
```
✅ TASK COMPLETED SUCCESSFULLY

Task ID: {TASK_ID}
Title: {TASK_TITLE}
Duration: {EXECUTION_TIME}
Status: Developed

Validations Passed:
- Tests: ✅ {TEST_COUNT} tests passing
- TypeScript: ✅ No errors
- Linting: ✅ No issues
- Build: ✅ Successful
- Acceptance Criteria: ✅ All met

Next Steps:
- Task moved to "Developed" column
- Awaiting human review and approval
- Human should verify implementation meets expectations
```

#### Step 5.3: Failed Completion
If ANY validation fails:
```typescript
// Keep task in development, report issues
await updateTaskExecutionLog({
  taskId: TASK_ID,
  status: "failed",
  errors: [...],
  remainingInColumn: "in_development"
});
```

Error Report:
```
⚠️ TASK EXECUTION INCOMPLETE

Task ID: {TASK_ID}
Status: Remaining in "In Development"

Issues Found:
- {SPECIFIC_ERRORS}

Required Actions:
1. Fix identified issues
2. Re-run validations
3. Cannot move to "Developed" until all pass
```

## COLUMN TRANSITION RULES

### Valid Transitions for Execution
```
ready_for_development → in_development → developed
```

### Invalid Execution Attempts
- `new_task` → Cannot execute (needs human review first)
- `in_development` → Already being worked on
- `developed` → Already completed
- `human_approved` → Past development phase
- `done` → Fully complete

## ERROR RECOVERY PROCEDURES

### If Column Update Fails
1. DO NOT proceed with execution
2. Report error immediately
3. Retry column update up to 3 times
4. If still failing, abort execution

### If Execution Fails
1. Keep task in "in_development"
2. Create detailed error log
3. Update task with failure reason
4. Do NOT move to "developed"

### If Validation Fails
1. Document which validations failed
2. Keep task in "in_development"
3. Provide fix recommendations
4. Require human intervention if blocked

## USAGE EXAMPLES

### Example 1: Successful Execution
```typescript
// User request
"Execute TASK-MVP-014"

// AI Response and Actions:
1. Check column: ready_for_development ✅
2. Move to: in_development ✅
3. Execute task following instructions ✅
4. Run validations: All pass ✅
5. Move to: developed ✅
6. Report: "Task completed successfully"
```

### Example 2: Wrong Column Error
```typescript
// User request
"Execute TASK-MVP-015"

// AI Response:
"❌ VALIDATION ERROR: Task TASK-MVP-015 is in 'new_task' column.
Only tasks in 'ready_for_development' can be executed.
Please move the task to the correct column first."
```

### Example 3: Validation Failure
```typescript
// User request
"Execute TASK-MVP-016"

// AI Actions:
1. Check column: ready_for_development ✅
2. Move to: in_development ✅
3. Execute task ✅
4. Run validations: TypeScript errors ❌
5. Keep in: in_development
6. Report: "Task incomplete - TypeScript errors must be fixed"
```

## ENFORCEMENT CHECKLIST

Before EVERY task execution, verify:
- [ ] Task is in "ready_for_development" column
- [ ] Task moved to "in_development" before starting
- [ ] All instruction files referenced and followed
- [ ] TDD approach used (tests first)
- [ ] All validations run and passed
- [ ] Task moved to "developed" only if successful
- [ ] Proper error handling if any step fails
- [ ] Column transitions logged and tracked
- [ ] TodoWrite tool used for progress tracking
- [ ] Final status accurately reflects outcome

## INTEGRATION WITH OTHER INSTRUCTIONS

This workflow MUST be used in conjunction with:
- `task-creation.md` - For understanding task structure
- `frontend.md` - For frontend task execution
- `backend.md` - For backend task execution
- `unit-testing.md` - For test requirements
- `source-control.md` - For commit practices

## CRITICAL REMINDERS

⚠️ **NEVER** skip column validation - it ensures human oversight
⚠️ **NEVER** leave tasks in wrong columns - it breaks workflow visibility
⚠️ **NEVER** mark incomplete work as developed - it compromises quality
⚠️ **ALWAYS** provide clear error messages - humans need to understand issues
⚠️ **ALWAYS** maintain accurate column status - it's the source of truth

---

**ENFORCEMENT**: This workflow is MANDATORY for all task executions. Any deviation will result in execution failure and require human intervention to resolve.