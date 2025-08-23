# Integration Testing Instructions - AI Optimized

## EXECUTION PRIORITY ORDER
1. Coverage: ALWAYS 100% of ALL integrations
2. Execution: ALWAYS sequential (one test at a time)
3. Isolation: ALWAYS clean state between tests
4. Environment: ALWAYS use test database
5. Timeout: ALWAYS 30 seconds max per test

## CONSTRAINT RULES (VIOLATIONS = IMMEDIATE FAILURE)

### FORBIDDEN ACTIONS
❌ NEVER run integration tests in parallel
❌ NEVER skip any integration point
❌ NEVER use production database
❌ NEVER share test data between tests
❌ NEVER ignore error scenarios
❌ NEVER test only happy paths
❌ NEVER mock the integration being tested
❌ NEVER leave test data in database
❌ NEVER hardcode test credentials
❌ NEVER skip cleanup operations

### REQUIRED ACTIONS
✅ ALWAYS test 100% of API endpoints
✅ ALWAYS test 100% of database operations
✅ ALWAYS test 100% of external services
✅ ALWAYS run tests sequentially
✅ ALWAYS clean database after each test
✅ ALWAYS use test environment variables
✅ ALWAYS verify response schemas
✅ ALWAYS test all HTTP status codes
✅ ALWAYS test all error conditions
✅ ALWAYS document test coverage matrix

## TEST FILE STRUCTURE PATTERN (MANDATORY)
```
tests/
├── integration/
│   ├── api/
│   │   ├── {endpoint}.integration.test.ts
│   │   └── {endpoint}.fixtures.ts
│   ├── database/
│   │   ├── {model}.integration.test.ts
│   │   └── seed-data.ts
│   ├── services/
│   │   ├── {service}.integration.test.ts
│   │   └── {service}.mocks.ts
│   └── setup/
│       ├── globalSetup.ts
│       ├── globalTeardown.ts
│       └── testDatabase.ts
```

## COMPREHENSIVE API ENDPOINT TEST TEMPLATE

```typescript
// {endpoint}.integration.test.ts
import { setupTestDatabase, cleanupDatabase } from '../setup/testDatabase';
import { createTestUser, createAuthToken } from '../fixtures/users';
import request from 'supertest';
import app from '../../src/app';

describe('API: {EndpointName}', () => {
  let authToken: string;
  let testUserId: string;

  // SETUP - ALWAYS FIRST
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    const user = await createTestUser();
    testUserId = user.id;
    authToken = createAuthToken(user);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  // SUCCESS SCENARIOS - TEST ALL 2XX CODES
  describe('GET /{endpoint}', () => {
    it('should return 200 with valid data', async () => {
      const response = await request(app)
        .get('/{endpoint}')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: expect.any(Array)
      });
    });

    it('should return 204 when no content', async () => {
      await request(app)
        .get('/{endpoint}/empty')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  // AUTHENTICATION TESTS - ALL AUTH STATES
  describe('Authentication scenarios', () => {
    it('should return 401 without token', async () => {
      await request(app)
        .get('/{endpoint}')
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = createExpiredToken();
      await request(app)
        .get('/{endpoint}')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should return 403 for insufficient permissions', async () => {
      const limitedToken = createLimitedToken();
      await request(app)
        .get('/{endpoint}/admin')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);
    });
  });

  // VALIDATION TESTS - ALL 4XX ERRORS
  describe('Validation scenarios', () => {
    it('should return 400 for invalid query params', async () => {
      await request(app)
        .get('/{endpoint}?page=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 404 for non-existent resource', async () => {
      await request(app)
        .get('/{endpoint}/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 422 for unprocessable entity', async () => {
      await request(app)
        .post('/{endpoint}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalidField: 'value' })
        .expect(422);
    });
  });

  // PAGINATION TESTS - ALL SCENARIOS
  describe('Pagination scenarios', () => {
    beforeEach(async () => {
      await seedPaginationData(100);
    });

    it('should return first page with default limit', async () => {
      const response = await request(app)
        .get('/{endpoint}?page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(20);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    it('should return last page correctly', async () => {
      const response = await request(app)
        .get('/{endpoint}?page=5&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(20);
      expect(response.body.pagination.isLastPage).toBe(true);
    });

    it('should return empty array beyond last page', async () => {
      const response = await request(app)
        .get('/{endpoint}?page=999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  // FILTERING & SORTING TESTS
  describe('Filtering and sorting', () => {
    it('should filter by status', async () => {
      const response = await request(app)
        .get('/{endpoint}?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('active');
      });
    });

    it('should sort by created date descending', async () => {
      const response = await request(app)
        .get('/{endpoint}?sort=-createdAt')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.data.map(item => item.createdAt);
      expect(dates).toEqual([...dates].sort().reverse());
    });
  });

  // RATE LIMITING TESTS
  describe('Rate limiting', () => {
    it('should return 429 after exceeding rate limit', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/{endpoint}')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

## DATABASE INTEGRATION TEST TEMPLATE

```typescript
// {model}.integration.test.ts
import { setupTestDatabase, cleanupDatabase } from '../setup/testDatabase';
import { {ModelName} } from '../../src/models/{modelName}';

