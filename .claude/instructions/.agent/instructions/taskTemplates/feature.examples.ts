import { FeatureTemplate } from './feature.types';
import { createFeatureFromTemplate } from './feature-template.utils';

// ════════════════════════════════════════════════════════════════
// EXAMPLE 1: USER AUTHENTICATION FEATURE
// ════════════════════════════════════════════════════════════════

export const userAuthenticationFeature: FeatureTemplate = createFeatureFromTemplate({
  metadata: {
    title: 'Multi-Factor Authentication System',
    priority: 'critical',
    category: 'security',
    size: 'L',
    estimatedDays: 15,
    tags: ['security', 'authentication', 'mfa', 'user-management'],
    keywords: ['login', 'security', '2fa', 'totp', 'authentication']
  },
  
  humanContext: {
    executiveSummary: 'Implement multi-factor authentication to enhance account security and meet compliance requirements. This will reduce unauthorized access by 99% and satisfy SOC2 requirements.',
    problemStatement: 'Current single-factor authentication is vulnerable to password breaches. 23% of users reuse passwords, and we\'ve had 3 security incidents in the past year.',
    solution: 'Implement TOTP-based 2FA with SMS fallback, supporting authenticator apps like Google Authenticator and Authy.',
    benefits: [
      'Reduce unauthorized access by 99%',
      'Meet SOC2 compliance requirements',
      'Increase user trust and confidence',
      'Reduce support tickets related to account breaches'
    ],
    userImpact: {
      affected: ['All users', 'Admin users', 'API consumers'],
      howMany: '50,000 active users',
      frequency: 'Every login attempt'
    },
    exampleScenarios: [
      {
        title: 'First-time 2FA Setup',
        scenario: 'User enables 2FA in account settings',
        outcome: 'QR code displayed, backup codes generated, 2FA activated'
      },
      {
        title: 'Login with 2FA',
        scenario: 'User enters password then TOTP code',
        outcome: 'Successful authentication and session creation'
      }
    ]
  },
  
  stakeholders: {
    sponsor: {
      role: 'Chief Security Officer',
      name: 'Jane Smith',
      concerns: ['Compliance', 'User adoption', 'Implementation timeline'],
      approvalRequired: true
    },
    productOwner: {
      role: 'Product Manager',
      name: 'John Doe',
      concerns: ['User experience', 'Conversion impact', 'Support burden'],
      approvalRequired: true
    },
    technicalLead: {
      role: 'Senior Backend Engineer',
      name: 'Alice Johnson',
      concerns: ['System performance', 'Integration complexity', 'Migration strategy'],
      approvalRequired: false
    },
    otherStakeholders: [
      {
        role: 'Customer Support Lead',
        concerns: ['Training requirements', 'FAQ documentation', 'Recovery processes'],
        approvalRequired: false
      }
    ],
    userPersonas: [
      {
        name: 'Security-Conscious User',
        role: 'Power User',
        goals: ['Maximum account security', 'Use authenticator apps'],
        painPoints: ['Complex setup processes', 'Lost device recovery'],
        technicalLevel: 'advanced'
      },
      {
        name: 'Casual User',
        role: 'Standard User',
        goals: ['Easy login', 'Account protection'],
        painPoints: ['Additional login steps', 'Remembering to bring phone'],
        technicalLevel: 'beginner'
      }
    ],
    communicationPlan: {
      updateFrequency: 'Weekly',
      channels: ['Slack #security-updates', 'Email to stakeholders'],
      keyContacts: ['jane.smith@company.com', 'john.doe@company.com']
    }
  },
  
  functionalRequirements: {
    requirements: [
      {
        id: 'REQ-AUTH-001',
        description: 'System shall support TOTP-based authentication',
        priority: 'must_have',
        acceptanceCriteria: [
          'GIVEN user has 2FA enabled WHEN they enter valid TOTP THEN access is granted',
          'System SHALL accept codes within 30-second window',
          'System SHALL support standard TOTP apps (Google Authenticator, Authy)'
        ],
        userStory: 'As a user, I want to use my authenticator app so that my account is secure'
      },
      {
        id: 'REQ-AUTH-002',
        description: 'System shall provide backup codes',
        priority: 'must_have',
        acceptanceCriteria: [
          'System SHALL generate 10 single-use backup codes',
          'Each code SHALL work only once',
          'User SHALL be notified when only 3 codes remain'
        ]
      },
      {
        id: 'REQ-AUTH-003',
        description: 'System shall support SMS fallback',
        priority: 'should_have',
        acceptanceCriteria: [
          'SMS codes SHALL expire after 10 minutes',
          'System SHALL rate-limit SMS requests to 3 per hour'
        ]
      }
    ],
    userStories: {
      epic: 'As a platform, we need multi-factor authentication to protect user accounts',
      stories: [
        {
          id: 'STORY-001',
          asA: 'security-conscious user',
          iWant: 'to enable 2FA on my account',
          soThat: 'my account is protected even if my password is compromised',
          acceptanceCriteria: ['QR code generation', 'Backup codes provided', 'Success confirmation'],
          priority: 'must'
        }
      ]
    },
    useCases: [
      {
        id: 'UC-001',
        actor: 'Authenticated User',
        description: 'Enable 2FA on account',
        preconditions: ['User is logged in', 'User has authenticator app'],
        mainFlow: [
          'User navigates to security settings',
          'User clicks "Enable 2FA"',
          'System displays QR code',
          'User scans with authenticator app',
          'User enters verification code',
          'System activates 2FA and shows backup codes'
        ],
        alternativeFlows: ['User chooses SMS instead of app'],
        postconditions: ['2FA is active', 'Backup codes are saved']
      }
    ],
    outOfScope: [
      'Hardware token support',
      'Biometric authentication',
      'Single Sign-On integration',
      'Password-less authentication'
    ]
  },
  
  nonFunctionalRequirements: {
    requirements: [
      {
        category: 'performance',
        description: 'TOTP verification must complete within 200ms',
        metric: 'Response time',
        target: '<200ms p99',
        measurement: 'Server-side timing logs'
      },
      {
        category: 'security',
        description: 'Backup codes must be encrypted at rest',
        metric: 'Encryption standard',
        target: 'AES-256',
        measurement: 'Security audit'
      },
      {
        category: 'reliability',
        description: 'Authentication service uptime',
        metric: 'Availability',
        target: '99.99%',
        measurement: 'Monitoring system'
      }
    ],
    performanceTargets: {
      responseTime: '<200ms for verification',
      throughput: '10,000 verifications/second',
      concurrentUsers: '5,000 simultaneous logins'
    },
    securityRequirements: {
      authentication: 'Time-based OTP (RFC 6238)',
      authorization: 'Role-based access control',
      dataProtection: 'AES-256 encryption for secrets',
      compliance: ['SOC2', 'GDPR', 'CCPA']
    },
    usabilityRequirements: {
      accessibility: 'WCAG 2.1 Level AA',
      browserSupport: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'],
      deviceSupport: ['Desktop', 'Mobile', 'Tablet'],
      languages: ['English', 'Spanish', 'French', 'German']
    }
  },
  
  aiContext: {
    backgroundKnowledge: [
      'TOTP (Time-based One-Time Password) algorithm per RFC 6238',
      'HMAC-based One-Time Password algorithm per RFC 4226',
      'QR code generation for secret sharing',
      'Rate limiting strategies for SMS services'
    ],
    domainTerminology: [
      {
        term: 'TOTP',
        definition: 'Time-based One-Time Password - 6-digit code that changes every 30 seconds'
      },
      {
        term: 'Backup Codes',
        definition: 'Single-use codes for account recovery when primary 2FA method unavailable'
      },
      {
        term: 'Secret Key',
        definition: 'Shared secret between server and authenticator app, usually 32 characters'
      }
    ],
    architecturalContext: {
      currentArchitecture: 'Monolithic authentication service with session-based auth',
      targetArchitecture: 'Microservice handling MFA with JWT tokens and refresh tokens',
      integrationPoints: ['User service', 'Session management', 'SMS gateway', 'Email service'],
      dataFlows: [
        'Login request → Password check → 2FA challenge → Token generation',
        'Setup flow → Secret generation → QR display → Verification → Activation'
      ]
    },
    codebaseContext: {
      relevantFiles: [
        'src/services/auth/authentication.service.ts',
        'src/models/user.model.ts',
        'src/middleware/auth.middleware.ts',
        'src/utils/crypto.utils.ts'
      ],
      patterns: [
        'Service-Repository pattern',
        'JWT token authentication',
        'Express middleware chain',
        'Async/await error handling'
      ],
      antiPatterns: [
        'Storing secrets in plain text',
        'Synchronous blocking operations',
        'Direct database access from controllers'
      ],
      conventions: [
        'Use dependency injection',
        'Return standardized API responses',
        'Log all authentication events',
        'Use transaction for multi-step operations'
      ]
    },
    commonPitfalls: [
      'Not accounting for clock drift in TOTP validation',
      'Forgetting to rate-limit SMS sending',
      'Not providing account recovery options',
      'Poor QR code generation quality'
    ],
    bestPractices: [
      'Accept previous, current, and next TOTP windows',
      'Hash backup codes before storage',
      'Implement gradual rollout with feature flags',
      'Provide clear user instructions with screenshots'
    ]
  },
  
  technicalSpecs: {
    architecture: {
      components: [
        {
          name: 'MFA Service',
          type: 'Microservice',
          responsibility: 'Handle all 2FA operations',
          interfaces: ['REST API', 'gRPC for internal calls']
        },
        {
          name: 'Secret Manager',
          type: 'Service',
          responsibility: 'Generate and validate TOTP secrets',
          interfaces: ['Internal service interface']
        },
        {
          name: 'SMS Gateway Integration',
          type: 'Adapter',
          responsibility: 'Send SMS codes via Twilio',
          interfaces: ['Twilio API']
        }
      ],
      dataModel: {
        entities: ['UserMFA', 'BackupCode', 'MFAEvent'],
        relationships: ['User has one UserMFA', 'UserMFA has many BackupCodes'],
        schemas: ['user_mfa table', 'backup_codes table', 'mfa_events table']
      },
      apiSpec: {
        endpoints: [
          {
            method: 'POST',
            path: '/api/mfa/setup',
            description: 'Initialize MFA setup',
            requestBody: '{ type: "totp" | "sms" }',
            responseBody: '{ secret: string, qrCode: string, backupCodes: string[] }'
          },
          {
            method: 'POST',
            path: '/api/mfa/verify',
            description: 'Verify MFA code',
            requestBody: '{ code: string }',
            responseBody: '{ valid: boolean, token?: string }'
          }
        ]
      }
    },
    technology: {
      frontend: ['React 19', 'Vite', 'Module Federation', 'react-qrcode'],
      backend: ['Node.js', 'Express', 'Convex', 'speakeasy', 'qrcode'],
      database: ['Convex'],
      infrastructure: ['AWS Lambda', 'API Gateway', 'Secrets Manager'],
      thirdPartyServices: ['Twilio SMS', 'SendGrid Email']
    },
    constraints: [
      {
        type: 'technology',
        description: 'Must use Convex for data persistence',
        impact: 'high',
        mitigation: 'Design schema to work with Convex patterns'
      },
      {
        type: 'compliance',
        description: 'Must meet SOC2 requirements',
        impact: 'high',
        mitigation: 'Implement audit logging and encryption'
      }
    ],
    integrations: [
      {
        system: 'Twilio',
        type: 'api',
        direction: 'outbound',
        protocol: 'HTTPS',
        dataFormat: 'JSON'
      },
      {
        system: 'User Service',
        type: 'api',
        direction: 'bidirectional',
        protocol: 'gRPC',
        dataFormat: 'Protocol Buffers'
      }
    ]
  },
  
  implementationPlan: {
    approach: 'Implement core TOTP functionality first, then add SMS fallback, finally implement admin tools',
    phases: [
      {
        phaseNumber: 1,
        name: 'Core TOTP Implementation',
        description: 'Build basic TOTP generation and validation',
        duration: '5 days',
        deliverables: ['TOTP service', 'Database schema', 'Basic API endpoints'],
        taskIds: ['TASK-MFA-001', 'TASK-MFA-002', 'TASK-MFA-003']
      },
      {
        phaseNumber: 2,
        name: 'User Interface',
        description: 'Build setup and login flows',
        duration: '5 days',
        deliverables: ['Setup wizard', 'Login flow', 'Settings page'],
        taskIds: ['TASK-MFA-004', 'TASK-MFA-005', 'TASK-MFA-006']
      },
      {
        phaseNumber: 3,
        name: 'SMS and Recovery',
        description: 'Add SMS fallback and recovery options',
        duration: '3 days',
        deliverables: ['SMS integration', 'Backup codes', 'Recovery flow'],
        taskIds: ['TASK-MFA-007', 'TASK-MFA-008']
      },
      {
        phaseNumber: 4,
        name: 'Testing and Rollout',
        description: 'Complete testing and gradual rollout',
        duration: '2 days',
        deliverables: ['Test suite', 'Documentation', 'Feature flags'],
        taskIds: ['TASK-MFA-009', 'TASK-MFA-010']
      }
    ],
    taskBreakdown: [
      {
        category: 'Backend Development',
        tasks: [
          {
            id: 'TASK-MFA-001',
            title: 'Create MFA database schema',
            description: 'Design and implement Convex schema for MFA data',
            estimatedHours: 8,
            dependencies: [],
            assignee: 'backend-team'
          },
          {
            id: 'TASK-MFA-002',
            title: 'Implement TOTP generation and validation',
            description: 'Core TOTP algorithm implementation',
            estimatedHours: 16,
            dependencies: ['TASK-MFA-001'],
            assignee: 'backend-team'
          }
        ]
      }
    ],
    milestones: [
      {
        name: 'TOTP Working End-to-End',
        date: '2024-02-15',
        deliverables: ['Working TOTP flow', 'Basic UI', 'Unit tests'],
        successCriteria: ['User can enable TOTP', 'User can login with TOTP', 'All tests passing'],
        taskIds: ['TASK-MFA-001', 'TASK-MFA-002', 'TASK-MFA-003', 'TASK-MFA-004']
      }
    ],
    rolloutStrategy: {
      type: 'phased',
      stages: [
        '1% of users (beta testers)',
        '10% of users',
        '50% of users',
        '100% deployment'
      ],
      rollbackPlan: [
        'Disable feature flag',
        'Clear MFA requirements from affected accounts',
        'Restore previous authentication flow'
      ]
    }
  },
  
  testingStrategy: {
    approach: 'Comprehensive testing including unit, integration, E2E, and security testing',
    testTypes: {
      unit: {
        coverage: 95,
        tools: ['Vitest', 'React Testing Library'],
        responsibilities: 'Test all TOTP algorithms, validation logic, and components'
      },
      integration: {
        coverage: 100,
        tools: ['Supertest', 'Vitest'],
        responsibilities: 'Test all API endpoints and service interactions'
      },
      e2e: {
        scenarios: ['Complete setup flow', 'Login with MFA', 'Recovery flow'],
        tools: ['Playwright'],
        responsibilities: 'Test complete user journeys'
      },
      security: {
        assessments: ['Penetration testing', 'Code review', 'Dependency scanning'],
        tools: ['OWASP ZAP', 'SonarQube', 'Snyk']
      }
    },
    acceptanceTests: [
      {
        description: 'User can successfully enable TOTP',
        type: 'acceptance',
        steps: ['Login', 'Navigate to settings', 'Enable MFA', 'Scan QR', 'Verify code'],
        expectedResult: 'MFA enabled successfully',
        testData: { userId: 'test-user-001' }
      }
    ],
    testData: [
      {
        type: 'Test accounts',
        description: 'Accounts with various MFA states',
        location: 'test/fixtures/users.json'
      }
    ],
    defectManagement: {
      severityLevels: ['Critical', 'Major', 'Minor', 'Trivial'],
      process: 'Log in Jira, triage daily, fix critical immediately',
      tools: ['Jira', 'Sentry', 'DataDog']
    }
  },
  
  successMetrics: {
    businessMetrics: [
      {
        name: 'MFA Adoption Rate',
        current: '0%',
        target: '60%',
        measurement: 'Percentage of active users with MFA enabled',
        timeframe: '6 months'
      },
      {
        name: 'Account Breach Reduction',
        current: '3 per month',
        target: '0 per month',
        measurement: 'Count of confirmed account breaches',
        timeframe: '3 months after launch'
      }
    ],
    technicalMetrics: [
      {
        metric: 'TOTP Verification Latency',
        current: 'N/A',
        target: '<200ms p99',
        measurement: 'Server timing logs'
      },
      {
        metric: 'System Availability',
        target: '99.99%',
        measurement: 'Uptime monitoring'
      }
    ],
    userMetrics: [
      {
        metric: 'Setup Completion Rate',
        method: 'Funnel analysis',
        target: '>80%',
        frequency: 'Weekly'
      },
      {
        metric: 'Support Tickets',
        method: 'Ticket counting',
        target: '<50 per week',
        frequency: 'Weekly'
      }
    ],
    acceptanceCriteria: [
      {
        criterion: 'All functional requirements implemented',
        verification: 'QA sign-off',
        owner: 'QA Lead'
      },
      {
        criterion: 'Security review passed',
        verification: 'Security team approval',
        owner: 'Security Team'
      }
    ],
    definitionOfDone: [
      'All code peer reviewed',
      'Unit test coverage >= 95%',
      'Integration test coverage = 100%',
      'Documentation complete',
      'Security review passed',
      'Performance targets met',
      'Deployed to production behind feature flag'
    ]
  },
  
  risksAndDependencies: {
    risks: [
      {
        risk: 'Users lose access to their accounts',
        probability: 'medium',
        impact: 'critical',
        mitigation: 'Provide multiple recovery options and clear instructions',
        contingency: 'Customer support can manually disable MFA'
      },
      {
        risk: 'SMS delivery failures',
        probability: 'low',
        impact: 'major',
        mitigation: 'Use reliable SMS provider with fallback',
        contingency: 'Allow email-based codes as backup'
      }
    ],
    dependencies: [
      {
        type: 'external',
        name: 'Twilio SMS Service',
        description: 'SMS delivery for fallback codes',
        status: 'available',
        owner: 'Twilio'
      },
      {
        type: 'team',
        name: 'Mobile Team',
        description: 'Update mobile apps to support MFA',
        status: 'in_progress',
        owner: 'Mobile Team Lead'
      }
    ],
    assumptions: [
      {
        assumption: 'Users have smartphones for authenticator apps',
        validation: 'Survey shows 95% have smartphones',
        impact: 'Need SMS fallback for remaining 5%'
      }
    ],
    constraints: [
      {
        type: 'time',
        description: 'Must launch before Q2 compliance audit',
        impact: 'Cannot extend timeline',
        flexibility: 'fixed'
      }
    ]
  },
  
  documentationPlan: {
    userDocumentation: [
      {
        type: 'Setup Guide',
        audience: 'End users',
        format: 'Interactive tutorial',
        location: '/docs/mfa-setup'
      },
      {
        type: 'FAQ',
        audience: 'End users',
        format: 'Web page',
        location: '/support/mfa-faq'
      }
    ],
    technicalDocumentation: [
      {
        type: 'API Documentation',
        audience: 'Developers',
        format: 'OpenAPI spec',
        location: '/api/docs/mfa'
      },
      {
        type: 'Architecture Decision Record',
        audience: 'Engineering team',
        format: 'Markdown',
        location: '/docs/adr/mfa-implementation.md'
      }
    ],
    trainingPlan: [
      {
        audience: 'Customer Support',
        method: 'Live training session',
        duration: '2 hours',
        materials: ['Slide deck', 'Troubleshooting guide', 'Test accounts']
      }
    ],
    knowledgeTransfer: [
      {
        from: 'Security Team',
        to: 'Development Team',
        method: 'Workshop on TOTP implementation',
        timeline: 'Week 1 of project'
      }
    ]
  },
  
  childTasks: {
    taskIds: [
      'TASK-MFA-001', 'TASK-MFA-002', 'TASK-MFA-003', 
      'TASK-MFA-004', 'TASK-MFA-005', 'TASK-MFA-006',
      'TASK-MFA-007', 'TASK-MFA-008', 'TASK-MFA-009', 
      'TASK-MFA-010'
    ],
    taskCount: 10,
    completedCount: 0,
    tasksByPhase: [
      {
        phase: 'Core TOTP Implementation',
        taskIds: ['TASK-MFA-001', 'TASK-MFA-002', 'TASK-MFA-003']
      },
      {
        phase: 'User Interface',
        taskIds: ['TASK-MFA-004', 'TASK-MFA-005', 'TASK-MFA-006']
      }
    ],
    tasksByPriority: {
      critical: ['TASK-MFA-001', 'TASK-MFA-002'],
      high: ['TASK-MFA-003', 'TASK-MFA-004', 'TASK-MFA-005'],
      medium: ['TASK-MFA-006', 'TASK-MFA-007', 'TASK-MFA-008'],
      low: ['TASK-MFA-009', 'TASK-MFA-010']
    },
    estimatedTotalHours: 120,
    actualTotalHours: undefined
  },
  
  tracking: {
    progressPercentage: 0,
    statusHistory: [
      {
        status: 'draft',
        timestamp: Date.now(),
        changedBy: 'system',
        reason: 'Initial creation'
      }
    ],
    majorDecisions: [],
    blockers: [],
    lessonsLearned: []
  }
});

