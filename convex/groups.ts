import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all groups accessible to the current user
 * Returns both organization groups (from user's orgs) and public system groups
 */
export const getUserGroups = query({
  args: {
    includeSystemGroups: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const groups = [];

    // 1. Get organization groups (user must be org member)
    if (user.organizationId) {
      // Check if user is an org member
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_org", (q) => 
          q.eq("userId", user._id).eq("organizationId", user.organizationId!)
        )
        .first();

      if (membership) {
        // Get all groups for this organization
        const orgGroups = await ctx.db
          .query("groups")
          .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId!))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Add membership info for each group
        for (const group of orgGroups) {
          const membership = await ctx.db
            .query("groupMembers")
            .withIndex("by_group_user", (q) => 
              q.eq("groupId", group._id).eq("userId", user._id)
            )
            .first();

          groups.push({
            ...group,
            isMember: !!membership,
            memberRole: membership?.role,
            memberStatus: membership?.status,
          });
        }
      }
    }

    // 2. Get system groups (platform-wide)
    if (args.includeSystemGroups) {
      const systemGroups = await ctx.db
        .query("groups")
        .filter((q) => 
          q.and(
            q.eq(q.field("organizationId"), undefined),
            q.eq(q.field("isActive"), true)
          )
        )
        .collect();

      // Add membership info for system groups
      for (const group of systemGroups) {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_user", (q) => 
            q.eq("groupId", group._id).eq("userId", user._id)
          )
          .first();

        groups.push({
          ...group,
          isMember: !!membership,
          memberRole: membership?.role,
          memberStatus: membership?.status,
          isSystemGroup: true,
        });
      }
    }

    return groups;
  },
});

/**
 * Get a single group with members
 */
export const getGroup = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      return null;
    }

    // Get active members
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_status", (q) => 
        q.eq("groupId", args.groupId).eq("status", "active")
      )
      .collect();

    // Get member details
    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;
        
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      })
    );

    return {
      ...group,
      members: memberDetails.filter(Boolean),
      memberCount: memberDetails.filter(Boolean).length,
    };
  },
});

/**
 * Get system groups (superadmin only)
 */
export const getSystemGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "superadmin") {
      return [];
    }

    // Get all system groups (no organizationId)
    const systemGroups = await ctx.db
      .query("groups")
      .filter((q) => 
        q.and(
          q.eq(q.field("organizationId"), undefined),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Add member counts
    const groupsWithCounts = await Promise.all(
      systemGroups.map(async (group) => {
        const memberCount = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_status", (q) => 
            q.eq("groupId", group._id).eq("status", "active")
          )
          .collect();

        return {
          ...group,
          memberCount: memberCount.length,
        };
      })
    );

    return groupsWithCounts;
  },
});

// ==========================================
// MUTATIONS - ORGANIZATION GROUPS
// ==========================================

/**
 * Create an organization group
 * Requires user to be org admin/owner
 */
export const createOrgGroup = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    ),
    visibility: v.union(
      v.literal("public"),
      v.literal("private")
    ),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
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
      throw new Error("User must belong to an organization");
    }

    // Check if user is org admin or owner
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) => 
        q.eq("userId", user._id).eq("organizationId", user.organizationId!)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Only organization admins can create groups");
    }

    // Check if slug is unique within organization
    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("organizationId"), user.organizationId))
      .first();

    if (existingGroup) {
      throw new Error("A group with this slug already exists in your organization");
    }

    // Create the group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      type: args.type,
      organizationId: user.organizationId,
      visibility: args.visibility,
      icon: args.icon,
      color: args.color,
      ownerId: user._id,
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        notificationDefaults: {
          enabled: true,
        },
      },
      isActive: true,
      memberCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as owner
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      role: "owner",
      joinedAt: Date.now(),
      status: "active",
    });

    return { success: true, groupId };
  },
});

// ==========================================
// MUTATIONS - SYSTEM GROUPS
// ==========================================

/**
 * Create a system group (superadmin only)
 * These are platform-wide groups not tied to any organization
 */
