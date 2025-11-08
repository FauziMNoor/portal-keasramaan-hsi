import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

/**
 * POST /api/rapor/data/preview
 * Returns preview data for template with real or sample data
 * Request body: { siswaId?: string, periode: { tahun_ajaran: string, semester: number } }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaId, periode } = body;

    if (!periode || !periode.tahun_ajaran || !periode.semester) {
      return NextResponse.json(
        { error: 'Periode (tahun_ajaran dan semester) harus diisi' },
        { status: 400 }
      );
    }

    let data;

    if (siswaId) {
      // Fetch real data for specific student
      data = await fetchRealData(siswaId, periode);
    } else {
      // Return sample data
      data = getSampleData(periode);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Get preview data error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * Fetch real data for a specific student
 */
async function fetchRealData(siswaId: string, periode: any) {
  // Fetch siswa data
  const { data: siswaData, error: siswaError } = await supabase
    .from('data_siswa_keasramaan')
    .select('*')
    .eq('id', siswaId)
    .single();

  if (siswaError) throw new Error('Siswa tidak ditemukan');

  // Fetch habit tracker data
  const habitData = await fetchHabitTrackerData(siswaData.nis, periode);

  // Fetch galeri kegiatan
  const galeriData = await fetchGaleriKegiatan(siswaData, periode);

  // Fetch school data
  const schoolData = await fetchSchoolData();

  // Fetch pembina data (kepala asrama)
  const pembinaData = await fetchPembinaData(siswaData.asrama);

  return {
    siswa: {
      id: siswaData.id,
      nama: siswaData.nama_siswa,
      nis: siswaData.nis,
      kelas: siswaData.kelas || '',
      asrama: siswaData.asrama || '',
      cabang: siswaData.lokasi || '',
      foto_url: siswaData.foto || '',
    },
    habit_tracker: habitData,
    galeri_kegiatan: galeriData,
    school: schoolData,
    pembina: pembinaData,
    kepala_sekolah: schoolData.kepala_sekolah,
  };
}

/**
 * Fetch and calculate habit tracker data with aggregates
 */
async function fetchHabitTrackerData(nis: string, periode: any) {
  // Fetch habit tracker entries for the periode
  const { data: entries, error } = await supabase
    .from('formulir_habit_tracker_keasramaan')
    .select('*')
    .eq('nis', nis)
    .eq('tahun_ajaran', periode.tahun_ajaran)
    .eq('semester', periode.semester.toString());

  if (error) {
    console.error('Error fetching habit tracker:', error);
    return getDefaultHabitData(periode);
  }

  if (!entries || entries.length === 0) {
    return getDefaultHabitData(periode);
  }

  // Fetch indikator to get max values
  const { data: indikatorData } = await supabase
    .from('indikator_keasramaan')
    .select('*');

  const indikatorMap = new Map();
  if (indikatorData) {
    indikatorData.forEach((ind: any) => {
      indikatorMap.set(ind.nama_indikator, ind.nilai);
    });
  }

  // Calculate aggregates for each category
  const ubudiyah = calculateCategoryAggregate(entries, [
    'shalat_fardhu_berjamaah',
    'tata_cara_shalat',
    'qiyamul_lail',
    'shalat_sunnah',
    'puasa_sunnah',
    'tata_cara_wudhu',
    'sedekah',
    'dzikir_pagi_petang',
  ], indikatorMap);

  const akhlaq = calculateCategoryAggregate(entries, [
    'etika_dalam_tutur_kata',
    'etika_dalam_bergaul',
    'etika_dalam_berpakaian',
    'adab_sehari_hari',
  ], indikatorMap);

  const kedisiplinan = calculateCategoryAggregate(entries, [
    'waktu_tidur',
    'pelaksanaan_piket_kamar',
    'disiplin_halaqah_tahfidz',
    'perizinan',
    'belajar_malam',
    'disiplin_berangkat_ke_masjid',
  ], indikatorMap);

  const kebersihan = calculateCategoryAggregate(entries, [
    'kebersihan_tubuh_berpakaian_berpenampilan',
    'kamar',
    'ranjang_dan_almari',
  ], indikatorMap);

  // Calculate overall average
  const overall_average = (
    ubudiyah.average +
    akhlaq.average +
    kedisiplinan.average +
    kebersihan.average
  ) / 4;

  const overall_percentage = (
    ubudiyah.percentage +
    akhlaq.percentage +
    kedisiplinan.percentage +
    kebersihan.percentage
  ) / 4;

  return {
    periode: {
      tahun_ajaran: periode.tahun_ajaran,
      semester: periode.semester,
      bulan: periode.bulan,
    },
    ubudiyah,
    akhlaq,
    kedisiplinan,
    kebersihan,
    overall_average: Math.round(overall_average * 10) / 10,
    overall_percentage: Math.round(overall_percentage * 10) / 10,
  };
}

