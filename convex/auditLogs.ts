import { query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./lib/permissions";

/**
 * List audit logs with filtering
 */
export const list = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    userId: v.optional(v.id("users")),
    action: v.optional(v.string()),
    resource: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "audit:read");
    
    // Only admins and superadmins can view audit logs
    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      throw new Error("Insufficient permissions to view audit logs");
    }
    
    let query = ctx.db.query("auditLogs");
    
    // Filter by organization if specified
    if (args.organizationId) {
      query = query.filter(q => q.eq(q.field("organizationId"), args.organizationId));
    }
    
    // Filter by user if specified
    if (args.userId) {
      query = query.filter(q => q.eq(q.field("userId"), args.userId));
    }
    
    // Filter by action if specified
    if (args.action) {
      query = query.filter(q => q.eq(q.field("action"), args.action));
    }
    
    // Filter by resource type if specified
    if (args.resource) {
      query = query.filter(q => q.eq(q.field("resource"), args.resource));
    }
    
    // Filter by resource ID if specified
    if (args.resourceId) {
      query = query.filter(q => q.eq(q.field("resourceId"), args.resourceId));
    }
    
    const limit = args.limit || 100;
    const logs = await query.order("desc").take(limit);
    
    // Get user details for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        let targetUser: any = null;
        if (log.resourceId && log.resource === "users") {
          targetUser = await ctx.db.get(log.resourceId as any);
        }
        
        return {
          ...log,
          userName: user?.username || user?.email || "Unknown",
          userEmail: user?.email,
          targetUserName: targetUser ? (targetUser.username || targetUser.email) : undefined,
        };
      })
    );
    
    return logsWithUsers;
  },
});

/**
 * Get audit logs for a specific user
 */
export const getForUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requirePermission(ctx, "audit:read");
    
    // Only admins and superadmins can view audit logs
    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
      throw new Error("Insufficient permissions to view audit logs");
    }
    
    const limit = args.limit || 50;
    
    // Get logs where user is either the actor or the target
    const logsAsActor = await ctx.db
      .query("auditLogs")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(limit);
    
    const logsAsTarget = await ctx.db
      .query("auditLogs")
      .filter(q => 
        q.and(
          q.eq(q.field("resource"), "users"),
          q.eq(q.field("resourceId"), args.userId)
        )
      )
      .order("desc")
      .take(limit);
    
    // Combine and sort by date
    const allLogs = [...logsAsActor, ...logsAsTarget]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
    
    // Get user details
    const logsWithUsers = await Promise.all(
      allLogs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: user?.username || user?.email || "Unknown",
          userEmail: user?.email,
        };
      })
    );
    
    return logsWithUsers;
  },
});