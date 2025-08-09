# TypeScript Strict Rules

## Type Safety Rules

### 1. No Any Types
```typescript
// ✅ Good
function processData(data: UserData): ProcessedResult {
  return transform(data)
}

// ❌ Bad
function processData(data: any): any {
  return transform(data)
}
```

### 2. Strict Null Checks
```typescript
// ✅ Good
function getUser(id: string): User | null {
  const user = users.find(u => u.id === id)
  return user ?? null
}

// Handle null
const user = getUser('123')
if (user) {
  console.log(user.name)
}

// ❌ Bad - Assuming non-null
const user = getUser('123')
console.log(user.name) // Might crash!
```

### 3. Use Type Predicates
```typescript
// ✅ Good
function isError(result: Result | Error): result is Error {
  return result instanceof Error
}

if (isError(result)) {
  console.error(result.message) // TypeScript knows it's Error
}

// ❌ Bad
if (result instanceof Error) {
  // Have to cast or assert
}
```

## Interface Rules

### 1. Prefer Interfaces for Objects
```typescript
// ✅ Good - Interface for object shapes
interface User {
  id: string
  name: string
  email: string
}

// ✅ Good - Type for unions/intersections
type Status = 'idle' | 'loading' | 'error'
type WithTimestamp<T> = T & { timestamp: Date }

// ❌ Bad - Type for simple objects
type User = {
  id: string
  name: string
}
```

### 2. Use Readonly Where Possible
```typescript
// ✅ Good
interface Config {
  readonly apiUrl: string
  readonly timeout: number
}

// For arrays
function processItems(items: readonly Item[]) {
  // Can't mutate items
}

// ❌ Bad - Mutable by default
interface Config {
  apiUrl: string // Can be changed
}
```

## Generic Rules

### 1. Constrain Generics
```typescript
// ✅ Good - Constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// ✅ Good - With defaults
function createList<T = string>(initial?: T[]): T[] {
  return initial ?? []
}

// ❌ Bad - Unconstrained
function process<T>(value: T): T {
  // Can't do much with T
}
```

### 2. Infer Types When Possible
```typescript
// ✅ Good - Let TypeScript infer
const numbers = [1, 2, 3] // number[]
const user = { name: 'John', age: 30 } // Inferred shape

// ✅ Good - Extract types from values
const colors = ['red', 'blue', 'green'] as const
type Color = typeof colors[number] // 'red' | 'blue' | 'green'

// ❌ Bad - Over-annotation
const numbers: Array<number> = [1, 2, 3]
```

## Utility Type Rules

### 1. Use Built-in Utilities
```typescript
// ✅ Good
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserKeys = keyof User
type NameOnly = Pick<User, 'name'>
type WithoutEmail = Omit<User, 'email'>

// ❌ Bad - Reimplementing utilities
type PartialUser = {
  id?: string
  name?: string
  email?: string
}
```

### 2. Create Custom Utilities
```typescript
// ✅ Good - Reusable utilities
type Nullable<T> = T | null
type AsyncData<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

// Use throughout codebase
const userState: AsyncData<User> = {
  data: null,
  loading: true,
  error: null
}
```

## Error Handling Rules

### 1. Type Your Errors
```typescript
// ✅ Good
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message)
  }
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// ❌ Bad
catch (error) {
  console.log(error.message) // error is unknown!
}
```

## Module Rules

### 1. Use ES Modules
```typescript
// ✅ Good
export function processUser(user: User): ProcessedUser
export type { User, ProcessedUser }

import { processUser, type User } from './user'

// ❌ Bad - CommonJS
module.exports = { processUser }
const { processUser } = require('./user')
```

### 2. Barrel Exports Carefully
```typescript
// ✅ Good - Selective exports
// components/index.ts
export { Button } from './Button'
export { Card } from './Card'
export type { ButtonProps, CardProps }

// ❌ Bad - Export everything
export * from './Button'
export * from './Card'
```