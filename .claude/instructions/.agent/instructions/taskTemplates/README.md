# Task Templates

This folder contains all templates and utilities for creating AI-executable development tasks.

## 📁 Files

### TypeScript Types
- **`ai-task.types.ts`** - Complete AIExecutableTask interface with all 12 sections
- **`mvp-task.types.ts`** - Simplified MVPTask interface for quick starts

### Utilities
- **`task-template.utils.ts`** - Helper functions for task creation and validation

### Examples
- **`example-task-full.json`** - Complete example using AIExecutableTask template
- **`example-task-mvp.json`** - Simple example using MVPTask template

## 🚀 Quick Start

### Using MVP Template (Simple)
```typescript
import { MVPTask } from './mvp-task.types';

const task: MVPTask = {
  id: "task_001",
  title: "Create Component",
  objective: "Build user list component",
  requirements: ["Create component file", "Add props interface"],
  acceptanceCriteria: ["Component renders", "Props work"],
  testCommand: "npm test",
  successIndicator: "Tests pass",
  instructionFiles: [".agent/instructions/frontend.md"]
};
```

### Using Full Template (Complete)
```typescript
import { AIExecutableTask } from './ai-task.types';
import { createTaskFromTemplate } from './task-template.utils';

const task = createTaskFromTemplate({
  metadata: { 
    title: "Complex Feature",
    priority: "high"
  },
  // ... all 12 sections
});
```

### Converting MVP to Full
```typescript
import { convertMVPToFullTask } from './task-template.utils';

const mvpTask: MVPTask = { /* ... */ };
const fullTask = convertMVPToFullTask(mvpTask);
```

## ✅ Validation

```typescript
import { validateMVPTask, validateAITask } from './task-template.utils';

// Validate before saving
const errors = validateAITask(task);
if (errors.length > 0) {
  console.error('Task validation failed:', errors);
}
```

## 📊 Task Complexity

```typescript
import { getTaskComplexityScore, estimateTaskDuration } from './task-template.utils';

const complexity = getTaskComplexityScore(task);
const duration = estimateTaskDuration(task);
```

## 🔗 Integration with Projects

These templates are referenced by:
- `.agent/instructions/task-creation.md` - Enforcement rules
- Project task management systems
- AI agents creating new tasks

## 📋 Template Sections

### AIExecutableTask (Full)
1. **metadata** - Identity and context
2. **instructionReferences** - Links to central instructions
3. **context** - Problem and solution
4. **dependencies** - Prerequisites
5. **testSpecifications** - TDD tests
6. **implementation** - Step-by-step guide
7. **acceptanceCriteria** - Success metrics
8. **validation** - Verification commands
9. **errorHandling** - Recovery strategies
10. **documentation** - Requirements
11. **aiGuidance** - Execution support
12. **executionLog** - Progress tracking

### MVPTask (Simple)
- Basic metadata (id, title, priority)
- Core content (objective, requirements)
- Validation (testCommand, successIndicator)
- References (instructionFiles)

## 🎯 Best Practices

1. **Start with MVP** for simple tasks
2. **Use Full template** for complex features
3. **Always validate** before saving
4. **Reference instructions** from `.agent/instructions/`
5. **Write tests first** (TDD approach)
6. **Include validation commands** for automation
7. **Anticipate errors** with recovery plans
8. **Set checkpoints** at 25%, 50%, 75%, 100%

## 📈 Success Metrics

Tasks using these templates achieve:
- 95%+ AI execution success rate
- < 5 minutes to understand
- Zero ambiguity
- 100% test coverage capability
- < 2 clarifications needed