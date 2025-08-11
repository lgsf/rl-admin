import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send notification to all members of a group
 */
export const notifyGroup = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    excludeRoles: v.optional(v.array(v.string())),
    excludeSender: v.optional(v.boolean()),
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

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new Error("Group not found or inactive");
    }

    // Verify sender is a member of the group (unless it's a public group)
    if (group.visibility !== "public") {
      const senderMembership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) => 
          q.eq("groupId", args.groupId).eq("userId", currentUser._id)
        )
        .first();

      if (!senderMembership || senderMembership.status !== "active") {
        throw new Error("You must be an active member to send notifications to this group");
      }
    }

    // Get all active group members
    let members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_status", (q) => 
        q.eq("groupId", args.groupId).eq("status", "active")
      )
      .collect();

    // Filter by roles if specified
    if (args.excludeRoles && args.excludeRoles.length > 0) {
      members = members.filter(m => !args.excludeRoles?.includes(m.role));
    }

    // Exclude sender if specified
    if (args.excludeSender) {
      members = members.filter(m => m.userId !== currentUser._id);
    }

    // Create notifications for each member
    const notifications = await Promise.all(
      members.map(async (member) => {
        // Check member's notification preferences
        const user = await ctx.db.get(member.userId);
        if (!user) return null;

        // Check if member has overridden group notifications
        if (member.notificationOverride?.enabled === false) {
          return null;
        }

        // Check group notification defaults
        if (group.settings?.notificationDefaults?.enabled === false) {
          return null;
        }

        return await ctx.db.insert("notifications", {
          userId: member.userId,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            groupId: args.groupId,
            groupName: group.name,
            sentToGroup: true,
          },
          read: false,
          createdAt: Date.now(),
        });
      })
    );

    const sentCount = notifications.filter(Boolean).length;

    return {
      success: true,
      notificationsSent: sentCount,
      totalMembers: members.length,
      groupName: group.name,
    };
  },
});

/**
 * Send notification to multiple groups
 */
export const notifyMultipleGroups = mutation({
  args: {
    groupIds: v.array(v.id("groups")),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    excludeSender: v.optional(v.boolean()),
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

    const results = await Promise.all(
      args.groupIds.map(async (groupId) => {
        try {
          // Get group
          const group = await ctx.db.get(groupId);
          if (!group || !group.isActive) {
            return { groupId, error: "Group not found or inactive" };
          }

          // Get all active members
          let members = await ctx.db
            .query("groupMembers")
            .withIndex("by_group_status", (q) => 
              q.eq("groupId", groupId).eq("status", "active")
            )
            .collect();

          // Exclude sender if specified
          if (args.excludeSender) {
            members = members.filter(m => m.userId !== currentUser._id);
          }

          // Create notifications
          const notifications = await Promise.all(
            members.map(async (member) => {
              // Check member's notification preferences
              if (member.notificationOverride?.enabled === false) {
                return null;
              }

              // Check group notification defaults
              if (group.settings?.notificationDefaults?.enabled === false) {
                return null;
              }

              return await ctx.db.insert("notifications", {
                userId: member.userId,
                type: args.type,
                title: args.title,
                message: args.message,
                data: {
                  ...args.data,
                  groupId,
                  groupName: group.name,
                  sentToGroup: true,
                  multiGroupNotification: true,
                },
                read: false,
                createdAt: Date.now(),
              });
            })
          );

          const sentCount = notifications.filter(Boolean).length;

          return {
            groupId,
            groupName: group.name,
            notificationsSent: sentCount,
            totalMembers: members.length,
          };
        } catch (error) {
          return {
            groupId,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const successfulGroups = results.filter(r => !('error' in r));
    const totalNotifications = successfulGroups.reduce((sum, r) => 
      sum + (r.notificationsSent || 0), 0
    );

    return {
      success: true,
      totalNotificationsSent: totalNotifications,
      groupsNotified: successfulGroups.length,
      totalGroups: args.groupIds.length,
      results,
    };
  },
});

/**
 * Send notification to groups by type
 */
export const notifyGroupsByType = mutation({
  args: {
    type: v.union(
      v.literal("standalone"),
      v.literal("organization"),
      v.literal("department"),
      v.literal("project"),
      v.literal("custom")
    ),
    organizationId: v.optional(v.id("organizations")),
    notificationType: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get groups by type
    let groupsQuery = ctx.db
      .query("groups")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("isActive"), true));

    // Filter by organization if specified
    if (args.organizationId) {
      groupsQuery = groupsQuery.filter((q) => 
        q.eq(q.field("organizationId"), args.organizationId)
      );
    }

    const groups = await groupsQuery.collect();

    if (groups.length === 0) {
      return {
        success: true,
        message: "No groups found matching criteria",
        groupsNotified: 0,
        totalNotifications: 0,
      };
    }

    // Send notifications to each group
    const results = await Promise.all(
      groups.map(async (group) => {
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_status", (q) => 
            q.eq("groupId", group._id).eq("status", "active")
          )
          .collect();

        const notifications = await Promise.all(
          members.map(async (member) => {
            // Check notification preferences
            if (member.notificationOverride?.enabled === false) {
              return null;
            }

            if (group.settings?.notificationDefaults?.enabled === false) {
              return null;
            }

            return await ctx.db.insert("notifications", {
              userId: member.userId,
              type: args.notificationType,
              title: args.title,
              message: args.message,
              data: {
                ...args.data,
                groupId: group._id,
                groupName: group.name,
                groupType: group.type,
                sentToGroup: true,
              },
              read: false,
              createdAt: Date.now(),
            });
          })
        );

        return {
          groupName: group.name,
          notificationsSent: notifications.filter(Boolean).length,
        };
      })
    );

    const totalNotifications = results.reduce((sum, r) => sum + r.notificationsSent, 0);

    return {
      success: true,
      groupsNotified: groups.length,
      totalNotifications,
      details: results,
    };
  },
});

/**
 * Send notification to all standalone groups (cross-organizational)
 */
export const notifyAllStandaloneGroups = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
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

    // Check if user has permission (e.g., superadmin)
    if (currentUser.role !== "superadmin" && currentUser.role !== "admin") {
      throw new Error("Only admins can send notifications to all standalone groups");
    }

    // Get all standalone groups
    const standaloneGroups = await ctx.db
      .query("groups")
      .withIndex("by_type", (q) => q.eq("type", "standalone"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (standaloneGroups.length === 0) {
      return {
        success: true,
        message: "No standalone groups found",
        totalNotifications: 0,
      };
    }

    // Send to each group
    let totalNotifications = 0;
    const groupResults = [];

    for (const group of standaloneGroups) {
      const members = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_status", (q) => 
          q.eq("groupId", group._id).eq("status", "active")
        )
        .collect();

      let groupNotifications = 0;

      for (const member of members) {
        // Check preferences
        if (member.notificationOverride?.enabled === false) continue;
        if (group.settings?.notificationDefaults?.enabled === false) continue;

        await ctx.db.insert("notifications", {
          userId: member.userId,
          type: args.type,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            groupId: group._id,
            groupName: group.name,
            sentToStandaloneGroups: true,
          },
          read: false,
          createdAt: Date.now(),
        });

        groupNotifications++;
        totalNotifications++;
      }

      groupResults.push({
        groupName: group.name,
        notificationsSent: groupNotifications,
      });
    }

    return {
      success: true,
      groupsNotified: standaloneGroups.length,
      totalNotifications,
      details: groupResults,
    };
  },
});

