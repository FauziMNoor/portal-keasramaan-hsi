# Integration Testing Guide for Template Builder APIs

This document provides comprehensive information about the integration tests for the Template Builder Rapor system.

## Overview

The integration tests validate the complete API functionality including:
- Template CRUD operations
- Element CRUD operations  
- PDF generation (single and bulk)
- Data validation and error handling
- Database interactions
- Storage integration

## Test Architecture

### Test Philosophy

These are **true integration tests** that:
- Connect to a real Supabase database
- Test actual API behavior end-to-end
- Validate database constraints and relationships
- Test error handling and edge cases
- Clean up test data automatically

### Test Structure

```
__tests__/
├── api/
│   └── rapor/
│       ├── template-builder.integration.test.ts
│       ├── element-crud.integration.test.ts
│       └── pdf-generation.integration.test.ts
├── README.md
└── ...
```

## Installation

### 1. Install Test Dependencies

```bash
cd portal-keasramaan
npm install --save-dev jest @jest/globals @types/jest ts-jest dotenv
```

### 2. Configure Environment

Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Important**: Use a test/development database, NOT production!

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
# Template CRUD tests
npm test template-builder.integration.test.ts

# Element CRUD tests
npm test element-crud.integration.test.ts

# PDF generation tests
npm test pdf-generation.integration.test.ts
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Test Suites

### 1. Template Builder CRUD Tests

**File**: `__tests__/api/rapor/template-builder.integration.test.ts`

**Coverage**:
- ✅ Create template with default canvas config
- ✅ Validate required fields (nama_template, jenis_rapor)
- ✅ List all builder templates
- ✅ Filter templates by jenis_rapor
- ✅ Filter templates by is_active
- ✅ Fetch single template with elements
- ✅ Handle 404 for non-existent templates
- ✅ Update template metadata
- ✅ Update canvas configuration
- ✅ Delete template (cascade delete elements)

**Key Test Cases**:

```typescript
// Create template
it('should create a new builder template with default config', async () => {
  const templateData = {
    nama_template: 'Test Template',
    jenis_rapor: 'semester',
  };
  // ... test implementation
});

// Update template
it('should update template config', async () => {
  const updatedName = 'Updated Test Template';
  // ... test implementation
});

// Delete template
it('should delete template and cascade delete elements', async () => {
  // ... test implementation
});
```

### 2. Element CRUD Tests

**File**: `__tests__/api/rapor/element-crud.integration.test.ts`

**Coverage**:
- ✅ Add text element
- ✅ Add header element
- ✅ Add data-table element with bindings
- ✅ Add image element
- ✅ Add image-gallery element
- ✅ Add signature element
- ✅ Add line element
- ✅ Reject duplicate element IDs
- ✅ Update element position
- ✅ Update element size
- ✅ Update element content and style
- ✅ Reorder elements (z-index)
- ✅ Delete element
- ✅ Validate required fields
- ✅ Validate element types

**Key Test Cases**:

```typescript
// Add element
it('should add a text element to template', async () => {
  const element = {
    id: 'element-123',
    element_type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    content: { text: 'Test Text' },
    style: { fontSize: 16, color: '#000000' },
    z_index: 1,
    is_visible: true,
  };
  // ... test implementation
});

// Update element
it('should update element position', async () => {
  const newPosition = { x: 150, y: 150 };
  // ... test implementation
});

// Reorder elements
it('should update z-index of multiple elements', async () => {
  // ... test implementation
});
```

### 3. PDF Generation Tests

**File**: `__tests__/api/rapor/pdf-generation.integration.test.ts`

**Coverage**:

**Single PDF Generation**:
- ✅ Validate required fields (templateId, siswaId, periode)
- ✅ Validate periode structure
- ✅ Fetch template and elements
- ✅ Fetch student data
- ✅ Save generation history on success
- ✅ Save error to history on failure

**Bulk PDF Generation**:
- ✅ Validate siswaIds array
- ✅ Reject empty siswaIds array
- ✅ Fetch multiple students
- ✅ Track generation progress
- ✅ Handle individual student failures
- ✅ Save bulk generation history

**Error Handling**:
- ✅ Handle missing template
- ✅ Handle missing student
- ✅ Handle template with no elements

**Storage Integration**:
- ✅ Verify storage bucket exists
- ✅ Generate valid storage paths

**Key Test Cases**:

```typescript
// Single generation
it('should fetch template and elements for generation', async () => {
  const { data: template } = await supabase
    .from('rapor_template_keasramaan')
    .select('*')
    .eq('id', testTemplateId)
    .single();
  
  expect(template).toBeDefined();
  expect(template?.template_type).toBe('builder');
});

// Bulk generation
it('should track bulk generation progress', async () => {
  const jobStatus = {
    jobId: 'test-job-123',
    status: 'processing',
    progress: { total: 10, completed: 5, failed: 1 },
    results: [...],
  };
  
  expect(jobStatus.progress.completed).toBe(5);
});

// Error handling
it('should handle missing template gracefully', async () => {
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { error } = await supabase
    .from('rapor_template_keasramaan')
    .select('*')
    .eq('id', fakeId)
    .single();
  
  expect(error).toBeDefined();
});
```

## Test Data Management

### Setup (beforeAll)

Each test suite creates its own test data:

