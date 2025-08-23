import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./lib/permissions";

/**
 * Add a member to a channel
 */
export const addMember = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  },
  returns: v.id("channelMembers"),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "channels:write");
    
    // Verify channel exists
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check if user to add exists
    const userToAdd = await ctx.db.get(args.userId);
    if (!userToAdd) {
      throw new Error("User not found");
    }
    
    // Check permissions
    // For DM channels, only participants can add (shouldn't happen)
    if (channel.type === "direct") {
      throw new Error("Cannot manually add members to direct message channels");
    }
    
    // For private/public channels, check if current user is admin or channel owner
    if (channel.type === "public" || channel.type === "private") {
      const currentMembership = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_user", (q) => 
          q.eq("channelId", args.channelId).eq("userId", currentUser._id)
        )
        .first();
      
      const canAdd = ["admin", "superadmin"].includes(currentUser.role) ||
        (currentMembership && ["owner", "admin"].includes(currentMembership.role));
      
      if (!canAdd) {
        throw new Error("No permission to add members to this channel");
      }
      
      // Check if user belongs to the organization
      if (channel.organizationId && userToAdd.organizationId !== channel.organizationId) {
        throw new Error("User does not belong to this organization");
      }
    }
    
    // For system channels, only superadmin can add
    if (channel.isSystemChannel && currentUser.role !== "superadmin") {
      throw new Error("Only superadmin can manage system channel members");
    }
    
    // Check if already a member
    const existingMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", args.userId)
      )
      .first();
    
    if (existingMembership) {
      throw new Error("User is already a member of this channel");
    }
    
    // Add member
    const membershipId = await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId: args.userId,
      role: args.role || "member",
      joinedAt: Date.now(),
      lastReadAt: Date.now(),
    });
    
    return membershipId;
  },
});

/**
 * Remove a member from a channel
 */
export const removeMember = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "channels:write");
    
    // Verify channel exists
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check permissions
    const currentMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    const targetMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", args.userId)
      )
      .first();
    
    if (!targetMembership) {
      throw new Error("User is not a member of this channel");
    }
    
    // Users can leave on their own
    const isSelf = args.userId === currentUser._id;
    
    // Check removal permissions
    const canRemove = isSelf ||
      ["admin", "superadmin"].includes(currentUser.role) ||
      (currentMembership && ["owner", "admin"].includes(currentMembership.role));
    
    if (!canRemove) {
      throw new Error("No permission to remove members from this channel");
    }
    
    // Can't remove channel owner unless they're leaving themselves
    if (targetMembership.role === "owner" && !isSelf) {
      throw new Error("Cannot remove the channel owner");
    }
    
    // Remove member
    await ctx.db.delete(targetMembership._id);
    
    return null;
  },
});

/**
 * Update member role
 */
export const updateMemberRole = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "channels:write");
    
    // Verify channel exists
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check permissions
    const currentMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    const targetMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", args.userId)
      )
      .first();
    
    if (!targetMembership) {
      throw new Error("User is not a member of this channel");
    }
    
    // Only owners and system admins can change roles
    const canChangeRole = ["admin", "superadmin"].includes(currentUser.role) ||
      (currentMembership && currentMembership.role === "owner");
    
    if (!canChangeRole) {
      throw new Error("No permission to change member roles");
    }
    
    // Can't change owner role unless transferring ownership
    if (targetMembership.role === "owner" && args.role !== "owner") {
      throw new Error("Cannot demote the channel owner. Transfer ownership first.");
    }
    
    // If making someone else owner, demote current owner
    if (args.role === "owner") {
      const currentOwner = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .filter((q) => q.eq(q.field("role"), "owner"))
        .first();
      
      if (currentOwner && currentOwner._id !== targetMembership._id) {
        await ctx.db.patch(currentOwner._id, { role: "admin" });
      }
    }
    
    // Update role
    await ctx.db.patch(targetMembership._id, { role: args.role });
    
    return null;
  },
});

/**
 * Get channel members
 */
export const getMembers = query({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.array(v.object({
    _id: v.id("channelMembers"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    userId: v.id("users"),
    user: v.optional(v.any()),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })),
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
    
    // Check if user has access to view members
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      return [];
    }
    
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", user._id)
      )
      .first();
    
    const hasAccess = membership || 
      (channel.isSystemChannel && ["admin", "superadmin"].includes(user.role));
    
    if (!hasAccess) {
      return [];
    }
    
    // Get all members
    const members = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
    
    // Enrich with user data
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const userData = await ctx.db.get(member.userId);
        return {
          ...member,
          user: userData,
        };
      })
    );
    
    // Sort by role (owner first, then admin, then members) and then by name
    enrichedMembers.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      const roleCompare = roleOrder[a.role] - roleOrder[b.role];
      if (roleCompare !== 0) return roleCompare;
      
      const aName = a.user?.firstName || "";
      const bName = b.user?.firstName || "";
      return aName.localeCompare(bName);
    });
    
    return enrichedMembers;
  },
});


/**
 * Get user's channel memberships
 */
export const getUserMemberships = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  returns: v.array(v.object({
    _id: v.id("channelMembers"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    channel: v.optional(v.any()),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser) {
      return [];
    }
    
    const targetUserId = args.userId || currentUser._id;
    
    // Can only view own memberships unless admin
    if (targetUserId !== currentUser._id && !["admin", "superadmin"].includes(currentUser.role)) {
      return [];
    }
    
    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();
    
    // Enrich with channel data
    const enrichedMemberships = await Promise.all(
      memberships.map(async (membership) => {
        const channel = await ctx.db.get(membership.channelId);
        return {
          ...membership,
          channel,
        };
      })
    );
    
    return enrichedMemberships;
  },
});