/**
 * KPI Calculation Engine
 * 
 * This module contains all calculation functions for KPI Musyrif & Kepala Asrama
 * 
 * KPI Structure:
 * - Tier 1 (50%): Output - Hasil pembinaan santri
 * - Tier 2 (30%): Administrasi - Jurnal, Habit Tracker, Koordinasi, Catatan
 * - Tier 3 (20%): Proses - Completion Rate, Kehadiran, Engagement
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HariKerjaResult {
  total_hari: number;
  hari_libur: number;
  hari_kerja_efektif: number;
  libur_details: Array<{
    tanggal_mulai: string;
    tanggal_selesai: string;
    jenis_libur: string;
  }>;
}

export interface Tier1Result {
  ubudiyah: number;
  akhlaq: number;
  kedisiplinan: number;
  kebersihan: number;
  total_tier1: number;
  breakdown: {
    ubudiyah_weight: number;
    akhlaq_weight: number;
    kedisiplinan_weight: number;
    kebersihan_weight: number;
  };
}

export interface Tier2Result {
  jurnal: number;
  habit_tracker: number;
  koordinasi: number;
  catatan_perilaku: number;
  total_tier2: number;
  breakdown: {
    jurnal_weight: number;
    habit_tracker_weight: number;
    koordinasi_weight: number;
    catatan_perilaku_weight: number;
  };
  koordinasi_detail: {
    kehadiran_rapat: number;
    responsiveness: number;
    inisiatif_kolaborasi: number;
  };
}

export interface Tier3Result {
  completion_rate: number;
  kehadiran: number;
  engagement: number;
  total_tier3: number;
  breakdown: {
    completion_rate_weight: number;
    kehadiran_weight: number;
    engagement_weight: number;
  };
}

export interface KPIResult {
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  periode: string;
  hari_kerja_efektif: number;
  tier1: Tier1Result;
  tier2: Tier2Result;
  tier3: Tier3Result;
  total_score: number;
  ranking: number | null;
}


// ============================================================================
// HELPER FUNCTION: GET HARI KERJA EFEKTIF
// ============================================================================

/**
 * Calculate hari kerja efektif (exclude hari libur)
 * 
 * @param nama_musyrif - Nama musyrif
 * @param cabang - Cabang
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @returns HariKerjaResult
 */
export async function getHariKerjaEfektif(
  nama_musyrif: string,
  cabang: string,
  bulan: number,
  tahun: number
): Promise<HariKerjaResult> {
  // Calculate total days in month
  const totalHari = new Date(tahun, bulan, 0).getDate();

  // Get jadwal libur for this musyrif in this period
  const startDate = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
  const endDate = `${tahun}-${bulan.toString().padStart(2, '0')}-${totalHari.toString().padStart(2, '0')}`;

  const { data: jadwalLibur, error } = await supabase
    .from('jadwal_libur_musyrif_keasramaan')
    .select('tanggal_mulai, tanggal_selesai, jenis_libur')
    .eq('nama_musyrif', nama_musyrif)
    .eq('cabang', cabang)
    .gte('tanggal_mulai', startDate)
    .lte('tanggal_selesai', endDate)
    .in('status', ['approved_kepala_sekolah']); // Only approved

  if (error) {
    console.error('Error fetching jadwal libur:', error);
    return {
      total_hari: totalHari,
      hari_libur: 0,
      hari_kerja_efektif: totalHari,
      libur_details: [],
    };
  }

  // Calculate total hari libur
  let hariLibur = 0;
  const liburDetails: Array<{ tanggal_mulai: string; tanggal_selesai: string; jenis_libur: string }> = [];

  if (jadwalLibur && jadwalLibur.length > 0) {
    jadwalLibur.forEach((libur) => {
      const start = new Date(libur.tanggal_mulai);
      const end = new Date(libur.tanggal_selesai);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      hariLibur += diffDays;
      liburDetails.push({
        tanggal_mulai: libur.tanggal_mulai,
        tanggal_selesai: libur.tanggal_selesai,
        jenis_libur: libur.jenis_libur,
      });
    });
  }

  const hariKerjaEfektif = totalHari - hariLibur;

  return {
    total_hari: totalHari,
    hari_libur: hariLibur,
    hari_kerja_efektif: hariKerjaEfektif,
    libur_details: liburDetails,
  };
}


