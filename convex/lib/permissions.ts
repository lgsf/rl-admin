import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

export type Role = "superadmin" | "admin" | "manager" | "cashier" | "user";

export const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 5,
  admin: 4,
  manager: 3,
  cashier: 2,
  user: 1,
};

export const PERMISSIONS = {
  superadmin: ["*"],
  admin: [
    "users:*",
    "tasks:*",
    "apps:*",
    "dashboard:*",
    "messages:*",
    "organizations:read",
    "organizations:write",
  ],
  manager: [
    "users:read",
    "users:write",
    "tasks:*",
    "apps:read",
    "apps:install",
    "dashboard:*",
    "messages:*",
  ],
  cashier: [
    "tasks:read",
    "tasks:write:own",
    "dashboard:read",
    "messages:*",
  ],
  user: [
    "tasks:read:own",
    "dashboard:read:limited",
    "messages:read",
    "messages:write:own",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: Role,
  permission: string,
  context?: { ownerId?: Id<"users">; userId?: Id<"users"> }
): boolean {
  const permissions = PERMISSIONS[userRole] || [];

  // Check for wildcard permission
  if (permissions.includes("*")) return true;

  // Check for exact permission
  if (permissions.includes(permission)) return true;

  // Check for resource wildcard (e.g., "tasks:*")
  const [resource, action, scope] = permission.split(":");
  if (permissions.some(p => p === `${resource}:*`)) return true;

  // Check for ownership-based permissions
  if (scope === "own" && context?.ownerId && context?.userId) {
    const ownPermission = `${resource}:${action}:own`;
    if (permissions.includes(ownPermission)) {
      return context.ownerId === context.userId;
    }
  }

  return false;
}

/**
 * Check if a user can perform an action on another user based on role hierarchy
 */
export function canManageUser(actorRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get the current user from context with organization check
 */
export async function getCurrentUserWithOrg(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> & { organization?: Doc<"organizations"> }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: No identity found");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.organizationId) {
    const organization = await ctx.db.get(user.organizationId);
    return { ...user, organization: organization || undefined };
  }

  return user;
}

/**
 * Ensure user has permission or throw
 */
export async function requirePermission(
  ctx: QueryCtx | MutationCtx,
  permission: string,
  context?: { ownerId?: Id<"users"> }
): Promise<Doc<"users">> {
  const user = await getCurrentUserWithOrg(ctx);
  
  const hasAccess = hasPermission(user.role, permission, {
    ownerId: context?.ownerId,
    userId: user._id,
  });

  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return user;
}

/**
 * Check if user belongs to organization
 */
export async function requireOrgMembership(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">
): Promise<Doc<"users">> {
  const user = await getCurrentUserWithOrg(ctx);

  if (user.role === "superadmin") {
    return user; // Superadmins can access all organizations
  }

  if (user.organizationId !== organizationId) {
    // Check if user has membership through memberships table
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("organizationId", organizationId)
      )
      .first();

    if (!membership) {
      throw new Error("Access denied: Not a member of this organization");
    }
  }

  return user;
}

/**
 * Filter query results based on user's organization
 */
export async function filterByOrganization<T extends { organizationId: Id<"organizations"> }>(
  ctx: QueryCtx,
  items: T[]
): Promise<T[]> {
  const user = await getCurrentUserWithOrg(ctx);

  if (user.role === "superadmin") {
    return items; // Superadmins see everything
  }

  if (!user.organizationId) {
    return []; // Users without organization see nothing
  }

  return items.filter(item => item.organizationId === user.organizationId);
}