import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { 
  requirePermission,
  requireOrgMembership,
  getCurrentUserWithOrg,
  hasPermission
} from "./lib/permissions";

/**
 * List tasks with filters and pagination
 */
export const list = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    status: v.optional(v.union(
      v.literal("todo"),
      v.literal("in progress"),
      v.literal("done"),
      v.literal("canceled"),
      v.literal("backlog")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    label: v.optional(v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("documentation"),
      v.literal("enhancement")
    )),
    assigneeId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    // Determine which organization to query
    let orgId = args.organizationId || user.organizationId;
    if (!orgId && user.role !== "superadmin") {
      return []; // No organization access
    }

    // Build query
    let query = orgId 
      ? ctx.db.query("tasks").withIndex("by_organization", (q) =>
          q.eq("organizationId", orgId)
        )
      : ctx.db.query("tasks");

    if (orgId) {
      await requireOrgMembership(ctx, orgId);
    }

    // Apply filters
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority));
    }

    if (args.label) {
      query = query.filter((q) => q.eq(q.field("label"), args.label));
    }

    if (args.assigneeId) {
      query = query.filter((q) => q.eq(q.field("assigneeId"), args.assigneeId));
    }

    if (args.projectId) {
      query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    // Search in title and description
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      query = query.filter((q) =>
        q.or(
          q.eq(q.field("title"), args.search)
        )
      );
    }

    // Check if user can only see their own tasks
    if (hasPermission(user.role, "tasks:read:own") && 
        !hasPermission(user.role, "tasks:read")) {
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("assigneeId"), user._id),
          q.eq(q.field("createdBy"), user._id)
        )
      );
    }

    const limit = args.limit || 100;
    const tasks = await query.take(limit);

    // Enrich with assignee and creator info
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeId 
          ? await ctx.db.get(task.assigneeId)
          : null;
        const creator = await ctx.db.get(task.createdBy);

        return {
          ...task,
          assignee: assignee ? {
            id: assignee._id,
            name: `${assignee.firstName} ${assignee.lastName}`,
            avatar: assignee.avatar,
          } : null,
          creator: creator ? {
            id: creator._id,
            name: `${creator.firstName} ${creator.lastName}`,
            avatar: creator.avatar,
          } : null,
        };
      })
    );

    return enrichedTasks;
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check organization access
    await requireOrgMembership(ctx, task.organizationId);

    // Check if user can only see their own tasks
    const user = await getCurrentUserWithOrg(ctx);
    if (hasPermission(user.role, "tasks:read:own") && 
        !hasPermission(user.role, "tasks:read")) {
      if (task.assigneeId !== user._id && task.createdBy !== user._id) {
        throw new Error("Access denied: Not your task");
      }
    }

    // Enrich with assignee and creator info
    const assignee = task.assigneeId 
      ? await ctx.db.get(task.assigneeId)
      : null;
    const creator = await ctx.db.get(task.createdBy);

    return {
      ...task,
      assignee: assignee ? {
        id: assignee._id,
        name: `${assignee.firstName} ${assignee.lastName}`,
        avatar: assignee.avatar,
      } : null,
      creator: creator ? {
        id: creator._id,
        name: `${creator.firstName} ${creator.lastName}`,
        avatar: creator.avatar,
      } : null,
    };
  },
});

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in progress"),
      v.literal("done"),
      v.literal("canceled"),
      v.literal("backlog")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    label: v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("documentation"),
      v.literal("enhancement")
    ),
    assigneeId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    if (!user.organizationId) {
      throw new Error("Must be part of an organization to create tasks");
    }

    await requirePermission(ctx, "tasks:write");

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      organizationId: user.organizationId,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log audit event
    await ctx.db.insert("auditLogs", {
      organizationId: user.organizationId,
      userId: user._id,
      action: "task.created",
      resource: "tasks",
      resourceId: taskId,
      changes: args,
      createdAt: Date.now(),
    });

    // Create notification for assignee
    if (args.assigneeId && args.assigneeId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: args.assigneeId,
        type: "task.assigned",
        title: "New Task Assigned",
        message: `You have been assigned to: ${args.title}`,
        data: { taskId },
        read: false,
        createdAt: Date.now(),
      });
    }

    return taskId;
  },
});

