import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Initialize default system groups
 * Run this once to set up the platform groups
 */
export const initializeSystemGroups = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if user is superadmin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "superadmin") {
      throw new Error("Only superadmins can initialize system groups");
    }

    // Check if already initialized
    const existingGroups = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", "all-users"))
      .filter((q) => q.eq(q.field("organizationId"), undefined))
      .first();

    if (existingGroups) {
      return { message: "System groups already initialized" };
    }

    const groups = [];

    // 1. All Users Group (everyone)
    const allUsersGroupId = await ctx.db.insert("groups", {
      name: "All Platform Users",
      slug: "all-users",
      description: "All registered users on the platform",
      type: "standalone" as const,
      organizationId: undefined,
      visibility: "public" as const,
      ownerId: user._id,
      settings: {
        allowMemberInvites: false,
        requireApproval: false,
        notificationDefaults: {
          enabled: true,
        },
      },
      metadata: {
        isSystemGroup: true,
        features: ["platform_announcements"],
      },
      isActive: true,
      memberCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    groups.push({ id: allUsersGroupId, name: "All Platform Users" });

    // 2. Platform Admins Group (superadmin + admin)
    const adminGroupId = await ctx.db.insert("groups", {
      name: "Platform Administrators",
      slug: "platform-admins",
      description: "Platform administrators with access to admin features",
      type: "standalone" as const,
      organizationId: undefined,
      visibility: "private" as const,
      ownerId: user._id,
      settings: {
        allowMemberInvites: false,
        requireApproval: true,
        notificationDefaults: {
          enabled: true,
        },
      },
      metadata: {
        isSystemGroup: true,
        requiredRoles: ["superadmin", "admin"],
        features: ["notification_panel", "user_management", "system_settings"],
      },
      isActive: true,
      memberCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    groups.push({ id: adminGroupId, name: "Platform Administrators" });

    // 3. Platform Managers Group
    const managerGroupId = await ctx.db.insert("groups", {
      name: "Platform Managers",
      slug: "platform-managers",
      description: "Platform managers with limited administrative access",
      type: "standalone" as const,
      organizationId: undefined,
      visibility: "private" as const,
      ownerId: user._id,
      settings: {
        allowMemberInvites: false,
        requireApproval: true,
        notificationDefaults: {
          enabled: true,
        },
      },
      metadata: {
        isSystemGroup: true,
        requiredRoles: ["superadmin", "admin", "manager"],
        features: ["user_reports", "basic_analytics"],
      },
      isActive: true,
      memberCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    groups.push({ id: managerGroupId, name: "Platform Managers" });

    // Add existing users to appropriate groups
    const allUsers = await ctx.db.query("users").collect();
    
    for (const existingUser of allUsers) {
      const userSystemGroups = [];
      
      // Add everyone to all-users group
      await ctx.db.insert("groupMembers", {
        groupId: allUsersGroupId,
        userId: existingUser._id,
        role: "member" as const,
        joinedAt: Date.now(),
        status: "active" as const,
      });
      userSystemGroups.push(allUsersGroupId);

      // Add admins and superadmins to admin group
      if (existingUser.role === "superadmin" || existingUser.role === "admin") {
        await ctx.db.insert("groupMembers", {
          groupId: adminGroupId,
          userId: existingUser._id,
          role: existingUser.role === "superadmin" ? "owner" : "admin",
          joinedAt: Date.now(),
          status: "active" as const,
        });
        userSystemGroups.push(adminGroupId);
      }

      // Add managers (and above) to manager group
      if (["superadmin", "admin", "manager"].includes(existingUser.role)) {
        await ctx.db.insert("groupMembers", {
          groupId: managerGroupId,
          userId: existingUser._id,
          role: existingUser.role === "superadmin" ? "owner" : 
                existingUser.role === "admin" ? "admin" : "member",
          joinedAt: Date.now(),
          status: "active" as const,
        });
        userSystemGroups.push(managerGroupId);
      }

      // Update user's systemGroups array
      await ctx.db.patch(existingUser._id, {
        systemGroups: userSystemGroups,
      });
    }

    // Update member counts
    await ctx.db.patch(allUsersGroupId, { memberCount: allUsers.length });
    
    const adminCount = allUsers.filter(u => 
      u.role === "superadmin" || u.role === "admin"
    ).length;
    await ctx.db.patch(adminGroupId, { memberCount: adminCount });

    const managerCount = allUsers.filter(u => 
      ["superadmin", "admin", "manager"].includes(u.role)
    ).length;
    await ctx.db.patch(managerGroupId, { memberCount: managerCount });

    return {
      message: "System groups initialized successfully",
      groups,
      usersProcessed: allUsers.length,
    };
  },
});

/**
 * Check if current user has access to a feature via system groups
 */
export const checkFeatureAccess = query({
  args: {
    feature: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    // Superadmins have access to everything
    if (user.role === "superadmin") return true;

    // Check system groups for feature access
    if (user.systemGroups && user.systemGroups.length > 0) {
      for (const groupId of user.systemGroups) {
        const group = await ctx.db.get(groupId);
        if (!group || !group.isActive) continue;
        
        const metadata = group.metadata as any;
        if (metadata?.features?.includes(args.feature)) {
          return true;
        }
      }
    }

    return false;
  },
});

/**
 * Get user's complete group memberships
 */
export const getUserGroupDetails = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let targetUserId = args.userId;
    
    if (!targetUserId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          role: null,
          systemGroups: [],
          organizationGroups: [],
          organizations: [],
        };
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) {
        return {
          role: null,
          systemGroups: [],
          organizationGroups: [],
          organizations: [],
        };
      }
      targetUserId = user._id;
    }

    const user = await ctx.db.get(targetUserId);
    if (!user) {
      return {
        role: null,
        systemGroups: [],
        organizationGroups: [],
        organizations: [],
      };
    }

    // Get system groups details
    const systemGroups = [];
    if (user.systemGroups) {
      for (const groupId of user.systemGroups) {
        const group = await ctx.db.get(groupId);
        if (group && group.isActive && !group.organizationId) {
          systemGroups.push({
            _id: group._id,
            name: group.name,
            slug: group.slug,
            description: group.description,
            metadata: group.metadata,
          });
        }
      }
    }

    // Get organization groups details
    const organizationGroups = [];
    if (user.groups) {
      for (const groupId of user.groups) {
        const group = await ctx.db.get(groupId);
        if (group && group.isActive && group.organizationId) {
          const org = await ctx.db.get(group.organizationId);
          organizationGroups.push({
            _id: group._id,
            name: group.name,
            slug: group.slug,
            organizationName: org?.name,
            organizationId: group.organizationId,
          });
        }
      }
    }

    // Get organizations details
    const organizations = [];
    if (user.memberships) {
      for (const membershipId of user.memberships) {
        const membership = await ctx.db.get(membershipId);
        if (membership) {
          const org = await ctx.db.get(membership.organizationId);
          if (org) {
            organizations.push({
              _id: org._id,
              name: org.name,
              role: membership.role,
              joinedAt: membership.joinedAt,
            });
          }
        }
      }
    }

    return {
      role: user.role,
      systemGroups,
      organizationGroups,
      organizations,
    };
  },
});

