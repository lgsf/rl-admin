import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { 
  requirePermission,
  requireOrgMembership,
  getCurrentUserWithOrg,
  hasPermission
} from "./lib/permissions";

/**
 * Get dashboard metrics for a specific period
 */
export const getMetrics = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    startDate: v.optional(v.string()), // YYYY-MM-DD
    endDate: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    // Check permissions
    const canViewFull = hasPermission(user.role, "dashboard:read");
    const canViewLimited = hasPermission(user.role, "dashboard:read:limited");

    if (!canViewFull && !canViewLimited) {
      throw new Error("Permission denied: Cannot view dashboard");
    }

    let orgId = args.organizationId || user.organizationId;
    if (!orgId && user.role !== "superadmin") {
      throw new Error("No organization context");
    }

    if (orgId) {
      await requireOrgMembership(ctx, orgId);
    }

    // Set date range based on period
    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (args.startDate && args.endDate) {
      startDate = args.startDate;
      endDate = args.endDate;
    } else {
      endDate = now.toISOString().split('T')[0];
      
      switch (args.period) {
        case "daily":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          break;
        case "monthly":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          break;
        case "yearly":
          startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          break;
      }
    }

    // Fetch metrics
    let metricsQuery = ctx.db
      .query("dashboardMetrics")
      .withIndex("by_org_date", (q) => {
        let query = q.eq("organizationId", orgId!);
        return query;
      })
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate),
          q.eq(q.field("period"), args.period)
        )
      );

    const metrics = await metricsQuery.collect();

    // If no metrics exist, generate sample data (for demo)
    if (metrics.length === 0) {
      return generateSampleMetrics(args.period, startDate, endDate);
    }

    // Calculate aggregates
    const totals = metrics.reduce((acc, m) => ({
      revenue: acc.revenue + m.revenue,
      subscriptions: acc.subscriptions + m.subscriptions,
      sales: acc.sales + m.sales,
      activeUsers: Math.max(acc.activeUsers, m.activeUsers),
      newUsers: acc.newUsers + m.newUsers,
    }), {
      revenue: 0,
      subscriptions: 0,
      sales: 0,
      activeUsers: 0,
      newUsers: 0,
    });

    // Calculate growth rates
    const previousPeriodMetrics = metrics.slice(0, Math.floor(metrics.length / 2));
    const currentPeriodMetrics = metrics.slice(Math.floor(metrics.length / 2));

    const previousRevenue = previousPeriodMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const currentRevenue = currentPeriodMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Apply limited view restrictions
    if (canViewLimited && !canViewFull) {
      return {
        totals: {
          ...totals,
          revenue: 0, // Hide sensitive financial data
        },
        growth: {
          revenue: 0,
          subscriptions: Math.round(revenueGrowth),
          sales: 0,
          activeUsers: 0,
        },
        chartData: metrics.map(m => ({
          date: m.date,
          activeUsers: m.activeUsers,
          newUsers: m.newUsers,
        })),
      };
    }

    return {
      totals,
      growth: {
        revenue: revenueGrowth,
        subscriptions: calculateGrowth(previousPeriodMetrics, currentPeriodMetrics, 'subscriptions'),
        sales: calculateGrowth(previousPeriodMetrics, currentPeriodMetrics, 'sales'),
        activeUsers: calculateGrowth(previousPeriodMetrics, currentPeriodMetrics, 'activeUsers'),
      },
      chartData: metrics.map(m => ({
        date: m.date,
        revenue: m.revenue,
        subscriptions: m.subscriptions,
        sales: m.sales,
        activeUsers: m.activeUsers,
        newUsers: m.newUsers,
      })),
      metrics,
    };
  },
});

/**
 * Get overview statistics
 */
