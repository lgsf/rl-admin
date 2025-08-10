import { AIExecutableTask, MVPTask, Priority } from './ai-task.types';

export const createTaskId = (prefix: string = 'task'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}_${timestamp}_${random}`;
};

export const estimateTaskComplexity = (task: Partial<AIExecutableTask>): Priority => {
  let score = 0;
  
  if (task.dependencies?.taskDependencies?.length) {
    score += task.dependencies.taskDependencies.length * 2;
  }
  
  if (task.implementation?.steps?.length) {
    score += task.implementation.steps.length;
  }
  
  if (task.testSpecifications?.unitTests?.length) {
    score += task.testSpecifications.unitTests.length * 0.5;
  }
  
  if (score > 10) return 'critical';
  if (score > 5) return 'high';
  if (score > 2) return 'medium';
  return 'low';
};

export const validateMVPTask = (task: Partial<MVPTask>): string[] => {
  const errors: string[] = [];
  
  if (!task.title || task.title.length > 80) {
    errors.push('Title is required and must be <= 80 characters');
  }
  
  if (!task.objective) {
    errors.push('Objective is required');
  }
  
  if (!task.requirements || task.requirements.length === 0) {
    errors.push('At least one requirement is needed');
  }
  
  if (!task.acceptanceCriteria || task.acceptanceCriteria.length === 0) {
    errors.push('At least one acceptance criterion is needed');
  }
  
  if (!task.priority) {
    errors.push('Priority is required');
  }
  
  if (!task.estimatedMinutes || task.estimatedMinutes < 15) {
    errors.push('Estimated time must be at least 15 minutes');
  }
  
  return errors;
};

export const validateAITask = (task: Partial<AIExecutableTask>): string[] => {
  const errors: string[] = [];
  
  if (!task.metadata?.id) {
    errors.push('Task ID is required');
  }
  
  if (!task.metadata?.title || task.metadata.title.length > 80) {
    errors.push('Title is required and must be <= 80 characters');
  }
  
  if (!task.instructionReferences?.primaryInstructions?.length) {
    errors.push('At least one primary instruction reference is required');
  }
  
  if (!task.context?.problemStatement) {
    errors.push('Problem statement is required');
  }
  
  if (!task.testSpecifications?.unitTests?.length) {
    errors.push('At least one unit test specification is required');
  }
  
  if (!task.implementation?.steps?.length) {
    errors.push('At least one implementation step is required');
  }
  
  if (!task.acceptanceCriteria?.functional?.length) {
    errors.push('At least one functional acceptance criterion is required');
  }
  
  if (!task.validation?.postImplementation?.length) {
    errors.push('At least one post-implementation validation is required');
  }
  
  if (!task.aiGuidance?.successSignals?.length) {
    errors.push('At least one success signal is required for AI guidance');
  }
  
  return errors;
};

export const createTaskFromTemplate = (
  template: Partial<AIExecutableTask>,
  overrides: Partial<AIExecutableTask> = {}
): AIExecutableTask => {
  const now = Date.now();
  
  return {
    metadata: {
      id: createTaskId(),
      version: '2.0',
      boardId: 'board_main',
      column: 'new_task',
      title: '',
      priority: 'medium',
      estimatedMinutes: 60,
      tags: [],
      requiredExpertise: [],
      createdAt: now,
      createdBy: 'system',
      lastModifiedAt: now,
      ...template.metadata,
      ...overrides.metadata,
    },
    instructionReferences: {
      primaryInstructions: [],
      secondaryInstructions: [],
      ...template.instructionReferences,
      ...overrides.instructionReferences,
    },
    context: {
      problemStatement: '',
      businessValue: '',
      userStory: '',
      currentState: {
        description: '',
        painPoints: [],
        files: [],
      },
      desiredState: {
        description: '',
        benefits: [],
        files: [],
      },
      assumptions: [],
      constraints: [],
      outOfScope: [],
      ...template.context,
      ...overrides.context,
    },
    dependencies: {
      taskDependencies: [],
      technicalDependencies: {
        packages: [],
        apis: [],
        services: [],
        files: [],
      },
      knowledgeDependencies: {
        concepts: [],
        documentation: [],
        examples: [],
      },
      ...template.dependencies,
      ...overrides.dependencies,
    },
    testSpecifications: {
      approach: 'TDD',
      unitTests: [],
      integrationTests: [],
      coverageRequirements: {
        unit: 95,
        integration: 100,
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
      ...template.testSpecifications,
      ...overrides.testSpecifications,
    },
    implementation: {
      approach: '',
      steps: [],
      ...template.implementation,
      ...overrides.implementation,
    },
    acceptanceCriteria: {
      functional: [],
      nonFunctional: [],
      ...template.acceptanceCriteria,
      ...overrides.acceptanceCriteria,
    },
    validation: {
      preImplementation: [],
      duringImplementation: [],
      postImplementation: [],
      automatedChecks: {
        linting: {
          command: 'npm run lint',
          expectedOutput: 'No errors',
          autoFix: true,
        },
        typeChecking: {
          command: 'npm run typecheck',
          expectedOutput: 'No errors',
        },
        testing: {
          command: 'npm test',
          expectedOutput: 'All tests pass',
          coverageReport: true,
        },
        building: {
          command: 'npm run build',
          expectedOutput: 'Build successful',
        },
      },
      ...template.validation,
      ...overrides.validation,
    },
    errorHandling: {
      anticipatedErrors: [],
      recoveryStrategies: {
        rollbackProcedure: [],
        fallbackOptions: [],
        escalationPath: 'Ask for human help',
      },
      ...template.errorHandling,
      ...overrides.errorHandling,
    },
    documentation: {
      inlineDocumentation: {
        style: 'self-documenting',
        namingConventions: [],
        forbiddenPractices: ['comments', 'console.log'],
      },
      updates: {
        readme: false,
        changelog: false,
        other: [],
      },
      ...template.documentation,
      ...overrides.documentation,
    },
    aiGuidance: {
      executionMode: 'autonomous',
      decisionPoints: [],
      successSignals: [],
      failureSignals: [],
      progressTracking: {
        checkpoints: [],
        reportingFormat: 'markdown',
      },
      ...template.aiGuidance,
      ...overrides.aiGuidance,
    },
    executionLog: {
      attempts: [],
      ...template.executionLog,
      ...overrides.executionLog,
    },
  } as AIExecutableTask;
};

export const convertMVPToFullTask = (mvpTask: MVPTask): AIExecutableTask => {
  return createTaskFromTemplate({
    metadata: {
      id: mvpTask.id,
      boardId: mvpTask.boardId,
      column: mvpTask.column,
      title: mvpTask.title,
      priority: mvpTask.priority,
      estimatedMinutes: mvpTask.estimatedMinutes,
      createdAt: mvpTask.createdAt,
      createdBy: mvpTask.createdBy,
      lastModifiedAt: mvpTask.updatedAt,
    },
    instructionReferences: {
      primaryInstructions: mvpTask.instructionFiles.map(file => ({
        file,
        sections: [],
        rules: [],
      })),
      secondaryInstructions: [],
    },
    context: {
      problemStatement: mvpTask.objective,
      businessValue: '',
      userStory: '',
      currentState: {
        description: '',
        painPoints: [],
        files: [],
      },
      desiredState: {
        description: mvpTask.objective,
        benefits: mvpTask.acceptanceCriteria,
        files: [],
      },
      assumptions: [],
      constraints: [],
      outOfScope: [],
    },
    dependencies: {
      taskDependencies: mvpTask.dependencies || [],
      technicalDependencies: {
        packages: [],
        apis: [],
        services: [],
        files: [],
      },
      knowledgeDependencies: {
        concepts: [],
        documentation: [],
        examples: [],
      },
    },
    implementation: {
      approach: mvpTask.objective,
      steps: mvpTask.requirements.map((req, index) => ({
        stepNumber: index + 1,
        title: req,
        description: req,
        files: [],
        validation: {
          command: mvpTask.testCommand || '',
          expectedOutput: mvpTask.successIndicator || '',
        },
      })),
    },
    acceptanceCriteria: {
      functional: mvpTask.acceptanceCriteria.map((criterion, index) => ({
        id: `ac_${index}`,
        description: criterion,
        priority: 'must' as const,
        givenWhenThen: {
          given: 'Task is complete',
          when: 'Validation runs',
          then: criterion,
        },
        verification: {
          type: 'automated' as const,
          method: mvpTask.testCommand || 'manual check',
          expectedResult: mvpTask.successIndicator || 'success',
        },
      })),
      nonFunctional: [],
    },
    aiGuidance: {
      executionMode: 'autonomous',
      decisionPoints: [],
      successSignals: [mvpTask.successIndicator || 'Task complete'],
      failureSignals: [mvpTask.lastError || 'Task failed'],
      progressTracking: {
        checkpoints: [],
        reportingFormat: 'markdown',
      },
    },
  });
};

export const getTaskComplexityScore = (task: AIExecutableTask): number => {
  let score = 0;
  
  score += task.dependencies.taskDependencies.length * 3;
  score += task.implementation.steps.length * 2;
  score += task.testSpecifications.unitTests.length;
  score += task.testSpecifications.integrationTests.length * 1.5;
  score += task.acceptanceCriteria.functional.length;
  score += task.acceptanceCriteria.nonFunctional.length * 2;
  score += task.errorHandling.anticipatedErrors.length * 0.5;
  
  return Math.round(score);
};

export const estimateTaskDuration = (task: AIExecutableTask): number => {
  const complexity = getTaskComplexityScore(task);
  const base = task.metadata.estimatedMinutes;
  
  const multiplier = 1 + (complexity / 100);
  
  return Math.round(base * multiplier);
};