/**
 * Get all users with their system group memberships (admin only)
 */
export const getAllUsersWithSystemGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Only admins can see this
    if (!currentUser || (currentUser.role !== "superadmin" && currentUser.role !== "admin")) {
      return null;
    }

    const users = await ctx.db.query("users").collect();
    
    // Get system groups
    const systemGroups = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("organizationId"), undefined))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Build user data with group memberships
    const usersWithGroups = await Promise.all(
      users.map(async (user) => {
        const groupDetails = [];
        
        if (user.systemGroups) {
          for (const groupId of user.systemGroups) {
            const group = systemGroups.find(g => g._id === groupId);
            if (group) {
              groupDetails.push({
                _id: group._id,
                name: group.name,
                slug: group.slug,
              });
            }
          }
        }

        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          systemGroups: groupDetails,
        };
      })
    );

    return {
      users: usersWithGroups,
      systemGroups,
    };
  },
});

/**
 * Add user to a system group (superadmin only)
 */
export const addUserToSystemGroup = mutation({
  args: {
    userId: v.id("users"),
    groupSlug: v.string(),
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
      throw new Error("Only superadmins can manage system groups");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const group = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.groupSlug))
      .filter((q) => q.eq(q.field("organizationId"), undefined))
      .first();

    if (!group) {
      throw new Error("System group not found");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", group._id).eq("userId", args.userId)
      )
      .first();

    if (existingMembership && existingMembership.status === "active") {
      return { message: "User is already a member of this group" };
    }

    // Add or reactivate membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: "active" as const,
        joinedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("groupMembers", {
        groupId: group._id,
        userId: args.userId,
        role: "member" as const,
        joinedAt: Date.now(),
        status: "active" as const,
      });
    }

    // Update user's systemGroups array
    const currentSystemGroups = targetUser.systemGroups || [];
    if (!currentSystemGroups.includes(group._id)) {
      await ctx.db.patch(args.userId, {
        systemGroups: [...currentSystemGroups, group._id],
      });
    }

    // Update group member count
    await ctx.db.patch(group._id, {
      memberCount: (group.memberCount || 0) + 1,
    });

    return { 
      success: true,
      message: `User added to ${group.name}` 
    };
  },
});