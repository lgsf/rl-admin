# Flexible Group System Design

## 🎯 Overview
A flexible group system that allows creating groups both within organizations and standalone, enabling sophisticated notification targeting and team management.

## 📊 Architecture

### Core Concepts

#### 1. **Groups** - Flexible containers for users
- Can be **standalone** (cross-organizational) OR **belong to an organization**
- Have their own membership and permission system
- Primary target for notifications
- Support various types for different use cases

#### 2. **Group Types**
- **Standalone Groups** - Cross-organizational groups
  - Example: "All DevOps Engineers", "Beta Testers", "Security Team"
  - Not tied to any organization
  - Members can be from different organizations

- **Organization Groups** - Sub-groups within an organization
  - Example: "Marketing Team", "Engineering", "Management"
  - Belong to a specific organization
  - Typically members from same organization (but flexible)

- **Department Groups** - Formal organizational departments
  - Example: "HR Department", "Finance", "Sales"
  - Official company structure

- **Project Groups** - Temporary project teams
  - Example: "Project Alpha", "Q4 Launch Team"
  - Time-bound groups for specific initiatives

- **Custom Groups** - Ad-hoc groupings
  - Example: "Lunch Crew", "Book Club", "Emergency Response Team"
  - Flexible purpose groups

## 📋 Database Schema

### `groups` Table
```typescript
{
  name: string                    // Group name
  slug: string                     // URL-friendly identifier
  description?: string             // Group description
  type: "standalone" | "organization" | "department" | "project" | "custom"
  organizationId?: Id<"organizations">  // Optional - null for standalone
  parentGroupId?: Id<"groups">    // For nested groups
  visibility: "public" | "private" | "organization"
  icon?: string                    // Group icon/emoji
  color?: string                   // Group color for UI
  ownerId: Id<"users">            // Group owner
  settings: {
    allowMemberInvites?: boolean   // Can members invite others
    requireApproval?: boolean      // Require approval to join
    autoAddNewOrgMembers?: boolean // Auto-add new org members
    notificationDefaults?: {       // Default notification settings
      enabled: boolean
      types: string[]
    }
  }
  metadata?: any                   // Flexible metadata
  isActive: boolean               // Active/archived status
  expiresAt?: number              // For temporary groups
  createdAt: number
  updatedAt: number
}
```

### `groupMembers` Table
```typescript
{
  groupId: Id<"groups">
  userId: Id<"users">
  role: "owner" | "admin" | "moderator" | "member"
  joinedAt: number
  invitedBy?: Id<"users">
  status: "active" | "pending" | "suspended"
  permissions?: string[]          // Custom permissions
  notificationOverride?: {        // Override group notification settings
    enabled?: boolean
    types?: string[]
  }
}
```

### Indexes
- groups: by_organization, by_type, by_owner, by_parent, by_slug
- groupMembers: by_group, by_user, by_group_user, by_status

## 🔧 Core Functions

### Group Management
```typescript
// Create a new group
createGroup({
  name, description, type, organizationId?, visibility, settings
})

// Get user's groups (all types)
getUserGroups() -> {
  standalone: Group[]
  organization: Group[]
  all: Group[]
}

// Join/leave group
joinGroup(groupId, userId)
leaveGroup(groupId, userId)

// Manage members
addGroupMember(groupId, userId, role)
removeGroupMember(groupId, userId)
updateMemberRole(groupId, userId, newRole)

// Group hierarchy
createSubgroup(parentGroupId, groupData)
getGroupHierarchy(groupId)
```

### Notification Targeting
```typescript
// Send to a single group
notifyGroup({
  groupId,
  type,
  title,
  message,
  excludeRoles?: Role[]
})

// Send to multiple groups
notifyGroups({
  groupIds: Id<"groups">[],
  type,
  title,
  message
})

// Send to groups by type
notifyGroupsByType({
  type: GroupType,
  organizationId?: Id<"organizations">,
  notification: NotificationData
})

// Smart targeting
notifySmartGroups({
  criteria: {
    organizationId?: Id<"organizations">
    groupTypes?: GroupType[]
    memberCount?: { min?: number, max?: number }
    hasUserWithRole?: string
  },
  notification: NotificationData
})
```

