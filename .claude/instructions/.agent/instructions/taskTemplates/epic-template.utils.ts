import { 
  EpicTemplate, 
  EpicStatus, 
  EpicTheme,
  Quarter,
  TimelinePhase,
  ResourceRequirement,
  BudgetItem,
  RiskMitigation,
  DependencyChain,
  Priority
} from './epic.types';
import { FeatureTemplate } from './feature.types';

// ════════════════════════════════════════════════════════════════
// EPIC CREATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function createEpicId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EPIC-${year}-${random}`;
}

export function createEpicCode(theme: EpicTheme, quarter: Quarter, year: number): string {
  const themeCode = theme.substring(0, 3).toUpperCase();
  return `${themeCode}-${year}-${quarter}`;
}

export function calculateEpicDuration(phases: TimelinePhase[]): number {
  if (phases.length === 0) return 0;
  
  const startDate = new Date(phases[0].startDate);
  const endDate = new Date(phases[phases.length - 1].endDate);
  const quarters = Math.ceil((endDate.getTime() - startDate.getTime()) / (90 * 24 * 60 * 60 * 1000));
  
  return quarters;
}

export function calculateTotalBudget(items: BudgetItem[]): number {
  return items.reduce((total, item) => {
    let annualAmount = item.amount;
    switch (item.frequency) {
      case 'monthly':
        annualAmount = item.amount * 12;
        break;
      case 'quarterly':
        annualAmount = item.amount * 4;
        break;
      case 'one_time':
        annualAmount = item.amount;
        break;
    }
    return total + annualAmount;
  }, 0);
}

// ════════════════════════════════════════════════════════════════
// EPIC TEMPLATE FACTORY
// ════════════════════════════════════════════════════════════════

