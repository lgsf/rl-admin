import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk authentication
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    urls: v.optional(v.array(v.object({
      value: v.string(),
      label: v.optional(v.string()),
    }))),
    lastUsernameChange: v.optional(v.number()), // Track username change for 30-day limit
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("user")
    ),
    // Relationship arrays for tracking memberships
    systemGroups: v.optional(v.array(v.id("groups"))), // Platform-wide system groups
    groups: v.optional(v.array(v.id("groups"))), // Organization-specific groups
    memberships: v.optional(v.array(v.id("memberships"))), // Organization memberships
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("invited"),
      v.literal("suspended")
    ),
    organizationId: v.optional(v.id("organizations")),
    dateOfBirth: v.optional(v.number()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      font: v.optional(v.string()),
      language: v.optional(v.string()),
      appearanceLastSync: v.optional(v.number()),
      // Notification preferences
      notifications: v.optional(v.object({
        enabled: v.optional(v.boolean()),
        // In-app notification settings
        inApp: v.optional(v.object({
          enabled: v.optional(v.boolean()),
          type: v.optional(v.union(
            v.literal("all"),
            v.literal("mentions"),
            v.literal("none")
          )),
          playSound: v.optional(v.boolean()),
          showDesktop: v.optional(v.boolean()),
        })),
        // Email notification settings
        email: v.optional(v.object({
          enabled: v.optional(v.boolean()),
          communication: v.optional(v.boolean()),
          marketing: v.optional(v.boolean()),
          social: v.optional(v.boolean()),
          security: v.optional(v.boolean()),
        })),
        // Push notification settings
        push: v.optional(v.object({
          enabled: v.optional(v.boolean()),
          subscription: v.optional(v.any()), // Web Push subscription object
        })),
        // Mobile settings
        mobile: v.optional(v.boolean()),
      })),
    })),
    lastSeenAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"]),

  // Organizations for multi-tenant support
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    ownerId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    settings: v.optional(v.object({
      allowInvites: v.optional(v.boolean()),
      maxUsers: v.optional(v.number()),
      features: v.optional(v.array(v.string())),
    })),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  // Organization memberships
  memberships: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_org", ["userId", "organizationId"]),

  // Tasks management
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in progress"),
      v.literal("done"),
      v.literal("canceled"),
      v.literal("backlog")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    label: v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("documentation"),
      v.literal("enhancement")
    ),
    assigneeId: v.optional(v.id("users")),
    organizationId: v.id("organizations"),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_assignee", ["assigneeId"])
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_org_status", ["organizationId", "status"]),

  // Projects for grouping tasks
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    organizationId: v.id("organizations"),
    ownerId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_owner", ["ownerId"]),

  // Chat channels
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("direct")
    ),
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
    recipientId: v.optional(v.id("users")), // For direct messages
    isSystemChannel: v.optional(v.boolean()), // For admin/system-wide channels
    avatar: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_type", ["type"]),

  // Channel members
  channelMembers: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"])
    .index("by_channel_user", ["channelId", "userId"]),

  // Messages
  messages: defineTable({
    content: v.string(),
    channelId: v.id("channels"),
    senderId: v.id("users"),
    replyToId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.string())),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.id("users"),
      createdAt: v.number(),
    }))),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_sender", ["senderId"])
    .index("by_channel_time", ["channelId", "createdAt"]),

  // Applications catalog
  applications: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    category: v.string(),
    version: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("deprecated"),
      v.literal("beta")
    ),
    organizationId: v.id("organizations"),
    developerId: v.id("users"),
    url: v.optional(v.string()),
    permissions: v.array(v.string()),
    config: v.optional(v.any()),
    installCount: v.optional(v.number()),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_developer", ["developerId"])
    .index("by_featured", ["featured"]),

  // Dashboard metrics
  dashboardMetrics: defineTable({
    organizationId: v.id("organizations"),
    date: v.string(), // YYYY-MM-DD format
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    revenue: v.number(),
    subscriptions: v.number(),
    sales: v.number(),
    activeUsers: v.number(),
    newUsers: v.number(),
    churnRate: v.optional(v.number()),
    averageOrderValue: v.optional(v.number()),
    conversionRate: v.optional(v.number()),
    chartData: v.optional(v.array(v.object({
      name: v.string(),
      value: v.number(),
      date: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_date", ["date"])
    .index("by_org_date", ["organizationId", "date"])
    .index("by_period", ["period"]),

  // Audit logs for compliance
  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_resource", ["resource"])
    .index("by_org_time", ["organizationId", "createdAt"]),

  // User sessions for tracking
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    lastActivityAt: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"])
    .index("by_expires", ["expiresAt"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_created", ["createdAt"]),

  // File storage references
  files: defineTable({
    storageId: v.string(), // Convex storage ID
    name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
    organizationId: v.id("organizations"),
    parentType: v.optional(v.string()), // e.g., "task", "message", "user"
    parentId: v.optional(v.string()),
    url: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_uploader", ["uploadedBy"])
    .index("by_parent", ["parentType", "parentId"]),

  // Flexible groups system - can be standalone or within organizations
  groups: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly identifier
    description: v.optional(v.string()),
    type: v.union(
      v.literal("standalone"),
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    ),
    organizationId: v.optional(v.id("organizations")), // Optional - null for standalone groups
    parentGroupId: v.optional(v.id("groups")), // For nested groups
    visibility: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("organization")
    ),
    icon: v.optional(v.string()), // Group icon/emoji
    color: v.optional(v.string()), // Group color for UI
    ownerId: v.id("users"),
    settings: v.optional(v.object({
      allowMemberInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      autoAddNewOrgMembers: v.optional(v.boolean()),
      notificationDefaults: v.optional(v.object({
        enabled: v.boolean(),
        types: v.optional(v.array(v.string())),
      })),
    })),
    metadata: v.optional(v.any()),
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()), // For temporary/project groups
    memberCount: v.optional(v.number()), // Cached member count for performance
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_type", ["type"])
    .index("by_owner", ["ownerId"])
    .index("by_parent", ["parentGroupId"])
    .index("by_slug", ["slug"])
    .index("by_visibility", ["visibility"])
    .index("by_active", ["isActive"]),

  // Group membership table
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("moderator"),
      v.literal("member")
    ),
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("suspended")
    ),
    permissions: v.optional(v.array(v.string())), // Custom permissions
    notificationOverride: v.optional(v.object({
      enabled: v.optional(v.boolean()),
      types: v.optional(v.array(v.string())),
    })),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"])
    .index("by_status", ["status"])
    .index("by_group_status", ["groupId", "status"])
    .index("by_user_status", ["userId", "status"]),
});