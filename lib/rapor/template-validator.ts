/**
 * Template Validation Utilities
 * 
 * This module provides validation functions for complete templates,
 * ensuring they meet all requirements before saving or generating PDFs.
 */

import type {
  TemplateConfig,
  TemplateElement,
  CompleteTemplate,
} from '@/types/rapor-builder';
import { validateAllElements, getValidationSummary } from './element-validator';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: TemplateValidationError[];
  warnings: TemplateValidationError[];
  elementValidation?: {
    totalElements: number;
    validElements: number;
    invalidElements: number;
    totalErrors: number;
    totalWarnings: number;
  };
}

// ============================================================================
// TEMPLATE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that template has at least one element
 */
export function validateTemplateHasElements(elements: TemplateElement[]): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  
  if (!elements || elements.length === 0) {
    errors.push({
      field: 'elements',
      message: 'Template harus memiliki minimal 1 elemen',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate that all element IDs are unique
 */
export function validateUniqueElementIds(elements: TemplateElement[]): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  
  const ids = elements.map((el) => el.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    const uniqueDuplicates = Array.from(new Set(duplicateIds));
    errors.push({
      field: 'elements',
      message: `ID elemen duplikat ditemukan: ${uniqueDuplicates.join(', ')}`,
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Validate that z-index values are valid
 */
export function validateZIndexValues(elements: TemplateElement[]): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  
  for (const element of elements) {
    if (!Number.isInteger(element.zIndex)) {
      errors.push({
        field: `element.${element.id}.zIndex`,
        message: `Z-index harus berupa bilangan bulat (elemen: ${element.id})`,
        severity: 'error',
      });
    }
    
    if (element.zIndex < 0) {
      errors.push({
        field: `element.${element.id}.zIndex`,
        message: `Z-index tidak boleh negatif (elemen: ${element.id})`,
        severity: 'error',
      });
    }
  }
  
  return errors;
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(config: TemplateConfig): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  
  // Validate name
  if (!config.name || config.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Nama template tidak boleh kosong',
      severity: 'error',
    });
  }
  
  // Validate page size
  const validPageSizes = ['A4', 'A5', 'Letter', 'F4'];
  if (!validPageSizes.includes(config.pageSize)) {
    errors.push({
      field: 'pageSize',
      message: `Ukuran halaman tidak valid: ${config.pageSize}`,
      severity: 'error',
    });
  }
  
  // Validate orientation
  const validOrientations = ['portrait', 'landscape'];
  if (!validOrientations.includes(config.orientation)) {
    errors.push({
      field: 'orientation',
      message: `Orientasi tidak valid: ${config.orientation}`,
      severity: 'error',
    });
  }
  
  // Validate dimensions
  if (config.dimensions.width <= 0 || config.dimensions.height <= 0) {
    errors.push({
      field: 'dimensions',
      message: 'Dimensi halaman harus lebih dari 0',
      severity: 'error',
    });
  }
  
  // Validate margins
  if (
    config.margins.top < 0 ||
    config.margins.right < 0 ||
    config.margins.bottom < 0 ||
    config.margins.left < 0
  ) {
    errors.push({
      field: 'margins',
      message: 'Margin tidak boleh negatif',
      severity: 'error',
    });
  }
  
  // Warn if margins are too large
  const totalHorizontalMargin = config.margins.left + config.margins.right;
  const totalVerticalMargin = config.margins.top + config.margins.bottom;
  
  if (totalHorizontalMargin > config.dimensions.width * 0.5) {
    errors.push({
      field: 'margins',
      message: 'Margin horizontal terlalu besar (> 50% lebar halaman)',
      severity: 'warning',
    });
  }
  
  if (totalVerticalMargin > config.dimensions.height * 0.5) {
    errors.push({
      field: 'margins',
      message: 'Margin vertikal terlalu besar (> 50% tinggi halaman)',
      severity: 'warning',
    });
  }
  
  return errors;
}

/**
 * Check for overlapping elements (warning only)
 */
export function checkOverlappingElements(elements: TemplateElement[]): TemplateValidationError[] {
  const warnings: TemplateValidationError[] = [];
  
  // Check each pair of elements
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const el1 = elements[i];
      const el2 = elements[j];
      
      // Check if rectangles overlap
      const overlap = !(
        el1.position.x + el1.size.width <= el2.position.x ||
        el2.position.x + el2.size.width <= el1.position.x ||
        el1.position.y + el1.size.height <= el2.position.y ||
        el2.position.y + el2.size.height <= el1.position.y
      );
      
      if (overlap) {
        warnings.push({
          field: 'elements',
          message: `Elemen bertumpukan: ${el1.type} dan ${el2.type}`,
          severity: 'warning',
        });
      }
    }
  }
  
  return warnings;
}

/**
 * Validate template size (warn if too large)
 */
export function validateTemplateSize(elements: TemplateElement[]): TemplateValidationError[] {
  const warnings: TemplateValidationError[] = [];
  
  if (elements.length > 100) {
    warnings.push({
      field: 'elements',
      message: `Template memiliki terlalu banyak elemen (${elements.length}). Ini dapat memperlambat rendering.`,
      severity: 'warning',
    });
  }
  
  // Count image elements
  const imageElements = elements.filter(
    (el) => el.type === 'image' || el.type === 'image-gallery'
  );
  
  if (imageElements.length > 20) {
    warnings.push({
      field: 'elements',
      message: `Template memiliki terlalu banyak gambar (${imageElements.length}). Ini dapat memperlambat PDF generation.`,
      severity: 'warning',
    });
  }
  
  return warnings;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate a complete template
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @returns Validation result with errors and warnings
 */
export function validateTemplate(
  template: TemplateConfig,
  elements: TemplateElement[]
): TemplateValidationResult {
  const allErrors: TemplateValidationError[] = [];
  const allWarnings: TemplateValidationError[] = [];
  
  // Template-level validation
  allErrors.push(...validateTemplateConfig(template));
  allErrors.push(...validateTemplateHasElements(elements));
  allErrors.push(...validateUniqueElementIds(elements));
  allErrors.push(...validateZIndexValues(elements));
  
  // Template size warnings
  allWarnings.push(...validateTemplateSize(elements));
  allWarnings.push(...checkOverlappingElements(elements));
  
  // Element-level validation
  const elementValidationResults = validateAllElements(elements, template.dimensions);
  const elementSummary = getValidationSummary(elementValidationResults);
  
  // Add element validation errors to template errors
  for (const [elementId, result] of elementValidationResults.entries()) {
    if (!result.valid) {
      const element = elements.find((el) => el.id === elementId);
      const elementType = element?.type || 'unknown';
      
      allErrors.push({
        field: `element.${elementId}`,
        message: `Elemen ${elementType} memiliki ${result.errors.length} error`,
        severity: 'error',
      });
    }
  }
  
  return {
    valid: allErrors.length === 0 && elementSummary.invalidElements === 0,
    errors: allErrors,
    warnings: allWarnings,
    elementValidation: elementSummary,
  };
}

/**
 * Validate template before saving
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @returns Validation result
 */
export function validateBeforeSave(
  template: TemplateConfig,
  elements: TemplateElement[]
): TemplateValidationResult {
  return validateTemplate(template, elements);
}

/**
 * Validate template before PDF generation
 * More strict validation than before save
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @returns Validation result
 */
export function validateBeforeGenerate(
  template: TemplateConfig,
  elements: TemplateElement[]
): TemplateValidationResult {
  const result = validateTemplate(template, elements);
  
  // Additional checks for PDF generation
  const additionalErrors: TemplateValidationError[] = [];
  
  // Check if template has visible elements
  const visibleElements = elements.filter((el) => el.isVisible);
  if (visibleElements.length === 0) {
    additionalErrors.push({
      field: 'elements',
      message: 'Template tidak memiliki elemen yang visible',
      severity: 'error',
    });
  }
  
  // Check for required data bindings
  const hasDataBinding = elements.some((el) => {
    if (el.type === 'data-table' || el.type === 'image-gallery') {
      return true;
    }
    if (el.type === 'text' || el.type === 'header') {
      // Check if text contains placeholders
      return /\{\{[^}]+\}\}/.test(JSON.stringify(el.content));
    }
    return false;
  });
  
  if (!hasDataBinding) {
    result.warnings.push({
      field: 'elements',
      message: 'Template tidak memiliki data binding. Rapor akan sama untuk semua siswa.',
      severity: 'warning',
    });
  }
  
  return {
    ...result,
    errors: [...result.errors, ...additionalErrors],
  };
}

/**
 * Get user-friendly error message for validation result
 * 
 * @param result - Validation result
 * @returns User-friendly message
 */
export function getValidationMessage(result: TemplateValidationResult): string {
  if (result.valid) {
    return 'Template valid dan siap digunakan';
  }
  
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  
  let message = '';
  
  if (errorCount > 0) {
    message += `${errorCount} error ditemukan`;
  }
  
  if (warningCount > 0) {
    if (message) message += ' dan ';
    message += `${warningCount} peringatan`;
  }
  
  return message;
}

/**
 * Format validation errors for display
 * 
 * @param errors - Array of validation errors
 * @returns Formatted string
 */
export function formatValidationErrors(errors: TemplateValidationError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join('\n');
}

/**
 * Check if template can be saved (has no critical errors)
 * 
 * @param result - Validation result
 * @returns True if template can be saved
 */
export function canSaveTemplate(result: TemplateValidationResult): boolean {
  // Allow saving with warnings, but not with errors
  return result.errors.length === 0;
}

/**
 * Check if template can generate PDF (has no errors)
 * 
 * @param result - Validation result
 * @returns True if template can generate PDF
 */
export function canGeneratePDF(result: TemplateValidationResult): boolean {
  return result.valid;
}