export function createEpicFromTemplate(
  template: Partial<EpicTemplate>,
  overrides: Partial<EpicTemplate> = {}
): EpicTemplate {
  const now = Date.now();
  const currentYear = new Date().getFullYear();
  const currentQuarter = `Q${Math.floor(new Date().getMonth() / 3) + 1}` as Quarter;
  
  const title = template.metadata?.title || overrides.metadata?.title || 'Unnamed Epic';
  const theme = template.metadata?.theme || overrides.metadata?.theme || 'innovation';
  
  const defaultTemplate: EpicTemplate = {
    metadata: {
      id: createEpicId(),
      version: '1.0.0',
      title: title.substring(0, 100),
      code: createEpicCode(theme, currentQuarter, currentYear),
      status: 'ideation' as EpicStatus,
      priority: 'high' as Priority,
      theme: theme as EpicTheme,
      quarter: currentQuarter,
      year: currentYear,
      estimatedQuarters: 2,
      tags: [],
      keywords: [],
      createdAt: now,
      createdBy: 'system',
      lastModifiedAt: now,
      ...template.metadata,
      ...overrides.metadata
    },
    
    strategicContext: {
      visionStatement: '',
      missionStatement: '',
      problemSpace: {
        currentState: '',
        desiredState: '',
        gap: [],
        impact: ''
      },
      businessCase: {
        opportunity: '',
        solution: '',
        benefits: [],
        risks: [],
        alternatives: []
      },
      strategicAlignment: [],
      successDefinition: '',
      ...template.strategicContext,
      ...overrides.strategicContext
    },
    
    marketAnalysis: {
      marketContext: {
        competitorAnalysis: [],
        marketTrends: [],
        customerDemand: [],
        opportunitySize: ''
      },
      targetAudience: {
        primarySegment: '',
        secondarySegments: [],
        userCount: '',
        characteristics: [],
        needs: []
      },
      valueProposition: {
        uniqueValue: '',
        differentiators: [],
        competitiveAdvantage: ''
      },
      adoptionStrategy: {
        approach: '',
        phases: [],
        barriers: [],
        enablers: []
      },
      ...template.marketAnalysis,
      ...overrides.marketAnalysis
    },
    
    scope: {
      includedCapabilities: [],
      excludedCapabilities: [],
      deliverables: [],
      constraints: [],
      assumptions: [],
      ...template.scope,
      ...overrides.scope
    },
    
    timeline: {
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: '',
      phases: [],
      milestones: [],
      criticalPath: [],
      ...template.timeline,
      ...overrides.timeline
    },
    
    resources: {
      teamStructure: {
        executiveSponsor: '',
        epicOwner: '',
        technicalLead: '',
        productLead: '',
        teams: []
      },
      resourceRequirements: [],
      budget: {
        totalBudget: 0,
        currency: 'USD',
        items: [],
        contingency: 0
      },
      infrastructure: [],
      ...template.resources,
      ...overrides.resources
    },
    
    businessMetrics: {
      roi: {
        investmentType: '',
        amount: 0,
        expectedReturn: 0,
        timeToReturn: '',
        confidence: 'medium',
        assumptions: []
      },
      keyMetrics: [],
      successCriteria: [],
      impactProjection: [],
      costBenefitAnalysis: {
        costs: [],
        benefits: [],
        breakEvenPoint: ''
      },
      ...template.businessMetrics,
      ...overrides.businessMetrics
    },
    
    stakeholders: {
      groups: [],
      racMatrix: [],
      communicationPlan: {
        channels: [],
        keyMessages: [],
        feedbackMechanism: []
      },
      changeManagement: {
        impactedGroups: [],
        changeStrategy: '',
        trainingPlan: '',
        adoptionMetrics: []
      },
      ...template.stakeholders,
      ...overrides.stakeholders
    },
    
    technicalArchitecture: {
      architectureVision: '',
      systemDesign: {
        components: [],
        integrations: [],
        dataArchitecture: {
          entities: [],
          flows: [],
          storage: [],
          governance: []
        }
      },
      nonFunctionalRequirements: {
        performance: [],
        scalability: [],
        security: [],
        reliability: [],
        maintainability: [],
        compliance: []
      },
      technologyDecisions: [],
      technicalDebt: [],
      ...template.technicalArchitecture,
      ...overrides.technicalArchitecture
    },
    
    riskManagement: {
      risks: [],
      dependencies: [],
      contingencyPlans: [],
      issueLog: [],
      ...template.riskManagement,
      ...overrides.riskManagement
    },
    
    governance: {
      reviewSchedule: [],
      decisionLog: [],
      qualityGates: [],
      complianceRequirements: [],
      auditTrail: [],
      ...template.governance,
      ...overrides.governance
    },
    
    aiContext: {
      epicBackground: [],
      domainKnowledge: [],
      automationOpportunities: [],
      aiGuidelines: [],
      featureGenerationRules: [],
      successPatterns: [],
      failurePatterns: [],
      ...template.aiContext,
      ...overrides.aiContext
    },
    
    childFeatures: {
      featureIds: [],
      featureCount: 0,
      completedCount: 0,
      featuresByPhase: [],
      featuresByPriority: {
        critical: [],
        high: [],
        medium: [],
        low: []
      },
      featuresByTheme: [],
      estimatedFeatures: 0,
      ...template.childFeatures,
      ...overrides.childFeatures
    },
    
    metrics: {
      progressMetrics: {
        overallProgress: 0,
        featuresCompleted: 0,
        featuresInProgress: 0,
        featuresNotStarted: 0,
        velocityTrend: 'stable'
      },
      healthMetrics: {
        schedule: 'on_track',
        budget: 'on_target',
        scope: 'stable',
        quality: 'meeting',
        team: 'healthy'
      },
      performanceIndicators: [],
      reportingCadence: [],
      ...template.metrics,
      ...overrides.metrics
    },
    
    knowledge: {
      lessonsLearned: [],
      bestPractices: [],
      innovations: [],
      documentation: [],
      knowledgeTransfer: [],
      ...template.knowledge,
      ...overrides.knowledge
    },
    
    tracking: {
      statusHistory: [{
        status: 'ideation' as EpicStatus,
        timestamp: now,
        changedBy: 'system'
      }],
      majorEvents: [],
      pivots: [],
      retrospectives: [],
      ...template.tracking,
      ...overrides.tracking
    }
  };
  
  return defaultTemplate;
}

// ════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function validateEpic(epic: Partial<EpicTemplate>): string[] {
  const errors: string[] = [];
  
  if (!epic.metadata?.title) {
    errors.push('Epic title is required');
  }
  
  if (!epic.strategicContext?.visionStatement) {
    errors.push('Vision statement is required for strategic alignment');
  }
  
  if (!epic.strategicContext?.businessCase?.opportunity) {
    errors.push('Business opportunity must be defined');
  }
  
  if (!epic.scope?.includedCapabilities?.length) {
    errors.push('At least one capability must be included in scope');
  }
  
  if (!epic.timeline?.targetEndDate) {
    errors.push('Target end date is required');
  }
  
  if (!epic.resources?.epicOwner) {
    errors.push('Epic owner must be assigned');
  }
  
  if (!epic.businessMetrics?.successCriteria?.length) {
    errors.push('Success criteria must be defined');
  }
  
  return errors;
}

export function validateForApproval(epic: EpicTemplate): string[] {
  const errors = validateEpic(epic);
  
  if (epic.metadata.status !== 'planning') {
    errors.push('Epic must be in planning status for approval');
  }
  
  if (!epic.resources.budget.totalBudget) {
    errors.push('Budget must be defined');
  }
  
  if (!epic.timeline.phases.length) {
    errors.push('Timeline phases must be defined');
  }
  
  if (!epic.stakeholders.groups.length) {
    errors.push('Stakeholder groups must be identified');
  }
  
  if (!epic.riskManagement.risks.length) {
    errors.push('Risk assessment is required');
  }
  
  return errors;
}

