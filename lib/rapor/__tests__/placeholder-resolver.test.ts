/**
 * Unit Tests for Placeholder Resolver
 * 
 * Run with: npx tsx lib/rapor/__tests__/placeholder-resolver.test.ts
 */

import {
  extractPlaceholders,
  resolvePlaceholder,
  replacePlaceholders,
  validatePlaceholders,
  getValidPlaceholderPaths,
  isValidPlaceholderFormat,
  replacePlaceholdersInObject,
  hasPlaceholders,
  countPlaceholders,
} from '../placeholder-resolver';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  assert(isEqual, message);
  if (!isEqual) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
  }
}

// Test data
const sampleData = {
  siswa: {
    nama: 'Ahmad Fauzi',
    nis: '12345',
    kelas: 'X IPA 1',
    asrama: 'Al-Fatih',
    cabang: 'Pusat',
  },
  habit_tracker: {
    ubudiyah: {
      average: 2.8,
      percentage: 93.3,
    },
    overall_average: 2.9,
  },
  school: {
    nama: 'HSI Boarding School',
  },
};

console.log('='.repeat(60));
console.log('Testing Placeholder Resolver Utilities');
console.log('='.repeat(60));

// Test extractPlaceholders
console.log('\n--- Testing extractPlaceholders ---');
{
  const text1 = 'Hello {{siswa.nama}}, your score is {{habit_tracker.overall_average}}';
  const result1 = extractPlaceholders(text1);
  assertEquals(result1, ['siswa.nama', 'habit_tracker.overall_average'], 'Extract multiple placeholders');

  const text2 = 'No placeholders here';
  const result2 = extractPlaceholders(text2);
  assertEquals(result2, [], 'Extract from text without placeholders');

  const text3 = '{{siswa.nama}} {{siswa.nama}}';
  const result3 = extractPlaceholders(text3);
  assertEquals(result3, ['siswa.nama', 'siswa.nama'], 'Extract duplicate placeholders');

  const text4 = '{{ siswa.nama }}';
  const result4 = extractPlaceholders(text4);
  assertEquals(result4, ['siswa.nama'], 'Extract placeholder with spaces');
}

// Test resolvePlaceholder
console.log('\n--- Testing resolvePlaceholder ---');
{
  const value1 = resolvePlaceholder('siswa.nama', sampleData);
  assertEquals(value1, 'Ahmad Fauzi', 'Resolve simple nested path');

  const value2 = resolvePlaceholder('habit_tracker.ubudiyah.average', sampleData);
  assertEquals(value2, 2.8, 'Resolve deeply nested path');

  const value3 = resolvePlaceholder('invalid.path', sampleData);
  assertEquals(value3, null, 'Return null for invalid path');

  const value4 = resolvePlaceholder('siswa.invalid', sampleData);
  assertEquals(value4, null, 'Return null for invalid nested path');

  const value5 = resolvePlaceholder('', sampleData);
  assertEquals(value5, null, 'Return null for empty path');
}

// Test replacePlaceholders
console.log('\n--- Testing replacePlaceholders ---');
{
  const text1 = 'Nama: {{siswa.nama}}, Kelas: {{siswa.kelas}}';
  const result1 = replacePlaceholders(text1, sampleData);
  assertEquals(result1, 'Nama: Ahmad Fauzi, Kelas: X IPA 1', 'Replace multiple placeholders');

  const text2 = 'Score: {{habit_tracker.ubudiyah.average}}';
  const result2 = replacePlaceholders(text2, sampleData);
  assertEquals(result2, 'Score: 2.8', 'Replace with number value');

  const text3 = 'Missing: {{invalid.path}}';
  const result3 = replacePlaceholders(text3, sampleData);
  assertEquals(result3, 'Missing: ', 'Replace missing placeholder with empty string');

  const text4 = 'Missing: {{invalid.path}}';
  const result4 = replacePlaceholders(text4, sampleData, { keepPlaceholderOnMissing: true });
  assertEquals(result4, 'Missing: {{invalid.path}}', 'Keep placeholder when missing');

  const text5 = 'Missing: {{invalid.path}}';
  const result5 = replacePlaceholders(text5, sampleData, { defaultValue: 'N/A' });
  assertEquals(result5, 'Missing: N/A', 'Use default value for missing placeholder');

  const text6 = 'No placeholders';
  const result6 = replacePlaceholders(text6, sampleData);
  assertEquals(result6, 'No placeholders', 'Return unchanged text without placeholders');
}

// Test validatePlaceholders
console.log('\n--- Testing validatePlaceholders ---');
{
  const validPaths = ['siswa.nama', 'siswa.kelas', 'habit_tracker.overall_average'];
  
  const text1 = 'Hello {{siswa.nama}}, your score is {{habit_tracker.overall_average}}';
  const result1 = validatePlaceholders(text1, validPaths);
  assert(result1.valid === true, 'Validate all valid placeholders');
  assertEquals(result1.invalidPlaceholders, [], 'No invalid placeholders');

  const text2 = 'Hello {{siswa.nama}}, your age is {{siswa.age}}';
  const result2 = validatePlaceholders(text2, validPaths);
  assert(result2.valid === false, 'Detect invalid placeholder');
  assertEquals(result2.invalidPlaceholders, ['siswa.age'], 'List invalid placeholders');

  const text3 = 'No placeholders';
  const result3 = validatePlaceholders(text3, validPaths);
  assert(result3.valid === true, 'Validate text without placeholders');
}