export const createSystemGroup = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("standalone"),
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    ),
    visibility: v.union(
      v.literal("public"),
      v.literal("private")
    ),
    autoAddUsers: v.optional(v.boolean()), // Auto-add all users
    roleRequirement: v.optional(v.union(
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "superadmin") {
      throw new Error("Only superadmins can create system groups");
    }

    // Check if slug is unique
    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingGroup) {
      throw new Error("A group with this slug already exists");
    }

    // Create the system group (no organizationId)
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      type: "standalone" as const, // System groups are standalone
      organizationId: undefined, // System groups have no organization
      visibility: args.visibility,
      ownerId: user._id,
      settings: {
        allowMemberInvites: false, // System groups are managed by admins
        requireApproval: true,
        notificationDefaults: {
          enabled: true,
        },
      },
      metadata: {
        isSystemGroup: true,
        autoAddUsers: args.autoAddUsers,
        roleRequirement: args.roleRequirement,
      },
      isActive: true,
      memberCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as owner
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      role: "owner",
      joinedAt: Date.now(),
      status: "active",
    });

    // If autoAddUsers is true, add all users
    if (args.autoAddUsers) {
      let usersQuery = ctx.db.query("users");
      
      // Filter by role requirement if specified
      if (args.roleRequirement) {
        // For role-based groups, only add users with the required role or higher
        const roleHierarchy = ["user", "manager", "admin", "superadmin"];
        const requiredIndex = roleHierarchy.indexOf(args.roleRequirement);
        const eligibleRoles = roleHierarchy.slice(requiredIndex);
        
        const allUsers = await usersQuery.collect();
        const eligibleUsers = allUsers.filter(u => 
          eligibleRoles.includes(u.role) && u._id !== user._id
        );

        // Add eligible users to the group
        await Promise.all(
          eligibleUsers.map(u =>
            ctx.db.insert("groupMembers", {
              groupId,
              userId: u._id,
              role: "member",
              joinedAt: Date.now(),
              status: "active",
            })
          )
        );

        await ctx.db.patch(groupId, {
          memberCount: eligibleUsers.length + 1, // +1 for owner
        });
      } else {
        // Add all users
        const allUsers = await usersQuery.collect();
        const otherUsers = allUsers.filter(u => u._id !== user._id);

        await Promise.all(
          otherUsers.map(u =>
            ctx.db.insert("groupMembers", {
              groupId,
              userId: u._id,
              role: "member",
              joinedAt: Date.now(),
              status: "active",
            })
          )
        );

        await ctx.db.patch(groupId, {
          memberCount: allUsers.length,
        });
      }
    }

    return { success: true, groupId };
  },
});

// ==========================================
// MUTATIONS - GROUP MEMBERSHIP
// ==========================================

/**
 * Join a group
 * Validates based on group type (org vs system)
 */
export const joinGroup = mutation({
  args: {
    groupId: v.id("groups"),
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

    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new Error("Group not found or inactive");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (existingMembership && existingMembership.status === "active") {
      throw new Error("You are already a member of this group");
    }

    // Validate based on group type
    if (group.organizationId) {
      // Organization group - check org membership
      const orgMembership = await ctx.db
        .query("memberships")
        .withIndex("by_user_org", (q) => 
          q.eq("userId", user._id).eq("organizationId", group.organizationId!)
        )
        .first();

      if (!orgMembership) {
        throw new Error("You must be a member of the organization to join this group");
      }
    } else {
      // System group - check role requirement
      const metadata = group.metadata as any;
      if (metadata?.roleRequirement) {
        const roleHierarchy = ["user", "manager", "admin", "superadmin"];
        const userRoleIndex = roleHierarchy.indexOf(user.role);
        const requiredRoleIndex = roleHierarchy.indexOf(metadata.roleRequirement);

        if (userRoleIndex < requiredRoleIndex) {
          throw new Error(`This group requires ${metadata.roleRequirement} role or higher`);
        }
      }
    }

    // Add or reactivate membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: "active",
        joinedAt: Date.now(),
      });
    } else {
      const status = group.settings?.requireApproval ? "pending" : "active";
      
      await ctx.db.insert("groupMembers", {
        groupId: args.groupId,
        userId: user._id,
        role: "member",
        joinedAt: Date.now(),
        status,
      });

      if (status === "active") {
        await ctx.db.patch(args.groupId, {
          memberCount: (group.memberCount || 0) + 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Leave a group
 */
export const leaveGroup = mutation({
  args: {
    groupId: v.id("groups"),
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

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if user is the only owner
    if (membership.role === "owner") {
      const otherOwners = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_status", (q) => 
          q.eq("groupId", args.groupId).eq("status", "active")
        )
        .filter((q) => 
          q.and(
            q.neq(q.field("userId"), user._id),
            q.eq(q.field("role"), "owner")
          )
        )
        .collect();

      if (otherOwners.length === 0) {
        // Check for admins who can be promoted
        const admins = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_status", (q) => 
            q.eq("groupId", args.groupId).eq("status", "active")
          )
          .filter((q) => 
            q.and(
              q.neq(q.field("userId"), user._id),
              q.eq(q.field("role"), "admin")
            )
          )
          .collect();

        if (admins.length === 0) {
          throw new Error("Cannot leave group as the only owner. Please assign another owner first.");
        }

        // Promote first admin to owner
        await ctx.db.patch(admins[0]._id, { role: "owner" });
      }
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    // Update member count
    await ctx.db.patch(args.groupId, {
      memberCount: Math.max(0, (group.memberCount || 0) - 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a group (owner only)
 */
export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
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

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check permissions
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    const isSystemGroup = !group.organizationId;
    
    if (isSystemGroup) {
      // System groups can only be deleted by superadmins
      if (user.role !== "superadmin") {
        throw new Error("Only superadmins can delete system groups");
      }
    } else {
      // Org groups can be deleted by group owner or org admin
      if (membership?.role !== "owner") {
        // Check if user is org admin
        const orgMembership = await ctx.db
          .query("memberships")
          .withIndex("by_user_org", (q) => 
            q.eq("userId", user._id).eq("organizationId", group.organizationId!)
          )
          .first();

        if (!orgMembership || (orgMembership.role !== "owner" && orgMembership.role !== "admin")) {
          throw new Error("Only group owners or organization admins can delete this group");
        }
      }
    }

    // Soft delete
    await ctx.db.patch(args.groupId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // Remove all memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    await Promise.all(
      memberships.map((m) => ctx.db.delete(m._id))
    );

    return { success: true };
  },
});