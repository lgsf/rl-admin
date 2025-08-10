import { 
  FeatureTemplate, 
  FeatureStatus, 
  FeatureSize, 
  FeatureCategory,
  Priority,
  FunctionalRequirement,
  NonFunctionalRequirement,
  UserPersona,
  StakeholderInfo,
  MilestoneInfo,
  RiskAssessment,
  DependencyInfo,
  TechnicalConstraint,
  BusinessMetric
} from './feature.types';
import { AIExecutableTask } from './ai-task.types';

// ════════════════════════════════════════════════════════════════
// FEATURE CREATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function createFeatureId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `FEAT-${timestamp}-${random}`;
}

export function createFeatureSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function estimateFeatureSize(taskCount: number): FeatureSize {
  if (taskCount <= 3) return 'XS';
  if (taskCount <= 8) return 'S';
  if (taskCount <= 15) return 'M';
  if (taskCount <= 30) return 'L';
  if (taskCount <= 50) return 'XL';
  return 'XXL';
}

export function calculateFeatureDuration(tasks: Partial<AIExecutableTask>[]): number {
  const totalHours = tasks.reduce((sum, task) => {
    const hours = task.implementationSteps?.estimatedHours || 0;
    return sum + hours;
  }, 0);
  
  return Math.ceil(totalHours / 8);
}

// ════════════════════════════════════════════════════════════════
// FEATURE TEMPLATE FACTORY
// ════════════════════════════════════════════════════════════════

export function createFeatureFromTemplate(
  template: Partial<FeatureTemplate>,
  overrides: Partial<FeatureTemplate> = {}
): FeatureTemplate {
  const now = Date.now();
  const title = template.metadata?.title || overrides.metadata?.title || 'Unnamed Feature';
  
  const defaultTemplate: FeatureTemplate = {
    metadata: {
      id: createFeatureId(),
      version: '1.0.0',
      title: title.substring(0, 100),
      slug: createFeatureSlug(title),
      status: 'draft' as FeatureStatus,
      priority: 'medium' as Priority,
      category: 'user_interface' as FeatureCategory,
      size: 'M' as FeatureSize,
      estimatedDays: 5,
      tags: [],
      keywords: [],
      createdAt: now,
      createdBy: 'system',
      lastModifiedAt: now,
      ...template.metadata,
      ...overrides.metadata
    },
    
    humanContext: {
      executiveSummary: '',
      problemStatement: '',
      solution: '',
      benefits: [],
      userImpact: {
        affected: [],
        howMany: '',
        frequency: ''
      },
      exampleScenarios: [],
      ...template.humanContext,
      ...overrides.humanContext
    },
    
    stakeholders: {
      sponsor: {
        role: 'Product Owner',
        concerns: [],
        approvalRequired: true
      },
      productOwner: {
        role: 'Product Owner',
        concerns: [],
        approvalRequired: true
      },
      otherStakeholders: [],
      userPersonas: [],
      communicationPlan: {
        updateFrequency: 'weekly',
        channels: ['email', 'slack'],
        keyContacts: []
      },
      ...template.stakeholders,
      ...overrides.stakeholders
    },
    
    functionalRequirements: {
      requirements: [],
      userStories: {
        epic: '',
        stories: []
      },
      useCases: [],
      outOfScope: [],
      ...template.functionalRequirements,
      ...overrides.functionalRequirements
    },
    
    nonFunctionalRequirements: {
      requirements: [],
      performanceTargets: {},
      securityRequirements: {},
      usabilityRequirements: {},
      ...template.nonFunctionalRequirements,
      ...overrides.nonFunctionalRequirements
    },
    
    aiContext: {
      backgroundKnowledge: [],
      domainTerminology: [],
      architecturalContext: {
        targetArchitecture: '',
        integrationPoints: [],
        dataFlows: []
      },
      codebaseContext: {
        relevantFiles: [],
        patterns: [],
        antiPatterns: [],
        conventions: []
      },
      commonPitfalls: [],
      bestPractices: [],
      ...template.aiContext,
      ...overrides.aiContext
    },
    
    technicalSpecs: {
      architecture: {
        components: []
      },
      technology: {},
      constraints: [],
      integrations: [],
      ...template.technicalSpecs,
      ...overrides.technicalSpecs
    },
    
    implementationPlan: {
      approach: '',
      phases: [],
      taskBreakdown: [],
      milestones: [],
      rolloutStrategy: {
        type: 'phased',
        stages: [],
        rollbackPlan: []
      },
      ...template.implementationPlan,
      ...overrides.implementationPlan
    },
    
    testingStrategy: {
      approach: '',
      testTypes: {
        unit: {
          coverage: 95,
          tools: [],
          responsibilities: ''
        },
        integration: {
          coverage: 100,
          tools: [],
          responsibilities: ''
        }
      },
      acceptanceTests: [],
      testData: [],
      defectManagement: {
        severityLevels: ['critical', 'major', 'minor', 'trivial'],
        process: '',
        tools: []
      },
      ...template.testingStrategy,
      ...overrides.testingStrategy
    },
    
    successMetrics: {
      businessMetrics: [],
      technicalMetrics: [],
      userMetrics: [],
      acceptanceCriteria: [],
      definitionOfDone: [],
      ...template.successMetrics,
      ...overrides.successMetrics
    },
    
    risksAndDependencies: {
      risks: [],
      dependencies: [],
      assumptions: [],
      constraints: [],
      ...template.risksAndDependencies,
      ...overrides.risksAndDependencies
    },
    
    documentationPlan: {
      userDocumentation: [],
      technicalDocumentation: [],
      trainingPlan: [],
      knowledgeTransfer: [],
      ...template.documentationPlan,
      ...overrides.documentationPlan
    },
    
    childTasks: {
      taskIds: [],
      taskCount: 0,
      completedCount: 0,
      tasksByPhase: [],
      tasksByPriority: {
        critical: [],
        high: [],
        medium: [],
        low: []
      },
      estimatedTotalHours: 0,
      ...template.childTasks,
      ...overrides.childTasks
    },
    
    tracking: {
      progressPercentage: 0,
      statusHistory: [{
        status: 'draft' as FeatureStatus,
        timestamp: now,
        changedBy: 'system'
      }],
      majorDecisions: [],
      blockers: [],
      ...template.tracking,
      ...overrides.tracking
    }
  };
  
  return defaultTemplate;
}