// ============================================================================
// TIER 1: OUTPUT (50%)
// ============================================================================

/**
 * Calculate Tier 1 - Output (Hasil pembinaan santri)
 * 
 * Breakdown:
 * - Ubudiyah: 25% (target 98%)
 * - Akhlaq: 10% (target 95%)
 * - Kedisiplinan: 10% (target 95%)
 * - Kebersihan: 5% (target 95%)
 * 
 * @param nama_musyrif - Nama musyrif
 * @param cabang - Cabang
 * @param asrama - Asrama
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @param hariKerjaEfektif - Hari kerja efektif
 * @returns Tier1Result
 */
export async function calculateTier1Output(
  nama_musyrif: string,
  cabang: string,
  asrama: string,
  bulan: number,
  tahun: number,
  hariKerjaEfektif: number
): Promise<Tier1Result> {
  // Get habit tracker data for this asrama in this period
  const startDate = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
  const totalHari = new Date(tahun, bulan, 0).getDate();
  const endDate = `${tahun}-${bulan.toString().padStart(2, '0')}-${totalHari.toString().padStart(2, '0')}`;

  const { data: habitData, error } = await supabase
    .from('formulir_habit_tracker_keasramaan')
    .select(`
      shalat_fardhu_berjamaah, tata_cara_shalat, qiyamul_lail, shalat_sunnah, 
      puasa_sunnah, tata_cara_wudhu, sedekah, dzikir_pagi_petang,
      etika_dalam_tutur_kata, etika_dalam_bergaul, etika_dalam_berpakaian, adab_sehari_hari,
      waktu_tidur, pelaksanaan_piket_kamar, disiplin_halaqah_tahfidz, perizinan, 
      belajar_malam, disiplin_berangkat_ke_masjid,
      kebersihan_tubuh_berpakaian_berpenampilan, kamar, ranjang_dan_almari
    `)
    .eq('cabang', cabang)
    .eq('asrama', asrama)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  if (error || !habitData || habitData.length === 0) {
    // No data, return 0
    return {
      ubudiyah: 0,
      akhlaq: 0,
      kedisiplinan: 0,
      kebersihan: 0,
      total_tier1: 0,
      breakdown: {
        ubudiyah_weight: 0,
        akhlaq_weight: 0,
        kedisiplinan_weight: 0,
        kebersihan_weight: 0,
      },
    };
  }

  // Helper function to convert text values to numeric (assuming "Baik"=3, "Cukup"=2, "Kurang"=1)
  const scoreMap: Record<string, number> = {
    'Baik': 3,
    'Cukup': 2,
    'Kurang': 1,
    'baik': 3,
    'cukup': 2,
    'kurang': 1,
  };
  
  const getScore = (value: string | null): number => {
    if (!value) return 0;
    return scoreMap[value] || 0;
  };

  // Calculate average for each category
  const totalRecords = habitData.length;
  
  // UBUDIYAH: 8 indicators
  const ubudiyahIndicators = habitData.map(item => [
    getScore(item.shalat_fardhu_berjamaah),
    getScore(item.tata_cara_shalat),
    getScore(item.qiyamul_lail),
    getScore(item.shalat_sunnah),
    getScore(item.puasa_sunnah),
    getScore(item.tata_cara_wudhu),
    getScore(item.sedekah),
    getScore(item.dzikir_pagi_petang),
  ]);
  const avgUbudiyah = ubudiyahIndicators.reduce((sum, scores) => 
    sum + scores.reduce((a, b) => a + b, 0) / scores.length, 0) / totalRecords;

  // AKHLAQ: 4 indicators
  const akhlaqIndicators = habitData.map(item => [
    getScore(item.etika_dalam_tutur_kata),
    getScore(item.etika_dalam_bergaul),
    getScore(item.etika_dalam_berpakaian),
    getScore(item.adab_sehari_hari),
  ]);
  const avgAkhlaq = akhlaqIndicators.reduce((sum, scores) => 
    sum + scores.reduce((a, b) => a + b, 0) / scores.length, 0) / totalRecords;

  // KEDISIPLINAN: 6 indicators
  const kedisiplinanIndicators = habitData.map(item => [
    getScore(item.waktu_tidur),
    getScore(item.pelaksanaan_piket_kamar),
    getScore(item.disiplin_halaqah_tahfidz),
    getScore(item.perizinan),
    getScore(item.belajar_malam),
    getScore(item.disiplin_berangkat_ke_masjid),
  ]);
  const avgKedisiplinan = kedisiplinanIndicators.reduce((sum, scores) => 
    sum + scores.reduce((a, b) => a + b, 0) / scores.length, 0) / totalRecords;

  // KEBERSIHAN: 3 indicators
  const kebersihanIndicators = habitData.map(item => [
    getScore(item.kebersihan_tubuh_berpakaian_berpenampilan),
    getScore(item.kamar),
    getScore(item.ranjang_dan_almari),
  ]);
  const avgKebersihan = kebersihanIndicators.reduce((sum, scores) => 
    sum + scores.reduce((a, b) => a + b, 0) / scores.length, 0) / totalRecords;

  // Calculate score (actual / max * 100)
  // Max score is 3 (Baik), target is 2.8 (93%)
  const maxScore = 3;
  const targetScore = 2.8; // 93% dari max

  const scoreUbudiyah = Math.min((avgUbudiyah / maxScore) * 100, 100);
  const scoreAkhlaq = Math.min((avgAkhlaq / maxScore) * 100, 100);
  const scoreKedisiplinan = Math.min((avgKedisiplinan / maxScore) * 100, 100);
  const scoreKebersihan = Math.min((avgKebersihan / maxScore) * 100, 100);

  // Calculate weighted score
  const weightUbudiyah = 0.25; // 25%
  const weightAkhlaq = 0.10; // 10%
  const weightKedisiplinan = 0.10; // 10%
  const weightKebersihan = 0.05; // 5%

  const weightedUbudiyah = scoreUbudiyah * weightUbudiyah;
  const weightedAkhlaq = scoreAkhlaq * weightAkhlaq;
  const weightedKedisiplinan = scoreKedisiplinan * weightKedisiplinan;
  const weightedKebersihan = scoreKebersihan * weightKebersihan;

  const totalTier1 = weightedUbudiyah + weightedAkhlaq + weightedKedisiplinan + weightedKebersihan;

  return {
    ubudiyah: Math.round(scoreUbudiyah * 100) / 100,
    akhlaq: Math.round(scoreAkhlaq * 100) / 100,
    kedisiplinan: Math.round(scoreKedisiplinan * 100) / 100,
    kebersihan: Math.round(scoreKebersihan * 100) / 100,
    total_tier1: Math.round(totalTier1 * 100) / 100,
    breakdown: {
      ubudiyah_weight: Math.round(weightedUbudiyah * 100) / 100,
      akhlaq_weight: Math.round(weightedAkhlaq * 100) / 100,
      kedisiplinan_weight: Math.round(weightedKedisiplinan * 100) / 100,
      kebersihan_weight: Math.round(weightedKebersihan * 100) / 100,
    },
  };
}


