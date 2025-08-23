import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./lib/permissions";
import { internal } from "./_generated/api";

/**
 * Send a message to a channel
 */
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    replyToId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.string())),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    // Verify channel exists and user has access
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Check if user is a member of the channel
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    // Allow if member or if admin/superadmin for system channels
    const hasAccess = membership || 
      (channel.isSystemChannel && ["admin", "superadmin"].includes(currentUser.role));
    
    if (!hasAccess) {
      throw new Error("No access to send messages to this channel");
    }
    
    // If replying, verify the parent message exists
    if (args.replyToId) {
      const parentMessage = await ctx.db.get(args.replyToId);
      if (!parentMessage || parentMessage.channelId !== args.channelId) {
        throw new Error("Invalid reply reference");
      }
    }
    
    // Create the message
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      channelId: args.channelId,
      senderId: currentUser._id,
      replyToId: args.replyToId,
      attachments: args.attachments,
      createdAt: Date.now(),
    });
    
    // Update channel's last message time
    await ctx.db.patch(args.channelId, {
      lastMessageAt: Date.now(),
    });
    
    // Update member's last read time (they've read their own message)
    if (membership) {
      await ctx.db.patch(membership._id, {
        lastReadAt: Date.now(),
      });
    }
    
    // Schedule notification for other channel members
    await ctx.scheduler.runAfter(0, internal.messages.notifyChannelMembers, {
      messageId,
      channelId: args.channelId,
      senderId: currentUser._id,
    });
    
    // Skip audit log in mutation - would need to be in separate mutation
    
    return messageId;
  },
});

/**
 * Get messages for a channel with pagination
 */
export const getMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    messages: v.array(v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      content: v.string(),
      channelId: v.id("channels"),
      senderId: v.id("users"),
      sender: v.optional(v.any()), // User object
      replyToId: v.optional(v.id("messages")),
      replyTo: v.optional(v.any()), // Parent message
      attachments: v.optional(v.array(v.string())),
      fileUrls: v.optional(v.array(v.string())), // URLs for attachments
      fileMetadata: v.optional(v.array(v.any())), // File metadata
      reactions: v.optional(v.array(v.object({
        emoji: v.string(),
        userId: v.id("users"),
        createdAt: v.number(),
      }))),
      editedAt: v.optional(v.number()),
      deletedAt: v.optional(v.number()),
      createdAt: v.number(),
    })),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { messages: [], nextCursor: null };
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      return { messages: [], nextCursor: null };
    }
    
    // Check channel access
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
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
      throw new Error("No access to this channel");
    }
    
    const limit = args.limit ?? 50;
    
    // Get messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_time", (q) => 
        q.eq("channelId", args.channelId)
      )
      .order("desc")
      .take(limit + 1);
    
    // Check if there are more messages
    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
    
    // Enrich messages with sender info and reply references
    const enrichedMessages = await Promise.all(
      paginatedMessages.map(async (message) => {
        // Skip deleted messages unless user is admin
        if (message.deletedAt && !["admin", "superadmin"].includes(user.role)) {
          return {
            ...message,
            content: "[Message deleted]",
            sender: null,
            replyTo: null,
          };
        }
        
        // Get sender info
        const sender = await ctx.db.get(message.senderId);
        
        // Get reply reference if exists
        let replyTo = null;
        if (message.replyToId) {
          const parentMessage = await ctx.db.get(message.replyToId);
          if (parentMessage) {
            const parentSender = await ctx.db.get(parentMessage.senderId);
            replyTo = {
              ...parentMessage,
              sender: parentSender,
            };
          }
        }
        
        // Get file URLs and metadata if there are attachments
        let fileUrls: string[] = [];
        let fileMetadata: any[] = [];
        if (message.attachments && message.attachments.length > 0) {
          const urlPromises = message.attachments.map(storageId => 
            ctx.storage.getUrl(storageId)
          );
          const metadataPromises = message.attachments.map(storageId =>
            ctx.db
              .query("files")
              .withIndex("by_message", q => q.eq("messageId", message._id))
              .filter(q => q.eq(q.field("storageId"), storageId))
              .first()
          );
          
          const [urls, metadata] = await Promise.all([
            Promise.all(urlPromises),
            Promise.all(metadataPromises)
          ]);
          
          fileUrls = urls.filter(url => url !== null) as string[];
          fileMetadata = metadata.filter(m => m !== null);
        }
        
        return {
          ...message,
          sender,
          replyTo,
          fileUrls,
          fileMetadata,
        };
      })
    );
    
    // Reverse to show oldest first
    enrichedMessages.reverse();
    
    const nextCursor = hasMore 
      ? paginatedMessages[paginatedMessages.length - 1]._id 
      : null;
    
    return {
      messages: enrichedMessages,
      nextCursor,
    };
  },
});

