# Backend Development Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Framework: ALWAYS Convex
2. Language: ALWAYS TypeScript
3. Code Style: ALWAYS Clean Code
4. Comments: NEVER allowed
5. Testing: ALWAYS required

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER use any backend framework except Convex
❌ NEVER write comments in code
❌ NEVER use generic names (data, temp, flag, obj, val, item)
❌ NEVER use single-letter variables (except loop indices i, j, k)
❌ NEVER create functions > 20 lines
❌ NEVER use `any` TypeScript type
❌ NEVER hardcode secrets or credentials
❌ NEVER skip input validation
❌ NEVER ignore error handling

### REQUIRED ACTIONS
✅ ALWAYS use Convex for ALL backend operations
✅ ALWAYS write self-documenting code
✅ ALWAYS use descriptive names
✅ ALWAYS validate ALL inputs
✅ ALWAYS handle ALL errors
✅ ALWAYS use TypeScript strict mode
✅ ALWAYS implement authentication
✅ ALWAYS use environment variables for secrets

## FILE STRUCTURE PATTERN (MANDATORY)
```
convex/
├── _generated/          # AUTO-GENERATED - DO NOT MODIFY
├── schema.ts           # ALL table definitions
├── queries.ts          # ALL read operations
├── mutations.ts        # ALL write operations
├── actions.ts          # External API calls only
├── http.ts            # HTTP endpoints if needed
└── auth.config.ts     # Authentication configuration
```

## NAMING PATTERNS (USE EXACTLY AS SHOWN)

### Function Name Templates
```typescript
// Query Functions (READ operations)
get{EntityName}ById
get{EntityName}List
get{EntityName}By{Property}
search{EntityName}
count{EntityName}

// Mutation Functions (WRITE operations)  
create{EntityName}
update{EntityName}
delete{EntityName}
archive{EntityName}
restore{EntityName}

// Validation Functions
validate{EntityName}
is{Condition}
has{Property}
can{Action}
should{Action}

// Examples:
getUserById
createUser
validateUserEmail
isEmailValid
hasAdminAccess
canDeletePost
```

### Variable Name Templates
```typescript
// Collections/Arrays
{entity}List         // userList, productList
{entity}Array        // userArray, productArray
all{Entities}        // allUsers, allProducts

// Single Items
current{Entity}      // currentUser, currentOrder
selected{Entity}     // selectedProduct, selectedItem
{action}{Entity}     // createdUser, updatedProduct

// Booleans
is{State}           // isLoading, isValid, isAuthenticated
has{Property}       // hasAccess, hasPermission
can{Action}         // canEdit, canDelete
should{Action}      // shouldUpdate, shouldRefresh

// Counts/Numbers
{entity}Count       // userCount, itemCount
total{Entities}     // totalUsers, totalOrders
max{Property}       // maxRetries, maxAttempts
```

## CONVEX IMPLEMENTATION TEMPLATES

