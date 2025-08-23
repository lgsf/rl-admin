import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * System role hierarchy for permission checking
 * Higher index = higher privilege
 */
const ROLE_HIERARCHY = ["user", "manager", "admin", "superadmin"] as const;
type SystemRole = typeof ROLE_HIERARCHY[number];

/**
 * Check if a user's role meets the minimum required role
 */
function hasMinimumRole(userRole: string, requiredRole: SystemRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as SystemRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Send notification to all users with a specific system role
 */
export const notifyBySystemRole = mutation({
  args: {
    targetRole: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("user")
    ),
    includeHigherRoles: v.optional(v.boolean()), // Include roles above target
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

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only admins and superadmins can send system-wide notifications
    if (!hasMinimumRole(currentUser.role, "admin")) {
      throw new Error("Only admins can send system-wide notifications");
    }

    // Get target users based on role
    let targetUsers = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by role
    if (args.includeHigherRoles) {
      // Include target role and all roles above it
      const targetIndex = ROLE_HIERARCHY.indexOf(args.targetRole);
      const eligibleRoles = ROLE_HIERARCHY.slice(targetIndex);
      targetUsers = targetUsers.filter(u => 
        eligibleRoles.includes(u.role as SystemRole)
      );
    } else {
      // Only exact role match
      targetUsers = targetUsers.filter(u => u.role === args.targetRole);
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      targetUsers.map(async (user) => {
        // Check user's notification preferences
        if (user.preferences?.notifications?.enabled === false) {
          return null;
        }

        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            sentToRole: args.targetRole,
            systemNotification: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    const sentCount = notifications.filter(Boolean).length;

    return {
      success: true,
      notificationsSent: sentCount,
      targetRole: args.targetRole,
      totalTargeted: targetUsers.length,
    };
  },
});

/**
 * Send notification to all users (platform-wide announcement)
 * Only superadmins can use this
 */
export const notifyAllUsers = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    excludeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only superadmins can send platform-wide announcements
    if (currentUser.role !== "superadmin") {
      throw new Error("Only superadmins can send platform-wide announcements");
    }

    // Get all users
    let users = await ctx.db.query("users").collect();

    // Exclude inactive users if specified
    if (args.excludeInactive) {
      users = users.filter(u => u.status === "active");
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      users.map(async (user) => {
        // Check user's notification preferences
        if (user.preferences?.notifications?.enabled === false) {
          return null;
        }

        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            platformAnnouncement: true,
            systemNotification: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    const sentCount = notifications.filter(Boolean).length;

    return {
      success: true,
      notificationsSent: sentCount,
      totalUsers: users.length,
      announcement: true,
    };
  },
});

/**
 * Send critical system alert (bypasses notification preferences for critical severity)
 * Superadmin only
 */
export const sendSystemAlert = mutation({
  args: {
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical")
    ),
    title: v.string(),
    message: v.string(),
    targetRole: v.optional(v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("user")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "superadmin") {
      throw new Error("Only superadmins can send system alerts");
    }

    // Get target users
    let users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by role if specified
    if (args.targetRole) {
      const targetIndex = ROLE_HIERARCHY.indexOf(args.targetRole);
      const eligibleRoles = ROLE_HIERARCHY.slice(targetIndex);
      users = users.filter(u => 
        eligibleRoles.includes(u.role as SystemRole)
      );
    }

    // For critical alerts, bypass notification preferences
    const bypassPreferences = args.severity === "critical";
    
    const notifications = await Promise.all(
      users.map(async (user) => {
        // Skip if user has notifications disabled (unless critical)
        if (!bypassPreferences && user.preferences?.notifications?.enabled === false) {
          return null;
        }

        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: "system_alert",
          title: `🚨 ${args.severity.toUpperCase()}: ${args.title}`,
          message: args.message,
          data: {
            severity: args.severity,
            systemAlert: true,
            bypassPreferences,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    const sentCount = notifications.filter(Boolean).length;

    return {
      success: true,
      notificationsSent: sentCount,
      severity: args.severity,
      targetRole: args.targetRole || "all",
    };
  },
});

/**
 * Get count of users by system role
 * Admins and above can see role statistics
 */
export const getUserCountByRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Only admins can see role statistics
    if (!currentUser || !hasMinimumRole(currentUser.role, "admin")) {
      return null;
    }

    const users = await ctx.db.query("users").collect();
    
    const counts = {
      superadmin: 0,
      admin: 0,
      manager: 0,
      user: 0,
      total: users.length,
      active: 0,
      inactive: 0,
    };

    users.forEach(user => {
      if (user.role in counts) {
        counts[user.role as keyof typeof counts]++;
      }
      if (user.status === "active") {
        counts.active++;
      } else {
        counts.inactive++;
      }
    });

    return counts;
  },
});

/**
 * Test system notification (for development/testing)
 */
export const sendTestSystemNotification = mutation({
  args: {
    targetRole: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || !hasMinimumRole(currentUser.role, "admin")) {
      throw new Error("Only admins can send test notifications");
    }

    // Get users with target role
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => q.eq(q.field("role"), args.targetRole))
      .collect();

    const timestamp = new Date().toLocaleString();
    
    const notifications = await Promise.all(
      users.map(async (user) => {
        return await ctx.db.insert("notifications", {
          userId: user._id,
          type: "test_system",
          title: `Test System Notification for ${args.targetRole}s`,
          message: `This is a test notification sent to all ${args.targetRole}s at ${timestamp}`,
          data: {
            sentToRole: args.targetRole,
            systemNotification: true,
            test: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    return {
      success: true,
      notificationsSent: notifications.length,
      targetRole: args.targetRole,
      timestamp,
    };
  },
});