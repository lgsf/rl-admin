# AI-OPTIMIZED EPIC CREATION INSTRUCTIONS

## ENFORCEMENT LEVEL: MANDATORY
**VIOLATION CONSEQUENCE**: Epic rejection, executive review required

## CONSTRAINT RULES

### FORBIDDEN ACTIONS
❌ NEVER create epics without strategic alignment
❌ NEVER skip vision and mission statements  
❌ NEVER omit business case and ROI analysis
❌ NEVER create epics without market analysis
❌ NEVER skip stakeholder identification and RACI
❌ NEVER omit risk assessment and mitigation plans
❌ NEVER create epics without resource planning
❌ NEVER skip success criteria and KPIs
❌ NEVER create epics without timeline and milestones
❌ NEVER use ambiguous or unmeasurable objectives

### REQUIRED ACTIONS
✅ ALWAYS use the EpicTemplate from `taskTemplates/epic.types.ts`
✅ ALWAYS align with company strategic objectives
✅ ALWAYS provide comprehensive business case with ROI
✅ ALWAYS conduct market and competitive analysis
✅ ALWAYS identify all stakeholders with RACI matrix
✅ ALWAYS break epics into features and capabilities
✅ ALWAYS define measurable success criteria
✅ ALWAYS assess risks with mitigation strategies
✅ ALWAYS plan resources and budget
✅ ALWAYS include AI context for automation

## EPIC CREATION WORKFLOW

### STEP 1: EPIC INITIALIZATION
```typescript
import { createEpicFromTemplate } from './taskTemplates/epic-template.utils';
import { EpicTemplate } from './taskTemplates/epic.types';

const epic = createEpicFromTemplate({
  metadata: {
    title: "{strategic_initiative_name}",    // Max 100 chars
    priority: "{priority}",                  // critical | high | medium | low
    theme: "{theme}",                        // growth | retention | infrastructure | etc.
    quarter: "{Q1|Q2|Q3|Q4}",
    year: {year},
    estimatedQuarters: {number},            // Expected duration
    tags: ["{tag1}", "{tag2}"],
    keywords: ["{searchable_keyword}"]
  }
});
```

### STEP 2: STRATEGIC CONTEXT (CRITICAL)
```typescript
strategicContext: {
  visionStatement: "{long_term_vision_1_2_sentences}",
  missionStatement: "{what_we_are_achieving}",
  
  problemSpace: {
    currentState: "{where_we_are_now}",
    desiredState: "{where_we_want_to_be}",
    gap: [
      "{missing_capability_1}",
      "{missing_capability_2}"
    ],
    impact: "{why_this_matters_to_business}"
  },
  
  businessCase: {
    opportunity: "{market_or_business_opportunity}",
    solution: "{high_level_solution_approach}",
    benefits: [
      "{quantifiable_benefit_1}",
      "{quantifiable_benefit_2}"
    ],
    risks: ["{strategic_risk_1}"],
    alternatives: ["{alternative_approach_considered}"]
  },
  
  strategicAlignment: [{
    companyGoal: "{annual_company_goal}",
    objective: "{specific_objective}",
    keyResult: "{measurable_result}",
    metric: "{measurement_method}",
    target: "{target_value}",
    current: "{current_value}"
  }],
  
  successDefinition: "{what_success_looks_like}"
}
```

### STEP 3: MARKET ANALYSIS (MANDATORY)
```typescript
marketAnalysis: {
  marketContext: {
    competitorAnalysis: [{
      competitor: "{competitor_name}",
      feature: "{their_capability}",
      ourAdvantage: "{where_we_excel}",
      theirAdvantage: "{where_they_excel}"
    }],
    marketTrends: [
      "{relevant_market_trend_1}",
      "{relevant_market_trend_2}"
    ],
    customerDemand: [{
      source: "{feedback_source}",
      feedback: "{customer_request}",
      frequency: "{how_often_requested}"
    }],
    opportunitySize: "{TAM_SAM_SOM}"
  },
  
  targetAudience: {
    primarySegment: "{main_user_segment}",
    secondarySegments: ["{other_segment}"],
    userCount: "{estimated_users}",
    characteristics: ["{user_characteristic}"],
    needs: ["{user_need}"]
  },
  
  valueProposition: {
    uniqueValue: "{what_makes_us_different}",
    differentiators: ["{key_differentiator}"],
    competitiveAdvantage: "{sustainable_advantage}"
  }
}
```