### Schema Definition Template
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  {tableName}: defineTable({
    // Required fields first
    {requiredField}: v.string(),
    {requiredField2}: v.number(),
    
    // Optional fields next
    {optionalField}: v.optional(v.string()),
    
    // Relationships last
    {foreignKey}Id: v.id("{relatedTable}"),
  })
    .index("by_{indexField}", ["{indexField}"])
    .index("by_{field1}_{field2}", ["{field1}", "{field2}"]),
});
```

### Query Function Template
```typescript
// convex/queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get{EntityName}ById = query({
  args: { 
    {entityName}Id: v.id("{tableName}") 
  },
  handler: async (ctx, args) => {
    const {entityName} = await ctx.db.get(args.{entityName}Id);
    
    if (!{entityName}) {
      throw new Error("{EntityName} not found");
    }
    
    return {entityName};
  },
});
```

### Mutation Function Template
```typescript
// convex/mutations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create{EntityName} = mutation({
  args: {
    {field1}: v.string(),
    {field2}: v.number(),
  },
  handler: async (ctx, args) => {
    // Step 1: Validate
    if (!args.{field1} || args.{field1}.length === 0) {
      throw new Error("{Field1} is required");
    }
    
    // Step 2: Check authorization
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Step 3: Execute
    const {entityName}Id = await ctx.db.insert("{tableName}", {
      {field1}: args.{field1},
      {field2}: args.{field2},
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
    
    // Step 4: Return
    return {entityName}Id;
  },
});
```

## ERROR HANDLING PATTERN
```typescript
// ALWAYS use this error handling structure
try {
  // Operation
  const result = await operation();
  return result;
} catch (error) {
  // Specific error types first
  if (error instanceof ConvexError) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (error instanceof ValidationError) {
    throw new Error(`Validation failed: ${error.message}`);
  }
  
  // Generic error last
  throw new Error(`Operation failed: ${error.message}`);
}
```

## VALIDATION PATTERN
```typescript
// ALWAYS validate in this order
function validate{EntityName}(data: {EntityName}Input): void {
  // 1. Required fields
  if (!data.requiredField) {
    throw new Error("requiredField is required");
  }
  
  // 2. Type validation
  if (typeof data.numberField !== "number") {
    throw new Error("numberField must be a number");
  }
  
  // 3. Format validation
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
  
  // 4. Business rules
  if (data.age < 18) {
    throw new Error("Must be 18 or older");
  }
  
  // 5. Range validation
  if (data.quantity < 1 || data.quantity > 100) {
    throw new Error("Quantity must be between 1 and 100");
  }
}
```

## AUTHENTICATION PATTERN
```typescript
// ALWAYS check authentication first in mutations
export const protected{Operation} = mutation({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // FIRST: Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    // SECOND: Authorization check
    const userRole = await getUserRole(ctx, identity.subject);
    if (!hasRequiredPermission(userRole, "{operation}")) {
      throw new Error("Insufficient permissions");
    }
    
    // THIRD: Business logic
    // ... rest of handler
  },
});
```

## PERFORMANCE OPTIMIZATION RULES

### Index Usage Rules
1. CREATE index for ANY field used in queries
2. CREATE compound index for multi-field queries
3. NAME indexes as "by_{field}" or "by_{field1}_{field2}"

### Query Optimization Rules
1. USE `.take(limit)` for ALL list queries
2. USE `.paginate()` for large datasets
3. USE `.withIndex()` for filtered queries
4. NEVER fetch entire table without pagination

### Caching Rules
1. LEVERAGE Convex automatic caching
2. USE reactive queries for real-time data
3. AVOID redundant database calls

## TESTING REQUIREMENTS FOR BACKEND

### Test File Structure
```typescript
// {functionName}.test.ts
describe("{functionName}", () => {
  // Success cases
  it("should {expectedBehavior} when {validCondition}", async () => {
    // Test implementation
  });
  
  // Error cases
  it("should throw error when {invalidCondition}", async () => {
    // Test implementation
  });
  
  // Edge cases
  it("should handle {edgeCase}", async () => {
    // Test implementation
  });
});
```

## SELF-VALIDATION CHECKLIST

Before considering ANY backend code complete, verify:
- [ ] All functions < 20 lines
- [ ] All names are descriptive
- [ ] No comments in code
- [ ] All inputs validated
- [ ] All errors handled
- [ ] Authentication implemented
- [ ] Indexes created for queries
- [ ] TypeScript types explicit (no `any`)
- [ ] Environment variables used for secrets
- [ ] Tests written for all functions

## EXECUTION SEQUENCE FOR NEW FEATURES

1. **Define Schema** in `convex/schema.ts`
2. **Create Indexes** for query fields
3. **Write Validators** for input data
4. **Implement Queries** in `convex/queries.ts`
5. **Implement Mutations** in `convex/mutations.ts`
6. **Add Authentication** checks
7. **Handle Errors** explicitly
8. **Write Tests** for all operations
9. **Verify Performance** with pagination

## COMMON ANTIPATTERNS TO AVOID

```typescript
// ❌ NEVER DO THIS
const data = await ctx.db.query("users").collect(); // No pagination
function processData(obj: any) { } // Using 'any'
const temp = users.filter(u => u.a > 18); // Unclear names
// This function calculates tax - Comment instead of clear code

// ✅ ALWAYS DO THIS
const paginatedUsers = await ctx.db.query("users").paginate(opts);
function processUserProfile(userProfile: UserProfile) { }
const adultUsers = users.filter(user => user.age > ADULT_AGE);
function calculateTaxAmount(basePrice: number, taxRate: number) { }