// ════════════════════════════════════════════════════════════════
// EPIC STATE MANAGEMENT
// ════════════════════════════════════════════════════════════════

export function updateEpicStatus(
  epic: EpicTemplate,
  newStatus: EpicStatus,
  changedBy: string,
  reason?: string
): EpicTemplate {
  const now = Date.now();
  
  return {
    ...epic,
    metadata: {
      ...epic.metadata,
      status: newStatus,
      lastModifiedAt: now,
      ...(newStatus === 'approved' && {
        approvedBy: changedBy,
        approvedAt: now
      })
    },
    tracking: {
      ...epic.tracking,
      statusHistory: [
        ...epic.tracking.statusHistory,
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

export function addFeatureToEpic(
  epic: EpicTemplate,
  featureId: string,
  feature: FeatureTemplate
): EpicTemplate {
  const priority = feature.metadata.priority;
  const priorityKey = priority as keyof typeof epic.childFeatures.featuresByPriority;
  
  return {
    ...epic,
    childFeatures: {
      ...epic.childFeatures,
      featureIds: [...epic.childFeatures.featureIds, featureId],
      featureCount: epic.childFeatures.featureCount + 1,
      featuresByPriority: {
        ...epic.childFeatures.featuresByPriority,
        [priorityKey]: [...epic.childFeatures.featuresByPriority[priorityKey], featureId]
      }
    }
  };
}

export function updateEpicProgress(epic: EpicTemplate): EpicTemplate {
  const progress = epic.childFeatures.featureCount > 0
    ? Math.round((epic.childFeatures.completedCount / epic.childFeatures.featureCount) * 100)
    : 0;
  
  const velocityTrend = progress > epic.metrics.progressMetrics.overallProgress 
    ? 'increasing' 
    : progress < epic.metrics.progressMetrics.overallProgress 
    ? 'decreasing' 
    : 'stable';
  
  return {
    ...epic,
    metrics: {
      ...epic.metrics,
      progressMetrics: {
        ...epic.metrics.progressMetrics,
        overallProgress: progress,
        velocityTrend
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════
// RISK ASSESSMENT UTILITIES
// ════════════════════════════════════════════════════════════════

export function calculateRiskScore(risk: RiskMitigation): number {
  const probabilityScore = risk.probability === 'high' ? 3 : 
                          risk.probability === 'medium' ? 2 : 1;
  const impactScore = risk.impact === 'critical' ? 4 :
                     risk.impact === 'major' ? 3 :
                     risk.impact === 'moderate' ? 2 : 1;
  
  return probabilityScore * impactScore;
}

export function getHighestRisks(epic: EpicTemplate, limit: number = 5): RiskMitigation[] {
  return [...epic.riskManagement.risks]
    .sort((a, b) => calculateRiskScore(b) - calculateRiskScore(a))
    .slice(0, limit);
}

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK UTILITIES
// ════════════════════════════════════════════════════════════════

export function assessEpicHealth(epic: EpicTemplate): EpicTemplate['metrics']['healthMetrics'] {
  const now = new Date();
  const targetEnd = new Date(epic.timeline.targetEndDate);
  const daysRemaining = Math.floor((targetEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  const scheduleHealth = daysRemaining < 0 ? 'delayed' : 
                         daysRemaining < 30 ? 'at_risk' : 'on_track';
  
  const budgetSpent = epic.resources.budget.spent || 0;
  const budgetTotal = epic.resources.budget.totalBudget;
  const budgetHealth = budgetSpent > budgetTotal ? 'over' :
                       budgetSpent > budgetTotal * 0.9 ? 'on_target' : 'under';
  
  const blockedDependencies = epic.riskManagement.dependencies
    .filter(d => d.status === 'blocked').length;
  const teamHealth = blockedDependencies > 3 ? 'critical' :
                     blockedDependencies > 1 ? 'stressed' : 'healthy';
  
  return {
    schedule: scheduleHealth,
    budget: budgetHealth,
    scope: 'stable',
    quality: 'meeting',
    team: teamHealth
  };
}

// ════════════════════════════════════════════════════════════════
// RESOURCE PLANNING UTILITIES
// ════════════════════════════════════════════════════════════════

export function calculateResourceLoad(requirements: ResourceRequirement[]): number {
  return requirements.reduce((total, req) => {
    const allocation = req.allocation === 'full_time' ? 1 :
                      req.allocation === 'part_time' ? 0.5 : 0.2;
    return total + (req.count * allocation);
  }, 0);
}

export function identifyResourceGaps(epic: EpicTemplate): ResourceRequirement[] {
  return epic.resources.resourceRequirements
    .filter(req => req.status === 'unavailable' || req.status === 'requested');
}

// ════════════════════════════════════════════════════════════════
// REPORTING UTILITIES
// ════════════════════════════════════════════════════════════════

export function generateEpicSummary(epic: EpicTemplate): string {
  const health = assessEpicHealth(epic);
  
  return `
# ${epic.metadata.title}
**Code:** ${epic.metadata.code} | **Status:** ${epic.metadata.status}

## Vision
${epic.strategicContext.visionStatement}

## Progress
Overall: ${epic.metrics.progressMetrics.overallProgress}%
Features: ${epic.childFeatures.completedCount}/${epic.childFeatures.featureCount}

## Health Status
- Schedule: ${health.schedule}
- Budget: ${health.budget}
- Scope: ${health.scope}
- Quality: ${health.quality}
- Team: ${health.team}

## Key Metrics
${epic.businessMetrics.keyMetrics.map(m => 
  `- ${m.metric}: ${m.current} → ${m.target}`
).join('\n')}

## Top Risks
${getHighestRisks(epic, 3).map(r => 
  `- ${r.description} (${r.probability}/${r.impact})`
).join('\n')}

## Next Milestones
${epic.timeline.milestones
  .filter(m => m.status === 'pending')
  .slice(0, 3)
  .map(m => `- ${m.name} (${m.date})`)
  .join('\n')}
  `.trim();
}

export function generateExecutiveSummary(epic: EpicTemplate): string {
  const roi = epic.businessMetrics.roi;
  const progress = epic.metrics.progressMetrics.overallProgress;
  
  return `
## Executive Summary: ${epic.metadata.title}

### Business Opportunity
${epic.strategicContext.businessCase.opportunity}

### Expected Benefits
${epic.strategicContext.businessCase.benefits.join(', ')}

### Investment & Return
- Investment: $${roi.amount.toLocaleString()}
- Expected Return: $${roi.expectedReturn.toLocaleString()}
- Time to Return: ${roi.timeToReturn}

### Current Status
- Progress: ${progress}%
- Timeline: ${epic.timeline.startDate} to ${epic.timeline.targetEndDate}
- Features Delivered: ${epic.childFeatures.completedCount}/${epic.childFeatures.featureCount}

### Success Definition
${epic.strategicContext.successDefinition}
  `.trim();
}

// ════════════════════════════════════════════════════════════════
// FEATURE GENERATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function generateFeaturesFromCapabilities(
  epic: EpicTemplate
): Partial<FeatureTemplate>[] {
  const features: Partial<FeatureTemplate>[] = [];
  
  epic.scope.includedCapabilities.forEach(capability => {
    const feature: Partial<FeatureTemplate> = {
      metadata: {
        title: capability.capability,
        priority: capability.priority === 'must_have' ? 'critical' :
                 capability.priority === 'should_have' ? 'high' : 'medium',
        tags: [`epic:${epic.metadata.code}`, `capability:${capability.capability}`]
      },
      humanContext: {
        executiveSummary: capability.description,
        problemStatement: epic.strategicContext.problemSpace.currentState,
        solution: capability.description,
        benefits: epic.strategicContext.businessCase.benefits
      },
      functionalRequirements: {
        requirements: [],
        userStories: {
          epic: epic.metadata.title,
          stories: []
        },
        useCases: [],
        outOfScope: epic.scope.excludedCapabilities
      }
    };
    
    features.push(feature);
  });
  
  return features;
}

// ════════════════════════════════════════════════════════════════
// DEPENDENCY MANAGEMENT UTILITIES
// ════════════════════════════════════════════════════════════════

export function getBlockedDependencies(epic: EpicTemplate): DependencyChain[] {
  return epic.riskManagement.dependencies.filter(d => d.status === 'blocked');
}

export function getCriticalPath(epic: EpicTemplate): string[] {
  return epic.timeline.criticalPath.map(item => item.item);
}

// ════════════════════════════════════════════════════════════════
// STAKEHOLDER COMMUNICATION UTILITIES
// ════════════════════════════════════════════════════════════════

export function generateStakeholderUpdate(
  epic: EpicTemplate,
  audience: string
): string {
  const message = epic.stakeholders.communicationPlan.keyMessages
    .find(m => m.audience === audience);
  
  if (!message) {
    return generateEpicSummary(epic);
  }
  
  return `
## Update for ${audience}

${message.message}

### Progress Update
- Overall Progress: ${epic.metrics.progressMetrics.overallProgress}%
- Current Phase: ${epic.timeline.phases.find(p => p.status === 'active')?.name || 'Planning'}
- Health Status: ${epic.metrics.healthMetrics.schedule}

### Next Steps
${epic.timeline.milestones
  .filter(m => m.status === 'pending')
  .slice(0, 2)
  .map(m => `- ${m.name} (${m.date})`)
  .join('\n')}

### How You Can Help
Please review and provide feedback on the upcoming milestones.
  `.trim();
}