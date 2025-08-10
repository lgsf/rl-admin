# Unit Testing Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Coverage: ALWAYS 95% minimum (100% business logic)
2. Execution: ALWAYS sequential (one test at a time)
3. Quality: ALWAYS meaningful tests (no padding)
4. Speed: ALWAYS < 50ms per test
5. Independence: ALWAYS isolated tests

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER run tests in parallel
❌ NEVER write tests without assertions
❌ NEVER mock the unit being tested
❌ NEVER write tests just for coverage
❌ NEVER use random/time-based data
❌ NEVER depend on test execution order
❌ NEVER skip error scenarios
❌ NEVER ignore boundary values
❌ NEVER have tests > 50ms
❌ NEVER leave console.log in tests

### REQUIRED ACTIONS
✅ ALWAYS achieve 95% total coverage
✅ ALWAYS achieve 100% business logic coverage
✅ ALWAYS run tests sequentially
✅ ALWAYS test all error paths
✅ ALWAYS test boundary values
✅ ALWAYS use deterministic data
✅ ALWAYS clean up after tests
✅ ALWAYS verify mock calls
✅ ALWAYS test async properly
✅ ALWAYS review each test after writing

## TEST FILE STRUCTURE PATTERN (MANDATORY)
```
src/
├── {module}/
│   ├── {module}.ts           # Implementation
│   └── {module}.test.ts      # Test file
├── components/
│   ├── {Component}/
│   │   ├── index.tsx         # Component
│   │   └── {Component}.test.tsx  # Test file
└── __tests__/                # Integration tests only
    └── {feature}.integration.test.ts
```

## TEST NAMING PATTERNS (USE EXACTLY AS SHOWN)

### Test Suite Names
```typescript
describe('{ModuleName}', () => {})           // For modules/functions
describe('{ComponentName}', () => {})        // For React components
describe('{ClassName}', () => {})            // For classes
describe('{hookName}', () => {})             // For hooks
```

### Test Case Names
```typescript
// Action-based pattern
it('should {expectedResult} when {condition}', () => {})
it('should {expectedResult} given {input}', () => {})
it('should {expectedResult} after {action}', () => {})

// State-based pattern
it('returns {value} when {condition}', () => {})
it('throws {error} when {condition}', () => {})
it('renders {element} when {prop} is {value}', () => {})

// Examples
it('should return user data when ID is valid', () => {})
it('should throw ValidationError when email is invalid', () => {})
it('renders loading spinner when isLoading is true', () => {})
```

## COMPREHENSIVE TEST TEMPLATES

### Function Test Template
```typescript
// {functionName}.test.ts
import { {functionName} } from './{functionName}';

describe('{functionName}', () => {
  // HAPPY PATH - ALWAYS FIRST
  describe('successful scenarios', () => {
    it('should {expectedBehavior} when given valid input', () => {
      // Arrange
      const input = {validTestData};
      const expectedOutput = {expectedValue};
      
      // Act
      const result = {functionName}(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });

  // EDGE CASES - ALWAYS SECOND
  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect({functionName}([])).toEqual([]);
    });

    it('should handle minimum boundary value', () => {
      expect({functionName}(0)).toBe({expectedValue});
    });

    it('should handle maximum boundary value', () => {
      expect({functionName}(Number.MAX_SAFE_INTEGER)).toBe({expectedValue});
    });
  });

  // ERROR CASES - ALWAYS THIRD
  describe('error scenarios', () => {
    it('should throw TypeError when input is null', () => {
      expect(() => {functionName}(null)).toThrow(TypeError);
    });

    it('should throw ValidationError when input is invalid', () => {
      expect(() => {functionName}({invalidData})).toThrow(ValidationError);
    });
  });
});
```

### React Component Test Template
```typescript
// {ComponentName}.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  // RENDERING TESTS
  describe('rendering', () => {
    it('should render with required props', () => {
      render(<{ComponentName} requiredProp="value" />);
      expect(screen.getByRole('{role}')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<{ComponentName} isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(<{ComponentName} error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  // INTERACTION TESTS
  describe('user interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const handleClick = jest.fn();
      render(<{ComponentName} onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledWith({expectedArgs});
      });
    });

    it('should update input value on change', () => {
      const handleChange = jest.fn();
      render(<{ComponentName} onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledWith('new value');
    });
  });

  // PROP VALIDATION TESTS
  describe('prop validation', () => {
    it('should handle missing optional props', () => {
      render(<{ComponentName} requiredProp="value" />);
      expect(screen.getByRole('{role}')).toBeInTheDocument();
    });
  });
});
```

