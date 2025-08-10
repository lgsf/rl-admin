import { EpicTemplate } from './epic.types';
import { createEpicFromTemplate } from './epic-template.utils';

// ════════════════════════════════════════════════════════════════
// EXAMPLE 1: DIGITAL TRANSFORMATION EPIC
// ════════════════════════════════════════════════════════════════

export const digitalTransformationEpic: EpicTemplate = createEpicFromTemplate({
  metadata: {
    title: 'Digital Transformation Platform',
    code: 'DTP-2024-Q1',
    status: 'planning',
    priority: 'critical',
    theme: 'platform_capability',
    quarter: 'Q1',
    year: 2024,
    estimatedQuarters: 4,
    tags: ['digital-transformation', 'platform', 'modernization', 'cloud-native'],
    keywords: ['automation', 'scalability', 'microservices', 'cloud', 'AI']
  },
  
  strategicContext: {
    visionStatement: 'Transform our monolithic legacy systems into a modern, cloud-native platform that enables rapid innovation and scales to support 10x growth.',
    missionStatement: 'Modernize core infrastructure to deliver exceptional user experiences while reducing operational costs by 40%.',
    
    problemSpace: {
      currentState: 'Legacy monolithic application with 15-year-old codebase, 5-minute page loads, 20% weekly downtime, manual deployments taking 2 weeks.',
      desiredState: 'Cloud-native microservices platform with sub-second response times, 99.99% uptime, automated CI/CD with hourly deployments.',
      gap: [
        'Modern architecture patterns',
        'Automated deployment pipeline',
        'Scalable infrastructure',
        'Real-time data processing',
        'AI-powered features'
      ],
      impact: 'Current system limits growth, frustrates customers (NPS: -20), and costs $2M annually in maintenance.'
    },
    
    businessCase: {
      opportunity: 'Capture $50M in new revenue by enabling features competitors offer. Reduce operational costs by $800K annually.',
      solution: 'Implement microservices architecture on AWS with Kubernetes, event-driven processing, and AI-powered automation.',
      benefits: [
        'Reduce deployment time from 2 weeks to 1 hour',
        'Improve system uptime from 80% to 99.99%',
        'Enable 10x user growth without infrastructure changes',
        'Reduce operational costs by 40%',
        'Improve developer productivity by 3x'
      ],
      risks: [
        'Migration complexity may cause temporary service disruptions',
        'Team lacks cloud-native expertise',
        'Legacy data migration challenges'
      ],
      alternatives: [
        'Incremental refactoring (rejected: too slow)',
        'Outsource to third-party platform (rejected: vendor lock-in)',
        'Build parallel system (rejected: too expensive)'
      ]
    },
    
    strategicAlignment: [
      {
        companyGoal: 'Achieve $100M ARR by 2025',
        objective: 'Enable platform to support 1M concurrent users',
        keyResult: 'Platform handles 10,000 requests/second',
        metric: 'Requests per second',
        target: 10000,
        current: 100
      },
      {
        companyGoal: 'Industry-leading customer satisfaction',
        objective: 'Achieve sub-second page loads',
        keyResult: 'P95 latency under 500ms',
        metric: 'Response time (ms)',
        target: 500,
        current: 5000
      }
    ],
    
    successDefinition: 'Platform successfully migrated, handling 10x traffic with 99.99% uptime, 40% cost reduction, and NPS improved to +50.'
  },
  
  marketAnalysis: {
    marketContext: {
      competitorAnalysis: [
        {
          competitor: 'TechCorp',
          feature: 'Real-time analytics dashboard',
          ourAdvantage: 'Better data accuracy',
          theirAdvantage: 'Already implemented, 2-year head start'
        },
        {
          competitor: 'InnovateCo',
          feature: 'AI-powered recommendations',
          ourAdvantage: 'Larger dataset for training',
          theirAdvantage: 'Advanced ML capabilities'
        }
      ],
      marketTrends: [
        'Cloud-native adoption growing 40% YoY',
        'AI features becoming table stakes',
        'Real-time processing expected by users',
        'Mobile-first experiences mandatory'
      ],
      customerDemand: [
        {
          source: 'Customer surveys',
          feedback: 'System too slow, frequent timeouts',
          frequency: '87% of responses'
        },
        {
          source: 'Support tickets',
          feedback: 'Need mobile app',
          frequency: '200+ requests/month'
        }
      ],
      opportunitySize: 'TAM: $5B, SAM: $500M, SOM: $50M'
    },
    
    targetAudience: {
      primarySegment: 'Enterprise customers (1000+ employees)',
      secondarySegments: ['Mid-market (100-1000)', 'SMB (10-100)'],
      userCount: '50,000 active users, targeting 500,000',
      characteristics: ['Tech-savvy', 'Demanding performance', 'Security-conscious'],
      needs: ['Real-time data', 'Mobile access', '99.99% uptime', 'API integrations']
    },
    
    valueProposition: {
      uniqueValue: 'Only platform combining real-time processing, AI insights, and industry-specific compliance in one solution.',
      differentiators: [
        'Proprietary AI models trained on 10 years of data',
        'Industry-leading security certifications',
        'White-glove migration support'
      ],
      competitiveAdvantage: 'Deep industry expertise with modern technology stack'
    },
    
    adoptionStrategy: {
      approach: 'Phased migration with parallel running',
      phases: [
        'Migrate power users (10%)',
        'Migrate early adopters (25%)',
        'Migrate majority (50%)',
        'Migrate remaining (15%)'
      ],
      barriers: ['Change resistance', 'Training requirements', 'Data migration'],
      enablers: ['Executive sponsorship', 'Clear benefits', 'Comprehensive training']
    }
  },
  
  scope: {
    includedCapabilities: [
      {
        capability: 'Microservices Architecture',
        description: 'Break monolith into 20+ microservices',
        priority: 'must_have',
        featureIds: []
      },
      {
        capability: 'Cloud Infrastructure',
        description: 'AWS deployment with auto-scaling',
        priority: 'must_have',
        featureIds: []
      },
      {
        capability: 'CI/CD Pipeline',
        description: 'Automated testing and deployment',
        priority: 'must_have',
        featureIds: []
      },
      {
        capability: 'Real-time Analytics',
        description: 'Stream processing with Apache Kafka',
        priority: 'should_have',
        featureIds: []
      },
      {
        capability: 'AI Recommendations',
        description: 'ML-powered user recommendations',
        priority: 'should_have',
        featureIds: []
      }
    ],
    
    excludedCapabilities: [
      'Blockchain integration',
      'IoT device support',
      'Augmented reality features',
      'Cryptocurrency payments'
    ],
    
    deliverables: [
      {
        type: 'platform',
        name: 'Core Microservices Platform',
        description: 'Containerized services on Kubernetes',
        acceptance: [
          'All services deployed and running',
          'Auto-scaling configured',
          'Monitoring and alerting active'
        ],
        owner: 'Platform Team'
      },
      {
        type: 'feature',
        name: 'API Gateway',
        description: 'Central API management and routing',
        acceptance: [
          'All APIs documented',
          'Rate limiting implemented',
          'Authentication integrated'
        ],
        owner: 'API Team'
      }
    ],
    
    constraints: [
      {
        type: 'time',
        constraint: 'Must complete before Q1 2025 compliance audit',
        impact: 'Critical - affects certification',
        flexibility: 'fixed'
      },
      {
        type: 'budget',
        constraint: 'Limited to $5M total investment',
        impact: 'Major - constrains team size',
        flexibility: 'negotiable'
      }
    ],
    
    assumptions: [
      {
        assumption: 'AWS services will meet all requirements',
        validation: 'POC completed successfully',
        riskIfInvalid: 'Need to evaluate alternative cloud providers'
      }
    ]
  },
  
  timeline: {
    startDate: '2024-01-01',
    targetEndDate: '2024-12-31',
    
    phases: [
      {
        name: 'Foundation',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        deliverables: ['Infrastructure setup', 'CI/CD pipeline', 'First 3 microservices'],
        featureIds: [],
        status: 'active'
      },
      {
        name: 'Core Migration',
        startDate: '2024-04-01',
        endDate: '2024-09-30',
        deliverables: ['15 microservices', 'Data migration', 'API gateway'],
        featureIds: [],
        status: 'planned'
      },
      {
        name: 'Enhancement',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        deliverables: ['AI features', 'Analytics platform', 'Mobile apps'],
        featureIds: [],
        status: 'planned'
      }
    ],
    
    milestones: [
      {
        name: 'Infrastructure Ready',
        date: '2024-02-15',
        type: 'delivery',
        deliverables: ['AWS account', 'Kubernetes cluster', 'CI/CD pipeline'],
        successCriteria: ['Deployment successful', 'Monitoring active'],
        dependencies: ['AWS contract signed'],
        status: 'pending'
      },
      {
        name: 'First Customer Migration',
        date: '2024-04-01',
        type: 'launch',
        deliverables: ['3 microservices live', 'Customer onboarded'],
        successCriteria: ['No data loss', 'Performance targets met'],
        dependencies: ['Core services ready'],
        status: 'pending'
      }
    ],
    
    criticalPath: [
      {
        item: 'AWS Infrastructure Setup',
        duration: '6 weeks',
        dependencies: [],
        buffer: '2 weeks'
      },
      {
        item: 'Database Migration',
        duration: '8 weeks',
        dependencies: ['Infrastructure ready'],
        buffer: '3 weeks'
      }
    ]
  },
  
  resources: {
    teamStructure: {
      executiveSponsor: 'John Smith (CTO)',
      epicOwner: 'Sarah Johnson (VP Engineering)',
      technicalLead: 'Mike Chen (Principal Architect)',
      productLead: 'Emily Davis (Director of Product)',
      teams: [
        {
          name: 'Platform Team',
          lead: 'Alex Kumar',
          memberCount: 8,
          responsibility: 'Infrastructure and DevOps'
        },
        {
          name: 'Migration Team',
          lead: 'Lisa Wong',
          memberCount: 12,
          responsibility: 'Service decomposition and migration'
        },
        {
          name: 'Data Team',
          lead: 'Tom Anderson',
          memberCount: 6,
          responsibility: 'Data migration and analytics'
        }
      ]
    },
    
    resourceRequirements: [
      {
        role: 'Cloud Architect',
        count: 2,
        skills: ['AWS', 'Kubernetes', 'Terraform'],
        duration: '12 months',
        allocation: 'full_time',
        status: 'confirmed'
      },
      {
        role: 'DevOps Engineer',
        count: 4,
        skills: ['CI/CD', 'Docker', 'Monitoring'],
        duration: '12 months',
        allocation: 'full_time',
        status: 'requested'
      },
      {
        role: 'ML Engineer',
        count: 2,
        skills: ['TensorFlow', 'Python', 'MLOps'],
        duration: '6 months',
        allocation: 'full_time',
        status: 'requested'
      }
    ],
    
    budget: {
      totalBudget: 5000000,
      currency: 'USD',
      items: [
        {
          category: 'personnel',
          item: 'Development team (30 people)',
          amount: 3000000,
          currency: 'USD',
          frequency: 'annual',
          status: 'approved'
        },
        {
          category: 'infrastructure',
          item: 'AWS services',
          amount: 50000,
          currency: 'USD',
          frequency: 'monthly',
          status: 'approved'
        },
        {
          category: 'tools',
          item: 'Software licenses',
          amount: 200000,
          currency: 'USD',
          frequency: 'annual',
          status: 'approved'
        },
        {
          category: 'services',
          item: 'Consulting and training',
          amount: 500000,
          currency: 'USD',
          frequency: 'one_time',
          status: 'pending'
        }
      ],
      contingency: 10,
      spent: 500000,
      remaining: 4500000
    },
    
    infrastructure: [
      {
        requirement: 'AWS Multi-Region Setup',
        type: 'compute',
        specification: '1000 vCPUs, 4TB RAM',
        cost: 50000,
        provider: 'AWS'
      }
    ]
  },
  
  businessMetrics: {
    roi: {
      investmentType: 'Platform modernization',
      amount: 5000000,
      expectedReturn: 15000000,
      timeToReturn: '2 years',
      confidence: 'high',
      assumptions: [
        'Customer retention improves by 30%',
        'New customer acquisition increases by 50%',
        'Operational costs reduce by 40%'
      ]
    },
    
    keyMetrics: [
      {
        metric: 'System Uptime',
        current: '80%',
        target: '99.99%',
        measurement: 'Monitoring tools',
        frequency: 'Real-time',
        owner: 'Platform Team'
      },
      {
        metric: 'Deployment Frequency',
        current: '0.5 per month',
        target: '20 per day',
        measurement: 'CI/CD metrics',
        frequency: 'Daily',
        owner: 'DevOps Team'
      },
      {
        metric: 'Page Load Time',
        current: 5000,
        target: 500,
        measurement: 'APM tools (ms)',
        frequency: 'Real-time',
        owner: 'Performance Team'
      }
    ],
    
    successCriteria: [
      {
        category: 'technical',
        criterion: 'All services migrated to microservices',
        measurement: 'Service count',
        target: '20+ services',
        timeline: 'Q4 2024',
        owner: 'Technical Lead'
      },
      {
        category: 'business',
        criterion: 'Customer satisfaction improved',
        measurement: 'NPS Score',
        target: '+50',
        timeline: 'Q1 2025',
        owner: 'Product Lead'
      }
    ],
    
    impactProjection: [
      {
        area: 'Customer Experience',
        currentState: 'Frequent timeouts, slow performance',
        projectedState: 'Sub-second response, 99.99% availability',
        improvement: '10x performance improvement',
        confidence: 'high'
      }
    ],
    
    costBenefitAnalysis: {
      costs: [
        {
          item: 'Development and migration',
          amount: 3000000,
          type: 'one_time'
        },
        {
          item: 'Infrastructure',
          amount: 600000,
          type: 'recurring'
        }
      ],
      benefits: [
        {
          item: 'Reduced operational costs',
          value: 800000,
          type: 'tangible',
          timeline: 'Annual'
        },
        {
          item: 'Increased revenue from new features',
          value: 5000000,
          type: 'tangible',
          timeline: 'Annual after year 1'
        }
      ],
      breakEvenPoint: '18 months',
      netPresentValue: 12000000
    }
  },
  
  stakeholders: {
    groups: [
      {
        groupName: 'Executive Team',
        representatives: [
          {
            name: 'John Smith',
            role: 'CTO',
            email: 'john.smith@company.com'
          }
        ],
        interests: ['ROI', 'Timeline', 'Risk mitigation'],
        influenceLevel: 'high',
        engagementStrategy: 'Weekly steering committee meetings'
      },
      {
        groupName: 'Customers',
        representatives: [
          {
            name: 'Customer Advisory Board',
            role: 'Various',
            email: 'cab@company.com'
          }
        ],
        interests: ['Minimal disruption', 'New features', 'Performance'],
        influenceLevel: 'high',
        engagementStrategy: 'Monthly updates, beta program'
      }
    ],
    
    racMatrix: [
      {
        activity: 'Architecture decisions',
        responsible: ['Mike Chen', 'Platform Team'],
        accountable: 'Sarah Johnson',
        consulted: ['Security Team', 'Data Team'],
        informed: ['All engineering teams']
      }
    ],
    
    communicationPlan: {
      channels: [
        {
          channel: 'All-hands meetings',
          audience: ['All employees'],
          frequency: 'Monthly',
          owner: 'Epic Owner',
          format: 'Presentation'
        }
      ],
      keyMessages: [
        {
          audience: 'Customers',
          message: 'Modernization will bring 10x performance improvements with zero downtime migration',
          timing: 'Before migration starts'
        }
      ],
      feedbackMechanism: [
        {
          method: 'Survey',
          frequency: 'Quarterly',
          owner: 'Product Team'
        }
      ]
    },
    
    changeManagement: {
      impactedGroups: ['All engineering teams', 'Customer support', 'Sales'],
      changeStrategy: 'Gradual adoption with extensive training',
      trainingPlan: '40 hours of training per engineer',
      adoptionMetrics: ['Service migration rate', 'Developer satisfaction']
    }
  },
  
  technicalArchitecture: {
    architectureVision: 'Cloud-native, microservices-based platform with event-driven architecture and AI-powered capabilities.',
    
    systemDesign: {
      components: [
        {
          name: 'API Gateway',
          type: 'Infrastructure',
          purpose: 'Route and manage all API traffic',
          technology: ['Kong', 'AWS API Gateway'],
          interfaces: ['REST', 'GraphQL']
        },
        {
          name: 'User Service',
          type: 'Microservice',
          purpose: 'Manage user authentication and profiles',
          technology: ['Node.js', 'PostgreSQL'],
          interfaces: ['REST API', 'Event Bus']
        }
      ],
      integrations: [
        {
          system: 'Salesforce',
          type: 'api',
          direction: 'bidirectional',
          protocol: 'REST',
          dataContract: 'Customer data sync'
        }
      ],
      dataArchitecture: {
        entities: ['Users', 'Transactions', 'Analytics'],
        flows: ['Real-time event stream', 'Batch ETL'],
        storage: ['PostgreSQL', 'DynamoDB', 'S3'],
        governance: ['GDPR compliance', 'Data retention policies']
      }
    },
    
    nonFunctionalRequirements: {
      performance: ['<500ms p95 latency', '10,000 RPS'],
      scalability: ['Auto-scale to 10x load', 'Multi-region support'],
      security: ['SOC2 compliance', 'End-to-end encryption'],
      reliability: ['99.99% uptime', 'Zero data loss'],
      maintainability: ['Automated deployments', 'Comprehensive monitoring'],
      compliance: ['GDPR', 'CCPA', 'SOC2']
    },
    
    technologyDecisions: [
      {
        decision: 'Use Kubernetes for orchestration',
        rationale: 'Industry standard, extensive ecosystem',
        alternatives: ['ECS', 'Docker Swarm'],
        tradeoffs: ['Complexity vs flexibility']
      }
    ],
    
    technicalDebt: [
      {
        item: 'Legacy database schema',
        impact: 'Slows down queries',
        resolution: 'Redesign during migration',
        priority: 'high'
      }
    ]
  },
  
  riskManagement: {
    risks: [
      {
        riskCategory: 'technical',
        description: 'Data migration failures could cause data loss',
        probability: 'medium',
        impact: 'critical',
        mitigationPlan: [
          'Comprehensive backup strategy',
          'Parallel running period',
          'Automated validation scripts'
        ],
        owner: 'Data Team Lead',
        reviewDate: '2024-03-01'
      },
      {
        riskCategory: 'resource',
        description: 'Key personnel may leave project',
        probability: 'low',
        impact: 'major',
        mitigationPlan: [
          'Knowledge documentation',
          'Pair programming',
          'Retention bonuses'
        ],
        owner: 'HR Partner',
        reviewDate: '2024-02-01'
      }
    ],
    
    dependencies: [
      {
        name: 'AWS Contract',
        type: 'vendor',
        description: 'Enterprise agreement for AWS services',
        owner: 'Procurement',
        status: 'in_progress',
        resolution: 'Legal review in progress',
        impactIfDelayed: 'Delays infrastructure setup by 2 weeks'
      }
    ],
    
    contingencyPlans: [
      {
        scenario: 'Major production issue during migration',
        trigger: 'Customer-impacting outage >1 hour',
        plan: [
          'Immediate rollback to legacy system',
          'Root cause analysis',
          'Fix and retest before retry'
        ],
        owner: 'Incident Commander'
      }
    ],
    
    issueLog: []
  },
  
  governance: {
    reviewSchedule: [
      {
        reviewType: 'steering',
        frequency: 'Weekly',
        attendees: ['Executive sponsor', 'Epic owner', 'Tech lead'],
        owner: 'PMO'
      }
    ],
    
    decisionLog: [
      {
        decision: 'Use AWS as cloud provider',
        date: '2023-12-15',
        madeBy: ['CTO', 'VP Engineering'],
        rationale: 'Best fit for requirements, existing expertise',
        impact: 'Locks in technology stack',
        reversible: false
      }
    ],
    
    qualityGates: [
      {
        gate: 'Architecture Review',
        criteria: ['Security approved', 'Scalability validated', 'Cost within budget'],
        reviewer: 'Architecture Review Board',
        status: 'pending',
        date: '2024-01-30'
      }
    ],
    
    complianceRequirements: [
      {
        requirement: 'SOC2 Type II',
        standard: 'SOC2',
        evidence: ['Audit reports', 'Control documentation'],
        status: 'in_progress',
        reviewer: 'External auditor'
      }
    ],
    
    auditTrail: []
  },
  
  aiContext: {
    epicBackground: [
      'Transforming 15-year-old monolithic application to microservices',
      'Focus on scalability, performance, and developer productivity',
      'Must maintain business continuity during migration'
    ],
    
    domainKnowledge: [
      {
        concept: 'Microservices',
        explanation: 'Architectural pattern where application is suite of small services',
        relevance: 'Core architectural change for the platform'
      },
      {
        concept: 'Event-driven architecture',
        explanation: 'Services communicate through events rather than direct calls',
        relevance: 'Enables loose coupling and scalability'
      }
    ],
    
    automationOpportunities: [
      {
        process: 'Deployment',
        currentState: 'Manual 2-week process with 20 steps',
        automatedState: 'Automated CI/CD with one-click deployment',
        benefit: 'Reduce deployment time by 99%',
        complexity: 'medium'
      }
    ],
    
    aiGuidelines: [
      {
        principle: 'Prefer small, focused services',
        application: 'Each microservice should have single responsibility',
        examples: ['User service only handles user data', 'Payment service only processes payments']
      }
    ],
    
    featureGenerationRules: [
      {
        rule: 'Each microservice becomes a feature',
        rationale: 'Clear ownership and deliverables',
        exceptions: ['Shared libraries', 'Infrastructure components']
      }
    ],
    
    successPatterns: [
      'Gradual migration with parallel running',
      'Feature flags for safe rollout',
      'Comprehensive monitoring before cutover'
    ],
    
    failurePatterns: [
      'Big bang migration',
      'Insufficient testing',
      'Ignoring data migration complexity'
    ]
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
    estimatedFeatures: 25,
    actualFeatures: 0
  },
  
  metrics: {
    progressMetrics: {
      overallProgress: 10,
      featuresCompleted: 0,
      featuresInProgress: 3,
      featuresNotStarted: 22,
      velocityTrend: 'stable'
    },
    
    healthMetrics: {
      schedule: 'on_track',
      budget: 'on_target',
      scope: 'stable',
      quality: 'meeting',
      team: 'healthy'
    },
    
    performanceIndicators: [
      {
        kpi: 'Migration Progress',
        current: '10%',
        target: '100%',
        trend: 'improving',
        action: 'Continue as planned'
      }
    ],
    
    reportingCadence: [
      {
        report: 'Executive Dashboard',
        frequency: 'Weekly',
        audience: ['C-suite', 'Board'],
        format: 'Dashboard',
        owner: 'PMO'
      }
    ]
  },
  
  knowledge: {
    lessonsLearned: [],
    bestPractices: [],
    innovations: [],
    documentation: [
      {
        type: 'Architecture',
        title: 'Platform Architecture Guide',
        location: '/docs/architecture',
        audience: 'Engineers',
        status: 'draft'
      }
    ],
    knowledgeTransfer: [
      {
        from: 'Consultants',
        to: 'Internal team',
        knowledge: 'Kubernetes best practices',
        method: 'Workshops and pairing',
        timeline: 'Q1 2024',
        status: 'planned'
      }
    ]
  },
  
  tracking: {
    statusHistory: [
      {
        status: 'ideation',
        timestamp: Date.now() - 90 * 24 * 60 * 60 * 1000,
        changedBy: 'system'
      },
      {
        status: 'planning',
        timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
        changedBy: 'Sarah Johnson',
        reason: 'Business case approved'
      }
    ],
    majorEvents: [],
    pivots: [],
    retrospectives: []
  }
});