/**
 * Update a task
 */
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("todo"),
      v.literal("in progress"),
      v.literal("done"),
      v.literal("canceled"),
      v.literal("backlog")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    label: v.optional(v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("documentation"),
      v.literal("enhancement")
    )),
    assigneeId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // Check organization access
    await requireOrgMembership(ctx, task.organizationId);

    // Check permissions
    const canEditAny = hasPermission(user.role, "tasks:write");
    const canEditOwn = hasPermission(user.role, "tasks:write:own");

    if (!canEditAny && (!canEditOwn || 
        (task.assigneeId !== user._id && task.createdBy !== user._id))) {
      throw new Error("Permission denied: Cannot edit this task");
    }

    const { taskId, ...updates } = args;

    // Track if assignee changed
    const oldAssigneeId = task.assigneeId;
    const newAssigneeId = updates.assigneeId;

    // Handle status completion
    let patchData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    if (updates.status === "done" && task.status !== "done") {
      patchData.completedAt = Date.now();
    } else if (updates.status !== "done" && task.status === "done") {
      patchData.completedAt = undefined;
    }

    await ctx.db.patch(taskId, patchData);

    // Log audit event
    if (user.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: user.organizationId,
        userId: user._id,
        action: "task.updated",
        resource: "tasks",
        resourceId: taskId,
        changes: updates,
        createdAt: Date.now(),
      });
    }

    // Notify assignee if changed
    if (newAssigneeId && newAssigneeId !== oldAssigneeId && 
        newAssigneeId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: newAssigneeId,
        type: "task.assigned",
        title: "Task Assigned to You",
        message: `You have been assigned to: ${updates.title || task.title}`,
        data: { taskId },
        read: false,
        createdAt: Date.now(),
      });
    }

    return taskId;
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // Check organization access
    await requireOrgMembership(ctx, task.organizationId);

    // Check permissions
    const canDeleteAny = hasPermission(user.role, "tasks:delete");
    const canDeleteOwn = hasPermission(user.role, "tasks:delete:own");

    if (!canDeleteAny && (!canDeleteOwn || task.createdBy !== user._id)) {
      throw new Error("Permission denied: Cannot delete this task");
    }

    await ctx.db.delete(args.taskId);

    // Log audit event
    if (user.organizationId) {
      await ctx.db.insert("auditLogs", {
        organizationId: user.organizationId,
        userId: user._id,
        action: "task.deleted",
        resource: "tasks",
        resourceId: args.taskId,
        createdAt: Date.now(),
      });
    }

    return args.taskId;
  },
});

/**
 * Get task statistics
 */
export const getStats = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    projectId: v.optional(v.id("projects")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    let orgId = args.organizationId || user.organizationId;
    if (!orgId && user.role !== "superadmin") {
      return null;
    }

    if (orgId) {
      await requireOrgMembership(ctx, orgId);
    }

    let query = orgId
      ? ctx.db.query("tasks").withIndex("by_organization", (q) =>
          q.eq("organizationId", orgId)
        )
      : ctx.db.query("tasks");

    if (args.projectId) {
      query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("assigneeId"), args.userId));
    }

    const tasks = await query.collect();

    const stats = {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(t => t.status === "todo").length,
        inProgress: tasks.filter(t => t.status === "in progress").length,
        done: tasks.filter(t => t.status === "done").length,
        canceled: tasks.filter(t => t.status === "canceled").length,
        backlog: tasks.filter(t => t.status === "backlog").length,
      },
      byPriority: {
        urgent: tasks.filter(t => t.priority === "urgent").length,
        high: tasks.filter(t => t.priority === "high").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        low: tasks.filter(t => t.priority === "low").length,
      },
      byLabel: {
        bug: tasks.filter(t => t.label === "bug").length,
        feature: tasks.filter(t => t.label === "feature").length,
        documentation: tasks.filter(t => t.label === "documentation").length,
        enhancement: tasks.filter(t => t.label === "enhancement").length,
      },
      overdue: tasks.filter(t => 
        t.dueDate && t.dueDate < Date.now() && t.status !== "done"
      ).length,
      completedThisWeek: tasks.filter(t => 
        t.completedAt && t.completedAt > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    };

    return stats;
  },
});