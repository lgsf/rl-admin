# Feature Development Workflow

## Overview
This workflow guides you through implementing a new feature from conception to deployment.

## Steps

### 1. Planning Phase
- [ ] Create feature specification
- [ ] Break down into tasks
- [ ] Estimate complexity
- [ ] Identify dependencies

### 2. Setup Phase
- [ ] Create feature branch
- [ ] Update todo list with tasks
- [ ] Create checkpoint

### 3. Implementation Phase

#### 3.1 Backend (if needed)
- [ ] Design Convex schema
- [ ] Create Convex functions
- [ ] Add authentication/permissions
- [ ] Write backend tests

#### 3.2 Frontend
- [ ] Create component structure
- [ ] Implement UI with shadcn/ui
- [ ] Add state management
- [ ] Connect to backend
- [ ] Handle loading/error states

#### 3.3 Testing
- [ ] Write unit tests (Vitest)
- [ ] Write integration tests
- [ ] Write E2E tests (Playwright)
- [ ] Test edge cases

### 4. Quality Assurance
- [ ] Run code review command
- [ ] Check bundle size impact
- [ ] Verify performance
- [ ] Security audit if needed

### 5. Documentation
- [ ] Update component documentation
- [ ] Add usage examples
- [ ] Update CHANGELOG
- [ ] Update relevant .md files

### 6. Deployment Prep
- [ ] Create final checkpoint
- [ ] Run all tests
- [ ] Build production bundle
- [ ] Create PR

## Commands to Use

```bash
# Start
/checkpoint
/component-create [ComponentName]

# During development
/code-review
/analyze-bundle

# Testing
npm test
npx playwright test

# Finish
/checkpoint
/update-claude-md
```

## Best Practices

1. **Checkpoint frequently** - Before and after major changes
2. **Test continuously** - Write tests as you code
3. **Review regularly** - Don't wait until the end
4. **Document immediately** - While context is fresh
5. **Communicate progress** - Update todos and session state