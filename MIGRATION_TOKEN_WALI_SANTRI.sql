-- =====================================================
-- MIGRATION: Update struktur tabel token_wali_santri_keasramaan
-- Dari: nama_wali, no_telepon
-- Ke: nama_token, keterangan
-- =====================================================

-- Step 1: Hapus data lama (jika ada)
TRUNCATE TABLE token_wali_santri_keasramaan;

-- Step 2: Hapus kolom lama
ALTER TABLE token_wali_santri_keasramaan 
DROP COLUMN IF EXISTS nama_wali,
DROP COLUMN IF EXISTS no_telepon;

-- Step 3: Tambah kolom baru
ALTER TABLE token_wali_santri_keasramaan 
ADD COLUMN IF NOT EXISTS nama_token TEXT NOT NULL DEFAULT 'Link Wali Santri',
ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Step 4: Hapus default value
ALTER TABLE token_wali_santri_keasramaan 
ALTER COLUMN nama_token DROP DEFAULT;

-- Step 5: Insert token universal pertama
INSERT INTO token_wali_santri_keasramaan (nama_token, keterangan, token)
VALUES 
('Link Wali Santri 2024/2025', 'Link universal untuk semua wali santri semester ganjil', encode(gen_random_bytes(16), 'hex'));

-- =====================================================
-- VERIFIKASI
-- =====================================================
SELECT * FROM token_wali_santri_keasramaan;
