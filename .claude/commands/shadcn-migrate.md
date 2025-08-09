---
description: Migrate a component from sms-core-ui-2 to shadcn/ui
---

# Migrate to shadcn/ui

Analyze the specified component from sms-core-ui-2 and create an equivalent using shadcn/ui components.

## Steps:
1. Analyze the current component's functionality and props
2. Map to appropriate shadcn/ui primitives (based on Radix UI)
3. Create the new component with Tailwind CSS styling
4. Ensure accessibility is maintained
5. Update imports and dependencies
6. Run tests to verify functionality

## Usage:
/shadcn-migrate ComponentName

## Arguments:
$ARGUMENTS - The component name or file path to migrate

## Checklist:
- [ ] Identify all props and their types
- [ ] Map to shadcn/ui components
- [ ] Preserve all functionality
- [ ] Maintain accessibility features
- [ ] Update TypeScript types
- [ ] Test the migrated component