/**
 * Data Fetcher for PDF Generation
 * 
 * This utility fetches all required data for generating rapor PDFs from builder templates.
 * It aggregates data from multiple sources: siswa, habit tracker, galeri kegiatan, school info, etc.
 */

import { supabase } from '@/lib/supabase';
import type {
  DataBindingSchemaType,
  SiswaData,
  HabitTrackerData,
  GalleryItem,
  SchoolData,
  PembinaData,
  KepalaSekolahData,
  PeriodeData,
  KategoriHabit,
  IndikatorDetail,
} from '@/types/rapor-builder';

/**
 * Fetch complete data for a student for PDF generation
 * 
 * @param siswaId - Student ID
 * @param periode - Academic period (tahun_ajaran, semester, bulan optional)
 * @returns Complete data binding schema with all required data
 */
export async function fetchRaporData(
  siswaId: string,
  periode: PeriodeData
): Promise<DataBindingSchemaType> {
  // Fetch all data in parallel for better performance
  const [siswaData, habitTrackerData, galeriData, schoolData, pembinaData, kepalaSekolahData] =
    await Promise.all([
      fetchSiswaData(siswaId),
      fetchHabitTrackerData(siswaId, periode),
      fetchGaleriKegiatan(siswaId, periode),
      fetchSchoolData(),
      fetchPembinaData(siswaId),
      fetchKepalaSekolahData(),
    ]);

  return {
    siswa: siswaData,
    habit_tracker: habitTrackerData,
    galeri_kegiatan: galeriData,
    school: schoolData,
    pembina: pembinaData,
    kepala_sekolah: kepalaSekolahData,
  };
}

/**
 * Fetch student data
 */
async function fetchSiswaData(siswaId: string): Promise<SiswaData> {
  const { data, error } = await supabase
    .from('data_siswa_keasramaan')
    .select('*')
    .eq('id', siswaId)
    .single();

  if (error) {
    console.error('Error fetching siswa data:', error);
    throw new Error(`Failed to fetch student data: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Student with ID ${siswaId} not found`);
  }

  return {
    id: data.id,
    nama: data.nama_siswa || '',
    nis: data.nis || '',
    kelas: data.kelas || '',
    asrama: data.asrama || '',
    cabang: data.lokasi || '',
    foto_url: data.foto || undefined,
  };
}

/**
 * Fetch and calculate habit tracker data with aggregates
 */
async function fetchHabitTrackerData(
  siswaId: string,
  periode: PeriodeData
): Promise<HabitTrackerData> {
  // Get student NIS first
  const { data: siswaData } = await supabase
    .from('data_siswa_keasramaan')
    .select('nis')
    .eq('id', siswaId)
    .single();

  if (!siswaData) {
    throw new Error('Student not found');
  }

  // Build query filters
  let query = supabase
    .from('formulir_habit_tracker_keasramaan')
    .select('*')
    .eq('nis', siswaData.nis)
    .eq('tahun_ajaran', periode.tahun_ajaran)
    .eq('semester', periode.semester.toString());

  // Add month filter if specified
  if (periode.bulan) {
    const startDate = new Date(
      parseInt(periode.tahun_ajaran.split('/')[0]),
      periode.bulan - 1,
      1
    );
    const endDate = new Date(
      parseInt(periode.tahun_ajaran.split('/')[0]),
      periode.bulan,
      0
    );

    query = query
      .gte('tanggal', startDate.toISOString().split('T')[0])
      .lte('tanggal', endDate.toISOString().split('T')[0]);
  }

  const { data: habitData, error } = await query;

  if (error) {
    console.error('Error fetching habit tracker data:', error);
    throw new Error(`Failed to fetch habit tracker data: ${error.message}`);
  }

  // If no data, return zeros
  if (!habitData || habitData.length === 0) {
    return createEmptyHabitTrackerData(periode);
  }

  // Calculate aggregates for each category
  const ubudiyah = await calculateKategoriAggregate(habitData, 'Ubudiyah');
  const akhlaq = await calculateKategoriAggregate(habitData, 'Akhlaq');
  const kedisiplinan = await calculateKategoriAggregate(habitData, 'Kedisiplinan');
  const kebersihan = await calculateKategoriAggregate(habitData, 'Kebersihan & Kerapian');

  // Calculate overall average
  const overall_average =
    (ubudiyah.average + akhlaq.average + kedisiplinan.average + kebersihan.average) / 4;
  const overall_percentage =
    (ubudiyah.percentage + akhlaq.percentage + kedisiplinan.percentage + kebersihan.percentage) / 4;

  return {
    periode,
    ubudiyah,
    akhlaq,
    kedisiplinan,
    kebersihan,
    overall_average: parseFloat(overall_average.toFixed(1)),
    overall_percentage: parseFloat(overall_percentage.toFixed(1)),
  };
}