// ============================================================================
// TIER 2: ADMINISTRASI (30%)
// ============================================================================

/**
 * Calculate Tier 2 - Administrasi
 * 
 * Breakdown:
 * - Jurnal: 10% (target 100%)
 * - Habit Tracker: 10% (target 100%)
 * - Koordinasi: 5%
 *   - Kehadiran Rapat: 40%
 *   - Responsiveness: 30%
 *   - Inisiatif Kolaborasi: 30%
 * - Catatan Perilaku: 5% (target sesuai kebutuhan)
 * 
 * @param nama_musyrif - Nama musyrif
 * @param cabang - Cabang
 * @param asrama - Asrama
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @param hariKerjaEfektif - Hari kerja efektif
 * @returns Tier2Result
 */
export async function calculateTier2Administrasi(
  nama_musyrif: string,
  cabang: string,
  asrama: string,
  bulan: number,
  tahun: number,
  hariKerjaEfektif: number
): Promise<Tier2Result> {
  const startDate = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
  const totalHari = new Date(tahun, bulan, 0).getDate();
  const endDate = `${tahun}-${bulan.toString().padStart(2, '0')}-${totalHari.toString().padStart(2, '0')}`;

  // 1. JURNAL MUSYRIF (10%)
  // Count days where musyrif input jurnal (at least 1 entry per day)
  const { data: jurnalData } = await supabase
    .from('formulir_jurnal_musyrif_keasramaan')
    .select('tanggal')
    .eq('nama_musyrif', nama_musyrif)
    .eq('cabang', cabang)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  // Count unique days with jurnal entries
  const uniqueDays = new Set(jurnalData?.map(j => j.tanggal) || []);
  const jumlahHariInput = uniqueDays.size;
  const scoreJurnal = hariKerjaEfektif > 0 ? Math.min((jumlahHariInput / hariKerjaEfektif) * 100, 100) : 0;

  // 2. HABIT TRACKER (10%)
  // Count unique days with habit tracker entries
  // NOTE: Habit tracker diinput setiap Jumat (mingguan), bukan harian
  const { data: habitData } = await supabase
    .from('formulir_habit_tracker_keasramaan')
    .select('tanggal')
    .eq('cabang', cabang)
    .eq('asrama', asrama)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const uniqueHabitDays = new Set(habitData?.map(h => h.tanggal) || []);
  const jumlahHariHabit = uniqueHabitDays.size;
  
  // Calculate expected weeks in the month (approximately 4-5 weeks)
  const totalWeeks = Math.ceil(totalHari / 7);
  const targetHabitInput = totalWeeks; // Target: 1x per week
  
  // Score based on weekly target, not daily
  const scoreHabit = targetHabitInput > 0 ? Math.min((jumlahHariHabit / targetHabitInput) * 100, 100) : 0;

  // 3. KOORDINASI (5%)
  // 3a. Kehadiran Rapat (40%)
  const { data: rapatData } = await supabase
    .from('rapat_koordinasi_keasramaan')
    .select('id')
    .eq('cabang', cabang)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const totalRapat = rapatData?.length || 0;

  const { data: kehadiranData } = await supabase
    .from('kehadiran_rapat_keasramaan')
    .select('rapat_id, status_kehadiran')
    .eq('nama_musyrif', nama_musyrif)
    .in('rapat_id', rapatData?.map(r => r.id) || []);

  const jumlahHadir = kehadiranData?.filter(k => k.status_kehadiran === 'hadir').length || 0;
  const scoreKehadiranRapat = totalRapat > 0 ? (jumlahHadir / totalRapat) * 100 : 0;

  // 3b. Responsiveness (30%) - Manual input (default 80%)
  const scoreResponsiveness = 80; // TODO: Implement manual input

  // 3c. Inisiatif Kolaborasi (30%)
  const { data: kolaborasiData } = await supabase
    .from('log_kolaborasi_keasramaan')
    .select('rating_kepala_asrama')
    .eq('nama_musyrif', nama_musyrif)
    .eq('cabang', cabang)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)
    .not('rating_kepala_asrama', 'is', null);

  const totalKolaborasi = kolaborasiData?.length || 0;
  const avgRating = totalKolaborasi > 0
    ? kolaborasiData.reduce((sum, item) => sum + (item.rating_kepala_asrama || 0), 0) / totalKolaborasi
    : 0;
  const scoreInisiatifKolaborasi = (avgRating / 5) * 100;

  // Calculate Koordinasi score
  const scoreKoordinasi = (
    scoreKehadiranRapat * 0.40 +
    scoreResponsiveness * 0.30 +
    scoreInisiatifKolaborasi * 0.30
  );

  // 4. CATATAN PERILAKU (5%)
  const { data: catatanData } = await supabase
    .from('catatan_perilaku_santri')
    .select('id')
    .eq('nama_musyrif', nama_musyrif)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const jumlahCatatan = catatanData?.length || 0;
  const targetCatatan = 10; // Target 10 catatan per bulan
  const scoreCatatan = Math.min((jumlahCatatan / targetCatatan) * 100, 100);

  // Calculate weighted score
  const weightJurnal = 0.10; // 10%
  const weightHabit = 0.10; // 10%
  const weightKoordinasi = 0.05; // 5%
  const weightCatatan = 0.05; // 5%

  const weightedJurnal = scoreJurnal * weightJurnal;
  const weightedHabit = scoreHabit * weightHabit;
  const weightedKoordinasi = scoreKoordinasi * weightKoordinasi;
  const weightedCatatan = scoreCatatan * weightCatatan;

  const totalTier2 = weightedJurnal + weightedHabit + weightedKoordinasi + weightedCatatan;

  return {
    jurnal: Math.round(scoreJurnal * 100) / 100,
    habit_tracker: Math.round(scoreHabit * 100) / 100,
    koordinasi: Math.round(scoreKoordinasi * 100) / 100,
    catatan_perilaku: Math.round(scoreCatatan * 100) / 100,
    total_tier2: Math.round(totalTier2 * 100) / 100,
    breakdown: {
      jurnal_weight: Math.round(weightedJurnal * 100) / 100,
      habit_tracker_weight: Math.round(weightedHabit * 100) / 100,
      koordinasi_weight: Math.round(weightedKoordinasi * 100) / 100,
      catatan_perilaku_weight: Math.round(weightedCatatan * 100) / 100,
    },
    koordinasi_detail: {
      kehadiran_rapat: Math.round(scoreKehadiranRapat * 100) / 100,
      responsiveness: Math.round(scoreResponsiveness * 100) / 100,
      inisiatif_kolaborasi: Math.round(scoreInisiatifKolaborasi * 100) / 100,
    },
  };
}


