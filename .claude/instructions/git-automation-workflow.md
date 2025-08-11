# Git Automation Workflow - Task Approval Integration

## AUTOMATED WORKFLOW TRIGGER
When task moves: `developed` → `human_approved` → Automatic PR Creation → `done`

## EXECUTION PRIORITY ORDER
1. Branch Verification: ALWAYS verify task branch exists and is pushed
2. Version Determination: ALWAYS calculate semantic version bump
3. Pull Request: ALWAYS from task branch to main
4. CI/CD Checks: ALWAYS wait for completion
5. Auto-merge: ALWAYS if checks pass
6. Tag Creation: ALWAYS with semantic version
7. Task Update: ALWAYS move to done on success

## CRITICAL PREREQUISITE
**Task MUST have been developed on its own branch (`task/{TASK_ID}`) and pushed before reaching human_approved column**

## SEMANTIC VERSIONING STRATEGY

### Version Bump Determination
```typescript
function determineVersionBump(taskId: string): 'major' | 'minor' | 'patch' {
  // Breaking changes
  if (taskId.match(/TASK-BREAKING-\d+/)) return 'major';
  
  // New features
  if (taskId.match(/TASK-(MVP|FEATURE|ENHANCEMENT)-\d+/)) return 'minor';
  
  // Bug fixes
  if (taskId.match(/TASK-(FIX|BUGFIX|HOTFIX)-\d+/)) return 'patch';
  
  // Default to patch for unknown patterns
  return 'patch';
}
```

### Version Format
- Pattern: `v{MAJOR}.{MINOR}.{PATCH}`
- Examples: `v1.0.0`, `v1.1.0`, `v1.0.1`, `v2.0.0`

### Getting Current Version
```typescript
async function getCurrentVersion(): Promise<string> {
  // Try package.json first
  const packageVersion = require('./package.json').version;
  
  // Verify against latest git tag
  const latestTag = await exec('git describe --tags --abbrev=0');
  
  // Use higher version (handles out-of-sync scenarios)
  return compareVersions(packageVersion, latestTag);
}
```

## BRANCH NAMING CONVENTION

### Pattern (Created During Development)
```
task/{TASK-ID}
```

### Examples
```bash
task/TASK-MVP-013
task/TASK-FIX-001
task/TASK-AI-CHAT-004
task/TASK-BREAKING-001
```

### IMPORTANT
- Branch is created when task moves to `in_development`
- Branch name is stored with the task in database
- Same branch is used for PR when task moves to `human_approved`
- No new branch creation during approval workflow

## PULL REQUEST AUTOMATION

### GitHub API Configuration
```typescript
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface PRConfig {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  labels: string[];
  assignees: string[];
  reviewers: string[];
}
```

### PR Creation Template
```typescript
async function createPullRequest(task: Task): Promise<number> {
  // Use the existing task branch created during development
  const taskBranch = task.gitBranch || `task/${task.taskId}`;
  
  // Verify branch exists on remote
  await verifyBranchExists(taskBranch);
  
  const pr = await octokit.rest.pulls.create({
    owner: 'your-org',
    repo: 'automated-kanban',
    title: `[${task.taskId}] ${getCommitType(task)}: ${task.title}`,
    body: generatePRBody(task),
    head: taskBranch,  // Use existing task branch
    base: 'main',
    labels: ['auto-merge', getTypeLabel(task)],
  });
  
  return pr.data.number;
}

async function verifyBranchExists(branchName: string): Promise<void> {
  try {
    await exec(`git ls-remote --heads origin ${branchName}`);
  } catch (error) {
    throw new Error(`Task branch ${branchName} not found on remote. Ensure task was developed on its own branch and pushed.`);
  }
}
```

### PR Body Generation
```markdown
## 🤖 Automated Pull Request

This PR was automatically created when task **${taskId}** was marked as human-approved.

### 📋 Task Information
- **Task ID**: ${taskId}
- **Priority**: ${priority}
- **Type**: ${taskType}
- **Estimated Time**: ${estimatedMinutes} minutes

### 📝 Problem Statement
${problemStatement}

### 💡 Solution
${implementationApproach}

### ✅ Acceptance Criteria
${acceptanceCriteria.map(c => `- [x] ${c}`).join('\n')}

### 🧪 Validation Results
- ✅ Tests: All passing
- ✅ TypeScript: No errors
- ✅ Linting: Clean
- ✅ Build: Successful

### 📊 Changes
- **Files Added**: ${filesAdded}
- **Files Modified**: ${filesModified}
- **Files Deleted**: ${filesDeleted}

### 🏷️ Version Bump
- **Current Version**: ${currentVersion}
- **New Version**: ${newVersion}
- **Bump Type**: ${bumpType}

### 🔄 Automated Workflow Status
- [x] Branch created
- [x] Changes committed
- [x] PR created
- [ ] CI checks pending
- [ ] Auto-merge pending
- [ ] Tag creation pending

---
*This PR will be automatically merged once all CI checks pass.*
```

