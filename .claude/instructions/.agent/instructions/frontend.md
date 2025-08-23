# Frontend Development Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Build Tool: ALWAYS Vite
2. Framework: ALWAYS React 19
3. Language: ALWAYS TypeScript (strict mode)
4. UI Library: ALWAYS @lgsf/ui-lib
5. Styling: ALWAYS Tailwind CSS
6. Architecture: ALWAYS Module Federation
7. Comments: NEVER allowed
8. Testing: ALWAYS required (95% coverage)

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER use any build tool except Vite
❌ NEVER use any React version except React 19
❌ NEVER use `any` TypeScript type
❌ NEVER create custom UI components if exists in @lgsf/ui-lib
❌ NEVER write custom CSS files
❌ NEVER use inline styles
❌ NEVER use CSS modules
❌ NEVER write comments in code
❌ NEVER use generic names (data, temp, flag, obj, val, item)
❌ NEVER use single-letter variables (except loop indices i, j, k)
❌ NEVER create components > 50 lines
❌ NEVER skip TypeScript types
❌ NEVER use Create React App or Next.js

### REQUIRED ACTIONS
✅ ALWAYS use Vite as build tool
✅ ALWAYS use React 19 with TypeScript
✅ ALWAYS import UI components from @lgsf/ui-lib
✅ ALWAYS use Tailwind CSS for styling
✅ ALWAYS configure Module Federation with Vite
✅ ALWAYS write self-documenting code
✅ ALWAYS use descriptive names
✅ ALWAYS type all props, state, and functions
✅ ALWAYS handle loading and error states
✅ ALWAYS implement accessibility (WCAG 2.1 AA)

## FILE STRUCTURE PATTERN (MANDATORY)
```
src/
├── components/          # Composite components only
│   ├── {ComponentName}/
│   │   ├── index.tsx   # Component implementation
│   │   └── types.ts    # TypeScript interfaces
├── hooks/              # Custom hooks (use{HookName})
├── pages/              # Route components
├── exports/            # Module Federation exports
│   └── menu.ts        # Menu export for portal
├── utils/              # Utility functions
├── types/              # Global TypeScript types
├── main.tsx           # Vite entry point
└── App.tsx            # Root component
```

## VITE PROJECT INITIALIZATION (MANDATORY)

### Create New Vite Project
```bash
# ALWAYS use this command to start
npm create vite@latest {project-name} -- --template react-ts

# Install required dependencies
cd {project-name}
npm install @lgsf/ui-lib
npm install @originjs/vite-plugin-federation -D
npm install convex

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @vitest/coverage-v8
```

## NAMING PATTERNS (USE EXACTLY AS SHOWN)

### Component Name Templates
```typescript
// Page Components
{PageName}Page              // HomePage, ProfilePage, SettingsPage

// Feature Components
{Feature}{Type}             // UserList, UserCard, UserModal

// Layout Components
{Layout}Layout              // MainLayout, AuthLayout, DashboardLayout

// Form Components
{Entity}Form                // UserForm, ProductForm, PaymentForm
{Entity}{Action}Form        // UserEditForm, ProductCreateForm

// Display Components
{Entity}Display             // UserDisplay, OrderDisplay
{Entity}Card                // UserCard, ProductCard
{Entity}List                // UserList, OrderList
{Entity}Grid                // ProductGrid, ImageGrid

// Control Components
{Action}Button              // SubmitButton, CancelButton, DeleteButton
{Entity}{Action}Button      // UserDeleteButton, OrderCancelButton
```

### Hook Name Templates
```typescript
use{Functionality}          // useAuth, useModal, useDebounce
use{Entity}{Action}         // useUserFetch, useProductUpdate
use{State}                  // useLoading, useVisible, useExpanded
```

### Variable Name Templates
```typescript
// State Variables
is{State}                   // isLoading, isVisible, isAuthenticated
has{Property}               // hasError, hasPermission, hasData
should{Action}              // shouldRefresh, shouldValidate
can{Action}                 // canEdit, canDelete, canSubmit

// Collections
{entity}List                // userList, productList
{entity}Array               // userArray, itemArray
selected{Entities}          // selectedUsers, selectedProducts

// Event Handlers
handle{Event}               // handleClick, handleSubmit
handle{Entity}{Event}       // handleUserClick, handleFormSubmit
on{Event}                   // onClick, onSubmit, onChange
```

## REACT 19 COMPONENT TEMPLATES

### Functional Component Template
```tsx
// components/{ComponentName}/index.tsx
import { FC, useState, useEffect } from 'react';
import { Button, Card, Input } from '@lgsf/ui-lib';
import { {ComponentName}Props } from './types';

export const {ComponentName}: FC<{ComponentName}Props> = ({
  {prop1},
  {prop2},
  on{Event},
}) => {
  const [is{State}, setIs{State}] = useState<boolean>(false);
  const [selected{Entity}, setSelected{Entity}] = useState<{EntityType} | null>(null);

  const handle{Action} = async (): Promise<void> => {
    setIs{State}(true);
    try {
      // Implementation
      on{Event}?.();
    } catch (error) {
      // Handle error
    } finally {
      setIs{State}(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Input 
        value={selected{Entity}?.name ?? ''}
        onChange={handle{Change}}
        className="w-full"
      />
      <Button 
        onClick={handle{Action}}
        disabled={is{State}}
        className="w-full sm:w-auto"
      >
        {is{State} ? 'Loading...' : 'Submit'}
      </Button>
    </Card>
  );
};
```