/**
 * Edit a message
 */
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Only message sender can edit
    if (message.senderId !== currentUser._id) {
      throw new Error("Can only edit your own messages");
    }
    
    // Can't edit deleted messages
    if (message.deletedAt) {
      throw new Error("Cannot edit deleted message");
    }
    
    // Update the message
    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Check permissions: sender can delete own message, admins can delete any
    const canDelete = message.senderId === currentUser._id || 
      ["admin", "superadmin"].includes(currentUser.role);
    
    if (!canDelete) {
      throw new Error("No permission to delete this message");
    }
    
    // Soft delete
    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Add a reaction to a message
 */
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Check if user has access to the channel
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", message.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    if (!membership) {
      throw new Error("No access to this message");
    }
    
    // Check if user already reacted with this emoji
    const existingReactions = message.reactions || [];
    const hasReacted = existingReactions.some(
      r => r.emoji === args.emoji && r.userId === currentUser._id
    );
    
    if (hasReacted) {
      throw new Error("Already reacted with this emoji");
    }
    
    // Add reaction
    await ctx.db.patch(args.messageId, {
      reactions: [
        ...existingReactions,
        {
          emoji: args.emoji,
          userId: currentUser._id,
          createdAt: Date.now(),
        }
      ],
    });
    
    return null;
  },
});

/**
 * Remove a reaction from a message
 */
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:write");
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Remove only user's own reaction
    const updatedReactions = (message.reactions || []).filter(
      r => !(r.emoji === args.emoji && r.userId === currentUser._id)
    );
    
    await ctx.db.patch(args.messageId, {
      reactions: updatedReactions,
    });
    
    return null;
  },
});

/**
 * Mark channel as read
 */
export const markChannelAsRead = mutation({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "messages:read");
    
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", currentUser._id)
      )
      .first();
    
    if (!membership) {
      throw new Error("Not a member of this channel");
    }
    
    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
    });
    
    return null;
  },
});

/**
 * Update last read time after fetching messages
 */
export const updateLastReadAfterFetch = mutation({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
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
    
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", user._id)
      )
      .first();
    
    if (membership) {
      await ctx.db.patch(membership._id, {
        lastReadAt: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Get unread message count for a channel
 */
export const getUnreadCount = query({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      return 0;
    }
    
    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", user._id)
      )
      .first();
    
    if (!membership) {
      return 0;
    }
    
    const lastReadAt = membership.lastReadAt || 0;
    
    // Count messages after last read
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_channel_time", (q) => 
        q.eq("channelId", args.channelId)
      )
      .filter((q) => q.gt(q.field("createdAt"), lastReadAt))
      .collect();
    
    return unreadMessages.length;
  },
});

/**
 * Internal: Update last read timestamp
 */
export const updateLastRead = internalMutation({
  args: {
    membershipId: v.id("channelMembers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.membershipId, {
      lastReadAt: Date.now(),
    });
    return null;
  },
});

/**
 * Internal: Notify channel members of new message
 */
export const notifyChannelMembers = internalMutation({
  args: {
    messageId: v.id("messages"),
    channelId: v.id("channels"),
    senderId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    const channel = await ctx.db.get(args.channelId);
    const sender = await ctx.db.get(args.senderId);
    
    if (!message || !channel || !sender) {
      return null;
    }
    
    // Get all channel members except sender
    const members = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.neq(q.field("userId"), args.senderId))
      .collect();
    
    // Create notifications for each member
    for (const member of members) {
      await ctx.db.insert("notifications", {
        userId: member.userId,
        type: "message",
        title: `New message in ${channel.name}`,
        message: `${sender.firstName}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`,
        data: {
          channelId: args.channelId,
          messageId: args.messageId,
        },
        read: false,
        createdAt: Date.now(),
      });
    }
    
    return null;
  },
});