import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new organization
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    logo: v.optional(v.string()),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))),
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

    // Generate slug from name if not provided
    const slug = args.slug || args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingOrg) {
      throw new Error("Organization with this slug already exists");
    }

    // Create the organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      logo: args.logo,
      ownerId: user._id,
      plan: args.plan || "free",
      settings: {
        allowInvites: true,
        maxUsers: 100,
        features: ["tasks", "chat", "dashboard"],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user with organization
    await ctx.db.patch(user._id, {
      organizationId,
      updatedAt: Date.now(),
    });

    // Create organization membership
    await ctx.db.insert("memberships", {
      organizationId,
      userId: user._id,
      role: "owner",
      joinedAt: Date.now(),
    });

    return organizationId;
  },
});

/**
 * Get organization by ID
 */
export const get = query({
  args: { id: v.id("organizations") },
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

    // Check if user is member of this organization
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", args.id)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this organization");
    }

    return await ctx.db.get(args.id);
  },
});

/**
 * Get current user's organization
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.organizationId) {
      return null;
    }

    return await ctx.db.get(user.organizationId);
  },
});

/**
 * List organizations for current user
 */
export const listForUser = query({
  args: {},
  handler: async (ctx) => {
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

    // Get all memberships for this user
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get organizations for each membership
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return org ? { ...org, role: membership.role } : null;
      })
    );

    return organizations.filter(Boolean);
  },
});

/**
 * Update organization
 */
export const update = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))),
    settings: v.optional(v.object({
      allowInvites: v.optional(v.boolean()),
      maxUsers: v.optional(v.number()),
      features: v.optional(v.array(v.string())),
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

    const organization = await ctx.db.get(args.id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if user is owner or admin
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", args.id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Only owners and admins can update organization");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.logo !== undefined) updates.logo = args.logo;
    if (args.plan !== undefined) updates.plan = args.plan;
    if (args.settings !== undefined) {
      updates.settings = {
        ...organization.settings,
        ...args.settings,
      };
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Invite user to organization
 */
export const inviteUser = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const inviter = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!inviter) {
      throw new Error("User not found");
    }

    // Check if inviter has permission
    const inviterMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", inviter._id).eq("organizationId", args.organizationId)
      )
      .first();

    if (!inviterMembership || (inviterMembership.role !== "owner" && inviterMembership.role !== "admin")) {
      throw new Error("Only owners and admins can invite users");
    }

    // Check if user exists
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!invitedUser) {
      // User doesn't exist yet - they need to sign up first
      throw new Error("User not found. They need to sign up first before being invited.");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", invitedUser._id).eq("organizationId", args.organizationId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    // Add user to organization
    await ctx.db.insert("memberships", {
      organizationId: args.organizationId,
      userId: invitedUser._id,
      role: args.role || "member",
      joinedAt: Date.now(),
    });

    // Update user's organization if they don't have one
    if (!invitedUser.organizationId) {
      await ctx.db.patch(invitedUser._id, {
        organizationId: args.organizationId,
        updatedAt: Date.now(),
      });
    }

    return invitedUser._id;
  },
});

/**
 * Remove user from organization
 */
export const removeUser = mutation({
  args: {
    organizationId: v.id("organizations"),
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

    // Check if current user has permission
    const currentUserMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", currentUser._id).eq("organizationId", args.organizationId)
      )
      .first();

    if (!currentUserMembership || (currentUserMembership.role !== "owner" && currentUserMembership.role !== "admin")) {
      throw new Error("Only owners and admins can remove users");
    }

    // Check if trying to remove owner
    const targetMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("User is not a member of this organization");
    }

    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove organization owner");
    }

    // Remove membership
    await ctx.db.delete(targetMembership._id);

    // If this was user's primary organization, clear it
    const targetUser = await ctx.db.get(args.userId);
    if (targetUser && targetUser.organizationId === args.organizationId) {
      await ctx.db.patch(args.userId, {
        organizationId: undefined,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

/**
 * Switch user's active organization
 */
export const switchOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
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

    // Check if user is member of this organization
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this organization");
    }

    // Update user's active organization
    await ctx.db.patch(user._id, {
      organizationId: args.organizationId,
      updatedAt: Date.now(),
    });

    return args.organizationId;
  },
});