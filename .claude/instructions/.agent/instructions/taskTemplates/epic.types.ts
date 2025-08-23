import { Priority } from './ai-task.types';
import { FeatureTemplate } from './feature.types';

export type EpicStatus = 
  | 'ideation'
  | 'planning'
  | 'approved'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type EpicTheme = 
  | 'growth'
  | 'retention'
  | 'infrastructure'
  | 'tech_debt'
  | 'compliance'
  | 'innovation'
  | 'optimization'
  | 'user_experience'
  | 'platform_capability';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  deliverables: string[];
  featureIds: string[];
  status: 'planned' | 'active' | 'completed' | 'delayed';
}

export interface StrategicAlignment {
  companyGoal: string;
  objective: string;
  keyResult: string;
  metric: string;
  target: string | number;
  current?: string | number;
}

export interface MarketAnalysis {
  competitorAnalysis: {
    competitor: string;
    feature: string;
    ourAdvantage: string;
    theirAdvantage: string;
  }[];
  marketTrends: string[];
  customerDemand: {
    source: string;
    feedback: string;
    frequency: string;
  }[];
  opportunitySize: string;
}

export interface ResourceRequirement {
  role: string;
  count: number;
  skills: string[];
  duration: string;
  allocation: 'full_time' | 'part_time' | 'as_needed';
  status: 'confirmed' | 'requested' | 'unavailable';
}

export interface BudgetItem {
  category: 'personnel' | 'infrastructure' | 'tools' | 'services' | 'other';
  item: string;
  amount: number;
  currency: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  status: 'approved' | 'pending' | 'rejected';
}

export interface ROICalculation {
  investmentType: string;
  amount: number;
  expectedReturn: number;
  timeToReturn: string;
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
}

export interface SuccessCriterion {
  category: 'business' | 'technical' | 'user' | 'operational';
  criterion: string;
  measurement: string;
  target: string | number;
  timeline: string;
  owner: string;
}

export interface StakeholderGroup {
  groupName: string;
  representatives: {
    name: string;
    role: string;
    email?: string;
  }[];
  interests: string[];
  influenceLevel: 'high' | 'medium' | 'low';
  engagementStrategy: string;
}

export interface RiskMitigation {
  riskCategory: 'technical' | 'business' | 'resource' | 'market' | 'compliance';
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'critical' | 'major' | 'moderate' | 'minor';
  mitigationPlan: string[];
  owner: string;
  reviewDate: string;
}

export interface DependencyChain {
  name: string;
  type: 'internal' | 'external' | 'cross_team' | 'vendor';
  description: string;
  owner: string;
  status: 'resolved' | 'in_progress' | 'blocked' | 'at_risk';
  resolution: string;
  impactIfDelayed: string;
}

export interface CommunicationChannel {
  channel: string;
  audience: string[];
  frequency: string;
  owner: string;
  format: string;
}

export interface EpicTemplate {
  // ════════════════════════════════════════════════════════════════
  // SECTION 1: EPIC IDENTITY
  // ════════════════════════════════════════════════════════════════
  
