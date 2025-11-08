import jsPDF from 'jspdf';
import {
  addImage,
  addText,
  addHeader,
  getPageDimensions,
  addPage,
  PDFConfig,
} from '../pdf-generator';

export interface GaleriConfig {
  kegiatan_ids?: string[];
  layout: 'grid-2' | 'grid-4' | 'grid-6' | 'collage';
  auto_paginate?: boolean;
  auto_select_by_scope?: boolean;
  max_foto_per_page?: number;
  show_caption?: boolean;
  show_kegiatan_title?: boolean;
}

export interface FotoData {
  foto_url: string;
  caption?: string;
}

export interface KegiatanGaleri {
  nama_kegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  foto: FotoData[];
}

export interface GaleriData {
  kegiatan: KegiatanGaleri[];
}

/**
 * Render galeri kegiatan page with photos
 */
export async function renderGaleriPage(
  pdf: jsPDF,
  config: GaleriConfig,
  data: GaleriData,
  pageConfig: PDFConfig
): Promise<void> {
  const dimensions = getPageDimensions(pageConfig);
  
  for (const kegiatan of data.kegiatan) {
    if (kegiatan.foto.length === 0) continue;

    // Add kegiatan title if enabled
    if (config.show_kegiatan_title !== false) {
      addHeader(pdf, kegiatan.nama_kegiatan, { fontSize: 14, y: 20 });
      
      const dateText = `${formatDate(kegiatan.tanggal_mulai)} - ${formatDate(kegiatan.tanggal_selesai)}`;
      addText(pdf, dateText, {
        x: dimensions.width / 2,
        y: 28,
        fontSize: 10,
        align: 'center',
      });
    }

    // Render photos based on layout
    const startY = config.show_kegiatan_title !== false ? 35 : 20;
    
    await renderPhotosWithLayout(
      pdf,
      kegiatan.foto,
      config,
      pageConfig,
      startY
    );
  }
}

/**
 * Render photos with specified layout
 */
async function renderPhotosWithLayout(
  pdf: jsPDF,
  photos: FotoData[],
  config: GaleriConfig,
  pageConfig: PDFConfig,
  startY: number
): Promise<void> {
  const dimensions = getPageDimensions(pageConfig);
  const margin = 15;
  const maxPhotosPerPage = config.max_foto_per_page || getDefaultMaxPhotos(config.layout);

  // Split photos into pages if needed
  const photoPages: FotoData[][] = [];
  for (let i = 0; i < photos.length; i += maxPhotosPerPage) {
    photoPages.push(photos.slice(i, i + maxPhotosPerPage));
  }

  for (let pageIndex = 0; pageIndex < photoPages.length; pageIndex++) {
    if (pageIndex > 0 && config.auto_paginate) {
      addPage(pdf, pageConfig);
    }

    const pagePhotos = photoPages[pageIndex];

    switch (config.layout) {
      case 'grid-2':
        await renderGrid2Layout(pdf, pagePhotos, dimensions, margin, startY, config.show_caption);
        break;
      case 'grid-4':
        await renderGrid4Layout(pdf, pagePhotos, dimensions, margin, startY, config.show_caption);
        break;
      case 'grid-6':
        await renderGrid6Layout(pdf, pagePhotos, dimensions, margin, startY, config.show_caption);
        break;
      case 'collage':
        await renderCollageLayout(pdf, pagePhotos, dimensions, margin, startY, config.show_caption);
        break;
    }
  }
}

/**
 * Render 2-photo grid layout (1 column, 2 rows)
 */
async function renderGrid2Layout(
  pdf: jsPDF,
  photos: FotoData[],
  dimensions: { width: number; height: number },
  margin: number,
  startY: number,
  showCaption?: boolean
): Promise<void> {
  const photoWidth = dimensions.width - 2 * margin;
  const photoHeight = (dimensions.height - startY - margin - 10) / 2;
  const spacing = 10;

  for (let i = 0; i < Math.min(photos.length, 2); i++) {
    const y = startY + i * (photoHeight + spacing);
    
    await addImage(pdf, photos[i].foto_url, {
      x: margin,
      y,
      width: photoWidth,
      height: photoHeight,
      format: 'JPEG',
    });

    if (showCaption && photos[i].caption) {
      addText(pdf, photos[i].caption!, {
        x: margin,
        y: y + photoHeight + 5,
        fontSize: 9,
        fontStyle: 'italic',
        maxWidth: photoWidth,
      });
    }
  }
}

