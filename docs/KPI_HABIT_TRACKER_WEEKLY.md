# KPI System - Habit Tracker Weekly Input

**Date**: December 10, 2024  
**Status**: ✅ UPDATED

---

## Perubahan Penting

### Sebelumnya (SALAH ❌)
Sistem mengasumsikan habit tracker diinput **setiap hari**:
- Target: 23 hari input per bulan (hari kerja efektif)
- Score = (hari input / 23) × 100
- Jika hanya input 4x (setiap Jumat) → Score = 17.39% ❌

### Sekarang (BENAR ✅)
Sistem disesuaikan dengan realitas: habit tracker diinput **setiap Jumat (mingguan)**:
- Target: 4-5 minggu per bulan
- Score = (hari input / jumlah minggu) × 100
- Jika input 4x (setiap Jumat) → Score = 100% ✅

---

## Alasan Perubahan

### Realitas di Lapangan
1. **Habit tracker bukan data harian** - Ini tentang perkembangan adab, akhlaq, dan karakter
2. **Tracing setiap hari mustahil** - Butuh waktu untuk observasi dan penilaian
3. **Input setiap Jumat** - Waktu terdekat yang realistis untuk menilai perkembangan mingguan
4. **21 indikator** - Butuh waktu untuk menilai dengan akurat

### Dampak Jika Tidak Diubah
Dengan target harian, musyrif akan:
- ❌ Kehilangan 8.26 poin dari 10 poin Tier 2 Habit Tracker
- ❌ Score Tier 3 Completion Rate juga rendah
- ❌ Total KPI turun drastis (bisa kehilangan 10-15 poin total)
- ❌ Tidak fair karena sudah melakukan tugas dengan benar

---

## Perubahan Kode

### File: `lib/kpi-calculation.ts`

#### 1. Tier 2 - Habit Tracker Score (10%)

**Before**:
```typescript
const scoreHabit = hariKerjaEfektif > 0 
  ? Math.min((jumlahHariHabit / hariKerjaEfektif) * 100, 100) 
  : 0;
```

**After**:
```typescript
// Calculate expected weeks in the month (approximately 4-5 weeks)
const totalWeeks = Math.ceil(totalHari / 7);
const targetHabitInput = totalWeeks; // Target: 1x per week

// Score based on weekly target, not daily
const scoreHabit = targetHabitInput > 0 
  ? Math.min((jumlahHariHabit / targetHabitInput) * 100, 100) 
  : 0;
```

#### 2. Tier 3 - Completion Rate

**Before**:
```typescript
const habitCompletion = hariKerjaEfektif > 0 
  ? Math.min((uniqueHabitDays.size / hariKerjaEfektif) * 100, 100) 
  : 0;
```

**After**:
```typescript
// Calculate expected weeks in the month (approximately 4-5 weeks)
const totalWeeks = Math.ceil(totalHari / 7);
const targetHabitInput = totalWeeks; // Target: 1x per week

// Habit completion based on weekly target
const habitCompletion = targetHabitInput > 0 
  ? Math.min((uniqueHabitDays.size / targetHabitInput) * 100, 100) 
  : 0;
```

---

## Contoh Perhitungan

### Desember 2024

**Data**:
- Total hari: 31 hari
- Total minggu: Math.ceil(31 / 7) = 5 minggu
- Hari kerja efektif: 23 hari (setelah dikurangi libur)
- Input habit tracker: 4 hari (Jumat: 6, 13, 20, 27 Desember)

**Perhitungan Tier 2 - Habit Tracker (10%)**:
```
Target = 5 minggu
Input = 4 hari
Score = (4 / 5) × 100 = 80%
Weighted = 80% × 10% = 8.0 poin ✅

Sebelumnya:
Target = 23 hari kerja
Input = 4 hari
Score = (4 / 23) × 100 = 17.39%
Weighted = 17.39% × 10% = 1.74 poin ❌
```

**Selisih**: 8.0 - 1.74 = **6.26 poin** (sangat signifikan!)

---

## Target Input Habit Tracker