### Async Function Test Template
```typescript
// {asyncFunction}.test.ts
describe('{asyncFunction}', () => {
  // SETUP
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SUCCESS CASES
  describe('successful async operations', () => {
    it('should resolve with data when API call succeeds', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' };
      mockApiCall.mockResolvedValueOnce(mockData);
      
      // Act
      const result = await {asyncFunction}(validInput);
      
      // Assert
      expect(result).toEqual(mockData);
      expect(mockApiCall).toHaveBeenCalledWith(validInput);
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });
  });

  // FAILURE CASES
  describe('failed async operations', () => {
    it('should reject with error when API call fails', async () => {
      // Arrange
      const error = new Error('Network error');
      mockApiCall.mockRejectedValueOnce(error);
      
      // Act & Assert
      await expect({asyncFunction}(validInput)).rejects.toThrow('Network error');
      expect(mockApiCall).toHaveBeenCalledWith(validInput);
    });

    it('should timeout after specified duration', async () => {
      // Arrange
      mockApiCall.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );
      
      // Act & Assert
      await expect({asyncFunction}(validInput)).rejects.toThrow('Timeout');
    }, 10000);
  });
});
```

### Custom Hook Test Template
```typescript
// use{HookName}.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { use{HookName} } from './use{HookName}';

describe('use{HookName}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => use{HookName}());
    
    expect(result.current.{value}).toBe({defaultValue});
    expect(result.current.is{State}).toBe(false);
  });

  it('should update state when {action} is called', async () => {
    const { result } = renderHook(() => use{HookName}());
    
    act(() => {
      result.current.{action}({newValue});
    });
    
    await waitFor(() => {
      expect(result.current.{value}).toBe({newValue});
    });
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => use{HookName}());
    
    act(() => {
      result.current.{errorAction}();
    });
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error message');
      expect(result.current.isError).toBe(true);
    });
  });
});
```

## COVERAGE VERIFICATION PATTERNS

### Jest Configuration (MANDATORY)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom', // or 'node' for backend
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/business-logic/**/*.{ts,tsx}': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './src/utils/**/*.{ts,tsx}': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts'
  ],
  maxWorkers: 1,
  runInBand: true,
  testTimeout: 5000
};
```

### Package.json Scripts (MANDATORY)
```json
{
  "scripts": {
    "test": "jest --runInBand --maxWorkers=1",
    "test:watch": "jest --runInBand --maxWorkers=1 --watch",
    "test:coverage": "jest --runInBand --maxWorkers=1 --coverage",
    "test:coverage:open": "jest --runInBand --maxWorkers=1 --coverage && open coverage/lcov-report/index.html",
    "test:debug": "node --inspect-brk ./node_modules/.bin/jest --runInBand"
  }
}
```

## MOCK PATTERNS (USE EXACTLY)

### Module Mock Pattern
```typescript
// Mock external module
jest.mock('@external/library', () => ({
  functionName: jest.fn(),
  ClassName: jest.fn(() => ({
    method: jest.fn()
  }))
}));

// Import after mock
import { functionName } from '@external/library';
const mockFunctionName = functionName as jest.MockedFunction<typeof functionName>;
```

### API Mock Pattern
```typescript
// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

it('should fetch data successfully', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' })
  });
  
  const result = await fetchData();
  
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.example.com/endpoint',
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    })
  );
});
```

## TEST QUALITY CHECKLIST

Before marking ANY test complete, verify:
- [ ] Test runs in < 50ms
- [ ] Test has meaningful assertions
- [ ] Test fails when implementation breaks
- [ ] Test doesn't depend on other tests
- [ ] Test uses deterministic data
- [ ] Test cleans up resources
- [ ] Test name clearly describes scenario
- [ ] Test covers success path
- [ ] Test covers all error paths
- [ ] Test covers boundary values
- [ ] Test verifies mock interactions
- [ ] Test handles async properly

## EXECUTION SEQUENCE FOR WRITING TESTS

1. **Create test file** with `.test.ts` extension
2. **Import dependencies** and module to test
3. **Write describe block** for module
4. **Add happy path tests** first
5. **Add edge case tests** second
6. **Add error tests** third
7. **Run coverage check** locally
8. **Verify 95%/100%** thresholds met
9. **Review each test** for quality
10. **Ensure < 50ms** execution time

## COMMON ANTIPATTERNS TO AVOID

```typescript
// ❌ NEVER DO THIS
it('should work', () => {  // Vague test name
  const result = myFunction();
  expect(result).toBeDefined();  // Weak assertion
});

it('test 1', () => {  // Non-descriptive name
  expect(true).toBe(true);  // Always passes
});

it('should process data', () => {
  // No assertions - test does nothing
});

// ✅ ALWAYS DO THIS
it('should return sum of two positive integers', () => {
  expect(add(2, 3)).toBe(5);
});

it('should throw TypeError when first parameter is null', () => {
  expect(() => add(null, 2)).toThrow(TypeError);
});

it('should return empty array when filtering with no matches', () => {
  const result = filterItems([], item => item > 10);
  expect(result).toEqual([]);
  expect(result).toHaveLength(0);
});
```