## 🎨 UI Components

### Group Management UI
1. **Group List View**
   - Tabs: "My Groups", "Organization Groups", "Discover"
   - Filter by type, organization, membership
   - Search functionality

2. **Group Creation Modal**
   - Type selection (changes available options)
   - Organization selection (if applicable)
   - Privacy settings
   - Member invitation

3. **Group Details Page**
   - Member list with roles
   - Group settings (for admins)
   - Notification preferences
   - Activity feed

4. **Group Selector Component**
   - Multi-select for notification targeting
   - Grouped by type/organization
   - Quick filters

## 🔄 Migration Strategy

### From Current System
1. Convert existing organization memberships to an "All Members" group per organization
2. Convert channels to groups with type "channel"
3. Maintain backward compatibility with existing notification functions

### Benefits Over Current System
- ✅ Flexible group creation (not tied to organizations)
- ✅ Nested groups support (departments within organizations)
- ✅ Cross-organizational collaboration
- ✅ Temporary/project-based groups
- ✅ Fine-grained notification targeting
- ✅ Group-specific notification preferences
- ✅ Better permission management

## 💡 Use Cases

### 1. **Enterprise Organization**
```
ACME Corp (Organization)
├── All Members (Auto-generated group)
├── Leadership Team (Organization group)
├── Engineering (Department group)
│   ├── Frontend Team (Nested group)
│   ├── Backend Team (Nested group)
│   └── DevOps Team (Nested group)
├── Marketing (Department group)
└── Project Groups
    ├── Q1 Product Launch (Project group)
    └── Website Redesign (Project group)
```

### 2. **Cross-Organization Collaboration**
```
Beta Testers (Standalone group)
├── Members from Company A
├── Members from Company B
└── External contractors
```

### 3. **Notification Scenarios**
- **Company-wide**: Target "All Members" group of an organization
- **Department update**: Target specific department group
- **Project notification**: Target project group members
- **Cross-org announcement**: Target standalone group
- **Cascading notifications**: Target parent group with option to include subgroups

## 🚀 Implementation Plan

### Phase 1: Core Infrastructure
1. Add groups and groupMembers tables to schema
2. Create basic CRUD operations
3. Implement group membership functions

### Phase 2: Notification Integration
1. Update notification functions to use groups
2. Add group-based notification preferences
3. Implement smart targeting

### Phase 3: UI Implementation
1. Create group management pages
2. Add group selector to notification test
3. Build group member management UI

### Phase 4: Advanced Features
1. Nested groups support
2. Auto-membership rules
3. Group templates
4. Bulk operations

## 🔒 Security Considerations

### Permissions Model
```typescript
const GROUP_PERMISSIONS = {
  owner: ["*"],  // All permissions
  admin: ["manage_members", "manage_settings", "send_notifications"],
  moderator: ["manage_members", "send_notifications"],
  member: ["view", "leave"]
}
```

### Privacy Levels
- **Public**: Visible to all, anyone can join
- **Private**: Invite-only, not discoverable
- **Organization**: Visible to organization members only

### Data Access
- Users can only see groups they're members of (unless public)
- Organization admins can see all organization groups
- System admins can see all groups

## 📝 Example Notification Flow

```typescript
// Scenario: Send update to all engineering teams across the platform
const engineeringGroups = await getGroupsByType({
  type: "department",
  namePattern: "engineering|dev|tech"
});

await notifyGroups({
  groupIds: engineeringGroups.map(g => g._id),
  type: "platform_update",
  title: "New Developer Tools Available",
  message: "Check out the latest additions to our developer toolkit",
  priority: "medium"
});

// Result: All members of engineering-related groups receive notification
// respecting their individual and group-level preferences
```

## 🎯 Success Metrics

- [ ] Groups can be created standalone or within organizations
- [ ] Nested group hierarchy works correctly
- [ ] Notifications can target single or multiple groups
- [ ] Group-level notification preferences override correctly
- [ ] UI provides intuitive group management
- [ ] Performance remains optimal with large group counts
- [ ] Migration from current system is seamless

---

*Last Updated: 2025-08-09*
*Version: 1.0.0*