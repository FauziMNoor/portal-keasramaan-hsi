/**
 * Unit Tests for Element Validator
 * 
 * Run with: npx tsx lib/rapor/__tests__/element-validator.test.ts
 */

import {
  validateElementPosition,
  validateElementSize,
  validateTextPlaceholders,
  validateHeaderElement,
  validateTextElement,
  validateDataTableElement,
  validateImageElement,
  validateImageGalleryElement,
  validateSignatureElement,
  validateLineElement,
  validateElement,
  validateAllElements,
  getValidationSummary,
  VALID_PLACEHOLDER_PATHS,
  VALID_DATA_SOURCES,
} from '../element-validator';

import type {
  HeaderElement,
  TextElement,
  DataTableElement,
  ImageElement,
  ImageGalleryElement,
  SignatureElement,
  LineElement,
  Dimensions,
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

const canvasDimensions: Dimensions = { width: 794, height: 1123 };

console.log('='.repeat(60));
console.log('Testing Element Validator Utilities');
console.log('='.repeat(60));

// Test validateElementPosition
console.log('\n--- Testing validateElementPosition ---');
{
  const elementInBounds: TextElement = {
    id: 'test1',
    type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    zIndex: 1,
    isVisible: true,
    isLocked: false,
    content: { text: 'Test', richText: false },
    style: {
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.5,
    },
  };

  const errors1 = validateElementPosition(elementInBounds, canvasDimensions);
  assert(errors1.length === 0, 'Element within bounds has no errors');

  const elementOutOfBounds: TextElement = {
    ...elementInBounds,
    position: { x: 800, y: 100 },
  };

  const errors2 = validateElementPosition(elementOutOfBounds, canvasDimensions);
  assert(errors2.length > 0, 'Element out of bounds has errors');
  assert(errors2.some(e => e.field === 'position'), 'Error mentions position field');

  const elementNegativePosition: TextElement = {
    ...elementInBounds,
    position: { x: -10, y: -20 },
  };

  const errors3 = validateElementPosition(elementNegativePosition, canvasDimensions);
  assert(errors3.length >= 2, 'Negative position has errors');
  assert(errors3.some(e => e.field === 'position.x'), 'Error for negative X');
  assert(errors3.some(e => e.field === 'position.y'), 'Error for negative Y');
}

// Test validateElementSize
console.log('\n--- Testing validateElementSize ---');
{
  const validElement: TextElement = {
    id: 'test2',
    type: 'text',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 50 },
    zIndex: 1,
    isVisible: true,
    isLocked: false,
    content: { text: 'Test', richText: false },
    style: {
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.5,
    },
  };

  const errors1 = validateElementSize(validElement);
  assert(errors1.filter(e => e.severity === 'error').length === 0, 'Valid size has no errors');

  const zeroWidth: TextElement = {
    ...validElement,
    size: { width: 0, height: 50 },
  };

  const errors2 = validateElementSize(zeroWidth);
  assert(errors2.some(e => e.field === 'size.width' && e.severity === 'error'), 'Zero width is error');

  const negativeHeight: TextElement = {
    ...validElement,
    size: { width: 200, height: -10 },
  };

  const errors3 = validateElementSize(negativeHeight);
  assert(errors3.some(e => e.field === 'size.height' && e.severity === 'error'), 'Negative height is error');

  const tooSmall: TextElement = {
    ...validElement,
    size: { width: 5, height: 5 },
  };

  const errors4 = validateElementSize(tooSmall);
  assert(errors4.some(e => e.severity === 'warning'), 'Too small size has warnings');
}

// Test validateTextPlaceholders
console.log('\n--- Testing validateTextPlaceholders ---');
{
  const validText = 'Hello {{siswa.nama}}, your score is {{habit_tracker.overall_average}}';
  const errors1 = validateTextPlaceholders(validText);
  assert(errors1.length === 0, 'Valid placeholders have no errors');

  const invalidText = 'Hello {{invalid.placeholder}}';
  const errors2 = validateTextPlaceholders(invalidText);
  assert(errors2.length > 0, 'Invalid placeholder has errors');

  const invalidFormat = 'Hello {{invalid}}';
  const errors3 = validateTextPlaceholders(invalidFormat);
  assert(errors3.length > 0, 'Invalid format has errors');

  const noPlaceholders = 'Hello world';
  const errors4 = validateTextPlaceholders(noPlaceholders);
  assert(errors4.length === 0, 'Text without placeholders has no errors');
}

