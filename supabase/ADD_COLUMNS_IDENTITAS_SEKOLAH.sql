-- =====================================================
-- ADD COLUMNS: identitas_sekolah_keasramaan
-- Tambah kolom yang dibutuhkan dari tabel baru
-- =====================================================

-- =====================================================
-- 1. Tambah Kolom Baru
-- =====================================================

-- Kolom kota
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS kota TEXT;

-- Kolom kode_pos
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS kode_pos TEXT;

-- Kolom nama_singkat
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS nama_singkat TEXT DEFAULT 'HSI BOARDING SCHOOL';

-- Kolom NIP kepala sekolah
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS nip_kepala_sekolah TEXT;

-- Kolom kepala asrama
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS nama_kepala_asrama TEXT;

ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS nip_kepala_asrama TEXT;

-- Kolom stempel
ALTER TABLE identitas_sekolah_keasramaan 
ADD COLUMN IF NOT EXISTS stempel_url TEXT;

-- =====================================================
-- 2. Verifikasi Struktur Tabel
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'identitas_sekolah_keasramaan'
ORDER BY ordinal_position;

-- Expected columns:
-- id, nama_sekolah, nama_kepala_sekolah, alamat, no_telepon, 
-- email, website, logo, created_at, updated_at,
-- kota, kode_pos, nama_singkat, nip_kepala_sekolah, 
-- nama_kepala_asrama, nip_kepala_asrama, stempel_url

-- =====================================================
-- 3. Cek Data
-- =====================================================
SELECT 
    id,
    nama_sekolah,
    nama_singkat,
    kota,
    nama_kepala_sekolah,
    nama_kepala_asrama,
    CASE 
        WHEN logo IS NULL OR logo = '' THEN '❌ Kosong'
        ELSE '✅ Ada'
    END as logo_status
FROM identitas_sekolah_keasramaan;

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Kolom baru sudah ditambahkan ke tabel lama
-- 2. Sekarang tabel lama punya semua kolom yang dibutuhkan
-- 3. Tidak perlu pakai tabel baru lagi
-- 4. Semua kode tetap pakai tabel lama (tidak perlu update 8 file)
-- 5. 1 row untuk SEMUA cabang (logo, nama sekolah, dll sama)
-- 6. Data cabang dikelola di tabel cabang_keasramaan tersendiri
