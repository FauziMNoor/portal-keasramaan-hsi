/**
 * Element Validation Utilities for Template Builder
 * 
 * This module provides validation functions for template elements,
 * ensuring they meet all requirements before saving or rendering.
 */

import type {
  TemplateElement,
  TemplateConfig,
  Dimensions,
  HeaderElement,
  TextElement,
  DataTableElement,
  ImageElement,
  ImageGalleryElement,
  SignatureElement,
  LineElement,
} from '@/types/rapor-builder';
import { extractPlaceholders, isValidPlaceholderFormat } from './placeholder-resolver';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ElementValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// VALID DATA BINDING PATHS
// ============================================================================

/**
 * All valid placeholder paths that can be used in templates
 */
export const VALID_PLACEHOLDER_PATHS = [
  // Siswa data
  'siswa.id',
  'siswa.nama',
  'siswa.nis',
  'siswa.kelas',
  'siswa.asrama',
  'siswa.cabang',
  'siswa.foto_url',
  
  // Habit tracker - Periode
  'habit_tracker.periode.tahun_ajaran',
  'habit_tracker.periode.semester',
  'habit_tracker.periode.bulan',
  
  // Habit tracker - Ubudiyah
  'habit_tracker.ubudiyah.average',
  'habit_tracker.ubudiyah.percentage',
  
  // Habit tracker - Akhlaq
  'habit_tracker.akhlaq.average',
  'habit_tracker.akhlaq.percentage',
  
  // Habit tracker - Kedisiplinan
  'habit_tracker.kedisiplinan.average',
  'habit_tracker.kedisiplinan.percentage',
  
  // Habit tracker - Kebersihan
  'habit_tracker.kebersihan.average',
  'habit_tracker.kebersihan.percentage',
  
  // Habit tracker - Overall
  'habit_tracker.overall_average',
  'habit_tracker.overall_percentage',
  
  // School data
  'school.nama',
  'school.logo_url',
  'school.alamat',
  'school.telepon',
  'school.website',
  
  // Pembina data
  'pembina.nama',
  'pembina.nip',
  
  // Kepala sekolah data
  'kepala_sekolah.nama',
  'kepala_sekolah.nip',
] as const;

/**
 * Valid data sources for data table elements
 */
export const VALID_DATA_SOURCES = [
  'habit_tracker.ubudiyah',
  'habit_tracker.akhlaq',
  'habit_tracker.kedisiplinan',
  'habit_tracker.kebersihan',
  'galeri_kegiatan',
] as const;

// ============================================================================
// BASE ELEMENT VALIDATION
// ============================================================================

/**
 * Validate element position is within canvas bounds
 */
export function validateElementPosition(
  element: TemplateElement,
  canvasDimensions: Dimensions
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check if position is negative
  if (element.position.x < 0) {
    errors.push({
      field: 'position.x',
      message: 'Posisi X tidak boleh negatif',
      severity: 'error',
    });
  }
  
  if (element.position.y < 0) {
    errors.push({
      field: 'position.y',
      message: 'Posisi Y tidak boleh negatif',
      severity: 'error',
    });
  }
  
  // Check if element extends beyond canvas bounds
  const elementRight = element.position.x + element.size.width;
  const elementBottom = element.position.y + element.size.height;
  
  if (elementRight > canvasDimensions.width) {
    errors.push({
      field: 'position',
      message: `Elemen melewati batas kanan canvas (${elementRight.toFixed(0)}px > ${canvasDimensions.width}px)`,
      severity: 'warning',
    });
  }
  
  if (elementBottom > canvasDimensions.height) {
    errors.push({
      field: 'position',
      message: `Elemen melewati batas bawah canvas (${elementBottom.toFixed(0)}px > ${canvasDimensions.height}px)`,
      severity: 'warning',
    });
  }
  
  return errors;
}

/**
 * Validate element size is positive
 */
export function validateElementSize(element: TemplateElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (element.size.width <= 0) {
    errors.push({
      field: 'size.width',
      message: 'Lebar elemen harus lebih dari 0',
      severity: 'error',
    });
  }
  
  if (element.size.height <= 0) {
    errors.push({
      field: 'size.height',
      message: 'Tinggi elemen harus lebih dari 0',
      severity: 'error',
    });
  }
  
  // Warn if element is too small
  if (element.size.width < 10) {
    errors.push({
      field: 'size.width',
      message: 'Lebar elemen terlalu kecil (< 10px)',
      severity: 'warning',
    });
  }
  
  if (element.size.height < 10) {
    errors.push({
      field: 'size.height',
      message: 'Tinggi elemen terlalu kecil (< 10px)',
      severity: 'warning',
    });
  }
  
  return errors;
}

/**
 * Validate placeholders in text
 */
