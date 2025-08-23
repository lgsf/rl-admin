# Implementation Plan: Groups & Notification System

## 🎯 Objective
Implement a complete groups and notification system with clear separation:
1. **System Roles** (superadmin, admin, manager, user) - Platform access control
2. **Organization Groups** - Teams/departments within organizations
3. **Notification Targeting** - Target by role, organization, or group

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
- [x] Add user relationship arrays documentation
- [x] Document system vs organization groups

#### Task 2: Create System Role Notification Functions ✅
**Subtasks:**
- [x] Create `notifyBySystemRole()` function
- [x] Add functions for each role (notifyAdmins, notifyManagers, etc.)
- [x] Add validation for role hierarchy
- [x] Create `systemNotifications.ts` with proper Convex patterns
- [x] Add `notifyAllUsers()` for platform announcements
- [x] Add `sendSystemAlert()` for critical alerts

#### Task 3: Update User Schema ✅
**Subtasks:**
- [x] Add `systemGroups[]` array to users table
- [x] Add `groups[]` array for organization groups
- [x] Add `memberships[]` array for organization links
- [x] Update user creation flow in `auth.ts`
- [x] Auto-add users to "all-users" system group on signup

#### Task 4: Create System Groups Functions ✅
**Subtasks:**
- [x] Create `systemGroups.ts` file
- [x] Add `initializeSystemGroups()` mutation
- [x] Add `checkFeatureAccess()` query
- [x] Add `getUserGroupDetails()` query
- [x] Add `addUserToSystemGroup()` mutation
- [x] Create default system groups (all-users, platform-admins, platform-managers)

#### Task 5: Create Validation Helpers (NEXT)
**Subtasks:**
- [ ] Create `convex/lib/groupHelpers.ts`
- [ ] Add `canJoinGroup()` function
- [ ] Add `canManageGroup()` function
- [ ] Add `isOrgMember()` check
- [ ] Add `hasSystemRole()` check
- [ ] Run typecheck
- [ ] Write test cases

#### Task 6: Refactor groups.ts for Organization-Only Groups
**Subtasks:**
- [ ] Remove system group logic from groups.ts
- [ ] Ensure all groups require organizationId
- [ ] Update types to match schema (department, project, custom, etc.)
- [ ] Fix TypeScript errors
- [ ] Deploy to Convex
- [ ] Test in dashboard

#### Task 5: Organization Group Functions
**Subtasks:**
- [ ] Add `createGroup()` mutation for org groups
- [ ] Add `getOrgGroups()` query
- [ ] Add membership validation (must be org member)
- [ ] Add org admin checks for management
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
- **Current Task**: Testing and Validation
- **Blockers**: None

### Completed Tasks
- [x] Architecture planning  
- [x] Schema design with relationship arrays
- [x] Update Schema Documentation (Task 1)
- [x] Create System Role Notification Functions (Task 2)
- [x] Update User Schema (Task 3)
- [x] Create System Groups Functions (Task 4)
- [x] Update user creation flow to auto-add to system groups

### Next Actions
1. Test system notifications in Convex dashboard
2. Initialize system groups via dashboard
3. Test user creation with auto-group assignment
4. Create validation helpers
5. Refactor groups.ts for org-only groups

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
1. **System roles**: superadmin, admin, manager, user (no "cashier" or "banned" roles)
2. **User relationship arrays**:
   - `systemGroups[]`: Platform-wide groups for targeting
   - `groups[]`: Organization-specific groups
   - `memberships[]`: Organization membership records
3. **Clear separation**:
   - System roles: Platform feature access control
   - System groups: Platform-wide notification targeting
   - Organization groups: Team/department grouping
4. **Auto-assignment**: Users auto-added to "all-users" system group on signup
5. **Notification targeting**: Can target by role, system group, or org group
6. **Default system groups**:
   - "all-users": Every registered user
   - "platform-admins": Superadmins and admins
   - "platform-managers": Managers and above

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