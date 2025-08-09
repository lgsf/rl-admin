import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new group
 */
export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("standalone"),
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    ),
    organizationId: v.optional(v.id("organizations")),
    parentGroupId: v.optional(v.id("groups")),
    visibility: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("organization")
    ),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    settings: v.optional(v.object({
      allowMemberInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      autoAddNewOrgMembers: v.optional(v.boolean()),
      notificationDefaults: v.optional(v.object({
        enabled: v.boolean(),
        types: v.optional(v.array(v.string())),
      })),
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

    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingGroup) {
      throw new Error("A group with this name already exists");
    }

    // If organization group, verify user has permission
    if (args.organizationId) {
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_org", (q) => 
          q.eq("userId", user._id).eq("organizationId", args.organizationId!)
        )
        .first();

      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("You don't have permission to create groups in this organization");
      }
    }

    // Create the group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      slug,
      description: args.description,
      type: args.type,
      organizationId: args.organizationId,
      parentGroupId: args.parentGroupId,
      visibility: args.visibility,
      icon: args.icon,
      color: args.color,
      ownerId: user._id,
      settings: args.settings || {},
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

    return { groupId, slug };
  },
});

/**
 * Get all groups for the current user
 */
export const getUserGroups = query({
  args: {
    includePublic: v.optional(v.boolean()),
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

    // Get user's group memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    // Get group details
    const userGroups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group || !group.isActive) return null;
        
        return {
          ...group,
          memberRole: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    let groups = userGroups.filter(Boolean) as NonNullable<typeof userGroups[0]>[];

    // Include public groups if requested
    if (args.includePublic) {
      const publicGroups = await ctx.db
        .query("groups")
        .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      // Filter out groups user is already a member of
      const memberGroupIds = new Set(groups.map(g => g._id));
      const nonMemberPublicGroups = publicGroups.filter(g => !memberGroupIds.has(g._id));

      groups = [...groups, ...nonMemberPublicGroups] as any;
    }

    // Sort by type and name
    return groups.sort((a, b) => {
      if (!a || !b) return 0;
      if (a.type !== b.type) {
        const typeOrder = ["organization", "department", "project", "custom", "standalone"];
        return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      }
      return a.name.localeCompare(b.name);
    });
  },
});

/**
 * Get a single group by ID
 */
export const getGroup = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return null;
    }

    // Get member count
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_status", (q) => 
        q.eq("groupId", args.groupId).eq("status", "active")
      )
      .collect();

    return {
      ...group,
      memberCount: members.length,
    };
  },
});

/**
 * Get group members
 */
export const getGroupMembers = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("suspended")
    )),
  },
  handler: async (ctx, args) => {
    // Get group to check it exists
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Get members
    let membersQuery = ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId));

    if (args.status) {
      membersQuery = membersQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const members = await membersQuery.collect();

    // Get user details
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;

        return {
          ...member,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            username: user.username,
          },
        };
      })
    );

    return membersWithDetails.filter(Boolean);
  },
});

/**
 * Join a group
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

    if (existingMembership) {
      if (existingMembership.status === "active") {
        throw new Error("Already a member of this group");
      } else if (existingMembership.status === "pending") {
        throw new Error("Membership request already pending");
      }
    }

    // Check visibility and permissions
    if (group.visibility === "private") {
      throw new Error("This is a private group. You need an invitation to join.");
    }

    if (group.visibility === "organization" && group.organizationId) {
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_org", (q) => 
          q.eq("userId", user._id).eq("organizationId", group.organizationId!)
        )
        .first();

      if (!membership) {
        throw new Error("You must be a member of the organization to join this group");
      }
    }

    // Determine initial status
    const status = group.settings?.requireApproval ? "pending" : "active";

    // Add member
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
      status,
    });

    // Update member count if active
    if (status === "active") {
      await ctx.db.patch(args.groupId, {
        memberCount: (group.memberCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }

    return { status };
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
      throw new Error("Not a member of this group");
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
            q.eq(q.field("role"), "owner"),
            q.neq(q.field("userId"), user._id)
          )
        )
        .collect();

      if (otherOwners.length === 0) {
        throw new Error("Cannot leave group as the only owner. Transfer ownership first.");
      }
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    // Update member count
    const group = await ctx.db.get(args.groupId);
    if (group && membership.status === "active") {
      await ctx.db.patch(args.groupId, {
        memberCount: Math.max(0, (group.memberCount || 1) - 1),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Update group settings (admin/owner only)
 */
