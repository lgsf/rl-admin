# Implementation Plan: Groups & Notification System

## 🎯 Objective
Implement a complete groups and notification system with proper separation between system roles, organization memberships, and flexible group management.

## 📋 Task Template Pattern
Each major task follows this pattern:
1. **Plan** - Define what needs to be done
2. **Implement** - Write the code
3. **Lint** - Run `npm run lint` and fix issues
4. **Typecheck** - Run `npx tsc --noEmit` and fix type errors
5. **Test** - Verify functionality works
6. **Document** - Update relevant documentation

## 🔄 Implementation Workflow

### Phase 1: Backend Foundation
#### Task 1: Update Schema Documentation ✅
**Subtasks:**
- [x] Review current schema
- [x] Document simplified architecture
- [x] Define clear separation of concerns
- [x] Update SCHEMA_DOCUMENTATION.md
- [x] Run lint check
- [ ] Commit changes

#### Task 2: Fix groups.ts Backend
**Subtasks:**
- [ ] Fix TypeScript errors in groups.ts
- [ ] Ensure schema compatibility
- [ ] Add proper type definitions
- [ ] Run `npx convex dev --once` to verify
- [ ] Run lint and typecheck
- [ ] Test with Convex dashboard

#### Task 3: Create Validation Helpers
**Subtasks:**
- [ ] Create `convex/lib/groupHelpers.ts`
- [ ] Add `canJoinGroup()` function
- [ ] Add `canManageGroup()` function
- [ ] Add `isOrgMember()` check
- [ ] Add `hasSystemRole()` check
- [ ] Run typecheck
- [ ] Write test cases

#### Task 4: System Group Functions
**Subtasks:**
- [ ] Add `createSystemGroup()` mutation
- [ ] Add `getSystemGroups()` query
- [ ] Add superadmin validation
- [ ] Add auto-membership rules
- [ ] Deploy to Convex
- [ ] Test in dashboard

#### Task 5: Organization Group Functions
**Subtasks:**
- [ ] Add `createOrgGroup()` mutation
- [ ] Add `getOrgGroups()` query
- [ ] Add membership validation
- [ ] Add org admin checks
- [ ] Deploy to Convex
- [ ] Test in dashboard

### Phase 2: Frontend UI
#### Task 6: Groups Management UI
**Subtasks:**
- [ ] Create `/settings/groups` route
- [ ] Follow ContentSection pattern
- [ ] Create GroupsList component
- [ ] Create CreateGroupForm
- [ ] Add join/leave functionality
- [ ] Run lint and typecheck
- [ ] Test UI interactions

#### Task 7: Update Notification Test UI
**Subtasks:**
- [ ] Add group selector component
- [ ] Fetch available groups
- [ ] Show system vs org groups
- [ ] Test notification sending
- [ ] Verify permissions
- [ ] Run lint check

### Phase 3: Notification Features
#### Task 8: Notification Bell Component
**Subtasks:**
- [ ] Create NotificationBell component
- [ ] Add unread count query
- [ ] Add real-time subscription
- [ ] Style with existing UI patterns
- [ ] Add to main layout
- [ ] Test real-time updates

#### Task 9: Notification Dropdown
**Subtasks:**
- [ ] Create NotificationDropdown component
- [ ] Add notification list
- [ ] Add mark as read functionality
- [ ] Add clear all option
- [ ] Style consistently
- [ ] Test interactions

#### Task 10: Real-time Subscriptions
**Subtasks:**
- [ ] Implement useQuery subscriptions
- [ ] Add optimistic updates
- [ ] Handle connection errors
- [ ] Add loading states
- [ ] Test real-time sync
- [ ] Verify performance

### Phase 4: Integration & Testing
#### Task 11: End-to-End Testing
**Subtasks:**
- [ ] Test group creation flow
- [ ] Test membership validation
- [ ] Test notification delivery
- [ ] Test permission checks
- [ ] Test error handling
- [ ] Document test results

#### Task 12: Documentation
**Subtasks:**
- [ ] Update CLAUDE.md
- [ ] Update SCHEMA_DOCUMENTATION.md
- [ ] Create user guide
- [ ] Document API endpoints
- [ ] Add code comments
- [ ] Update README if needed

## 🛠️ Commands Reference

### Development Commands
```bash
# Start development
npm run dev

# Convex development
npx convex dev          # Watch mode
npx convex dev --once   # Single deploy
npx convex dashboard    # Open dashboard

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix lint issues
npx tsc --noEmit       # TypeScript check
npm run format         # Prettier format

# Testing
npm run test           # Run tests
npx convex run         # Run Convex function
```

### Convex Best Practices
1. Always use `v` validators for arguments
2. Check authentication with `ctx.auth.getUserIdentity()`
3. Use indexes for queries
4. Handle errors gracefully
5. Keep functions small and focused

### UI Pattern Checklist
- [ ] Use ContentSection wrapper
- [ ] Follow existing form patterns
- [ ] Use shadcn/ui components
- [ ] Maintain consistent spacing
- [ ] Add loading states
- [ ] Handle errors with toast
- [ ] Include proper TypeScript types

## 📊 Progress Tracking

### Current Status
- **Phase**: 1 - Backend Foundation
- **Current Task**: Fix groups.ts Backend
- **Blockers**: None

### Completed Tasks
- [x] Architecture planning
- [x] Schema design
- [x] Update Schema Documentation (Task 1)

### Next Actions
1. Fix groups.ts TypeScript errors (IN PROGRESS)
2. Create validation helpers
3. Add system group management functions

## 🔍 Quality Checklist
Before marking any task complete:
- [ ] Code compiles without errors
- [ ] Lint passes
- [ ] TypeScript check passes
- [ ] Feature works as expected
- [ ] Error cases handled
- [ ] Documentation updated
- [ ] Changes committed

## 📝 Notes & Decisions

### Key Decisions Made
1. Simplified to 4 system roles (no cashier)
2. Groups are flexible - orgs define their own
3. Clear separation: system roles vs org membership vs groups
4. System groups for platform-wide notifications
5. Organization groups require membership

### Open Questions
1. Should org members auto-join certain groups?
2. How many system groups do we need initially?
3. Should group creators become owners automatically?

## 🚀 Success Criteria
- [ ] Groups can be created and managed
- [ ] Proper permission validation
- [ ] Notifications can target groups
- [ ] Real-time updates work
- [ ] UI is intuitive and consistent
- [ ] All tests pass
- [ ] Documentation is complete

---

*Last Updated: 2025-08-09*
*Version: 1.0.0*