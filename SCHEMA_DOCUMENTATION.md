# RL Admin Database Schema Documentation

## Overview
This document provides a comprehensive overview of the database schema for the RL Admin application, with clear separation between system roles, organization memberships, and group management.

## Entity Relationship Diagram

```
Users ──┬── Memberships ──── Organizations
        ├── GroupMembers ──── Groups (Org Groups or System Groups)
        ├── Tasks ──── Projects
        ├── Messages ──── Channels ──── ChannelMembers
        ├── Notifications
        ├── AuditLogs
        ├── Sessions
        └── Files
```

## Architecture Overview

### Three-Level Access Control
1. **System Roles** (`users.role`) - Platform-wide feature access
2. **Organization Memberships** (`memberships`) - Organization-specific permissions
3. **Groups** (`groups` + `groupMembers`) - Flexible grouping for notifications

## Core Entities

### 1. Users
**Purpose**: Store user account information synced with Clerk authentication
**Key Fields**:
- `clerkId`: Unique identifier from Clerk
- `role`: System-wide role (superadmin, admin, manager, user)
- `status`: Account status (active, inactive, invited, suspended)
- `organizationId`: Optional link to primary organization
- `preferences`: User settings including appearance and notifications

**System Role Permissions**:
- `superadmin`: Full platform control, access all organizations
- `admin`: Admin panel access, manage own organizations
- `manager`: Team management, moderate features
- `user`: Basic features only

### 2. Organizations
**Purpose**: Multi-tenant support, allowing multiple companies/teams to use the platform
**Key Fields**:
- `name`, `slug`: Organization identifiers
- `ownerId`: Link to the user who owns the organization
- `plan`: Subscription tier (free, starter, pro, enterprise)
- `settings`: Organization-wide settings

### 3. Memberships
**Purpose**: Link users to organizations with specific roles
**Key Fields**:
- `userId`: Reference to users table
- `organizationId`: Reference to organizations table
- `role`: Organization-specific role (owner, admin, member, viewer)
**Note**: This is different from the user's system role

### 4. Groups
**Purpose**: Flexible grouping system for notification targeting and team organization

**Two Types**:

#### Organization Groups
- `organizationId`: Required (links to organization)
- `type`: 'organization', 'department', 'project', 'team', 'custom'
- **Access**: Only organization members can join
- **Management**: Organization admins/owners can create
- **Examples**: "Engineering Team", "Marketing", "Project Alpha"

#### System Groups
- `organizationId`: null (platform-wide)
- `type`: 'system', 'announcement', 'community'
- **Access**: Based on system role or public
- **Management**: Only superadmins can create
- **Examples**: "All Users", "Platform Admins", "Feature Updates"

**Common Fields**:
- `visibility`: public, private, organization
- `ownerId`: User who created/owns the group
- `settings`: Group-specific settings including notification defaults
- `isActive`: Soft delete flag

### 5. GroupMembers
**Purpose**: Link users to groups with specific roles
**Key Fields**:
- `groupId`: Reference to groups table
- `userId`: Reference to users table
- `role`: Group-specific role (owner, admin, moderator, member)
- `status`: Membership status (active, pending, suspended)
- `notificationOverride`: User's personal notification preferences for this group

## Notification System Entities

### 6. Notifications
**Purpose**: Store in-app notifications for users
**Key Fields**:
- `userId`: Recipient user
- `type`: Notification category
- `title`, `message`: Notification content
- `read`, `readAt`: Read status tracking
- `data`: Additional metadata (can include groupId, organizationId, etc.)

## Communication Entities

### 7. Channels
**Purpose**: Chat/communication channels within organizations
**Key Fields**:
- `organizationId`: Organization this channel belongs to
- `type`: public, private, direct
- `createdBy`: User who created the channel

### 8. ChannelMembers
**Purpose**: Track channel membership and roles
**Key Fields**:
- `channelId`, `userId`: Channel-user relationship
- `role`: owner, admin, member
- `lastReadAt`: For unread message tracking

### 9. Messages
**Purpose**: Store chat messages
**Key Fields**:
- `channelId`: Channel the message belongs to
- `senderId`: User who sent the message
- `replyToId`: For threaded conversations
- `reactions`: Array of emoji reactions

## Task Management

### 10. Tasks
**Purpose**: Task/todo management within organizations
**Key Fields**:
- `organizationId`: Organization context
- `projectId`: Optional project grouping
- `assigneeId`: Assigned user
- `status`: todo, in_progress, done, canceled, backlog
- `priority`: low, medium, high, urgent