describe('Database: {ModelName}', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // CREATE OPERATIONS
  describe('CREATE operations', () => {
    it('should create with valid data', async () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const result = await {ModelName}.create(data);
      
      expect(result.id).toBeDefined();
      expect(result.name).toBe(data.name);
    });

    it('should fail with duplicate unique field', async () => {
      const data = { email: 'duplicate@example.com' };
      await {ModelName}.create(data);
      
      await expect({ModelName}.create(data))
        .rejects.toThrow('Unique constraint violation');
    });

    it('should fail with missing required field', async () => {
      await expect({ModelName}.create({ optional: 'value' }))
        .rejects.toThrow('Required field missing');
    });
  });

  // READ OPERATIONS
  describe('READ operations', () => {
    it('should find by ID', async () => {
      const created = await {ModelName}.create(validData);
      const found = await {ModelName}.findById(created.id);
      
      expect(found).toMatchObject(created);
    });

    it('should find with filters', async () => {
      await {ModelName}.createMany(testDataArray);
      const results = await {ModelName}.find({ status: 'active' });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(item => expect(item.status).toBe('active'));
    });

    it('should handle pagination', async () => {
      await {ModelName}.createMany(Array(100).fill(validData));
      const page1 = await {ModelName}.paginate({ page: 1, limit: 10 });
      
      expect(page1.data).toHaveLength(10);
      expect(page1.totalPages).toBe(10);
    });
  });

  // UPDATE OPERATIONS
  describe('UPDATE operations', () => {
    it('should update single field', async () => {
      const created = await {ModelName}.create(validData);
      const updated = await {ModelName}.updateById(created.id, { name: 'Updated' });
      
      expect(updated.name).toBe('Updated');
      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('should handle concurrent updates', async () => {
      const created = await {ModelName}.create(validData);
      
      const updates = Promise.all([
        {ModelName}.updateById(created.id, { counter: 1 }),
        {ModelName}.updateById(created.id, { counter: 2 })
      ]);
      
      await expect(updates).rejects.toThrow('Concurrent update conflict');
    });
  });

  // DELETE OPERATIONS
  describe('DELETE operations', () => {
    it('should soft delete by default', async () => {
      const created = await {ModelName}.create(validData);
      await {ModelName}.deleteById(created.id);
      
      const found = await {ModelName}.findByIdIncludeDeleted(created.id);
      expect(found.deletedAt).toBeDefined();
    });

    it('should cascade delete related records', async () => {
      const parent = await {ModelName}.create(validData);
      const child = await ChildModel.create({ parentId: parent.id });
      
      await {ModelName}.deleteById(parent.id);
      
      const foundChild = await ChildModel.findById(child.id);
      expect(foundChild).toBeNull();
    });
  });

  // TRANSACTION TESTS
  describe('Transaction scenarios', () => {
    it('should commit successful transaction', async () => {
      await {ModelName}.transaction(async (trx) => {
        await {ModelName}.create(data1, { transaction: trx });
        await {ModelName}.create(data2, { transaction: trx });
      });
      
      const count = await {ModelName}.count();
      expect(count).toBe(2);
    });

    it('should rollback failed transaction', async () => {
      await expect(
        {ModelName}.transaction(async (trx) => {
          await {ModelName}.create(validData, { transaction: trx });
          throw new Error('Rollback test');
        })
      ).rejects.toThrow('Rollback test');
      
      const count = await {ModelName}.count();
      expect(count).toBe(0);
    });
  });
});
```

## EXTERNAL SERVICE INTEGRATION TEST TEMPLATE

```typescript
// {service}.integration.test.ts
import nock from 'nock';
import { {ServiceName} } from '../../src/services/{serviceName}';

