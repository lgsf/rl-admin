import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./lib/permissions";

/**
 * Join a public channel
 */
export const joinChannel = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Can only join public channels or be invited to private ones
    if (channel.type === "private") {
      throw new Error("Cannot join private channel without invitation");
    }
    
    if (channel.type === "direct") {
      throw new Error("Cannot join direct message channels");
    }
    
    // Check if already a member
    const existingMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    if (existingMembership) {
      throw new Error("Already a member of this channel");
    }
    
    // Check organization access
    if (channel.organizationId && channel.organizationId !== currentUser.organizationId) {
      if (!["admin", "superadmin"].includes(currentUser.role)) {
        throw new Error("Cannot join channels from other organizations");
      }
    }
    
    // Add as member
    await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId: currentUser._id,
      role: "member",
      joinedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Leave a channel
 */
export const leaveChannel = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Cannot leave direct messages
    if (channel.type === "direct") {
      throw new Error("Cannot leave direct message conversations");
    }
    
    // Find membership
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    if (!membership) {
      throw new Error("Not a member of this channel");
    }
    
    // Cannot leave if owner (unless transferring ownership)
    if (membership.role === "owner") {
      // Check if there are other members
      const otherMembers = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .filter((q) => q.neq(q.field("userId"), currentUser._id))
        .collect();
      
      if (otherMembers.length > 0) {
        // Transfer ownership to the first admin or member
        const newOwner = otherMembers.find(m => m.role === "admin") || otherMembers[0];
        await ctx.db.patch(newOwner._id, { role: "owner" });
      }
    }
    
    // Remove membership
    await ctx.db.delete(membership._id);
    
    return { success: true };
  },
});

/**
 * Delete a channel (owner/admin only)
 */
export const deleteChannel = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check permissions
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    const canDelete = 
      (membership && membership.role === "owner") ||
      (channel.isSystemChannel && ["admin", "superadmin"].includes(currentUser.role)) ||
      (channel.createdBy === currentUser._id);
    
    if (!canDelete) {
      throw new Error("No permission to delete this channel");
    }
    
    // Delete all messages in the channel
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete all memberships
    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
    
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }
    
    // Delete the channel
    await ctx.db.delete(args.channelId);
    
    return { success: true };
  },
});

/**
 * Search for public channels to join
 */
export const searchPublicChannels = query({
  args: {
    searchTerm: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
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
    
    // Get user's current memberships
    const userMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const joinedChannelIds = new Set(userMemberships.map(m => m.channelId));
    
    // Query public channels
    let query = ctx.db
      .query("channels")
      .filter((q) => q.eq(q.field("type"), "public"));
    
    // Filter by organization if specified
    if (args.organizationId) {
      query = query.filter((q) => 
        q.eq(q.field("organizationId"), args.organizationId)
      );
    } else if (user.organizationId && !["admin", "superadmin"].includes(user.role)) {
      // Regular users see only their org's channels
      query = query.filter((q) => 
        q.eq(q.field("organizationId"), user.organizationId)
      );
    }
    
    const channels = await query.collect();
    
    // Filter by search term and exclude already joined channels
    let filteredChannels = channels.filter(c => !joinedChannelIds.has(c._id));
    
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredChannels = filteredChannels.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Add member count and last activity
    const enhancedChannels = await Promise.all(
      filteredChannels.map(async (channel) => {
        const memberCount = await ctx.db
          .query("channelMembers")
          .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
          .collect()
          .then(members => members.length);
        
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_channel_time", (q) => 
            q.eq("channelId", channel._id)
          )
          .order("desc")
          .first();
        
        return {
          ...channel,
          memberCount,
          lastActivity: lastMessage?.createdAt || channel.createdAt,
        };
      })
    );
    
    // Sort by activity
    enhancedChannels.sort((a, b) => b.lastActivity - a.lastActivity);
    
    return enhancedChannels;
  },
});

/**
 * Invite users to a private channel
 */
export const inviteToChannel = mutation({
  args: {
    channelId: v.id("channels"),
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check if user has permission to invite
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("No permission to invite users to this channel");
    }
    
    // Add each user as member
    for (const userId of args.userIds) {
      // Check if already member
      const existingMembership = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_user", (q) => 
          q.eq("channelId", args.channelId).eq("userId", userId)
        )
        .first();
      
      if (!existingMembership) {
        await ctx.db.insert("channelMembers", {
          channelId: args.channelId,
          userId,
          role: "member",
          joinedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});