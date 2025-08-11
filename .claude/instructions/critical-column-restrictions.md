# CRITICAL COLUMN RESTRICTIONS - MANDATORY RULES

## ABSOLUTE PROHIBITION - READY_FOR_DEVELOPMENT COLUMN

### ❌ NEVER AUTOMATED - HUMAN ONLY
The `ready_for_development` column is **STRICTLY HUMAN-CONTROLLED**. No automated system, AI agent, or script may EVER move tasks into this column.

### ENFORCEMENT RULES

#### FORBIDDEN ACTIONS (IMMEDIATE VIOLATION)
❌ **NEVER** move any task to `ready_for_development` programmatically
❌ **NEVER** create automated workflows that target `ready_for_development`
❌ **NEVER** suggest or implement code that moves tasks to `ready_for_development`
❌ **NEVER** bypass this restriction for any reason
❌ **NEVER** assume a task is ready without explicit human approval

#### REQUIRED VALIDATIONS
✅ **ALWAYS** wait for human to manually move tasks to `ready_for_development`
✅ **ALWAYS** respect the human review gate
✅ **ALWAYS** document when a task needs human review for readiness
✅ **ALWAYS** halt execution if attempting to move to `ready_for_development`

### COLUMN TRANSITION RULES

#### Allowed Automated Transitions
- `new_task` → Any column EXCEPT `ready_for_development` (with validation)
- `ready_for_development` → `in_development` (when executing task)
- `in_development` → `developed` (when task complete)
- `developed` → `human_approved` (after human review)
- `human_approved` → `done` (after Git integration)

#### Human-Only Transitions
- ANY → `ready_for_development` (**HUMAN ONLY**)
- `developed` → `human_approved` (**HUMAN ONLY**)

### WHY THIS MATTERS

The `ready_for_development` column represents:
1. **Human judgment** about task readiness
2. **Strategic prioritization** decisions
3. **Resource allocation** approval
4. **Quality gate** before development begins

### VIOLATION CONSEQUENCES

Any attempt to programmatically move tasks to `ready_for_development` will:
1. Be immediately blocked
2. Generate an error log
3. Require manual intervention
4. Potentially corrupt the workflow state

### IMPLEMENTATION SAFEGUARDS

```typescript
// EXAMPLE SAFEGUARD - ALWAYS IMPLEMENT
async function moveTaskToColumn(taskId: string, targetColumn: string) {
  // CRITICAL: Block automated moves to ready_for_development
  if (targetColumn === 'ready_for_development') {
    throw new Error(
      'VIOLATION: Tasks cannot be automatically moved to ready_for_development. ' +
      'This action requires human approval and manual intervention.'
    );
  }
  
  // Proceed with other column moves
  // ...
}
```

### AGENT INSTRUCTIONS

When working with task columns:
1. **NEVER** write code that moves tasks to `ready_for_development`
2. **ALWAYS** inform user when a task needs to be marked ready
3. **SUGGEST** tasks that might be ready, but never move them
4. **WAIT** for human confirmation before considering tasks ready

### VERIFICATION CHECKLIST

Before any column operation:
- [ ] Is target column `ready_for_development`? → **STOP**
- [ ] Is this an automated move? → **Cannot target ready_for_development**
- [ ] Is human explicitly requesting move to ready? → **Inform them to do it manually**

## ENFORCEMENT

This restriction is **NON-NEGOTIABLE** and **PERMANENT**. No exceptions, no overrides, no workarounds.

---

**Version**: 1.0.0  
**Created**: 2024-08-09  
**Priority**: CRITICAL  
**Status**: MANDATORY ENFORCEMENT