### Per Bulan
| Bulan | Total Hari | Total Minggu | Target Input |
|-------|-----------|--------------|--------------|
| Januari | 31 | 5 | 5x |
| Februari | 28/29 | 4 | 4x |
| Maret | 31 | 5 | 5x |
| April | 30 | 5 | 5x |
| Mei | 31 | 5 | 5x |
| Juni | 30 | 5 | 5x |
| Juli | 31 | 5 | 5x |
| Agustus | 31 | 5 | 5x |
| September | 30 | 5 | 5x |
| Oktober | 31 | 5 | 5x |
| November | 30 | 5 | 5x |
| Desember | 31 | 5 | 5x |

### Jadwal Ideal
- **Setiap Jumat** dalam sebulan
- Jika ada Jumat libur/cuti, bisa diganti hari lain dalam minggu tersebut
- Minimal 4x per bulan untuk score 80%+

---

## Tier 1 (Output) - Tidak Berubah

Tier 1 tetap menggunakan **semua data** habit tracker yang ada dalam 1 bulan:
- Mengambil semua record untuk menghitung rata-rata score
- Tidak peduli berapa kali input (4x atau 30x)
- Yang penting: kualitas data (score Baik/Cukup/Kurang)

**Contoh**:
```
Input 4x (setiap Jumat):
- 4 record × 30 santri = 120 records
- Hitung rata-rata score untuk 21 indikator
- Kelompokkan ke Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan
```

---

## Testing

### Test Case 1: Input Sempurna (5x)
```
Desember 2024: 5 minggu
Input: 5 hari (setiap Jumat)
Score Tier 2 Habit Tracker = (5/5) × 100 = 100% ✅
```

### Test Case 2: Input 4x (1 Jumat terlewat)
```
Desember 2024: 5 minggu
Input: 4 hari
Score Tier 2 Habit Tracker = (4/5) × 100 = 80% ✅
```

### Test Case 3: Input 3x (2 Jumat terlewat)
```
Desember 2024: 5 minggu
Input: 3 hari
Score Tier 2 Habit Tracker = (3/5) × 100 = 60% ⚠️
```

---

## Rekomendasi

### Untuk Musyrif
1. ✅ Input habit tracker **setiap Jumat**
2. ✅ Jika Jumat libur, input di hari lain dalam minggu tersebut
3. ✅ Target minimal: 4x per bulan (80% score)
4. ✅ Target ideal: 5x per bulan (100% score)

### Untuk Kepala Asrama
1. ✅ Monitor input habit tracker setiap minggu
2. ✅ Reminder ke musyrif jika ada minggu yang terlewat
3. ✅ Review kualitas data (bukan hanya kuantitas)

### Untuk Admin/Kepala Sekolah
1. ✅ Hitung ulang KPI setelah update ini
2. ✅ Verifikasi score sudah sesuai dengan realitas
3. ✅ Komunikasikan perubahan ke semua musyrif

---

## FAQ

### Q: Apakah boleh input lebih dari 1x per minggu?
**A**: Boleh, tapi tidak menambah score. Score maksimal tetap 100% jika sudah input 1x per minggu.

### Q: Bagaimana jika ada minggu dengan 2 Jumat (awal/akhir bulan)?
**A**: Sistem menghitung berdasarkan `Math.ceil(totalHari / 7)`, jadi otomatis menyesuaikan.

### Q: Apakah Tier 1 (Output) juga berubah?
**A**: Tidak. Tier 1 tetap menghitung rata-rata dari semua data yang ada, tidak peduli frekuensi input.

### Q: Bagaimana dengan bulan Februari (28 hari)?
**A**: Februari = 4 minggu, jadi target input = 4x (100% jika input 4x).

---

## Dokumentasi Terkait

- `KPI_FINAL_DOCUMENTATION.md` - Dokumentasi lengkap sistem KPI
- `KPI_DATA_KOSONG_TROUBLESHOOT.md` - Troubleshooting data kosong
- `lib/kpi-calculation.ts` - Source code perhitungan KPI

---

**Status**: ✅ Implemented and ready for testing  
**Last Updated**: December 10, 2024
