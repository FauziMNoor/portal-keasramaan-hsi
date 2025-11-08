import jsPDF from 'jspdf';
import { addImage, addText, getPageDimensions, PDFConfig } from '../pdf-generator';

export interface CoverConfig {
  cover_image_url: string;
  overlay_data?: {
    show_nama_siswa?: boolean;
    show_tahun_ajaran?: boolean;
    show_semester?: boolean;
    show_kelas?: boolean;
    show_asrama?: boolean;
    position?: {
      nama_siswa?: { x: number; y: number };
      tahun_ajaran?: { x: number; y: number };
      semester?: { x: number; y: number };
      kelas?: { x: number; y: number };
      asrama?: { x: number; y: number };
    };
    fontSize?: {
      nama_siswa?: number;
      tahun_ajaran?: number;
      semester?: number;
      kelas?: number;
      asrama?: number;
    };
    color?: string;
  };
}

export interface CoverData {
  nama_siswa: string;
  nis: string;
  tahun_ajaran: string;
  semester: string;
  kelas?: string;
  asrama?: string;
}

/**
 * Render static cover page with optional data overlay
 */
export async function renderCoverPage(
  pdf: jsPDF,
  config: CoverConfig,
  data: CoverData,
  pageConfig: PDFConfig
): Promise<void> {
  const dimensions = getPageDimensions(pageConfig);
  
  // Add cover image (full page)
  await addImage(pdf, config.cover_image_url, {
    x: 0,
    y: 0,
    width: dimensions.width,
    height: dimensions.height,
    format: 'JPEG',
  });

  // Add overlay data if configured
  if (config.overlay_data) {
    const overlay = config.overlay_data;
    const defaultColor = overlay.color || '#000000';
    
    // Default positions (center of page)
    const centerX = dimensions.width / 2;
    const defaultPositions = {
      nama_siswa: { x: centerX, y: dimensions.height * 0.5 },
      tahun_ajaran: { x: centerX, y: dimensions.height * 0.6 },
      semester: { x: centerX, y: dimensions.height * 0.65 },
      kelas: { x: centerX, y: dimensions.height * 0.7 },
      asrama: { x: centerX, y: dimensions.height * 0.75 },
    };

    const defaultFontSizes = {
      nama_siswa: 20,
      tahun_ajaran: 14,
      semester: 14,
      kelas: 14,
      asrama: 14,
    };

    // Render nama siswa
    if (overlay.show_nama_siswa) {
      const pos = overlay.position?.nama_siswa || defaultPositions.nama_siswa;
      const fontSize = overlay.fontSize?.nama_siswa || defaultFontSizes.nama_siswa;
      
      addText(pdf, data.nama_siswa, {
        x: pos.x,
        y: pos.y,
        fontSize,
        fontStyle: 'bold',
        align: 'center',
        color: defaultColor,
      });
    }

    // Render tahun ajaran
    if (overlay.show_tahun_ajaran) {
      const pos = overlay.position?.tahun_ajaran || defaultPositions.tahun_ajaran;
      const fontSize = overlay.fontSize?.tahun_ajaran || defaultFontSizes.tahun_ajaran;
      
      addText(pdf, `Tahun Ajaran ${data.tahun_ajaran}`, {
        x: pos.x,
        y: pos.y,
        fontSize,
        fontStyle: 'normal',
        align: 'center',
        color: defaultColor,
      });
    }

    // Render semester
    if (overlay.show_semester) {
      const pos = overlay.position?.semester || defaultPositions.semester;
      const fontSize = overlay.fontSize?.semester || defaultFontSizes.semester;
      
      addText(pdf, `Semester ${data.semester}`, {
        x: pos.x,
        y: pos.y,
        fontSize,
        fontStyle: 'normal',
        align: 'center',
        color: defaultColor,
      });
    }

    // Render kelas
    if (overlay.show_kelas && data.kelas) {
      const pos = overlay.position?.kelas || defaultPositions.kelas;
      const fontSize = overlay.fontSize?.kelas || defaultFontSizes.kelas;
      
      addText(pdf, `Kelas ${data.kelas}`, {
        x: pos.x,
        y: pos.y,
        fontSize,
        fontStyle: 'normal',
        align: 'center',
        color: defaultColor,
      });
    }

    // Render asrama
    if (overlay.show_asrama && data.asrama) {
      const pos = overlay.position?.asrama || defaultPositions.asrama;
      const fontSize = overlay.fontSize?.asrama || defaultFontSizes.asrama;
      
      addText(pdf, `Asrama ${data.asrama}`, {
        x: pos.x,
        y: pos.y,
        fontSize,
        fontStyle: 'normal',
        align: 'center',
        color: defaultColor,
      });
    }
  }
}
