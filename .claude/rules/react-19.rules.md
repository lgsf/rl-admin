# React 19 Development Rules

## Component Rules

### 1. Always Use Function Components
```typescript
// ✅ Good
export function MyComponent() {
  return <div>Content</div>
}

// ❌ Bad - Class components
class MyComponent extends React.Component {}
```

### 2. Use TypeScript Strictly
```typescript
// ✅ Good - Proper typing
interface Props {
  title: string
  count: number
  onUpdate: (value: number) => void
}

export function Counter({ title, count, onUpdate }: Props) {}

// ❌ Bad - Any types
export function Counter(props: any) {}
```

### 3. Leverage React 19 Features
```typescript
// ✅ Use new hooks
import { use, useOptimistic, useFormStatus } from 'react'

// ✅ Server Components where appropriate
export default async function ServerComponent() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

## State Management Rules

### 1. Prefer Server State with Convex
```typescript
// ✅ Good - Real-time subscriptions
const tasks = useQuery(api.tasks.list)

// ❌ Bad - Local state for server data
const [tasks, setTasks] = useState([])
useEffect(() => { fetchTasks() }, [])
```

### 2. Use Optimistic Updates
```typescript
// ✅ Good
const [optimisticTasks, addOptimisticTask] = useOptimistic(
  tasks,
  (state, newTask) => [...state, newTask]
)
```

## Performance Rules

### 1. Memo Strategically
```typescript
// ✅ Good - Memo expensive components
const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return items.map(item => <ExpensiveItem key={item.id} {...item} />)
})

// ❌ Bad - Over-memoization
const SimpleDiv = memo(() => <div>Hello</div>) // Unnecessary
```

### 2. Use Suspense for Loading States
```typescript
// ✅ Good
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>

// ❌ Bad - Manual loading states everywhere
if (loading) return <Spinner />
```

## Styling Rules

### 1. Use Tailwind + shadcn/ui
```typescript
// ✅ Good
import { Button } from '@/components/ui/button'
<Button className="mt-4" variant="secondary">Click</Button>

// ❌ Bad - Custom CSS
<button style={{ marginTop: '1rem' }}>Click</button>
```

## Testing Rules

### 1. Test User Behavior
```typescript
// ✅ Good
test('user can submit form', async () => {
  const user = userEvent.setup()
  render(<Form />)
  await user.type(screen.getByLabelText('Name'), 'John')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// ❌ Bad - Testing implementation
test('setState works', () => {})
```

## File Organization Rules

### 1. Co-locate Related Files
```
components/
  TaskList/
    TaskList.tsx        # Component
    TaskList.test.tsx   # Tests
    TaskList.stories.tsx # Storybook
    index.ts            # Export
```

### 2. Use Absolute Imports
```typescript
// ✅ Good
import { Button } from '@/components/ui/button'

// ❌ Bad
import { Button } from '../../../components/ui/button'
```