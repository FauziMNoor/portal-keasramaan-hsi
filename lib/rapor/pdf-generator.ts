import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Page size configurations in mm
export const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  F4: { width: 210, height: 330 },
} as const;

export type PageSize = keyof typeof PAGE_SIZES;
export type PageOrientation = 'portrait' | 'landscape';

export interface PDFConfig {
  pageSize: PageSize;
  orientation: PageOrientation;
}

export interface TextOptions {
  x: number;
  y: number;
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  align?: 'left' | 'center' | 'right' | 'justify';
  maxWidth?: number;
  color?: string;
}

export interface ImageOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

export interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

export interface TableOptions {
  startY: number;
  columns: TableColumn[];
  data: any[];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: any;
  bodyStyles?: any;
  columnStyles?: any;
}

/**
 * Create a new PDF document with specified configuration
 */
export function createPDF(config: PDFConfig): jsPDF {
  const { pageSize, orientation } = config;
  const size = PAGE_SIZES[pageSize];
  
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [size.width, size.height],
  });

  return pdf;
}

/**
 * Get page dimensions considering orientation
 */
export function getPageDimensions(config: PDFConfig): { width: number; height: number } {
  const size = PAGE_SIZES[config.pageSize];
  
  if (config.orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }
  
  return { width: size.width, height: size.height };
}

/**
 * Add text to PDF with formatting options
 */
export function addText(pdf: jsPDF, text: string, options: TextOptions): void {
  const {
    x,
    y,
    fontSize = 12,
    fontStyle = 'normal',
    align = 'left',
    maxWidth,
    color = '#000000',
  } = options;

  // Set font properties
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', fontStyle);
  
  // Set text color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  pdf.setTextColor(r, g, b);

  // Add text with optional wrapping
  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y, { align });
  } else {
    pdf.text(text, x, y, { align });
  }
}

/**
 * Add image to PDF with error handling
 * @deprecated Use addImageSafe from pdf-error-handler.ts for better error handling
 */
export async function addImage(
  pdf: jsPDF,
  imageUrl: string,
  options: ImageOptions
): Promise<{ success: boolean; error?: string }> {
  const { x, y, width, height, format = 'JPEG' } = options;

  try {
    // Fetch image and convert to base64
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate image type
    if (!blob.type.startsWith('image/')) {
      throw new Error(`Invalid image type: ${blob.type}`);
    }
    
    const base64 = await blobToBase64(blob);
    pdf.addImage(base64, format, x, y, width, height);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error adding image to PDF:', error);
    // Add placeholder rectangle if image fails
    pdf.setDrawColor(200);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(x, y, width, height, 'FD');
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text('Gambar tidak tersedia', x + width / 2, y + height / 2, { align: 'center' });
    pdf.setTextColor(0); // Reset color
    
    return { success: false, error: error.message };
  }
}

/**
 * Add table to PDF using autoTable
 */
export function addTable(pdf: jsPDF, options: TableOptions): void {
  const {
    startY,
    columns,
    data,
    theme = 'striped',
    headStyles = {},
    bodyStyles = {},
    columnStyles = {},
  } = options;

  pdf.autoTable({
    startY,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || '')),
    theme,
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      ...headStyles,
    },
    bodyStyles: {
      fontSize: 10,
      ...bodyStyles,
    },
    columnStyles,
    columns: columns.map((col, index) => ({
      dataKey: index.toString(),
      ...(col.width && { width: col.width }),
    })),
  });
}

/**
 * Add a new page to PDF
 */
export function addPage(pdf: jsPDF, config?: PDFConfig): void {
  if (config) {
    const size = PAGE_SIZES[config.pageSize];
    pdf.addPage([size.width, size.height], config.orientation);
  } else {
    pdf.addPage();
  }
}

/**
 * Get current Y position after last element (useful after tables)
 */
export function getCurrentY(pdf: jsPDF): number {
  if (pdf.lastAutoTable) {
    return pdf.lastAutoTable.finalY;
  }
  return 20; // Default starting Y position
}

/**
 * Add page header
 */
export function addHeader(
  pdf: jsPDF,
  text: string,
  options?: { fontSize?: number; y?: number }
): void {
  const { fontSize = 16, y = 15 } = options || {};
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text(text, pageWidth / 2, y, { align: 'center' });
}

/**
 * Add page footer with page number
 */
export function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Halaman ${pageNumber} dari ${totalPages}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
}

/**
 * Draw a line
 */
export function drawLine(
  pdf: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = '#000000',
  lineWidth: number = 0.5
): void {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(lineWidth);
  pdf.line(x1, y1, x2, y2);
}

/**
 * Draw a rectangle
 */
export function drawRect(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    fillColor?: string;
    strokeColor?: string;
    lineWidth?: number;
  }
): void {
  const { fillColor, strokeColor, lineWidth = 0.5 } = options || {};
  
  if (fillColor) {
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);
    pdf.setFillColor(r, g, b);
  }
  
  if (strokeColor) {
    const r = parseInt(strokeColor.slice(1, 3), 16);
    const g = parseInt(strokeColor.slice(3, 5), 16);
    const b = parseInt(strokeColor.slice(5, 7), 16);
    pdf.setDrawColor(r, g, b);
  }
  
  pdf.setLineWidth(lineWidth);
  
  const style = fillColor && strokeColor ? 'FD' : fillColor ? 'F' : 'S';
  pdf.rect(x, y, width, height, style);
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
 * Save PDF to file
 */
export function savePDF(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}

/**
 * Get PDF as blob for upload
 */
export function getPDFBlob(pdf: jsPDF): Blob {
  return pdf.output('blob');
}

/**
 * Get PDF as base64 string
 */
export function getPDFBase64(pdf: jsPDF): string {
  return pdf.output('datauristring');
}
