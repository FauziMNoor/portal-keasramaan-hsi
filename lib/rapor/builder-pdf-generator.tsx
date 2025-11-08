/**
 * PDF Generator for Builder Templates
 * 
 * This module generates PDF documents from builder templates using React-PDF.
 * It handles element positioning, styling, data binding, and image embedding.
 */

import React from 'react';
import { Document, Page, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type {
  TemplateConfig,
  TemplateElement,
  CompleteTemplate,
  DataBindingSchemaType,
} from '@/types/rapor-builder';
import {
  HeaderElementPDF,
  TextElementPDF,
  DataTableElementPDF,
  ImageElementPDF,
  ImageGalleryElementPDF,
  SignatureElementPDF,
  LineElementPDF,
} from './pdf-elements';
import { downloadMultipleImages } from './image-handler';

/**
 * Page size configurations in mm (matching A4 standard)
 */
const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  F4: { width: 210, height: 330 },
} as const;

/**
 * Convert pixels to millimeters for PDF
 * Assumes 96 DPI (standard web resolution)
 * 
 * @param pixels - Value in pixels
 * @returns Value in millimeters
 */
function pixelsToMm(pixels: number): number {
  // 1 inch = 25.4mm, 96 DPI means 96 pixels = 1 inch
  return (pixels * 25.4) / 96;
}

/**
 * Convert millimeters to points for React-PDF
 * React-PDF uses points (1 point = 1/72 inch)
 * 
 * @param mm - Value in millimeters
 * @returns Value in points
 */
function mmToPoints(mm: number): number {
  return (mm * 72) / 25.4;
}

/**
 * Get page dimensions based on template config
 */
function getPageDimensions(config: TemplateConfig): { width: number; height: number } {
  const size = PAGE_SIZES[config.pageSize];

  if (config.orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }

  return { width: size.width, height: size.height };
}

/**
 * Collect all image URLs from template elements
 */
function collectImageUrls(elements: TemplateElement[], data: DataBindingSchemaType): string[] {
  const urls: string[] = [];

  for (const element of elements) {
    if (element.type === 'header' && element.content.logo?.value) {
      urls.push(element.content.logo.value);
    } else if (element.type === 'image' && element.content.value) {
      urls.push(element.content.value);
    } else if (element.type === 'image-gallery') {
      // Get gallery images from data
      const galleryData = data.galeri_kegiatan || [];
      const imageUrls = galleryData
        .slice(0, element.dataBinding.maxImages)
        .map((item) => item.foto_url)
        .filter(Boolean);
      urls.push(...imageUrls);
    }
  }

  // Also collect school logo if present
  if (data.school?.logo_url) {
    urls.push(data.school.logo_url);
  }

  return urls.filter(Boolean);
}

/**
 * Pre-download and cache all images for PDF with retry logic
 */
async function preloadImages(
  imageUrls: string[]
): Promise<Map<string, string>> {
  const localImageCache = new Map<string, string>();

  if (imageUrls.length === 0) {
    return localImageCache;
  }

  console.log(`Preloading ${imageUrls.length} images for PDF...`);

  const results = await downloadMultipleImages(imageUrls, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.80, // Slightly lower quality for better compression
    timeout: 15000, // Increased timeout
    concurrency: 3, // Reduced concurrency to avoid overwhelming the server
    retries: 3, // Enable retry logic
    useCache: true, // Use global cache
  });

  for (const result of results) {
    if (result.success && result.data) {
      localImageCache.set(result.url, result.data);
    } else {
      console.warn(`Failed to load image: ${result.url}`, result.error);
    }
  }

  console.log(`Successfully loaded ${localImageCache.size} of ${imageUrls.length} images`);

  return localImageCache;
}

/**
 * Render a single element based on its type
 */
function renderElement(
  element: TemplateElement,
  data: DataBindingSchemaType,
  imageCache: Map<string, string>
): React.ReactNode {
  if (!element.isVisible) {
    return null;
  }

  const key = element.id;

  switch (element.type) {
    case 'header':
      return (
        <HeaderElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
        />
      );

    case 'text':
      return (
        <TextElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
        />
      );

    case 'data-table':
      return (
        <DataTableElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
        />
      );

    case 'image':
      return (
        <ImageElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
          imageCache={imageCache}
        />
      );

    case 'image-gallery':
      return (
        <ImageGalleryElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
          imageCache={imageCache}
        />
      );

    case 'signature':
      return (
        <SignatureElementPDF
          key={key}
          element={element}
          data={data}
          pixelsToMm={pixelsToMm}
        />
      );

    case 'line':
      return <LineElementPDF key={key} element={element} pixelsToMm={pixelsToMm} />;

    default:
      console.warn(`Unknown element type: ${(element as any).type}`);
      return null;
  }
}

/**
 * Create PDF Document component
 */
interface PDFDocumentProps {
  template: TemplateConfig;
  elements: TemplateElement[];
  data: DataBindingSchemaType;
  imageCache: Map<string, string>;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ template, elements, data, imageCache }) => {
  const pageDimensions = getPageDimensions(template);

  // Sort elements by z-index (lower z-index renders first, appears behind)
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Page style
  const pageStyle = {
    width: mmToPoints(pageDimensions.width),
    height: mmToPoints(pageDimensions.height),
    backgroundColor: template.backgroundColor || '#ffffff',
    paddingTop: mmToPoints(template.margins.top),
    paddingRight: mmToPoints(template.margins.right),
    paddingBottom: mmToPoints(template.margins.bottom),
    paddingLeft: mmToPoints(template.margins.left),
    position: 'relative' as const,
  };

  return (
    <Document
      title={template.name}
      author="Portal Keasramaan"
      subject={`Rapor - ${data.siswa.nama}`}
      creator="HSI Boarding School"
    >
      <Page size={template.pageSize} orientation={template.orientation} style={pageStyle}>
        {/* Render all elements */}
        {sortedElements.map((element) => renderElement(element, data, imageCache))}
      </Page>
    </Document>
  );
};

