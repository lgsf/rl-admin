# Design Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Research: ALWAYS deep search ALL options
2. Analysis: ALWAYS identify exactly 3 options
3. Evaluation: ALWAYS list 3 pros and 3 cons each
4. Presentation: ALWAYS use exact template format
5. Decision: ALWAYS wait for human choice

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER present fewer than 3 options
❌ NEVER present more than 3 options
❌ NEVER make the decision yourself
❌ NEVER skip research phase
❌ NEVER omit pros or cons
❌ NEVER proceed without human approval
❌ NEVER ignore existing constraints
❌ NEVER skip cost analysis
❌ NEVER ignore security implications
❌ NEVER forget scalability analysis

### REQUIRED ACTIONS
✅ ALWAYS research exhaustively first
✅ ALWAYS present exactly 3 options
✅ ALWAYS provide 3 pros per option
✅ ALWAYS provide 3 cons per option
✅ ALWAYS analyze long-term implications
✅ ALWAYS include cost analysis
✅ ALWAYS consider team expertise
✅ ALWAYS wait for human decision
✅ ALWAYS document chosen option
✅ ALWAYS create ADR after decision

## ARCHITECTURAL DECISION TEMPLATE (USE EXACTLY)

```markdown
# Architectural Decision: {DecisionName}

## Context
**Problem:** {Clear problem statement}
**Constraints:** {List all constraints}
**Requirements:** {List all requirements}

## Research Summary
**Industry Standards:** {What most companies use}
**Best Practices:** {Recommended approaches}
**Anti-patterns:** {What to avoid}

## Options Analysis

### Option 1: {OptionName}
**Description:** {One sentence description}

**Pros:**
1. {Specific measurable advantage}
2. {Specific measurable advantage}
3. {Specific measurable advantage}

**Cons:**
1. {Specific measurable disadvantage}
2. {Specific measurable disadvantage}
3. {Specific measurable disadvantage}

**Cost Analysis:**
- Development Time: {X days/weeks}
- Learning Curve: {Low/Medium/High}
- Infrastructure: ${estimated cost}
- Maintenance: {X hours/month}

**Risk Assessment:**
- Technical Risk: {Low/Medium/High}
- Security Risk: {Low/Medium/High}
- Scalability Risk: {Low/Medium/High}

### Option 2: {OptionName}
**Description:** {One sentence description}

**Pros:**
1. {Specific measurable advantage}
2. {Specific measurable advantage}
3. {Specific measurable advantage}

**Cons:**
1. {Specific measurable disadvantage}
2. {Specific measurable disadvantage}
3. {Specific measurable disadvantage}

**Cost Analysis:**
- Development Time: {X days/weeks}
- Learning Curve: {Low/Medium/High}
- Infrastructure: ${estimated cost}
- Maintenance: {X hours/month}

**Risk Assessment:**
- Technical Risk: {Low/Medium/High}
- Security Risk: {Low/Medium/High}
- Scalability Risk: {Low/Medium/High}

### Option 3: {OptionName}
**Description:** {One sentence description}

**Pros:**
1. {Specific measurable advantage}
2. {Specific measurable advantage}
3. {Specific measurable advantage}

**Cons:**
1. {Specific measurable disadvantage}
2. {Specific measurable disadvantage}
3. {Specific measurable disadvantage}

**Cost Analysis:**
- Development Time: {X days/weeks}
- Learning Curve: {Low/Medium/High}
- Infrastructure: ${estimated cost}
- Maintenance: {X hours/month}

**Risk Assessment:**
- Technical Risk: {Low/Medium/High}
- Security Risk: {Low/Medium/High}
- Scalability Risk: {Low/Medium/High}

## Comparison Matrix

| Criteria | Option 1 | Option 2 | Option 3 |
|----------|----------|----------|----------|
| Development Speed | {Fast/Medium/Slow} | {Fast/Medium/Slow} | {Fast/Medium/Slow} |
| Scalability | {Excellent/Good/Fair} | {Excellent/Good/Fair} | {Excellent/Good/Fair} |
| Maintainability | {High/Medium/Low} | {High/Medium/Low} | {High/Medium/Low} |
| Team Expertise | {Strong/Medium/Weak} | {Strong/Medium/Weak} | {Strong/Medium/Weak} |
| Total Cost | ${amount} | ${amount} | ${amount} |

## Recommendation
**Recommended Option:** Option {X}
**Reasoning:** {2-3 sentences explaining why}

## Decision Required
**Please select one option:**
- [ ] Option 1: {OptionName}
- [ ] Option 2: {OptionName}
- [ ] Option 3: {OptionName}
```

## RESEARCH CHECKLIST (COMPLETE BEFORE PRESENTING)

Before presenting ANY architectural decision:
- [ ] Searched for industry best practices
- [ ] Found 3+ real-world implementations
- [ ] Identified common failure patterns
- [ ] Calculated development time estimates
- [ ] Assessed team skill requirements
- [ ] Estimated infrastructure costs
- [ ] Evaluated security implications
- [ ] Analyzed scalability limits
- [ ] Checked compatibility with tech stack
- [ ] Reviewed maintenance requirements

## DECISION CATEGORIES REQUIRING FULL ANALYSIS

