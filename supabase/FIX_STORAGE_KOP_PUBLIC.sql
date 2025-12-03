-- =====================================================
-- FIX STORAGE BUCKET KOP TEMPLATE
-- Pastikan bucket bisa diakses untuk generate PDF
-- =====================================================

-- 1. CEK BUCKET YANG ADA
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name LIKE '%kop%' OR name LIKE '%keasramaan%';

-- =====================================================
-- 2. BUAT BUCKET JIKA BELUM ADA
-- =====================================================

-- Buat bucket untuk KOP template
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kop-templates-keasramaan',
    'kop-templates-keasramaan',
    true, -- PUBLIC ACCESS untuk bisa diakses saat generate PDF
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg']::text[];

-- =====================================================
-- 3. SET BUCKET POLICY (PUBLIC READ)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access for KOP Templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read kop templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload kop templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update kop templates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete kop templates" ON storage.objects;

-- Policy untuk PUBLIC READ (penting untuk generate PDF)
CREATE POLICY "Allow public read kop templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kop-templates-keasramaan');

-- Policy untuk AUTHENTICATED UPLOAD
CREATE POLICY "Allow authenticated upload kop templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kop-templates-keasramaan');

-- Policy untuk AUTHENTICATED UPDATE
CREATE POLICY "Allow authenticated update kop templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'kop-templates-keasramaan')
WITH CHECK (bucket_id = 'kop-templates-keasramaan');

-- Policy untuk AUTHENTICATED DELETE
CREATE POLICY "Allow authenticated delete kop templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kop-templates-keasramaan');

-- =====================================================
-- 4. VERIFIKASI BUCKET SETTINGS
-- =====================================================

-- Cek bucket configuration
SELECT 
    name,
    public as is_public,
    file_size_limit / 1024 / 1024 as max_size_mb,
    allowed_mime_types,
    CASE 
        WHEN public = true THEN '✅ PUBLIC - Bisa diakses untuk PDF'
        ELSE '❌ PRIVATE - Perlu diubah ke PUBLIC'
    END as status
FROM storage.buckets
WHERE name = 'kop-templates-keasramaan';

-- Cek policies
SELECT 
    policyname,
    cmd,
    qual,
    CASE 
        WHEN cmd = 'SELECT' AND qual LIKE '%public%' THEN '✅ PUBLIC READ - OK'
        WHEN cmd = 'INSERT' AND qual LIKE '%authenticated%' THEN '✅ AUTH UPLOAD - OK'
        ELSE '⚠️ Check policy'
    END as status
FROM pg_policies
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%kop%';

-- =====================================================
-- 5. TEST URL FORMAT
-- =====================================================

-- Cek format URL yang tersimpan di database
SELECT 
    cabang,
    kop_mode,
    kop_template_url,
    CASE 
        WHEN kop_template_url IS NULL THEN '❌ URL kosong'
        WHEN kop_template_url LIKE 'https://%' THEN '✅ URL valid (https)'
        WHEN kop_template_url LIKE 'http://%' THEN '⚠️ URL http (sebaiknya https)'
        ELSE '❌ URL tidak valid'
    END as url_status,
    CASE 
        WHEN kop_template_url LIKE '%kop-templates-keasramaan%' THEN '✅ Bucket correct'
        ELSE '⚠️ Bucket mungkin salah'
    END as bucket_status
FROM info_sekolah_keasramaan
WHERE kop_mode = 'template';

-- =====================================================
-- 6. CARA MENDAPATKAN PUBLIC URL
-- =====================================================

-- Format URL yang benar untuk Supabase Storage:
-- https://[PROJECT_REF].supabase.co/storage/v1/object/public/kop-templates-keasramaan/[filename]

-- Contoh:
-- https://sirriyah.supabase.co/storage/v1/object/public/kop-templates-keasramaan/kop-sukabumi.png

-- Jika URL di database tidak sesuai format, update dengan query:
-- UPDATE info_sekolah_keasramaan
-- SET kop_template_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/kop-templates-keasramaan/[filename]'
-- WHERE cabang = 'Sukabumi';

-- =====================================================
-- SELESAI
-- =====================================================
-- Setelah jalankan script ini:
-- 1. Bucket sudah PUBLIC
-- 2. Policy sudah benar
-- 3. URL bisa diakses untuk generate PDF
-- 4. Test download surat lagi
