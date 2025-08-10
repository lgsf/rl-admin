export type TaskColumn = 
  | 'new_task' 
  | 'ready_for_development' 
  | 'in_development' 
  | 'developed' 
  | 'human_approved' 
  | 'done';

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type AssignmentType = 'ai' | 'human' | 'hybrid';
export type TestApproach = 'TDD' | 'BDD' | 'ATDD';
export type TestCategory = 'happy-path' | 'edge-case' | 'error-handling';
export type TestPriority = 'must-pass' | 'should-pass' | 'nice-to-pass';
export type CriteriaPriority = 'must' | 'should' | 'could';
export type VerificationType = 'automated' | 'manual' | 'hybrid';
export type NonFunctionalCategory = 
  | 'performance' 
  | 'security' 
  | 'usability' 
  | 'reliability' 
  | 'maintainability' 
  | 'accessibility';
export type ErrorLikelihood = 'high' | 'medium' | 'low';
export type ExecutionMode = 'autonomous' | 'supervised' | 'collaborative';
export type ExecutionStatus = 'success' | 'failure' | 'partial' | 'blocked';
export type FileOperation = 'create' | 'modify' | 'delete' | 'rename';

export interface InstructionRef {
  file: string;
  sections: string[];
  rules: string[];
}

export interface PackageDep {
  name: string;
  version: string;
  purpose: string;
  installCommand: string;
}

export interface ApiDep {
  name: string;
  endpoint: string;
  purpose: string;
  authentication?: string;
}

export interface ServiceDep {
  name: string;
  purpose: string;
  setupCommand?: string;
}

export interface FileDep {
  path: string;
  purpose: string;
  mustExist: boolean;
}

export interface TestSpec {
  testId: string;
  description: string;
  category: TestCategory;
  given: string;
  when: string;
  then: string;
  testCode?: string;
  mockData?: unknown;
  priority: TestPriority;
}

export interface FileOperationSpec {
  operation: FileOperation;
  path: string;
  purpose: string;
  codeSnippet?: string;
}

export interface ImplementationStep {
  stepNumber: number;
  title: string;
  description: string;
  files: FileOperationSpec[];
  validation: {
    command: string;
    expectedOutput: string;
  };
  rollback?: {
    command: string;
    files: string[];
  };
}

export interface FunctionalCriteria {
  id: string;
  description: string;
  priority: CriteriaPriority;
  givenWhenThen: {
    given: string;
    when: string;
    then: string;
  };
  verification: {
    type: VerificationType;
    method: string;
    command?: string;
    expectedResult: string;
  };
}

export interface NonFunctionalCriteria {
  category: NonFunctionalCategory;
  requirement: string;
  metric: string;
  threshold: string;
  measurementMethod: string;
}

export interface ValidationStep {
  name: string;
  description: string;
  command?: string;
  expectedOutcome: string;
  isBlocking: boolean;
}

export interface ErrorScenario {
  error: string;
  likelihood: ErrorLikelihood;
  cause: string;
  solution: string;
  prevention: string;
}

export interface DebugGuide {
  symptom: string;
  possibleCauses: string[];
  diagnosticSteps: string[];
  solutions: string[];
}

export interface DecisionPoint {
  decision: string;
  options: string[];
  defaultChoice: string;
  criteria: string;
}

export interface Checkpoint {
  name: string;
  percentage: number;
  verification: string;
  artifacts: string[];
}

export interface ExecutionAttempt {
  attemptNumber: number;
  timestamp: number;
  status: ExecutionStatus;
  completedSteps: string[];
  failedSteps: string[];
  blockers: string[];
  artifacts: {
    filesCreated: string[];
    filesModified: string[];
    testsCreated: string[];
    errors: string[];
  };
  duration: number;
  notes: string;
}

export interface CoverageMetrics {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface MVPTask {
  id: string;
  boardId: string;
  column: TaskColumn;
  position: number;
  
  title: string;
  objective: string;
  priority: Priority;
  estimatedMinutes: number;
  
  instructionFiles: string[];
  
  requirements: string[];
  acceptanceCriteria: string[];
  
  testCommand?: string;
  successIndicator?: string;
  
