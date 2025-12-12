# KPI System - Quick Start & Current Status

**Last Updated**: December 11, 2024  
**Status**: 🟡 IN PROGRESS - Data belum tersimpan otomatis ke database

---

## 📋 System Overview

Sistem KPI untuk mengukur performa **Musyrif & Kepala Asrama** di HSI Boarding School berdasarkan 3 tier:

### KPI Structure (100%)
- **Tier 1 (50%)**: Output - Hasil pembinaan santri (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan)
- **Tier 2 (30%)**: Administrasi - Jurnal, Habit Tracker, Koordinasi, Catatan Perilaku
- **Tier 3 (20%)**: Proses - Completion Rate, Kehadiran, Engagement

### Data Sources
- `formulir_jurnal_musyrif_keasramaan` - Jurnal harian musyrif
- `formulir_habit_tracker_keasramaan` - Habit tracker santri (input **setiap Jumat**)
- `rapat_koordinasi_keasramaan` + `kehadiran_rapat_keasramaan` - Rapat koordinasi
- `log_kolaborasi_keasramaan` - Log kolaborasi antar musyrif
- `jadwal_libur_musyrif_keasramaan` - Jadwal libur untuk hitung hari kerja efektif
- `musyrif_keasramaan` - Data musyrif (dengan kolom `kelas` untuk grouping)

---

## ✅ What's Working (Completed)

### 1. Database Structure ✅
- ✅ All KPI tables created and migrated
- ✅ Table `kpi_summary_keasramaan` structure fixed (nama → nama_musyrif, added tier columns)
- ✅ Table `musyrif_keasramaan` has `jatah_cuti_tahunan` and `sisa_cuti_tahunan` columns
- ✅ Table `jadwal_libur_musyrif_keasramaan` status column fixed (VARCHAR(50))
- ✅ Dynamic cabang fetching from `cabang_keasramaan` table

### 2. KPI Calculation Engine ✅
- ✅ Tier 1, 2, 3 calculation logic implemented
- ✅ Habit tracker uses **weekly target** (4-5x per month, not daily)
- ✅ Correct table names: `formulir_jurnal_musyrif_keasramaan`, `formulir_habit_tracker_keasramaan`
- ✅ Habit tracker text values mapped: 'Baik'=3, 'Cukup'=2, 'Kurang'=1
- ✅ 21 indicators grouped into 4 categories (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan)
- ✅ Ranking calculation per cabang
- ✅ Batch calculation for all musyrif in all cabang
- ✅ UPSERT logic to prevent duplicates (unique: nama_musyrif + periode)

### 3. Jadwal Libur System ✅
- ✅ Generate jadwal libur rutin (Sabtu-Ahad, 2 pekan sekali)
- ✅ Musyrif grouped by **kelas** (not mixed)
- ✅ Each kelas split into 2 groups (alternating)
- ✅ Approval workflow: Kepala Asrama → Kepala Sekolah
- ✅ Cuti tracking (12 hari per tahun)

### 4. UI Pages ✅
- ✅ All 9 KPI pages have Sidebar
- ✅ Dashboard Musyrif (`/kpi/musyrif/[nama]`)
- ✅ Dashboard Kepala Asrama (`/kpi/kepala-asrama`)
- ✅ Dashboard Kepala Sekolah (`/kpi/kepala-sekolah`)
- ✅ Rapat Koordinasi (`/koordinasi/rapat`)
- ✅ Log Kolaborasi (`/koordinasi/log-kolaborasi`)
- ✅ Approval Cuti (`/approval/cuti-musyrif`)
- ✅ Jadwal Libur (`/manajemen-data/jadwal-libur-musyrif`)
- ✅ KPI Calculation (`/admin/kpi-calculation`)

### 5. Role-Based Access ✅
- ✅ Admin: Full access
- ✅ Kepala Sekolah: Full access (including Hitung KPI)
- ✅ Kepala Asrama: All except Dashboard Global & Hitung KPI
- ✅ Musyrif: Only Dashboard KPI Saya