// ============================================================================
// TIER 3: PROSES (20%)
// ============================================================================

/**
 * Calculate Tier 3 - Proses
 * 
 * Breakdown:
 * - Completion Rate: 10% (jurnal + habit tracker completion)
 * - Kehadiran: 5% (kehadiran di asrama, exclude libur)
 * - Engagement: 5% (partisipasi dalam kegiatan)
 * 
 * @param nama_musyrif - Nama musyrif
 * @param cabang - Cabang
 * @param asrama - Asrama
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @param hariKerjaEfektif - Hari kerja efektif
 * @returns Tier3Result
 */
export async function calculateTier3Proses(
  nama_musyrif: string,
  cabang: string,
  asrama: string,
  bulan: number,
  tahun: number,
  hariKerjaEfektif: number
): Promise<Tier3Result> {
  const startDate = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
  const totalHari = new Date(tahun, bulan, 0).getDate();
  const endDate = `${tahun}-${bulan.toString().padStart(2, '0')}-${totalHari.toString().padStart(2, '0')}`;

  // 1. COMPLETION RATE (10%)
  // Based on status_terlaksana from formulir jurnal
  const { data: jurnalData } = await supabase
    .from('formulir_jurnal_musyrif_keasramaan')
    .select('status_terlaksana, tanggal')
    .eq('nama_musyrif', nama_musyrif)
    .eq('cabang', cabang)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const totalKegiatan = jurnalData?.length || 0;
  const kegiatanTerlaksana = jurnalData?.filter(j => j.status_terlaksana).length || 0;
  const jurnalCompletion = totalKegiatan > 0 ? (kegiatanTerlaksana / totalKegiatan) * 100 : 0;

  const { data: habitData } = await supabase
    .from('formulir_habit_tracker_keasramaan')
    .select('tanggal')
    .eq('cabang', cabang)
    .eq('asrama', asrama)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const uniqueHabitDays = new Set(habitData?.map(h => h.tanggal) || []);
  
  // Calculate expected weeks in the month (approximately 4-5 weeks)
  const totalWeeks = Math.ceil(totalHari / 7);
  const targetHabitInput = totalWeeks; // Target: 1x per week
  
  // Habit completion based on weekly target
  const habitCompletion = targetHabitInput > 0 ? Math.min((uniqueHabitDays.size / targetHabitInput) * 100, 100) : 0;
  const scoreCompletionRate = (jurnalCompletion + habitCompletion) / 2;

  // 2. KEHADIRAN (5%)
  // Assume 100% kehadiran (exclude hari libur)
  // TODO: Implement actual kehadiran tracking
  const scoreKehadiran = 100;

  // 3. ENGAGEMENT (5%)
  // Based on log kolaborasi and catatan perilaku
  const { data: kolaborasiData } = await supabase
    .from('log_kolaborasi_keasramaan')
    .select('id')
    .eq('nama_musyrif', nama_musyrif)
    .eq('cabang', cabang)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const { data: catatanData } = await supabase
    .from('catatan_perilaku_santri')
    .select('id')
    .eq('nama_musyrif', nama_musyrif)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  const totalEngagement = (kolaborasiData?.length || 0) + (catatanData?.length || 0);
  const targetEngagement = 15; // Target 15 activities per month
  const scoreEngagement = Math.min((totalEngagement / targetEngagement) * 100, 100);

  // Calculate weighted score
  const weightCompletionRate = 0.10; // 10%
  const weightKehadiran = 0.05; // 5%
  const weightEngagement = 0.05; // 5%

  const weightedCompletionRate = scoreCompletionRate * weightCompletionRate;
  const weightedKehadiran = scoreKehadiran * weightKehadiran;
  const weightedEngagement = scoreEngagement * weightEngagement;

  const totalTier3 = weightedCompletionRate + weightedKehadiran + weightedEngagement;

  return {
    completion_rate: Math.round(scoreCompletionRate * 100) / 100,
    kehadiran: Math.round(scoreKehadiran * 100) / 100,
    engagement: Math.round(scoreEngagement * 100) / 100,
    total_tier3: Math.round(totalTier3 * 100) / 100,
    breakdown: {
      completion_rate_weight: Math.round(weightedCompletionRate * 100) / 100,
      kehadiran_weight: Math.round(weightedKehadiran * 100) / 100,
      engagement_weight: Math.round(weightedEngagement * 100) / 100,
    },
  };
}


// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate KPI for a single musyrif
 * 
 * @param nama_musyrif - Nama musyrif
 * @param cabang - Cabang
 * @param asrama - Asrama
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @returns KPIResult
 */
export async function calculateKPIMusyrif(
  nama_musyrif: string,
  cabang: string,
  asrama: string,
  bulan: number,
  tahun: number
): Promise<KPIResult> {
  // 1. Get hari kerja efektif
  const hariKerja = await getHariKerjaEfektif(nama_musyrif, cabang, bulan, tahun);

  // 2. Calculate Tier 1 (50%)
  const tier1 = await calculateTier1Output(
    nama_musyrif,
    cabang,
    asrama,
    bulan,
    tahun,
    hariKerja.hari_kerja_efektif
  );

  // 3. Calculate Tier 2 (30%)
  const tier2 = await calculateTier2Administrasi(
    nama_musyrif,
    cabang,
    asrama,
    bulan,
    tahun,
    hariKerja.hari_kerja_efektif
  );

  // 4. Calculate Tier 3 (20%)
  const tier3 = await calculateTier3Proses(
    nama_musyrif,
    cabang,
    asrama,
    bulan,
    tahun,
    hariKerja.hari_kerja_efektif
  );

  // 5. Calculate total score
  const totalScore = tier1.total_tier1 + tier2.total_tier2 + tier3.total_tier3;

  // 6. Format periode
  const periode = `${tahun}-${bulan.toString().padStart(2, '0')}`;

  return {
    nama_musyrif,
    cabang,
    asrama,
    periode,
    hari_kerja_efektif: hariKerja.hari_kerja_efektif,
    tier1,
    tier2,
    tier3,
    total_score: Math.round(totalScore * 100) / 100,
    ranking: null, // Will be calculated separately
  };
}

