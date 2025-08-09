---
description: Create a new component using shadcn/ui patterns and best practices
---

# Create Component

Generate a new component following the project's patterns with shadcn/ui.

## Component Structure:
1. Create component file with proper TypeScript types
2. Use shadcn/ui primitives and Tailwind CSS
3. Include proper accessibility attributes
4. Add Storybook story (if applicable)
5. Create unit tests
6. Update component index exports

## Usage:
/component-create ComponentName [options]

## Arguments:
$ARGUMENTS - Component name and optional flags:
- --page: Create a page component with view separation
- --dialog: Create a dialog/modal component
- --form: Include form handling with react-hook-form
- --table: Create a data table component

## Example:
/component-create UserProfile --page

## Generated Files:
- `components/[name]/[name].tsx` - Main component
- `components/[name]/[name]-view.tsx` - View component (if --page)
- `components/[name]/index.ts` - Barrel export
- `components/[name]/[name].test.tsx` - Unit tests
- `components/[name]/[name].stories.tsx` - Storybook (optional)