  dependencies?: string[];
  
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  
  attempts?: number;
  lastError?: string;
  completedAt?: number;
}

export interface AIExecutableTask {
  metadata: {
    id: string;
    version: string;
    parentTaskId?: string;
    boardId: string;
    column: TaskColumn;
    title: string;
    epic?: string;
    priority: Priority;
    estimatedMinutes: number;
    actualMinutes?: number;
    tags: string[];
    requiredExpertise: string[];
    createdAt: number;
    createdBy: string;
    lastModifiedAt: number;
    assignedTo?: AssignmentType;
  };

  instructionReferences: {
    primaryInstructions: InstructionRef[];
    secondaryInstructions: InstructionRef[];
  };

  context: {
    problemStatement: string;
    businessValue: string;
    userStory: string;
    currentState: {
      description: string;
      painPoints: string[];
      files: string[];
    };
    desiredState: {
      description: string;
      benefits: string[];
      files: string[];
    };
    assumptions: string[];
    constraints: string[];
    outOfScope: string[];
  };

  dependencies: {
    taskDependencies: string[];
    technicalDependencies: {
      packages: PackageDep[];
      apis: ApiDep[];
      services: ServiceDep[];
      files: FileDep[];
    };
    knowledgeDependencies: {
      concepts: string[];
      documentation: string[];
      examples: string[];
    };
  };

  testSpecifications: {
    approach: TestApproach;
    unitTests: TestSpec[];
    integrationTests: TestSpec[];
    e2eTests?: TestSpec[];
    coverageRequirements: {
      unit: number;
      integration: number;
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    testTemplates?: {
      setup: string;
      teardown: string;
      helpers: string;
    };
  };

  implementation: {
    approach: string;
    steps: ImplementationStep[];
    codeTemplates?: {
      component?: string;
      hook?: string;
      mutation?: string;
      query?: string;
      utility?: string;
    };
    patterns?: {
      designPatterns: string[];
      architecturalPatterns: string[];
      reactPatterns: string[];
    };
  };

  acceptanceCriteria: {
    functional: FunctionalCriteria[];
    nonFunctional: NonFunctionalCriteria[];
  };

  validation: {
    preImplementation: ValidationStep[];
    duringImplementation: ValidationStep[];
    postImplementation: ValidationStep[];
    automatedChecks: {
      linting: {
        command: string;
        expectedOutput: string;
        autoFix: boolean;
      };
      typeChecking: {
        command: string;
        expectedOutput: string;
      };
      testing: {
        command: string;
        expectedOutput: string;
        coverageReport: boolean;
      };
      building: {
        command: string;
        expectedOutput: string;
      };
    };
    manualChecks?: {
      codeReview: string[];
      visualInspection: string[];
      userFlow: string[];
    };
    performanceChecks?: {
      loadTime?: string;
      responseTime?: string;
      memoryUsage?: string;
      bundleSize?: string;
    };
  };

  errorHandling: {
    anticipatedErrors: ErrorScenario[];
    recoveryStrategies: {
      rollbackProcedure: string[];
      fallbackOptions: string[];
      escalationPath: string;
    };
    debugging?: {
      commonIssues: DebugGuide[];
      logs: string[];
      tools: string[];
    };
  };

  documentation: {
    inlineDocumentation: {
      style: string;
      namingConventions: string[];
      forbiddenPractices: string[];
    };
    technicalDocumentation?: {
      architecture?: string;
      apiDocs?: string;
      dataFlow?: string;
    };
    userDocumentation?: {
      userGuide?: string;
      screenshots?: string[];
      videos?: string[];
    };
    updates: {
      readme: boolean;
      changelog: boolean;
      other: string[];
    };
  };

  aiGuidance: {
    executionMode: ExecutionMode;
    decisionPoints: DecisionPoint[];
    successSignals: string[];
    failureSignals: string[];
    progressTracking: {
      checkpoints: Checkpoint[];
      reportingFormat: string;
    };
    learningFeedback?: {
      capturePoints: string[];
      improvementAreas: string[];
    };
  };

  executionLog: {
    attempts: ExecutionAttempt[];
    metrics?: {
      startTime?: number;
      endTime?: number;
      actualDuration?: number;
      linesOfCode?: number;
      filesModified?: number;
      testsWritten?: number;
      testsPassed?: number;
      coverage?: CoverageMetrics;
    };
    feedback?: {
      aiNotes?: string;
      humanNotes?: string;
      improvements?: string[];
    };
  };
}