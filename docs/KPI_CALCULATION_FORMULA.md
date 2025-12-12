# 🧮 Formula Perhitungan KPI Musyrif & Kepala Asrama

## 📋 Daftar Isi
- [Konsep Dasar](#konsep-dasar)
- [KPI Musyrif - Tier 1: Output](#kpi-musyrif---tier-1-output-50)
- [KPI Musyrif - Tier 2: Administrasi](#kpi-musyrif---tier-2-administrasi-30)
- [KPI Musyrif - Tier 3: Proses](#kpi-musyrif---tier-3-proses-20)
- [KPI Kepala Asrama](#kpi-kepala-asrama)
- [Contoh Perhitungan Lengkap](#contoh-perhitungan-lengkap)

---

## Konsep Dasar

### Hari Kerja Efektif

**Formula:**
```
Hari Kerja Efektif = Total Hari dalam Bulan - Hari Libur Musyrif
```

**Contoh:**
```
November 2024: 30 hari
Hari Libur Ustadz Ahmad: 2-3 Nov, 16-17 Nov (4 hari)
Hari Kerja Efektif: 30 - 4 = 26 hari
```

**Catatan:**
- Hari libur rutin (Sabtu-Ahad, 2 pekan sekali) otomatis di-exclude
- Cuti, sakit, izin yang approved juga di-exclude
- Perhitungan KPI hanya berdasarkan hari kerja efektif

---

## KPI Musyrif - Tier 1: OUTPUT (50%)

### A. Ubudiyah (25%)

**Sumber Data:** `formulir_habit_tracker_keasramaan`

**Indikator:**
1. Shalat Fardhu Berjamaah (max: 3)
2. Tata Cara Shalat (max: 3)
3. Qiyamul Lail (max: 3)
4. Shalat Sunnah (max: 3)
5. Puasa Sunnah (max: 5)
6. Tata Cara Wudhu (max: 3)
7. Sedekah (max: 4)
8. Dzikir Pagi Petang (max: 4)

**Total Max Score per Record:** 28 poin

**Formula:**
```typescript
// 1. Ambil semua data habit tracker santri musyrif dalam periode
const habitData = await supabase
  .from('formulir_habit_tracker_keasramaan')
  .select('*')
  .eq('musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Hitung total score Ubudiyah
let totalScore = 0;
let totalMaxScore = 0;

habitData.forEach(record => {
  const score = 
    parseInt(record.shalat_fardhu_berjamaah || 0) +
    parseInt(record.tata_cara_shalat || 0) +
    parseInt(record.qiyamul_lail || 0) +
    parseInt(record.shalat_sunnah || 0) +
    parseInt(record.puasa_sunnah || 0) +
    parseInt(record.tata_cara_wudhu || 0) +
    parseInt(record.sedekah || 0) +
    parseInt(record.dzikir_pagi_petang || 0);
  
  totalScore += score;
  totalMaxScore += 28; // Max score per record
});

// 3. Hitung percentage
const ubudiyahPercentage = (totalScore / totalMaxScore) * 100;

// 4. Hitung poin KPI (25% dari total)
const ubudiyahPoin = (ubudiyahPercentage / 100) * 25;
```

**Contoh:**
```
Total Score: 2,520 poin
Total Max Score: 2,800 poin (100 santri × 28 poin)
Percentage: (2,520 / 2,800) × 100 = 90%
KPI Poin: (90 / 100) × 25 = 22.5 poin
```

---

### B. Akhlaq (10%)

**Indikator:**
1. Etika dalam Tutur Kata (max: 3)
2. Etika dalam Bergaul (max: 3)
3. Etika dalam Berpakaian (max: 3)
4. Adab Sehari-hari (max: 3)

**Total Max Score per Record:** 12 poin

**Formula:** (Sama seperti Ubudiyah, ganti field)

---

### C. Kedisiplinan (10%)

**Indikator:**
1. Waktu Tidur (max: 4)
2. Pelaksanaan Piket Kamar (max: 3)
3. Disiplin Halaqah Tahfidz (max: 3)
4. Perizinan (max: 3)
5. Belajar Malam (max: 4)
6. Disiplin Berangkat ke Masjid (max: 4)

**Total Max Score per Record:** 21 poin

---

### D. Kebersihan & Kerapian (5%)

**Indikator:**
1. Kebersihan Tubuh, Berpakaian, Berpenampilan (max: 3)
2. Kamar (max: 3)
3. Ranjang dan Almari (max: 3)

**Total Max Score per Record:** 9 poin

---

## KPI Musyrif - Tier 2: ADMINISTRASI (30%)

### A. Input Jurnal Musyrif (10%)

**Sumber Data:** `formulir_jurnal_musyrif_keasramaan`

**Formula:**
```typescript
// 1. Hitung hari kerja efektif
const hariKerjaEfektif = 26; // 30 hari - 4 hari libur

// 2. Hitung jumlah hari input jurnal
const { data: jurnalData } = await supabase
  .from('formulir_jurnal_musyrif_keasramaan')
  .select('tanggal')
  .eq('nama_musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

const uniqueDays = new Set(jurnalData.map(j => j.tanggal)).size;

// 3. Hitung percentage
const percentage = (uniqueDays / hariKerjaEfektif) * 100;

// 4. Scoring
let score = 0;
if (percentage === 100) score = 10;
else if (percentage >= 90) score = 8;
else if (percentage >= 80) score = 6;
else score = 0;
```

**Kriteria:**
- 100% (26/26 hari) = 10 poin ✅
- 90-99% (24-25 hari) = 8 poin ⚠️
- 80-89% (21-23 hari) = 6 poin ⚠️
- <80% (<21 hari) = 0 poin ❌

---

### B. Input Habit Tracker (10%)

**Sumber Data:** `formulir_habit_tracker_keasramaan`

**Formula:**
```typescript
// 1. Get jumlah santri di asrama
const { count: totalSantri } = await supabase
  .from('data_siswa_keasramaan')
  .select('*', { count: 'exact' })
  .eq('musyrif', namaMusyrif)
  .eq('asrama', asrama);

// 2. Get input habit tracker per hari
const { data: habitData } = await supabase
  .from('formulir_habit_tracker_keasramaan')
  .select('tanggal, nama_siswa')
  .eq('musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 3. Group by tanggal (exclude hari libur)
const byDate = {};
habitData.forEach(h => {
  if (!byDate[h.tanggal]) byDate[h.tanggal] = new Set();
  byDate[h.tanggal].add(h.nama_siswa);
});

// 4. Hitung rata-rata completion per hari
const completionRates = Object.values(byDate).map(santriSet => 
  (santriSet.size / totalSantri) * 100
);
const avgCompletion = completionRates.reduce((a,b) => a+b, 0) / completionRates.length;

// 5. Scoring
let score = 0;
if (avgCompletion === 100) score = 10;
else if (avgCompletion >= 90) score = 8;
else if (avgCompletion >= 80) score = 6;
else score = 0;
```

**Kriteria:**
- 100% santri ter-input setiap hari = 10 poin ✅
- 90-99% = 8 poin ⚠️
- 80-89% = 6 poin ⚠️
- <80% = 0 poin ❌

---

### C. Koordinasi (5%)

**Komponen:**
1. Kehadiran Rapat (40% = 2 poin)
2. Responsiveness (30% = 1.5 poin)
3. Inisiatif Kolaborasi (30% = 1.5 poin)

**Total Max:** 5 poin



#### C.1. Kehadiran Rapat (2 poin)

**Sumber Data:** `kehadiran_rapat_keasramaan`

**Formula:**
```typescript
// 1. Get total rapat dalam periode
const { count: totalRapat } = await supabase
  .from('rapat_koordinasi_keasramaan')
  .select('*', { count: 'exact' })
  .eq('cabang', cabang)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Get kehadiran musyrif
const { data: kehadiran } = await supabase
  .from('kehadiran_rapat_keasramaan')
  .select('status_kehadiran')
  .eq('nama_musyrif', namaMusyrif)
  .in('rapat_id', rapatIds);

const hadirCount = kehadiran.filter(k => k.status_kehadiran === 'hadir').length;
const percentage = (hadirCount / totalRapat) * 100;

// 3. Scoring
let score = 0;
if (percentage === 100) score = 2;
else if (percentage >= 80) score = 1.5;
else score = 0;
```

**Kriteria:**
- 100% hadir = 2 poin ✅
- 80-99% hadir = 1.5 poin ⚠️
- <80% hadir = 0 poin ❌

---

#### C.2. Responsiveness (1.5 poin)

**Sumber Data:** `log_komunikasi_keasramaan` (opsional, bisa manual input dari kepala asrama)

**Formula:**
```typescript
// 1. Get komunikasi yang ditujukan ke musyrif
const { data: komunikasi } = await supabase
  .from('log_komunikasi_keasramaan')
  .select('waktu_respon_menit')
  .eq('penerima', namaMusyrif)
  .gte('tanggal_kirim', startDate)
  .lte('tanggal_kirim', endDate)
  .not('waktu_respon_menit', 'is', null);

// 2. Hitung rata-rata waktu respon (dalam jam)
const avgResponMenit = komunikasi.reduce((sum, k) => sum + k.waktu_respon_menit, 0) / komunikasi.length;
const avgResponJam = avgResponMenit / 60;

// 3. Scoring
let score = 0;
if (avgResponJam < 2) score = 1.5;
else if (avgResponJam <= 6) score = 1;
else score = 0;
```

**Kriteria:**
- Respon <2 jam = 1.5 poin ✅
- Respon 2-6 jam = 1 poin ⚠️
- Respon >6 jam = 0 poin ❌

---

#### C.3. Inisiatif Kolaborasi (1.5 poin)

**Sumber Data:** `log_kolaborasi_keasramaan`

**Formula:**
```typescript
// 1. Get jumlah inisiatif kolaborasi
const { count: totalInisiatif } = await supabase
  .from('log_kolaborasi_keasramaan')
  .select('*', { count: 'exact' })
  .eq('nama_musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Scoring
let score = 0;
if (totalInisiatif >= 3) score = 1.5;
else if (totalInisiatif >= 1) score = 1;
else score = 0;
```

**Kriteria:**
- ≥3 inisiatif/bulan = 1.5 poin ✅
- 1-2 inisiatif/bulan = 1 poin ⚠️
- 0 inisiatif = 0 poin ❌

**Jenis Inisiatif:**
- Sharing tips/strategi
- Membantu musyrif lain
- Feedback konstruktif
- Program bersama
- Menitipkan asrama saat libur

---

### D. Catatan Perilaku (5%)

**Sumber Data:** `catatan_perilaku_keasramaan`

**Formula:**
```typescript
// 1. Get jumlah catatan perilaku
const { count: totalCatatan } = await supabase
  .from('catatan_perilaku_keasramaan')
  .select('*', { count: 'exact' })
  .eq('musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Scoring
let score = 0;
if (totalCatatan >= 12) score = 5;
else if (totalCatatan >= 8) score = 3;
else score = 0;
```

**Kriteria:**
- ≥12 catatan/bulan (3/minggu) = 5 poin ✅
- 8-11 catatan/bulan = 3 poin ⚠️
- <8 catatan/bulan = 0 poin ❌

---

## KPI Musyrif - Tier 3: PROSES (20%)

### A. Completion Rate Jurnal (10%)

**Sumber Data:** `formulir_jurnal_musyrif_keasramaan`

**Formula:**
```typescript
// 1. Get semua jurnal dalam periode
const { data: jurnalData } = await supabase
  .from('formulir_jurnal_musyrif_keasramaan')
  .select('status_terlaksana')
  .eq('nama_musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Hitung completion rate
const total = jurnalData.length;
const terlaksana = jurnalData.filter(j => j.status_terlaksana).length;
const completionRate = (terlaksana / total) * 100;

// 3. Hitung poin
const poin = (completionRate / 100) * 10;
```

**Contoh:**
```
Total kegiatan: 2,028 (26 hari × 78 kegiatan)
Terlaksana: 1,926
Completion Rate: (1,926 / 2,028) × 100 = 95%
Poin: (95 / 100) × 10 = 9.5 poin
```

---

### B. Kehadiran Tepat Waktu (5%)

**Sumber Data:** `formulir_jurnal_musyrif_keasramaan`

**Kegiatan yang diukur:**
- Shalat Fardhu Berjamaah (5 waktu)
- Berangkat ke Masjid
- Morning Spirit
- KBM

**Formula:**
```typescript
// 1. Get kegiatan "tepat waktu" yang terlaksana
const kegiatanTepatWaktu = [
  'Memastikan seluruh santri ikut melaksanakan shalat Subuh berjamaah',
  'Memastikan seluruh santri ikut melaksanakan shalat Dzuhur berjamaah',
  'Memastikan seluruh santri ikut melaksanakan shalat Ashar berjamaah',
  'Memastikan santri melaksanakan shalat Maghrib',
  'Memastikan seluruh santri ikut melaksanakan shalat Isya berjamaah',
  'Memastikan santri sudah berangkat ke kelas',
  // ... dst
];

const { data: jurnalData } = await supabase
  .from('formulir_jurnal_musyrif_keasramaan')
  .select('kegiatan_id, status_terlaksana')
  .eq('nama_musyrif', namaMusyrif)
  .in('kegiatan_id', kegiatanTepatWaktuIds)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Hitung percentage
const total = jurnalData.length;
const terlaksana = jurnalData.filter(j => j.status_terlaksana).length;
const percentage = (terlaksana / total) * 100;

// 3. Hitung poin
const poin = (percentage / 100) * 5;
```

---

### C. Engagement (5%)

**Sumber Data:** `formulir_jurnal_musyrif_keasramaan` (field: catatan)

**Formula:**
```typescript
// 1. Get jurnal dengan catatan
const { data: jurnalData } = await supabase
  .from('formulir_jurnal_musyrif_keasramaan')
  .select('catatan')
  .eq('nama_musyrif', namaMusyrif)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

// 2. Hitung engagement
const totalJurnal = jurnalData.length;
const denganCatatan = jurnalData.filter(j => 
  j.catatan && j.catatan.trim().length > 0
).length;

// 3. Hitung rata-rata panjang catatan
const avgPanjangCatatan = jurnalData
  .filter(j => j.catatan)
  .reduce((sum, j) => sum + j.catatan.length, 0) / denganCatatan;

// 4. Scoring
let score = 0;
if (denganCatatan / totalJurnal >= 0.5 && avgPanjangCatatan >= 50) {
  score = 5; // 50% jurnal ada catatan, min 50 karakter
} else if (denganCatatan / totalJurnal >= 0.3) {
  score = 3; // 30% jurnal ada catatan
} else {
  score = 1; // Minimal effort
}
```

**Kriteria:**
- ≥50% jurnal ada catatan (min 50 karakter) = 5 poin ✅
- 30-49% jurnal ada catatan = 3 poin ⚠️
- <30% = 1 poin ❌

---

## KPI Kepala Asrama

### Tier 1: Output Tim (50%)

**Formula:** Rata-rata dari semua musyrif di bawahnya

```typescript
// 1. Get semua musyrif di cabang
const { data: musyrifList } = await supabase
  .from('musyrif_keasramaan')
  .select('nama_musyrif')
  .eq('cabang', cabang)
  .eq('status', 'aktif');

// 2. Get KPI summary semua musyrif
const kpiData = await Promise.all(
  musyrifList.map(m => getKPIMusyrif(m.nama_musyrif, periode))
);

// 3. Hitung rata-rata per kategori
const avgUbudiyah = kpiData.reduce((sum, k) => sum + k.score_ubudiyah, 0) / kpiData.length;
const avgAkhlaq = kpiData.reduce((sum, k) => sum + k.score_akhlaq, 0) / kpiData.length;
const avgKedisiplinan = kpiData.reduce((sum, k) => sum + k.score_kedisiplinan, 0) / kpiData.length;
const avgKebersihan = kpiData.reduce((sum, k) => sum + k.score_kebersihan, 0) / kpiData.length;

// 4. Total Tier 1
const totalTier1 = avgUbudiyah + avgAkhlaq + avgKedisiplinan + avgKebersihan;
```

---

### Tier 2: Manajemen Tim (30%)

**Formula:** Persentase musyrif yang mencapai target

```typescript
// A. Konsistensi Jurnal Tim (10%)
const musyrifKonsistenJurnal = kpiData.filter(k => k.score_jurnal >= 8).length;
const percentageJurnal = (musyrifKonsistenJurnal / kpiData.length) * 100;
const scoreJurnal = (percentageJurnal / 100) * 10;

// B. Konsistensi Habit Tracker (10%)
const musyrifKonsistenHabit = kpiData.filter(k => k.score_habit_tracker >= 8).length;
const percentageHabit = (musyrifKonsistenHabit / kpiData.length) * 100;
const scoreHabit = (percentageHabit / 100) * 10;

// C. Koordinasi Tim (5%)
const avgKoordinasi = kpiData.reduce((sum, k) => sum + k.score_koordinasi, 0) / kpiData.length;

// D. Catatan Perilaku Tim (5%)
const musyrifAktifCatatan = kpiData.filter(k => k.score_catatan_perilaku >= 3).length;
const percentageCatatan = (musyrifAktifCatatan / kpiData.length) * 100;
const scoreCatatan = (percentageCatatan / 100) * 5;

// Total Tier 2
const totalTier2 = scoreJurnal + scoreHabit + avgKoordinasi + scoreCatatan;
```

---

### Tier 3: Leadership (20%)

**Komponen:**
1. Approval Perizinan (5%)
2. Penanganan Masalah (5%)
3. Pembinaan Musyrif (5%)
4. Inovasi Program (5%)

**Formula:** (Manual input/penilaian dari kepala sekolah)

---

## Contoh Perhitungan Lengkap

### Ustadz Ahmad - November 2024

**Data:**
- Hari kerja efektif: 26 hari (30 - 4 libur)
- Santri di asrama: 30 santri

#### Tier 1: Output (50%)

**Ubudiyah (25%):**
```
Total Score: 672 (30 santri × 26 hari × 28 max = 21,840 max)
Actual: 20,952
Percentage: (20,952 / 21,840) × 100 = 96%
Poin: (96 / 100) × 25 = 24 poin
```

**Akhlaq (10%):**
```
Percentage: 88%
Poin: (88 / 100) × 10 = 8.8 poin
```

**Kedisiplinan (10%):**
```
Percentage: 92%
Poin: (92 / 100) × 10 = 9.2 poin
```

**Kebersihan (5%):**
```
Percentage: 94%
Poin: (94 / 100) × 5 = 4.7 poin
```

**Total Tier 1: 24 + 8.8 + 9.2 + 4.7 = 46.7 poin**

---

#### Tier 2: Administrasi (30%)

**Jurnal (10%):**
```
Input: 26/26 hari = 100%
Poin: 10 poin
```

**Habit Tracker (10%):**
```
Completion: 100% (30 santri × 26 hari)
Poin: 10 poin
```

**Koordinasi (5%):**
```
Kehadiran Rapat: 5/5 = 100% → 2 poin
Responsiveness: Avg 1.5 jam → 1.5 poin
Inisiatif: 4 kolaborasi → 1.5 poin
Total: 5 poin
```

**Catatan Perilaku (5%):**
```
Total: 18 catatan (≥12)
Poin: 5 poin
```

**Total Tier 2: 10 + 10 + 5 + 5 = 30 poin**

---

#### Tier 3: Proses (20%)

**Completion Rate (10%):**
```
Terlaksana: 1,926 / 2,028 = 95%
Poin: (95 / 100) × 10 = 9.5 poin
```

**Kehadiran Tepat Waktu (5%):**
```
Percentage: 98%
Poin: (98 / 100) × 5 = 4.9 poin
```

**Engagement (5%):**
```
Jurnal dengan catatan: 40% (30-49%)
Poin: 3 poin
```

**Total Tier 3: 9.5 + 4.9 + 3 = 17.4 poin**

---

#### Total KPI Ustadz Ahmad

```
Tier 1: 46.7 poin (93.4%)
Tier 2: 30 poin (100%)
Tier 3: 17.4 poin (87%)

Total: 46.7 + 30 + 17.4 = 94.1 poin (94.1%)

Ranking: #1 dari 10 musyrif 🥇
```

---

## Summary Formula

### KPI Musyrif
```
Total KPI = Tier1 + Tier2 + Tier3

Tier1 (50%) = Ubudiyah(25%) + Akhlaq(10%) + Kedisiplinan(10%) + Kebersihan(5%)
Tier2 (30%) = Jurnal(10%) + HabitTracker(10%) + Koordinasi(5%) + Catatan(5%)
Tier3 (20%) = CompletionRate(10%) + Kehadiran(5%) + Engagement(5%)
```

### KPI Kepala Asrama
```
Total KPI = Tier1 + Tier2 + Tier3

Tier1 (50%) = Rata-rata Output Tim
Tier2 (30%) = Persentase Musyrif yang Konsisten
Tier3 (20%) = Penilaian Leadership (manual)
```

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Ready for Implementation
