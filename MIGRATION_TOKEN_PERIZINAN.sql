-- =====================================================
-- MIGRATION: Update Token Perizinan
-- Menambahkan field cabang dan rename keterangan ke deskripsi
-- =====================================================

-- 1. Tambah kolom cabang jika belum ada
ALTER TABLE token_perizinan_keasramaan 
ADD COLUMN IF NOT EXISTS cabang TEXT;

-- 2. Rename kolom keterangan ke deskripsi (jika ada)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'token_perizinan_keasramaan' 
        AND column_name = 'keterangan'
    ) THEN
        ALTER TABLE token_perizinan_keasramaan 
        RENAME COLUMN keterangan TO deskripsi;
    END IF;
END $$;

-- 3. Tambah kolom deskripsi jika belum ada (untuk kasus fresh install)
ALTER TABLE token_perizinan_keasramaan 
ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- 4. Verifikasi struktur tabel
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'token_perizinan_keasramaan'
ORDER BY ordinal_position;

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor jika tabel sudah ada