export const getOverview = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    await requirePermission(ctx, "dashboard:read");

    let orgId = args.organizationId || user.organizationId;
    if (!orgId && user.role !== "superadmin") {
      throw new Error("No organization context");
    }

    if (orgId) {
      await requireOrgMembership(ctx, orgId);
    }

    // Get current month metrics
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      .toISOString().slice(0, 7);

    const currentMetrics = await ctx.db
      .query("dashboardMetrics")
      .withIndex("by_org_date", (q) => q.eq("organizationId", orgId!))
      .filter((q) => q.gte(q.field("date"), currentMonth))
      .collect();

    const lastMetrics = await ctx.db
      .query("dashboardMetrics")
      .withIndex("by_org_date", (q) => q.eq("organizationId", orgId!))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), lastMonth),
          q.lt(q.field("date"), currentMonth)
        )
      )
      .collect();

    // Calculate totals
    const currentTotals = calculateTotals(currentMetrics);
    const lastTotals = calculateTotals(lastMetrics);

    // Get recent sales (mock data for now)
    const recentSales = await getRecentSales(ctx, orgId!);

    return {
      totalRevenue: {
        value: currentTotals.revenue,
        change: calculatePercentageChange(lastTotals.revenue, currentTotals.revenue),
      },
      subscriptions: {
        value: currentTotals.subscriptions,
        change: calculatePercentageChange(lastTotals.subscriptions, currentTotals.subscriptions),
      },
      sales: {
        value: currentTotals.sales,
        change: calculatePercentageChange(lastTotals.sales, currentTotals.sales),
      },
      activeNow: {
        value: currentTotals.activeUsers,
        change: currentTotals.newUsers, // Show new users since last hour
      },
      recentSales,
      chartData: generateChartData(currentMetrics),
    };
  },
});

/**
 * Record a metric data point
 */
export const recordMetric = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    revenue: v.number(),
    subscriptions: v.number(),
    sales: v.number(),
    activeUsers: v.number(),
    newUsers: v.number(),
    churnRate: v.optional(v.number()),
    averageOrderValue: v.optional(v.number()),
    conversionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    await requirePermission(ctx, "dashboard:write");

    if (!user.organizationId) {
      throw new Error("Must be part of an organization");
    }

    // Check if metric already exists for this date and period
    const existing = await ctx.db
      .query("dashboardMetrics")
      .withIndex("by_org_date", (q) => 
        q.eq("organizationId", user.organizationId!)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("period"), args.period)
        )
      )
      .first();

    if (existing) {
      // Update existing metric
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new metric
    const metricId = await ctx.db.insert("dashboardMetrics", {
      ...args,
      organizationId: user.organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return metricId;
  },
});

// Helper functions

function calculateGrowth(
  previous: any[],
  current: any[],
  field: string
): number {
  const prevValue = previous.reduce((sum, m) => sum + (m[field] || 0), 0);
  const currValue = current.reduce((sum, m) => sum + (m[field] || 0), 0);
  
  if (prevValue === 0) return 0;
  return ((currValue - prevValue) / prevValue) * 100;
}

function calculateTotals(metrics: any[]) {
  return metrics.reduce((acc, m) => ({
    revenue: acc.revenue + m.revenue,
    subscriptions: acc.subscriptions + m.subscriptions,
    sales: acc.sales + m.sales,
    activeUsers: Math.max(acc.activeUsers, m.activeUsers),
    newUsers: acc.newUsers + m.newUsers,
  }), {
    revenue: 0,
    subscriptions: 0,
    sales: 0,
    activeUsers: 0,
    newUsers: 0,
  });
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function generateChartData(metrics: any[]) {
  // Generate chart data for the overview chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((name, index) => {
    const monthMetrics = metrics.filter(m => {
      const date = new Date(m.date);
      return date.getMonth() === index;
    });
    
    const total = monthMetrics.reduce((sum, m) => sum + m.revenue, 0);
    
    return {
      name,
      total,
    };
  });
}

async function getRecentSales(ctx: any, organizationId: string) {
  // Mock recent sales data for demo
  // In a real app, this would fetch actual sales data
  return [
    {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      amount: 1999.00,
      avatar: "/avatars/01.png",
    },
    {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      amount: 39.00,
      avatar: "/avatars/02.png",
    },
    {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      amount: 299.00,
      avatar: "/avatars/03.png",
    },
    {
      name: "William Kim",
      email: "will@email.com",
      amount: 99.00,
      avatar: "/avatars/04.png",
    },
    {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      amount: 39.00,
      avatar: "/avatars/05.png",
    },
  ];
}

function generateSampleMetrics(period: string, startDate: string, endDate: string) {
  // Generate sample data for demo purposes
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    data.push({
      name: months[i],
      total: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  
  return {
    totals: {
      revenue: 45231.89,
      subscriptions: 2350,
      sales: 12234,
      activeUsers: 573,
      newUsers: 201,
    },
    growth: {
      revenue: 20.1,
      subscriptions: 180.1,
      sales: 19,
      activeUsers: 201,
    },
    chartData: data,
    metrics: [],
  };
}