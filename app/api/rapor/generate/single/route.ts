import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import {
  createPDF,
  getPDFBlob,
  addPage,
  PDFConfig,
  PageSize,
  PageOrientation,
} from '@/lib/rapor/pdf-generator';
import {
  renderCoverPage,
  CoverConfig,
  CoverData,
} from '@/lib/rapor/renderers/cover-renderer';
import {
  renderDataPage,
  DataConfig,
  DynamicData,
  KategoriData,
} from '@/lib/rapor/renderers/data-renderer';
import {
  renderGaleriPage,
  GaleriConfig,
  GaleriData,
  KegiatanGaleri,
} from '@/lib/rapor/renderers/galeri-renderer';
import {
  renderQRPage,
  QRConfig,
  QRData,
} from '@/lib/rapor/renderers/qr-renderer';
import { generateGaleriQRCode } from '@/lib/rapor/qr-generator';
import {
  validatePDFData,
  executePDFGeneration,
  createPDFError,
  PDFError,
} from '@/lib/rapor/pdf-error-handler';

interface GenerateRequest {
  template_id: string;
  siswa_nis: string;
  tahun_ajaran: string;
  semester: string;
}

// POST - Generate single PDF
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { template_id, siswa_nis, tahun_ajaran, semester } = body;

    // Validation
    if (!template_id || !siswa_nis || !tahun_ajaran || !semester) {
      return NextResponse.json(
        { error: 'Template ID, siswa NIS, tahun ajaran, dan semester harus diisi' },
        { status: 400 }
      );
    }

    // Create history record with processing status
    const { data: historyRecord, error: historyError } = await supabase
      .from('rapor_generate_history_keasramaan')
      .insert({
        template_id,
        siswa_nis,
        tahun_ajaran,
        semester,
        status: 'processing',
        generated_by: session.userId,
      })
      .select()
      .single();

    if (historyError) {
      console.error('Error creating history record:', historyError);
      return NextResponse.json(
        { error: 'Gagal membuat record history' },
        { status: 500 }
      );
    }

    try {
      // Fetch template with pages
      const { data: template, error: templateError } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', template_id)
        .single();

      if (templateError || !template) {
        throw new Error('Template tidak ditemukan');
      }

      const { data: pages, error: pagesError } = await supabase
        .from('rapor_template_page_keasramaan')
        .select('*')
        .eq('template_id', template_id)
        .order('urutan', { ascending: true });

      if (pagesError) {
        throw new Error('Gagal mengambil halaman template');
      }

      if (!pages || pages.length === 0) {
        throw new Error('Template tidak memiliki halaman');
      }

      // Validate PDF data before generation
      const validation = validatePDFData({ template, pages });
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        throw new Error(errorMessages);
      }

      // Fetch siswa data (assuming there's a siswa table or we use the NIS)
      // For now, we'll use NIS as the identifier
      const siswaData = {
        nis: siswa_nis,
        nama_siswa: `Siswa ${siswa_nis}`, // Placeholder, should fetch from siswa table
        kelas: '', // Should fetch from siswa table
        asrama: '', // Should fetch from siswa table
      };

      // Create PDF with first page config
      const firstPageConfig: PDFConfig = {
        pageSize: (pages[0].ukuran_kertas || template.ukuran_kertas_default) as PageSize,
        orientation: (pages[0].orientasi || template.orientasi_default) as PageOrientation,
      };

      const pdf = createPDF(firstPageConfig);
      let isFirstPage = true;
      const renderErrors: PDFError[] = [];

      // Render each page with error handling
      for (const page of pages) {
        const pageConfig: PDFConfig = {
          pageSize: (page.ukuran_kertas || template.ukuran_kertas_default) as PageSize,
          orientation: (page.orientasi || template.orientasi_default) as PageOrientation,
        };

        // Add new page if not first
        if (!isFirstPage) {
          addPage(pdf, pageConfig);
        }
        isFirstPage = false;

        // Render based on page type with error handling
        try {
          switch (page.tipe_halaman) {
            case 'static_cover':
              await renderCoverPageHandler(pdf, page.config as CoverConfig, siswaData, tahun_ajaran, semester, pageConfig);
              break;

            case 'dynamic_data':
              await renderDataPageHandler(pdf, page.config as DataConfig, siswa_nis, tahun_ajaran, semester, siswaData, pageConfig, supabase);
              break;

            case 'galeri_kegiatan':
              await renderGaleriPageHandler(pdf, page.config as GaleriConfig, siswa_nis, tahun_ajaran, semester, siswaData, pageConfig, supabase);
              break;

            case 'qr_code':
              await renderQRPageHandler(pdf, page.config as QRConfig, siswa_nis, tahun_ajaran, semester, siswaData, pageConfig);
              break;

            default:
              console.warn(`Unknown page type: ${page.tipe_halaman}`);
              renderErrors.push(createPDFError('RENDER_ERROR', `Tipe halaman tidak dikenal: ${page.tipe_halaman}`));
          }
        } catch (pageError: any) {
          console.error(`Error rendering page ${page.urutan}:`, pageError);
          renderErrors.push(createPDFError('RENDER_ERROR', `Gagal render halaman ${page.urutan}: ${pageError.message}`));
          // Continue with next page instead of failing completely
        }
      }

      // Log warnings if there were render errors but PDF was still generated
      if (renderErrors.length > 0) {
        console.warn('PDF generated with errors:', renderErrors);
      }

      // Get PDF as blob
      const pdfBlob = getPDFBlob(pdf);

      // Upload to Supabase Storage
      const fileName = `rapor_${siswa_nis}_${tahun_ajaran}_${semester}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rapor-pdf')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Gagal upload PDF: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rapor-pdf')
        .getPublicUrl(fileName);

      const pdfUrl = urlData.publicUrl;

      // Update history record
      await supabase
        .from('rapor_generate_history_keasramaan')
        .update({
          status: 'completed',
          pdf_url: pdfUrl,
        })
        .eq('id', historyRecord.id);

      return NextResponse.json({
        success: true,
        data: {
          history_id: historyRecord.id,
          pdf_url: pdfUrl,
          siswa_nis,
          tahun_ajaran,
          semester,
        },
        message: 'Rapor berhasil di-generate',
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);

      // Update history record with error
      await supabase
        .from('rapor_generate_history_keasramaan')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error',
        })
        .eq('id', historyRecord.id);

      return NextResponse.json(
        { error: error.message || 'Gagal generate PDF' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Generate single PDF error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// Helper function to render cover page
async function renderCoverPageHandler(
  pdf: any,
  config: CoverConfig,
  siswaData: any,
  tahun_ajaran: string,
  semester: string,
  pageConfig: PDFConfig
): Promise<void> {
  const coverData: CoverData = {
    nama_siswa: siswaData.nama_siswa,
    nis: siswaData.nis,
    tahun_ajaran,
    semester,
    kelas: siswaData.kelas,
    asrama: siswaData.asrama,
  };

  await renderCoverPage(pdf, config, coverData, pageConfig);
}

// Helper function to render data page
async function renderDataPageHandler(
  pdf: any,
  config: DataConfig,
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  siswaData: any,
  pageConfig: PDFConfig,
  supabase: any
): Promise<void> {
  // Fetch capaian data for selected kategori
  const kategoriData: KategoriData[] = [];

  for (const kategori_id of config.kategori_indikator_ids) {
    // Fetch kategori info
    const { data: kategori, error: kategoriError } = await supabase
      .from('rapor_kategori_indikator_keasramaan')
      .select('*')
      .eq('id', kategori_id)
      .single();

    if (kategoriError || !kategori) {
      console.warn(`Kategori ${kategori_id} not found`);
      continue;
    }

    // Fetch indikator for this kategori
    const { data: indikatorList, error: indikatorError } = await supabase
      .from('rapor_indikator_keasramaan')
      .select('*')
      .eq('kategori_id', kategori_id)
      .order('urutan', { ascending: true });

    if (indikatorError || !indikatorList) {
      console.warn(`Indikator for kategori ${kategori_id} not found`);
      continue;
    }

    // Fetch capaian for each indikator
    const indikatorCapaian = [];
    for (const indikator of indikatorList) {
      const { data: capaian } = await supabase
        .from('rapor_capaian_siswa_keasramaan')
        .select('*')
        .eq('siswa_nis', siswa_nis)
        .eq('indikator_id', indikator.id)
        .eq('tahun_ajaran', tahun_ajaran)
        .eq('semester', semester)
        .single();

      indikatorCapaian.push({
        nama_indikator: indikator.nama_indikator,
        nilai: capaian?.nilai || '-',
        deskripsi: capaian?.deskripsi || '',
      });
    }

    kategoriData.push({
      nama_kategori: kategori.nama_kategori,
      indikator: indikatorCapaian,
    });
  }

  const dynamicData: DynamicData = {
    siswa_nama: siswaData.nama_siswa,
    siswa_nis,
    tahun_ajaran,
    semester,
    kategori: kategoriData,
  };

  renderDataPage(pdf, config, dynamicData, pageConfig);
}

// Helper function to render galeri page
async function renderGaleriPageHandler(
  pdf: any,
  config: GaleriConfig,
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  siswaData: any,
  pageConfig: PDFConfig,
  supabase: any
): Promise<void> {
  let kegiatanIds = config.kegiatan_ids || [];

  // If auto_select_by_scope, filter kegiatan based on siswa's kelas/asrama
  if (config.auto_select_by_scope) {
    const { data: kegiatanList, error: kegiatanError } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .select('id')
      .eq('tahun_ajaran', tahun_ajaran)
      .eq('semester', semester)
      .or(`scope.eq.seluruh_sekolah,scope.eq.${siswaData.kelas},scope.eq.${siswaData.asrama}`);

    if (!kegiatanError && kegiatanList) {
      kegiatanIds = kegiatanList.map((k: any) => k.id);
    }
  }

  // Fetch kegiatan with photos
  const kegiatanGaleri: KegiatanGaleri[] = [];

  for (const kegiatan_id of kegiatanIds) {
    const { data: kegiatan, error: kegiatanError } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .select('*')
      .eq('id', kegiatan_id)
      .single();

    if (kegiatanError || !kegiatan) {
      console.warn(`Kegiatan ${kegiatan_id} not found`);
      continue;
    }

    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .select('*')
      .eq('kegiatan_id', kegiatan_id)
      .order('urutan', { ascending: true });

    if (photosError || !photos || photos.length === 0) {
      continue;
    }

    kegiatanGaleri.push({
      nama_kegiatan: kegiatan.nama_kegiatan,
      tanggal_mulai: kegiatan.tanggal_mulai,
      tanggal_selesai: kegiatan.tanggal_selesai,
      foto: photos.map((p: any) => ({
        foto_url: p.foto_url,
        caption: p.caption,
      })),
    });
  }

  const galeriData: GaleriData = {
    kegiatan: kegiatanGaleri,
  };

  await renderGaleriPage(pdf, config, galeriData, pageConfig);
}

// Helper function to render QR page
async function renderQRPageHandler(
  pdf: any,
  config: QRConfig,
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  siswaData: any,
  pageConfig: PDFConfig
): Promise<void> {
  // Generate QR code
  const { qrCodeDataUrl, token } = await generateGaleriQRCode(
    config.qr_base_url,
    siswa_nis,
    tahun_ajaran,
    semester,
    {
      qrWidth: config.qr_size || 300,
    }
  );

  const qrData: QRData = {
    token,
    siswa_nama: siswaData.nama_siswa,
    siswa_nis,
  };

  await renderQRPage(pdf, config, qrData, pageConfig, qrCodeDataUrl);
}
