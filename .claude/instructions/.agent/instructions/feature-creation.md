# AI-OPTIMIZED FEATURE CREATION INSTRUCTIONS

## ENFORCEMENT LEVEL: MANDATORY
**VIOLATION CONSEQUENCE**: Feature rejection, rework required

## CONSTRAINT RULES

### FORBIDDEN ACTIONS
❌ NEVER create features without functional requirements
❌ NEVER skip the problem statement or executive summary
❌ NEVER create features without stakeholder identification
❌ NEVER omit success metrics or acceptance criteria
❌ NEVER create features without risk assessment
❌ NEVER skip the AI context section
❌ NEVER create features without defining child tasks
❌ NEVER use vague or ambiguous language in requirements

### REQUIRED ACTIONS
✅ ALWAYS use the FeatureTemplate from `taskTemplates/feature.types.ts`
✅ ALWAYS provide human-friendly descriptions alongside technical specs
✅ ALWAYS define clear functional requirements with acceptance criteria
✅ ALWAYS identify all stakeholders and their concerns
✅ ALWAYS include AI context for automated development
✅ ALWAYS break features into executable tasks
✅ ALWAYS define measurable success metrics
✅ ALWAYS assess risks and dependencies

## FEATURE CREATION WORKFLOW

### STEP 1: FEATURE INITIALIZATION
```typescript
import { createFeatureFromTemplate } from './taskTemplates/feature-template.utils';
import { FeatureTemplate } from './taskTemplates/feature.types';

const feature = createFeatureFromTemplate({
  metadata: {
    title: "{feature_title}",        // Max 100 chars
    priority: "{priority}",           // critical | high | medium | low
    category: "{category}",           // user_interface | backend_service | etc.
    tags: ["{tag1}", "{tag2}"],      // Searchable tags
    keywords: ["{keyword1}"]          // For discoverability
  }
});
```

### STEP 2: HUMAN CONTEXT (MANDATORY)
```typescript
humanContext: {
  executiveSummary: "{2-3_sentences_for_executives}",
  problemStatement: "{what_problem_does_this_solve}",
  solution: "{how_does_this_solve_it}",
  benefits: [
    "{business_benefit_1}",
    "{business_benefit_2}"
  ],
  userImpact: {
    affected: ["{user_group_1}", "{user_group_2}"],
    howMany: "{estimated_user_count}",
    frequency: "{daily|weekly|monthly}"
  },
  exampleScenarios: [{
    title: "{scenario_name}",
    scenario: "{user_action_description}",
    outcome: "{expected_result}"
  }]
}
```

### STEP 3: STAKEHOLDER IDENTIFICATION
```typescript
stakeholders: {
  sponsor: {
    role: "{sponsor_role}",
    name: "{sponsor_name}",
    concerns: ["{concern_1}", "{concern_2}"],
    approvalRequired: true
  },
  productOwner: {
    role: "Product Owner",
    concerns: ["{business_value}", "{timeline}"],
    approvalRequired: true
  },
  userPersonas: [{
    name: "{persona_name}",
    role: "{user_role}",
    goals: ["{goal_1}", "{goal_2}"],
    painPoints: ["{pain_1}", "{pain_2}"],
    technicalLevel: "{beginner|intermediate|advanced}"
  }]
}
```

### STEP 4: FUNCTIONAL REQUIREMENTS
```typescript
functionalRequirements: {
  requirements: [{
    id: "{REQ-001}",
    description: "{what_system_must_do}",
    priority: "{must_have|should_have|could_have|wont_have}",
    acceptanceCriteria: [
      "GIVEN {context} WHEN {action} THEN {outcome}",
      "System SHALL {specific_behavior}"
    ],
    userStory: "As a {role}, I want {feature} so that {benefit}"
  }],
  userStories: {
    epic: "{main_epic_description}",
    stories: [{
      id: "{STORY-001}",
      asA: "{user_role}",
      iWant: "{feature_description}",
      soThat: "{benefit_description}",
      acceptanceCriteria: ["{criterion_1}"],
      priority: "{must|should|could|wont}"
    }]
  },
  outOfScope: [
    "{explicitly_not_included_1}",
    "{explicitly_not_included_2}"
  ]
}
```

### STEP 5: AI CONTEXT (CRITICAL FOR AUTOMATION)
```typescript
aiContext: {
  backgroundKnowledge: [
    "{domain_concept_1}",
    "{technical_context_1}"
  ],
  domainTerminology: [{
    term: "{domain_term}",
    definition: "{clear_definition}"
  }],
  architecturalContext: {
    currentArchitecture: "{how_system_works_now}",
    targetArchitecture: "{how_it_should_work}",
    integrationPoints: ["{system_1}", "{api_2}"],
    dataFlows: ["{data_flow_description}"]
  },
  codebaseContext: {
    relevantFiles: ["{/path/to/file.ts}"],
    patterns: ["{pattern_to_follow}"],
    antiPatterns: ["{pattern_to_avoid}"],
    conventions: ["{project_convention}"]
  },
  commonPitfalls: ["{known_issue_to_avoid}"],
  bestPractices: ["{recommended_approach}"]
}
```

