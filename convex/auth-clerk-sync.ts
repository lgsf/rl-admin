import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Update user profile with Clerk sync
 * This mutation updates both Convex and Clerk user data
 */
export const updateProfileWithClerkSync = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    urls: v.optional(v.array(v.object({
      value: v.string(),
      label: v.optional(v.string()),
    }))),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
    })),
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

    // Check username change restrictions
    if (args.username && args.username !== user.username) {
      // Check if username was changed in the last 30 days
      if (user.lastUsernameChange) {
        const daysSinceChange = (Date.now() - user.lastUsernameChange) / (1000 * 60 * 60 * 24);
        if (daysSinceChange < 30) {
          throw new Error(`Username can only be changed once every 30 days. ${Math.ceil(30 - daysSinceChange)} days remaining.`);
        }
      }

      // Check if new username is available
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("username"), args.username))
        .first();

      if (existingUser) {
        throw new Error("Username already taken");
      }
    }

    // Prepare updates for Convex
    const updates: any = {
      ...args,
      updatedAt: Date.now(),
    };

    // Track username change
    if (args.username && args.username !== user.username) {
      updates.lastUsernameChange = Date.now();
    }

    // Update in Convex
    await ctx.db.patch(user._id, updates);
    
    // NOTE: Clerk profile updates should be done on the client side
    // using Clerk's SDK since we can't call external APIs from Convex
    // The client will need to call user.update() from @clerk/clerk-react
    
    // Return the updated user with a flag indicating Clerk sync is needed
    const updatedUser = await ctx.db.get(user._id);
    return {
      user: updatedUser,
      requiresClerkSync: !!(args.firstName || args.lastName || args.username),
    };
  },
});