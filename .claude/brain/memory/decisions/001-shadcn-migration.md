# ADR-001: Migrate from sms-core-ui-2 to shadcn/ui

**Status**: Proposed  
**Date**: 2025-01-04  
**Decision Makers**: Development Team

## Context

The current UI implementation uses `sms-core-ui-2` as the primary component library. While functional, this approach has limitations:
- Limited customization options
- Dependency on external library updates
- Larger bundle size (~300KB)
- Less control over component behavior

## Decision

Migrate UI components from `sms-core-ui-2` to `shadcn/ui` following a phased approach.

### Why shadcn/ui?
1. **Copy-paste approach**: Full control over component code
2. **Smaller bundle**: ~150KB vs 300KB
3. **Built on Radix UI**: Excellent accessibility
4. **Tailwind CSS**: Matches our existing styling approach
5. **TypeScript first**: Better type safety
6. **Customizable**: Can modify any component directly

## Implementation Strategy

### Phase 1: Foundation (Week 1)
- Set up shadcn/ui CLI and configuration
- Install Radix UI dependencies
- Create component directory structure
- Migrate base components (Button, Input, Card)

### Phase 2: Core Components (Week 2-3)
- Migrate authentication-related components
- Convert layout components (Header, Sidebar)
- Update form components
- Implement loading states

### Phase 3: Complex Components (Week 4-5)
- Data tables and grids
- Modal/Dialog components
- Navigation components
- Error boundaries

### Phase 4: Cleanup (Week 6)
- Remove sms-core-ui-2 dependency
- Update all imports
- Comprehensive testing
- Performance validation

## Consequences

### Positive
- Full control over UI components
- Reduced bundle size
- Better performance
- Easier customization
- No external dependency for UI

### Negative
- Initial migration effort required
- Need to maintain component code
- Team learning curve for new patterns
- Potential bugs during migration

### Neutral
- Different component API (requires updates)
- New styling patterns to follow
- Documentation needs updating

## Migration Tracking

Track progress in: `.claude/development-tracker/migration-progress/`

## Rollback Plan

If issues arise:
1. Components can be migrated individually
2. Both libraries can coexist during transition
3. Git history preserves original implementation
4. Feature flags can control component usage