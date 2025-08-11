import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { 
  requirePermission, 
  requireOrgMembership,
  canManageUser
} from "./lib/permissions";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

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
      v.literal("user")
    )),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:read");
    
    // Regular users cannot see user list
    if (currentUser.role === "user") {
      throw new Error("Insufficient permissions to view user list");
    }
    
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
      query = query.filter((q) =>
        q.or(
          q.eq(q.field("email"), args.search),
          q.eq(q.field("username"), args.search)
        )
      );
    }

    const limit = args.limit || 50;
    let users = await query.take(limit);
    
    // Filter users based on role hierarchy
    // Managers can only see managers and users
    // Admins can only see admins, managers, and users
    // Superadmins can see everyone
    if (currentUser.role === "manager") {
      users = users.filter(u => u.role === "manager" || u.role === "user");
    } else if (currentUser.role === "admin") {
      users = users.filter(u => u.role !== "superadmin");
    }
    // Superadmins see all users (no filter needed)

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
 * Get the current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
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
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.string(),
    phoneNumber: v.optional(v.string()),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
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
      firstName: args.firstName || "",
      lastName: args.lastName || "",
      clerkId: `pending_${Date.now()}`, // Will be updated on first login
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Auto-assign new user to system groups based on role
    const allUsersGroup = await ctx.db
      .query("groups")
      .filter(q => q.and(
        q.eq(q.field("name"), "all-users"),
        q.eq(q.field("organizationId"), undefined)
      ))
      .first();
    
    const platformAdminsGroup = await ctx.db
      .query("groups")
      .filter(q => q.and(
        q.eq(q.field("name"), "platform-admins"),
        q.eq(q.field("organizationId"), undefined)
      ))
      .first();
    
    const platformManagersGroup = await ctx.db
      .query("groups")
      .filter(q => q.and(
        q.eq(q.field("name"), "platform-managers"),
        q.eq(q.field("organizationId"), undefined)
      ))
      .first();
    
    // Build system groups array based on role
    const systemGroups: Id<"groups">[] = [];
    
    // All users get added to all-users group
    if (allUsersGroup) {
      systemGroups.push(allUsersGroup._id);
      await ctx.db.insert("groupMembers", {
        groupId: allUsersGroup._id,
        userId,
        role: "member" as const,
        joinedAt: Date.now(),
        status: "active" as const,
      });
    }
    
    // Add to role-specific groups
    if ((args.role === "superadmin" || args.role === "admin") && platformAdminsGroup) {
      systemGroups.push(platformAdminsGroup._id);
      await ctx.db.insert("groupMembers", {
        groupId: platformAdminsGroup._id,
        userId,
        role: "member" as const,
        joinedAt: Date.now(),
        status: "active" as const,
      });
    }
    
    if (args.role === "manager" && platformManagersGroup) {
      systemGroups.push(platformManagersGroup._id);
      await ctx.db.insert("groupMembers", {
        groupId: platformManagersGroup._id,
        userId,
        role: "member" as const,
        joinedAt: Date.now(),
        status: "active" as const,
      });
    }
    
    // Update user with system groups
    if (systemGroups.length > 0) {
      await ctx.db.patch(userId, { systemGroups });
    }

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

    // Check role hierarchy - prevent editing users with higher or equal roles
    if (currentUser.role !== "superadmin") {
      // Check if user can modify the target user based on role hierarchy
      if (!canManageUser(currentUser.role, targetUser.role)) {
        throw new Error("Cannot modify user with higher or equal role");
      }
      
      // Check organization access
      if (targetUser.organizationId) {
        await requireOrgMembership(ctx, targetUser.organizationId);
      }

      // Check role hierarchy if changing role
      if (args.role) {
        // Admin can only set roles to manager or user
        if (currentUser.role === "admin" && (args.role === "superadmin" || args.role === "admin")) {
          throw new Error("Admins can only assign manager or user roles");
        }
        // Managers shouldn't be able to change roles at all
        if (currentUser.role === "manager") {
          throw new Error("Managers cannot change user roles");
        }
      }
    }
    // Superadmins can do anything - no restrictions

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
 * Permanently delete a user (removes from database and Clerk)
 */
