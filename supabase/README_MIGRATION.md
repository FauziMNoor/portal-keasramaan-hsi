# 🗄️ Database Migration - KPI System

## 📋 Overview

Panduan lengkap untuk menjalankan migration database Sistem KPI.

---

## 📁 File Migration

1. **20241210_kpi_system.sql** - Main migration script
2. **TEST_KPI_MIGRATION.sql** - Test & verification script
3. **SEED_KPI_DATA.sql** - Sample data untuk testing

---

## 🚀 Step-by-Step Migration

### Step 1: Backup Database (Recommended)

Sebelum run migration, backup database terlebih dahulu:

1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Klik "Database" → "Backups"
4. Klik "Create Backup"

---

### Step 2: Run Migration Script

1. **Open Supabase SQL Editor**
   - Login ke Supabase Dashboard
   - Pilih project Anda
   - Klik "SQL Editor" di sidebar

2. **Create New Query**
   - Klik "New query"
   - Beri nama: "KPI System Migration"

3. **Copy-Paste Migration Script**
   - Buka file `20241210_kpi_system.sql`
   - Copy semua isi file
   - Paste ke SQL Editor

4. **Run Migration**
   - Klik tombol "Run" (atau Ctrl+Enter)
   - Tunggu hingga selesai
   - Check output untuk errors

**Expected Output:**
```
Success. No rows returned
```

---

### Step 3: Verify Migration

1. **Run Test Script**
   - Create new query
   - Copy-paste isi `TEST_KPI_MIGRATION.sql`
   - Run script

2. **Check Results**
   - Verify 6 tables created
   - Verify 15+ indexes created
   - Verify 6 RLS policies created
   - All tests should pass ✅

**Expected Results:**
```sql
-- 1. Check All Tables Created
✅ jadwal_libur_musyrif_keasramaan - Created
✅ rapat_koordinasi_keasramaan - Created
✅ kehadiran_rapat_keasramaan - Created
✅ log_kolaborasi_keasramaan - Created
✅ kpi_summary_keasramaan - Created
✅ cuti_tahunan_musyrif_keasramaan - Created

-- 2. Summary Report
tables_created: 6
indexes_created: 15+
policies_created: 6
```

---

### Step 4: Insert Seed Data (Optional)

Untuk testing, insert sample data:

1. **Run Seed Script**
   - Create new query
   - Copy-paste isi `SEED_KPI_DATA.sql`
   - Run script

2. **Verify Data**
   ```sql
   SELECT COUNT(*) FROM cuti_tahunan_musyrif_keasramaan;
   -- Expected: 10 records
   
   SELECT COUNT(*) FROM jadwal_libur_musyrif_keasramaan;
   -- Expected: 20 records
   
   SELECT COUNT(*) FROM rapat_koordinasi_keasramaan;
   -- Expected: 5 records
   ```

---

## ✅ Verification Checklist

### Tables Created
- [ ] jadwal_libur_musyrif_keasramaan
- [ ] rapat_koordinasi_keasramaan
- [ ] kehadiran_rapat_keasramaan
- [ ] log_kolaborasi_keasramaan
- [ ] kpi_summary_keasramaan
- [ ] cuti_tahunan_musyrif_keasramaan

### Indexes Created
- [ ] idx_libur_musyrif
- [ ] idx_libur_tanggal
- [ ] idx_libur_status
- [ ] idx_libur_jenis
- [ ] idx_rapat_tanggal
- [ ] idx_rapat_cabang
- [ ] idx_kehadiran_musyrif
- [ ] idx_kehadiran_rapat
- [ ] idx_kolaborasi_musyrif
- [ ] idx_kolaborasi_tanggal
- [ ] idx_kolaborasi_jenis
- [ ] idx_kpi_periode
- [ ] idx_kpi_ranking
- [ ] idx_kpi_nama
- [ ] idx_cuti_musyrif
- [ ] idx_cuti_tahun

### RLS Policies
- [ ] Allow all on jadwal_libur_musyrif_keasramaan
- [ ] Allow all on rapat_koordinasi_keasramaan
- [ ] Allow all on kehadiran_rapat_keasramaan
- [ ] Allow all on log_kolaborasi_keasramaan
- [ ] Allow all on kpi_summary_keasramaan
- [ ] Allow all on cuti_tahunan_musyrif_keasramaan

