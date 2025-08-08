import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get or create user from Clerk authentication
 * This is called when a user signs in for the first time
 */
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: No identity found");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update last seen
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      avatar: args.avatar,
      role: "user", // Default role
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get current user from Clerk authentication
 */
export const getCurrentUser = query({
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

    // Get user's organization if they have one
    if (user.organizationId) {
      const organization = await ctx.db.get(user.organizationId);
      return {
        ...user,
        organization,
      };
    }

    return user;
  },
});

/**
 * Update user profile
 */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
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

    const updates = {
      ...args,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

/**
 * Check if user has permission for an action
 */
export const checkPermission = query({
  args: {
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return false;
    }

    // Define role permissions
    const rolePermissions: Record<string, string[]> = {
      superadmin: ["*"], // All permissions
      admin: [
        "users:read",
        "users:write",
        "users:delete",
        "tasks:*",
        "apps:*",
        "dashboard:*",
        "messages:*",
      ],
      manager: [
        "users:read",
        "users:write",
        "tasks:*",
        "apps:read",
        "dashboard:read",
        "messages:*",
      ],
      cashier: [
        "tasks:read",
        "tasks:write",
        "dashboard:read",
        "messages:read",
        "messages:write",
      ],
      user: [
        "tasks:read",
        "dashboard:read",
        "messages:read",
        "messages:write",
      ],
    };

    const permissions = rolePermissions[user.role] || [];

    // Check if user has the specific permission or wildcard
    return permissions.includes("*") || 
           permissions.includes(args.permission) ||
           permissions.some(p => {
             const [resource, action] = p.split(":");
             const [reqResource, reqAction] = args.permission.split(":");
             return resource === reqResource && action === "*";
           });
  },
});

/**
 * Create a session for tracking
 */
export const createSession = mutation({
  args: {
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
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

    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      token: args.token,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

/**
 * Log an audit event
 */
export const logAuditEvent = mutation({
  args: {
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
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

    if (!user || !user.organizationId) {
      throw new Error("User or organization not found");
    }

    await ctx.db.insert("auditLogs", {
      organizationId: user.organizationId,
      userId: user._id,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      changes: args.changes,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: Date.now(),
    });
  },
});