### Component Props Interface Template
```tsx
// components/{ComponentName}/types.ts
export interface {ComponentName}Props {
  // Required props first
  {requiredProp}: string;
  {requiredProp2}: number;
  
  // Optional props next
  {optionalProp}?: boolean;
  
  // Callback props last
  on{Event}?: ({param}: {ParamType}) => void;
  on{Event2}?: () => Promise<void>;
}
```

### Custom Hook Template
```tsx
// hooks/use{HookName}.ts
import { useState, useEffect, useCallback } from 'react';

interface Use{HookName}Return {
  {value}: {ValueType};
  is{State}: boolean;
  {action}: ({param}: {ParamType}) => void;
}

export const use{HookName} = (
  {parameter}: {ParameterType}
): Use{HookName}Return => {
  const [is{State}, setIs{State}] = useState<boolean>(false);
  const [{value}, set{Value}] = useState<{ValueType}>();

  const {action} = useCallback(({param}: {ParamType}): void => {
    // Implementation
  }, [dependency]);

  useEffect(() => {
    // Side effect
  }, [dependency]);

  return {
    {value},
    is{State},
    {action},
  };
};
```

## TAILWIND CSS PATTERNS (MANDATORY)

### Layout Classes
```tsx
// Container
<div className="container mx-auto px-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexbox
<div className="flex flex-col md:flex-row items-center justify-between gap-4">

// Spacing
<div className="p-4 m-2 space-y-4">
```

### Responsive Patterns
```tsx
// Mobile-first responsive
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">

// Hide/Show by breakpoint
<div className="hidden md:block">
<div className="block md:hidden">

// Responsive text
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
```

### State-based Styling
```tsx
// Conditional classes
<button className={`
  px-4 py-2 rounded-lg font-medium
  ${isActive 
    ? 'bg-blue-500 text-white' 
    : 'bg-gray-200 text-gray-700'
  }
  ${isDisabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:opacity-80 cursor-pointer'
  }
`}>

// Using clsx (if available)
<div className={clsx(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)}>
```

## MODULE FEDERATION WITH VITE CONFIGURATION

### vite.config.ts Template
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '{appName}',
      filename: 'remoteEntry.js',
      remotes: {
        '{remoteName}': 'http://localhost:{port}/assets/remoteEntry.js',
      },
      exposes: {
        './{ComponentName}': './src/components/{ComponentName}',
        './Menu': './src/exports/menu',
        './hooks': './src/hooks/index',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^19.0.0' 
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^19.0.0' 
        },
        '@lgsf/ui-lib': { 
          singleton: true 
        },
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: {port},
    cors: true,
  },
});
```

### Package.json Scripts (MANDATORY)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

## TYPESCRIPT PATTERNS (MANDATORY)

### Type Investigation Process
```tsx
// Step 1: Check node_modules
// node_modules/@lgsf/ui-lib/dist/index.d.ts

// Step 2: Import correct type
import { ButtonProps, CardProps } from '@lgsf/ui-lib';

// Step 3: Extend for custom props
interface CustomButtonProps extends ButtonProps {
  customProp: string;
}
```

### Common Type Patterns
```tsx
// Union types for state
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Discriminated unions
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
}
```

## ERROR HANDLING PATTERN
```tsx
// Component error boundary
export const {ComponentName}: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAction = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await performAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleAction} />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{/* Main content */}</>;
};
```

## TESTING REQUIREMENTS WITH VITEST

### vitest.config.ts Template
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Test File Structure
```tsx
// {ComponentName}.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('should render with required props', () => {
    render(<{ComponentName} requiredProp="value" />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });

  it('should handle {event} event', async () => {
    const handle{Event} = vi.fn();
    render(<{ComponentName} on{Event}={handle{Event}} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(handle{Event}).toHaveBeenCalledWith(expectedArg);
    });
  });

  it('should display error state', () => {
    // Test error handling
  });
});
```

## SELF-VALIDATION CHECKLIST

Before considering ANY frontend code complete, verify:
- [ ] All components < 50 lines
- [ ] All components in .tsx files
- [ ] All props typed with interfaces
- [ ] No `any` types used
- [ ] All UI components from @lgsf/ui-lib
- [ ] Only Tailwind classes for styling
- [ ] No custom CSS files
- [ ] No inline styles
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Accessibility implemented
- [ ] Module Federation configured
- [ ] Tests written (95% coverage)

## EXECUTION SEQUENCE FOR NEW FEATURES

1. **Initialize with Vite** if new project
2. **Check UI Library** for existing components
3. **Define Types** in types.ts file
4. **Create Component** using template
5. **Import from Library** (@lgsf/ui-lib)
6. **Apply Tailwind** classes only
7. **Handle States** (loading, error, success)
8. **Add Accessibility** attributes
9. **Configure Federation** in vite.config.ts
10. **Write Tests** with Vitest (95% coverage)
11. **Run typecheck** with tsc --noEmit
12. **Verify Checklist** before completion

## COMMON ANTIPATTERNS TO AVOID

```tsx
// ❌ NEVER DO THIS
const MyBtn = () => <button>Click</button>  // Custom UI component
const handleClick = (e: any) => {}  // Using 'any'
<div style={{color: 'red'}}>Text</div>  // Inline styles
import './styles.css'  // Custom CSS
const [data, setData] = useState()  // Untyped state

// ✅ ALWAYS DO THIS
import { Button } from '@lgsf/ui-lib'
const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {}
<div className="text-red-500">Text</div>
const [userData, setUserData] = useState<User | null>(null)
```