import { supabase } from './supabase';

// =====================================================
// REKAP HABIT TRACKER
// =====================================================
export async function rekapHabitTracker(
  nis: string,
  tahunAjaran: string,
  semester: string
) {
  try {
    // 1. Fetch all habit tracker entries for this santri in this semester
    const { data: habitData, error } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('*')
      .eq('nis', nis)
      .eq('tahun_ajaran', tahunAjaran)
      .eq('semester', semester);

    if (error) throw error;

    if (!habitData || habitData.length === 0) {
      return {
        success: false,
        message: 'Tidak ada data habit tracker untuk santri ini',
      };
    }

    // 2. Calculate average for each habit
    const habitFields = [
      'shalat_fardhu_berjamaah',
      'tata_cara_shalat',
      'qiyamul_lail',
      'shalat_sunnah',
      'puasa_sunnah',
      'tata_cara_wudhu',
      'sedekah',
      'dzikir_pagi_petang',
      'etika_dalam_tutur_kata',
      'etika_dalam_bergaul',
      'etika_dalam_berpakaian',
      'adab_sehari_hari',
      'waktu_tidur',
      'pelaksanaan_piket_kamar',
      'disiplin_halaqah_tahfidz',
      'perizinan',
      'belajar_malam',
      'disiplin_berangkat_ke_masjid',
      'kebersihan_tubuh_berpakaian_berpenampilan',
      'kamar',
      'ranjang_dan_almari',
    ];

    const averages: any = {};

    habitFields.forEach((field) => {
      const values = habitData
        .map((entry) => {
          const val = entry[field];
          // Convert to number
          if (typeof val === 'string') {
            return parseInt(val, 10);
          }
          return val;
        })
        .filter((v) => !isNaN(v) && v !== null && v !== undefined);

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        // Round to nearest integer
        averages[field] = Math.round(avg);
      } else {
        averages[field] = 0;
      }
    });

    // 3. Fetch indikator for mapping
    const { data: indikatorData } = await supabase
      .from('indikator_keasramaan')
      .select('*');

    // 4. Map averages to deskripsi
    const result: any = {
      nis,
      nama_siswa: habitData[0].nama_siswa,
      total_entry: habitData.length,
      periode_mulai: habitData[0].tanggal,
      periode_selesai: habitData[habitData.length - 1].tanggal,
    };

    habitFields.forEach((field) => {
      const nilai = averages[field];
      result[`${field}_nilai`] = nilai;

      // Find matching indikator
      const indikator = indikatorData?.find((ind) => {
        const fieldName = ind.nama_indikator
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/,/g, '')
          .replace(/&/g, '')
          .replace(/-/g, '_')
          .replace(/__+/g, '_');
        return fieldName === field && ind.nilai_angka === nilai;
      });

      result[`${field}_deskripsi`] = indikator?.deskripsi || `Nilai: ${nilai}`;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Error in rekapHabitTracker:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// FETCH DATA SANTRI
// =====================================================
export async function fetchDataSantri(nis: string) {
  try {
    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .eq('nis', nis)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// FETCH KEGIATAN RAPOR
// =====================================================
export async function fetchKegiatanRapor(
  cabang: string,
  tahunAjaran: string,
  semester: string,
  kelas: string,
  asrama: string
) {
  try {
    // Try to fetch kegiatan for specific asrama first
    let { data, error } = await supabase
      .from('rapor_kegiatan_keasramaan')
      .select('*')
      .eq('cabang', cabang)
      .eq('tahun_ajaran', tahunAjaran)
      .eq('semester', semester)
      .eq('kelas', kelas)
      .eq('asrama', asrama)
      .order('urutan');

    // If no data found, try to fetch with asrama = 'Semua'
    if (!data || data.length === 0) {
      const result = await supabase
        .from('rapor_kegiatan_keasramaan')
        .select('*')
        .eq('cabang', cabang)
        .eq('tahun_ajaran', tahunAjaran)
        .eq('semester', semester)
        .eq('kelas', kelas)
        .eq('asrama', 'Semua')
        .order('urutan');
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// FETCH DOKUMENTASI RAPOR
// =====================================================
export async function fetchDokumentasiRapor(
  cabang: string,
  tahunAjaran: string,
  semester: string,
  kelas: string,
  asrama: string
) {
  try {
    // Try to fetch dokumentasi for specific asrama first
    let { data, error } = await supabase
      .from('rapor_dokumentasi_lainnya_keasramaan')
      .select('*')
      .eq('cabang', cabang)
      .eq('tahun_ajaran', tahunAjaran)
      .eq('semester', semester)
      .eq('kelas', kelas)
      .eq('asrama', asrama)
      .order('urutan');

    // If no data found, try to fetch with asrama = 'Semua'
    if (!data || data.length === 0) {
      const result = await supabase
        .from('rapor_dokumentasi_lainnya_keasramaan')
        .select('*')
        .eq('cabang', cabang)
        .eq('tahun_ajaran', tahunAjaran)
        .eq('semester', semester)
        .eq('kelas', kelas)
        .eq('asrama', 'Semua')
        .order('urutan');
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// FETCH CATATAN RAPOR
// =====================================================
export async function fetchCatatanRapor(
  nis: string,
  tahunAjaran: string,
  semester: string
) {
  try {
    const { data, error } = await supabase
      .from('rapor_catatan_keasramaan')
      .select('*')
      .eq('nis', nis)
      .eq('tahun_ajaran', tahunAjaran)
      .eq('semester', semester)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return {
      success: true,
      data: data || null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// COMPILE ALL DATA FOR RAPOR
// =====================================================
export async function compileRaporData(params: {
  nis: string;
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
}) {
  try {
    // 1. Fetch santri data
    const santriResult = await fetchDataSantri(params.nis);
    if (!santriResult.success) {
      throw new Error('Data santri tidak ditemukan');
    }

    // 2. Rekap habit tracker
    const habitResult = await rekapHabitTracker(
      params.nis,
      params.tahunAjaran,
      params.semester
    );
    
    // If no habit tracker data, use empty/default values
    let habitData = habitResult.data;
    if (!habitResult.success) {
      console.warn('No habit tracker data found, using defaults');
      habitData = {
        nis: params.nis,
        nama_siswa: santriResult.data.nama_siswa,
        total_entry: 0,
        // Set all habit values to 0 and deskripsi to '-'
        shalat_fardhu_berjamaah_nilai: 0,
        shalat_fardhu_berjamaah_deskripsi: '-',
        tata_cara_shalat_nilai: 0,
        tata_cara_shalat_deskripsi: '-',
        qiyamul_lail_nilai: 0,
        qiyamul_lail_deskripsi: '-',
        shalat_sunnah_nilai: 0,
        shalat_sunnah_deskripsi: '-',
        puasa_sunnah_nilai: 0,
        puasa_sunnah_deskripsi: '-',
        tata_cara_wudhu_nilai: 0,
        tata_cara_wudhu_deskripsi: '-',
        sedekah_nilai: 0,
        sedekah_deskripsi: '-',
        dzikir_pagi_petang_nilai: 0,
        dzikir_pagi_petang_deskripsi: '-',
        etika_dalam_tutur_kata_nilai: 0,
        etika_dalam_tutur_kata_deskripsi: '-',
        etika_dalam_bergaul_nilai: 0,
        etika_dalam_bergaul_deskripsi: '-',
        etika_dalam_berpakaian_nilai: 0,
        etika_dalam_berpakaian_deskripsi: '-',
        adab_sehari_hari_nilai: 0,
        adab_sehari_hari_deskripsi: '-',
        waktu_tidur_nilai: 0,
        waktu_tidur_deskripsi: '-',
        pelaksanaan_piket_kamar_nilai: 0,
        pelaksanaan_piket_kamar_deskripsi: '-',
        disiplin_halaqah_tahfidz_nilai: 0,
        disiplin_halaqah_tahfidz_deskripsi: '-',
        perizinan_nilai: 0,
        perizinan_deskripsi: '-',
        belajar_malam_nilai: 0,
        belajar_malam_deskripsi: '-',
        disiplin_berangkat_ke_masjid_nilai: 0,
        disiplin_berangkat_ke_masjid_deskripsi: '-',
        kebersihan_tubuh_berpakaian_berpenampilan_nilai: 0,
        kebersihan_tubuh_berpakaian_berpenampilan_deskripsi: '-',
        kamar_nilai: 0,
        kamar_deskripsi: '-',
        ranjang_dan_almari_nilai: 0,
        ranjang_dan_almari_deskripsi: '-',
      };
    }

    // 3. Fetch kegiatan
    const kegiatanResult = await fetchKegiatanRapor(
      params.cabang,
      params.tahunAjaran,
      params.semester,
      params.kelas,
      params.asrama
    );

    // 4. Fetch dokumentasi
    const dokumentasiResult = await fetchDokumentasiRapor(
      params.cabang,
      params.tahunAjaran,
      params.semester,
      params.kelas,
      params.asrama
    );

    // 5. Fetch catatan
    const catatanResult = await fetchCatatanRapor(
      params.nis,
      params.tahunAjaran,
      params.semester
    );

    return {
      success: true,
      data: {
        santri: santriResult.data,
        habit: habitData,
        kegiatan: kegiatanResult.data,
        dokumentasi: dokumentasiResult.data,
        catatan: catatanResult.data,
      },
    };
  } catch (error: any) {
    console.error('Error in compileRaporData:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}