/**
 * Calculate aggregate data for a habit tracker category
 */
async function calculateKategoriAggregate(
  habitData: any[],
  kategori: string
): Promise<KategoriHabit> {
  // Fetch indikator for this category
  const { data: indikatorData, error } = await supabase
    .from('indikator_keasramaan')
    .select('*')
    .eq('kategori', kategori);

  if (error || !indikatorData) {
    console.error('Error fetching indikator:', error);
    return {
      average: 0,
      percentage: 0,
      details: [],
    };
  }

  const details: IndikatorDetail[] = [];
  let totalNilai = 0;
  let totalMaxNilai = 0;

  for (const indikator of indikatorData) {
    // Map indikator name to field name in habit tracker
    const fieldName = mapIndikatorToField(indikator.nama_indikator);
    
    // Calculate average for this indikator across all records
    const values = habitData
      .map((record) => parseFloat(record[fieldName]))
      .filter((val) => !isNaN(val) && val > 0);

    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const maxNilai = indikator.nilai;
    const persentase = maxNilai > 0 ? (average / maxNilai) * 100 : 0;

    details.push({
      indikator: indikator.nama_indikator,
      nilai: parseFloat(average.toFixed(1)),
      persentase: parseFloat(persentase.toFixed(1)),
    });

    totalNilai += average;
    totalMaxNilai += maxNilai;
  }

  const categoryAverage = indikatorData.length > 0 ? totalNilai / indikatorData.length : 0;
  const categoryPercentage = totalMaxNilai > 0 ? (totalNilai / totalMaxNilai) * 100 : 0;

  return {
    average: parseFloat(categoryAverage.toFixed(1)),
    percentage: parseFloat(categoryPercentage.toFixed(1)),
    details,
  };
}

/**
 * Map indikator name to database field name
 */
