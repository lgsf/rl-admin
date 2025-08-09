import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { 
  requirePermission, 
  requireOrgMembership,
  canManageUser,
  getCurrentUserWithOrg 
} from "./lib/permissions";
import { Id } from "./_generated/dataModel";

/**
 * List all users (with filtering and pagination)
 */
export const list = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("invited"),
      v.literal("suspended")
    )),
    role: v.optional(v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("user")
    )),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "users:read");
    
    // Filter by organization if specified
    if (args.organizationId) {
      await requireOrgMembership(ctx, args.organizationId);
    }

    let query = args.organizationId
      ? ctx.db.query("users").withIndex("by_organization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
      : ctx.db.query("users");

    // Filter by status if specified
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    // Filter by role if specified
    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    // Search by name, email, or username
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      query = query.filter((q) =>
        q.or(
          q.eq(q.field("email"), args.search),
          q.eq(q.field("username"), args.search)
        )
      );
    }

    const limit = args.limit || 50;
    const users = await query.take(limit);

    return users;
  },
});

/**
 * Get a single user by ID
 */
export const get = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "users:read");

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check organization access
    if (user.organizationId) {
      await requireOrgMembership(ctx, user.organizationId);
    }

    return user;
  },
});

/**
 * Create a new user
 */
export const create = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    phoneNumber: v.optional(v.string()),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("user")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("invited"),
      v.literal("suspended")
    ),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:write");

    // Check if current user can create users with this role
    if (!canManageUser(currentUser.role, args.role)) {
      throw new Error("Cannot create user with higher or equal role");
    }

    // Check organization membership if creating user for an org
    if (args.organizationId) {
      await requireOrgMembership(ctx, args.organizationId);
    }

    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      clerkId: `pending_${Date.now()}`, // Will be updated on first login
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log audit event
    await ctx.db.insert("auditLogs", {
      organizationId: args.organizationId || currentUser.organizationId!,
      userId: currentUser._id,
      action: "user.created",
      resource: "users",
      resourceId: userId,
      changes: args,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Update a user
 */
export const update = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("user")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("invited"),
      v.literal("suspended")
    )),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:write");

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check organization access
    if (targetUser.organizationId) {
      await requireOrgMembership(ctx, targetUser.organizationId);
    }

    // Check role hierarchy if changing role
    if (args.role) {
      if (!canManageUser(currentUser.role, targetUser.role)) {
        throw new Error("Cannot modify user with higher or equal role");
      }
      if (!canManageUser(currentUser.role, args.role)) {
        throw new Error("Cannot assign higher or equal role");
      }
    }

    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Log audit event
    if (currentUser.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: currentUser.organizationId,
        userId: currentUser._id,
        action: "user.updated",
        resource: "users",
        resourceId: userId,
        changes: updates,
        createdAt: Date.now(),
      });
    }

    return userId;
  },
});

/**
 * Delete a user (soft delete by setting status to inactive)
 */
export const remove = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:delete");

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check organization access
    if (targetUser.organizationId) {
      await requireOrgMembership(ctx, targetUser.organizationId);
    }

    // Check role hierarchy
    if (!canManageUser(currentUser.role, targetUser.role)) {
      throw new Error("Cannot delete user with higher or equal role");
    }

    // Soft delete by setting status to inactive
    await ctx.db.patch(args.userId, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    // Log audit event
    if (currentUser.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: currentUser.organizationId,
        userId: currentUser._id,
        action: "user.deleted",
        resource: "users",
        resourceId: args.userId,
        createdAt: Date.now(),
      });
    }

    return args.userId;
  },
});

/**
 * Invite a user to the organization
 */
export const invite = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:write");

    if (!currentUser.organizationId) {
      throw new Error("Must be part of an organization to invite users");
    }

    // Check role hierarchy
    if (!canManageUser(currentUser.role, args.role)) {
      throw new Error("Cannot invite user with higher or equal role");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Add to organization if not already a member
      if (existingUser.organizationId === currentUser.organizationId) {
        throw new Error("User is already a member of this organization");
      }

      // Create membership
      await ctx.db.insert("memberships", {
        userId: existingUser._id,
        organizationId: currentUser.organizationId,
        role: "member",
        joinedAt: Date.now(),
      });

      return existingUser._id;
    }

    // Create invited user
    const userId = await ctx.db.insert("users", {
      clerkId: `invited_${Date.now()}`,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.email.split("@")[0],
      role: args.role,
      status: "invited",
      organizationId: currentUser.organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // TODO: Send invitation email

    // Log audit event
    await ctx.db.insert("auditLogs", {
      organizationId: currentUser.organizationId,
      userId: currentUser._id,
      action: "user.invited",
      resource: "users",
      resourceId: userId,
      changes: args,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get user statistics for dashboard
 */
export const getStats = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "users:read");

    if (args.organizationId) {
      await requireOrgMembership(ctx, args.organizationId);
    }

    let query = args.organizationId
      ? ctx.db.query("users").withIndex("by_organization", (q) =>
          q.eq("organizationId", args.organizationId)
        )
      : ctx.db.query("users");

    const users = await query.collect();

    const stats = {
      total: users.length,
      active: users.filter(u => u.status === "active").length,
      inactive: users.filter(u => u.status === "inactive").length,
      invited: users.filter(u => u.status === "invited").length,
      suspended: users.filter(u => u.status === "suspended").length,
      byRole: {
        superadmin: users.filter(u => u.role === "superadmin").length,
        admin: users.filter(u => u.role === "admin").length,
        manager: users.filter(u => u.role === "manager").length,
        cashier: users.filter(u => u.role === "cashier").length,
        user: users.filter(u => u.role === "user").length,
      },
      recentlyActive: users.filter(u => 
        u.lastSeenAt && u.lastSeenAt > Date.now() - 24 * 60 * 60 * 1000
      ).length,
    };

    return stats;
  },
});