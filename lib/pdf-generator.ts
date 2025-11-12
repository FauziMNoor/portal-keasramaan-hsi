import { jsPDF } from 'jspdf';

// Helper untuk format tanggal Indonesia
export function formatTanggalIndonesia(dateString: string): string {
  const date = new Date(dateString);
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

// Generate KOP Dinamis (Text-Based)
export async function generateKopDinamis(doc: jsPDF, infoSekolah: any): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header - Nama Sekolah
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('🕌 ' + infoSekolah.nama_sekolah, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(14);
  doc.text(infoSekolah.nama_singkat, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(infoSekolah.alamat_lengkap, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  const kontakInfo = `Telp. ${infoSekolah.no_telepon || '-'} | Email: ${infoSekolah.email || '-'}`;
  doc.text(kontakInfo, pageWidth / 2, yPos, { align: 'center' });
  
  // Garis pemisah
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 1;
  doc.setLineWidth(0.2);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  return yPos;
}

// Generate KOP Template (Image-Based)
export async function generateKopTemplate(doc: jsPDF, infoSekolah: any): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  try {
    if (!infoSekolah.kop_template_url) {
      throw new Error('KOP template URL is empty');
    }

    console.log('🔄 Loading KOP template from:', infoSekolah.kop_template_url);
    
    // Fetch image with proper headers
    const response = await fetch(infoSekolah.kop_template_url, {
      method: 'GET',
      headers: {
        'Accept': 'image/png, image/jpeg, image/jpg, image/*',
      },
      mode: 'cors', // Enable CORS
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Fetch successful, converting to blob...');
    const blob = await response.blob();
    console.log('📦 Blob created:', { type: blob.type, size: blob.size });
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('✅ Base64 conversion complete, length:', result.length);
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });

    // Detect image format
    let format = 'PNG';
    const url = infoSekolah.kop_template_url.toLowerCase();
    const blobType = blob.type.toLowerCase();
    
    if (url.includes('.jpg') || url.includes('.jpeg') || blobType.includes('jpeg')) {
      format = 'JPEG';
    } else if (url.includes('.png') || blobType.includes('png')) {
      format = 'PNG';
    }
    
    console.log('🎨 Adding image to PDF:', { format, width: pageWidth, height: pageHeight });

    // Add image as background (full page A4)
    doc.addImage(base64, format, 0, 0, pageWidth, pageHeight);
    
    console.log('✅ KOP template loaded successfully!');
    
    // Return starting Y position for content (based on margin_top)
    const marginTop = infoSekolah.kop_content_margin_top || 40;
    console.log('📏 Content will start at Y position:', marginTop);
    return marginTop;
    
  } catch (error: any) {
    console.error('❌ Error loading KOP template:', {
      message: error.message,
      url: infoSekolah.kop_template_url,
      error: error
    });
    
    // Fallback to dynamic KOP if template fails
    console.log('⚠️ Falling back to dynamic KOP');
    return await generateKopDinamis(doc, infoSekolah);
  }
}

// Generate Surat Izin Kepulangan
export async function generateSuratIzin(perizinan: any, infoSekolah: any): Promise<ArrayBuffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  console.log('📄 PDF Generator - Info Sekolah:', {
    cabang: infoSekolah.cabang,
    kop_mode: infoSekolah.kop_mode,
    has_template_url: !!infoSekolah.kop_template_url,
    template_url: infoSekolah.kop_template_url
  });
  
  // Generate KOP based on mode
  let yPos: number;
  if (infoSekolah.kop_mode === 'template' && infoSekolah.kop_template_url) {
    console.log('🎨 Using KOP Template mode');
    yPos = await generateKopTemplate(doc, infoSekolah);
  } else {
    console.log('📝 Using KOP Dinamis mode');
    yPos = await generateKopDinamis(doc, infoSekolah);
  }
  
  // Set margins for content
  const leftMargin = infoSekolah.kop_content_margin_left || 20;
  const rightMargin = pageWidth - (infoSekolah.kop_content_margin_right || 20);
  const contentWidth = rightMargin - leftMargin;
  
  // Judul Surat
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT IZIN KEPULANGAN SANTRI', pageWidth / 2, yPos, { align: 'center' });
  
  // Nomor Surat (dikosongkan untuk diisi manual)
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const nomorSurat = `Nomor: ......................................`;
  doc.text(nomorSurat, pageWidth / 2, yPos, { align: 'center' });
  
  // Isi Surat
  yPos += 15;
  doc.setFontSize(11);
  const pembukaan = 'Yang bertanda tangan di bawah ini, kami pihak Pondok Pesantren SMA IT HSI IDN, dengan ini menerangkan bahwa:';
  const splitPembukaan = doc.splitTextToSize(pembukaan, contentWidth);
  doc.text(splitPembukaan, leftMargin, yPos);
  yPos += splitPembukaan.length * 6;
  
  // Data Santri
  yPos += 5;
  const dataMargin = leftMargin + 60;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Nama Santri', leftMargin, yPos);
  doc.text(':', dataMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(perizinan.nama_siswa, dataMargin + 5, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Nomor Induk Santri (NIS)', leftMargin, yPos);
  doc.text(':', dataMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(perizinan.nis, dataMargin + 5, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Kelas', leftMargin, yPos);
  doc.text(':', dataMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(perizinan.kelas || '-', dataMargin + 5, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Asrama / Kamar', leftMargin, yPos);
  doc.text(':', dataMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(perizinan.asrama || '-', dataMargin + 5, yPos);
  
  // Keterangan Izin
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  const keteranganIzin = `Santri tersebut diberikan izin untuk pulang ke rumah selama ${perizinan.durasi_hari} hari, terhitung mulai tanggal ${formatTanggalIndonesia(perizinan.tanggal_mulai)} s.d. ${formatTanggalIndonesia(perizinan.tanggal_selesai)}, dengan keterangan (alasan izin): ${perizinan.alasan}`;
  const splitKeterangan = doc.splitTextToSize(keteranganIzin, contentWidth);
  doc.text(splitKeterangan, leftMargin, yPos);
  yPos += splitKeterangan.length * 6;
  
  // Penutup
  yPos += 8;
  const penutup = 'Berdasarkan permohonan wali santri dan hasil verifikasi Kepala Asrama, maka izin ini disetujui oleh Kepala Sekolah dan dinyatakan sah oleh sistem perizinan santri HSI Boarding School.';
  const splitPenutup = doc.splitTextToSize(penutup, contentWidth);
  doc.text(splitPenutup, leftMargin, yPos);
  yPos += splitPenutup.length * 6;
  
  yPos += 8;
  const penutup2 = 'Demikian surat izin ini kami keluarkan untuk digunakan sebagaimana mestinya.';
  doc.text(penutup2, leftMargin, yPos);
  
  // Tanggal & TTD
  yPos += 15;
  const tanggalCetak = `${infoSekolah.kota}, ${formatTanggalIndonesia(new Date().toISOString())}`;
  doc.text(tanggalCetak, rightMargin, yPos, { align: 'right' });
  
  // Tanda Tangan
  yPos += 15;
  const ttdLeftX = leftMargin + 10;
  const ttdRightX = rightMargin - 60;
  
  // Kepala Asrama
  doc.setFontSize(10);
  doc.text('Kepala Asrama', ttdLeftX, yPos);
  doc.text('(Pemberi Izin)', ttdLeftX, yPos + 5);
  
  // Kepala Sekolah
  doc.text('Kepala Sekolah', ttdRightX, yPos);
  doc.text('(Pengesahan)', ttdRightX, yPos + 5);
  
  // Nama TTD
  yPos += 25;
  doc.setFont('helvetica', 'bold');
  doc.text(infoSekolah.nama_kepala_asrama || perizinan.approved_by_kepas || '-', ttdLeftX, yPos);
  doc.text(infoSekolah.nama_kepala_sekolah || perizinan.approved_by_kepsek || '-', ttdRightX, yPos);
  
  // Santri
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text('Santri yang Bersangkutan', pageWidth / 2, yPos, { align: 'center' });
  doc.text('(Penerima Izin)', pageWidth / 2, yPos + 5, { align: 'center' });
  
  yPos += 25;
  doc.setFont('helvetica', 'bold');
  doc.text(perizinan.nama_siswa, pageWidth / 2, yPos, { align: 'center' });
  
  // Generate PDF sebagai buffer
  return doc.output('arraybuffer');
}
