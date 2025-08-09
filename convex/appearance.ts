import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user's appearance settings from database
 * Returns theme, font, and last sync timestamp
 */
export const getAppearanceSettings = query({
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

    return {
      theme: user.preferences?.theme || "system",
      font: user.preferences?.font || "inter",
      appearanceLastSync: user.preferences?.appearanceLastSync || null,
    };
  },
});

/**
 * Update user's appearance settings with optimistic updates
 * Stores theme and font preferences with timestamp
 */
export const updateAppearanceSettings = mutation({
  args: {
    theme: v.optional(v.string()),
    font: v.optional(v.string()),
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

    // Prepare the preferences update
    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...(args.theme !== undefined && { theme: args.theme }),
      ...(args.font !== undefined && { font: args.font }),
      appearanceLastSync: Date.now(),
    };

    // Update user preferences
    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      theme: updatedPreferences.theme,
      font: updatedPreferences.font,
      appearanceLastSync: updatedPreferences.appearanceLastSync,
    };
  },
});

/**
 * Sync appearance settings - used when localStorage and database differ
 * Returns the most recent settings based on timestamp
 */
export const syncAppearanceSettings = mutation({
  args: {
    localTheme: v.string(),
    localFont: v.string(),
    localTimestamp: v.number(),
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

    const dbTimestamp = user.preferences?.appearanceLastSync || 0;
    const localTimestamp = args.localTimestamp;

    // Determine which is newer
    if (localTimestamp > dbTimestamp) {
      // Local is newer, update database
      const updatedPreferences = {
        ...(user.preferences || {}),
        theme: args.localTheme,
        font: args.localFont,
        appearanceLastSync: localTimestamp,
      };

      await ctx.db.patch(user._id, {
        preferences: updatedPreferences,
        updatedAt: Date.now(),
      });

      return {
        source: "local",
        theme: args.localTheme,
        font: args.localFont,
        timestamp: localTimestamp,
      };
    } else if (dbTimestamp > localTimestamp) {
      // Database is newer, return database values
      return {
        source: "database",
        theme: user.preferences?.theme || "system",
        font: user.preferences?.font || "inter",
        timestamp: dbTimestamp,
      };
    } else {
      // Same timestamp, no conflict
      return {
        source: "synced",
        theme: user.preferences?.theme || args.localTheme,
        font: user.preferences?.font || args.localFont,
        timestamp: dbTimestamp,
      };
    }
  },
});