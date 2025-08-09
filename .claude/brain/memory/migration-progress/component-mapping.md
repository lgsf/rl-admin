# Component Migration Mapping

## sms-core-ui-2 → shadcn/ui Component Mapping

| sms-core-ui-2 Component | shadcn/ui Equivalent | Status | Notes |
|------------------------|---------------------|---------|--------|
| Button | Button | 🔴 Not Started | Direct mapping |
| Input | Input | 🔴 Not Started | Add form integration |
| Select | Select (Radix) | 🔴 Not Started | Use Radix Select |
| Modal | Dialog | 🔴 Not Started | API changes needed |
| Loading | Skeleton + Spinner | 🔴 Not Started | Custom implementation |
| Card | Card | 🔴 Not Started | Simple mapping |
| Table | Table + DataTable | 🔴 Not Started | Complex, needs tanstack-table |
| Tabs | Tabs | 🔴 Not Started | Radix Tabs base |
| Alert | Alert | 🔴 Not Started | Add toast variant |
| Form | Form (react-hook-form) | 🔴 Not Started | Integration needed |
| Dropdown | DropdownMenu | 🔴 Not Started | Different API |
| Tooltip | Tooltip | 🔴 Not Started | Radix Tooltip |
| Badge | Badge | 🔴 Not Started | Style variants |
| Avatar | Avatar | 🔴 Not Started | Add fallbacks |
| Toggle | Toggle | 🔴 Not Started | New component |

## Status Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked
- ⚫ Deprecated (won't migrate)

## Migration Priority
1. **Critical** (Week 1)
   - Button, Input, Card
   - Loading states
   - Basic layout components

2. **High** (Week 2-3)
   - Form components
   - Table/DataTable
   - Modal/Dialog

3. **Medium** (Week 4)
   - Dropdown, Select
   - Tabs, Alert
   - Navigation items

4. **Low** (Week 5)
   - Badge, Avatar
   - Tooltip, Toggle
   - Utility components

## Breaking Changes Log

### Button Component
- **Before**: `<Button variant="primary" />`
- **After**: `<Button variant="default" />`
- **Migration**: Update variant names

### Modal → Dialog
- **Before**: `<Modal isOpen={open} />`
- **After**: `<Dialog open={open} />`
- **Migration**: Rename props, update event handlers

### Loading States
- **Before**: `<Loading />`
- **After**: `<Skeleton />` or custom spinner
- **Migration**: Context-dependent replacement

## Component-Specific Notes

### Table Migration
The table component requires special attention:
1. Install `@tanstack/react-table`
2. Create DataTable wrapper component
3. Migrate column definitions
4. Update sorting/filtering logic

### Form Integration
Forms need react-hook-form integration:
1. Install `react-hook-form` and `@hookform/resolvers`
2. Create form wrapper components
3. Update validation schemas
4. Migrate form state management

### Authentication Components
Special care needed for:
- Login forms (Keycloak integration)
- User menu components
- Protected route wrappers

## Testing Checklist
- [ ] Unit tests updated
- [ ] Integration tests pass
- [ ] Visual regression tests
- [ ] Accessibility audit
- [ ] Performance benchmarks
- [ ] Bundle size comparison