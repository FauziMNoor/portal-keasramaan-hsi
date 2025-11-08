/**
 * Error handling utilities for PDF generation
 */

import jsPDF from 'jspdf';
import { createClient } from '@supabase/supabase-js';

export type PDFErrorType = 
  | 'MISSING_DATA'
  | 'IMAGE_LOAD_FAILED'
  | 'RENDER_ERROR'
  | 'GENERATION_FAILED'
  | 'UPLOAD_FAILED'
  | 'INVALID_BINDING'
  | 'DATA_FETCH_FAILED'
  | 'VALIDATION_FAILED';

export interface PDFError {
  type: PDFErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  elementId?: string;
  field?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdf?: jsPDF;
  blob?: Blob;
  errors: PDFError[];
  warnings: PDFError[];
}

export interface PDFErrorLog {
  template_id: string;
  siswa_nis?: string;
  tahun_ajaran: string;
  semester: string;
  error_type: PDFErrorType;
  error_message: string;
  error_details?: any;
  generated_by: string;
  created_at?: string;
}

/**
 * Create a PDF error
 */
export function createPDFError(
  type: PDFErrorType,
  message: string,
  details?: any,
  elementId?: string,
  field?: string
): PDFError {
  return {
    type,
    message,
    details,
    timestamp: new Date(),
    elementId,
    field,
  };
}

/**
 * Handle missing data with placeholder
 */
export function handleMissingData(
  fieldName: string,
  defaultValue: string = '-'
): { value: string; error?: PDFError } {
  return {
    value: defaultValue,
    error: createPDFError(
      'MISSING_DATA',
      `Data ${fieldName} tidak tersedia`,
      { fieldName }
    ),
  };
}

/**
 * Load image with retry mechanism
 */
export async function loadImageWithRetry(
  imageUrl: string,
  maxRetries: number = 2
): Promise<{ success: boolean; base64?: string; error?: PDFError }> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(imageUrl, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Validate that it's actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }

      const base64 = await blobToBase64(blob);
      return { success: true, base64 };
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    error: createPDFError(
      'IMAGE_LOAD_FAILED',
      `Gagal memuat gambar: ${imageUrl}`,
      { url: imageUrl, error: lastError?.message }
    ),
  };
}

/**
 * Add image to PDF with error handling and placeholder
 */
export async function addImageSafe(
  pdf: jsPDF,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  format: 'JPEG' | 'PNG' | 'WEBP' = 'JPEG'
): Promise<{ success: boolean; error?: PDFError }> {
  try {
    const result = await loadImageWithRetry(imageUrl);

    if (result.success && result.base64) {
      pdf.addImage(result.base64, format, x, y, width, height);
      return { success: true };
    } else {
      // Add placeholder for failed image
      addImagePlaceholder(pdf, x, y, width, height, 'Gambar tidak tersedia');
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    // Add placeholder for any unexpected error
    addImagePlaceholder(pdf, x, y, width, height, 'Gambar tidak tersedia');
    return {
      success: false,
      error: createPDFError(
        'IMAGE_LOAD_FAILED',
        'Gagal menambahkan gambar ke PDF',
        { url: imageUrl, error: error.message }
      ),
    };
  }
}

/**
 * Add placeholder for missing/failed images
 */
export function addImagePlaceholder(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string = 'Gambar tidak tersedia'
): void {
  // Draw gray rectangle
  pdf.setDrawColor(200);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(x, y, width, height, 'FD');

  // Add centered text
  pdf.setFontSize(10);
  pdf.setTextColor(150);
  pdf.text(text, x + width / 2, y + height / 2, { align: 'center' });
  
  // Reset colors
  pdf.setTextColor(0);
  pdf.setDrawColor(0);
}

/**
 * Add text with fallback for missing data
 */
export function addTextSafe(
  pdf: jsPDF,
  text: string | null | undefined,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    align?: 'left' | 'center' | 'right';
    placeholder?: string;
  }
): { success: boolean; error?: PDFError } {
  const {
    fontSize = 12,
    fontStyle = 'normal',
    align = 'left',
    placeholder = '-',
  } = options || {};

  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', fontStyle);

  if (!text || text.trim().length === 0) {
    pdf.setTextColor(150); // Gray color for placeholder
    pdf.text(placeholder, x, y, { align });
    pdf.setTextColor(0); // Reset to black
    
    return {
      success: false,
      error: createPDFError('MISSING_DATA', 'Data tidak tersedia'),
    };
  }

  pdf.text(text, x, y, { align });
  return { success: true };
}

