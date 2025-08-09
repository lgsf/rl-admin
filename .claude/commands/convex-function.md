---
description: Generate Convex query, mutation, or action with proper types and permissions
---

# Create Convex Function

Generate a new Convex function following best practices with TypeScript, validation, and permission checks.

## Function Types:
1. **Query**: Read data (reactive, cached)
2. **Mutation**: Write data (transactional)
3. **Action**: External API calls or side effects

## Usage:
/convex-function [type] [name] [options]

## Arguments:
$ARGUMENTS - Function details in format: "type name --table=tableName --auth --permissions"

## Examples:

### Query Example:
```
/convex-function query listOrganizations --auth --paginated
```

### Mutation Example:
```
/convex-function mutation createApplication --table=applications --auth --audit
```

### Action Example:
```
/convex-function action deployApplication --external-api
```

## Generated Patterns:

### Basic Query:
```typescript
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Authenticated Mutation:
```typescript
export const createItem = mutation({
  args: { 
    organizationId: v.id("organizations"),
    name: v.string(),
    data: v.object({...})
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Check permissions
    const hasAccess = await checkPermission(
      ctx, 
      args.organizationId, 
      "items:create"
    );
    if (!hasAccess) throw new Error("Access denied");
    
    // Create with audit
    const itemId = await ctx.db.insert("items", {
      ...args.data,
      organizationId: args.organizationId,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });
    
    // Audit log
    await createAuditLog(ctx, {
      action: "items.create",
      resourceId: itemId,
      organizationId: args.organizationId,
    });
    
    return itemId;
  },
});
```

### Multi-Tenant Query:
```typescript
export const listByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Verify access to organization
    const membership = await getUserMembership(ctx, args.organizationId);
    if (!membership) throw new Error("Access denied");
    
    // Query with index
    const query = ctx.db
      .query("items")
      .withIndex("by_org", (q) => 
        q.eq("organizationId", args.organizationId)
      );
    
    // Pagination
    const items = await paginate(query, {
      limit: args.limit || 10,
      cursor: args.cursor,
    });
    
    return items;
  },
});
```

## Flags:
- `--auth`: Add authentication check
- `--permissions`: Add permission validation
- `--audit`: Add audit logging
- `--paginated`: Add pagination support
- `--realtime`: Optimize for real-time updates
- `--cached`: Add caching logic
- `--multi-tenant`: Add organization filtering