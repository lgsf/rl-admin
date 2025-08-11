# Task Creation Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Template: ALWAYS use AIExecutableTask interface
2. Validation: ALWAYS validate before saving
3. Tests: ALWAYS define tests BEFORE implementation
4. Instructions: ALWAYS reference central instructions
5. Success: ALWAYS define measurable success criteria

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER create tasks without test specifications
❌ NEVER use vague objectives or requirements
❌ NEVER skip instruction references
❌ NEVER omit success indicators
❌ NEVER create tasks > 4 hours estimated time
❌ NEVER use ambiguous acceptance criteria
❌ NEVER forget error handling scenarios
❌ NEVER skip validation commands
❌ NEVER create tasks without dependencies check
❌ NEVER omit progress checkpoints

### REQUIRED ACTIONS
✅ ALWAYS use the AIExecutableTask template
✅ ALWAYS reference .agent/instructions files
✅ ALWAYS write tests BEFORE implementation
✅ ALWAYS include validation commands
✅ ALWAYS define clear success signals
✅ ALWAYS anticipate common errors
✅ ALWAYS provide rollback procedures
✅ ALWAYS set progress checkpoints (25/50/75/100%)
✅ ALWAYS estimate time realistically
✅ ALWAYS specify required expertise

## TASK TEMPLATE STRUCTURE (USE EXACTLY)

### Template Files Location
All templates are in: `.agent/instructions/taskTemplates/`
- **Types**: `ai-task.types.ts`, `mvp-task.types.ts`
- **Utils**: `task-template.utils.ts`
- **Examples**: `example-task-full.json`, `example-task-mvp.json`

### Complete AIExecutableTask Interface
```typescript
// Import from taskTemplates/ai-task.types.ts
interface AIExecutableTask {
  metadata: TaskMetadata;
  instructionReferences: InstructionReferences;
  context: TaskContext;
  dependencies: TaskDependencies;
  testSpecifications: TestSpecifications;
  implementation: ImplementationPlan;
  acceptanceCriteria: AcceptanceCriteria;
  validation: ValidationPlan;
  errorHandling: ErrorHandlingPlan;
  documentation: DocumentationRequirements;
  aiGuidance: AIGuidanceInfo;
  executionLog: ExecutionLog;
}
```

## METADATA SECTION (MANDATORY)

```typescript
metadata: {
  id: "task_{category}_{number}",  // task_backend_001
  title: "{Action} {Target}",       // Max 80 chars
  priority: "critical|high|medium|low",
  estimatedMinutes: 15-240,         // Max 4 hours per task
  tags: ["backend", "frontend", "database", "testing"],
  requiredExpertise: ["React", "Convex", "TypeScript"],
  assignedTo: "ai|human|hybrid"
}
```

### Title Patterns
```
"Setup {Component} for {Feature}"
"Implement {Functionality} in {Module}"
"Create {Type} Component for {Purpose}"
"Add {Feature} to {System}"
"Configure {Service} with {Options}"
"Test {Component} for {Scenarios}"
```

## INSTRUCTION REFERENCES (MANDATORY)

```typescript
instructionReferences: {
  primaryInstructions: [
    {
      file: ".agent/instructions/{domain}.md",
      sections: ["SPECIFIC_SECTION"],
      rules: ["EXACT_RULE_TO_FOLLOW"]
    }
  ]
}
```

### Required References by Domain
- **Frontend tasks**: `.agent/instructions/frontend.md`
- **Backend tasks**: `.agent/instructions/backend.md`
- **Testing tasks**: `.agent/instructions/unit-testing.md` or `integration-testing.md`
- **Design tasks**: `.agent/instructions/design.md`
- **All tasks**: `.agent/instructions/source-control.md`

## CONTEXT SECTION (MANDATORY)

```typescript
context: {
  problemStatement: "Clear problem in 1-2 sentences",
  businessValue: "Why this matters to users/business",
  userStory: "As a {role}, I want {feature}, so that {benefit}",
  currentState: {
    description: "How it works now",
    painPoints: ["Problem 1", "Problem 2"],
    files: ["existing/file.ts"]
  },
  desiredState: {
    description: "How it should work",
    benefits: ["Benefit 1", "Benefit 2"],
    files: ["new/file.ts", "modified/file.ts"]
  },
  assumptions: ["What we assume is true"],
  constraints: ["Technical or business limits"],
  outOfScope: ["What NOT to do"]
}
```