### 11. Projects
**Purpose**: Group related tasks
**Key Fields**:
- `organizationId`: Organization context
- `ownerId`: Project owner
- `status`: active, archived, completed

## Application Management

### 12. Applications
**Purpose**: Third-party integrations and apps
**Key Fields**:
- `organizationId`: Organization that installed the app
- `developerId`: User who developed the app
- `status`: active, maintenance, deprecated, beta
- `permissions`: Required permissions array

## Analytics & Monitoring

### 13. DashboardMetrics
**Purpose**: Store aggregated metrics for dashboard displays
**Key Fields**:
- `organizationId`: Organization context
- `date`, `period`: Time tracking
- Revenue, subscription, and user metrics

### 14. AuditLogs
**Purpose**: Track all significant actions for compliance
**Key Fields**:
- `organizationId`, `userId`: Who did what
- `action`, `resource`: What was done
- `changes`: What was modified

### 15. Sessions
**Purpose**: Track user sessions for security
**Key Fields**:
- `userId`: Session owner
- `token`: Session identifier
- `expiresAt`: Session expiration

### 16. Files
**Purpose**: Track uploaded files
**Key Fields**:
- `organizationId`: Organization context
- `uploadedBy`: Uploader
- `parentType`, `parentId`: What the file is attached to

## Key Relationships

### Platform Structure
```
Platform (RL Admin)
├── System Groups (platform-wide)
│   ├── "All Users" - automatic for all users
│   ├── "Platform Admins" - admins/superadmins only
│   └── Custom system groups
│
└── Organizations (companies using platform)
    ├── Memberships (users with org roles)
    ├── Organization Groups (teams, projects, etc.)
    ├── Channels (communication)
    ├── Tasks & Projects
    └── Applications
```

### Access Control Flow
```
1. System Role Check → Platform features
2. Organization Membership → Org resources
3. Group Membership → Notification targeting
```

### Notification Targeting Hierarchy
```
System Groups → Organization → Organization Groups → Individual Users
(Can target at any level based on requirements)
```

## Important Design Decisions

1. **Three-Level Access Control**: 
   - System roles control platform features
   - Organization roles control org resources
   - Group roles control group management
   - Each level has clear boundaries and purposes

2. **Clear Group Separation**:
   - **Organization Groups**: Require org membership, managed by org admins
   - **System Groups**: Platform-wide, managed by superadmins
   - Groups are flexible - organizations define their own structure

3. **Flexible Notification Targeting**:
   - System groups for platform announcements
   - Organization groups for team/project notifications
   - User preferences can override group defaults
   - Multiple targeting options for flexibility

4. **Membership Validation**:
   - Organization groups require active org membership
   - System groups may have role requirements
   - Proper permission checks at each level

## Usage Examples

### Notification Targeting Examples
```typescript
// 1. Platform-wide announcement
notifyGroup("system-all-users")

// 2. Notify all platform admins
notifyBySystemRole(["admin", "superadmin"])

// 3. Notify entire organization
notifyOrganization("org-id")

// 4. Notify specific team in organization
notifyGroup("org-engineering-team-id")

// 5. Combined targeting
notifyOrgAdmins("org-id") // Admins within specific org
```

### Group Access Examples
```typescript
// User joining organization group
1. Check user has organization membership
2. Check group allows new members
3. Add to groupMembers table

// User joining system group
1. Check user meets role requirements
2. Check group is public or user is invited
3. Add to groupMembers table
```

### Organization Structure Example
```
Acme Corp (Organization)
├── Members (via Memberships)
│   ├── Alice (owner)
│   ├── Bob (admin)
│   └── Charlie (member)
└── Groups (Organization Groups)
    ├── "Engineering Team" (type: team)
    ├── "Marketing" (type: department)
    └── "Q4 Launch" (type: project)

Platform Level (System Groups)
├── "All Users" (automatic)
├── "Platform Admins" (role-based)
└── "Beta Features" (opt-in)
```

## Migration & Maintenance Notes

- Groups table has `isActive` for soft deletes
- All timestamps use Unix milliseconds (Date.now())
- Indexes are optimized for common query patterns
- Consider archiving old notifications, messages, and audit logs

---

Last Updated: 2025-08-09
Version: 2.0.0 - Simplified Architecture