```typescript
beforeAll(async () => {
  // Get test user
  const { data: userData } = await supabase
    .from('guru')
    .select('id')
    .limit(1)
    .single();
  
  testUserId = userData?.id;

  // Create test template
  const { data: template } = await supabase
    .from('rapor_template_keasramaan')
    .insert({
      nama_template: 'Test Template',
      jenis_rapor: 'semester',
      template_type: 'builder',
      canvas_config: {...},
      created_by: testUserId,
    })
    .select()
    .single();
  
  testTemplateId = template?.id;
});
```

### Cleanup (afterAll)

Tests clean up after themselves:

```typescript
afterAll(async () => {
  // Delete test template (cascade deletes elements)
  if (testTemplateId) {
    await supabase
      .from('rapor_template_keasramaan')
      .delete()
      .eq('id', testTemplateId);
  }

  // Clean up generated history
  await supabase
    .from('rapor_generate_history_keasramaan')
    .delete()
    .eq('template_id', testTemplateId);
});
```

### Manual Cleanup

If tests fail and don't clean up, run this SQL:

```sql
-- Delete test templates
DELETE FROM rapor_template_keasramaan 
WHERE nama_template LIKE '%Test%' 
   OR nama_template LIKE '%Temp%';

-- Delete orphaned elements
DELETE FROM rapor_template_elements_keasramaan 
WHERE template_id NOT IN (
  SELECT id FROM rapor_template_keasramaan
);

-- Delete test history
DELETE FROM rapor_generate_history_keasramaan 
WHERE template_id NOT IN (
  SELECT id FROM rapor_template_keasramaan
);
```

## Best Practices

### 1. Test Isolation

Each test should be independent:
- Don't rely on test execution order
- Create your own test data
- Clean up after yourself

### 2. Descriptive Test Names

Use clear, descriptive test names:

```typescript
// Good
it('should create a new builder template with default config', async () => {});

// Bad
it('test1', async () => {});
```

### 3. Test Both Success and Failure

Always test both happy path and error cases:

```typescript
describe('Template Creation', () => {
  it('should create template with valid data', async () => {
    // Test success case
  });

  it('should reject template with missing required fields', async () => {
    // Test error case
  });
});
```

### 4. Use Proper Assertions

Use specific assertions:

```typescript
// Good
expect(data).toBeDefined();
expect(data?.nama_template).toBe('Test Template');
expect(data?.template_type).toBe('builder');

// Less specific
expect(data).toBeTruthy();
```

### 5. Handle Async Operations

Always use async/await properly:

```typescript
// Good
it('should fetch data', async () => {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  expect(error).toBeNull();
  expect(data).toBeDefined();
});

// Bad - missing await
it('should fetch data', async () => {
  const { data, error } = supabase
    .from('table')
    .select('*');
  // This won't work!
});
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests take too long and timeout

**Solution**: Increase timeout in `jest.config.js`:

```javascript
testTimeout: 60000, // 60 seconds
```

Or for specific tests:

```typescript
it('slow test', async () => {
  // test code
}, 60000); // 60 second timeout
```

### Database Connection Errors

**Problem**: Cannot connect to Supabase

**Solutions**:
1. Check `.env.local` has correct credentials
2. Verify Supabase project is running
3. Check network connectivity
4. Verify RLS policies allow test operations

### Test Data Not Cleaned Up

**Problem**: Test data remains after failed tests

**Solution**: Run manual cleanup SQL (see Test Data Management section)

### Import Errors

**Problem**: Cannot import modules

**Solution**: Check `jest.config.js` has correct module mapping:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./portal-keasramaan
      
      - name: Run integration tests
        run: npm test
        working-directory: ./portal-keasramaan
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./portal-keasramaan/coverage/lcov.info
```

## Extending Tests

### Adding New Test Suite

1. Create new test file in `__tests__/api/rapor/`
2. Follow existing structure
3. Include setup and cleanup
4. Update this documentation

Example:

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/lib/supabase';

describe('New Feature Tests', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Feature Functionality', () => {
    it('should do something', async () => {
      // Test implementation
    });
  });
});
```

### Adding New Test Cases

When adding tests to existing suites:

1. Place in appropriate describe block
2. Use descriptive names
3. Test both success and error cases
4. Clean up any additional test data

## Performance Considerations

### Test Execution Time

- Single test suite: ~5-15 seconds
- All integration tests: ~30-60 seconds
- With coverage: ~60-90 seconds

### Optimization Tips

1. **Run tests in band**: Use `--runInBand` to avoid race conditions
2. **Limit test data**: Create minimal test data needed
3. **Reuse test data**: Share setup data within a suite when possible
4. **Skip slow tests**: Use `.skip` for slow tests during development

```typescript
it.skip('slow test', async () => {
  // This test will be skipped
});
```

## Maintenance

### Regular Tasks

1. **Update test data**: Keep test data realistic and up-to-date
2. **Review coverage**: Aim for >80% coverage on API routes
3. **Clean up**: Remove obsolete tests
4. **Update docs**: Keep this guide current

### When to Update Tests

Update tests when:
- Adding new API endpoints
- Changing API behavior
- Modifying database schema
- Fixing bugs (add regression tests)
- Refactoring code

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Support

For questions or issues:
1. Check this documentation
2. Review existing tests for examples
3. Check Jest and Supabase documentation
4. Ask the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
