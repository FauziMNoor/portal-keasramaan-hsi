import jsPDF from 'jspdf';
import {
  addText,
  addImage,
  getPageDimensions,
  drawRect,
  PDFConfig,
} from '../pdf-generator';

export interface QRConfig {
  qr_base_url: string;
  qr_size?: number;
  qr_position?: 'center' | 'bottom-right' | 'bottom-center' | 'top-right' | 'top-center';
  show_text?: boolean;
  text?: string;
  show_instructions?: boolean;
  instructions?: string;
  background_color?: string;
}

export interface QRData {
  token: string;
  siswa_nama: string;
  siswa_nis: string;
}

/**
 * Render QR code page
 */
export async function renderQRPage(
  pdf: jsPDF,
  config: QRConfig,
  data: QRData,
  pageConfig: PDFConfig,
  qrCodeDataUrl: string
): Promise<void> {
  const dimensions = getPageDimensions(pageConfig);
  const qrSize = config.qr_size || 80;
  const position = config.qr_position || 'center';

  // Add background if specified
  if (config.background_color) {
    drawRect(pdf, 0, 0, dimensions.width, dimensions.height, {
      fillColor: config.background_color,
    });
  }

  // Calculate QR code position
  const { x, y } = calculateQRPosition(dimensions, qrSize, position);

  // Add QR code image
  await addImage(pdf, qrCodeDataUrl, {
    x,
    y,
    width: qrSize,
    height: qrSize,
    format: 'PNG',
  });

  // Add border around QR code
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.5);
  pdf.rect(x - 2, y - 2, qrSize + 4, qrSize + 4);

  // Add text above QR code if enabled
  if (config.show_text !== false) {
    const text = config.text || 'Scan untuk melihat galeri lengkap';
    const textY = y - 10;

    addText(pdf, text, {
      x: x + qrSize / 2,
      y: textY,
      fontSize: 12,
      fontStyle: 'bold',
      align: 'center',
    });
  }

  // Add instructions below QR code if enabled
  if (config.show_instructions !== false) {
    const instructions = config.instructions || 
      'Gunakan aplikasi kamera atau QR scanner untuk mengakses galeri kegiatan online';
    const instructionsY = y + qrSize + 15;

    addText(pdf, instructions, {
      x: x + qrSize / 2,
      y: instructionsY,
      fontSize: 10,
      align: 'center',
      maxWidth: dimensions.width - 40,
    });
  }

  // Add student info at bottom
  const bottomY = dimensions.height - 30;
  
  addText(pdf, `Nama: ${data.siswa_nama}`, {
    x: dimensions.width / 2,
    y: bottomY,
    fontSize: 10,
    align: 'center',
  });

  addText(pdf, `NIS: ${data.siswa_nis}`, {
    x: dimensions.width / 2,
    y: bottomY + 6,
    fontSize: 10,
    align: 'center',
  });

  // Add URL text (small, at very bottom)
  const fullUrl = `${config.qr_base_url}${data.token}`;
  addText(pdf, fullUrl, {
    x: dimensions.width / 2,
    y: dimensions.height - 10,
    fontSize: 8,
    align: 'center',
    color: '#666666',
  });
}

/**
 * Calculate QR code position based on configuration
 */
function calculateQRPosition(
  dimensions: { width: number; height: number },
  qrSize: number,
  position: QRConfig['qr_position']
): { x: number; y: number } {
  const margin = 20;
  const centerX = (dimensions.width - qrSize) / 2;
  const centerY = (dimensions.height - qrSize) / 2;

  switch (position) {
    case 'center':
      return { x: centerX, y: centerY };
    
    case 'bottom-right':
      return {
        x: dimensions.width - qrSize - margin,
        y: dimensions.height - qrSize - margin - 40, // Extra space for student info
      };
    
    case 'bottom-center':
      return {
        x: centerX,
        y: dimensions.height - qrSize - margin - 40,
      };
    
    case 'top-right':
      return {
        x: dimensions.width - qrSize - margin,
        y: margin + 20, // Space for text
      };
    
    case 'top-center':
      return {
        x: centerX,
        y: margin + 20,
      };
    
    default:
      return { x: centerX, y: centerY };
  }
}