### 6. API Endpoints ✅
- ✅ `/api/kpi/summary` - Get KPI summary
- ✅ `/api/kpi/calculate/batch` - Calculate KPI batch
- ✅ `/api/kpi/jadwal-libur/generate-rutin` - Generate jadwal libur
- ✅ `/api/kpi/jadwal-libur` - CRUD jadwal libur
- ✅ `/api/kpi/jadwal-libur/approve` - Approve/reject cuti
- ✅ `/api/kpi/rapat` - CRUD rapat
- ✅ `/api/kpi/rapat/kehadiran` - CRUD kehadiran rapat
- ✅ `/api/kpi/kolaborasi` - CRUD log kolaborasi
- ✅ `/api/kpi/kolaborasi/rate` - Rate kolaborasi
- ✅ `/api/kpi/cuti` - Get sisa cuti
- ✅ `/api/kpi/debug-musyrif` - Debug musyrif data
- ✅ `/api/kpi/debug-summary` - Debug KPI summary data

---

## 🔴 MASALAH UTAMA SAAT INI

### 1. Data Tidak Tersimpan Otomatis ke Database ⚠️
**Status**: BELUM SELESAI - Perlu investigasi lebih lanjut

**Problem**:
- User sudah berhasil calculating KPI (proses selesai tanpa error)
- Tapi data tidak otomatis tersimpan ke tabel `kpi_summary_keasramaan`
- Database masih kosong setelah calculation

**Yang Sudah Dicoba**:
- ✅ Update `saveKPIResult()` untuk fill semua kolom (termasuk duplikat)
- ✅ Convert periode format: `YYYY-MM` → `YYYY-MM-01` (DATE type)
- ✅ Calculate `total_hari_bulan` dan `hari_libur`
- ✅ Tambah console logs untuk debugging
- ✅ Fix duplicate return statement di `saveKPIResult()`

**Struktur Tabel User** (dari query terakhir):
```sql
-- User punya tabel dengan struktur ini:
- periode: DATE (bukan VARCHAR)
- nama_musyrif: VARCHAR(255) (sudah benar, bukan 'nama')
- Punya kolom DUPLIKAT: 
  * score_ubudiyah DAN tier1_ubudiyah
  * total_tier1 DAN tier1_total
  * dst...
- TIDAK ada kolom 'role' dan 'total_musyrif'
- Unique constraint: (nama_musyrif, periode)
```

**NEXT STEP YANG HARUS DILAKUKAN**:
1. ❌ JANGAN jalankan migration `20241210_alter_kpi_summary_table.sql` - tabel user sudah sesuai
2. ✅ Test calculation lagi di `/admin/kpi-calculation`
3. ✅ Cek console browser (F12) untuk log "✅ Saved KPI for..."
4. ✅ Cek server terminal untuk error detail
5. ✅ Jika masih gagal, cek response dari Supabase dengan tambah log di `saveKPIResult()`

### 2. Dashboard Pages Show Empty Data ⚠️
**Status**: Expected (no data calculated yet)

**Problem**:
- `/kpi/kepala-sekolah` shows empty
- `/kpi/kepala-asrama` shows empty
- `/kpi/musyrif/[nama]` shows empty

**Root Cause**:
- `kpi_summary_keasramaan` table is empty (0 records)
- KPI has never been calculated

