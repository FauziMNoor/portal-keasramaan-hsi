# 🚀 Quick Start - Sistem KPI

## 📋 Ringkasan Cepat

Sistem KPI untuk mengukur performa Musyrif & Kepala Asrama secara objektif dan terukur.

---

## 🎯 Struktur KPI (Simple)

### Musyrif (100%)
```
50% - Hasil Pembinaan Santri (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan)
30% - Administrasi (Jurnal, Habit Tracker, Koordinasi, Catatan)
20% - Proses (Completion Rate, Kehadiran, Engagement)
```

### Kepala Asrama (100%)
```
50% - Rata-rata Hasil Pembinaan Tim
30% - Manajemen Tim (Konsistensi administrasi tim)
20% - Leadership (Approval, Pembinaan, Inovasi)
```

---

## 📊 Cara Kerja (3 Langkah)

### 1. Data Dikumpulkan Otomatis
- Dari Jurnal Musyrif (78 kegiatan harian)
- Dari Habit Tracker Santri (4 kategori)
- Dari Catatan Perilaku
- Dari Rapat & Kolaborasi

### 2. KPI Dihitung Otomatis (End of Month)
- Hitung hari kerja efektif (exclude libur)
- Hitung score per tier
- Hitung ranking
- Save ke database

### 3. Dashboard Menampilkan Hasil
- Musyrif lihat KPI sendiri
- Kepala Asrama lihat KPI tim
- Kepala Sekolah lihat KPI global

---

## 🗓️ Hari Kerja Efektif

**Formula:**
```
Hari Kerja Efektif = Total Hari - Hari Libur
```

**Jenis Libur:**
- Libur Rutin: Sabtu-Ahad (2 pekan sekali)
- Cuti: 12 hari/tahun
- Sakit/Izin: Sesuai kebutuhan

**Penting:** Hari libur TIDAK mengurangi score KPI!

---

## 🧮 Contoh Perhitungan Cepat

### Ustadz Ahmad - November 2024

**Hari Kerja:** 26 hari (30 - 4 libur)

**Tier 1 (50%):**
- Ubudiyah: 96% → 24 poin
- Akhlaq: 88% → 8.8 poin
- Kedisiplinan: 92% → 9.2 poin
- Kebersihan: 94% → 4.7 poin
- **Total: 46.7 poin**

**Tier 2 (30%):**
- Jurnal: 26/26 hari → 10 poin
- Habit Tracker: 100% → 10 poin
- Koordinasi: 100% → 5 poin
- Catatan: 18 catatan → 5 poin
- **Total: 30 poin**

**Tier 3 (20%):**
- Completion: 95% → 9.5 poin
- Kehadiran: 98% → 4.9 poin
- Engagement: 40% → 3 poin
- **Total: 17.4 poin**

**TOTAL: 94.1% 🥇 (Rank #1/10)**

---

## 📁 File Dokumentasi

### Untuk Presentasi ke Tim:
1. **KPI_SYSTEM_OVERVIEW.md** - Overview lengkap
2. **KPI_PRESENTATION_SLIDES.md** - Slide presentasi
3. **KPI_QUICK_START.md** - File ini (quick reference)

### Untuk Developer:
4. **KPI_CALCULATION_FORMULA.md** - Formula detail
5. **KPI_DATABASE_SCHEMA.md** - Struktur database
6. **KPI_API_REFERENCE.md** - API endpoints
7. **KPI_IMPLEMENTATION_CHECKLIST.md** - Checklist implementasi

### Untuk User:
8. **KPI_USER_GUIDE.md** - Panduan pengguna

### Untuk Database:
9. **supabase/migrations/20241210_kpi_system.sql** - Migration script

---

## 🎯 Target Score

### Kategori Performa:
- **Excellent**: ≥90% (Top performer) 🥇
- **Good**: 80-89% (Above average) 🥈
- **Need Improvement**: <80% (Perlu support) ⚠️

---

## 🚀 Implementasi (10 Minggu)

```
Week 1-2:  Database & Backend
Week 3-4:  Core Features (Libur, Rapat, Kolaborasi)
Week 5-6:  KPI Calculation
Week 7-8:  Dashboard UI
Week 9-10: Integration & Testing
```

---

## 💡 Key Benefits

1. **Objektif** - Berdasarkan data, bukan subjektif
2. **Fair** - Hari libur tidak mengurangi score
3. **Transparan** - Semua bisa lihat KPI
4. **Actionable** - Ada rekomendasi improvement
5. **Motivasi** - Ranking & reward system

---

## 📞 Next Steps

1. ✅ Review dokumentasi lengkap
2. ✅ Presentasi ke stakeholder
3. ⏳ Get approval
4. ⏳ Assign team & budget
5. ⏳ Start implementasi

---

## 📚 Baca Lebih Lanjut

- **Overview**: `docs/KPI_SYSTEM_OVERVIEW.md`
- **Formula**: `docs/KPI_CALCULATION_FORMULA.md`
- **User Guide**: `docs/KPI_USER_GUIDE.md`
- **Presentation**: `docs/KPI_PRESENTATION_SLIDES.md`

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Ready for Presentation

---

**Prepared by**: Development Team  
**For**: HSI Boarding School Management
