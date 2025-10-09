# Document Management Testing Suite

## Overview
Comprehensive test suite for the Document Management module covering unit tests, integration tests, and performance tests.

## Setup

### Prerequisites
```bash
npm install -D vitest @vitest/ui @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @types/node
```

### Test Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run with UI
```bash
npm run test:ui
```

### Run with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test validation
```

### Watch mode
```bash
npm test -- --watch
```

## Test Structure

### Unit Tests
- `validation.test.ts` - Zod schema validation tests
- `permissions.test.ts` - Permission check tests
- `state-machine.test.ts` - Document lifecycle state machine tests

### Integration Tests
- `integration.test.ts` - End-to-end workflow tests
  - File upload/download workflows
  - Approval workflow integration
  - Performance tests
  - Edge case handling

## Test Coverage

Target coverage: 80% minimum

Current coverage areas:
- ✅ Validation schemas
- ✅ Permission checks
- ✅ State machine transitions
- ✅ File upload/download
- ✅ Approval workflows
- ✅ Error handling

## Writing Tests

### Example Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { documentMetadataSchema } from '../validation';

describe('Document Validation', () => {
  it('should validate valid document', () => {
    const data = { title: 'Test' };
    const result = documentMetadataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
```

### Example Integration Test
```typescript
import { describe, it, expect } from 'vitest';

describe('File Upload Integration', () => {
  it('should upload and create document record', async () => {
    const file = new File(['content'], 'test.pdf');
    // Test implementation
  });
});
```

## Mocking

### Mock Server Actions
```typescript
vi.mock('../actions/documents', () => ({
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
}));
```

### Mock File System
```typescript
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));
```

## Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Use `afterEach` to reset state
3. **Descriptive Names** - Clear test descriptions
4. **AAA Pattern** - Arrange, Act, Assert
5. **Mock External Dependencies** - Database, file system, API calls

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Tests failing in CI
- Check environment variables
- Ensure database is accessible
- Verify file permissions

### Slow tests
- Use `test.concurrent` for independent tests
- Mock expensive operations
- Consider test parallelization

### Memory leaks
- Clear timers and intervals
- Unsubscribe from event listeners
- Close database connections

## Additional Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