function mapIndikatorToField(indikatorName: string): string {
  const mapping: Record<string, string> = {
    'Shalat Fardhu Berjamaah': 'shalat_fardhu_berjamaah',
    'Tata Cara Shalat': 'tata_cara_shalat',
    'Qiyamul Lail': 'qiyamul_lail',
    'Shalat Sunnah': 'shalat_sunnah',
    'Puasa Sunnah': 'puasa_sunnah',
    'Tata Cara Wudhu': 'tata_cara_wudhu',
    'Sedekah': 'sedekah',
    'Dzikir Pagi Petang': 'dzikir_pagi_petang',
    'Etika dalam Tutur Kata': 'etika_dalam_tutur_kata',
    'Etika dalam Bergaul': 'etika_dalam_bergaul',
    'Etika dalam Berpakaian': 'etika_dalam_berpakaian',
    'Adab Sehari-hari': 'adab_sehari_hari',
    'Waktu Tidur': 'waktu_tidur',
    'Pelaksanaan Piket Kamar': 'pelaksanaan_piket_kamar',
    'Disiplin Halaqah Tahfidz': 'disiplin_halaqah_tahfidz',
    'Perizinan': 'perizinan',
    'Belajar Malam': 'belajar_malam',
    'Disiplin Berangkat ke Masjid': 'disiplin_berangkat_ke_masjid',
    'Kebersihan Tubuh, Berpakaian, Berpenampilan': 'kebersihan_tubuh_berpakaian_berpenampilan',
    'Kamar': 'kamar',
    'Ranjang dan Almari': 'ranjang_dan_almari',
  };

  return mapping[indikatorName] || indikatorName.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Create empty habit tracker data structure
 */
function createEmptyHabitTrackerData(periode: PeriodeData): HabitTrackerData {
  const emptyKategori: KategoriHabit = {
    average: 0,
    percentage: 0,
    details: [],
  };

  return {
    periode,
    ubudiyah: emptyKategori,
    akhlaq: emptyKategori,
    kedisiplinan: emptyKategori,
    kebersihan: emptyKategori,
    overall_average: 0,
    overall_percentage: 0,
  };
}

/**
 * Fetch galeri kegiatan filtered by periode and student scope
 */
async function fetchGaleriKegiatan(
  siswaId: string,
  periode: PeriodeData
): Promise<GalleryItem[]> {
  // Get student data for filtering
  const { data: siswaData } = await supabase
    .from('data_siswa_keasramaan')
    .select('kelas, asrama, lokasi')
    .eq('id', siswaId)
    .single();

  if (!siswaData) {
    return [];
  }

  // Build query - assuming galeri_kegiatan table exists
  // Note: Adjust table name and fields based on actual schema
  let query = supabase
    .from('galeri_kegiatan_keasramaan')
    .select('*')
    .eq('tahun_ajaran', periode.tahun_ajaran)
    .eq('semester', periode.semester.toString())
    .order('tanggal', { ascending: false });

  // Filter by month if specified
  if (periode.bulan) {
    const startDate = new Date(
      parseInt(periode.tahun_ajaran.split('/')[0]),
      periode.bulan - 1,
      1
    );
    const endDate = new Date(
      parseInt(periode.tahun_ajaran.split('/')[0]),
      periode.bulan,
      0
    );

    query = query
      .gte('tanggal', startDate.toISOString().split('T')[0])
      .lte('tanggal', endDate.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching galeri kegiatan:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Map to GalleryItem format
  return data.map((item) => ({
    id: item.id,
    nama_kegiatan: item.nama_kegiatan || '',
    tanggal: item.tanggal || '',
    foto_url: item.foto_url || item.foto || '',
    caption: item.caption || item.deskripsi || undefined,
  }));
}

/**
 * Fetch school data
 */
async function fetchSchoolData(): Promise<SchoolData> {
  const { data, error } = await supabase
    .from('identitas_sekolah_keasramaan')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching school data:', error);
    // Return default values if not found
    return {
      nama: 'HSI Boarding School',
      logo_url: '',
      alamat: '',
      telepon: '',
      website: '',
    };
  }

  return {
    nama: data.nama_sekolah || 'HSI Boarding School',
    logo_url: data.logo || '',
    alamat: data.alamat || '',
    telepon: data.no_telepon || '',
    website: data.website || '',
  };
}

/**
 * Fetch pembina data for the student
 */
async function fetchPembinaData(siswaId: string): Promise<PembinaData> {
  // Get student's asrama first
  const { data: siswaData } = await supabase
    .from('data_siswa_keasramaan')
    .select('asrama, kepala_asrama')
    .eq('id', siswaId)
    .single();

  if (!siswaData) {
    return { nama: '', nip: '' };
  }

  // Try to get kepala asrama data
  const { data: kepasData } = await supabase
    .from('kepala_asrama_keasramaan')
    .select('*')
    .eq('nama', siswaData.kepala_asrama)
    .single();

  if (kepasData) {
    return {
      nama: kepasData.nama || '',
      nip: kepasData.nip || '',
    };
  }

  // Fallback to student's kepala_asrama field
  return {
    nama: siswaData.kepala_asrama || '',
    nip: '',
  };
}

/**
 * Fetch kepala sekolah data
 */
async function fetchKepalaSekolahData(): Promise<KepalaSekolahData> {
  const { data, error } = await supabase
    .from('identitas_sekolah_keasramaan')
    .select('nama_kepala_sekolah')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching kepala sekolah data:', error);
    return { nama: '', nip: '' };
  }

  return {
    nama: data.nama_kepala_sekolah || '',
    nip: '', // NIP not stored in current schema
  };
}

/**
 * Fetch sample data for preview (when no specific student is selected)
 */
export async function fetchSampleRaporData(periode: PeriodeData): Promise<DataBindingSchemaType> {
  // Get a random student for sample data
  const { data: students } = await supabase
    .from('data_siswa_keasramaan')
    .select('id')
    .limit(1);

  if (students && students.length > 0) {
    return fetchRaporData(students[0].id, periode);
  }

  // Return completely sample data if no students exist
  return {
    siswa: {
      id: 'sample-id',
      nama: 'Ahmad Fauzi',
      nis: '12345',
      kelas: 'X IPA 1',
      asrama: 'Al-Fatih',
      cabang: 'Pusat',
      foto_url: undefined,
    },
    habit_tracker: createEmptyHabitTrackerData(periode),
    galeri_kegiatan: [],
    school: {
      nama: 'HSI Boarding School',
      logo_url: '',
      alamat: 'Jl. Contoh No. 123',
      telepon: '021-12345678',
      website: 'www.hsiboarding.sch.id',
    },
    pembina: {
      nama: 'Ustadz Ahmad',
      nip: '123456',
    },
    kepala_sekolah: {
      nama: 'Dr. Muhammad Ali',
      nip: '654321',
    },
  };
}