### STEP 6: TECHNICAL SPECIFICATIONS
```typescript
technicalSpecs: {
  architecture: {
    components: [{
      name: "{component_name}",
      type: "{frontend|backend|service|database}",
      responsibility: "{what_it_does}",
      interfaces: ["{interface_1}"]
    }]
  },
  technology: {
    frontend: ["React 19", "Vite", "Module Federation"],
    backend: ["Convex"],
    database: ["Convex"],
    infrastructure: ["{infrastructure_tech}"]
  },
  constraints: [{
    type: "{technology|architecture|compliance}",
    description: "{constraint_description}",
    impact: "{high|medium|low}",
    mitigation: "{how_to_handle}"
  }]
}
```

### STEP 7: IMPLEMENTATION PLAN
```typescript
implementationPlan: {
  approach: "{high_level_approach}",
  phases: [{
    phaseNumber: 1,
    name: "{phase_name}",
    description: "{phase_description}",
    duration: "{X_days}",
    deliverables: ["{deliverable_1}"],
    taskIds: ["{TASK-001}", "{TASK-002}"]
  }],
  milestones: [{
    name: "{milestone_name}",
    date: "{YYYY-MM-DD}",
    deliverables: ["{deliverable_1}"],
    successCriteria: ["{criterion_1}"],
    taskIds: ["{TASK-001}"]
  }],
  rolloutStrategy: {
    type: "{big_bang|phased|pilot|parallel}",
    stages: ["{stage_1}", "{stage_2}"],
    rollbackPlan: ["{rollback_step_1}"]
  }
}
```

### STEP 8: SUCCESS METRICS
```typescript
successMetrics: {
  businessMetrics: [{
    name: "{metric_name}",
    current: "{current_value}",
    target: "{target_value}",
    measurement: "{how_to_measure}",
    timeframe: "{when_to_measure}"
  }],
  technicalMetrics: [{
    metric: "{performance_metric}",
    target: "{target_value}",
    measurement: "{measurement_method}"
  }],
  definitionOfDone: [
    "All acceptance criteria met",
    "95% unit test coverage achieved",
    "100% integration test coverage achieved",
    "Documentation complete",
    "Code review approved"
  ]
}
```

### STEP 9: RISK ASSESSMENT
```typescript
risksAndDependencies: {
  risks: [{
    risk: "{risk_description}",
    probability: "{high|medium|low}",
    impact: "{critical|major|minor}",
    mitigation: "{mitigation_strategy}",
    contingency: "{backup_plan}"
  }],
  dependencies: [{
    type: "{feature|service|team|external}",
    name: "{dependency_name}",
    description: "{dependency_description}",
    status: "{available|in_progress|blocked}",
    owner: "{owner_name}"
  }],
  assumptions: [{
    assumption: "{assumption_description}",
    validation: "{how_to_validate}",
    impact: "{impact_if_false}"
  }]
}
```

### STEP 10: CHILD TASKS
```typescript
childTasks: {
  taskIds: ["{TASK-001}", "{TASK-002}"],
  taskCount: {number_of_tasks},
  tasksByPhase: [{
    phase: "{phase_name}",
    taskIds: ["{TASK-001}"]
  }],
  tasksByPriority: {
    critical: ["{TASK-001}"],
    high: ["{TASK-002}"],
    medium: [],
    low: []
  },
  estimatedTotalHours: {total_hours}
}
```

## VALIDATION CHECKLIST

Before submitting a feature:

### MANDATORY FIELDS
- [ ] Title (max 100 characters)
- [ ] Executive summary (2-3 sentences)
- [ ] Problem statement
- [ ] At least 3 functional requirements
- [ ] Product owner identified
- [ ] Implementation approach defined
- [ ] Testing strategy defined
- [ ] Success metrics defined
- [ ] Definition of done specified

### AI READINESS
- [ ] AI context section complete
- [ ] Domain terminology defined
- [ ] Architectural context provided
- [ ] Codebase patterns identified
- [ ] Common pitfalls listed

### QUALITY CHECKS
- [ ] All requirements have acceptance criteria
- [ ] All requirements are testable
- [ ] Risks have been assessed
- [ ] Dependencies identified
- [ ] Child tasks created or referenced

## FEATURE STATES

Features progress through these states:

1. **draft**: Initial creation, editing allowed
2. **approved**: Stakeholder approved, ready for breakdown
3. **in_progress**: Tasks being executed
4. **testing**: Implementation complete, testing in progress
5. **completed**: All tasks done, tests passing
6. **deployed**: Released to production
7. **deprecated**: No longer maintained

## TEMPLATES LOCATION

All feature templates and utilities are in:
```
.agent/instructions/taskTemplates/
├── feature.types.ts        # TypeScript interfaces
├── feature-template.utils.ts  # Creation utilities
└── feature.examples.ts     # Example features
```

## ENFORCEMENT

**VIOLATIONS**: Features not following this template will be:
1. Automatically rejected by validation
2. Returned for correction
3. Logged as non-compliant

**SUCCESS**: Features following this template will:
1. Enable AI-assisted development
2. Provide clear communication to stakeholders
3. Ensure comprehensive testing
4. Track progress accurately
5. Manage risks proactively