/**
 * Generate PDF from builder template with error handling
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @param data - Data to bind to template
 * @param options - Generation options
 * @returns PDF as Blob with error information
 */
export async function generateBuilderPDF(
  template: TemplateConfig,
  elements: TemplateElement[],
  data: DataBindingSchemaType,
  options?: {
    onError?: (error: any) => void;
    onWarning?: (warning: any) => void;
  }
): Promise<{ blob: Blob; errors: any[]; warnings: any[] }> {
  const errors: any[] = [];
  const warnings: any[] = [];

  try {
    console.log('Starting PDF generation for template:', template.name);
    console.log('Elements count:', elements.length);

    // Validate template before generation
    const validation = validateTemplateForPDF(template, elements);
    if (!validation.valid) {
      const errorMsg = `Template validation failed: ${validation.errors.join(', ')}`;
      console.error(errorMsg);
      errors.push({ type: 'VALIDATION_FAILED', message: errorMsg });
      
      if (options?.onError) {
        options.onError({ type: 'VALIDATION_FAILED', message: errorMsg });
      }
      
      throw new Error(errorMsg);
    }

    // Collect and preload all images
    const imageUrls = collectImageUrls(elements, data);
    const imageCache = await preloadImages(imageUrls);

    // Check for failed images
    const failedImages = imageUrls.length - imageCache.size;
    if (failedImages > 0) {
      const warning = {
        type: 'IMAGE_LOAD_FAILED',
        message: `${failedImages} gambar gagal dimuat dan akan diganti dengan placeholder`,
      };
      warnings.push(warning);
      
      if (options?.onWarning) {
        options.onWarning(warning);
      }
    }

    // Create PDF document
    const doc = (
      <PDFDocument
        template={template}
        elements={elements}
        data={data}
        imageCache={imageCache}
      />
    );

    // Generate PDF blob
    console.log('Rendering PDF...');
    const blob = await pdf(doc).toBlob();
    console.log('PDF generated successfully, size:', blob.size, 'bytes');

    return { blob, errors, warnings };
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorObj = {
      type: 'GENERATION_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    };
    errors.push(errorObj);
    
    if (options?.onError) {
      options.onError(errorObj);
    }
    
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate PDF and return as base64 string
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @param data - Data to bind to template
 * @param options - Generation options
 * @returns PDF as base64 string with error information
 */
export async function generateBuilderPDFBase64(
  template: TemplateConfig,
  elements: TemplateElement[],
  data: DataBindingSchemaType,
  options?: {
    onError?: (error: any) => void;
    onWarning?: (warning: any) => void;
  }
): Promise<{ base64: string; errors: any[]; warnings: any[] }> {
  const result = await generateBuilderPDF(template, elements, data, options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        base64: reader.result as string,
        errors: result.errors,
        warnings: result.warnings,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(result.blob);
  });
}

/**
 * Generate PDF and trigger download in browser
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @param data - Data to bind to template
 * @param filename - Filename for download
 */
export async function downloadBuilderPDF(
  template: TemplateConfig,
  elements: TemplateElement[],
  data: DataBindingSchemaType,
  filename: string
): Promise<void> {
  const blob = await generateBuilderPDF(template, elements, data);

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate template before PDF generation
 * 
 * @param template - Template configuration
 * @param elements - Array of template elements
 * @returns Validation result with errors if any
 */
export function validateTemplateForPDF(
  template: TemplateConfig,
  elements: TemplateElement[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if template has elements
  if (!elements || elements.length === 0) {
    errors.push('Template must have at least one element');
  }

  // Check for duplicate element IDs
  const ids = elements.map((el) => el.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate element IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check page size is valid
  if (!PAGE_SIZES[template.pageSize]) {
    errors.push(`Invalid page size: ${template.pageSize}`);
  }

  // Check orientation is valid
  if (template.orientation !== 'portrait' && template.orientation !== 'landscape') {
    errors.push(`Invalid orientation: ${template.orientation}`);
  }

  // Validate each element
  const pageDimensions = getPageDimensions(template);
  for (const element of elements) {
    // Check if element is within page bounds
    const elementRight = pixelsToMm(element.position.x + element.size.width);
    const elementBottom = pixelsToMm(element.position.y + element.size.height);

    if (elementRight > pageDimensions.width) {
      errors.push(`Element ${element.id} extends beyond page width`);
    }

    if (elementBottom > pageDimensions.height) {
      errors.push(`Element ${element.id} extends beyond page height`);
    }

    // Check for negative positions or sizes
    if (element.position.x < 0 || element.position.y < 0) {
      errors.push(`Element ${element.id} has negative position`);
    }

    if (element.size.width <= 0 || element.size.height <= 0) {
      errors.push(`Element ${element.id} has invalid size`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get estimated PDF file size (rough estimate)
 * 
 * @param elements - Array of template elements
 * @param imageCount - Number of images in template
 * @returns Estimated size in bytes
 */
export function estimatePDFSize(elements: TemplateElement[], imageCount: number): number {
  // Base PDF overhead: ~10KB
  let estimatedSize = 10240;

  // Text elements: ~1KB each
  const textElements = elements.filter(
    (el) => el.type === 'text' || el.type === 'header' || el.type === 'signature'
  );
  estimatedSize += textElements.length * 1024;

  // Table elements: ~2KB each
  const tableElements = elements.filter((el) => el.type === 'data-table');
  estimatedSize += tableElements.length * 2048;

  // Images: ~50KB each (after optimization)
  estimatedSize += imageCount * 51200;

  return estimatedSize;
}