// Test validateHeaderElement
console.log('\n--- Testing validateHeaderElement ---');
{
  const validHeader: HeaderElement = {
    id: 'header1',
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

  const errors1 = validateHeaderElement(validHeader);
  assert(errors1.length === 0, 'Valid header has no errors');

  const emptyTitle: HeaderElement = {
    ...validHeader,
    content: {
      ...validHeader.content,
      title: {
        ...validHeader.content.title,
        text: '',
      },
    },
  };

  const errors2 = validateHeaderElement(emptyTitle);
  assert(errors2.some(e => e.field === 'content.title.text'), 'Empty title has error');

  const invalidFontSize: HeaderElement = {
    ...validHeader,
    content: {
      ...validHeader.content,
      title: {
        ...validHeader.content.title,
        fontSize: 0,
      },
    },
  };

  const errors3 = validateHeaderElement(invalidFontSize);
  assert(errors3.some(e => e.field === 'content.title.fontSize'), 'Invalid font size has error');
}

// Test validateTextElement
console.log('\n--- Testing validateTextElement ---');
{
  const validText: TextElement = {
    id: 'text1',
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

  const errors1 = validateTextElement(validText);
  assert(errors1.length === 0, 'Valid text element has no errors');

  const emptyText: TextElement = {
    ...validText,
    content: { text: '', richText: false },
  };

  const errors2 = validateTextElement(emptyText);
  assert(errors2.some(e => e.field === 'content.text'), 'Empty text has warning');

  const invalidLineHeight: TextElement = {
    ...validText,
    style: {
      ...validText.style,
      lineHeight: 0,
    },
  };

  const errors3 = validateTextElement(invalidLineHeight);
  assert(errors3.some(e => e.field === 'style.lineHeight'), 'Invalid line height has error');
}

// Test validateDataTableElement
console.log('\n--- Testing validateDataTableElement ---');
{
  const validTable: DataTableElement = {
    id: 'table1',
    type: 'data-table',
    position: { x: 50, y: 200 },
    size: { width: 694, height: 300 },
    zIndex: 3,
    isVisible: true,
    isLocked: false,
    dataBinding: {
      source: 'habit_tracker.ubudiyah',
    },
    columns: [
      {
        id: 'col1',
        header: 'Indikator',
        field: 'indikator',
        width: 'auto',
        align: 'left',
        format: 'text',
      },
      {
        id: 'col2',
        header: 'Nilai',
        field: 'nilai',
        width: 100,
        align: 'center',
        format: 'number',
      },
    ],
    style: {
      headerBackgroundColor: '#4a5568',
      headerTextColor: '#ffffff',
      headerFontSize: 12,
      headerFontWeight: 'bold',
      rowBackgroundColor: '#ffffff',
      rowTextColor: '#000000',
      rowFontSize: 11,
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cellPadding: 8,
    },
    options: {
      showHeader: true,
      showBorders: true,
      alternateRows: true,
    },
  };

  const errors1 = validateDataTableElement(validTable);
  assert(errors1.length === 0, 'Valid table has no errors');

  const emptySource: DataTableElement = {
    ...validTable,
    dataBinding: { source: '' },
  };

  const errors2 = validateDataTableElement(emptySource);
  assert(errors2.some(e => e.field === 'dataBinding.source'), 'Empty source has error');

  const noColumns: DataTableElement = {
    ...validTable,
    columns: [],
  };

  const errors3 = validateDataTableElement(noColumns);
  assert(errors3.some(e => e.field === 'columns'), 'No columns has error');

  const duplicateColumnIds: DataTableElement = {
    ...validTable,
    columns: [
      ...validTable.columns,
      { ...validTable.columns[0], id: 'col1' },
    ],
  };

  const errors4 = validateDataTableElement(duplicateColumnIds);
  assert(errors4.some(e => e.message.includes('duplikat')), 'Duplicate column IDs has error');
}

// Test validateImageElement
console.log('\n--- Testing validateImageElement ---');
{
  const validImage: ImageElement = {
    id: 'img1',
    type: 'image',
    position: { x: 50, y: 500 },
    size: { width: 200, height: 150 },
    zIndex: 4,
    isVisible: true,
    isLocked: false,
    content: {
      source: 'url',
      value: 'https://example.com/image.jpg',
      fit: 'cover',
    },
    style: {},
  };

  const errors1 = validateImageElement(validImage);
  assert(errors1.length === 0, 'Valid image has no errors');

  const emptyValue: ImageElement = {
    ...validImage,
    content: {
      ...validImage.content,
      value: '',
    },
  };

  const errors2 = validateImageElement(emptyValue);
  assert(errors2.some(e => e.field === 'content.value'), 'Empty value has error');
}

// Test validateImageGalleryElement
console.log('\n--- Testing validateImageGalleryElement ---');
{
  const validGallery: ImageGalleryElement = {
    id: 'gallery1',
    type: 'image-gallery',
    position: { x: 50, y: 700 },
    size: { width: 694, height: 400 },
    zIndex: 5,
    isVisible: true,
    isLocked: false,
    dataBinding: {
      source: 'galeri_kegiatan',
      maxImages: 6,
      sortBy: 'date',
    },
    layout: {
      type: 'grid',
      columns: 3,
      gap: 10,
    },
    imageStyle: {
      width: 200,
      height: 150,
      fit: 'cover',
    },
    options: {
      showCaptions: false,
      captionPosition: 'below',
    },
  };

  const errors1 = validateImageGalleryElement(validGallery);
  assert(errors1.length === 0, 'Valid gallery has no errors');

  const invalidMaxImages: ImageGalleryElement = {
    ...validGallery,
    dataBinding: {
      ...validGallery.dataBinding,
      maxImages: 0,
    },
  };

  const errors2 = validateImageGalleryElement(invalidMaxImages);
  assert(errors2.some(e => e.field === 'dataBinding.maxImages'), 'Invalid maxImages has error');

  const tooManyImages: ImageGalleryElement = {
    ...validGallery,
    dataBinding: {
      ...validGallery.dataBinding,
      maxImages: 100,
    },
  };

  const errors3 = validateImageGalleryElement(tooManyImages);
  assert(errors3.some(e => e.severity === 'warning'), 'Too many images has warning');

  const invalidGridColumns: ImageGalleryElement = {
    ...validGallery,
    layout: {
      type: 'grid',
      columns: 0,
      gap: 10,
    },
  };

  const errors4 = validateImageGalleryElement(invalidGridColumns);
  assert(errors4.some(e => e.field === 'layout.columns'), 'Invalid grid columns has error');
}

// Test validateSignatureElement
console.log('\n--- Testing validateSignatureElement ---');
{
  const validSignature: SignatureElement = {
    id: 'sig1',
    type: 'signature',
    position: { x: 500, y: 1000 },
    size: { width: 200, height: 100 },
    zIndex: 6,
    isVisible: true,
    isLocked: false,
    content: {
      label: 'Pembina Asrama',
      name: '{{pembina.nama}}',
      showLine: true,
      showDate: true,
    },
    style: {
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'center',
    },
  };

  const errors1 = validateSignatureElement(validSignature);
  assert(errors1.length === 0, 'Valid signature has no errors');

  const emptyLabel: SignatureElement = {
    ...validSignature,
    content: {
      ...validSignature.content,
      label: '',
    },
  };

  const errors2 = validateSignatureElement(emptyLabel);
  assert(errors2.some(e => e.field === 'content.label'), 'Empty label has error');
}

// Test validateLineElement
console.log('\n--- Testing validateLineElement ---');
{
  const validLine: LineElement = {
    id: 'line1',
    type: 'line',
    position: { x: 50, y: 300 },
    size: { width: 694, height: 2 },
    zIndex: 7,
    isVisible: true,
    isLocked: false,
    style: {
      color: '#000000',
      width: 2,
      style: 'solid',
    },
  };

  const errors1 = validateLineElement(validLine);
  assert(errors1.length === 0, 'Valid line has no errors');

  const invalidWidth: LineElement = {
    ...validLine,
    style: {
      ...validLine.style,
      width: 0,
    },
  };

  const errors2 = validateLineElement(invalidWidth);
  assert(errors2.some(e => e.field === 'style.width'), 'Invalid width has error');
}

// Test validateElement (integration)
console.log('\n--- Testing validateElement ---');
{
  const validElement: TextElement = {
    id: 'test',
    type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    zIndex: 1,
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
  };

  const result1 = validateElement(validElement, canvasDimensions);
  assert(result1.valid === true, 'Valid element passes validation');
  assert(result1.errors.length === 0, 'Valid element has no errors');

  const invalidElement: TextElement = {
    ...validElement,
    position: { x: -10, y: -10 },
    size: { width: 0, height: 0 },
  };

  const result2 = validateElement(invalidElement, canvasDimensions);
  assert(result2.valid === false, 'Invalid element fails validation');
  assert(result2.errors.length > 0, 'Invalid element has errors');
}

// Test validateAllElements
console.log('\n--- Testing validateAllElements ---');
{
  const elements: TextElement[] = [
    {
      id: 'elem1',
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      zIndex: 1,
      isVisible: true,
      isLocked: false,
      content: { text: 'Valid', richText: false },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 1.5,
      },
    },
    {
      id: 'elem2',
      type: 'text',
      position: { x: -10, y: 100 },
      size: { width: 200, height: 50 },
      zIndex: 2,
      isVisible: true,
      isLocked: false,
      content: { text: 'Invalid', richText: false },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 1.5,
      },
    },
  ];

  const results = validateAllElements(elements, canvasDimensions);
  assert(results.size === 2, 'Validate all elements');
  assert(results.get('elem1')?.valid === true, 'First element is valid');
  assert(results.get('elem2')?.valid === false, 'Second element is invalid');
}

