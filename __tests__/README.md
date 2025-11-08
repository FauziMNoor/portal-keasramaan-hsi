# Integration Tests for Template Builder APIs

This directory contains integration tests for the Template Builder Rapor APIs.

## Test Structure

```
__tests__/
├── api/
│   └── rapor/
│       ├── template-builder.integration.test.ts    # Template CRUD tests
│       ├── element-crud.integration.test.ts        # Element CRUD tests
│       └── pdf-generation.integration.test.ts      # PDF generation tests
└── README.md
```

## Test Coverage

### 1. Template CRUD Operations (`template-builder.integration.test.ts`)
- ✅ Create new builder template with default config
- ✅ Validate required fields
- ✅ List all builder templates
- ✅ Filter templates by jenis_rapor
- ✅ Fetch template with elements
- ✅ Handle non-existent template (404)
- ✅ Update template config
- ✅ Update canvas config
- ✅ Delete template and cascade delete elements

### 2. Element CRUD Operations (`element-crud.integration.test.ts`)
- ✅ Add text element to template
- ✅ Add header element to template
- ✅ Add data-table element to template
- ✅ Reject duplicate element IDs
- ✅ Update element position
- ✅ Update element size
- ✅ Update element content and style
- ✅ Reorder elements (z-index)
- ✅ Delete element
- ✅ Validate required fields
- ✅ Validate element types

### 3. PDF Generation (`pdf-generation.integration.test.ts`)
- ✅ Validate required fields for single generation
- ✅ Validate periode structure
- ✅ Fetch template and elements for generation
- ✅ Fetch student data for PDF generation
- ✅ Save generation history on success
- ✅ Save error to history on failure
- ✅ Validate siswaIds array for bulk generation
- ✅ Reject empty siswaIds array
- ✅ Fetch multiple students for bulk generation
- ✅ Track bulk generation progress
- ✅ Handle individual student failures in bulk
- ✅ Save bulk generation history for each student
- ✅ Handle missing template gracefully
- ✅ Handle missing student gracefully
- ✅ Handle template with no elements
- ✅ Verify storage bucket exists
- ✅ Generate valid storage path

## Prerequisites

Before running the tests, ensure you have:

1. **Environment Variables**: Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
2. **Database Setup**: Run the database migrations to create required tables
3. **Test Data**: The tests will create and clean up their own test data

## Running Tests

### Install Dependencies

First, install Jest and related dependencies:

```bash
npm install --save-dev jest @jest/globals @types/jest ts-jest dotenv
```

### Run All Integration Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test template-builder.integration.test.ts
npm test element-crud.integration.test.ts
npm test pdf-generation.integration.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Test Configuration

The tests use the following configuration:

- **Test Environment**: Node.js
- **Timeout**: 30 seconds per test (configurable in `jest.config.js`)
- **Database**: Real Supabase database (not mocked)
- **Cleanup**: Tests clean up after themselves in `afterAll` hooks

## Important Notes

### 1. Real Database Testing

These are **integration tests** that connect to a real Supabase database. They:
- Create real records in the database
- Test actual API behavior
- Clean up test data after completion

**⚠️ Warning**: Do not run these tests against a production database!

### 2. Test Data Cleanup

Each test suite includes cleanup logic in `afterAll` hooks to remove test data. However, if tests fail or are interrupted, some test data may remain in the database.

### 3. Test Isolation

Tests are designed to be independent and can run in any order. Each test creates its own test data and cleans up afterward.

### 4. Async Operations

All tests use async/await patterns and properly handle asynchronous operations.

## Troubleshooting

### Tests Timeout

If tests timeout, increase the timeout in `jest.config.js`:

```javascript
testTimeout: 60000, // 60 seconds
```

### Database Connection Issues

Ensure your `.env.local` file has correct Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Test Data Not Cleaned Up

If test data remains after failed tests, you can manually clean it up:

```sql
-- Delete test templates
DELETE FROM rapor_template_keasramaan 
WHERE nama_template LIKE '%Test%';

-- Delete test elements (cascade should handle this)
DELETE FROM rapor_template_elements_keasramaan 
WHERE template_id NOT IN (SELECT id FROM rapor_template_keasramaan);

-- Delete test history
DELETE FROM rapor_generate_history_keasramaan 
WHERE template_id NOT IN (SELECT id FROM rapor_template_keasramaan);
```

## Adding New Tests

When adding new integration tests:

1. Create a new test file in the appropriate directory
2. Follow the existing test structure (describe/it blocks)
3. Include setup (`beforeAll`) and cleanup (`afterAll`) hooks
4. Use descriptive test names
5. Test both success and error cases
6. Clean up all test data

Example:

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/lib/supabase';

describe('My New Feature Tests', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('should do something', async () => {
    // Test implementation
    expect(result).toBeDefined();
  });
});
```

## CI/CD Integration

To run these tests in CI/CD pipelines:

1. Set up environment variables in your CI/CD platform
2. Use a test database (not production)
3. Run tests as part of your build process:

```yaml
# Example GitHub Actions
- name: Run Integration Tests
  run: npm test
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

## Contributing

When contributing tests:

1. Ensure all tests pass locally
2. Add tests for new features
3. Update this README if adding new test categories
4. Follow the existing code style and patterns
