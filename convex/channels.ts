import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requirePermission } from "./lib/permissions";

/**
 * Create a new channel
 * Organization channels require manager+ role
 * System channels require admin+ role
 * Direct messages are created automatically
 */
export const createChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("direct")
    ),
    organizationId: v.optional(v.id("organizations")),
    isSystemChannel: v.optional(v.boolean()),
    participants: v.optional(v.array(v.id("users"))), // For direct messages
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    // System channels require admin or superadmin
    if (args.isSystemChannel) {
      if (!["admin", "superadmin"].includes(currentUser.role)) {
        throw new Error("Only admins can create system channels");
      }
    }
    
    // Organization channels
    if (args.type !== "direct" && args.organizationId) {
      // Check if user is manager+ in the organization
      if (!["manager", "admin", "superadmin"].includes(currentUser.role)) {
        throw new Error("Only managers can create organization channels");
      }
      
      // Verify user belongs to the organization (unless superadmin)
      if (currentUser.role !== "superadmin" && 
          currentUser.organizationId !== args.organizationId) {
        throw new Error("Cannot create channels in other organizations");
      }
    }
    
    // For direct messages, validate participants
    if (args.type === "direct" && args.participants) {
      if (args.participants.length !== 2) {
        throw new Error("Direct messages must have exactly 2 participants");
      }
      
      const [user1, user2] = args.participants;
      
      // Check if DM already exists
      const existingDM = await ctx.db
        .query("channels")
        .filter((q) => 
          q.and(
            q.eq(q.field("type"), "direct"),
            q.or(
              q.and(
                q.eq(q.field("createdBy"), user1),
                q.eq(q.field("recipientId"), user2)
              ),
              q.and(
                q.eq(q.field("createdBy"), user2),
                q.eq(q.field("recipientId"), user1)
              )
            )
          )
        )
        .first();
      
      if (existingDM) {
        return existingDM._id;
      }
    }
    
    // Create the channel
    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      type: args.type,
      organizationId: args.organizationId || currentUser.organizationId!,
      createdBy: currentUser._id,
      recipientId: args.type === "direct" && args.participants 
        ? args.participants.find(id => id !== currentUser._id)
        : undefined,
      isSystemChannel: args.isSystemChannel || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add creator as member
    await ctx.db.insert("channelMembers", {
      channelId,
      userId: currentUser._id,
      role: "owner",
      joinedAt: Date.now(),
    });
    
    // For direct messages, add the other participant
    if (args.type === "direct" && args.participants) {
      const otherUser = args.participants.find(id => id !== currentUser._id);
      if (otherUser) {
        await ctx.db.insert("channelMembers", {
          channelId,
          userId: otherUser,
          role: "member",
          joinedAt: Date.now(),
        });
      }
    }
    
    // For public org channels, auto-add all org members
    if (args.type === "public" && args.organizationId) {
      const orgUsers = await ctx.db
        .query("users")
        .withIndex("by_organization", (q) => 
          q.eq("organizationId", args.organizationId!)
        )
        .filter((q) => q.neq(q.field("_id"), currentUser._id))
        .collect();
      
      await Promise.all(
        orgUsers.map(user =>
          ctx.db.insert("channelMembers", {
            channelId,
            userId: user._id,
            role: "member",
            joinedAt: Date.now(),
          })
        )
      );
    }
    
    return channelId;
  },
});

/**
 * List channels accessible to the current user
 */