// Test getValidationSummary
console.log('\n--- Testing getValidationSummary ---');
{
  const results = new Map();
  results.set('elem1', { valid: true, errors: [], warnings: [] });
  results.set('elem2', { valid: false, errors: [{ field: 'test', message: 'error', severity: 'error' as const }], warnings: [] });
  results.set('elem3', { valid: true, errors: [], warnings: [{ field: 'test', message: 'warning', severity: 'warning' as const }] });

  const summary = getValidationSummary(results);
  assert(summary.totalElements === 3, 'Count total elements');
  assert(summary.validElements === 2, 'Count valid elements');
  assert(summary.invalidElements === 1, 'Count invalid elements');
  assert(summary.totalErrors === 1, 'Count total errors');
  assert(summary.totalWarnings === 1, 'Count total warnings');
}

// Test VALID_PLACEHOLDER_PATHS constant
console.log('\n--- Testing VALID_PLACEHOLDER_PATHS ---');
{
  assert(VALID_PLACEHOLDER_PATHS.includes('siswa.nama'), 'Contains siswa.nama');
  assert(VALID_PLACEHOLDER_PATHS.includes('habit_tracker.overall_average'), 'Contains habit_tracker.overall_average');
  assert(VALID_PLACEHOLDER_PATHS.includes('school.nama'), 'Contains school.nama');
  assert(VALID_PLACEHOLDER_PATHS.length > 20, 'Has sufficient placeholder paths');
}

// Test VALID_DATA_SOURCES constant
console.log('\n--- Testing VALID_DATA_SOURCES ---');
{
  assert(VALID_DATA_SOURCES.includes('habit_tracker.ubudiyah'), 'Contains habit_tracker.ubudiyah');
  assert(VALID_DATA_SOURCES.includes('galeri_kegiatan'), 'Contains galeri_kegiatan');
  assert(VALID_DATA_SOURCES.length === 5, 'Has correct number of data sources');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
}
