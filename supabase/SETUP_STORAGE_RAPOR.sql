-- =====================================================
-- SETUP STORAGE BUCKETS FOR MANAJEMEN RAPOR
-- =====================================================
-- File: SETUP_STORAGE_RAPOR.sql
-- Description: Setup Supabase Storage buckets dan policies untuk Manajemen Rapor
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket untuk galeri kegiatan
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kegiatan-galeri',
  'kegiatan-galeri',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk cover template rapor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapor-covers',
  'rapor-covers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk generated PDF rapor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapor-pdf',
  'rapor-pdf',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES - kegiatan-galeri
-- =====================================================

-- Policy: Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload kegiatan photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kegiatan-galeri'
);

-- Policy: Allow public read access to kegiatan photos
CREATE POLICY "Allow public read access to kegiatan photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'kegiatan-galeri'
);

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update kegiatan photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kegiatan-galeri'
)
WITH CHECK (
  bucket_id = 'kegiatan-galeri'
);

-- Policy: Allow authenticated users to delete photos
CREATE POLICY "Allow authenticated users to delete kegiatan photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kegiatan-galeri'
);

-- =====================================================
-- 3. STORAGE POLICIES - rapor-covers
-- =====================================================

-- Policy: Allow authenticated users to upload cover images
CREATE POLICY "Allow authenticated users to upload rapor covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rapor-covers'
);

-- Policy: Allow public read access to cover images
CREATE POLICY "Allow public read access to rapor covers"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'rapor-covers'
);

-- Policy: Allow authenticated users to update covers
CREATE POLICY "Allow authenticated users to update rapor covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rapor-covers'
)
WITH CHECK (
  bucket_id = 'rapor-covers'
);

-- Policy: Allow authenticated users to delete covers
CREATE POLICY "Allow authenticated users to delete rapor covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rapor-covers'
);

-- =====================================================
-- 4. STORAGE POLICIES - rapor-pdf
-- =====================================================

-- Policy: Allow authenticated users to upload PDFs
CREATE POLICY "Allow authenticated users to upload rapor PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rapor-pdf'
);

-- Policy: Allow public read access to PDFs (via token/link)
CREATE POLICY "Allow public read access to rapor PDFs"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'rapor-pdf'
);

-- Policy: Allow authenticated users to update PDFs
CREATE POLICY "Allow authenticated users to update rapor PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rapor-pdf'
)
WITH CHECK (
  bucket_id = 'rapor-pdf'
);

-- Policy: Allow authenticated users to delete PDFs
CREATE POLICY "Allow authenticated users to delete rapor PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rapor-pdf'
);

-- =====================================================
-- 5. VERIFY SETUP
-- =====================================================

-- Check if buckets are created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('kegiatan-galeri', 'rapor-covers', 'rapor-pdf');

-- Check if policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%kegiatan%' 
  OR policyname LIKE '%rapor%'
ORDER BY policyname;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Buckets dibuat dengan public = true untuk akses public URL
-- 2. File size limits:
--    - kegiatan-galeri: 5MB per file
--    - rapor-covers: 10MB per file
--    - rapor-pdf: 50MB per file
-- 3. Allowed MIME types sudah dibatasi sesuai kebutuhan
-- 4. RLS policies memastikan:
--    - Authenticated users dapat upload/update/delete
--    - Public dapat read (untuk akses via URL)
-- 5. Jika bucket sudah ada, INSERT akan di-skip (ON CONFLICT DO NOTHING)
-- =====================================================