### STEP 4: SCOPE DEFINITION
```typescript
scope: {
  includedCapabilities: [{
    capability: "{capability_name}",
    description: "{what_it_does}",
    priority: "{must_have|should_have|nice_to_have}",
    featureIds: []  // Will be populated later
  }],
  
  excludedCapabilities: [
    "{explicitly_not_included_1}",
    "{explicitly_not_included_2}"
  ],
  
  deliverables: [{
    type: "{feature|platform|process|documentation}",
    name: "{deliverable_name}",
    description: "{deliverable_description}",
    acceptance: [
      "{acceptance_criterion_1}",
      "{acceptance_criterion_2}"
    ],
    owner: "{responsible_team_or_person}"
  }],
  
  constraints: [{
    type: "{time|budget|resource|technical|regulatory}",
    constraint: "{constraint_description}",
    impact: "{impact_on_epic}",
    flexibility: "{fixed|negotiable|flexible}"
  }],
  
  assumptions: [{
    assumption: "{assumption_description}",
    validation: "{how_to_validate}",
    riskIfInvalid: "{consequence_if_false}"
  }]
}
```

### STEP 5: TIMELINE & MILESTONES
```typescript
timeline: {
  startDate: "{YYYY-MM-DD}",
  targetEndDate: "{YYYY-MM-DD}",
  
  phases: [{
    name: "{phase_name}",
    startDate: "{YYYY-MM-DD}",
    endDate: "{YYYY-MM-DD}",
    deliverables: ["{deliverable}"],
    featureIds: [],
    status: "{planned|active|completed|delayed}"
  }],
  
  milestones: [{
    name: "{milestone_name}",
    date: "{YYYY-MM-DD}",
    type: "{decision|delivery|review|launch}",
    deliverables: ["{deliverable}"],
    successCriteria: ["{criterion}"],
    dependencies: ["{dependency}"],
    status: "{pending|completed|missed}"
  }],
  
  criticalPath: [{
    item: "{critical_item}",
    duration: "{time_required}",
    dependencies: ["{dependency}"],
    buffer: "{buffer_time}"
  }]
}
```

### STEP 6: RESOURCE PLANNING
```typescript
resources: {
  teamStructure: {
    executiveSponsor: "{executive_name}",
    epicOwner: "{owner_name}",
    technicalLead: "{tech_lead_name}",
    productLead: "{product_lead_name}",
    teams: [{
      name: "{team_name}",
      lead: "{team_lead}",
      memberCount: {number},
      responsibility: "{what_team_owns}"
    }]
  },
  
  resourceRequirements: [{
    role: "{role_title}",
    count: {number},
    skills: ["{required_skill}"],
    duration: "{time_period}",
    allocation: "{full_time|part_time|as_needed}",
    status: "{confirmed|requested|unavailable}"
  }],
  
  budget: {
    totalBudget: {amount},
    currency: "{USD|EUR|GBP}",
    items: [{
      category: "{personnel|infrastructure|tools|services}",
      item: "{budget_item}",
      amount: {amount},
      currency: "{currency}",
      frequency: "{one_time|monthly|quarterly|annual}",
      status: "{approved|pending|rejected}"
    }],
    contingency: {contingency_percentage}
  }
}
```

### STEP 7: ROI & BUSINESS METRICS
```typescript
businessMetrics: {
  roi: {
    investmentType: "{type_of_investment}",
    amount: {investment_amount},
    expectedReturn: {expected_return_amount},
    timeToReturn: "{time_period}",
    confidence: "{high|medium|low}",
    assumptions: ["{assumption}"]
  },
  
  keyMetrics: [{
    metric: "{metric_name}",
    current: "{current_value}",
    target: "{target_value}",
    measurement: "{how_to_measure}",
    frequency: "{measurement_frequency}",
    owner: "{who_tracks}"
  }],
  
  successCriteria: [{
    category: "{business|technical|user|operational}",
    criterion: "{success_criterion}",
    measurement: "{measurement_method}",
    target: "{target_value}",
    timeline: "{when_to_achieve}",
    owner: "{responsible_party}"
  }]
}
```

### STEP 8: STAKEHOLDER MANAGEMENT
```typescript
stakeholders: {
  groups: [{
    groupName: "{stakeholder_group}",
    representatives: [{
      name: "{person_name}",
      role: "{role}",
      email: "{email}"
    }],
    interests: ["{what_they_care_about}"],
    influenceLevel: "{high|medium|low}",
    engagementStrategy: "{how_to_engage}"
  }],
  
  racMatrix: [{
    activity: "{activity_or_decision}",
    responsible: ["{who_does_work}"],     // Multiple allowed
    accountable: "{ultimately_accountable}", // Only one
    consulted: ["{two_way_communication}"],
    informed: ["{one_way_communication}"]
  }],
  
  communicationPlan: {
    channels: [{
      channel: "{communication_channel}",
      audience: ["{audience_group}"],
      frequency: "{update_frequency}",
      owner: "{who_communicates}",
      format: "{format_type}"
    }],
    keyMessages: [{
      audience: "{target_audience}",
      message: "{key_message}",
      timing: "{when_to_communicate}"
    }]
  }
}
```

