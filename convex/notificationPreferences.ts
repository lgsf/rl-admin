import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user's notification preferences
 * Returns all notification settings with defaults
 */
export const getNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Return preferences with defaults
    const defaultPreferences = {
      enabled: true,
      inApp: {
        enabled: true,
        type: "all" as const,
        playSound: true,
        showDesktop: false,
      },
      email: {
        enabled: true,
        communication: false,
        marketing: false,
        social: true,
        security: true, // Always true, cannot be disabled
      },
      push: {
        enabled: false,
        subscription: null,
      },
      mobile: false,
    };

    // Merge user preferences with defaults
    const userPrefs = user.preferences?.notifications || {};
    
    return {
      enabled: userPrefs.enabled ?? defaultPreferences.enabled,
      inApp: {
        ...defaultPreferences.inApp,
        ...userPrefs.inApp,
      },
      email: {
        ...defaultPreferences.email,
        ...userPrefs.email,
        security: true, // Always override to true
      },
      push: {
        ...defaultPreferences.push,
        ...userPrefs.push,
      },
      mobile: userPrefs.mobile ?? defaultPreferences.mobile,
    };
  },
});

/**
 * Update notification preferences
 * Saves user's notification settings
 */
export const updateNotificationPreferences = mutation({
  args: {
    enabled: v.optional(v.boolean()),
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
    email: v.optional(v.object({
      enabled: v.optional(v.boolean()),
      communication: v.optional(v.boolean()),
      marketing: v.optional(v.boolean()),
      social: v.optional(v.boolean()),
      security: v.optional(v.boolean()),
    })),
    push: v.optional(v.object({
      enabled: v.optional(v.boolean()),
      subscription: v.optional(v.any()),
    })),
    mobile: v.optional(v.boolean()),
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

    // Get current preferences
    const currentPreferences = user.preferences || {};
    const currentNotifications = currentPreferences.notifications || {};

    // Build updated notification preferences
    const updatedNotifications = {
      ...currentNotifications,
      ...(args.enabled !== undefined && { enabled: args.enabled }),
      ...(args.inApp && { 
        inApp: {
          ...currentNotifications.inApp,
          ...args.inApp,
        }
      }),
      ...(args.email && { 
        email: {
          ...currentNotifications.email,
          ...args.email,
          security: true, // Always keep security emails enabled
        }
      }),
      ...(args.push && { 
        push: {
          ...currentNotifications.push,
          ...args.push,
        }
      }),
      ...(args.mobile !== undefined && { mobile: args.mobile }),
    };

    // Update user preferences
    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPreferences,
        notifications: updatedNotifications,
      },
      updatedAt: Date.now(),
    });

    return {
      success: true,
      preferences: updatedNotifications,
    };
  },
});

/**
 * Subscribe to web push notifications
 * Saves the push subscription object
 */
export const subscribeWebPush = mutation({
  args: {
    subscription: v.any(), // PushSubscription object from browser
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

    const currentPreferences = user.preferences || {};
    const currentNotifications = currentPreferences.notifications || {};

    // Enable push notifications and save subscription
    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPreferences,
        notifications: {
          ...currentNotifications,
          push: {
            enabled: true,
            subscription: args.subscription,
          },
        },
      },
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Push notifications enabled",
    };
  },
});

/**
 * Unsubscribe from web push notifications
 * Removes the push subscription
 */
export const unsubscribeWebPush = mutation({
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

    const currentPreferences = user.preferences || {};
    const currentNotifications = currentPreferences.notifications || {};

    // Disable push notifications and remove subscription
    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPreferences,
        notifications: {
          ...currentNotifications,
          push: {
            enabled: false,
            subscription: null,
          },
        },
      },
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Push notifications disabled",
    };
  },
});

/**
 * Check if user should receive a specific type of notification
 * Used internally by notification creation functions
 */
export const shouldSendNotification = query({
  args: {
    userId: v.id("users"),
    channel: v.union(
      v.literal("inApp"),
      v.literal("email"),
      v.literal("push")
    ),
    type: v.optional(v.string()), // notification type
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return false;
    }

    const prefs = user.preferences?.notifications;
    if (!prefs || !prefs.enabled) {
      return false;
    }

    // Check channel-specific settings
    switch (args.channel) {
      case "inApp":
        const inAppEnabled = prefs.inApp?.enabled ?? true;
        const inAppType = prefs.inApp?.type ?? "all";
        
        if (!inAppEnabled || inAppType === "none") {
          return false;
        }
        
        // For mentions type, we'd need to check if the notification is a mention
        // This would be handled by the notification creation logic
        if (inAppType === "mentions" && args.type) {
          // Check if this is a mention-type notification
          return args.type.includes("mention") || args.type.includes("assigned");
        }
        
        return true;

      case "email":
        const emailEnabled = prefs.email?.enabled ?? true;
        if (!emailEnabled) {
          return false;
        }
        
        // Check category-specific email settings
        if (args.type) {
          if (args.type.includes("security")) {
            return true; // Security emails always sent
          }
          if (args.type.includes("communication") || args.type.includes("message")) {
            return prefs.email?.communication ?? false;
          }
          if (args.type.includes("marketing") || args.type.includes("product")) {
            return prefs.email?.marketing ?? false;
          }
          if (args.type.includes("social") || args.type.includes("follow")) {
            return prefs.email?.social ?? true;
          }
        }
        
        return true;

      case "push":
        return prefs.push?.enabled ?? false;

      default:
        return false;
    }
  },
});