export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("organization")
    )),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    settings: v.optional(v.object({
      allowMemberInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      autoAddNewOrgMembers: v.optional(v.boolean()),
      notificationDefaults: v.optional(v.object({
        enabled: v.boolean(),
        types: v.optional(v.array(v.string())),
      })),
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

    // Check user has permission
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("You don't have permission to update this group");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updateData.name = args.name;
      updateData.slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (args.description !== undefined) updateData.description = args.description;
    if (args.visibility !== undefined) updateData.visibility = args.visibility;
    if (args.icon !== undefined) updateData.icon = args.icon;
    if (args.color !== undefined) updateData.color = args.color;
    if (args.settings !== undefined) updateData.settings = args.settings;

    await ctx.db.patch(args.groupId, updateData);

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

    // Check user is owner
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only group owners can delete groups");
    }

    // Delete all memberships
    const allMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    await Promise.all(
      allMemberships.map((m) => ctx.db.delete(m._id))
    );

    // Delete the group
    await ctx.db.delete(args.groupId);

    return { success: true };
  },
});

/**
 * Add a member to a group (admin/owner only)
 */
export const addGroupMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("moderator"),
      v.literal("member")
    )),
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

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check current user has permission
    const currentUserMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", currentUser._id)
      )
      .first();

    if (!currentUserMembership || 
        (currentUserMembership.role !== "owner" && 
         currentUserMembership.role !== "admin")) {
      throw new Error("You don't have permission to add members to this group");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      if (existingMembership.status === "pending") {
        // Approve pending membership
        await ctx.db.patch(existingMembership._id, {
          status: "active",
          role: args.role || "member",
        });
        return { status: "approved" };
      } else {
        throw new Error("User is already a member of this group");
      }
    }

    // Add new member
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      role: args.role || "member",
      joinedAt: Date.now(),
      invitedBy: currentUser._id,
      status: "active",
    });

    // Update member count
    const group = await ctx.db.get(args.groupId);
    if (group) {
      await ctx.db.patch(args.groupId, {
        memberCount: (group.memberCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }

    return { status: "added" };
  },
});

/**
 * Remove a member from a group (admin/owner only)
 */
export const removeGroupMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
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

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check current user has permission
    const currentUserMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", currentUser._id)
      )
      .first();

    if (!currentUserMembership || 
        (currentUserMembership.role !== "owner" && 
         currentUserMembership.role !== "admin")) {
      throw new Error("You don't have permission to remove members from this group");
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("User is not a member of this group");
    }

    // Cannot remove owner unless you are also an owner
    if (targetMembership.role === "owner" && currentUserMembership.role !== "owner") {
      throw new Error("Only owners can remove other owners");
    }

    // Delete membership
    await ctx.db.delete(targetMembership._id);

    // Update member count
    const group = await ctx.db.get(args.groupId);
    if (group && targetMembership.status === "active") {
      await ctx.db.patch(args.groupId, {
        memberCount: Math.max(0, (group.memberCount || 1) - 1),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Search for groups
 */
export const searchGroups = query({
  args: {
    query: v.string(),
    type: v.optional(v.union(
      v.literal("standalone"),
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    )),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    let groupsQuery = ctx.db
      .query("groups")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    // Filter by type if specified
    if (args.type) {
      groupsQuery = groupsQuery.filter((q) => q.eq(q.field("type"), args.type));
    }

    // Filter by organization if specified
    if (args.organizationId) {
      groupsQuery = groupsQuery.filter((q) => 
        q.eq(q.field("organizationId"), args.organizationId)
      );
    }

    const groups = await groupsQuery.collect();

    // Filter by search query
    const searchLower = args.query.toLowerCase();
    const filteredGroups = groups.filter(group => 
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    );

    // Only return public groups or groups user is member of
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not logged in - only return public groups
      return filteredGroups.filter(g => g.visibility === "public");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return filteredGroups.filter(g => g.visibility === "public");
    }

    // Get user's memberships
    const userMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    const userGroupIds = new Set(userMemberships.map(m => m.groupId));

    // Return groups user has access to
    return filteredGroups.filter(group => 
      group.visibility === "public" ||
      userGroupIds.has(group._id) ||
      (group.visibility === "organization" && group.organizationId && 
       // Check if user is in the same organization
       // This would need additional logic to check organization membership
       true)
    );
  },
});