## GITHUB ACTIONS SETUP

### 1. CI Workflow (.github/workflows/ci.yml)
```yaml
name: CI
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: TypeScript check
        run: npm run typecheck
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build project
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### 2. Auto-merge Workflow (.github/workflows/auto-merge.yml)
```yaml
name: Auto Merge
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: >
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.event == 'pull_request'
    
    steps:
      - name: Auto merge PR
        uses: pascalgn/merge-action@v0.15.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MERGE_LABELS: "auto-merge"
          MERGE_METHOD: "squash"
          MERGE_COMMIT_MESSAGE: "pull-request-title"
          MERGE_DELETE_BRANCH: "true"
```

### 3. Release Workflow (.github/workflows/release.yml)
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Extract task ID from tag
        id: extract
        run: |
          TAG=${GITHUB_REF#refs/tags/}
          echo "tag=$TAG" >> $GITHUB_OUTPUT
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.extract.outputs.tag }}
          release_name: Release ${{ steps.extract.outputs.tag }}
          body: |
            Automated release for ${{ steps.extract.outputs.tag }}
            
            See task details in the Kanban board.
          draft: false
          prerelease: false
```

## MERGE CONFLICT RESOLUTION STRATEGY

### Intelligent Conflict Resolution Matrix
```typescript
interface ConflictStrategy {
  pattern: RegExp;
  strategy: 'ours' | 'theirs' | 'union' | 'manual';
  handler?: (ours: string, theirs: string) => string;
}

const conflictStrategies: ConflictStrategy[] = [
  // Auto-generated files - always take incoming
  {
    pattern: /convex\/_generated\/.*/,
    strategy: 'theirs'
  },
  
  // Lock files - take incoming and regenerate
  {
    pattern: /package-lock\.json/,
    strategy: 'theirs',
    handler: async () => {
      await exec('npm install');
      return await readFile('package-lock.json');
    }
  },
  
  // Package.json - merge dependencies
  {
    pattern: /package\.json/,
    strategy: 'union',
    handler: (ours, theirs) => {
      const ourPkg = JSON.parse(ours);
      const theirPkg = JSON.parse(theirs);
      
      // Merge dependencies
      const merged = {
        ...ourPkg,
        dependencies: { ...ourPkg.dependencies, ...theirPkg.dependencies },
        devDependencies: { ...ourPkg.devDependencies, ...theirPkg.devDependencies }
      };
      
      return JSON.stringify(merged, null, 2);
    }
  },
  
  // Import statements - union both
  {
    pattern: /^import .* from/,
    strategy: 'union',
    handler: (ours, theirs) => {
      const ourImports = ours.match(/^import .*/gm) || [];
      const theirImports = theirs.match(/^import .*/gm) || [];
      const allImports = [...new Set([...ourImports, ...theirImports])];
      return allImports.sort().join('\n');
    }
  },
  
  // Test files - keep ours (we wrote the tests)
  {
    pattern: /.*\.test\.(ts|tsx|js|jsx)/,
    strategy: 'ours'
  },
  
  // Everything else - manual resolution
  {
    pattern: /.*/,
    strategy: 'manual'
  }
];
```

### Conflict Resolution Workflow
```typescript
async function resolveConflicts(prNumber: number): Promise<boolean> {
  const conflicts = await getConflictedFiles();
  
  if (conflicts.length === 0) return true;
  
  const unresolvedFiles = [];
  
  for (const file of conflicts) {
    const strategy = conflictStrategies.find(s => s.pattern.test(file));
    
    if (strategy.strategy === 'manual') {
      unresolvedFiles.push(file);
      continue;
    }
    
    await applyResolutionStrategy(file, strategy);
  }
  
  if (unresolvedFiles.length > 0) {
    await markPRForManualResolution(prNumber, unresolvedFiles);
    return false;
  }
  
  return true;
}
```

### Manual Conflict Notification
```typescript
async function notifyConflictResolution(task: Task, conflicts: string[]): Promise<void> {
  // Add comment to PR
  await octokit.rest.issues.createComment({
    owner: 'your-org',
    repo: 'automated-kanban',
    issue_number: prNumber,
    body: generateConflictComment(conflicts)
  });
  
  // Add label
  await octokit.rest.issues.addLabels({
    owner: 'your-org',
    repo: 'automated-kanban',
    issue_number: prNumber,
    labels: ['needs-conflict-resolution']
  });
  
  // Send notifications (if configured)
  if (process.env.SLACK_WEBHOOK) {
    await sendSlackNotification({
      text: `⚠️ Manual conflict resolution needed for ${task.taskId}`,
      attachments: [{
        color: 'warning',
        fields: conflicts.map(f => ({ title: 'File', value: f }))
      }]
    });
  }
}
```

## COMMIT MESSAGE GENERATION