// Test isValidPlaceholderFormat
console.log('\n--- Testing isValidPlaceholderFormat ---');
{
  assert(isValidPlaceholderFormat('siswa.nama') === true, 'Valid format: siswa.nama');
  assert(isValidPlaceholderFormat('habit_tracker.ubudiyah.average') === true, 'Valid format: habit_tracker.ubudiyah.average');
  assert(isValidPlaceholderFormat('invalid') === false, 'Invalid format: no dot');
  assert(isValidPlaceholderFormat('siswa') === false, 'Invalid format: single word');
  assert(isValidPlaceholderFormat('siswa.') === false, 'Invalid format: trailing dot');
  assert(isValidPlaceholderFormat('.nama') === false, 'Invalid format: leading dot');
  assert(isValidPlaceholderFormat('siswa..nama') === false, 'Invalid format: double dot');
}

// Test getValidPlaceholderPaths
console.log('\n--- Testing getValidPlaceholderPaths ---');
{
  const schema = {
    siswa: {
      nama: 'string',
      nis: 'string',
      kelas: 'string',
    },
    school: {
      nama: 'string',
    },
  };
  
  const paths = getValidPlaceholderPaths(schema);
  assert(paths.includes('siswa.nama'), 'Extract siswa.nama');
  assert(paths.includes('siswa.nis'), 'Extract siswa.nis');
  assert(paths.includes('siswa.kelas'), 'Extract siswa.kelas');
  assert(paths.includes('school.nama'), 'Extract school.nama');
  assert(paths.length === 4, 'Extract correct number of paths');
}

// Test replacePlaceholdersInObject
console.log('\n--- Testing replacePlaceholdersInObject ---');
{
  const obj1 = {
    title: 'Hello {{siswa.nama}}',
    subtitle: 'Class: {{siswa.kelas}}',
    nested: {
      text: 'Score: {{habit_tracker.overall_average}}',
    },
  };
  
  const result1 = replacePlaceholdersInObject(obj1, sampleData);
  assertEquals(result1.title, 'Hello Ahmad Fauzi', 'Replace in top-level string');
  assertEquals(result1.subtitle, 'Class: X IPA 1', 'Replace in another top-level string');
  assertEquals(result1.nested.text, 'Score: 2.9', 'Replace in nested string');

  const obj2 = {
    items: ['{{siswa.nama}}', '{{siswa.kelas}}'],
  };
  
  const result2 = replacePlaceholdersInObject(obj2, sampleData);
  assertEquals(result2.items, ['Ahmad Fauzi', 'X IPA 1'], 'Replace in array');

  const obj3 = {
    number: 42,
    boolean: true,
    null: null,
  };
  
  const result3 = replacePlaceholdersInObject(obj3, sampleData);
  assertEquals(result3, obj3, 'Keep non-string values unchanged');
}

// Test hasPlaceholders
console.log('\n--- Testing hasPlaceholders ---');
{
  assert(hasPlaceholders('Hello {{siswa.nama}}') === true, 'Detect placeholder');
  assert(hasPlaceholders('No placeholders') === false, 'No placeholder');
  assert(hasPlaceholders('{{a}} and {{b}}') === true, 'Multiple placeholders');
  assert(hasPlaceholders('') === false, 'Empty string');
}

// Test countPlaceholders
console.log('\n--- Testing countPlaceholders ---');
{
  assertEquals(countPlaceholders('Hello {{siswa.nama}}'), 1, 'Count single placeholder');
  assertEquals(countPlaceholders('{{a}} and {{b}}'), 2, 'Count multiple placeholders');
  assertEquals(countPlaceholders('No placeholders'), 0, 'Count zero placeholders');
  assertEquals(countPlaceholders('{{a}} {{a}}'), 2, 'Count duplicate placeholders');
}

// Test number formatting
console.log('\n--- Testing Number Formatting ---');
{
  const dataWithNumbers = {
    integer: 42,
    decimal: 3.14159,
    zero: 0,
  };
  
  const text1 = 'Integer: {{integer}}, Decimal: {{decimal}}, Zero: {{zero}}';
  const result1 = replacePlaceholders(text1, dataWithNumbers);
  assertEquals(result1, 'Integer: 42, Decimal: 3.1, Zero: 0', 'Format numbers correctly');

  const result2 = replacePlaceholders(text1, dataWithNumbers, { formatNumber: false });
  assertEquals(result2, 'Integer: 42, Decimal: 3.14159, Zero: 0', 'No formatting when disabled');
}

// Test boolean formatting
console.log('\n--- Testing Boolean Formatting ---');
{
  const dataWithBooleans = {
    yes: true,
    no: false,
  };
  
  const text = 'Yes: {{yes}}, No: {{no}}';
  const result = replacePlaceholders(text, dataWithBooleans);
  assertEquals(result, 'Yes: Ya, No: Tidak', 'Format booleans to Indonesian');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
}