## TEST SPECIFICATIONS (MANDATORY - TDD)

### Test-First Development Pattern
```typescript
testSpecifications: {
  approach: "TDD",  // ALWAYS TDD
  unitTests: [
    {
      testId: "test_{feature}_{number}",
      description: "Clear test purpose",
      category: "happy-path|edge-case|error-handling",
      given: "Initial state",
      when: "Action taken",
      then: "Expected outcome",
      priority: "must-pass|should-pass|nice-to-pass"
    }
  ],
  coverageRequirements: {
    unit: 95,        // Minimum
    integration: 100, // Minimum
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95
  }
}
```

### Test Patterns
```typescript
// Happy Path Test
{
  given: "Valid input data",
  when: "Function is called",
  then: "Returns expected result"
}

// Edge Case Test
{
  given: "Boundary value input",
  when: "Edge condition occurs",
  then: "Handles gracefully"
}

// Error Test
{
  given: "Invalid input",
  when: "Error condition triggered",
  then: "Throws appropriate error"
}
```

## IMPLEMENTATION STEPS (MANDATORY)

```typescript
implementation: {
  approach: "High-level strategy in 1 sentence",
  steps: [
    {
      stepNumber: 1,
      title: "Clear action",
      description: "What and why",
      files: [
        {
          operation: "create|modify|delete",
          path: "exact/file/path.ts",
          purpose: "Why this file"
        }
      ],
      validation: {
        command: "npm test or similar",
        expectedOutput: "Specific success indicator"
      }
    }
  ]
}
```

### Step Patterns
1. **Setup step**: Create file structure
2. **Core step**: Implement main logic
3. **Integration step**: Connect components
4. **Validation step**: Test functionality
5. **Cleanup step**: Finalize and optimize

## ACCEPTANCE CRITERIA (MANDATORY)

### Functional Criteria Pattern
```typescript
functional: [
  {
    id: "ac_func_{number}",
    description: "Specific measurable outcome",
    priority: "must|should|could",
    givenWhenThen: {
      given: "Precondition",
      when: "Action",
      then: "Postcondition"
    },
    verification: {
      type: "automated",
      command: "Exact command to run",
      expectedResult: "Exact expected output"
    }
  }
]
```

### Non-Functional Criteria Pattern
```typescript
nonFunctional: [
  {
    category: "performance|security|usability",
    requirement: "Specific requirement",
    metric: "Measurable metric",
    threshold: "Pass/fail threshold",
    measurementMethod: "How to measure"
  }
]
```

## VALIDATION COMMANDS (MANDATORY)

```typescript
validation: {
  automatedChecks: {
    linting: {
      command: "npm run lint",
      expectedOutput: "No errors",
      autoFix: true
    },
    typeChecking: {
      command: "npm run typecheck",
      expectedOutput: "No errors"
    },
    testing: {
      command: "npm test",
      expectedOutput: "All tests pass",
      coverageReport: true
    },
    building: {
      command: "npm run build",
      expectedOutput: "Build successful"
    }
  }
}
```

## ERROR HANDLING (MANDATORY)

```typescript
errorHandling: {
  anticipatedErrors: [
    {
      error: "Common error type",
      likelihood: "high|medium|low",
      cause: "Why it happens",
      solution: "How to fix",
      prevention: "How to avoid"
    }
  ],
  recoveryStrategies: {
    rollbackProcedure: ["Step 1", "Step 2"],
    fallbackOptions: ["Alternative 1", "Alternative 2"],
    escalationPath: "When to ask for help"
  }
}
```

### Common Error Patterns
- **Type errors**: Wrong TypeScript types
- **Import errors**: Missing dependencies
- **Runtime errors**: Null/undefined access
- **Network errors**: API failures
- **State errors**: Invalid state transitions

## AI GUIDANCE (MANDATORY)

```typescript
aiGuidance: {
  executionMode: "autonomous|supervised|collaborative",
  decisionPoints: [
    {
      decision: "Question to decide",
      options: ["Option A", "Option B"],
      defaultChoice: "Option A",
      criteria: "How to decide"
    }
  ],
  successSignals: [
    "File X exists",
    "Test Y passes",
    "No TypeScript errors"
  ],
  failureSignals: [
    "Compilation errors",
    "Test failures",
    "Missing files"
  ],
  progressTracking: {
    checkpoints: [
      { name: "Setup complete", percentage: 25 },
      { name: "Core logic done", percentage: 50 },
      { name: "Tests passing", percentage: 75 },
      { name: "Fully complete", percentage: 100 }
    ]
  }
}
```