export const listChannels = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    type: v.optional(v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("direct")
    )),
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
    
    // Get user's channel memberships
    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const channelIds = memberships.map(m => m.channelId);
    
    // Get channels
    const channels = await Promise.all(
      channelIds.map(id => ctx.db.get(id))
    );
    
    // Filter out null channels and apply filters
    let filteredChannels = channels.filter(Boolean) as any[];
    
    // Apply type filter
    if (args.type) {
      filteredChannels = filteredChannels.filter(c => c.type === args.type);
    }
    
    // Apply organization filter
    if (args.organizationId) {
      filteredChannels = filteredChannels.filter(c => 
        c.organizationId === args.organizationId
      );
    }
    
    // For superadmin/admin, also include system channels
    if (["admin", "superadmin"].includes(user.role)) {
      const systemChannels = await ctx.db
        .query("channels")
        .filter((q) => q.eq(q.field("isSystemChannel"), true))
        .collect();
      
      // Add system channels if not already included
      systemChannels.forEach(sc => {
        if (!filteredChannels.find(c => c._id === sc._id)) {
          filteredChannels.push(sc);
        }
      });
    }
    
    // Enhance channels with additional data
    const enhancedChannels = await Promise.all(
      filteredChannels.map(async (channel) => {
        // Get member count
        const members = await ctx.db
          .query("channelMembers")
          .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
          .collect();
        
        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_channel_time", (q) => 
            q.eq("channelId", channel._id)
          )
          .order("desc")
          .first();
        
        // For direct messages, get the other user's info
        let otherUser = null;
        if (channel.type === "direct") {
          const otherUserId = channel.createdBy === user._id 
            ? channel.recipientId 
            : channel.createdBy;
          if (otherUserId) {
            otherUser = await ctx.db.get(otherUserId);
          }
        }
        
        return {
          ...channel,
          memberCount: members.length,
          lastMessage,
          lastMessageAt: lastMessage?.createdAt || channel.createdAt,
          otherUser, // For DMs
          unreadCount: 0, // TODO: Implement unread tracking
        };
      })
    );
    
    // Sort by last message time
    enhancedChannels.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    
    return enhancedChannels;
  },
});

/**
 * Get or create a direct message channel between two users
 */
export const getOrCreateDirectMessage = mutation({
  args: {
    recipientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    // Check if recipient exists
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }
    
    // Check permissions based on role
    const canMessageAnyone = ["admin", "superadmin"].includes(currentUser.role);
    
    if (!canMessageAnyone) {
      // Regular users can only message within their organization
      if (currentUser.organizationId !== recipient.organizationId) {
        throw new Error("Cannot message users from other organizations");
      }
    }
    
    // Check for existing DM channel
    const existingDM = await ctx.db
      .query("channels")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "direct"),
          q.or(
            q.and(
              q.eq(q.field("createdBy"), currentUser._id),
              q.eq(q.field("recipientId"), args.recipientId)
            ),
            q.and(
              q.eq(q.field("createdBy"), args.recipientId),
              q.eq(q.field("recipientId"), currentUser._id)
            )
          )
        )
      )
      .first();
    
    if (existingDM) {
      return existingDM._id;
    }
    
    // Create new DM channel
    const channelName = `${currentUser.firstName} & ${recipient.firstName}`;
    
    // Create the channel directly (can't call mutation from mutation)
    const channelId = await ctx.db.insert("channels", {
      name: channelName,
      type: "direct",
      organizationId: currentUser.organizationId!,
      createdBy: currentUser._id,
      recipientId: args.recipientId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add both users as members
    await ctx.db.insert("channelMembers", {
      channelId,
      userId: currentUser._id,
      role: "member",
      joinedAt: Date.now(),
    });
    
    await ctx.db.insert("channelMembers", {
      channelId,
      userId: args.recipientId,
      role: "member",
      joinedAt: Date.now(),
    });
    
    return channelId;
  },
});

/**
 * Get a single channel with full details
 */
export const getChannel = query({
  args: {
    channelId: v.id("channels"),
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
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check if user has access
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", user._id)
      )
      .first();
    
    // Allow access if member or if admin/superadmin for system channels
    const hasAccess = membership || 
      (channel.isSystemChannel && ["admin", "superadmin"].includes(user.role));
    
    if (!hasAccess) {
      throw new Error("No access to this channel");
    }
    
    // Get members
    const members = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
    
    const memberUsers = await Promise.all(
      members.map(async (member) => {
        const memberUser = await ctx.db.get(member.userId);
        return {
          ...member,
          user: memberUser,
        };
      })
    );
    
    return {
      ...channel,
      members: memberUsers,
      currentUserRole: membership?.role,
    };
  },
});

/**
 * Update channel details
 */
export const updateChannel = mutation({
  args: {
    channelId: v.id("channels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check if user is owner or admin
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    const canEdit = membership?.role === "owner" || 
      membership?.role === "admin" ||
      ["admin", "superadmin"].includes(currentUser.role);
    
    if (!canEdit) {
      throw new Error("No permission to edit this channel");
    }
    
    await ctx.db.patch(args.channelId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Delete (archive) a channel
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
    
    // Only channel owner or superadmin can delete
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    const canDelete = membership?.role === "owner" || 
      currentUser.role === "superadmin";
    
    if (!canDelete) {
      throw new Error("No permission to delete this channel");
    }
    
    // Soft delete by marking as archived
    await ctx.db.patch(args.channelId, {
      archivedAt: Date.now(),
      archivedBy: currentUser._id,
    });
    
    return { success: true };
  },
});