  metadata: {
    id: string;
    version: string;
    title: string;                    // Strategic initiative name (max 100 chars)
    code: string;                      // Epic code (e.g., "EPIC-2024-001")
    status: EpicStatus;
    priority: Priority;
    theme: EpicTheme;
    
    quarter: Quarter;
    year: number;
    estimatedQuarters: number;        // How many quarters to complete
    actualQuarters?: number;
    
    tags: string[];
    keywords: string[];               // For searchability
    
    createdAt: number;
    createdBy: string;
    lastModifiedAt: number;
    approvedBy?: string;
    approvedAt?: number;
    
    parentProgramId?: string;         // For program-level grouping
    relatedEpicIds?: string[];       // Related epics
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 2: STRATEGIC CONTEXT
  // ════════════════════════════════════════════════════════════════
  
  strategicContext: {
    visionStatement: string;           // Long-term vision (1-2 sentences)
    missionStatement: string;          // What we're trying to achieve
    
    problemSpace: {
      currentState: string;            // Where we are now
      desiredState: string;            // Where we want to be
      gap: string[];                   // What's missing
      impact: string;                  // Why it matters
    };
    
    businessCase: {
      opportunity: string;             // Business opportunity
      solution: string;                // High-level solution
      benefits: string[];              // Expected benefits
      risks: string[];                 // Potential risks
      alternatives: string[];          // Alternatives considered
    };
    
    strategicAlignment: StrategicAlignment[];
    
    successDefinition: string;        // What success looks like
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 3: MARKET & COMPETITIVE ANALYSIS
  // ════════════════════════════════════════════════════════════════
  
  marketAnalysis: {
    marketContext: MarketAnalysis;
    
    targetAudience: {
      primarySegment: string;
      secondarySegments: string[];
      userCount: string;
      characteristics: string[];
      needs: string[];
    };
    
    valueProposition: {
      uniqueValue: string;
      differentiators: string[];
      competitiveAdvantage: string;
    };
    
    adoptionStrategy: {
      approach: string;
      phases: string[];
      barriers: string[];
      enablers: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 4: SCOPE & DELIVERABLES
  // ════════════════════════════════════════════════════════════════
  
  scope: {
    includedCapabilities: {
      capability: string;
      description: string;
      priority: 'must_have' | 'should_have' | 'nice_to_have';
      featureIds?: string[];
    }[];
    
    excludedCapabilities: string[];   // Explicitly out of scope
    
    deliverables: {
      type: 'feature' | 'platform' | 'process' | 'documentation' | 'training';
      name: string;
      description: string;
      acceptance: string[];            // Acceptance criteria
      owner: string;
    }[];
    
    constraints: {
      type: 'time' | 'budget' | 'resource' | 'technical' | 'regulatory';
      constraint: string;
      impact: string;
      flexibility: 'fixed' | 'negotiable' | 'flexible';
    }[];
    
    assumptions: {
      assumption: string;
      validation: string;
      riskIfInvalid: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 5: TIMELINE & MILESTONES
  // ════════════════════════════════════════════════════════════════
  
  timeline: {
    startDate: string;
    targetEndDate: string;
    actualEndDate?: string;
    
    phases: TimelinePhase[];
    
    milestones: {
      name: string;
      date: string;
      type: 'decision' | 'delivery' | 'review' | 'launch';
      deliverables: string[];
      successCriteria: string[];
      dependencies: string[];
      status: 'pending' | 'completed' | 'missed';
    }[];
    
    criticalPath: {
      item: string;
      duration: string;
      dependencies: string[];
      buffer: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 6: RESOURCES & BUDGET
  // ════════════════════════════════════════════════════════════════
  
  resources: {
    teamStructure: {
      executiveSponsor: string;
      epicOwner: string;
      technicalLead: string;
      productLead: string;
      teams: {
        name: string;
        lead: string;
        memberCount: number;
        responsibility: string;
      }[];
    };
    
    resourceRequirements: ResourceRequirement[];
    
    budget: {
      totalBudget: number;
      currency: string;
      items: BudgetItem[];
      contingency: number;
      spent?: number;
      remaining?: number;
    };
    
    infrastructure: {
      requirement: string;
      type: 'compute' | 'storage' | 'network' | 'tools' | 'licenses';
      specification: string;
      cost: number;
      provider?: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 7: ROI & BUSINESS METRICS
  // ════════════════════════════════════════════════════════════════
  
  businessMetrics: {
    roi: ROICalculation;
    
    keyMetrics: {
      metric: string;
      current: string | number;
      target: string | number;
      measurement: string;
      frequency: string;
      owner: string;
    }[];
    
    successCriteria: SuccessCriterion[];
    
    impactProjection: {
      area: string;
      currentState: string;
      projectedState: string;
      improvement: string;
      confidence: 'high' | 'medium' | 'low';
    }[];
    
    costBenefitAnalysis: {
      costs: {
        item: string;
        amount: number;
        type: 'one_time' | 'recurring';
      }[];
      benefits: {
        item: string;
        value: number;
        type: 'tangible' | 'intangible';
        timeline: string;
      }[];
      breakEvenPoint: string;
      netPresentValue?: number;
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 8: STAKEHOLDER MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  
  stakeholders: {
    groups: StakeholderGroup[];
    
    racMatrix: {
      activity: string;
      responsible: string[];           // Does the work
      accountable: string;             // Ultimately accountable (only one)
      consulted: string[];             // Two-way communication
      informed: string[];              // One-way communication
    }[];
    
    communicationPlan: {
      channels: CommunicationChannel[];
      
      keyMessages: {
        audience: string;
        message: string;
        timing: string;
      }[];
      
      feedbackMechanism: {
        method: string;
        frequency: string;
        owner: string;
      }[];
    };
    
    changeManagement: {
      impactedGroups: string[];
      changeStrategy: string;
      trainingPlan: string;
      adoptionMetrics: string[];
    };
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 9: TECHNICAL ARCHITECTURE
  // ════════════════════════════════════════════════════════════════
  
  technicalArchitecture: {
    architectureVision: string;
    
    systemDesign: {
      components: {
        name: string;
        type: string;
        purpose: string;
        technology: string[];
        interfaces: string[];
      }[];
      
      integrations: {
        system: string;
        type: 'api' | 'database' | 'event' | 'file';
        direction: 'inbound' | 'outbound' | 'bidirectional';
        protocol: string;
        dataContract: string;
      }[];
      
      dataArchitecture: {
        entities: string[];
        flows: string[];
        storage: string[];
        governance: string[];
      };
    };
    
    nonFunctionalRequirements: {
      performance: string[];
      scalability: string[];
      security: string[];
      reliability: string[];
      maintainability: string[];
      compliance: string[];
    };
    
    technologyDecisions: {
      decision: string;
      rationale: string;
      alternatives: string[];
      tradeoffs: string[];
    }[];
    
    technicalDebt: {
      item: string;
      impact: string;
      resolution: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 10: RISK & DEPENDENCY MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  
  riskManagement: {
    risks: RiskMitigation[];
    
    dependencies: DependencyChain[];
    
    contingencyPlans: {
      scenario: string;
      trigger: string;
      plan: string[];
      owner: string;
    }[];
    
    issueLog: {
      issue: string;
      severity: 'critical' | 'major' | 'minor';
      status: 'open' | 'in_progress' | 'resolved' | 'escalated';
      owner: string;
      dueDate: string;
      resolution?: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 11: QUALITY & GOVERNANCE
  // ════════════════════════════════════════════════════════════════
  
  governance: {
    reviewSchedule: {
      reviewType: 'steering' | 'technical' | 'progress' | 'quality';
      frequency: string;
      attendees: string[];
      owner: string;
    }[];
    
    decisionLog: {
      decision: string;
      date: string;
      madeBy: string[];
      rationale: string;
      impact: string;
      reversible: boolean;
    }[];
    
    qualityGates: {
      gate: string;
      criteria: string[];
      reviewer: string;
      status: 'pending' | 'passed' | 'failed' | 'waived';
      date?: string;
    }[];
    
    complianceRequirements: {
      requirement: string;
      standard: string;
      evidence: string[];
      status: 'compliant' | 'in_progress' | 'non_compliant';
      reviewer: string;
    }[];
    
    auditTrail: {
      action: string;
      timestamp: number;
      user: string;
      details: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 12: AI CONTEXT & AUTOMATION
  // ════════════════════════════════════════════════════════════════
  
  aiContext: {
    epicBackground: string[];          // Context for AI to understand epic
    
    domainKnowledge: {
      concept: string;
      explanation: string;
      relevance: string;
    }[];
    
    automationOpportunities: {
      process: string;
      currentState: string;
      automatedState: string;
      benefit: string;
      complexity: 'low' | 'medium' | 'high';
    }[];
    
    aiGuidelines: {
      principle: string;
      application: string;
      examples: string[];
    }[];
    
    featureGenerationRules: {
      rule: string;
      rationale: string;
      exceptions: string[];
    }[];
    
    successPatterns: string[];        // Patterns from successful epics
    failurePatterns: string[];        // Anti-patterns to avoid
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 13: CHILD FEATURES
  // ════════════════════════════════════════════════════════════════
  
  childFeatures: {
    featureIds: string[];              // References to FeatureTemplate IDs
    featureCount: number;
    completedCount: number;
    
    featuresByPhase: {
      phase: string;
      featureIds: string[];
    }[];
    
    featuresByPriority: {
      critical: string[];
      high: string[];
      medium: string[];
      low: string[];
    };
    
    featuresByTheme: {
      theme: string;
      featureIds: string[];
    }[];
    
    estimatedFeatures: number;         // Total expected features
    actualFeatures?: number;           // Actual features created
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 14: METRICS & REPORTING
  // ════════════════════════════════════════════════════════════════
  
  metrics: {
    progressMetrics: {
      overallProgress: number;         // 0-100%
      featuresCompleted: number;
      featuresInProgress: number;
      featuresNotStarted: number;
      velocityTrend: 'increasing' | 'stable' | 'decreasing';
    };
    
    healthMetrics: {
      schedule: 'on_track' | 'at_risk' | 'delayed';
      budget: 'under' | 'on_target' | 'over';
      scope: 'stable' | 'growing' | 'reduced';
      quality: 'exceeding' | 'meeting' | 'below';
      team: 'healthy' | 'stressed' | 'critical';
    };
    
    performanceIndicators: {
      kpi: string;
      current: number | string;
      target: number | string;
      trend: 'improving' | 'stable' | 'degrading';
      action?: string;
    }[];
    
    reportingCadence: {
      report: string;
      frequency: string;
      audience: string[];
      format: string;
      owner: string;
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 15: LESSONS & KNOWLEDGE
  // ════════════════════════════════════════════════════════════════
  
  knowledge: {
    lessonsLearned: {
      category: string;
      lesson: string;
      impact: string;
      recommendation: string;
      applicability: 'this_epic' | 'future_epics' | 'organization_wide';
    }[];
    
    bestPractices: {
      practice: string;
      context: string;
      benefit: string;
      evidence: string;
    }[];
    
    innovations: {
      innovation: string;
      description: string;
      impact: string;
      reusability: string;
    }[];
    
    documentation: {
      type: string;
      title: string;
      location: string;
      audience: string;
      status: 'draft' | 'review' | 'published';
    }[];
    
    knowledgeTransfer: {
      from: string;
      to: string;
      knowledge: string;
      method: string;
      timeline: string;
      status: 'planned' | 'in_progress' | 'completed';
    }[];
  };

  // ════════════════════════════════════════════════════════════════
  // SECTION 16: TRACKING & HISTORY
  // ════════════════════════════════════════════════════════════════
  
  tracking: {
    statusHistory: {
      status: EpicStatus;
      timestamp: number;
      changedBy: string;
      reason?: string;
    }[];
    
    majorEvents: {
      event: string;
      date: string;
      impact: string;
      response: string;
    }[];
    
    pivots: {
      originalDirection: string;
      newDirection: string;
      reason: string;
      date: string;
      approvedBy: string;
    }[];
    
    retrospectives: {
      date: string;
      participants: string[];
      findings: string[];
      actions: string[];
      followUp: string;
    }[];
  };
}