### Automatic Commit Message
```typescript
function generateCommitMessage(task: Task): string {
  const type = getCommitType(task.taskId);
  const scope = task.tags[0] || 'general';
  
  return `${type}(${scope}): ${task.title}

Task ID: ${task.taskId}
Priority: ${task.priority}
Time: ${task.estimatedMinutes} minutes

Problem:
${task.problemStatement}

Solution:
${task.implementationApproach}

Acceptance Criteria Met:
${task.acceptanceCriteria.criteria.map(c => `- ${c}`).join('\n')}

Co-authored-by: AI Agent <ai@automated-kanban.local>`;
}
```

## ERROR HANDLING & ROLLBACK

### Transaction-like Git Operations
```typescript
class GitTransaction {
  private operations: Array<() => Promise<void>> = [];
  private rollbacks: Array<() => Promise<void>> = [];
  
  async execute(): Promise<void> {
    const executedOps = [];
    
    try {
      for (const op of this.operations) {
        await op();
        executedOps.push(op);
      }
    } catch (error) {
      // Rollback in reverse order
      for (const rollback of this.rollbacks.reverse()) {
        try {
          await rollback();
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      throw error;
    }
  }
  
  addOperation(
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ): void {
    this.operations.push(operation);
    this.rollbacks.push(rollback);
  }
}
```

### Usage Example
```typescript
const transaction = new GitTransaction();

// Create branch
transaction.addOperation(
  async () => await exec(`git checkout -b ${branchName}`),
  async () => await exec(`git checkout main && git branch -D ${branchName}`)
);

// Commit changes
transaction.addOperation(
  async () => await exec(`git commit -m "${message}"`),
  async () => await exec(`git reset --hard HEAD~1`)
);

// Push branch
transaction.addOperation(
  async () => await exec(`git push origin ${branchName}`),
  async () => await exec(`git push origin --delete ${branchName}`)
);

await transaction.execute();
```

## INTEGRATION WITH CONVEX

### Task Workflow Mutation
```typescript
// convex/gitIntegration.ts
export const onTaskApproved = mutation({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("taskId"), args.taskId))
      .first();
    
    if (!task || task.column !== "human_approved") {
      throw new Error("Task must be in human_approved column");
    }
    
    // Verify task has a branch from development
    const taskBranch = task.gitBranch || `task/${task.taskId}`;
    if (!task.gitBranch) {
      console.warn(`Task ${task.taskId} missing gitBranch field, using default: ${taskBranch}`);
    }
    
    try {
      // Execute Git workflow using existing task branch
      const result = await executeGitWorkflow({
        ...task,
        gitBranch: taskBranch
      });
      
      // Update task to done
      await ctx.db.patch(task._id, {
        column: "done",
        completedAt: Date.now(),
        gitIntegration: {
          prNumber: result.prNumber,
          branch: taskBranch,
          mergeCommit: result.mergeCommit,
          tag: result.tag,
          version: result.version
        }
      });
      
      return { success: true, ...result };
    } catch (error) {
      // Log error but keep task in human_approved
      await ctx.db.patch(task._id, {
        executionLog: [
          ...task.executionLog,
          {
            timestamp: Date.now(),
            action: "git_integration_failed",
            result: error.message,
            error: error.stack
          }
        ]
      });
      
      throw error;
    }
  }
});

// New mutation to store branch name when task moves to in_development
export const onTaskDevelopmentStarted = mutation({
  args: { 
    taskId: v.string(),
    gitBranch: v.string()
  },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("taskId"), args.taskId))
      .first();
    
    if (!task) {
      throw new Error(`Task ${args.taskId} not found`);
    }
    
    await ctx.db.patch(task._id, {
      gitBranch: args.gitBranch,
      branchCreatedAt: Date.now()
    });
    
    return { success: true };
  }
});
```

## MONITORING & LOGGING

### Execution Log Format
```typescript
interface GitExecutionLog {
  timestamp: number;
  action: 'branch_created' | 'committed' | 'pushed' | 'pr_created' | 
          'pr_merged' | 'tag_created' | 'task_completed' | 'error';
  details: {
    branch?: string;
    commit?: string;
    prNumber?: number;
    tag?: string;
    version?: string;
    error?: string;
  };
}
```

### Comprehensive Logging
```typescript
async function logGitOperation(
  taskId: string,
  action: string,
  details: any
): Promise<void> {
  // Log to task execution log
  await updateTaskLog(taskId, { action, details });
  
  // Log to system log
  console.log(`[GIT-WORKFLOW] ${taskId}: ${action}`, details);
  
  // Send to monitoring service (if configured)
  if (process.env.MONITORING_ENDPOINT) {
    await fetch(process.env.MONITORING_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ taskId, action, details })
    });
  }
}
```

## ENFORCEMENT

This automated workflow is **MANDATORY** for all tasks moving to human-approved status. Manual Git operations should be avoided to maintain consistency and traceability.

---

**Version**: 1.0.0  
**Created**: 2024-08-09  
**Status**: Active