/**
 * Calculate aggregate for a category
 */
function calculateCategoryAggregate(entries: any[], fields: string[], indikatorMap: Map<string, number>) {
  const details: any[] = [];
  let totalNilai = 0;
  let totalMaxNilai = 0;
  let validFieldCount = 0;

  fields.forEach((field) => {
    const values = entries
      .map((entry) => parseFloat(entry[field]))
      .filter((val) => !isNaN(val));

    if (values.length > 0) {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Get max value from indikator (default to 5 if not found)
      const maxValue = indikatorMap.get(fieldToIndikatorName(field)) || 5;
      const percentage = (average / maxValue) * 100;

      details.push({
        indikator: fieldToIndikatorName(field),
        nilai: Math.round(average * 10) / 10,
        persentase: Math.round(percentage * 10) / 10,
      });

      totalNilai += average;
      totalMaxNilai += maxValue;
      validFieldCount++;
    }
  });

  const categoryAverage = validFieldCount > 0 ? totalNilai / validFieldCount : 0;
  const categoryMaxAverage = validFieldCount > 0 ? totalMaxNilai / validFieldCount : 5;
  const categoryPercentage = (categoryAverage / categoryMaxAverage) * 100;

  return {
    average: Math.round(categoryAverage * 10) / 10,
    percentage: Math.round(categoryPercentage * 10) / 10,
    details,
  };
}

/**
 * Convert field name to indikator name
 */
function fieldToIndikatorName(field: string): string {
  const mapping: Record<string, string> = {
    shalat_fardhu_berjamaah: 'Shalat Fardhu Berjamaah',
    tata_cara_shalat: 'Tata Cara Shalat',
    qiyamul_lail: 'Qiyamul Lail',
    shalat_sunnah: 'Shalat Sunnah',
    puasa_sunnah: 'Puasa Sunnah',
    tata_cara_wudhu: 'Tata Cara Wudhu',
    sedekah: 'Sedekah',
    dzikir_pagi_petang: 'Dzikir Pagi Petang',
    etika_dalam_tutur_kata: 'Etika dalam Tutur Kata',
    etika_dalam_bergaul: 'Etika dalam Bergaul',
    etika_dalam_berpakaian: 'Etika dalam Berpakaian',
    adab_sehari_hari: 'Adab Sehari-hari',
    waktu_tidur: 'Waktu Tidur',
    pelaksanaan_piket_kamar: 'Pelaksanaan Piket Kamar',
    disiplin_halaqah_tahfidz: 'Disiplin Halaqah Tahfidz',
    perizinan: 'Perizinan',
    belajar_malam: 'Belajar Malam',
    disiplin_berangkat_ke_masjid: 'Disiplin Berangkat ke Masjid',
    kebersihan_tubuh_berpakaian_berpenampilan: 'Kebersihan Tubuh, Berpakaian, Berpenampilan',
    kamar: 'Kamar',
    ranjang_dan_almari: 'Ranjang dan Almari',
  };
  return mapping[field] || field;
}

