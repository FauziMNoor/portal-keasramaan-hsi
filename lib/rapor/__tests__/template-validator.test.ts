/**
 * Unit Tests for Template Validator
 * 
 * Run with: npx tsx lib/rapor/__tests__/template-validator.test.ts
 */

import {
  validateTemplateHasElements,
  validateUniqueElementIds,
  validateZIndexValues,
  validateTemplateConfig,
  checkOverlappingElements,
  validateTemplateSize,
  validateTemplate,
  validateBeforeSave,
  validateBeforeGenerate,
  getValidationMessage,
  formatValidationErrors,
  canSaveTemplate,
  canGeneratePDF,
} from '../template-validator';

import type {
  TemplateConfig,
  TextElement,
} from '@/types/rapor-builder';

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

console.log('='.repeat(60));
console.log('Testing Template Validator Utilities');
console.log('='.repeat(60));

// Sample template config
const validTemplateConfig: TemplateConfig = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Template',
  type: 'builder',
  version: '1.0.0',
  pageSize: 'A4',
  orientation: 'portrait',
  dimensions: { width: 794, height: 1123 },
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  backgroundColor: '#ffffff',
  metadata: {
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-id',
    lastEditedBy: 'user-id',
  },
};

// Sample elements
const createTextElement = (id: string, x: number, y: number, zIndex: number): TextElement => ({
  id,
  type: 'text',
  position: { x, y },
  size: { width: 200, height: 50 },
  zIndex,
  isVisible: true,
  isLocked: false,
  content: {
    text: 'Test {{siswa.nama}}',
    richText: false,
  },
  style: {
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Arial',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.5,
  },
});

// Test validateTemplateHasElements
console.log('\n--- Testing validateTemplateHasElements ---');
{
  const elements = [createTextElement('elem1', 100, 100, 1)];
  const errors1 = validateTemplateHasElements(elements);
  assert(errors1.length === 0, 'Template with elements has no errors');

  const errors2 = validateTemplateHasElements([]);
  assert(errors2.length > 0, 'Template without elements has error');
  assert(errors2[0].field === 'elements', 'Error field is elements');
}

// Test validateUniqueElementIds
console.log('\n--- Testing validateUniqueElementIds ---');
{
  const uniqueElements = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 100, 200, 2),
  ];
  const errors1 = validateUniqueElementIds(uniqueElements);
  assert(errors1.length === 0, 'Unique IDs have no errors');

  const duplicateElements = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem1', 100, 200, 2),
  ];
  const errors2 = validateUniqueElementIds(duplicateElements);
  assert(errors2.length > 0, 'Duplicate IDs have error');
  assert(errors2[0].message.includes('duplikat'), 'Error message mentions duplicate');
}

// Test validateZIndexValues
console.log('\n--- Testing validateZIndexValues ---');
{
  const validElements = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 100, 200, 2),
  ];
  const errors1 = validateZIndexValues(validElements);
  assert(errors1.length === 0, 'Valid z-index values have no errors');

  const negativeZIndex = [
    createTextElement('elem1', 100, 100, -1),
  ];
  const errors2 = validateZIndexValues(negativeZIndex);
  assert(errors2.length > 0, 'Negative z-index has error');

  const floatZIndex = [
    { ...createTextElement('elem1', 100, 100, 1), zIndex: 1.5 },
  ];
  const errors3 = validateZIndexValues(floatZIndex);
  assert(errors3.length > 0, 'Float z-index has error');
}