**Solution**:
1. ✅ Fix data saving issue (see #1)
2. Run KPI calculation for current month
3. Refresh dashboard pages

### 3. Missing Prerequisite Data ⚠️
**Status**: Need to verify

**Required Data**:
- ✅ `musyrif_keasramaan` - Has data (verified)
- ❓ `formulir_jurnal_musyrif_keasramaan` - Need to check
- ❓ `formulir_habit_tracker_keasramaan` - Need to check
- ❓ `rapat_koordinasi_keasramaan` - Optional
- ❓ `log_kolaborasi_keasramaan` - Optional

**Check with**:
```sql
-- Check jurnal data
SELECT COUNT(*) FROM formulir_jurnal_musyrif_keasramaan 
WHERE tanggal >= '2024-12-01' AND tanggal < '2025-01-01';

-- Check habit tracker data
SELECT COUNT(*) FROM formulir_habit_tracker_keasramaan 
WHERE tanggal >= '2024-12-01' AND tanggal < '2025-01-01';
```

**If empty**: KPI will calculate but scores will be 0 or very low.

---

## 🔧 PERUBAHAN TERAKHIR YANG SUDAH DIKERJAKAN

### Tanggal: 10-11 Desember 2024

#### 1. ✅ Fix Habit Tracker - Weekly Input (SELESAI)
**File**: `lib/kpi-calculation.ts`

**Masalah**: 
- Habit tracker dihitung daily (target 23 hari/bulan)
- Padahal input setiap Jumat (weekly)
- Score jadi sangat rendah: 17%

**Solusi**:
- Ubah ke weekly target: 4-5 minggu per bulan
- Formula: `(input_days / total_weeks) × 100`
- Score naik jadi realistis: 80-100%

**Impact**: Tier 2 dan Tier 3 sekarang lebih akurat

---

#### 2. ✅ Fix Jadwal Libur - Grouping by Kelas (SELESAI)
**File**: `app/api/kpi/jadwal-libur/generate-rutin/route.ts`

**Masalah**:
- Semua musyrif bercampur saat generate jadwal libur
- Musyrif kelas 10 dan kelas 11 jadi satu grup

**Solusi**:
- Group musyrif by `kelas` dulu
- Setiap kelas split jadi 2 grup (independent)
- Keterangan include info kelas

**Impact**: Jadwal libur sekarang terpisah per kelas

---

#### 3. ✅ Fix Dynamic Cabang Fetching (SELESAI)
**Files**: 8 pages + `lib/kpi-calculation.ts`

**Masalah**:
- Cabang hardcoded: ['Pusat', 'Sukabumi']
- Tidak sesuai data real di database

**Solusi**:
- Fetch dari tabel `cabang_keasramaan`
- Column: `nama_cabang`
- Semua dropdown jadi dynamic

**Impact**: Semua halaman KPI sekarang pakai data cabang real

---

#### 4. ✅ Fix Kepala Sekolah Role Access (SELESAI)
**File**: `components/Sidebar.tsx`

**Masalah**:
- Kepala Sekolah tidak bisa akses menu "Hitung KPI"
- Hanya Admin yang bisa

**Solusi**:
- Kepala Sekolah sekarang punya akses sama seperti Admin
- Bisa akses semua menu termasuk "Hitung KPI"

**Impact**: Kepala Sekolah bisa calculate KPI sendiri

---

#### 5. ✅ Fix Import Errors (SELESAI)
**Files**: 11 API routes + `lib/kpi-calculation.ts`

**Masalah**:
- Import `createClient` dari `@/lib/supabase` (tidak ada)
- Build error

**Solusi**:
- Ubah semua jadi `import { supabase }`
- Remove duplicate `const supabase = createClient()`

**Impact**: Build berhasil tanpa error

---

#### 6. ✅ Fix Missing Sidebar (SELESAI)
**Files**: 9 KPI pages

**Masalah**:
- Semua halaman KPI tidak ada sidebar
- User bingung navigasi

**Solusi**:
- Tambah `<Sidebar />` ke semua halaman KPI
- Layout konsisten

**Impact**: Navigasi lebih mudah

---

#### 7. ✅ Fix Table Names (SELESAI)
**File**: `lib/kpi-calculation.ts`

**Masalah**:
- Pakai tabel salah: `jurnal_musyrif_keasramaan`
- Seharusnya: `formulir_jurnal_musyrif_keasramaan`

**Solusi**:
- Update semua table names
- Jurnal: `formulir_jurnal_musyrif_keasramaan`
- Habit Tracker: `formulir_habit_tracker_keasramaan`

**Impact**: Calculation sekarang ambil data dari tabel yang benar

---

#### 8. ✅ Fix Generate Jadwal Libur Errors (SELESAI)
**Files**: Migration files + API route

**Masalah**:
- Error: "value too long for type character varying(20)"
- Error: Missing columns `jatah_cuti_tahunan`, `sisa_cuti_tahunan`

**Solusi**:
- Ubah status column: VARCHAR(20) → VARCHAR(50)
- Tambah kolom cuti di tabel `musyrif_keasramaan`

**Impact**: Generate jadwal libur sekarang berfungsi

---

#### 9. ⚠️ Update saveKPIResult() - BELUM BERHASIL
**File**: `lib/kpi-calculation.ts`

**Yang Sudah Dilakukan**:
- Fill semua kolom (termasuk duplikat: score_* dan tier*_*)
- Convert periode: `YYYY-MM` → `YYYY-MM-01`
- Calculate `total_hari_bulan` dan `hari_libur`
- Tambah console logs
- Fix duplicate return statement

**Status**: Calculation berhasil, tapi data BELUM tersimpan ke database

**Next**: Perlu investigasi lebih lanjut (lihat Prioritas 1)

---

## 📝 YANG HARUS DIKERJAKAN SELANJUTNYA

### 🔥 PRIORITAS 1: Fix Data Tidak Tersimpan

**Langkah Debug**:

1. **Tambah Log Detail di `saveKPIResult()`**
   ```typescript
   // Di lib/kpi-calculation.ts, tambah log sebelum upsert:
   console.log('🔍 Attempting to save:', {
     nama_musyrif: kpiResult.nama_musyrif,
     periode: periodeDate,
     total_score: kpiResult.total_score
   });
   
   // Setelah upsert, log response:
   console.log('📊 Upsert response:', { error, data });
   ```

2. **Test Calculation**
   - Buka `/admin/kpi-calculation`
   - Pilih: Desember 2024
   - Klik "Hitung KPI (Batch)"
   - Perhatikan console browser DAN server terminal

3. **Cek Database Manual**
   ```sql
   -- Cek apakah data masuk
   SELECT COUNT(*) FROM kpi_summary_keasramaan;
   
   -- Cek data terbaru
   SELECT * FROM kpi_summary_keasramaan 
   ORDER BY created_at DESC LIMIT 5;
   ```

4. **Kemungkinan Masalah**:
   - ❓ Supabase client tidak terkoneksi dengan benar
   - ❓ Permission issue (RLS policy)
   - ❓ Constraint violation yang tidak terdeteksi
   - ❓ Data type mismatch yang belum ketahuan

### 🟡 PRIORITAS 2: Setelah Data Berhasil Tersimpan

**Langkah Verifikasi**:

1. **Cek Dashboard Pages**
   - Dashboard Kepala Sekolah: `/kpi/kepala-sekolah`
   - Dashboard Kepala Asrama: `/kpi/kepala-asrama`
   - Dashboard Musyrif: `/kpi/musyrif/[nama]`
   - Semua harus menampilkan data (tidak kosong)

2. **Cek Data Prerequisite**
   ```sql
   -- Cek apakah ada data untuk calculation
   SELECT 
     (SELECT COUNT(*) FROM formulir_jurnal_musyrif_keasramaan 
      WHERE tanggal >= '2024-12-01') as jurnal,
     (SELECT COUNT(*) FROM formulir_habit_tracker_keasramaan 
      WHERE tanggal >= '2024-12-01') as habit_tracker,
     (SELECT COUNT(*) FROM rapat_koordinasi_keasramaan 
      WHERE tanggal >= '2024-12-01') as rapat;
   ```
   - Jika 0: Score akan rendah (tapi tetap harus tersimpan)
   - Jika ada data: Score harus realistis (50-100)

3. **Test Generate Jadwal Libur**
   - Buka `/manajemen-data/jadwal-libur-musyrif`
   - Klik "Generate Jadwal Rutin"
   - Harus berhasil tanpa error
   - Musyrif harus terpisah per kelas

---

### 🟢 PRIORITAS 3: Fitur Tambahan (Setelah Semua Berfungsi)

#### 4. Add Missing Features 📋

**A. Export Report Feature**
- Dashboard Kepala Sekolah has "Export Report" button (not functional yet)
- Need to implement PDF/Excel export
- **File**: `app/kpi/kepala-sekolah/page.tsx`

**B. Manual Responsiveness Input**
- Tier 2 Koordinasi uses hardcoded 80% for responsiveness
- Need UI for Kepala Asrama to input manual score
- **File**: `lib/kpi-calculation.ts` line ~420

**C. Kehadiran Tracking**
- Tier 3 Kehadiran uses hardcoded 100%
- Need actual attendance tracking system
- **File**: `lib/kpi-calculation.ts` line ~550

**D. Trend 3 Bulan**
- Dashboard shows "Trend 3 Bulan" but not implemented
- Need to fetch last 3 months data and show chart
- **Files**: All dashboard pages

#### 5. Add Validation & Error Handling 🛡️

**A. Prevent Duplicate Generate**
- Check if jadwal libur already exists before generate
- Show warning: "Jadwal untuk periode ini sudah ada"
- **File**: `app/api/kpi/jadwal-libur/generate-rutin/route.ts`

**B. Validate Cuti Quota**
- Check sisa_cuti before approve
- Reject if quota exceeded
- **File**: `app/api/kpi/jadwal-libur/approve/route.ts`

**C. Validate Date Range**
- Ensure tanggal_selesai >= tanggal_mulai
- Prevent past dates
- **Files**: All forms with date inputs

#### 6. Improve UI/UX 🎨

**A. Loading States**
- Add skeleton loaders instead of "Loading..."
- Show progress bar during KPI calculation
- **Files**: All dashboard pages

**B. Empty States**
- Better empty state messages with actions
- "Belum ada data? Klik di sini untuk input"
- **Files**: All list pages

**C. Confirmation Dialogs**
- Replace `confirm()` with custom modal
- Better styling and messaging
- **Files**: All pages with delete/approve actions

---

### 🔵 LOW (Nice to Have)

#### 7. Performance Optimization ⚡

**A. Caching**
- Cache KPI summary data (Redis/Memory)
- Invalidate on recalculation
- Reduce database queries

**B. Pagination**
- Add pagination for large lists
- Limit 20-50 items per page
- **Files**: All list pages

**C. Lazy Loading**
- Load charts/heavy components on demand
- Improve initial page load time

#### 8. Testing 🧪

**A. Unit Tests**
- Test KPI calculation functions
- Test date calculations
- Test score calculations

**B. Integration Tests**
- Test API endpoints
- Test database operations
- Test UPSERT logic

**C. E2E Tests**
- Test complete KPI workflow
- Test user journeys
- Test role-based access

---

## 🗂️ File Structure

### Core Files
```
lib/
  kpi-calculation.ts          # ⭐ Main calculation engine

app/api/kpi/
  summary/route.ts            # Get KPI summary
  calculate/batch/route.ts    # Calculate KPI batch
  jadwal-libur/
    route.ts                  # CRUD jadwal libur
    generate-rutin/route.ts   # Generate jadwal rutin
    approve/route.ts          # Approve/reject cuti
  rapat/
    route.ts                  # CRUD rapat
    kehadiran/route.ts        # CRUD kehadiran
  kolaborasi/
    route.ts                  # CRUD kolaborasi
    rate/route.ts             # Rate kolaborasi
  cuti/route.ts               # Get sisa cuti
  debug-musyrif/route.ts      # Debug endpoint
  debug-summary/route.ts      # Debug endpoint

app/kpi/
  musyrif/[nama]/page.tsx     # Dashboard Musyrif
  kepala-asrama/page.tsx      # Dashboard Kepala Asrama
  kepala-sekolah/page.tsx     # Dashboard Kepala Sekolah

app/koordinasi/
  rapat/page.tsx              # Rapat Koordinasi
  log-kolaborasi/page.tsx     # Log Kolaborasi

app/approval/
  cuti-musyrif/page.tsx       # Approval Cuti

app/manajemen-data/
  jadwal-libur-musyrif/page.tsx  # Jadwal Libur

app/admin/
  kpi-calculation/page.tsx    # ⭐ KPI Calculation Engine
```

### Documentation
```
docs/
  KPI_START.md                      # ⭐ This file (quick start)
  KPI_FINAL_DOCUMENTATION.md        # Complete documentation
  KPI_HABIT_TRACKER_WEEKLY.md       # Habit tracker weekly logic
  KPI_DATA_KOSONG_TROUBLESHOOT.md   # Troubleshooting guide
  KPI_CONTEXT_TRANSFER_FIXES.md     # All fixes applied
  FIX_KPI_CABANG_DYNAMIC.md         # Dynamic cabang implementation
  FIX_GENERATE_JADWAL_LIBUR.md      # Jadwal libur fixes
  JADWAL_LIBUR_BY_KELAS.md          # Grouping by kelas
```

### Migrations
```
supabase/migrations/
  20241210_kpi_system.sql                    # Main KPI tables
  20241210_add_cuti_columns_musyrif.sql      # Add cuti columns
  20241210_fix_status_column_length.sql      # Fix VARCHAR(20) → VARCHAR(50)
  20241210_alter_kpi_summary_table.sql       # Fix table structure
  20241210_create_musyrif_table.sql          # Create musyrif table
```

---

## 🚀 Quick Commands

### Check Data
```sql
-- Check musyrif
SELECT COUNT(*) FROM musyrif_keasramaan WHERE status = 'aktif';

-- Check KPI summary
SELECT COUNT(*) FROM kpi_summary_keasramaan;

-- Check latest KPI
SELECT nama_musyrif, periode, total_score, ranking 
FROM kpi_summary_keasramaan 
ORDER BY periode DESC, ranking ASC 
LIMIT 10;
```

### Calculate KPI
```bash
# Via UI
http://localhost:3000/admin/kpi-calculation

# Via API
curl -X POST http://localhost:3000/api/kpi/calculate/batch \
  -H "Content-Type: application/json" \
  -d '{"bulan": 12, "tahun": 2024}'
```

### Debug
```bash
# Check musyrif data
http://localhost:3000/api/kpi/debug-musyrif?cabang=HSI%20Boarding%20School%20Bekasi

# Check KPI summary
http://localhost:3000/api/kpi/debug-summary
```

---

## 📞 Support

**If you encounter issues**:
1. Check console logs (browser F12 + server terminal)
2. Check database data (SQL queries above)
3. Review documentation in `docs/` folder
4. Check error messages in API responses

**Common Issues**:
- Data not saving → Check table structure and column names
- Empty dashboard → Calculate KPI first
- Low scores → Check prerequisite data (jurnal, habit tracker)
- Import errors → Check Supabase connection

---

## ✅ Checklist Before Continuing

- [ ] Run migration: `20241210_alter_kpi_summary_table.sql`
- [ ] Verify musyrif data exists and has `kelas` column
- [ ] Calculate KPI for December 2024
- [ ] Verify data saved to `kpi_summary_keasramaan`
- [ ] Test Dashboard Kepala Sekolah (should show data)
- [ ] Test Dashboard Kepala Asrama (should show data)
- [ ] Test Dashboard Musyrif (should show data)
- [ ] Generate jadwal libur for December 2024
- [ ] Verify jadwal grouped by kelas correctly

---

**Status**: 🟡 Ready for testing and verification  
**Next Session**: Fix any issues found during testing, then implement medium priority features

**Last Updated**: December 10, 2024


---

## ✅ CHECKLIST STATUS SAAT INI

### Yang Sudah Selesai ✅
- [x] Database structure (semua tabel KPI sudah ada)
- [x] Tabel `kpi_summary_keasramaan` struktur sudah benar (punya kolom duplikat)
- [x] Tabel `musyrif_keasramaan` ada data dan punya kolom `kelas`
- [x] KPI calculation logic (Tier 1, 2, 3) sudah benar
- [x] Habit tracker pakai weekly target (bukan daily)
- [x] Table names sudah benar (formulir_jurnal_*, formulir_habit_tracker_*)
- [x] Dynamic cabang fetching dari database
- [x] Jadwal libur grouped by kelas
- [x] Kepala Sekolah bisa akses menu "Hitung KPI"
- [x] Semua halaman KPI punya Sidebar
- [x] Import errors sudah fix
- [x] Generate jadwal libur berfungsi

### Yang Belum Selesai ❌
- [ ] **Data KPI tidak tersimpan otomatis ke database** ← MASALAH UTAMA
- [ ] Dashboard masih kosong (karena data belum tersimpan)
- [ ] Belum ada data prerequisite untuk testing (jurnal, habit tracker)

### Yang Perlu Dikerjakan Selanjutnya 📋
1. **URGENT**: Fix data tidak tersimpan (tambah log detail, debug Supabase response)
2. Test calculation setelah fix
3. Verify data masuk ke database
4. Test semua dashboard pages
5. Insert data dummy untuk testing (jika perlu)

---

## 📞 UNTUK AI YANG REVIEW DOKUMENTASI INI

**Context**: Sistem KPI untuk Musyrif & Kepala Asrama di HSI Boarding School

**Struktur KPI**:
- Tier 1 (50%): Output - Hasil pembinaan santri (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan)
- Tier 2 (30%): Administrasi - Jurnal, Habit Tracker, Koordinasi, Catatan Perilaku
- Tier 3 (20%): Proses - Completion Rate, Kehadiran, Engagement

**Masalah Saat Ini**:
- User sudah berhasil calculating KPI (proses selesai tanpa error)
- Tapi data tidak otomatis tersimpan ke tabel `kpi_summary_keasramaan`
- Fungsi `saveKPIResult()` di `lib/kpi-calculation.ts` sudah diupdate tapi belum berhasil

**Yang Perlu Dilakukan**:
1. Tambah log detail di `saveKPIResult()` untuk debug
2. Cek Supabase response (error atau success)
3. Cek RLS policy di Supabase (mungkin permission issue)
4. Verify data type match antara code dan database

**File Penting**:
- `lib/kpi-calculation.ts` - Core calculation engine
- `app/api/kpi/calculate/batch/route.ts` - Batch calculation API
- `app/admin/kpi-calculation/page.tsx` - UI untuk calculate KPI
- `supabase/migrations/20241210_alter_kpi_summary_table.sql` - Migration (JANGAN dijalankan, tabel user sudah sesuai)

**Tabel Database**:
- `kpi_summary_keasramaan` - Tabel untuk simpan hasil KPI (struktur sudah benar)
- `musyrif_keasramaan` - Data musyrif (ada data, punya kolom `kelas`)
- `formulir_jurnal_musyrif_keasramaan` - Jurnal harian musyrif
- `formulir_habit_tracker_keasramaan` - Habit tracker santri (input setiap Jumat)
- `cabang_keasramaan` - Data cabang (untuk dynamic fetching)

**Catatan Penting**:
- Habit tracker diinput WEEKLY (setiap Jumat), bukan daily
- Musyrif harus digroup by `kelas` untuk jadwal libur
- Periode format di database: DATE (`YYYY-MM-01`), bukan VARCHAR
- Tabel punya kolom DUPLIKAT (score_* dan tier*_*) untuk compatibility

---

**Last Updated**: December 11, 2024  
**Status**: 🟡 Waiting for fix - Data tidak tersimpan ke database  
**Next Session**: Debug `saveKPIResult()` dan fix data saving issue