/**
 * Fetch galeri kegiatan filtered by periode and student scope
 */
async function fetchGaleriKegiatan(siswaData: any, periode: any) {
  // Fetch kegiatan for the periode
  const { data: kegiatanList, error: kegiatanError } = await supabase
    .from('kegiatan_asrama_keasramaan')
    .select('id, nama_kegiatan, tanggal_mulai, scope')
    .eq('tahun_ajaran', periode.tahun_ajaran)
    .eq('semester', periode.semester.toString())
    .order('tanggal_mulai', { ascending: false });

  if (kegiatanError || !kegiatanList || kegiatanList.length === 0) {
    return [];
  }

  // Filter kegiatan by scope (student's kelas, asrama, or seluruh_sekolah)
  const relevantKegiatan = kegiatanList.filter((k: any) => {
    if (k.scope === 'seluruh_sekolah') return true;
    if (k.scope === siswaData.kelas) return true;
    if (k.scope === siswaData.asrama) return true;
    return false;
  });

  if (relevantKegiatan.length === 0) {
    return [];
  }

  // Fetch galeri for these kegiatan
  const kegiatanIds = relevantKegiatan.map((k: any) => k.id);
  const { data: galeriList, error: galeriError } = await supabase
    .from('kegiatan_galeri_keasramaan')
    .select('*')
    .in('kegiatan_id', kegiatanIds)
    .order('created_at', { ascending: false })
    .limit(12);

  if (galeriError || !galeriList) {
    return [];
  }

  // Map to expected format
  return galeriList.map((item: any) => {
    const kegiatan = relevantKegiatan.find((k: any) => k.id === item.kegiatan_id);
    return {
      id: item.id,
      nama_kegiatan: kegiatan?.nama_kegiatan || '',
      tanggal: kegiatan?.tanggal_mulai || '',
      foto_url: item.foto_url,
      caption: item.caption || '',
    };
  });
}

/**
 * Fetch school data
 */
async function fetchSchoolData() {
  const { data, error } = await supabase
    .from('identitas_sekolah_keasramaan')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return {
      nama: 'HSI Boarding School',
      logo_url: '',
      alamat: '',
      telepon: '',
      website: '',
      kepala_sekolah: {
        nama: '',
        nip: '',
      },
    };
  }

  return {
    nama: data.nama_sekolah || '',
    logo_url: data.logo || '',
    alamat: data.alamat || '',
    telepon: data.no_telepon || '',
    website: data.website || '',
    kepala_sekolah: {
      nama: data.nama_kepala_sekolah || '',
      nip: '',
    },
  };
}

/**
 * Fetch pembina data (kepala asrama)
 */
async function fetchPembinaData(asrama: string) {
  const { data, error } = await supabase
    .from('kepala_asrama_keasramaan')
    .select('*')
    .eq('lokasi', asrama)
    .limit(1)
    .single();

  if (error || !data) {
    return {
      nama: '',
      nip: '',
    };
  }

  return {
    nama: data.nama || '',
    nip: '',
  };
}

/**
 * Get default habit data when no entries found
 */
function getDefaultHabitData(periode: any) {
  const defaultCategory = {
    average: 0,
    percentage: 0,
    details: [],
  };

  return {
    periode: {
      tahun_ajaran: periode.tahun_ajaran,
      semester: periode.semester,
      bulan: periode.bulan,
    },
    ubudiyah: defaultCategory,
    akhlaq: defaultCategory,
    kedisiplinan: defaultCategory,
    kebersihan: defaultCategory,
    overall_average: 0,
    overall_percentage: 0,
  };
}

/**
 * Get sample data for preview
 */
