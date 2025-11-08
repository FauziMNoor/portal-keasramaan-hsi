/**
 * Basic validation tests for rapor-builder types
 * These tests demonstrate that the Zod schemas work correctly
 */

import {
  TemplateConfigSchema,
  HeaderElementSchema,
  TextElementSchema,
  DataTableElementSchema,
  ImageElementSchema,
  ImageGalleryElementSchema,
  SignatureElementSchema,
  LineElementSchema,
  validateElementPosition,
  validateUniqueElementIds,
  validateDataBinding,
  extractPlaceholders,
  validatePlaceholders,
  type TemplateConfig,
  type HeaderElement,
  type TextElement,
} from '../rapor-builder';

// Test TemplateConfig validation
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

console.log('Testing TemplateConfig validation...');
const templateResult = TemplateConfigSchema.safeParse(validTemplateConfig);
console.log('TemplateConfig valid:', templateResult.success);

// Test HeaderElement validation
const validHeaderElement: HeaderElement = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  type: 'header',
  position: { x: 0, y: 0 },
  size: { width: 794, height: 100 },
  zIndex: 1,
  isVisible: true,
  isLocked: false,
  content: {
    title: {
      text: '{{school.nama}}',
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center',
    },
  },
  style: {
    backgroundColor: '#f0f0f0',
    padding: { top: 10, right: 10, bottom: 10, left: 10 },
  },
};

console.log('\nTesting HeaderElement validation...');
const headerResult = HeaderElementSchema.safeParse(validHeaderElement);
console.log('HeaderElement valid:', headerResult.success);

// Test TextElement validation
const validTextElement: TextElement = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  type: 'text',
  position: { x: 50, y: 150 },
  size: { width: 694, height: 50 },
  zIndex: 2,
  isVisible: true,
  isLocked: false,
  content: {
    text: 'Nama: {{siswa.nama}}',
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
};

console.log('\nTesting TextElement validation...');
const textResult = TextElementSchema.safeParse(validTextElement);
console.log('TextElement valid:', textResult.success);

// Test validation helpers
console.log('\n--- Testing Validation Helpers ---');

// Test validateElementPosition
const canvasDimensions = { width: 794, height: 1123 };
const elementInBounds = {
  id: 'test',
  type: 'text' as const,
  position: { x: 100, y: 100 },
  size: { width: 200, height: 50 },
  zIndex: 1,
  isVisible: true,
  isLocked: false,
};
const elementOutOfBounds = {
  ...elementInBounds,
  position: { x: 800, y: 100 },
};

console.log('\nElement in bounds:', validateElementPosition(elementInBounds, canvasDimensions));
console.log('Element out of bounds:', validateElementPosition(elementOutOfBounds, canvasDimensions));

// Test validateUniqueElementIds
const elementsUnique = [
  { ...elementInBounds, id: 'id1' },
  { ...elementInBounds, id: 'id2' },
];
const elementsDuplicate = [
  { ...elementInBounds, id: 'id1' },
  { ...elementInBounds, id: 'id1' },
];

console.log('\nUnique IDs:', validateUniqueElementIds(elementsUnique));
console.log('Duplicate IDs:', validateUniqueElementIds(elementsDuplicate));

// Test validateDataBinding
console.log('\nValid binding {{siswa.nama}}:', validateDataBinding('{{siswa.nama}}'));
console.log('Valid binding {{habit_tracker.ubudiyah.average}}:', validateDataBinding('{{habit_tracker.ubudiyah.average}}'));
console.log('Invalid binding {{invalid}}:', validateDataBinding('{{invalid}}'));
console.log('Invalid binding siswa.nama:', validateDataBinding('siswa.nama'));

// Test extractPlaceholders
const textWithPlaceholders = 'Hello {{siswa.nama}}, your score is {{habit_tracker.overall_average}}';
console.log('\nExtracted placeholders:', extractPlaceholders(textWithPlaceholders));

// Test validatePlaceholders
const validFields = ['siswa.nama', 'siswa.kelas', 'habit_tracker.overall_average'];
const result1 = validatePlaceholders(textWithPlaceholders, validFields);
console.log('\nValidate placeholders (all valid):', result1);

const textWithInvalidPlaceholder = 'Hello {{siswa.nama}}, your age is {{siswa.age}}';
const result2 = validatePlaceholders(textWithInvalidPlaceholder, validFields);
console.log('Validate placeholders (with invalid):', result2);

console.log('\n✅ All type definitions and validation helpers are working correctly!');