// ============================================================================
// RANKING CALCULATION
// ============================================================================

/**
 * Calculate ranking for all musyrif in a cabang
 * 
 * @param cabang - Cabang
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @returns Array of KPIResult with ranking
 */
export async function calculateRanking(
  cabang: string,
  bulan: number,
  tahun: number
): Promise<KPIResult[]> {
  // Get all active musyrif in this cabang
  const { data: musyrifList, error } = await supabase
    .from('musyrif_keasramaan')
    .select('nama_musyrif, asrama')
    .eq('cabang', cabang)
    .eq('status', 'aktif');

  if (error || !musyrifList || musyrifList.length === 0) {
    return [];
  }

  // Calculate KPI for each musyrif
  const kpiResults: KPIResult[] = [];
  for (const musyrif of musyrifList) {
    const kpi = await calculateKPIMusyrif(
      musyrif.nama_musyrif,
      cabang,
      musyrif.asrama,
      bulan,
      tahun
    );
    kpiResults.push(kpi);
  }

  // Sort by total_score (descending)
  kpiResults.sort((a, b) => b.total_score - a.total_score);

  // Assign ranking
  kpiResults.forEach((kpi, index) => {
    kpi.ranking = index + 1;
  });

  return kpiResults;
}

// ============================================================================
// BATCH CALCULATION
// ============================================================================

/**
 * Calculate KPI for all musyrif in all cabang (batch)
 * 
 * @param bulan - Bulan (1-12)
 * @param tahun - Tahun
 * @returns Array of KPIResult
 */
