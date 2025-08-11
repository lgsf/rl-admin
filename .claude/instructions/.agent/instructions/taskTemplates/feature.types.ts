import { Priority, TestSpec } from './ai-task.types';

export type FeatureStatus = 
  | 'draft'
  | 'approved'
  | 'in_progress'
  | 'testing'
  | 'completed'
  | 'deployed'
  | 'deprecated';

export type FeatureSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type FeatureCategory = 
  | 'user_interface'
  | 'backend_service'
  | 'data_management'
  | 'integration'
  | 'performance'
  | 'security'
  | 'infrastructure'
  | 'analytics'
  | 'documentation';

export interface StakeholderInfo {
  role: string;
  name?: string;
  concerns: string[];
  approvalRequired: boolean;
}

export interface UserPersona {
  name: string;
  role: string;
  goals: string[];
  painPoints: string[];
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface FunctionalRequirement {
  id: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  acceptanceCriteria: string[];
  userStory?: string;
  mockups?: string[];
  taskIds?: string[];
}

export interface NonFunctionalRequirement {
  category: 'performance' | 'security' | 'usability' | 'reliability' | 'scalability' | 'maintainability';
  description: string;
  metric: string;
  target: string;
  measurement: string;
}

export interface TechnicalConstraint {
  type: 'technology' | 'architecture' | 'integration' | 'compliance' | 'resource';
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface BusinessMetric {
  name: string;
  current?: number | string;
  target: number | string;
  measurement: string;
  timeframe: string;
}

export interface RiskAssessment {
  risk: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'critical' | 'major' | 'minor';
  mitigation: string;
  contingency?: string;
}

export interface DependencyInfo {
  type: 'feature' | 'service' | 'team' | 'external';
  name: string;
  description: string;
  status: 'available' | 'in_progress' | 'blocked';
  owner?: string;
}

export interface MilestoneInfo {
  name: string;
  date: string;
  deliverables: string[];
  successCriteria: string[];
  taskIds: string[];
}

export interface FeatureTemplate {
  // ════════════════════════════════════════════════════════════════
  // SECTION 1: FEATURE IDENTITY
  // ════════════════════════════════════════════════════════════════
  
