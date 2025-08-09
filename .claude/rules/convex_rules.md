# Convex Rules for AI Code Generation

## Core Principles
1. Use TypeScript for all Convex functions
2. Leverage Convex's type safety with the `v` validator
3. Use proper schema definitions with indexes
4. Always check authentication and permissions
5. Utilize Convex's reactive real-time features

## Function Patterns

### Queries
```typescript
export const getItem = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Mutations
```typescript
export const createItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    return await ctx.db.insert("items", {
      name: args.name,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});
```

### Actions (for third-party APIs)
```typescript
export const fetchExternal = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    return await response.json();
  },
});
```

## Schema Best Practices
1. Always define indexes for commonly queried fields
2. Use proper value types (v.string(), v.number(), v.id())
3. Make fields optional with v.optional()
4. Use v.union() for multiple types
5. Define relationships with v.id("tableName")

## Security Rules
1. Always validate user identity in mutations
2. Check permissions before data access
3. Use ctx.auth.getUserIdentity() for auth
4. Implement row-level security
5. Validate all inputs with proper types

## Performance Guidelines
1. Use indexes for all queries
2. Paginate large result sets
3. Avoid N+1 queries - batch when possible
4. Use ctx.db.query() with filters efficiently
5. Cache computed values when appropriate

## Real-time Features
1. Queries automatically subscribe to changes
2. Use mutations to trigger updates
3. Avoid polling - leverage reactivity
4. Keep subscriptions focused and efficient

## Multi-tenant Patterns
```typescript
// Always filter by organization
export const listItems = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Check user has access to organization
    const hasAccess = await checkOrgAccess(ctx, args.organizationId);
    if (!hasAccess) throw new Error("Access denied");
    
    return await ctx.db
      .query("items")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});
```

## Error Handling
1. Throw descriptive errors for debugging
2. Use ConvexError for client-visible errors
3. Log errors appropriately
4. Handle edge cases gracefully
5. Provide helpful error messages

## Testing Patterns
1. Use Convex's testing utilities
2. Mock authentication in tests
3. Test permissions thoroughly
4. Verify real-time updates
5. Test error scenarios

## File Organization
- `/convex/schema.ts` - Database schema
- `/convex/auth.ts` - Authentication functions
- `/convex/[feature].ts` - Feature-specific functions
- `/convex/_generated/` - Auto-generated files (don't edit)
- `/convex/lib/` - Shared utilities

## Don'ts
- Don't use async/await in schema definitions
- Don't store sensitive data unencrypted
- Don't bypass permission checks
- Don't use ctx.db in actions (use mutations)
- Don't create circular dependencies