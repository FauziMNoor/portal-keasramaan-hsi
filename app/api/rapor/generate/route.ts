import { NextRequest, NextResponse } from 'next/server';
import { compileRaporData } from '@/lib/raporHelper';
import { generateRaporSlides, exportToPDF } from '@/lib/googleSlides';
import { uploadPDFRapor } from '@/lib/raporStorage';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode,
      cabang,
      tahunAjaran,
      semester,
      kelas,
      asrama,
      nis, // for single mode
      googleTokens, // OAuth tokens from frontend
    } = body;

    if (!googleTokens || !googleTokens.access_token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Google account not connected. Please connect your Google account first.',
          needsAuth: true 
        },
        { status: 403 }
      );
    }

    const tokenData = {
      access_token: googleTokens.access_token,
      refresh_token: googleTokens.refresh_token,
    };

    // Validate required fields
    if (!mode || !cabang || !tahunAjaran || !semester || !kelas || !asrama) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (mode === 'single' && !nis) {
      return NextResponse.json(
        { success: false, message: 'NIS required for single mode' },
        { status: 400 }
      );
    }

    // Generate based on mode
    if (mode === 'single') {
      const result = await generateSingleRapor({
        nis,
        cabang,
        tahunAjaran,
        semester,
        kelas,
        asrama,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      });
      return NextResponse.json(result);
    } else if (mode === 'kelas' || mode === 'asrama') {
      const result = await generateBatchRapor({
        mode,
        cabang,
        tahunAjaran,
        semester,
        kelas,
        asrama,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      });
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid mode' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in generate rapor API:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// GENERATE SINGLE RAPOR
// =====================================================
async function generateSingleRapor(params: {
  nis: string;
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
  accessToken: string;
  refreshToken?: string;
}) {
  try {
    console.log('🔄 Starting generateSingleRapor for:', params.nis);
    
    // 1. Compile all data
    console.log('📊 Compiling data...');
    const dataResult = await compileRaporData(params);
    if (!dataResult.success) {
      console.error('❌ Compile data failed:', dataResult.message);
      throw new Error(dataResult.message);
    }
    console.log('✅ Data compiled successfully');

    const { santri, habit, kegiatan, dokumentasi, catatan } = dataResult.data;

    // 2. Prepare replacement data for Google Slides
    const replacements: any = {
      '<<Nama Santri>>': santri.nama_siswa || '',
      '<<Semester>>': params.semester || '',
      '<<Tahun Ajaran>>': params.tahunAjaran || '',
      
      // Habit tracker results (21 habits)
      '<<Shalat Fardhu Berjamaah>>': habit.shalat_fardhu_berjamaah_deskripsi || '',
      '<<Tata Cara Shalat>>': habit.tata_cara_shalat_deskripsi || '',
      '<<Qiyamul Lail>>': habit.qiyamul_lail_deskripsi || '',
      '<<Shalat Sunnah>>': habit.shalat_sunnah_deskripsi || '',
      '<<Puasa Sunnah>>': habit.puasa_sunnah_deskripsi || '',
      '<<Tata Cara Wudhu>>': habit.tata_cara_wudhu_deskripsi || '',
      '<<Sedekah>>': habit.sedekah_deskripsi || '',
      '<<Dzikir Pagi Petang>>': habit.dzikir_pagi_petang_deskripsi || '',
      '<<Etika Dalam Tutur Kata>>': habit.etika_dalam_tutur_kata_deskripsi || '',
      '<<Etika Dalam Bergaul>>': habit.etika_dalam_bergaul_deskripsi || '',
      '<<Etika Dalam Berpakaian>>': habit.etika_dalam_berpakaian_deskripsi || '',
      '<<Adab Sehari-hari>>': habit.adab_sehari_hari_deskripsi || '',
      '<<Waktu Tidur>>': habit.waktu_tidur_deskripsi || '',
      '<<Pelaksanaan Piket Kamar>>': habit.pelaksanaan_piket_kamar_deskripsi || '',
      '<<Disiplin Halaqah Tahfidz>>': habit.disiplin_halaqah_tahfidz_deskripsi || '',
      '<<Perizinan>>': habit.perizinan_deskripsi || '',
      '<<Belajar Malam>>': habit.belajar_malam_deskripsi || '',
      '<<Disiplin Berangkat ke Masjid>>': habit.disiplin_berangkat_ke_masjid_deskripsi || '',
      '<<Kebersihan Tubuh, Berpakaian & Berpenampilan>>': habit.kebersihan_tubuh_berpakaian_berpenampilan_deskripsi || '',
      '<<Kamar>>': habit.kamar_deskripsi || '',
      '<<Ranjang & Almari>>': habit.ranjang_dan_almari_deskripsi || '',
      
      // Catatan & Pengesahan
      '<<Catatan Musyrif>>': catatan?.catatan_musyrif || '-',
      '<<Ketua Asrama>>': catatan?.nama_ketua_asrama || '-',
      '<<Musyrif>>': catatan?.nama_musyrif || santri.musyrif || '-',
    };

    // Add kegiatan (6 kegiatan)
    for (let i = 1; i <= 6; i++) {
      const keg = kegiatan.find((k: any) => k.urutan === i);
      replacements[`<<Nama Kegiatan ${i}>>`] = keg?.nama_kegiatan || '-';
      replacements[`<<Ket Kegiatan ${i}>>`] = keg?.keterangan_kegiatan || '-';
      // Note: Foto akan di-handle terpisah (insert image, bukan replace text)
    }

    // 3. Generate Google Slides with OAuth (including images)
    console.log('📄 Generating Google Slides for:', santri.nama_siswa);
    const slidesResult = await generateRaporSlides(
      {
        santriData: santri,
        habitData: habit,
        kegiatanData: kegiatan,
        dokumentasiData: dokumentasi,
        replacements,
      },
      params.accessToken,
      params.refreshToken,
      {
        insertImages: true, // Enable image insertion
      }
    );

    if (!slidesResult.success) {
      console.error('❌ Google Slides generation failed:', slidesResult.message);
      throw new Error('Failed to generate Google Slides: ' + slidesResult.message);
    }
    console.log('✅ Google Slides created:', slidesResult.presentationId);

    // 4. Export to PDF with OAuth
    console.log('📥 Exporting to PDF...');
    const pdfResult = await exportToPDF(slidesResult.presentationId!, params.accessToken, params.refreshToken);

    if (!pdfResult.success) {
      console.error('❌ PDF export failed:', pdfResult.message);
      throw new Error('Failed to export PDF: ' + pdfResult.message);
    }
    console.log('✅ PDF exported successfully');

    // 5. Upload PDF to storage
    console.log('☁️ Uploading PDF to storage...');
    const uploadResult = await uploadPDFRapor(pdfResult.pdfBuffer!, {
      cabang: params.cabang,
      tahun_ajaran: params.tahunAjaran,
      semester: params.semester,
      nis: params.nis,
      nama_siswa: santri.nama_siswa,
    });

    if (!uploadResult.success) {
      console.error('❌ PDF upload failed:', uploadResult.error);
      throw new Error('Failed to upload PDF: ' + uploadResult.error);
    }
    console.log('✅ PDF uploaded:', uploadResult.url);

    // 6. Upload PDF to Google Drive (in addition to Supabase)
    console.log('☁️ Uploading PDF to Google Drive...');
    try {
      const { drive } = await import('@/lib/googleSlides').then(m => 
        m.getGoogleSlidesClientWithOAuth(params.accessToken, params.refreshToken)
      );
      
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const pdfFileName = `Rapor - ${santri.nama_siswa} - ${params.semester} ${params.tahunAjaran}.pdf`;
      
      // Upload PDF file to Google Drive
      const driveUploadResult = await drive.files.create({
        requestBody: {
          name: pdfFileName,
          mimeType: 'application/pdf',
          ...(folderId && { parents: [folderId] }),
        },
        media: {
          mimeType: 'application/pdf',
          body: pdfResult.pdfBuffer,
        },
        fields: 'id, webViewLink, webContentLink',
      });
      
      console.log('✅ PDF uploaded to Google Drive');
      console.log('   File ID:', driveUploadResult.data.id);
      console.log('   View Link:', driveUploadResult.data.webViewLink);
      
      // Now delete the temporary Slides file
      console.log('🗑️ Deleting temporary Google Slides file...');
      await drive.files.delete({
        fileId: slidesResult.presentationId!,
      });
      console.log('✅ Temporary Slides file deleted');
      
      // Save Drive PDF info
      var drivePdfId = driveUploadResult.data.id;
      var drivePdfUrl = driveUploadResult.data.webViewLink;
    } catch (driveError: any) {
      console.error('⚠️ Failed to upload PDF to Drive or delete Slides:', driveError.message);
      // Don't throw error, continue with Supabase storage
      var drivePdfId = null;
      var drivePdfUrl = null;
    }

    // 7. Save log to database
    await supabase.from('rapor_generate_log_keasramaan').insert([
      {
        nis: params.nis,
        nama_siswa: santri.nama_siswa,
        cabang: params.cabang,
        tahun_ajaran: params.tahunAjaran,
        semester: params.semester,
        kelas: params.kelas,
        asrama: params.asrama,
        mode_generate: 'single',
        status: 'success',
        presentation_id: drivePdfId, // PDF file ID in Google Drive
        pdf_url: uploadResult.path, // PDF path in Supabase Storage
        drive_pdf_url: drivePdfUrl, // PDF view link in Google Drive
      },
    ]);

    return {
      success: true,
      message: 'Rapor berhasil di-generate!',
      data: {
        pdf_url: uploadResult.url,
        presentation_url: slidesResult.url,
      },
    };
  } catch (error: any) {
    console.error('❌ Error in generateSingleRapor:', error);
    console.error('Stack trace:', error.stack);
    
    // Save error log
    await supabase.from('rapor_generate_log_keasramaan').insert([
      {
        nis: params.nis,
        cabang: params.cabang,
        tahun_ajaran: params.tahunAjaran,
        semester: params.semester,
        kelas: params.kelas,
        asrama: params.asrama,
        mode_generate: 'single',
        status: 'failed',
        error_message: error.message + ' | Stack: ' + error.stack?.substring(0, 500),
      },
    ]);

    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// GENERATE BATCH RAPOR
// =====================================================
async function generateBatchRapor(params: {
  mode: 'kelas' | 'asrama';
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
  accessToken: string;
  refreshToken?: string;
}) {
  try {
    // 1. Fetch all santri in kelas/asrama
    const { data: santriList, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa')
      .eq('cabang', params.cabang)
      .eq('kelas', params.kelas)
      .eq('asrama', params.asrama);

    if (error) throw error;

    if (!santriList || santriList.length === 0) {
      throw new Error('Tidak ada santri di kelas/asrama ini');
    }

    // 2. Generate batch ID
    const batchId = crypto.randomUUID();

    // 3. Generate rapor for each santri with delay to avoid rate limit
    const results = [];
    for (let i = 0; i < santriList.length; i++) {
      const santri = santriList[i];
      
      try {
        console.log(`📝 Generating rapor ${i + 1}/${santriList.length} for ${santri.nama_siswa}...`);
        
        const result = await generateSingleRapor({
          nis: santri.nis,
          cabang: params.cabang,
          tahunAjaran: params.tahunAjaran,
          semester: params.semester,
          kelas: params.kelas,
          asrama: params.asrama,
          accessToken: params.accessToken,
          refreshToken: params.refreshToken,
        });

        results.push({
          nis: santri.nis,
          nama_siswa: santri.nama_siswa,
          success: result.success,
          pdf_url: result.data?.pdf_url,
        });

        // Update batch_id in log
        await supabase
          .from('rapor_generate_log_keasramaan')
          .update({ batch_id: batchId })
          .eq('nis', santri.nis)
          .eq('tahun_ajaran', params.tahunAjaran)
          .eq('semester', params.semester)
          .order('generated_at', { ascending: false })
          .limit(1);

        // Add delay between generations to avoid rate limit (2 seconds)
        if (i < santriList.length - 1) {
          console.log('⏳ Waiting 2 seconds before next generation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error(`❌ Failed to generate for ${santri.nama_siswa}:`, error.message);
        results.push({
          nis: santri.nis,
          nama_siswa: santri.nama_siswa,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      message: `Batch generate selesai: ${successCount} berhasil, ${failedCount} gagal`,
      data: {
        batch_id: batchId,
        total: santriList.length,
        success: successCount,
        failed: failedCount,
        results,
      },
    };
  } catch (error: any) {
    console.error('Error in generateBatchRapor:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}
