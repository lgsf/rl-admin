# Development Tracker

This directory tracks development progress, architectural decisions, and complex implementations to help Claude Code maintain context across sessions.

## Structure

```
development-tracker/
├── progress.log           # Automated progress logging
├── summary.md            # High-level progress summary
├── decisions/            # Architectural decision records (ADRs)
├── implementations/      # Complex implementation details
└── migration-progress/   # Component migration tracking
```

## Usage

### Architectural Decision Records (ADRs)
Document important architectural decisions using the ADR format:
- **Title**: Brief description
- **Status**: Proposed/Accepted/Deprecated
- **Context**: Why this decision is needed
- **Decision**: What we decided
- **Consequences**: What happens as a result

### Implementation Tracking
For complex features, create detailed implementation docs:
- Problem statement
- Solution approach
- Implementation steps
- Testing strategy
- Rollout plan

### Migration Progress
Track component-by-component migration from sms-core-ui-2 to shadcn/ui:
- Component name
- Status (Not Started/In Progress/Completed)
- Mapping notes
- Breaking changes
- Testing status

## Best Practices
1. Update tracking files after significant changes
2. Include code examples for complex implementations
3. Reference commit hashes for traceability
4. Keep summaries concise but informative
5. Review and clean up outdated information regularly