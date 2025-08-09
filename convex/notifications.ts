import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Create a new notification
 * This is the main function for creating notifications
 */
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create the notification
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      data: args.data,
      read: false,
      createdAt: Date.now(),
    });

    // TODO: Trigger email/push delivery based on user preferences
    // This will be implemented when we add email/push services

    return {
      success: true,
      notificationId,
    };
  },
});

/**
 * Get notifications for the current user
 * Supports pagination and filtering
 */
export const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    unreadOnly: v.optional(v.boolean()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        notifications: [],
        nextCursor: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return {
        notifications: [],
        nextCursor: null,
      };
    }

    const limit = args.limit ?? 20;

    // Build query
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    // Apply filters
    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("read"), false));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    // Get notifications
    const notifications = await query
      .order("desc")
      .take(limit + 1); // Take one extra to determine if there are more

    // Determine if there are more results
    const hasMore = notifications.length > limit;
    const paginatedNotifications = hasMore 
      ? notifications.slice(0, limit)
      : notifications;

    // Get next cursor (last notification ID if there are more)
    const nextCursor = hasMore 
      ? paginatedNotifications[paginatedNotifications.length - 1]._id
      : null;

    return {
      notifications: paginatedNotifications,
      nextCursor,
    };
  },
});

/**
 * Get unread notification count for the current user
 * Used for badge display
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the notification
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Check if notification belongs to user
    if (notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Mark as read if not already
    if (!notification.read) {
      await ctx.db.patch(args.notificationId, {
        read: true,
        readAt: Date.now(),
      });
    }

    return {
      success: true,
    };
  },
});

/**
 * Mark all notifications as read for the current user
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all unread notifications
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // Mark all as read
    const now = Date.now();
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          read: true,
          readAt: now,
        })
      )
    );

    return {
      success: true,
      count: unreadNotifications.length,
    };
  },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the notification
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Check if notification belongs to user
    if (notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Delete the notification
    await ctx.db.delete(args.notificationId);

    return {
      success: true,
    };
  },
});

/**
 * Clear all notifications for the current user
 */
export const clearAllNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all user notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Delete all notifications
    await Promise.all(
      notifications.map((notification) =>
        ctx.db.delete(notification._id)
      )
    );

    return {
      success: true,
      count: notifications.length,
    };
  },
});

/**
 * Send a test notification (for testing purposes)
 */
export const sendTestNotification = mutation({
  args: {
    type: v.optional(v.string()),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Create a test notification
    const notificationId = await ctx.db.insert("notifications", {
      userId: user._id,
      type: args.type || "test",
      title: args.title || "Test Notification",
      message: args.message || `This is a test notification sent at ${new Date().toLocaleString()}`,
      read: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      notificationId,
      message: "Test notification sent successfully",
    };
  },
});