/**
 * Wrap PDF generation in try-catch with error logging
 */
export async function executePDFGeneration<T>(
  generationFn: () => Promise<T>,
  context: string
): Promise<{ success: boolean; result?: T; error?: PDFError }> {
  try {
    const result = await generationFn();
    return { success: true, result };
  } catch (error: any) {
    console.error(`PDF Generation Error [${context}]:`, error);
    return {
      success: false,
      error: createPDFError(
        'GENERATION_FAILED',
        `Gagal generate PDF: ${context}`,
        { error: error.message, stack: error.stack }
      ),
    };
  }
}

/**
 * Log error to history table
 */
export async function logPDFError(
  supabase: any,
  templateId: string,
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  error: PDFError,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('rapor_generate_history')
      .insert({
        template_id: templateId,
        siswa_nis,
        tahun_ajaran,
        semester,
        status: 'failed',
        error_message: `[${error.type}] ${error.message}`,
        generated_by: userId,
      });
  } catch (err) {
    console.error('Failed to log PDF error to database:', err);
  }
}

/**
 * Convert blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Validate required data before PDF generation
 */
export function validatePDFData(data: {
  template?: any;
  siswa?: any;
  pages?: any[];
}): { valid: boolean; errors: PDFError[] } {
  const errors: PDFError[] = [];

  if (!data.template) {
    errors.push(createPDFError('MISSING_DATA', 'Template tidak ditemukan'));
  }

  if (!data.siswa) {
    errors.push(createPDFError('MISSING_DATA', 'Data siswa tidak ditemukan'));
  }

  if (!data.pages || data.pages.length === 0) {
    errors.push(createPDFError('MISSING_DATA', 'Template tidak memiliki halaman'));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Handle missing data with placeholder and create error
 */
export function handleMissingDataWithError(
  fieldPath: string,
  elementId?: string,
  defaultValue: string = '-'
): { value: string; error: PDFError } {
  return {
    value: defaultValue,
    error: createPDFError(
      'MISSING_DATA',
      `Data tidak tersedia: ${fieldPath}`,
      { fieldPath },
      elementId,
      fieldPath
    ),
  };
}

/**
 * Handle invalid data binding
 */
export function handleInvalidBinding(
  placeholder: string,
  elementId?: string
): { value: string; error: PDFError } {
  return {
    value: `{{${placeholder}}}`, // Keep placeholder visible
    error: createPDFError(
      'INVALID_BINDING',
      `Binding tidak valid: {{${placeholder}}}`,
      { placeholder },
      elementId,
      'dataBinding'
    ),
  };
}

/**
 * Handle data fetch failure
 */
export function handleDataFetchError(
  dataSource: string,
  error: any,
  elementId?: string
): PDFError {
  return createPDFError(
    'DATA_FETCH_FAILED',
    `Gagal mengambil data dari ${dataSource}`,
    { dataSource, error: error?.message || String(error) },
    elementId,
    'dataSource'
  );
}

/**
 * Safely resolve data binding with error handling
 */
export function safeResolveBinding(
  placeholder: string,
  data: any,
  elementId?: string
): { value: any; error?: PDFError } {
  try {
    // Split placeholder path
    const parts = placeholder.split('.');
    let current = data;

    // Navigate through the path
    for (const part of parts) {
      if (current === null || current === undefined) {
        return handleMissingDataWithError(placeholder, elementId);
      }

      if (typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return handleMissingDataWithError(placeholder, elementId);
      }
    }

    // Check if final value is valid
    if (current === null || current === undefined || current === '') {
      return handleMissingDataWithError(placeholder, elementId);
    }

    return { value: current };
  } catch (error) {
    return {
      value: '-',
      error: createPDFError(
        'INVALID_BINDING',
        `Error resolving binding: ${placeholder}`,
        { error: error instanceof Error ? error.message : String(error) },
        elementId,
        placeholder
      ),
    };
  }
}

/**
 * Collect all errors from PDF generation
 */
export class PDFErrorCollector {
  private errors: PDFError[] = [];
  private warnings: PDFError[] = [];

  addError(error: PDFError): void {
    this.errors.push(error);
  }

  addWarning(warning: PDFError): void {
    this.warnings.push(warning);
  }

  addErrors(errors: PDFError[]): void {
    this.errors.push(...errors);
  }

  addWarnings(warnings: PDFError[]): void {
    this.warnings.push(...warnings);
  }

  getErrors(): PDFError[] {
    return this.errors;
  }

  getWarnings(): PDFError[] {
    return this.warnings;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getWarningCount(): number {
    return this.warnings.length;
  }

  getSummary(): string {
    const parts: string[] = [];
    
    if (this.errors.length > 0) {
      parts.push(`${this.errors.length} error(s)`);
    }
    
    if (this.warnings.length > 0) {
      parts.push(`${this.warnings.length} warning(s)`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No errors';
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }
}

/**
 * Log PDF generation error to database
 */
export async function logPDFErrorToDatabase(
  errorLog: PDFErrorLog
): Promise<{ success: boolean; error?: any }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return { success: false, error: 'Supabase not configured' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('rapor_generate_errors_keasramaan').insert({
      template_id: errorLog.template_id,
      siswa_nis: errorLog.siswa_nis,
      tahun_ajaran: errorLog.tahun_ajaran,
      semester: errorLog.semester,
      error_type: errorLog.error_type,
      error_message: errorLog.error_message,
      error_details: errorLog.error_details,
      generated_by: errorLog.generated_by,
    });

    if (error) {
      console.error('Failed to log PDF error to database:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception while logging PDF error:', error);
    return { success: false, error };
  }
}

/**
 * Log multiple PDF errors in batch
 */
export async function logPDFErrorsBatch(
  errors: PDFError[],
  context: {
    template_id: string;
    siswa_nis?: string;
    tahun_ajaran: string;
    semester: string;
    generated_by: string;
  }
): Promise<{ success: boolean; logged: number; failed: number }> {
  let logged = 0;
  let failed = 0;

  for (const error of errors) {
    const result = await logPDFErrorToDatabase({
      ...context,
      error_type: error.type,
      error_message: error.message,
      error_details: error.details,
    });

    if (result.success) {
      logged++;
    } else {
      failed++;
    }
  }

  return { success: failed === 0, logged, failed };
}

/**
 * Format PDF errors for user display
 */
export function formatPDFErrorsForUser(errors: PDFError[]): string {
  if (errors.length === 0) {
    return 'Tidak ada error';
  }

  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<PDFErrorType, PDFError[]>);

  const messages: string[] = [];

  for (const [type, typeErrors] of Object.entries(errorsByType)) {
    const count = typeErrors.length;
    const typeLabel = getErrorTypeLabel(type as PDFErrorType);
    messages.push(`${typeLabel}: ${count} error(s)`);
  }

  return messages.join('\n');
}

/**
 * Get user-friendly label for error type
 */
function getErrorTypeLabel(type: PDFErrorType): string {
  const labels: Record<PDFErrorType, string> = {
    MISSING_DATA: 'Data Tidak Tersedia',
    IMAGE_LOAD_FAILED: 'Gagal Memuat Gambar',
    RENDER_ERROR: 'Error Rendering',
    GENERATION_FAILED: 'Gagal Generate PDF',
    UPLOAD_FAILED: 'Gagal Upload',
    INVALID_BINDING: 'Binding Tidak Valid',
    DATA_FETCH_FAILED: 'Gagal Mengambil Data',
    VALIDATION_FAILED: 'Validasi Gagal',
  };

  return labels[type] || type;
}

/**
 * Create user-friendly error message for PDF generation failure
 */
export function createUserFriendlyErrorMessage(
  errors: PDFError[],
  warnings: PDFError[]
): string {
  const parts: string[] = [];

  if (errors.length > 0) {
    parts.push(`Terjadi ${errors.length} error saat generate PDF:`);
    
    // Group errors by type
    const errorsByType = errors.reduce((acc, error) => {
      if (!acc[error.type]) {
        acc[error.type] = 0;
      }
      acc[error.type]++;
      return acc;
    }, {} as Record<string, number>);

    for (const [type, count] of Object.entries(errorsByType)) {
      parts.push(`- ${getErrorTypeLabel(type as PDFErrorType)}: ${count}`);
    }
  }

  if (warnings.length > 0) {
    parts.push(`\n${warnings.length} peringatan:`);
    warnings.slice(0, 3).forEach((warning) => {
      parts.push(`- ${warning.message}`);
    });
    
    if (warnings.length > 3) {
      parts.push(`... dan ${warnings.length - 3} peringatan lainnya`);
    }
  }

  return parts.join('\n');
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<{ success: boolean; result?: T; error?: any }> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { success: true, result };
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, error: lastError };
}