/**
 * Render 4-photo grid layout (2 columns, 2 rows)
 */
async function renderGrid4Layout(
  pdf: jsPDF,
  photos: FotoData[],
  dimensions: { width: number; height: number },
  margin: number,
  startY: number,
  showCaption?: boolean
): Promise<void> {
  const spacing = 10;
  const availableWidth = dimensions.width - 2 * margin - spacing;
  const availableHeight = dimensions.height - startY - margin - spacing;
  const photoWidth = availableWidth / 2;
  const photoHeight = availableHeight / 2;

  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (photoWidth + spacing);
    const y = startY + row * (photoHeight + spacing);

    await addImage(pdf, photos[i].foto_url, {
      x,
      y,
      width: photoWidth,
      height: photoHeight,
      format: 'JPEG',
    });

    if (showCaption && photos[i].caption) {
      addText(pdf, photos[i].caption!, {
        x,
        y: y + photoHeight + 4,
        fontSize: 8,
        fontStyle: 'italic',
        maxWidth: photoWidth,
      });
    }
  }
}

/**
 * Render 6-photo grid layout (3 columns, 2 rows)
 */
async function renderGrid6Layout(
  pdf: jsPDF,
  photos: FotoData[],
  dimensions: { width: number; height: number },
  margin: number,
  startY: number,
  showCaption?: boolean
): Promise<void> {
  const spacing = 8;
  const availableWidth = dimensions.width - 2 * margin - 2 * spacing;
  const availableHeight = dimensions.height - startY - margin - spacing;
  const photoWidth = availableWidth / 3;
  const photoHeight = availableHeight / 2;

  for (let i = 0; i < Math.min(photos.length, 6); i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (photoWidth + spacing);
    const y = startY + row * (photoHeight + spacing);

    await addImage(pdf, photos[i].foto_url, {
      x,
      y,
      width: photoWidth,
      height: photoHeight,
      format: 'JPEG',
    });

    if (showCaption && photos[i].caption) {
      addText(pdf, photos[i].caption!, {
        x,
        y: y + photoHeight + 3,
        fontSize: 7,
        fontStyle: 'italic',
        maxWidth: photoWidth,
      });
    }
  }
}

/**
 * Render collage layout (mixed sizes)
 */
async function renderCollageLayout(
  pdf: jsPDF,
  photos: FotoData[],
  dimensions: { width: number; height: number },
  margin: number,
  startY: number,
  showCaption?: boolean
): Promise<void> {
  // Simple collage: 1 large + 2 small
  const spacing = 10;
  const availableWidth = dimensions.width - 2 * margin;
  const availableHeight = dimensions.height - startY - margin;

  if (photos.length >= 1) {
    // Large photo (left side, full height)
    const largeWidth = availableWidth * 0.6;
    const largeHeight = availableHeight;

    await addImage(pdf, photos[0].foto_url, {
      x: margin,
      y: startY,
      width: largeWidth,
      height: largeHeight,
      format: 'JPEG',
    });

    if (showCaption && photos[0].caption) {
      addText(pdf, photos[0].caption!, {
        x: margin,
        y: startY + largeHeight + 4,
        fontSize: 9,
        fontStyle: 'italic',
        maxWidth: largeWidth,
      });
    }
  }

  if (photos.length >= 2) {
    // Small photos (right side, stacked)
    const smallWidth = availableWidth * 0.35;
    const smallHeight = (availableHeight - spacing) / 2;
    const smallX = margin + availableWidth * 0.6 + spacing;

    for (let i = 1; i < Math.min(photos.length, 3); i++) {
      const y = startY + (i - 1) * (smallHeight + spacing);

      await addImage(pdf, photos[i].foto_url, {
        x: smallX,
        y,
        width: smallWidth,
        height: smallHeight,
        format: 'JPEG',
      });

      if (showCaption && photos[i].caption) {
        addText(pdf, photos[i].caption!, {
          x: smallX,
          y: y + smallHeight + 3,
          fontSize: 8,
          fontStyle: 'italic',
          maxWidth: smallWidth,
        });
      }
    }
  }
}

/**
 * Get default max photos per page based on layout
 */
function getDefaultMaxPhotos(layout: GaleriConfig['layout']): number {
  switch (layout) {
    case 'grid-2':
      return 2;
    case 'grid-4':
      return 4;
    case 'grid-6':
      return 6;
    case 'collage':
      return 3;
    default:
      return 4;
  }
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