export function validateTextPlaceholders(text: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const placeholders = extractPlaceholders(text);
  
  for (const placeholder of placeholders) {
    // Check format
    if (!isValidPlaceholderFormat(placeholder)) {
      errors.push({
        field: 'placeholder',
        message: `Format placeholder tidak valid: {{${placeholder}}}`,
        severity: 'error',
      });
      continue;
    }
    
    // Check if placeholder path is valid
    if (!VALID_PLACEHOLDER_PATHS.includes(placeholder as any)) {
      errors.push({
        field: 'placeholder',
        message: `Placeholder tidak dikenali: {{${placeholder}}}`,
        severity: 'error',
      });
    }
  }
  
  return errors;
}

// ============================================================================
// ELEMENT-SPECIFIC VALIDATION
// ============================================================================

/**
 * Validate Header Element
 */
export function validateHeaderElement(element: HeaderElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate title
  if (!element.content.title.text || element.content.title.text.trim().length === 0) {
    errors.push({
      field: 'content.title.text',
      message: 'Judul header tidak boleh kosong',
      severity: 'error',
    });
  } else {
    errors.push(...validateTextPlaceholders(element.content.title.text));
  }
  
  // Validate subtitle if present
  if (element.content.subtitle?.text) {
    errors.push(...validateTextPlaceholders(element.content.subtitle.text));
  }
  
  // Validate logo if present
  if (element.content.logo) {
    if (!element.content.logo.value || element.content.logo.value.trim().length === 0) {
      errors.push({
        field: 'content.logo.value',
        message: 'URL atau path logo tidak boleh kosong',
        severity: 'error',
      });
    }
    
    if (element.content.logo.size.width <= 0 || element.content.logo.size.height <= 0) {
      errors.push({
        field: 'content.logo.size',
        message: 'Ukuran logo harus lebih dari 0',
        severity: 'error',
      });
    }
  }
  
  // Validate font size
  if (element.content.title.fontSize <= 0) {
    errors.push({
      field: 'content.title.fontSize',
      message: 'Ukuran font judul harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate Text Element
 */
export function validateTextElement(element: TextElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate text content
  if (!element.content.text || element.content.text.trim().length === 0) {
    errors.push({
      field: 'content.text',
      message: 'Konten teks tidak boleh kosong',
      severity: 'warning',
    });
  } else {
    errors.push(...validateTextPlaceholders(element.content.text));
  }
  
  // Validate font size
  if (element.style.fontSize <= 0) {
    errors.push({
      field: 'style.fontSize',
      message: 'Ukuran font harus lebih dari 0',
      severity: 'error',
    });
  }
  
  // Validate line height
  if (element.style.lineHeight <= 0) {
    errors.push({
      field: 'style.lineHeight',
      message: 'Line height harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate Data Table Element
 */
export function validateDataTableElement(element: DataTableElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate data source
  if (!element.dataBinding.source || element.dataBinding.source.trim().length === 0) {
    errors.push({
      field: 'dataBinding.source',
      message: 'Sumber data tabel tidak boleh kosong',
      severity: 'error',
    });
  } else if (!VALID_DATA_SOURCES.includes(element.dataBinding.source as any)) {
    errors.push({
      field: 'dataBinding.source',
      message: `Sumber data tidak valid: ${element.dataBinding.source}`,
      severity: 'error',
    });
  }
  
  // Validate columns
  if (!element.columns || element.columns.length === 0) {
    errors.push({
      field: 'columns',
      message: 'Tabel harus memiliki minimal 1 kolom',
      severity: 'error',
    });
  } else {
    // Check for duplicate column IDs
    const columnIds = element.columns.map(col => col.id);
    const duplicateIds = columnIds.filter((id, index) => columnIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push({
        field: 'columns',
        message: `ID kolom duplikat: ${duplicateIds.join(', ')}`,
        severity: 'error',
      });
    }
    
    // Validate each column
    element.columns.forEach((col, index) => {
      if (!col.header || col.header.trim().length === 0) {
        errors.push({
          field: `columns[${index}].header`,
          message: `Header kolom ${index + 1} tidak boleh kosong`,
          severity: 'error',
        });
      }
      
      if (!col.field || col.field.trim().length === 0) {
        errors.push({
          field: `columns[${index}].field`,
          message: `Field kolom ${index + 1} tidak boleh kosong`,
          severity: 'error',
        });
      }
    });
  }
  
  // Validate font sizes
  if (element.style.headerFontSize <= 0) {
    errors.push({
      field: 'style.headerFontSize',
      message: 'Ukuran font header harus lebih dari 0',
      severity: 'error',
    });
  }
  
  if (element.style.rowFontSize <= 0) {
    errors.push({
      field: 'style.rowFontSize',
      message: 'Ukuran font baris harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate Image Element
 */
export function validateImageElement(element: ImageElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate image source
  if (!element.content.value || element.content.value.trim().length === 0) {
    errors.push({
      field: 'content.value',
      message: 'URL atau path gambar tidak boleh kosong',
      severity: 'error',
    });
  } else if (element.content.source === 'binding') {
    // Validate placeholder if using binding
    errors.push(...validateTextPlaceholders(element.content.value));
  }
  
  return errors;
}

/**
 * Validate Image Gallery Element
 */
export function validateImageGalleryElement(element: ImageGalleryElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate data source
  if (element.dataBinding.source !== 'galeri_kegiatan') {
    errors.push({
      field: 'dataBinding.source',
      message: 'Sumber data galeri harus "galeri_kegiatan"',
      severity: 'error',
    });
  }
  
  // Validate max images
  if (element.dataBinding.maxImages <= 0) {
    errors.push({
      field: 'dataBinding.maxImages',
      message: 'Jumlah maksimal gambar harus lebih dari 0',
      severity: 'error',
    });
  }
  
  if (element.dataBinding.maxImages > 50) {
    errors.push({
      field: 'dataBinding.maxImages',
      message: 'Jumlah maksimal gambar terlalu besar (> 50)',
      severity: 'warning',
    });
  }
  
  // Validate layout
  if (element.layout.type === 'grid' && (!element.layout.columns || element.layout.columns <= 0)) {
    errors.push({
      field: 'layout.columns',
      message: 'Jumlah kolom grid harus lebih dari 0',
      severity: 'error',
    });
  }
  
  // Validate image dimensions
  if (element.imageStyle.width <= 0 || element.imageStyle.height <= 0) {
    errors.push({
      field: 'imageStyle',
      message: 'Ukuran gambar harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate Signature Element
 */
export function validateSignatureElement(element: SignatureElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate label
  if (!element.content.label || element.content.label.trim().length === 0) {
    errors.push({
      field: 'content.label',
      message: 'Label tanda tangan tidak boleh kosong',
      severity: 'error',
    });
  }
  
  // Validate name if present
  if (element.content.name) {
    errors.push(...validateTextPlaceholders(element.content.name));
  }
  
  // Validate font size
  if (element.style.fontSize <= 0) {
    errors.push({
      field: 'style.fontSize',
      message: 'Ukuran font harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate Line Element
 */
export function validateLineElement(element: LineElement): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate line width (thickness)
  if (element.style.width <= 0) {
    errors.push({
      field: 'style.width',
      message: 'Ketebalan garis harus lebih dari 0',
      severity: 'error',
    });
  }
  
  return errors;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate a template element
 * 
 * @param element - Element to validate
 * @param canvasDimensions - Canvas dimensions for position validation
 * @returns Validation result with errors and warnings
 */
export function validateElement(
  element: TemplateElement,
  canvasDimensions: Dimensions
): ElementValidationResult {
  const allErrors: ValidationError[] = [];
  
  // Base validation (position and size)
  allErrors.push(...validateElementPosition(element, canvasDimensions));
  allErrors.push(...validateElementSize(element));
  
  // Element-specific validation
  switch (element.type) {
    case 'header':
      allErrors.push(...validateHeaderElement(element));
      break;
    case 'text':
      allErrors.push(...validateTextElement(element));
      break;
    case 'data-table':
      allErrors.push(...validateDataTableElement(element));
      break;
    case 'image':
      allErrors.push(...validateImageElement(element));
      break;
    case 'image-gallery':
      allErrors.push(...validateImageGalleryElement(element));
      break;
    case 'signature':
      allErrors.push(...validateSignatureElement(element));
      break;
    case 'line':
      allErrors.push(...validateLineElement(element));
      break;
    default:
      allErrors.push({
        field: 'type',
        message: `Tipe elemen tidak dikenali: ${(element as any).type}`,
        severity: 'error',
      });
  }
  
  // Separate errors and warnings
  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all elements in a template
 * 
 * @param elements - Array of elements to validate
 * @param canvasDimensions - Canvas dimensions
 * @returns Map of element ID to validation result
 */
export function validateAllElements(
  elements: TemplateElement[],
  canvasDimensions: Dimensions
): Map<string, ElementValidationResult> {
  const results = new Map<string, ElementValidationResult>();
  
  for (const element of elements) {
    const result = validateElement(element, canvasDimensions);
    results.set(element.id, result);
  }
  
  return results;
}

/**
 * Get summary of validation results
 * 
 * @param validationResults - Map of validation results
 * @returns Summary with counts
 */
export function getValidationSummary(
  validationResults: Map<string, ElementValidationResult>
): {
  totalElements: number;
  validElements: number;
  invalidElements: number;
  totalErrors: number;
  totalWarnings: number;
} {
  let validElements = 0;
  let invalidElements = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const result of validationResults.values()) {
    if (result.valid) {
      validElements++;
    } else {
      invalidElements++;
    }
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }
  
  return {
    totalElements: validationResults.size,
    validElements,
    invalidElements,
    totalErrors,
    totalWarnings,
  };
}