// Test validateTemplateConfig
console.log('\n--- Testing validateTemplateConfig ---');
{
  const errors1 = validateTemplateConfig(validTemplateConfig);
  assert(errors1.filter(e => e.severity === 'error').length === 0, 'Valid config has no errors');

  const emptyName: TemplateConfig = {
    ...validTemplateConfig,
    name: '',
  };
  const errors2 = validateTemplateConfig(emptyName);
  assert(errors2.some(e => e.field === 'name'), 'Empty name has error');

  const invalidPageSize: TemplateConfig = {
    ...validTemplateConfig,
    pageSize: 'INVALID' as any,
  };
  const errors3 = validateTemplateConfig(invalidPageSize);
  assert(errors3.some(e => e.field === 'pageSize'), 'Invalid page size has error');

  const invalidOrientation: TemplateConfig = {
    ...validTemplateConfig,
    orientation: 'INVALID' as any,
  };
  const errors4 = validateTemplateConfig(invalidOrientation);
  assert(errors4.some(e => e.field === 'orientation'), 'Invalid orientation has error');

  const zeroDimensions: TemplateConfig = {
    ...validTemplateConfig,
    dimensions: { width: 0, height: 0 },
  };
  const errors5 = validateTemplateConfig(zeroDimensions);
  assert(errors5.some(e => e.field === 'dimensions'), 'Zero dimensions has error');

  const negativeMargins: TemplateConfig = {
    ...validTemplateConfig,
    margins: { top: -10, right: -10, bottom: -10, left: -10 },
  };
  const errors6 = validateTemplateConfig(negativeMargins);
  assert(errors6.some(e => e.field === 'margins'), 'Negative margins has error');

  const largeMargins: TemplateConfig = {
    ...validTemplateConfig,
    margins: { top: 300, right: 300, bottom: 300, left: 300 },
  };
  const errors7 = validateTemplateConfig(largeMargins);
  assert(errors7.some(e => e.severity === 'warning'), 'Large margins has warning');
}

// Test checkOverlappingElements
console.log('\n--- Testing checkOverlappingElements ---');
{
  const nonOverlapping = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 100, 200, 2),
  ];
  const warnings1 = checkOverlappingElements(nonOverlapping);
  assert(warnings1.length === 0, 'Non-overlapping elements have no warnings');

  const overlapping = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 150, 120, 2),
  ];
  const warnings2 = checkOverlappingElements(overlapping);
  assert(warnings2.length > 0, 'Overlapping elements have warning');
  assert(warnings2[0].severity === 'warning', 'Overlap is a warning, not error');
}

// Test validateTemplateSize
console.log('\n--- Testing validateTemplateSize ---');
{
  const normalSize = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 100, 200, 2),
  ];
  const warnings1 = validateTemplateSize(normalSize);
  assert(warnings1.length === 0, 'Normal size template has no warnings');

  const tooManyElements = Array.from({ length: 150 }, (_, i) =>
    createTextElement(`elem${i}`, 100, 100 + i * 10, i)
  );
  const warnings2 = validateTemplateSize(tooManyElements);
  assert(warnings2.length > 0, 'Too many elements has warning');
  assert(warnings2[0].message.includes('terlalu banyak'), 'Warning mentions too many elements');
}

// Test validateTemplate
console.log('\n--- Testing validateTemplate ---');
{
  const validElements = [
    createTextElement('elem1', 100, 100, 1),
    createTextElement('elem2', 100, 200, 2),
  ];
  const result1 = validateTemplate(validTemplateConfig, validElements);
  assert(result1.valid === true, 'Valid template passes validation');
  assert(result1.errors.length === 0, 'Valid template has no errors');

  const invalidElements = [
    createTextElement('elem1', -10, -10, 1),
  ];
  const result2 = validateTemplate(validTemplateConfig, invalidElements);
  assert(result2.valid === false, 'Invalid template fails validation');
  assert(result2.errors.length > 0, 'Invalid template has errors');

  const emptyElements: TextElement[] = [];
  const result3 = validateTemplate(validTemplateConfig, emptyElements);
  assert(result3.valid === false, 'Template without elements fails validation');
  assert(result3.errors.some(e => e.field === 'elements'), 'Error mentions elements');
}

// Test validateBeforeSave
console.log('\n--- Testing validateBeforeSave ---');
{
  const validElements = [
    createTextElement('elem1', 100, 100, 1),
  ];
  const result1 = validateBeforeSave(validTemplateConfig, validElements);
  assert(result1.valid === true, 'Valid template can be saved');

  const invalidElements = [
    createTextElement('elem1', -10, -10, 1),
  ];
  const result2 = validateBeforeSave(validTemplateConfig, invalidElements);
  assert(result2.valid === false, 'Invalid template cannot be saved');
}

