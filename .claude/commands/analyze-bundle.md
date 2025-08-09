---
description: Analyze bundle size and provide optimization recommendations
---

# Bundle Analysis

Perform comprehensive bundle analysis for the application.

## Analysis Steps:
1. Generate bundle stats
2. Identify large dependencies
3. Find duplicate modules
4. Analyze chunk composition
5. Review tree-shaking effectiveness
6. Check Module Federation overhead

## Metrics to Report:
- Total bundle size
- Size by chunk
- Largest dependencies
- Shared vs. unique modules
- Load time estimates
- Optimization opportunities

## Usage:
/analyze-bundle [options]

## Arguments:
$ARGUMENTS - Optional flags:
- --visual: Generate visual bundle report
- --compare: Compare with previous build
- --remote: Include remote module analysis

## Recommendations:
- Code splitting opportunities
- Lazy loading candidates
- Dependencies to replace
- Module Federation optimizations
- Caching strategies