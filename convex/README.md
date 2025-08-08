# Convex Backend

This directory contains all the Convex backend functions for RL Admin.

## Setup Instructions

1. Create a Convex account at https://convex.dev
2. Run `npx convex dev` to connect to your Convex deployment
3. The Convex CLI will guide you through the setup process

## Structure

- `schema.ts` - Database schema definitions
- `auth.ts` - Authentication functions with Clerk
- `users.ts` - User management functions
- `tasks.ts` - Task CRUD operations
- `dashboard.ts` - Dashboard metrics and analytics
- `messages.ts` - Real-time chat functions
- `apps.ts` - Application catalog management
- `organizations.ts` - Multi-tenant organization management
- `lib/` - Shared utilities and helpers