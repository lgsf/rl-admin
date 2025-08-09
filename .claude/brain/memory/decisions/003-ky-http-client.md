# ADR-003: Replace Axios with Ky HTTP Client

**Status**: Accepted  
**Date**: 2025-01-04  
**Decision Makers**: Development Team

## Context

As part of our modernization effort, we need to evaluate our HTTP client. Currently using Axios (13KB gzipped), which has served us well but has some drawbacks:

- Larger bundle size impacting performance
- Older API design patterns
- Not built on modern Fetch API
- Additional abstraction layer over native APIs
- Some features we don't use (interceptors, transformers)

With Convex handling most data operations, our HTTP client needs are reduced to:
- External API calls
- File uploads/downloads
- Webhook endpoints
- Legacy API migration period

## Decision

Replace Axios with Ky as our primary HTTP client.

### Why Ky?

1. **Size**: 2KB vs 13KB (85% smaller)
2. **Modern**: Built on Fetch API
3. **Simple API**: Cleaner, more intuitive
4. **TypeScript First**: Better type inference
5. **Retry Logic**: Built-in with exponential backoff
6. **Hooks System**: Extensible without interceptors
7. **Timeout Handling**: Simple timeout configuration
8. **Browser Focus**: Optimized for our use case

## Comparison

| Feature | Axios | Ky | Native Fetch |
|---------|-------|-----|--------------|
| Bundle Size | 13KB | 2KB | 0KB |
| Retries | Manual | Built-in | Manual |
| TypeScript | Good | Excellent | Basic |
| Interceptors | Yes | Hooks | None |
| Progress | Yes | No | Manual |
| Cancel | Yes | AbortController | AbortController |
| Browser/Node | Both | Browser* | Both |

*Ky works in Node.js with polyfills

## Implementation

### Migration Strategy

1. **Wrapper Pattern**: Create compatibility layer
```typescript
// lib/http-client.ts
export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  retry: { limit: 2 },
  timeout: 30000,
  hooks: {
    beforeRequest: [authHook],
    afterResponse: [errorHook]
  }
});

// Temporary Axios compatibility
export const axiosCompat = {
  get: (url) => api.get(url).json(),
  post: (url, data) => api.post(url, { json: data }).json(),
  // ... other methods
};
```

2. **Gradual Migration**: 
   - Phase 1: New features use Ky
   - Phase 2: Migrate existing API calls
   - Phase 3: Remove Axios dependency

3. **Testing**: Ensure all API calls work identically

## Code Examples

### Before (Axios)
```typescript
const response = await axios.get('/api/users', {
  headers: { Authorization: `Bearer ${token}` },
  timeout: 5000,
  retry: 3
});
return response.data;
```

### After (Ky)
```typescript
const users = await api.get('users').json();
// Auth and retry configured globally
```

## Consequences

### Positive
- **Smaller Bundle**: 11KB reduction in bundle size
- **Better Performance**: Less JavaScript to parse
- **Modern Patterns**: Async/await friendly
- **Simpler Code**: Less boilerplate
- **Type Safety**: Better TypeScript integration

### Negative  
- **Learning Curve**: Team needs to learn new API
- **Feature Parity**: Some Axios features need workarounds
- **Migration Effort**: Time to update existing code
- **Less Ecosystem**: Fewer plugins/extensions

### Neutral
- **Different Error Handling**: Ky throws on non-2xx
- **No Progress Events**: Need alternative for uploads
- **Browser Focused**: Node.js requires setup

## Alternatives Considered

### 1. Native Fetch
- Pros: No bundle size, standard API
- Cons: No retries, verbose, poor error handling

### 2. Wretch  
- Pros: Small (3KB), fluent API
- Cons: Less popular, smaller community

### 3. Ofetch
- Pros: Universal, good defaults
- Cons: Less documentation, newer

### 4. Got (Node.js only)
- Pros: Feature rich, great for backend
- Cons: Not for browsers, larger size

## Migration Checklist

- [ ] Install Ky
- [ ] Create HTTP client module
- [ ] Add authentication hooks
- [ ] Add error handling
- [ ] Create migration guide
- [ ] Update new features to use Ky
- [ ] Migrate existing API calls
- [ ] Remove Axios dependency
- [ ] Update documentation

## Monitoring

Track migration success:
- Bundle size reduction
- API call performance
- Error rates
- Developer feedback

## Decision Outcome

Ky provides the best balance of size, features, and developer experience for our browser-focused application. The significant bundle size reduction and modern API justify the migration effort.

## References

- [Ky Documentation](https://github.com/sindresorhus/ky)
- [Ky vs Axios Comparison](https://dev.to/usluer/why-ky-is-the-best-alternative-to-axios-and-fetch-for-modern-http-requests-27c3)
- [HTTP Clients Benchmark](https://www.zenrows.com/alternative/axios)