// ════════════════════════════════════════════════════════════════
// EXAMPLE 2: KANBAN BOARD FEATURE (SIMPLIFIED)
// ════════════════════════════════════════════════════════════════

export const kanbanBoardFeature: FeatureTemplate = createFeatureFromTemplate({
  metadata: {
    title: 'AI-Powered Kanban Board',
    priority: 'high',
    category: 'user_interface',
    size: 'XL',
    estimatedDays: 20,
    tags: ['kanban', 'ai', 'automation', 'project-management'],
    keywords: ['board', 'tasks', 'columns', 'drag-drop', 'automation']
  },
  
  humanContext: {
    executiveSummary: 'Build an intelligent kanban board that uses AI to automatically prioritize and manage development tasks, reducing manual project management overhead by 60%.',
    problemStatement: 'Manual task management takes 2-3 hours daily from team leads. Tasks are often mis-prioritized, dependencies are missed, and progress tracking is inconsistent.',
    solution: 'Create an AI-powered kanban board that automatically organizes tasks, identifies dependencies, suggests priorities, and tracks progress in real-time.',
    benefits: [
      'Reduce project management overhead by 60%',
      'Improve task completion rate by 40%',
      'Automatic dependency detection',
      'Real-time progress visualization',
      'AI-suggested task prioritization'
    ],
    userImpact: {
      affected: ['Development teams', 'Project managers', 'Product owners'],
      howMany: '200 team members across 15 teams',
      frequency: 'Daily - primary work interface'
    },
    exampleScenarios: [
      {
        title: 'AI Task Prioritization',
        scenario: 'New urgent bug is created',
        outcome: 'AI automatically moves it to top of "Ready" column based on impact'
      },
      {
        title: 'Dependency Detection',
        scenario: 'Developer starts task with unmet dependencies',
        outcome: 'System warns and suggests completing dependent tasks first'
      }
    ]
  },
  
  functionalRequirements: {
    requirements: [
      {
        id: 'REQ-KB-001',
        description: 'Board shall have 6 configurable columns',
        priority: 'must_have',
        acceptanceCriteria: [
          'Board displays exactly 6 columns',
          'Columns are: New Task, Ready for Development, In Development, Developed, Human-approved, Done',
          'Column names can be customized'
        ]
      },
      {
        id: 'REQ-KB-002',
        description: 'Support drag-and-drop between columns',
        priority: 'must_have',
        acceptanceCriteria: [
          'Users can drag tasks between columns',
          'Visual feedback during drag operation',
          'Automatic status update on drop'
        ]
      },
      {
        id: 'REQ-KB-003',
        description: 'AI shall suggest task priorities',
        priority: 'should_have',
        acceptanceCriteria: [
          'AI analyzes task dependencies and impact',
          'Priority suggestions update in real-time',
          'Users can override AI suggestions'
        ]
      }
    ],
    userStories: {
      epic: 'As a development team, we need an intelligent kanban board to manage our work efficiently',
      stories: [
        {
          id: 'STORY-KB-001',
          asA: 'developer',
          iWant: 'to see my assigned tasks',
          soThat: 'I know what to work on next',
          acceptanceCriteria: ['Tasks filtered by assignee', 'Priority clearly visible'],
          priority: 'must'
        }
      ]
    },
    useCases: [],
    outOfScope: [
      'Gantt chart view',
      'Resource management',
      'Time tracking',
      'Invoicing'
    ]
  },
  
  aiContext: {
    backgroundKnowledge: [
      'Kanban methodology principles',
      'Task dependency graph algorithms',
      'Priority scoring algorithms',
      'Real-time collaboration patterns'
    ],
    domainTerminology: [
      {
        term: 'WIP Limit',
        definition: 'Work In Progress limit - maximum tasks allowed in a column'
      },
      {
        term: 'Swimlane',
        definition: 'Horizontal categorization of tasks on the board'
      }
    ],
    architecturalContext: {
      currentArchitecture: 'No existing system',
      targetArchitecture: 'Module Federation micro-frontend with Convex real-time backend',
      integrationPoints: ['Portal system', 'AI service', 'Notification service'],
      dataFlows: ['Task creation → AI analysis → Board update → Real-time sync']
    },
    codebaseContext: {
      relevantFiles: [],
      patterns: ['Module Federation', 'React hooks', 'Convex subscriptions'],
      antiPatterns: ['Prop drilling', 'Direct DOM manipulation'],
      conventions: ['Functional components only', 'Custom hooks for logic']
    },
    commonPitfalls: [
      'Performance issues with large boards',
      'Race conditions in drag-drop',
      'Websocket connection management'
    ],
    bestPractices: [
      'Virtual scrolling for large boards',
      'Optimistic UI updates',
      'Graceful degradation without websockets'
    ]
  },
  
  technicalSpecs: {
    architecture: {
      components: [
        {
          name: 'KanbanBoard',
          type: 'React Component',
          responsibility: 'Main board UI and drag-drop',
          interfaces: ['Props interface', 'Event handlers']
        },
        {
          name: 'TaskService',
          type: 'Convex Function',
          responsibility: 'Task CRUD and real-time sync',
          interfaces: ['Convex mutations', 'Subscriptions']
        },
        {
          name: 'AIPrioritizer',
          type: 'Service',
          responsibility: 'Analyze and prioritize tasks',
          interfaces: ['REST API']
        }
      ]
    },
    technology: {
      frontend: ['React 19', 'Vite', 'Module Federation', '@lgsf/ui-lib', 'react-beautiful-dnd'],
      backend: ['Convex'],
      database: ['Convex']
    },
    constraints: [],
    integrations: []
  },
  
  implementationPlan: {
    approach: 'Build core board first, add AI features incrementally',
    phases: [
      {
        phaseNumber: 1,
        name: 'Core Board',
        description: 'Basic kanban board with drag-drop',
        duration: '7 days',
        deliverables: ['Board component', 'Column layout', 'Drag-drop'],
        taskIds: []
      }
    ],
    taskBreakdown: [],
    milestones: [],
    rolloutStrategy: {
      type: 'pilot',
      stages: ['Internal team pilot', 'Beta teams', 'Full rollout'],
      rollbackPlan: []
    }
  },
  
  testingStrategy: {
    approach: 'TDD with comprehensive test coverage',
    testTypes: {
      unit: {
        coverage: 95,
        tools: ['Vitest', 'React Testing Library'],
        responsibilities: 'Test all components and hooks'
      },
      integration: {
        coverage: 100,
        tools: ['Vitest'],
        responsibilities: 'Test Convex integrations'
      }
    },
    acceptanceTests: [],
    testData: [],
    defectManagement: {
      severityLevels: ['Critical', 'Major', 'Minor'],
      process: 'Log in issue tracker',
      tools: ['GitHub Issues']
    }
  },
  
  successMetrics: {
    businessMetrics: [],
    technicalMetrics: [],
    userMetrics: [],
    acceptanceCriteria: [],
    definitionOfDone: [
      'All acceptance criteria met',
      '95% unit test coverage',
      '100% integration test coverage',
      'Code review complete',
      'Documentation complete'
    ]
  },
  
  risksAndDependencies: {
    risks: [],
    dependencies: [],
    assumptions: [],
    constraints: []
  },
  
  documentationPlan: {
    userDocumentation: [],
    technicalDocumentation: [],
    trainingPlan: [],
    knowledgeTransfer: []
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
    estimatedTotalHours: 160
  },
  
  tracking: {
    progressPercentage: 0,
    statusHistory: [
      {
        status: 'draft',
        timestamp: Date.now(),
        changedBy: 'system'
      }
    ],
    majorDecisions: [],
    blockers: []
  }
});