### Constraints
- [ ] CHECK constraints (jenis_libur, status, jenis_rapat, dll)
- [ ] UNIQUE constraints (rapat_id + nama_musyrif, periode + role + nama + cabang, dll)
- [ ] FOREIGN KEY (kehadiran_rapat.rapat_id → rapat_koordinasi.id)

---

## 🧪 Testing

### Test INSERT
```sql
-- Test insert jadwal libur
INSERT INTO jadwal_libur_musyrif_keasramaan (
    nama_musyrif, cabang, asrama, tanggal_mulai, tanggal_selesai, jenis_libur
) VALUES (
    'Test Musyrif', 'Test Cabang', 'Test Asrama', 
    '2024-12-14', '2024-12-15', 'rutin'
);

-- Verify
SELECT * FROM jadwal_libur_musyrif_keasramaan WHERE nama_musyrif = 'Test Musyrif';
```

### Test UPDATE
```sql
UPDATE jadwal_libur_musyrif_keasramaan 
SET keterangan = 'Updated'
WHERE nama_musyrif = 'Test Musyrif';
```

### Test DELETE
```sql
DELETE FROM jadwal_libur_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';
```

### Test CASCADE DELETE
```sql
-- Insert rapat
INSERT INTO rapat_koordinasi_keasramaan (
    tanggal, waktu, jenis_rapat, cabang, agenda
) VALUES (
    '2024-12-15', '14:00', 'mingguan', 'Test', 'Test'
) RETURNING id;

-- Insert kehadiran (use returned ID)
INSERT INTO kehadiran_rapat_keasramaan (
    rapat_id, nama_musyrif, status_kehadiran
) VALUES (
    '[rapat_id]', 'Test Musyrif', 'hadir'
);

-- Delete rapat (should cascade delete kehadiran)
DELETE FROM rapat_koordinasi_keasramaan WHERE id = '[rapat_id]';

-- Verify kehadiran deleted
SELECT COUNT(*) FROM kehadiran_rapat_keasramaan WHERE rapat_id = '[rapat_id]';
-- Expected: 0
```

---

## ❌ Troubleshooting

### Error: "relation already exists"
**Solution:** Tabel sudah ada. Drop tabel terlebih dahulu atau skip migration.

```sql
-- Drop all tables (CAUTION: This will delete all data!)
DROP TABLE IF EXISTS kehadiran_rapat_keasramaan CASCADE;
DROP TABLE IF EXISTS rapat_koordinasi_keasramaan CASCADE;
DROP TABLE IF EXISTS log_kolaborasi_keasramaan CASCADE;
DROP TABLE IF EXISTS jadwal_libur_musyrif_keasramaan CASCADE;
DROP TABLE IF EXISTS kpi_summary_keasramaan CASCADE;
DROP TABLE IF EXISTS cuti_tahunan_musyrif_keasramaan CASCADE;

-- Then run migration again
```

### Error: "permission denied"
**Solution:** Pastikan Anda login sebagai owner/admin project.

### Error: "syntax error"
**Solution:** Pastikan copy-paste script lengkap tanpa ada yang terpotong.

---

## 🔄 Rollback Migration

Jika perlu rollback (undo migration):

```sql
-- Drop all tables
DROP TABLE IF EXISTS kehadiran_rapat_keasramaan CASCADE;
DROP TABLE IF EXISTS rapat_koordinasi_keasramaan CASCADE;
DROP TABLE IF EXISTS log_kolaborasi_keasramaan CASCADE;
DROP TABLE IF EXISTS jadwal_libur_musyrif_keasramaan CASCADE;
DROP TABLE IF EXISTS kpi_summary_keasramaan CASCADE;
DROP TABLE IF EXISTS cuti_tahunan_musyrif_keasramaan CASCADE;

-- Restore from backup
-- (Use Supabase Dashboard → Database → Backups → Restore)
```

---

## 📊 Post-Migration

Setelah migration berhasil:

1. ✅ Verify semua tabel & indexes created
2. ✅ Run test script untuk validasi
3. ✅ Insert seed data (optional)
4. ✅ Update checklist di `KPI_IMPLEMENTATION_CHECKLIST.md`
5. ⏭️ Proceed to Week 2: Backend API

---

## 📞 Support

Jika ada masalah:
1. Check error message di SQL Editor
2. Review migration script
3. Check Supabase logs
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Ready to Run

---

**Good Luck with Migration! 🚀**
