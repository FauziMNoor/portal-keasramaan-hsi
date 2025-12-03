-- =====================================================
-- MIGRATION: KOP Surat Dinamis
-- HSI Boarding School
-- =====================================================

-- =====================================================
-- 1. Tambah Kolom KOP di Tabel Info Sekolah
-- =====================================================
ALTER TABLE info_sekolah_keasramaan
ADD COLUMN IF NOT EXISTS kop_mode TEXT DEFAULT 'dynamic',
ADD COLUMN IF NOT EXISTS kop_template_url TEXT,
ADD COLUMN IF NOT EXISTS kop_content_margin_top INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS kop_content_margin_bottom INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS kop_content_margin_left INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS kop_content_margin_right INTEGER DEFAULT 20;

-- =====================================================
-- 2. Buat Storage Bucket untuk KOP Templates
-- =====================================================
-- Jalankan di Supabase Dashboard → Storage → Create Bucket
-- Nama: kop-templates-keasramaan
-- Public: No (Private)

-- =====================================================
-- 3. Setup Storage Policies
-- =====================================================
-- Jalankan di Supabase Dashboard → Storage → kop-templates-keasramaan → Policies

-- Policy untuk upload
CREATE POLICY "Allow authenticated upload kop templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kop-templates-keasramaan');

-- Policy untuk read
CREATE POLICY "Allow authenticated read kop templates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'kop-templates-keasramaan');

-- Policy untuk delete
CREATE POLICY "Allow authenticated delete kop templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kop-templates-keasramaan');

-- =====================================================
-- 4. Fix RLS Policy untuk Tabel Info Sekolah (PENTING!)
-- =====================================================
-- Jika ada error "violates row-level security policy", jalankan ini:

-- Drop policy lama
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" 
ON info_sekolah_keasramaan;

-- Buat policy baru yang lebih permisif
CREATE POLICY "Enable read access for authenticated users"
ON info_sekolah_keasramaan FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON info_sekolah_keasramaan FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON info_sekolah_keasramaan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON info_sekolah_keasramaan FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 5. Verifikasi
-- =====================================================
-- Cek kolom baru
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'info_sekolah_keasramaan' 
AND column_name LIKE 'kop%'
ORDER BY ordinal_position;

-- Expected Result: 6 kolom
-- kop_mode (text, 'dynamic')
-- kop_template_url (text, NULL)
-- kop_content_margin_top (integer, 40)
-- kop_content_margin_bottom (integer, 30)
-- kop_content_margin_left (integer, 20)
-- kop_content_margin_right (integer, 20)

-- Cek RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;

-- Expected Result: 4 policies
-- Enable delete access for authenticated users (DELETE)
-- Enable insert access for authenticated users (INSERT)
-- Enable read access for authenticated users (SELECT)
-- Enable update access for authenticated users (UPDATE)

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Kolom kop_mode: 'dynamic' atau 'template'
-- 2. Jika mode = 'dynamic': Generate KOP dari data sistem
-- 3. Jika mode = 'template': Gunakan template image sebagai background
-- 4. Margin dalam satuan mm untuk positioning konten
-- 5. RLS policy sudah diperbaiki untuk menghindari error 42501