// ════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function validateFeature(feature: Partial<FeatureTemplate>): string[] {
  const errors: string[] = [];
  
  if (!feature.metadata?.title) {
    errors.push('Feature title is required');
  }
  
  if (!feature.humanContext?.executiveSummary) {
    errors.push('Executive summary is required for human understanding');
  }
  
  if (!feature.humanContext?.problemStatement) {
    errors.push('Problem statement is required');
  }
  
  if (!feature.functionalRequirements?.requirements?.length) {
    errors.push('At least one functional requirement is required');
  }
  
  if (!feature.implementationPlan?.approach) {
    errors.push('Implementation approach is required');
  }
  
  if (!feature.testingStrategy?.approach) {
    errors.push('Testing approach is required');
  }
  
  if (!feature.successMetrics?.definitionOfDone?.length) {
    errors.push('Definition of done is required');
  }
  
  return errors;
}

export function validateForExecution(feature: FeatureTemplate): string[] {
  const errors = validateFeature(feature);
  
  if (feature.metadata.status === 'draft') {
    errors.push('Feature must be approved before execution');
  }
  
  if (!feature.childTasks.taskIds.length) {
    errors.push('Feature must have at least one child task');
  }
  
  if (!feature.implementationPlan.phases.length) {
    errors.push('Implementation phases must be defined');
  }
  
  if (!feature.stakeholders.productOwner) {
    errors.push('Product owner must be assigned');
  }
  
  return errors;
}

// ════════════════════════════════════════════════════════════════
// FEATURE STATE MANAGEMENT
// ════════════════════════════════════════════════════════════════

export function updateFeatureStatus(
  feature: FeatureTemplate,
  newStatus: FeatureStatus,
  changedBy: string,
  reason?: string
): FeatureTemplate {
  const now = Date.now();
  
  return {
    ...feature,
    metadata: {
      ...feature.metadata,
      status: newStatus,
      lastModifiedAt: now
    },
    tracking: {
      ...feature.tracking,
      statusHistory: [
        ...feature.tracking.statusHistory,
        {
          status: newStatus,
          timestamp: now,
          changedBy,
          reason
        }
      ]
    }
  };
}