/**
 * Send notification to group with specific criteria
 */
export const notifyGroupsWithCriteria = mutation({
  args: {
    criteria: v.object({
      minMembers: v.optional(v.number()),
      maxMembers: v.optional(v.number()),
      visibility: v.optional(v.union(
        v.literal("public"),
        v.literal("private"),
        v.literal("organization")
      )),
      hasOwner: v.optional(v.id("users")),
      createdAfter: v.optional(v.number()),
      createdBefore: v.optional(v.number()),
    }),
    notificationType: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get all active groups
    let groups = await ctx.db
      .query("groups")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Apply filters
    if (args.criteria.visibility) {
      groups = groups.filter(g => g.visibility === args.criteria.visibility);
    }

    if (args.criteria.hasOwner) {
      groups = groups.filter(g => g.ownerId === args.criteria.hasOwner);
    }

    if (args.criteria.createdAfter) {
      groups = groups.filter(g => g.createdAt >= args.criteria.createdAfter!);
    }

    if (args.criteria.createdBefore) {
      groups = groups.filter(g => g.createdAt <= args.criteria.createdBefore!);
    }

    // Filter by member count if specified
    if (args.criteria.minMembers || args.criteria.maxMembers) {
      const groupsWithCorrectSize = [];
      
      for (const group of groups) {
        const memberCount = group.memberCount || 0;
        
        if (args.criteria.minMembers && memberCount < args.criteria.minMembers) {
          continue;
        }
        
        if (args.criteria.maxMembers && memberCount > args.criteria.maxMembers) {
          continue;
        }
        
        groupsWithCorrectSize.push(group);
      }
      
      groups = groupsWithCorrectSize;
    }

    if (groups.length === 0) {
      return {
        success: true,
        message: "No groups found matching criteria",
        groupsNotified: 0,
        totalNotifications: 0,
      };
    }

    // Send notifications
    let totalNotifications = 0;
    const results = [];

    for (const group of groups) {
      const members = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_status", (q) => 
          q.eq("groupId", group._id).eq("status", "active")
        )
        .collect();

      let groupNotifications = 0;

      for (const member of members) {
        if (member.notificationOverride?.enabled === false) continue;
        if (group.settings?.notificationDefaults?.enabled === false) continue;

        await ctx.db.insert("notifications", {
          userId: member.userId,
          type: args.notificationType,
          title: args.title,
          message: args.message,
          data: {
            ...args.data,
            groupId: group._id,
            groupName: group.name,
            sentWithCriteria: true,
          },
          read: false,
          createdAt: Date.now(),
        });

        groupNotifications++;
        totalNotifications++;
      }

      results.push({
        groupName: group.name,
        groupType: group.type,
        notificationsSent: groupNotifications,
      });
    }

    return {
      success: true,
      groupsMatched: groups.length,
      totalNotifications,
      criteria: args.criteria,
      results,
    };
  },
});