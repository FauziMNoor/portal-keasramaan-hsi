import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, ImageRun, convertInchesToTwip } from 'docx';
import { formatTanggalIndonesia } from './pdf-generator';

// Generate Surat Izin dalam format DOCX
export async function generateSuratIzinDocx(perizinan: any, infoSekolah: any): Promise<Document> {
  const sections: any[] = [];
  
  // Header paragraphs
  const headerParagraphs: Paragraph[] = [];

  // Note: KOP template image di DOCX memerlukan konfigurasi khusus
  // Untuk sementara gunakan text-based header yang bisa diedit
  // User bisa insert image manual di Word setelah download
  
  if (infoSekolah.kop_mode === 'template' && infoSekolah.kop_template_url) {
    // Add note untuk user
    headerParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '[ KOP TEMPLATE: Silakan insert gambar KOP manual dari file atau paste dari clipboard ]',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `URL KOP: ${infoSekolah.kop_template_url}`,
            italics: true,
            size: 18,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }
  
  // Text-based header (bisa diedit di Word)
  headerParagraphs.push(...generateTextHeader(infoSekolah));

  // Judul Surat
  headerParagraphs.push(
    new Paragraph({
      text: '',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'SURAT IZIN KEPULANGAN SANTRI',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'Nomor: ......................................',
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Isi Surat
  const contentParagraphs: Paragraph[] = [
    new Paragraph({
      text: 'Yang bertanda tangan di bawah ini, kami pihak Pondok Pesantren SMA IT HSI IDN, dengan ini menerangkan bahwa:',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: '',
      spacing: { after: 100 },
    }),
  ];

  // Data Santri
  const dataSantri = [
    { label: 'Nama Santri', value: perizinan.nama_siswa },
    { label: 'Nomor Induk Santri (NIS)', value: perizinan.nis },
    { label: 'Kelas', value: perizinan.kelas || '-' },
    { label: 'Asrama / Kamar', value: perizinan.asrama || '-' },
  ];

  dataSantri.forEach(item => {
    contentParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: item.label.padEnd(35, ' '),
          }),
          new TextRun({
            text: ': ',
          }),
          new TextRun({
            text: item.value,
            bold: true,
          }),
        ],
        spacing: { after: 100 },
      })
    );
  });

  // Keterangan Izin
  contentParagraphs.push(
    new Paragraph({
      text: '',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Santri tersebut diberikan izin untuk pulang ke rumah selama ${perizinan.durasi_hari} hari, terhitung mulai tanggal ${formatTanggalIndonesia(perizinan.tanggal_mulai)} s.d. ${formatTanggalIndonesia(perizinan.tanggal_selesai)}, dengan keterangan (alasan izin): ${perizinan.alasan}`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Berdasarkan permohonan wali santri dan hasil verifikasi Kepala Asrama, maka izin ini disetujui oleh Kepala Sekolah dan dinyatakan sah oleh sistem perizinan santri HSI Boarding School.',
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Demikian surat izin ini kami keluarkan untuk digunakan sebagaimana mestinya.',
      spacing: { after: 300 },
    })
  );

  // Tanggal dan TTD
  const tanggalCetak = `${infoSekolah.kota || 'Purworejo'}, ${formatTanggalIndonesia(new Date().toISOString())}`;
  
  contentParagraphs.push(
    new Paragraph({
      text: tanggalCetak,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
    })
  );

  // Tanda Tangan (3 kolom)
  const ttdParagraphs = [
    // Baris 1: Label
    new Paragraph({
      children: [
        new TextRun({
          text: 'Kepala Asrama'.padEnd(30, ' '),
        }),
        new TextRun({
          text: 'Kepala Sekolah'.padEnd(30, ' '),
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '(Pemberi Izin)'.padEnd(30, ' '),
        }),
        new TextRun({
          text: '(Pengesahan)'.padEnd(30, ' '),
        }),
      ],
      spacing: { after: 400 },
    }),
    // Baris 2: Nama (setelah TTD)
    new Paragraph({
      children: [
        new TextRun({
          text: (infoSekolah.nama_kepala_asrama || perizinan.approved_by_kepas || '-').padEnd(30, ' '),
          bold: true,
        }),
        new TextRun({
          text: (infoSekolah.nama_kepala_sekolah || perizinan.approved_by_kepsek || '-').padEnd(30, ' '),
          bold: true,
        }),
      ],
      spacing: { after: 400 },
    }),
    // Santri
    new Paragraph({
      text: 'Santri yang Bersangkutan',
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: '(Penerima Izin)',
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: perizinan.nama_siswa,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];

  contentParagraphs.push(...ttdParagraphs);

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79), // 2cm
              right: convertInchesToTwip(0.79),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.79),
            },
          },
        },
        children: [...headerParagraphs, ...contentParagraphs],
      },
    ],
  });

  return doc;
}

// Generate text-based header untuk DOCX
function generateTextHeader(infoSekolah: any): Paragraph[] {
  return [
    new Paragraph({
      text: '🕌 ' + (infoSekolah.nama_sekolah || 'PONDOK PESANTREN SMA IT HSI IDN'),
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      style: 'Heading1',
    }),
    new Paragraph({
      text: infoSekolah.nama_singkat || 'HSI BOARDING SCHOOL',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: infoSekolah.alamat_lengkap || 'Jl. Raya Purworejo',
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `Telp. ${infoSekolah.no_telepon || '-'} | Email: ${infoSekolah.email || '-'}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: '═══════════════════════════════════════════════════════',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}