## MVP TASK TEMPLATE (SIMPLIFIED)

For quick starts, use MVPTask:

```typescript
interface MVPTask {
  // Minimum required fields
  id: string;
  title: string;
  objective: string;
  requirements: string[];
  acceptanceCriteria: string[];
  testCommand: string;
  successIndicator: string;
  instructionFiles: string[];
}
```

### MVP to Full Conversion
```typescript
// Import from central templates
import { convertMVPToFullTask } from '.agent/instructions/taskTemplates/task-template.utils';

const mvpTask: MVPTask = { /* ... */ };
const fullTask = convertMVPToFullTask(mvpTask);
```

## TASK VALIDATION CHECKLIST

Before creating ANY task, verify:
- [ ] Title is action-oriented and < 80 chars
- [ ] References correct instruction files
- [ ] Problem statement is clear
- [ ] Tests defined BEFORE implementation
- [ ] Each step has validation command
- [ ] Success criteria are measurable
- [ ] Error scenarios anticipated
- [ ] Time estimate is realistic (< 4 hours)
- [ ] Progress checkpoints defined
- [ ] All required fields populated

## TASK COMPLEXITY GUIDELINES

### Simple Task (15-60 minutes)
- Single file modification
- < 5 test cases
- No external dependencies
- Clear success criteria

### Medium Task (60-120 minutes)
- 2-3 file modifications
- 5-10 test cases
- 1-2 dependencies
- Multiple validation steps

### Complex Task (120-240 minutes)
- 4+ file modifications
- 10+ test cases
- Multiple dependencies
- Extensive validation

**NEVER create tasks > 240 minutes - break into subtasks**

## TASK CREATION WORKFLOW

1. **Identify need** from user story or requirement
2. **Check dependencies** - what must exist first?
3. **Write tests first** - TDD approach
4. **Define implementation** - step by step
5. **Add validation** - how to verify success
6. **Include error handling** - what could go wrong
7. **Reference instructions** - which rules apply
8. **Validate template** - all fields complete
9. **Review complexity** - under 4 hours?
10. **Save to system** - ready for execution

## EXAMPLE TASK CREATION

```typescript
const task: AIExecutableTask = {
  metadata: {
    id: "task_frontend_001",
    title: "Create Task Display Component",
    priority: "high",
    estimatedMinutes: 90,
    tags: ["frontend", "react", "component"],
    requiredExpertise: ["React", "TypeScript", "Tailwind"],
    assignedTo: "ai"
  },
  instructionReferences: {
    primaryInstructions: [{
      file: ".agent/instructions/frontend.md",
      sections: ["REACT 19 COMPONENT TEMPLATES"],
      rules: ["ALWAYS use @lgsf/ui-lib", "NEVER use any types"]
    }]
  },
  testSpecifications: {
    approach: "TDD",
    unitTests: [{
      testId: "test_task_display_001",
      description: "Renders task title",
      given: "Task with title",
      when: "Component renders",
      then: "Title is visible",
      priority: "must-pass"
    }]
  },
  // ... rest of template
};
```

## COMMON ANTIPATTERNS TO AVOID

```typescript
// ❌ NEVER DO THIS
{
  title: "Fix the bug",              // Too vague
  objective: "Make it work",         // Not specific
  requirements: ["Do stuff"],        // Not actionable
  testCommand: "Check if works",     // Not automated
  successIndicator: "Looks good"     // Not measurable
}

// ✅ ALWAYS DO THIS
{
  title: "Fix null pointer in getUserById function",
  objective: "Prevent crash when user ID doesn't exist",
  requirements: [
    "Add null check before accessing user object",
    "Return error response for missing users",
    "Add unit test for null case"
  ],
  testCommand: "npm test -- getUserById",
  successIndicator: "All 3 tests pass with 100% coverage"
}
```

## TASK QUALITY METRICS

Well-defined tasks achieve:
- **95%+ AI execution success** on first attempt
- **< 5 minutes** to understand completely
- **Zero ambiguity** in requirements
- **100% test coverage** possibility
- **< 2 clarification requests** during execution

## ENFORCEMENT

**CRITICAL**: Every development task MUST follow this template. Tasks not using this template will be rejected automatically. This ensures:
- Consistent task quality
- Predictable AI execution
- Measurable success criteria
- Complete test coverage
- Proper error handling