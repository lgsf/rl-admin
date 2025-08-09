import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Get all users in an organization
 */
export const getUsersInOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Get all memberships for this organization
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Get user details for each membership
    const users = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return user ? {
          ...user,
          membershipRole: membership.role,
        } : null;
      })
    );

    return users.filter(Boolean);
  },
});

/**
 * Get users by role in an organization
 */
export const getUsersByRole = query({
  args: {
    organizationId: v.id("organizations"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // Get memberships with specific role
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();

    // Get user details
    const users = await Promise.all(
      memberships.map(async (membership) => {
        return await ctx.db.get(membership.userId);
      })
    );

    return users.filter(Boolean);
  },
});

/**
 * Get users in a specific channel
 */
export const getUsersInChannel = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    // Get all channel members
    const channelMembers = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    // Get user details
    const users = await Promise.all(
      channelMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return user ? {
          ...user,
          channelRole: member.role,
        } : null;
      })
    );

    return users.filter(Boolean);
  },
});

/**
 * Send notification to all users in an organization
 */
export const notifyOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    excludeRoles: v.optional(v.array(v.string())),
    includeOnlyRoles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get all memberships for this organization
    let memberships = await ctx.db
      .query("memberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Filter by roles if specified
    if (args.includeOnlyRoles && args.includeOnlyRoles.length > 0) {
      memberships = memberships.filter(m => 
        args.includeOnlyRoles?.includes(m.role)
      );
    } else if (args.excludeRoles && args.excludeRoles.length > 0) {
      memberships = memberships.filter(m => 
        !args.excludeRoles?.includes(m.role)
      );
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user) return null;

        return await ctx.db.insert("notifications", {
          userId: membership.userId,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            organizationId: args.organizationId,
            sentToGroup: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.filter(Boolean).length,
      totalMembers: memberships.length,
    };
  },
});

/**
 * Send notification to all users with a specific role
 */
export const notifyByRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get memberships with specific role
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();

    // Create notifications for each user
    const notifications = await Promise.all(
      memberships.map(async (membership) => {
        return await ctx.db.insert("notifications", {
          userId: membership.userId,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            organizationId: args.organizationId,
            targetRole: args.role,
            sentToGroup: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.length,
      targetRole: args.role,
    };
  },
});

/**
 * Send notification to all users in a channel
 */
export const notifyChannel = mutation({
  args: {
    channelId: v.id("channels"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    excludeSender: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get channel details
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Get all channel members
    let channelMembers = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    // Exclude sender if specified
    if (args.excludeSender) {
      channelMembers = channelMembers.filter(m => m.userId !== currentUser._id);
    }

    // Create notifications for each member
    const notifications = await Promise.all(
      channelMembers.map(async (member) => {
        return await ctx.db.insert("notifications", {
          userId: member.userId,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            channelId: args.channelId,
            channelName: channel.name,
            sentToGroup: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.length,
      channelName: channel.name,
    };
  },
});

/**
 * Send notification to multiple specific users
 */
export const notifyUsers = mutation({
  args: {
    userIds: v.array(v.id("users")),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify all users exist
    const users = await Promise.all(
      args.userIds.map(userId => ctx.db.get(userId))
    );

    const validUsers = users.filter(Boolean);
    if (validUsers.length === 0) {
      throw new Error("No valid users found");
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      validUsers.map(async (user) => {
        if (!user) return null;
        
        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            sentToGroup: true,
            batchNotification: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.filter(Boolean).length,
      totalTargeted: args.userIds.length,
    };
  },
});

/**
 * Send notification to users by their system role (not membership role)
 */
export const notifyBySystemRole = mutation({
  args: {
    systemRole: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("user")
    ),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get users with specific system role
    let query = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.systemRole));

    // Filter by organization if specified
    if (args.organizationId) {
      query = query.filter((q) => 
        q.eq(q.field("organizationId"), args.organizationId)
      );
    }

    const users = await query.collect();

    // Create notifications for each user
    const notifications = await Promise.all(
      users.map(async (user) => {
        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            targetSystemRole: args.systemRole,
            sentToGroup: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.length,
      targetRole: args.systemRole,
    };
  },
});

/**
 * Get current user's organizations and channels for UI selection
 */
export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        organizations: [],
        channels: [],
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return {
        organizations: [],
        channels: [],
      };
    }

    // Get user's organizations
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return org ? {
          ...org,
          userRole: membership.role,
        } : null;
      })
    );

    // Get user's channels
    const channelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const channels = await Promise.all(
      channelMemberships.map(async (membership) => {
        const channel = await ctx.db.get(membership.channelId);
        return channel ? {
          ...channel,
          userRole: membership.role,
        } : null;
      })
    );

    return {
      organizations: organizations.filter(Boolean),
      channels: channels.filter(Boolean),
    };
  },
});