export function addChildTask(
  feature: FeatureTemplate,
  taskId: string,
  task: AIExecutableTask
): FeatureTemplate {
  const priority = task.metadata.priority;
  const priorityKey = priority as keyof typeof feature.childTasks.tasksByPriority;
  
  return {
    ...feature,
    childTasks: {
      ...feature.childTasks,
      taskIds: [...feature.childTasks.taskIds, taskId],
      taskCount: feature.childTasks.taskCount + 1,
      tasksByPriority: {
        ...feature.childTasks.tasksByPriority,
        [priorityKey]: [...feature.childTasks.tasksByPriority[priorityKey], taskId]
      },
      estimatedTotalHours: feature.childTasks.estimatedTotalHours + 
        (task.implementationSteps?.estimatedHours || 0)
    }
  };
}

export function updateProgress(feature: FeatureTemplate): FeatureTemplate {
  const progress = feature.childTasks.taskCount > 0
    ? Math.round((feature.childTasks.completedCount / feature.childTasks.taskCount) * 100)
    : 0;
  
  return {
    ...feature,
    tracking: {
      ...feature.tracking,
      progressPercentage: progress
    }
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE BREAKDOWN UTILITIES
// ════════════════════════════════════════════════════════════════

export function generateTasksFromRequirements(
  feature: FeatureTemplate
): Partial<AIExecutableTask>[] {
  const tasks: Partial<AIExecutableTask>[] = [];
  
  feature.functionalRequirements.requirements.forEach(req => {
    const task: Partial<AIExecutableTask> = {
      metadata: {
        title: `Implement: ${req.description}`,
        priority: req.priority === 'must_have' ? 'critical' : 
                 req.priority === 'should_have' ? 'high' : 'medium',
        tags: [`feature:${feature.metadata.slug}`, `req:${req.id}`]
      },
      context: {
        businessContext: feature.humanContext.executiveSummary,
        technicalContext: feature.aiContext.architecturalContext.targetArchitecture,
        dependencies: [],
        currentState: '',
        targetState: req.description
      },
      testSpecs: {
        unit: {
          description: `Unit tests for ${req.description}`,
          patterns: [],
          coverage: 95
        },
        integration: {
          description: `Integration tests for ${req.description}`,
          endpoints: [],
          scenarios: req.acceptanceCriteria
        }
      }
    };
    
    tasks.push(task);
  });
  
  return tasks;
}

// ════════════════════════════════════════════════════════════════
// RISK ASSESSMENT UTILITIES
// ════════════════════════════════════════════════════════════════

export function calculateRiskScore(risk: RiskAssessment): number {
  const probabilityScore = risk.probability === 'high' ? 3 : 
                          risk.probability === 'medium' ? 2 : 1;
  const impactScore = risk.impact === 'critical' ? 3 :
                     risk.impact === 'major' ? 2 : 1;
  
  return probabilityScore * impactScore;
}

export function prioritizeRisks(risks: RiskAssessment[]): RiskAssessment[] {
  return [...risks].sort((a, b) => 
    calculateRiskScore(b) - calculateRiskScore(a)
  );
}

// ════════════════════════════════════════════════════════════════
// REPORTING UTILITIES
// ════════════════════════════════════════════════════════════════

export function generateFeatureSummary(feature: FeatureTemplate): string {
  return `
# ${feature.metadata.title}

## Status: ${feature.metadata.status}
Progress: ${feature.tracking.progressPercentage}%

## Summary
${feature.humanContext.executiveSummary}

## Problem
${feature.humanContext.problemStatement}

## Solution
${feature.humanContext.solution}

## Requirements
${feature.functionalRequirements.requirements.length} functional requirements
${feature.nonFunctionalRequirements.requirements.length} non-functional requirements

## Tasks
Total: ${feature.childTasks.taskCount}
Completed: ${feature.childTasks.completedCount}
Estimated Hours: ${feature.childTasks.estimatedTotalHours}

## Risks
${feature.risksAndDependencies.risks.length} identified risks
${feature.risksAndDependencies.dependencies.length} dependencies
  `.trim();
}

export function exportFeatureForAI(feature: FeatureTemplate): string {
  return JSON.stringify({
    title: feature.metadata.title,
    context: feature.aiContext,
    requirements: feature.functionalRequirements,
    technical: feature.technicalSpecs,
    testing: feature.testingStrategy,
    tasks: feature.childTasks.taskIds
  }, null, 2);
}