### STEP 9: RISK MANAGEMENT
```typescript
riskManagement: {
  risks: [{
    riskCategory: "{technical|business|resource|market|compliance}",
    description: "{risk_description}",
    probability: "{high|medium|low}",
    impact: "{critical|major|moderate|minor}",
    mitigationPlan: [
      "{mitigation_step_1}",
      "{mitigation_step_2}"
    ],
    owner: "{risk_owner}",
    reviewDate: "{YYYY-MM-DD}"
  }],
  
  dependencies: [{
    name: "{dependency_name}",
    type: "{internal|external|cross_team|vendor}",
    description: "{dependency_description}",
    owner: "{dependency_owner}",
    status: "{resolved|in_progress|blocked|at_risk}",
    resolution: "{how_to_resolve}",
    impactIfDelayed: "{impact_description}"
  }],
  
  contingencyPlans: [{
    scenario: "{risk_scenario}",
    trigger: "{what_triggers_plan}",
    plan: [
      "{contingency_action_1}",
      "{contingency_action_2}"
    ],
    owner: "{plan_owner}"
  }]
}
```

### STEP 10: AI CONTEXT
```typescript
aiContext: {
  epicBackground: [
    "{context_for_AI_understanding}",
    "{relevant_domain_knowledge}"
  ],
  
  domainKnowledge: [{
    concept: "{domain_concept}",
    explanation: "{clear_explanation}",
    relevance: "{why_it_matters}"
  }],
  
  automationOpportunities: [{
    process: "{process_to_automate}",
    currentState: "{manual_process}",
    automatedState: "{automated_process}",
    benefit: "{automation_benefit}",
    complexity: "{low|medium|high}"
  }],
  
  featureGenerationRules: [{
    rule: "{generation_rule}",
    rationale: "{why_this_rule}",
    exceptions: ["{exception_case}"]
  }],
  
  successPatterns: ["{pattern_from_successful_epics}"],
  failurePatterns: ["{anti_pattern_to_avoid}"]
}
```

## VALIDATION CHECKLIST

Before submitting an epic:

### STRATEGIC ALIGNMENT
- [ ] Vision statement defined (1-2 sentences)
- [ ] Mission statement clear
- [ ] Aligned with company OKRs
- [ ] Business case documented
- [ ] ROI calculated with assumptions

### MARKET READINESS
- [ ] Competitor analysis completed
- [ ] Market trends identified
- [ ] Customer demand validated
- [ ] Value proposition defined
- [ ] Target audience identified

### SCOPE CLARITY
- [ ] Capabilities prioritized (MoSCoW)
- [ ] Deliverables defined with acceptance criteria
- [ ] Out-of-scope items explicitly listed
- [ ] Constraints documented
- [ ] Assumptions validated

### RESOURCE PLANNING
- [ ] Epic owner assigned
- [ ] Team structure defined
- [ ] Resource requirements identified
- [ ] Budget approved
- [ ] Timeline realistic

### RISK MANAGEMENT
- [ ] All major risks identified
- [ ] Mitigation plans created
- [ ] Dependencies mapped
- [ ] Contingency plans ready
- [ ] Critical path identified

### STAKEHOLDER ENGAGEMENT
- [ ] All stakeholder groups identified
- [ ] RACI matrix completed
- [ ] Communication plan established
- [ ] Key messages defined
- [ ] Change management planned

## EPIC STATES

Epics progress through these states:

1. **ideation**: Initial concept, gathering requirements
2. **planning**: Detailed planning and analysis
3. **approved**: Executive approval received
4. **in_progress**: Features being developed
5. **review**: Implementation complete, under review
6. **completed**: All deliverables met
7. **cancelled**: Epic terminated
8. **on_hold**: Temporarily paused

## TEMPLATES LOCATION

All epic templates and utilities are in:
```
.agent/instructions/taskTemplates/
├── epic.types.ts           # TypeScript interfaces
├── epic-template.utils.ts  # Creation utilities
└── epic.examples.ts        # Example epics
```

## HIERARCHY

```
Epic (Strategic Initiative)
  └── Feature (Capability)
      └── Task (Development Work)
```

- **Epic**: Quarter/Year-level strategic initiatives
- **Feature**: Month-level capabilities and functionality
- **Task**: Day/Week-level development work

## ENFORCEMENT

**VIOLATIONS**: Epics not following this template will be:
1. Rejected by governance review
2. Returned for strategic alignment
3. Escalated to executive sponsor
4. Logged as non-compliant

**SUCCESS**: Epics following this template will:
1. Receive faster approval
2. Enable better resource allocation
3. Improve stakeholder communication
4. Facilitate AI-assisted planning
5. Ensure strategic alignment