export const remove = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:delete");

    // Only superadmins can delete users
    if (currentUser.role !== "superadmin") {
      throw new Error("Only superadmins can delete users");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Don't allow deleting yourself
    if (targetUser._id === currentUser._id) {
      throw new Error("Cannot delete your own account");
    }

    // Remove user from all groups (system and organization)
    const groupMemberships = await ctx.db
      .query("groupMembers")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const membership of groupMemberships) {
      await ctx.db.delete(membership._id);
    }

    // Remove user's organization memberships
    const memberships = await ctx.db
      .query("memberships")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Remove user's notifications
    const notifications = await ctx.db
      .query("notifications")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Store Clerk ID before deleting user
    const clerkId = targetUser.clerkId;

    // Delete user from database
    await ctx.db.delete(args.userId);

    // Delete user from Clerk if they have a real Clerk ID (not pending or invited)
    if (clerkId && !clerkId.startsWith("pending_") && !clerkId.startsWith("invited_")) {
      // Schedule action to delete from Clerk
      await ctx.scheduler.runAfter(0, api.users.deleteFromClerk, { clerkId });
    }

    // Log audit event
    if (currentUser.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: currentUser.organizationId,
        userId: currentUser._id,
        action: "user.permanently_deleted",
        resource: "users",
        resourceId: args.userId,
        changes: { 
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role 
        },
        createdAt: Date.now(),
      });
    }

    return args.userId;
  },
});

/**
 * Action to delete user from Clerk
 */
export const deleteFromClerk = action({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // This would need to be implemented with Clerk's backend API
    // For now, we'll just log it
    console.log(`Would delete user from Clerk: ${args.clerkId}`);
    // TODO: Implement actual Clerk deletion when backend API is set up
  },
});

/**
 * Activate or deactivate a user
 */
export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:write");

    // Only admins and superadmins can change user status
    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      throw new Error("Only admins and superadmins can change user status");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Don't allow changing your own status
    if (targetUser._id === currentUser._id) {
      throw new Error("Cannot change your own account status");
    }

    // Check role hierarchy - can't change status of higher role users
    if (currentUser.role !== "superadmin") {
      if (!canManageUser(currentUser.role, targetUser.role)) {
        throw new Error("Cannot change status of user with higher or equal role");
      }
    }

    // Update user status
    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Log audit event
    if (currentUser.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: currentUser.organizationId,
        userId: currentUser._id,
        action: `user.status_changed_to_${args.status}`,
        resource: "users",
        resourceId: args.userId,
        changes: { 
          status: args.status,
          reason: args.reason,
          previousStatus: targetUser.status 
        },
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

    const query = args.organizationId
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
        user: users.filter(u => u.role === "user").length,
      },
      recentlyActive: users.filter(u => 
        u.lastSeenAt && u.lastSeenAt > Date.now() - 24 * 60 * 60 * 1000
      ).length,
    };

    return stats;
  },
});

/**
 * Update user's role and system groups
 */
