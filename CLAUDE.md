# RL Admin - Convex Integration Plan

## 🎯 Project Overview
Transforming RL Admin dashboard from static mock data to a fully reactive, real-time application powered by Convex backend.

## 📋 Implementation Plan

### Phase 1: Setup & Infrastructure (Day 1)
- [ ] Install and configure Convex
- [ ] Set up Clerk authentication
- [ ] Create database schema
- [ ] Configure environment variables
- [ ] Set up Convex + Clerk integration

### Phase 2: Core Data Models (Day 2-3)
- [ ] Users & Authentication
- [ ] Organizations (multi-tenant support)
- [ ] Tasks management
- [ ] Dashboard metrics
- [ ] Applications catalog
- [ ] Chat/Messages
- [ ] Audit logs

### Phase 3: Backend Functions (Day 4-5)
- [ ] Authentication queries/mutations
- [ ] User CRUD operations
- [ ] Task management functions
- [ ] Dashboard analytics queries
- [ ] Real-time chat functions
- [ ] Application management
- [ ] Settings/preferences

### Phase 4: Frontend Integration (Day 6-7)
- [ ] Replace mock data with Convex queries
- [ ] Implement real-time subscriptions
- [ ] Add optimistic updates
- [ ] Error handling & loading states
- [ ] Permission-based UI rendering

### Phase 5: Advanced Features (Day 8-9)
- [ ] File uploads for user avatars
- [ ] Real-time presence for chat
- [ ] Activity feed/notifications
- [ ] Search functionality
- [ ] Data export features

### Phase 6: Testing & Deployment (Day 10)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex (reactive database)
- **Auth**: Clerk (integrated with Convex)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Routing**: Tanstack Router
- **Charts**: Recharts
- **State**: Convex subscriptions + Zustand

### Data Models

#### Users
```typescript
{
  clerkId: string        // From Clerk auth
  email: string
  firstName: string
  lastName: string
  username: string
  avatar?: string
  role: "admin" | "manager" | "user"
  status: "active" | "inactive" | "suspended"
  organizationId?: Id<"organizations">
  preferences: object
  createdAt: number
  updatedAt: number
}
```

#### Organizations
```typescript
{
  name: string
  slug: string
  logo?: string
  ownerId: Id<"users">
  plan: "free" | "pro" | "enterprise"
  settings: object
  createdAt: number
}
```

#### Tasks
```typescript
{
  title: string
  description?: string
  status: "todo" | "in_progress" | "done" | "canceled"
  priority: "low" | "medium" | "high" | "urgent"
  label: "bug" | "feature" | "documentation" | "enhancement"
  assigneeId?: Id<"users">
  organizationId: Id<"organizations">
  dueDate?: number
  createdBy: Id<"users">
  createdAt: number
  updatedAt: number
}
```

#### Messages (Chat)
```typescript
{
  content: string
  senderId: Id<"users">
  channelId: Id<"channels">
  attachments?: string[]
  editedAt?: number
  deletedAt?: number
  createdAt: number
}
```

#### Applications
```typescript
{
  name: string
  description: string
  icon?: string
  category: string
  version: string
  status: "active" | "maintenance" | "deprecated"
  organizationId: Id<"organizations">
  permissions: string[]
  config: object
  createdAt: number
  updatedAt: number
}
```

#### DashboardMetrics
```typescript
{
  organizationId: Id<"organizations">
  date: string  // YYYY-MM-DD
  revenue: number
  subscriptions: number
  sales: number
  activeUsers: number
  chartData: object[]
}
```

### Convex Functions Structure

```
convex/
├── schema.ts           # Complete database schema
├── auth.ts            # Clerk integration & auth helpers
├── users.ts           # User queries/mutations
├── organizations.ts   # Multi-tenant management
├── tasks.ts           # Task CRUD + real-time
├── dashboard.ts       # Analytics & metrics
├── messages.ts        # Real-time chat
├── apps.ts            # Application catalog
├── files.ts           # File storage handlers
├── lib/
│   ├── permissions.ts # RBAC helpers
│   ├── validators.ts  # Input validation
│   └── helpers.ts     # Utility functions
└── _generated/        # Auto-generated types
```

## 🔐 Security & Permissions

### Role-Based Access Control (RBAC)
```typescript
const ROLES = {
  admin: ["*"],  // Full access
  manager: ["read:*", "write:tasks", "write:users"],
  user: ["read:own", "write:own"]
}
```

### Row-Level Security
- All queries filter by user's organization
- Permission checks in every mutation
- Audit logging for sensitive operations

## 🚀 Real-time Features

### Live Updates
- Dashboard metrics refresh automatically
- Task status changes propagate instantly
- Chat messages appear in real-time
- User presence indicators
- Activity feed updates

### Optimistic Updates
- Immediate UI feedback
- Background synchronization
- Conflict resolution
- Error recovery

## 📝 Development Commands

```bash
# Install dependencies
npm install
npm install convex @clerk/clerk-react

# Development
npm run dev          # Start Vite frontend (uses production Convex deployment)

# Database
npx convex dashboard # Open Convex dashboard
npx convex logs      # View function logs
npx convex deploy    # Deploy to production

# Code quality
npm run lint         # ESLint
npm run format       # Prettier
```

## 🔑 Environment Variables

```env
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://mellow-orca-998.convex.cloud

# Production deployment (always use deployed version)
CONVEX_DEPLOYMENT=prod:mellow-orca-998
```

## 📚 Key Patterns

### Query with Subscription
```typescript
// Frontend
const tasks = useQuery(api.tasks.list, { 
  organizationId 
});

// Backend
export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    return await ctx.db
      .query("tasks")
      .withIndex("by_org", q => 
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});
```

### Mutation with Optimistic Update
```typescript
// Frontend
const createTask = useMutation(api.tasks.create);

// Usage with optimistic update
const handleCreate = async (data) => {
  // Optimistically update UI
  setTasks([...tasks, { ...data, id: 'temp' }]);
  
  try {
    await createTask(data);
  } catch (error) {
    // Revert on error
    setTasks(tasks);
  }
};
```

### Real-time Presence
```typescript
// Track user presence
export const updatePresence = mutation({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.patch(userId, {
      presence: {
        status: args.status,
        lastSeen: Date.now()
      }
    });
  },
});
```

## 🎯 Success Metrics

- [ ] All CRUD operations working with Convex
- [ ] Real-time updates functional
- [ ] Authentication integrated
- [ ] Multi-tenant isolation working
- [ ] Performance < 100ms response time
- [ ] Zero data inconsistencies
- [ ] 100% type safety maintained

## 📅 Timeline

**Week 1**: Backend setup, schema, core functions
**Week 2**: Frontend integration, real-time features, deployment

## 🚦 Current Status

**Phase**: Planning Complete ✅
**Next Step**: Install Convex and set up authentication
**Blockers**: None

---

*Last Updated: 2025-08-08*
*Version: 1.0.0*
## Claude Brain System
This project now uses the Claude Brain System for intelligent assistance.
- Checkpoints: Automatic state preservation
- Todo tracking: Integrated task management
- Memory: Self-learning capabilities

See `.claude/00-README.md` for complete documentation.