describe('External Service: {ServiceName}', () => {
  const SERVICE_URL = process.env.{SERVICE_NAME}_URL;
  
  beforeEach(() => {
    nock.cleanAll();
  });

  // SUCCESS SCENARIOS
  describe('Successful responses', () => {
    it('should handle 200 response with data', async () => {
      nock(SERVICE_URL)
        .get('/endpoint')
        .reply(200, { data: 'success' });
      
      const result = await {ServiceName}.fetchData();
      expect(result).toEqual({ data: 'success' });
    });

    it('should handle paginated responses', async () => {
      nock(SERVICE_URL)
        .get('/endpoint?page=1')
        .reply(200, { data: [], nextPage: 2 });
      
      nock(SERVICE_URL)
        .get('/endpoint?page=2')
        .reply(200, { data: [], nextPage: null });
      
      const result = await {ServiceName}.fetchAllPages();
      expect(result).toHaveLength(0);
    });
  });

  // ERROR SCENARIOS
  describe('Error handling', () => {
    it('should retry on 503 Service Unavailable', async () => {
      nock(SERVICE_URL)
        .get('/endpoint')
        .times(2)
        .reply(503);
      
      nock(SERVICE_URL)
        .get('/endpoint')
        .reply(200, { data: 'success' });
      
      const result = await {ServiceName}.fetchWithRetry();
      expect(result).toEqual({ data: 'success' });
    });

    it('should handle timeout', async () => {
      nock(SERVICE_URL)
        .get('/endpoint')
        .delay(31000)
        .reply(200);
      
      await expect({ServiceName}.fetchData())
        .rejects.toThrow('Request timeout');
    });

    it('should handle rate limiting', async () => {
      nock(SERVICE_URL)
        .get('/endpoint')
        .reply(429, {}, { 'Retry-After': '60' });
      
      await expect({ServiceName}.fetchData())
        .rejects.toThrow('Rate limited');
    });
  });

  // AUTHENTICATION SCENARIOS
  describe('Authentication', () => {
    it('should refresh token on 401', async () => {
      nock(SERVICE_URL)
        .get('/endpoint')
        .reply(401);
      
      nock(SERVICE_URL)
        .post('/auth/refresh')
        .reply(200, { token: 'new-token' });
      
      nock(SERVICE_URL)
        .get('/endpoint')
        .matchHeader('Authorization', 'Bearer new-token')
        .reply(200, { data: 'success' });
      
      const result = await {ServiceName}.fetchData();
      expect(result).toEqual({ data: 'success' });
    });
  });
});
```

## TEST CONFIGURATION TEMPLATES

### Jest Integration Config (MANDATORY)
```javascript
// jest.integration.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/globalSetup.ts'],
  globalTeardown: '<rootDir>/tests/integration/setup/globalTeardown.ts',
  maxWorkers: 1,
  runInBand: true,
  testTimeout: 30000,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
};
```

### Test Database Setup (MANDATORY)
```typescript
// tests/integration/setup/testDatabase.ts
import { createConnection, Connection } from 'typeorm';

let connection: Connection;

export async function setupTestDatabase(): Promise<void> {
  connection = await createConnection({
    type: 'postgres',
    host: process.env.TEST_DB_HOST,
    port: parseInt(process.env.TEST_DB_PORT),
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASS,
    database: `test_${Date.now()}`,
    synchronize: true,
    dropSchema: true,
    entities: ['src/entities/*.ts']
  });
}

export async function cleanupDatabase(): Promise<void> {
  const entities = connection.entityMetadatas;
  
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(`TRUNCATE "${entity.tableName}" CASCADE`);
  }
}

export async function closeTestDatabase(): Promise<void> {
  await connection.close();
}
```

## INTEGRATION TEST CHECKLIST

Before marking ANY integration test complete:
- [ ] Tests ALL success scenarios (2xx)
- [ ] Tests ALL error scenarios (4xx, 5xx)
- [ ] Tests ALL authentication states
- [ ] Tests ALL authorization levels
- [ ] Tests pagination completely
- [ ] Tests filtering and sorting
- [ ] Tests rate limiting
- [ ] Tests timeouts
- [ ] Cleans up all test data
- [ ] Runs sequentially
- [ ] Uses test database
- [ ] Verifies response schemas

## EXECUTION SEQUENCE FOR INTEGRATION TESTS

1. **Setup test environment** variables
2. **Create test database** instance
3. **Seed initial data** if needed
4. **Run authentication tests** first
5. **Run CRUD operations** tests
6. **Run pagination tests** with large datasets
7. **Run error scenario tests**
8. **Run edge case tests**
9. **Clean up test data** after each test
10. **Tear down database** after suite

## COMMON ANTIPATTERNS TO AVOID

```typescript
// ❌ NEVER DO THIS
it('should work', async () => {  // Vague test name
  const response = await request(app).get('/api/users');
  expect(response.status).toBe(200);  // Only testing status
});

// Running tests in parallel
describe.concurrent('API tests', () => {  // NEVER use concurrent
  // Tests that conflict with each other
});

// Not cleaning up
it('should create user', async () => {
  await createUser();
  // No cleanup - pollutes next test
});

// ✅ ALWAYS DO THIS
it('should return 200 with user list when authenticated', async () => {
  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  
  expect(response.body).toMatchObject({
    status: 'success',
    data: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        email: expect.any(String)
      })
    ])
  });
});
```