// Test validateBeforeGenerate
console.log('\n--- Testing validateBeforeGenerate ---');
{
  const validElements = [
    createTextElement('elem1', 100, 100, 1),
  ];
  const result1 = validateBeforeGenerate(validTemplateConfig, validElements);
  assert(result1.valid === true, 'Valid template can generate PDF');

  const invisibleElements = [
    { ...createTextElement('elem1', 100, 100, 1), isVisible: false },
  ];
  const result2 = validateBeforeGenerate(validTemplateConfig, invisibleElements);
  assert(result2.errors.some(e => e.message.includes('visible')), 'Error mentions visibility');
  assert(result2.valid === false || result2.errors.length > 0, 'Template with no visible elements has errors');

  const noDataBinding = [
    { ...createTextElement('elem1', 100, 100, 1), content: { text: 'Static text', richText: false } },
  ];
  const result3 = validateBeforeGenerate(validTemplateConfig, noDataBinding);
  assert(result3.warnings.some(w => w.message.includes('data binding')), 'Warning about no data binding');
}

// Test getValidationMessage
console.log('\n--- Testing getValidationMessage ---');
{
  const validResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  const message1 = getValidationMessage(validResult);
  assert(message1.includes('valid'), 'Valid result has positive message');

  const errorResult = {
    valid: false,
    errors: [
      { field: 'test', message: 'error', severity: 'error' as const },
      { field: 'test2', message: 'error2', severity: 'error' as const },
    ],
    warnings: [],
  };
  const message2 = getValidationMessage(errorResult);
  assert(message2.includes('2'), 'Message includes error count');
  assert(message2.includes('error'), 'Message mentions errors');

  const warningResult = {
    valid: false,
    errors: [],
    warnings: [
      { field: 'test', message: 'warning', severity: 'warning' as const },
    ],
  };
  const message3 = getValidationMessage(warningResult);
  assert(message3.includes('1') && message3.includes('peringatan'), 'Message includes warning info');
}

// Test formatValidationErrors
console.log('\n--- Testing formatValidationErrors ---');
{
  const errors = [
    { field: 'field1', message: 'Error 1', severity: 'error' as const },
    { field: 'field2', message: 'Error 2', severity: 'error' as const },
  ];
  const formatted = formatValidationErrors(errors);
  assert(formatted.includes('field1'), 'Formatted string includes field1');
  assert(formatted.includes('field2'), 'Formatted string includes field2');
  assert(formatted.includes('Error 1'), 'Formatted string includes Error 1');
  assert(formatted.includes('Error 2'), 'Formatted string includes Error 2');
}

// Test canSaveTemplate
console.log('\n--- Testing canSaveTemplate ---');
{
  const validResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  assert(canSaveTemplate(validResult) === true, 'Can save valid template');

  const withWarnings = {
    valid: true,
    errors: [],
    warnings: [{ field: 'test', message: 'warning', severity: 'warning' as const }],
  };
  assert(canSaveTemplate(withWarnings) === true, 'Can save template with warnings');

  const withErrors = {
    valid: false,
    errors: [{ field: 'test', message: 'error', severity: 'error' as const }],
    warnings: [],
  };
  assert(canSaveTemplate(withErrors) === false, 'Cannot save template with errors');
}

// Test canGeneratePDF
console.log('\n--- Testing canGeneratePDF ---');
{
  const validResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  assert(canGeneratePDF(validResult) === true, 'Can generate PDF from valid template');

  const withWarnings = {
    valid: true,
    errors: [],
    warnings: [{ field: 'test', message: 'warning', severity: 'warning' as const }],
  };
  assert(canGeneratePDF(withWarnings) === true, 'Can generate PDF with warnings');

  const withErrors = {
    valid: false,
    errors: [{ field: 'test', message: 'error', severity: 'error' as const }],
    warnings: [],
  };
  assert(canGeneratePDF(withErrors) === false, 'Cannot generate PDF with errors');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
}