export const updateRoleAndGroups = mutation({
  args: {
    userId: v.id("users"),
    role: v.optional(v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("user")
    )),
    systemGroups: v.optional(v.array(v.id("groups"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "users:write");
    
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    // Check if current user can modify target user based on role hierarchy
    if (currentUser.role !== "superadmin") {
      if (!canManageUser(currentUser.role, targetUser.role)) {
        throw new Error("Cannot modify user with higher or equal role");
      }
    }
    
    // Permission checks
    if (args.systemGroups !== undefined) {
      // Only superadmin can update system groups
      if (currentUser.role !== "superadmin") {
        throw new Error("Only superadmins can update system groups");
      }
    }
    
    if (args.role !== undefined) {
      // Check who can update roles
      if (currentUser.role === "superadmin") {
        // Superadmin can set any role - no restrictions
      } else if (currentUser.role === "admin") {
        // Admin can only set roles to manager or user
        if (args.role === "superadmin" || args.role === "admin") {
          throw new Error("Admins can only assign manager or user roles");
        }
      } else {
        throw new Error("Insufficient permissions to update user roles");
      }
    }
    
    // Prepare updates
    const updates: Record<string, any> = { updatedAt: Date.now() };
    
    // Update role if provided
    if (args.role !== undefined) {
      updates.role = args.role;
      
      // Auto-update system groups based on role
      const allUsersGroup = await ctx.db
        .query("groups")
        .filter(q => q.and(
          q.eq(q.field("name"), "all-users"),
          q.eq(q.field("organizationId"), undefined)
        ))
        .first();
      
      const platformAdminsGroup = await ctx.db
        .query("groups")
        .filter(q => q.and(
          q.eq(q.field("name"), "platform-admins"),
          q.eq(q.field("organizationId"), undefined)
        ))
        .first();
      
      const platformManagersGroup = await ctx.db
        .query("groups")
        .filter(q => q.and(
          q.eq(q.field("name"), "platform-managers"),
          q.eq(q.field("organizationId"), undefined)
        ))
        .first();
      
      // Build new system groups array based on role
      const newSystemGroups: Id<"groups">[] = [];
      
      if (allUsersGroup) {
        newSystemGroups.push(allUsersGroup._id);
      }
      
      if ((args.role === "superadmin" || args.role === "admin") && platformAdminsGroup) {
        newSystemGroups.push(platformAdminsGroup._id);
      }
      
      if ((args.role === "manager") && platformManagersGroup) {
        newSystemGroups.push(platformManagersGroup._id);
      }
      
      updates.systemGroups = newSystemGroups;
      
      // Update group memberships
      // Remove from all system groups first
      const existingMemberships = await ctx.db
        .query("groupMembers")
        .filter(q => q.eq(q.field("userId"), args.userId))
        .collect();
      
      for (const membership of existingMemberships) {
        const group = await ctx.db.get(membership.groupId);
        if (group && group.organizationId === undefined) {
          // It's a system group, remove membership
          await ctx.db.delete(membership._id);
        }
      }
      
      // Add new memberships
      for (const groupId of newSystemGroups) {
        await ctx.db.insert("groupMembers", {
          groupId,
          userId: args.userId,
          role: "member" as const,
          joinedAt: Date.now(),
          status: "active" as const,
        });
      }
    }
    
    // Update system groups if explicitly provided
    if (args.systemGroups !== undefined) {
      updates.systemGroups = args.systemGroups;
      
      // Update group memberships
      const existingMemberships = await ctx.db
        .query("groupMembers")
        .filter(q => q.eq(q.field("userId"), args.userId))
        .collect();
      
      // Remove from all system groups first
      for (const membership of existingMemberships) {
        const group = await ctx.db.get(membership.groupId);
        if (group && group.organizationId === undefined) {
          await ctx.db.delete(membership._id);
        }
      }
      
      // Add new memberships
      for (const groupId of args.systemGroups) {
        await ctx.db.insert("groupMembers", {
          groupId,
          userId: args.userId,
          role: "member" as const,
          joinedAt: Date.now(),
          status: "active" as const,
        });
      }
    }
    
    // Apply updates
    await ctx.db.patch(args.userId, updates);
    
    // Log audit event
    if (currentUser.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: currentUser.organizationId,
        userId: currentUser._id,
        action: "user.role_updated",
        resource: "users",
        resourceId: args.userId,
        changes: updates,
        createdAt: Date.now(),
      });
    }
    
    return args.userId;
  },
});

/**
 * Get all users with their system groups for management
 */
export const getUsersWithSystemGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    // Check if user has permission to view users
    if (currentUser.role === "user") {
      throw new Error("Insufficient permissions to view user list");
    }
    
    let users = await ctx.db.query("users").collect();
    
    // Filter users based on role hierarchy
    if (currentUser.role === "manager") {
      users = users.filter(u => u.role === "manager" || u.role === "user");
    } else if (currentUser.role === "admin") {
      users = users.filter(u => u.role !== "superadmin");
    }
    
    // Get all system groups
    const systemGroups = await ctx.db
      .query("groups")
      .filter(q => q.eq(q.field("organizationId"), undefined))
      .collect();
    
    // Get user system group details
    const usersWithGroups = await Promise.all(users.map(async (user) => {
      const userSystemGroups = user.systemGroups || [];
      const groupDetails = await Promise.all(
        userSystemGroups.map(groupId => ctx.db.get(groupId))
      );
      
      return {
        ...user,
        systemGroupNames: groupDetails
          .filter(g => g !== null)
          .map(g => g!.name),
      };
    }));
    
    return {
      users: usersWithGroups,
      systemGroups,
    };
  },
});