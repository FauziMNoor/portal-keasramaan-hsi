-- =====================================================
-- FIX: Logos Bucket Configuration
-- =====================================================
-- Script ini memastikan bucket 'logos' ada dan memiliki
-- policy yang benar untuk upload dan akses public

-- =====================================================
-- 1. Cek Bucket yang Ada
-- =====================================================
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE name = 'logos';

-- Expected: 1 row dengan name = 'logos'
-- Jika tidak ada, bucket perlu dibuat

-- =====================================================
-- 2. Buat Bucket 'logos' (Jika Belum Ada)
-- =====================================================
-- Bucket untuk logo sekolah/cabang
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'logos',
    'logos',
    true, -- Public bucket agar bisa diakses tanpa auth
    2097152, -- 2MB = 2 * 1024 * 1024 bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];

-- =====================================================
-- 3. Drop Policy Lama (Jika Ada)
-- =====================================================
DROP POLICY IF EXISTS "Allow public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete logos" ON storage.objects;

DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete logos" ON storage.objects;

-- =====================================================
-- 4. Buat Policy Baru untuk Bucket 'logos'
-- =====================================================

-- Policy untuk SELECT/READ (public bisa akses)
CREATE POLICY "Public read logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Policy untuk INSERT/UPLOAD (authenticated user bisa upload)
CREATE POLICY "Authenticated upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Policy untuk UPDATE (authenticated user bisa update)
CREATE POLICY "Authenticated update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- Policy untuk DELETE (authenticated user bisa delete)
CREATE POLICY "Authenticated delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- =====================================================
-- 5. Verifikasi Policy
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%logos%'
ORDER BY policyname;

-- Expected: 4 policies
-- Authenticated delete logos (DELETE, authenticated)
-- Authenticated update logos (UPDATE, authenticated)
-- Authenticated upload logos (INSERT, authenticated)
-- Public read logos (SELECT, public)

-- =====================================================
-- 6. Cek File yang Ada di Bucket
-- =====================================================
SELECT 
    id,
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata->>'size' as size_bytes,
    metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'logos'
ORDER BY created_at DESC;

-- =====================================================
-- 7. Test Upload (Manual via Supabase Dashboard)
-- =====================================================
-- Setelah menjalankan script ini:
-- 1. Buka Supabase Dashboard → Storage → logos bucket
-- 2. Coba upload file gambar manual
-- 3. Jika berhasil, berarti policy sudah benar
-- 4. Kemudian test dari aplikasi

-- =====================================================
-- 8. Cek URL Logo di Database
-- =====================================================
SELECT 
    cabang,
    nama_sekolah,
    logo_url,
    CASE 
        WHEN logo_url IS NULL OR logo_url = '' THEN '❌ Kosong'
        WHEN logo_url LIKE '%supabase%' THEN '✅ Supabase Storage'
        WHEN logo_url LIKE 'http%' THEN '⚠️ External URL'
        ELSE '❓ Unknown'
    END as logo_status,
    created_at,
    updated_at
FROM info_sekolah_keasramaan
ORDER BY cabang;

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Bucket 'logos' sekarang public (bisa diakses tanpa auth)
-- 2. Upload/Update/Delete hanya untuk authenticated user
-- 3. File size limit: 2MB
-- 4. Allowed types: JPG, PNG, SVG, WebP
-- 5. Setelah upload, URL akan otomatis public
-- 6. Format URL: https://[project].supabase.co/storage/v1/object/public/logos/[filename]

-- =====================================================
-- Troubleshooting
-- =====================================================
-- Jika masih error saat upload:
-- 1. Pastikan user sudah login (authenticated)
-- 2. Cek Network tab di browser untuk lihat error detail
-- 3. Cek apakah bucket 'logos' ada di Storage dashboard
-- 4. Cek apakah policies aktif (query #5)
-- 5. Test upload manual via dashboard dulu

