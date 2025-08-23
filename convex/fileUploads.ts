import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./lib/permissions";
import { Id } from "./_generated/dataModel";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePermission(ctx, "messages:write");
    
    // Generate and return storage upload URL (expires in 1 hour)
    return await ctx.storage.generateUploadUrl();
  },
});

// Send message with file attachment
export const sendMessageWithFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    channelId: v.id("channels"),
    messageContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "messages:write");
    
    // Check channel access
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // For direct messages, check if user is involved
    if (channel.type === "direct") {
      if (channel.createdBy !== user._id && channel.recipientId !== user._id) {
        throw new Error("No access to this direct message");
      }
    } else {
      // For other channels, check membership
      const member = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_user", q => 
          q.eq("channelId", args.channelId).eq("userId", user._id)
        )
        .first();
        
      const hasAccess = member || 
        (channel.isSystemChannel && ["admin", "superadmin"].includes(user.role));
        
      if (!hasAccess) {
        throw new Error("Not a member of this channel");
      }
    }
    
    // Create message with file attachment
    const messageId = await ctx.db.insert("messages", {
      content: args.messageContent || `📎 ${args.fileName}`,
      channelId: args.channelId,
      senderId: user._id,
      attachments: [args.storageId],
      createdAt: Date.now(),
    });
    
    // Store file metadata using existing schema fields
    await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.fileName,
      mimeType: args.fileType,
      size: args.fileSize,
      uploadedBy: user._id,
      organizationId: channel.organizationId,
      parentType: "message",
      parentId: messageId.toString(),
      channelId: args.channelId,
      messageId: messageId as Id<"messages">,
      createdAt: Date.now(),
    });
    
    // Update channel last message time
    await ctx.db.patch(args.channelId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return messageId;
  },
});

// Get file URL for display
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "messages:read");
    
    // Get public URL for the file
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

// Get files for a channel
export const getChannelFiles = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "messages:read");
    
    const limit = args.limit || 50;
    
    // Get files for the channel
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("channelId"), args.channelId))
      .order("desc")
      .take(limit);
    
    // Enrich with URLs
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        return {
          ...file,
          url,
        };
      })
    );
    
    return filesWithUrls;
  },
});

// Delete a file
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "messages:write");
    
    // Get the file
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Check if user can delete (uploader or admin)
    if (file.uploadedBy !== user._id && user.role !== "superadmin" && user.role !== "admin") {
      throw new Error("Unauthorized to delete this file");
    }
    
    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete metadata
    await ctx.db.delete(args.fileId);
    
    return { success: true };
  },
});