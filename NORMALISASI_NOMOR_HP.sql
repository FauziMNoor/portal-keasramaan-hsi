-- =====================================================
-- NORMALISASI NOMOR HP WALI SANTRI
-- Portal Keasramaan - HSI Boarding School
-- =====================================================

-- Tujuan: Mengubah semua nomor HP ke format 62xxx
-- Alasan: Konsistensi untuk WhatsApp API

-- =====================================================
-- STEP 1: CEK NOMOR HP YANG PERLU DINORMALISASI
-- =====================================================

-- Cek nomor yang diawali 0
SELECT 
  id, 
  nama_siswa, 
  no_hp_wali,
  '62' || SUBSTRING(no_hp_wali FROM 2) AS normalized
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali LIKE '0%'
ORDER BY created_at DESC;

-- Cek nomor yang tidak diawali 62 atau 0
SELECT 
  id, 
  nama_siswa, 
  no_hp_wali,
  '62' || no_hp_wali AS normalized
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali NOT LIKE '62%' 
  AND no_hp_wali NOT LIKE '0%'
  AND no_hp_wali IS NOT NULL
ORDER BY created_at DESC;

-- =====================================================
-- STEP 2: BACKUP DATA SEBELUM UPDATE
-- =====================================================

-- Buat tabel backup (opsional, untuk safety)
CREATE TABLE IF NOT EXISTS backup_nomor_hp_wali AS
SELECT 
  id,
  nama_siswa,
  nis,
  no_hp_wali,
  NOW() AS backup_at
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali IS NOT NULL;

-- Verifikasi backup
SELECT COUNT(*) AS total_backup FROM backup_nomor_hp_wali;

-- =====================================================
-- STEP 3: NORMALISASI NOMOR HP
-- =====================================================

-- Update nomor yang diawali 0 (08xxx → 628xxx)
UPDATE perizinan_kepulangan_keasramaan
SET no_hp_wali = '62' || SUBSTRING(no_hp_wali FROM 2)
WHERE no_hp_wali LIKE '0%';

-- Update nomor yang tidak diawali 62 atau 0 (8xxx → 628xxx)
UPDATE perizinan_kepulangan_keasramaan
SET no_hp_wali = '62' || no_hp_wali
WHERE no_hp_wali NOT LIKE '62%' 
  AND no_hp_wali NOT LIKE '0%'
  AND no_hp_wali IS NOT NULL
  AND LENGTH(no_hp_wali) > 0;

-- Hapus karakter non-digit (spasi, dash, dll)
UPDATE perizinan_kepulangan_keasramaan
SET no_hp_wali = REGEXP_REPLACE(no_hp_wali, '[^0-9]', '', 'g')
WHERE no_hp_wali IS NOT NULL;

-- =====================================================
-- STEP 4: VERIFIKASI HASIL
-- =====================================================

-- Cek semua nomor HP setelah normalisasi
SELECT 
  id,
  nama_siswa,
  no_hp_wali,
  LENGTH(no_hp_wali) AS panjang,
  CASE 
    WHEN no_hp_wali LIKE '62%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END AS status
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali IS NOT NULL
ORDER BY status DESC, created_at DESC;

-- Hitung statistik
SELECT 
  CASE 
    WHEN no_hp_wali LIKE '62%' THEN '✅ Format 62xxx (Valid)'
    WHEN no_hp_wali LIKE '0%' THEN '❌ Format 0xxx (Perlu Update)'
    ELSE '❌ Format Lain (Perlu Update)'
  END AS format_status,
  COUNT(*) AS jumlah
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali IS NOT NULL
GROUP BY format_status
ORDER BY jumlah DESC;

-- =====================================================
-- STEP 5: VALIDASI PANJANG NOMOR
-- =====================================================

-- Nomor HP Indonesia yang valid: 62 + 8-13 digit (total 10-15 karakter)
SELECT 
  id,
  nama_siswa,
  no_hp_wali,
  LENGTH(no_hp_wali) AS panjang,
  CASE 
    WHEN LENGTH(no_hp_wali) BETWEEN 10 AND 15 THEN '✅ Valid'
    WHEN LENGTH(no_hp_wali) < 10 THEN '❌ Terlalu Pendek'
    ELSE '❌ Terlalu Panjang'
  END AS validasi
FROM perizinan_kepulangan_keasramaan
WHERE no_hp_wali IS NOT NULL
ORDER BY validasi DESC, panjang;

-- =====================================================
-- STEP 6: CLEANUP (OPSIONAL)
-- =====================================================

-- Jika sudah yakin semua benar, hapus tabel backup
-- DROP TABLE IF EXISTS backup_nomor_hp_wali;

-- =====================================================
-- CATATAN PENTING
-- =====================================================

/*
1. SELALU BACKUP DATA sebelum menjalankan UPDATE
2. Test di development environment dulu
3. Verifikasi hasil setelah update
4. Format valid: 62xxx (contoh: 628123456789)
5. Panjang valid: 10-15 karakter
6. Jika ada nomor yang invalid, perbaiki manual

CONTOH FORMAT VALID:
- 628123456789 ✅
- 6281234567890 ✅
- 62812345678901 ✅

CONTOH FORMAT INVALID:
- 08123456789 ❌ (harus 628123456789)
- 8123456789 ❌ (harus 628123456789)
- +628123456789 ❌ (hapus +)
- 62-812-3456-789 ❌ (hapus -)
*/