function getSampleData(periode: any) {
  return {
    siswa: {
      id: 'sample-id',
      nama: 'Ahmad Fauzi',
      nis: '2024001',
      kelas: 'X IPA 1',
      asrama: 'Asrama Putra A',
      cabang: 'Jakarta',
      foto_url: '',
    },
    habit_tracker: {
      periode: {
        tahun_ajaran: periode.tahun_ajaran,
        semester: periode.semester,
        bulan: periode.bulan,
      },
      ubudiyah: {
        average: 2.8,
        percentage: 93.3,
        details: [
          { indikator: 'Shalat Fardhu Berjamaah', nilai: 3, persentase: 100 },
          { indikator: 'Tata Cara Shalat', nilai: 3, persentase: 100 },
          { indikator: 'Qiyamul Lail', nilai: 2.5, persentase: 83.3 },
          { indikator: 'Shalat Sunnah', nilai: 2.8, persentase: 93.3 },
          { indikator: 'Puasa Sunnah', nilai: 4, persentase: 80 },
          { indikator: 'Tata Cara Wudhu', nilai: 3, persentase: 100 },
          { indikator: 'Sedekah', nilai: 3, persentase: 75 },
          { indikator: 'Dzikir Pagi Petang', nilai: 3.5, persentase: 87.5 },
        ],
      },
      akhlaq: {
        average: 2.9,
        percentage: 96.7,
        details: [
          { indikator: 'Etika dalam Tutur Kata', nilai: 3, persentase: 100 },
          { indikator: 'Etika dalam Bergaul', nilai: 2.8, persentase: 93.3 },
          { indikator: 'Etika dalam Berpakaian', nilai: 3, persentase: 100 },
          { indikator: 'Adab Sehari-hari', nilai: 2.8, persentase: 93.3 },
        ],
      },
      kedisiplinan: {
        average: 3.2,
        percentage: 85.3,
        details: [
          { indikator: 'Waktu Tidur', nilai: 3, persentase: 75 },
          { indikator: 'Pelaksanaan Piket Kamar', nilai: 3, persentase: 100 },
          { indikator: 'Disiplin Halaqah Tahfidz', nilai: 3, persentase: 100 },
          { indikator: 'Perizinan', nilai: 3, persentase: 100 },
          { indikator: 'Belajar Malam', nilai: 3.5, persentase: 87.5 },
          { indikator: 'Disiplin Berangkat ke Masjid', nilai: 3.5, persentase: 87.5 },
        ],
      },
      kebersihan: {
        average: 2.7,
        percentage: 90,
        details: [
          { indikator: 'Kebersihan Tubuh, Berpakaian, Berpenampilan', nilai: 3, persentase: 100 },
          { indikator: 'Kamar', nilai: 2.5, persentase: 83.3 },
          { indikator: 'Ranjang dan Almari', nilai: 2.5, persentase: 83.3 },
        ],
      },
      overall_average: 2.9,
      overall_percentage: 91.3,
    },
    galeri_kegiatan: [
      {
        id: 'sample-1',
        nama_kegiatan: 'Kegiatan Pramuka',
        tanggal: '2024-01-15',
        foto_url: 'https://via.placeholder.com/400x300',
        caption: 'Kegiatan pramuka bulanan',
      },
      {
        id: 'sample-2',
        nama_kegiatan: 'Olahraga Bersama',
        tanggal: '2024-01-20',
        foto_url: 'https://via.placeholder.com/400x300',
        caption: 'Olahraga rutin setiap minggu',
      },
      {
        id: 'sample-3',
        nama_kegiatan: 'Kajian Kitab',
        tanggal: '2024-01-25',
        foto_url: 'https://via.placeholder.com/400x300',
        caption: 'Kajian kitab kuning',
      },
    ],
    school: {
      nama: 'HSI Boarding School',
      logo_url: '',
      alamat: 'Jl. Pendidikan No. 123, Jakarta',
      telepon: '021-12345678',
      website: 'www.hsiboardingschool.sch.id',
    },
    pembina: {
      nama: 'Ustadz Muhammad Ali',
      nip: '198501012010011001',
    },
    kepala_sekolah: {
      nama: 'Dr. Abdullah Rahman, M.Pd',
      nip: '197501012000011001',
    },
  };
}
