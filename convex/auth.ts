import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store user data from Clerk after authentication
 * This is called automatically when a user signs in
 */
// This mutation is called by ConvexProviderWithClerk to sync user data
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("getOrCreateUser - identity:", identity ? "Found" : "Not found");
    if (!identity) {
      console.error("No identity in getOrCreateUser");
      throw new Error("Unauthorized: No identity found");
    }

    // Extract user info from Clerk JWT token - using the official Convex template claims
    const { 
      subject: clerkId, 
      email, 
      name, 
      picture,
      nickname,
      given_name,
      family_name,
    } = identity as any; // Type assertion needed for custom claims
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update last seen
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      firstName: given_name || "",
      lastName: family_name || "",
      username: nickname || email.split("@")[0],
      avatar: picture,
      role: "user" as const,
      status: "active" as const,
      preferences: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastSeenAt: Date.now(),
    });

    // Check if this is the first user (make them admin)
    const userCount = await ctx.db.query("users").collect();
    if (userCount.length === 1) {
      await ctx.db.patch(userId, { role: "admin" as const });
    }

    // Create default organization for the user if needed
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .unique();

    if (!org) {
      const orgId = await ctx.db.insert("organizations", {
        name: `${name || email.split("@")[0]}'s Organization`,
        slug: `org-${clerkId.substring(0, 8)}`,
        ownerId: userId,
        plan: "free" as const,
        settings: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user with organization
      await ctx.db.patch(userId, { organizationId: orgId });
    }

    return userId;
  }
});

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Auth store - identity:", identity ? "Found" : "Not found");
    if (!identity) {
      console.error("No identity in store mutation");
      throw new Error("Unauthorized: No identity found");
    }

    // Extract user info from Clerk JWT token - using the official Convex template claims
    const { 
      subject: clerkId, 
      email, 
      name, 
      picture,
      nickname,
      given_name,
      family_name,
    } = identity as any; // Type assertion needed for custom claims
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Use the provided names from Clerk
    const firstName = (given_name as string) || (name as string)?.split(' ')[0] || '';
    const lastName = (family_name as string) || (name as string)?.split(' ').slice(1).join(' ') || '';
    // Use Clerk username if available, otherwise use email prefix (which may contain dots)
    const username = (nickname as string) || (identity as any).username || email.split('@')[0];
    const avatarUrl = picture as string | undefined;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      // Update last seen and any changed info
      await ctx.db.patch(existingUser._id, {
        email,
        firstName,
        lastName,
        avatar: avatarUrl || existingUser.avatar,
        lastSeenAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user first without organization
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      firstName,
      lastName,
      username,
      avatar: avatarUrl,
      role: "user", // Default role
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create a default organization for the user
    const orgName = `${firstName}'s Organization`;
    const slug = `${username}-org`.toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    // Check if slug exists and make it unique if needed
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create the organization
    const organizationId = await ctx.db.insert("organizations", {
      name: orgName,
      slug: finalSlug,
      ownerId: userId,
      plan: "free",
      settings: {
        allowInvites: true,
        maxUsers: 100,
        features: ["tasks", "chat", "dashboard"],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user with organization
    await ctx.db.patch(userId, {
      organizationId,
      updatedAt: Date.now(),
    });

    // Create organization membership
    await ctx.db.insert("memberships", {
      organizationId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    // Create initial dashboard metrics for the new organization
    const today = new Date().toISOString().split('T')[0];
    await ctx.db.insert("dashboardMetrics", {
      organizationId,
      date: today,
      period: "daily",
      revenue: 0,
      subscriptions: 0,
      sales: 0,
      activeUsers: 1,
      newUsers: 1,
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
 * Get user profile for editing
 */
export const getUserProfile = query({
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

    // Return profile data formatted for the form
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || "",
      urls: user.urls || [],
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      preferences: user.preferences,
      lastUsernameChange: user.lastUsernameChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

/**
 * Check if username is available
 */
export const checkUsernameAvailability = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { available: false, reason: "Not authenticated" };
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      return { available: false, reason: "User not found" };
    }

    // If it's the user's current username, it's available
    if (currentUser.username === args.username) {
      return { available: true };
    }

    // Check if username is taken
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    if (existingUser) {
      return { available: false, reason: "Username already taken" };
    }

    return { available: true };
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
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    urls: v.optional(v.array(v.object({
      value: v.string(),
      label: v.optional(v.string()),
    }))),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
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

    const updates: any = {
      ...args,
      updatedAt: Date.now(),
    };

    // Track username change
    if (args.username && args.username !== user.username) {
      updates.lastUsernameChange = Date.now();
    }

    await ctx.db.patch(user._id, updates);
    
    // Return the updated user
    const updatedUser = await ctx.db.get(user._id);
    return updatedUser;
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