  metadata: {
    id: string;
    version: string;
    title: string;                    // Human-friendly title (max 100 chars)
    slug: string;                      // URL-friendly identifier
    status: FeatureStatus;
    priority: Priority;
    category: FeatureCategory;
    size: FeatureSize;
    estimatedDays: number;
    actualDays?: number;
    
    tags: string[];
    keywords: string[];               // For searchability
    
    createdAt: number;
    createdBy: string;
    lastModifiedAt: number;
    approvedBy?: string;
    approvedAt?: number;
    
    parentFeatureId?: string;          // For feature hierarchies
    relatedFeatureIds?: string[];      // Related features
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 2: HUMAN-FRIENDLY DESCRIPTION
  // ════════════════════════════════════════════════════════════════
  
  humanContext: {
    executiveSummary: string;          // 2-3 sentences for executives
    problemStatement: string;          // What problem does this solve?
    solution: string;                  // How does this solve it?
    benefits: string[];                // Business benefits
    
    userImpact: {
      affected: string[];              // Who is affected
      howMany: string;                 // Estimated user count
      frequency: string;               // How often used
    };
    
    visualDescription?: {
      screenshots?: string[];          // UI mockups
      diagrams?: string[];            // Architecture diagrams
      userFlow?: string[];            // User journey
      wireframes?: string[];          // Low-fidelity designs
    };
    
    exampleScenarios: {
      title: string;
      scenario: string;
      outcome: string;
    }[];
    
    faqs?: {
      question: string;
      answer: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 3: STAKEHOLDERS & USERS
  // ════════════════════════════════════════════════════════════════
  
  stakeholders: {
    sponsor: StakeholderInfo;
    productOwner: StakeholderInfo;
    technicalLead?: StakeholderInfo;
    otherStakeholders: StakeholderInfo[];
    
    userPersonas: UserPersona[];
    
    communicationPlan: {
      updateFrequency: string;
      channels: string[];
      keyContacts: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 4: FUNCTIONAL REQUIREMENTS
  // ════════════════════════════════════════════════════════════════
  
  functionalRequirements: {
    requirements: FunctionalRequirement[];
    
    userStories: {
      epic: string;                    // Main epic
      stories: {
        id: string;
        asA: string;                  // Role
        iWant: string;                // Feature
        soThat: string;              // Benefit
        acceptanceCriteria: string[];
        priority: 'must' | 'should' | 'could' | 'wont';
      }[];
    };
    
    useCases: {
      id: string;
      actor: string;
      description: string;
      preconditions: string[];
      mainFlow: string[];
      alternativeFlows?: string[];
      postconditions: string[];
    }[];
    
    outOfScope: string[];              // Explicitly not included
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 5: NON-FUNCTIONAL REQUIREMENTS
  // ════════════════════════════════════════════════════════════════
  
  nonFunctionalRequirements: {
    requirements: NonFunctionalRequirement[];
    
    performanceTargets: {
      responseTime?: string;
      throughput?: string;
      concurrentUsers?: string;
      dataVolume?: string;
    };
    
    securityRequirements: {
      authentication?: string;
      authorization?: string;
      dataProtection?: string;
      compliance?: string[];
    };
    
    usabilityRequirements: {
      accessibility?: string;
      browserSupport?: string[];
      deviceSupport?: string[];
      languages?: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 6: AI CONTEXT & INSTRUCTIONS
  // ════════════════════════════════════════════════════════════════
  
  aiContext: {
    backgroundKnowledge: string[];     // Context AI needs to understand
    domainTerminology: {               // Domain-specific terms
      term: string;
      definition: string;
    }[];
    
    architecturalContext: {
      currentArchitecture?: string;    // How system works now
      targetArchitecture: string;      // How it should work
      integrationPoints: string[];     // Systems to integrate with
      dataFlows: string[];             // How data moves
    };
    
    codebaseContext: {
      relevantFiles: string[];        // Key files to understand
      patterns: string[];              // Patterns to follow
      antiPatterns: string[];          // Patterns to avoid
      conventions: string[];           // Project conventions
    };
    
    decisionHistory?: {                // Past decisions affecting this
      decision: string;
      rationale: string;
      date: string;
    }[];
    
    commonPitfalls: string[];         // Known issues to avoid
    bestPractices: string[];          // Recommended approaches
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 7: TECHNICAL SPECIFICATIONS
  // ════════════════════════════════════════════════════════════════
  
  technicalSpecs: {
    architecture: {
      components: {
        name: string;
        type: string;
        responsibility: string;
        interfaces: string[];
      }[];
      
      dataModel?: {
        entities: string[];
        relationships: string[];
        schemas?: string[];
      };
      
      apiSpec?: {
        endpoints: {
          method: string;
          path: string;
          description: string;
          requestBody?: string;
          responseBody?: string;
        }[];
      };
    };
    
    technology: {
      frontend?: string[];
      backend?: string[];
      database?: string[];
      infrastructure?: string[];
      thirdPartyServices?: string[];
    };
    
    constraints: TechnicalConstraint[];
    
    integrations: {
      system: string;
      type: 'api' | 'database' | 'file' | 'message_queue';
      direction: 'inbound' | 'outbound' | 'bidirectional';
      protocol: string;
      dataFormat: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 8: IMPLEMENTATION PLAN
  // ════════════════════════════════════════════════════════════════
  
  implementationPlan: {
    approach: string;                  // High-level approach
    
    phases: {
      phaseNumber: number;
      name: string;
      description: string;
      duration: string;
      deliverables: string[];
      taskIds: string[];               // References to tasks
    }[];
    
    taskBreakdown: {
      category: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        estimatedHours: number;
        dependencies: string[];
        assignee?: string;
      }[];
    }[];
    
    milestones: MilestoneInfo[];
    
    rolloutStrategy: {
      type: 'big_bang' | 'phased' | 'pilot' | 'parallel';
      stages: string[];
      rollbackPlan: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 9: TESTING STRATEGY
  // ════════════════════════════════════════════════════════════════
  
  testingStrategy: {
    approach: string;
    
    testTypes: {
      unit: {
        coverage: number;
        tools: string[];
        responsibilities: string;
      };
      integration: {
        coverage: number;
        tools: string[];
        responsibilities: string;
      };
      e2e?: {
        scenarios: string[];
        tools: string[];
        responsibilities: string;
      };
      performance?: {
        scenarios: string[];
        tools: string[];
        targets: string[];
      };
      security?: {
        assessments: string[];
        tools: string[];
      };
    };
    
    acceptanceTests: TestSpec[];
    
    testData: {
      type: string;
      description: string;
      location?: string;
    }[];
    
    defectManagement: {
      severityLevels: string[];
      process: string;
      tools: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 10: SUCCESS METRICS
  // ════════════════════════════════════════════════════════════════
  
  successMetrics: {
    businessMetrics: BusinessMetric[];
    
    technicalMetrics: {
      metric: string;
      current?: string | number;
      target: string | number;
      measurement: string;
    }[];
    
    userMetrics: {
      metric: string;
      method: string;
      target: string;
      frequency: string;
    }[];
    
    acceptanceCriteria: {
      criterion: string;
      verification: string;
      owner: string;
    }[];
    
    definitionOfDone: string[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 11: RISKS & DEPENDENCIES
  // ════════════════════════════════════════════════════════════════
  
  risksAndDependencies: {
    risks: RiskAssessment[];
    
    dependencies: DependencyInfo[];
    
    assumptions: {
      assumption: string;
      validation: string;
      impact: string;
    }[];
    
    constraints: {
      type: 'time' | 'budget' | 'resource' | 'technical' | 'regulatory';
      description: string;
      impact: string;
      flexibility: 'fixed' | 'negotiable' | 'flexible';
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 12: DOCUMENTATION & TRAINING
  // ════════════════════════════════════════════════════════════════
  
  documentationPlan: {
    userDocumentation: {
      type: string;
      audience: string;
      format: string;
      location?: string;
    }[];
    
    technicalDocumentation: {
      type: string;
      audience: string;
      format: string;
      location?: string;
    }[];
    
    trainingPlan: {
      audience: string;
      method: string;
      duration: string;
      materials: string[];
    }[];
    
    knowledgeTransfer: {
      from: string;
      to: string;
      method: string;
      timeline: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 13: CHILD TASKS
  // ════════════════════════════════════════════════════════════════
  
  childTasks: {
    taskIds: string[];                 // References to AIExecutableTask IDs
    taskCount: number;
    completedCount: number;
    
    tasksByPhase: {
      phase: string;
      taskIds: string[];
    }[];
    
    tasksByPriority: {
      critical: string[];
      high: string[];
      medium: string[];
      low: string[];
    };
    
    estimatedTotalHours: number;
    actualTotalHours?: number;
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 14: TRACKING & HISTORY
  // ════════════════════════════════════════════════════════════════
  
  tracking: {
    progressPercentage: number;
    
    statusHistory: {
      status: FeatureStatus;
      timestamp: number;
      changedBy: string;
      reason?: string;
    }[];
    
    majorDecisions: {
      decision: string;
      date: string;
      madeBy: string;
      rationale: string;
      impact?: string;
    }[];
    
    blockers: {
      description: string;
      severity: 'critical' | 'major' | 'minor';
      status: 'active' | 'resolved';
      owner: string;
      resolution?: string;
    }[];
    
    lessonsLearned?: {
      category: string;
      lesson: string;
      recommendation: string;
    }[];
  };
}