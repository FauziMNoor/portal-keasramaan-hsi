import jsPDF from 'jspdf';
import {
  addText,
  addTable,
  addHeader,
  getPageDimensions,
  getCurrentY,
  PDFConfig,
  TableColumn,
} from '../pdf-generator';

export interface DataConfig {
  kategori_indikator_ids: string[];
  show_deskripsi?: boolean;
  layout?: 'list' | 'table';
  show_kategori_header?: boolean;
}

export interface IndikatorCapaian {
  nama_indikator: string;
  nilai?: string;
  deskripsi?: string;
}

export interface KategoriData {
  nama_kategori: string;
  indikator: IndikatorCapaian[];
}

export interface DynamicData {
  siswa_nama: string;
  siswa_nis: string;
  tahun_ajaran: string;
  semester: string;
  kategori: KategoriData[];
}

/**
 * Render dynamic data page with indikator capaian
 */
export function renderDataPage(
  pdf: jsPDF,
  config: DataConfig,
  data: DynamicData,
  pageConfig: PDFConfig
): void {
  const dimensions = getPageDimensions(pageConfig);
  const margin = 20;
  let currentY = margin;

  // Add page header
  addHeader(pdf, 'LAPORAN CAPAIAN INDIKATOR', { fontSize: 16, y: currentY });
  currentY += 10;

  // Add student info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  addText(pdf, `Nama: ${data.siswa_nama}`, {
    x: margin,
    y: currentY,
    fontSize: 10,
  });
  currentY += 5;

  addText(pdf, `NIS: ${data.siswa_nis}`, {
    x: margin,
    y: currentY,
    fontSize: 10,
  });
  currentY += 5;

  addText(pdf, `Tahun Ajaran: ${data.tahun_ajaran} | Semester: ${data.semester}`, {
    x: margin,
    y: currentY,
    fontSize: 10,
  });
  currentY += 10;

  // Render each kategori
  for (const kategori of data.kategori) {
    // Check if we need a new page
    if (currentY > dimensions.height - 40) {
      pdf.addPage();
      currentY = margin;
    }

    // Render kategori header if enabled
    if (config.show_kategori_header !== false) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      addText(pdf, kategori.nama_kategori, {
        x: margin,
        y: currentY,
        fontSize: 14,
        fontStyle: 'bold',
      });
      currentY += 8;
    }

    // Render based on layout
    if (config.layout === 'table') {
      currentY = renderTableLayout(
        pdf,
        kategori.indikator,
        currentY,
        margin,
        dimensions.width - 2 * margin,
        config.show_deskripsi || false
      );
    } else {
      currentY = renderListLayout(
        pdf,
        kategori.indikator,
        currentY,
        margin,
        dimensions.width - 2 * margin,
        config.show_deskripsi || false
      );
    }

    currentY += 5; // Space between categories
  }
}

/**
 * Render indikator in table layout
 */
function renderTableLayout(
  pdf: jsPDF,
  indikator: IndikatorCapaian[],
  startY: number,
  marginX: number,
  maxWidth: number,
  showDeskripsi: boolean
): number {
  const columns: TableColumn[] = [
    { header: 'No', dataKey: 'no', width: 15 },
    { header: 'Indikator', dataKey: 'indikator', width: showDeskripsi ? 60 : 100 },
    { header: 'Nilai', dataKey: 'nilai', width: 20 },
  ];

  if (showDeskripsi) {
    columns.push({ header: 'Deskripsi', dataKey: 'deskripsi', width: 75 });
  }

  const tableData = indikator.map((item, index) => ({
    no: (index + 1).toString(),
    indikator: item.nama_indikator,
    nilai: item.nilai || '-',
    deskripsi: item.deskripsi || '-',
  }));

  addTable(pdf, {
    startY,
    columns,
    data: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
  });

  return getCurrentY(pdf) + 5;
}

/**
 * Render indikator in list layout
 */
function renderListLayout(
  pdf: jsPDF,
  indikator: IndikatorCapaian[],
  startY: number,
  marginX: number,
  maxWidth: number,
  showDeskripsi: boolean
): number {
  let currentY = startY;

  indikator.forEach((item, index) => {
    // Check if we need a new page
    const estimatedHeight = showDeskripsi ? 15 : 8;
    if (currentY > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      currentY = 20;
    }

    // Render indikator number and name
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const numberText = `${index + 1}.`;
    const indikatorText = `${item.nama_indikator}`;
    const nilaiText = item.nilai || '-';

    addText(pdf, numberText, {
      x: marginX,
      y: currentY,
      fontSize: 10,
    });

    addText(pdf, indikatorText, {
      x: marginX + 10,
      y: currentY,
      fontSize: 10,
      maxWidth: maxWidth - 40,
    });

    addText(pdf, nilaiText, {
      x: marginX + maxWidth - 20,
      y: currentY,
      fontSize: 10,
      fontStyle: 'bold',
      align: 'right',
    });

    currentY += 5;

    // Render deskripsi if enabled
    if (showDeskripsi && item.deskripsi) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      
      const deskripsiLines = pdf.splitTextToSize(item.deskripsi, maxWidth - 15);
      addText(pdf, deskripsiLines, {
        x: marginX + 10,
        y: currentY,
        fontSize: 9,
        fontStyle: 'italic',
        maxWidth: maxWidth - 15,
      });
      
      currentY += deskripsiLines.length * 4;
    }

    currentY += 3; // Space between items
  });

  return currentY;
}