export async function calculateKPIBatch(
  bulan: number,
  tahun: number
): Promise<KPIResult[]> {
  // Fetch cabang list from database
  const { data: cabangData } = await supabase
    .from('cabang_keasramaan')
    .select('nama_cabang')
    .order('nama_cabang');

  const cabangList = cabangData?.map(c => c.nama_cabang) || [];
  const allResults: KPIResult[] = [];

  for (const cabang of cabangList) {
    const results = await calculateRanking(cabang, bulan, tahun);
    allResults.push(...results);
  }

  return allResults;
}

// ============================================================================
// SAVE TO DATABASE
// ============================================================================

/**
 * Save KPI result to database
 * 
 * @param kpiResult - KPI result to save
 * @returns Success status
 */
export async function saveKPIResult(kpiResult: KPIResult): Promise<boolean> {
  // Convert periode format from YYYY-MM to YYYY-MM-01 for date column
  const periodeDate = `${kpiResult.periode}-01`;
  
  const { error } = await supabase
    .from('kpi_summary_keasramaan')
    .upsert([
      {
        nama_musyrif: kpiResult.nama_musyrif,
        cabang: kpiResult.cabang,
        asrama: kpiResult.asrama,
        periode: periodeDate, // Convert to date format
        hari_kerja_efektif: kpiResult.hari_kerja_efektif,
        
        // Calculate total hari bulan and hari libur
        total_hari_bulan: new Date(
          parseInt(kpiResult.periode.split('-')[0]), 
          parseInt(kpiResult.periode.split('-')[1]), 
          0
        ).getDate(),
        hari_libur: new Date(
          parseInt(kpiResult.periode.split('-')[0]), 
          parseInt(kpiResult.periode.split('-')[1]), 
          0
        ).getDate() - kpiResult.hari_kerja_efektif,
        
        // Tier 1 (use both old and new column names for compatibility)
        score_ubudiyah: kpiResult.tier1.ubudiyah,
        tier1_ubudiyah: kpiResult.tier1.ubudiyah,
        score_akhlaq: kpiResult.tier1.akhlaq,
        tier1_akhlaq: kpiResult.tier1.akhlaq,
        score_kedisiplinan: kpiResult.tier1.kedisiplinan,
        tier1_kedisiplinan: kpiResult.tier1.kedisiplinan,
        score_kebersihan: kpiResult.tier1.kebersihan,
        tier1_kebersihan: kpiResult.tier1.kebersihan,
        total_tier1: kpiResult.tier1.total_tier1,
        tier1_total: kpiResult.tier1.total_tier1,
        
        // Tier 2
        score_jurnal: kpiResult.tier2.jurnal,
        tier2_jurnal: kpiResult.tier2.jurnal,
        score_habit_tracker: kpiResult.tier2.habit_tracker,
        tier2_habit_tracker: kpiResult.tier2.habit_tracker,
        score_koordinasi: kpiResult.tier2.koordinasi,
        tier2_koordinasi: kpiResult.tier2.koordinasi,
        score_catatan_perilaku: kpiResult.tier2.catatan_perilaku,
        tier2_catatan_perilaku: kpiResult.tier2.catatan_perilaku,
        total_tier2: kpiResult.tier2.total_tier2,
        tier2_total: kpiResult.tier2.total_tier2,
        tier2_koordinasi_kehadiran_rapat: kpiResult.tier2.koordinasi_detail.kehadiran_rapat,
        tier2_koordinasi_responsiveness: kpiResult.tier2.koordinasi_detail.responsiveness,
        tier2_koordinasi_inisiatif: kpiResult.tier2.koordinasi_detail.inisiatif_kolaborasi,
        
        // Tier 3
        score_completion_rate: kpiResult.tier3.completion_rate,
        tier3_completion_rate: kpiResult.tier3.completion_rate,
        score_kehadiran: kpiResult.tier3.kehadiran,
        tier3_kehadiran: kpiResult.tier3.kehadiran,
        score_engagement: kpiResult.tier3.engagement,
        tier3_engagement: kpiResult.tier3.engagement,
        total_tier3: kpiResult.tier3.total_tier3,
        tier3_total: kpiResult.tier3.total_tier3,
        
        // Total
        total_score: kpiResult.total_score,
        ranking: kpiResult.ranking,
      },
    ], {
      onConflict: 'nama_musyrif,periode',
    });

  if (error) {
    console.error('Error saving KPI result:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }

  console.log(`✅ Saved KPI for ${kpiResult.nama_musyrif} - Score: ${kpiResult.total_score}`);
  return true;
}