### Category 1: Infrastructure Decisions
```
- Database selection (SQL vs NoSQL)
- Hosting platform (AWS/Azure/GCP)
- Container orchestration (K8s/ECS/etc)
- CDN selection
- Message queue selection
```

### Category 2: Architecture Patterns
```
- Microservices vs Monolith
- Event-driven vs Request-response
- CQRS implementation
- API Gateway pattern
- Service mesh adoption
```

### Category 3: Development Practices
```
- Testing strategy (unit/integration/e2e mix)
- CI/CD pipeline design
- Branching strategy
- Code review process
- Documentation approach
```

### Category 4: Data Management
```
- Caching strategy (Redis/Memcached/etc)
- Data synchronization approach
- Backup and recovery plan
- Data partitioning strategy
- Event sourcing implementation
```

### Category 5: Security Architecture
```
- Authentication method (JWT/OAuth/SAML)
- Authorization model (RBAC/ABAC)
- Secret management
- API security approach
- Data encryption strategy
```

## PROBLEM ANALYSIS TEMPLATE

```markdown
## Problem Definition
**What:** {Specific problem statement}
**Why:** {Why this needs solving}
**When:** {Timeline/urgency}
**Who:** {Stakeholders affected}
**Where:** {System areas affected}

## Current State
- {Current situation point 1}
- {Current situation point 2}
- {Current situation point 3}

## Desired State
- {Goal point 1}
- {Goal point 2}
- {Goal point 3}

## Success Criteria
1. {Measurable criteria 1}
2. {Measurable criteria 2}
3. {Measurable criteria 3}

## Constraints
- Technical: {List technical constraints}
- Business: {List business constraints}
- Time: {List time constraints}
- Budget: {List budget constraints}
```

## ADR (ARCHITECTURE DECISION RECORD) TEMPLATE

```markdown
# ADR-{Number}: {Title}

## Status
{Proposed | Accepted | Deprecated | Superseded}

## Context
{Problem description and background}

## Decision
{The decision that was made}

## Consequences

### Positive
- {Positive consequence 1}
- {Positive consequence 2}
- {Positive consequence 3}

### Negative
- {Negative consequence 1}
- {Negative consequence 2}
- {Negative consequence 3}

## Options Considered
1. {Option 1} - Rejected because {reason}
2. {Option 2} - Rejected because {reason}
3. {Option 3} - **Selected**

## Implementation Plan
1. {Step 1 with timeline}
2. {Step 2 with timeline}
3. {Step 3 with timeline}

## Review Date
{Date to review this decision}
```

## SYSTEM DESIGN DIAGRAM REQUIREMENTS

For EVERY architectural decision, include:

### Component Diagram
```
┌─────────────┐     ┌─────────────┐
│ Component A │────▶│ Component B │
└─────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────┐
│ Component C │     │ Component D │
└─────────────┘     └─────────────┘
```

### Data Flow Diagram
```
[User] ──▶ [API Gateway] ──▶ [Service] ──▶ [Database]
              │                  │
              ▼                  ▼
         [Auth Service]     [Cache Layer]
```

### Sequence Diagram
```
User        API         Service     Database
  │          │            │           │
  ├─Request─▶│            │           │
  │          ├─Validate──▶│           │
  │          │            ├─Query────▶│
  │          │            │◀──Result──┤
  │          │◀──Response─┤           │
  │◀─Result──┤            │           │
```

## EXECUTION SEQUENCE FOR DESIGN DECISIONS

1. **Receive requirement** from human
2. **Analyze problem** using template
3. **Research exhaustively** (minimum 30 minutes)
4. **Identify exactly 3 options**
5. **Calculate costs** for each option
6. **Assess risks** for each option
7. **Create comparison matrix**
8. **Present using template**
9. **Wait for human decision**
10. **Document in ADR** after decision

## QUALITY METRICS FOR OPTIONS

Each option MUST be evaluated on:
- **Performance**: Requests/second, latency
- **Scalability**: Max users, growth potential
- **Reliability**: Uptime %, failure recovery
- **Maintainability**: Code complexity, documentation
- **Security**: Attack surface, compliance
- **Cost**: Initial + ongoing expenses
- **Time to Market**: Development weeks
- **Team Fit**: Required expertise level

## COMMON ANTIPATTERNS TO AVOID

```markdown
// ❌ NEVER DO THIS
"I recommend using PostgreSQL for the database."
// No options presented, no analysis

"We could use either MySQL or PostgreSQL."
// Only 2 options, no detailed analysis

"Option 1 is clearly the best choice, so I'll proceed with it."
// Making decision without human input

// ✅ ALWAYS DO THIS
"After researching database options for our high-write-volume application,
I've identified 3 viable options: PostgreSQL, MongoDB, and DynamoDB.
[Full analysis with template follows...]
Please select which option you prefer."
```

## DECISION URGENCY CLASSIFICATION

### Immediate (< 1 day)
- Security vulnerabilities
- Production outages
- Data loss prevention

### Short-term (1-7 days)
- Performance degradation
- Integration deadlines
- Sprint commitments

### Medium-term (1-4 weeks)
- New feature architecture
- Refactoring decisions
- Tool adoption

### Long-term (> 1 month)
- Platform migrations
- Major architecture changes
- Strategic technology shifts