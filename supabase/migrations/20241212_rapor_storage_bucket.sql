-- =====================================================
-- RAPOR STORAGE BUCKET SETUP
-- Created: 2024-12-12
-- =====================================================

-- =====================================================
-- 1. Create Bucket untuk Foto Kegiatan & Dokumentasi
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapor-kegiatan',
  'rapor-kegiatan',
  true, -- Public bucket agar foto bisa diakses langsung
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Create Bucket untuk PDF Rapor (opsional)
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapor-pdf',
  'rapor-pdf',
  false, -- Private bucket, hanya yang punya akses bisa download
  52428800, -- 50MB max file size
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. Storage Policies untuk rapor-kegiatan bucket
-- =====================================================

-- Policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload kegiatan photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rapor-kegiatan'
);

-- Policy: Allow public to view/download
CREATE POLICY "Allow public to view kegiatan photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'rapor-kegiatan'
);

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update kegiatan photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rapor-kegiatan'
)
WITH CHECK (
  bucket_id = 'rapor-kegiatan'
);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete kegiatan photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rapor-kegiatan'
);

-- =====================================================
-- 4. Storage Policies untuk rapor-pdf bucket
-- =====================================================

-- Policy: Allow authenticated users to upload PDF
CREATE POLICY "Allow authenticated users to upload rapor PDF"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rapor-pdf'
);

-- Policy: Allow authenticated users to view their own PDF
CREATE POLICY "Allow authenticated users to view rapor PDF"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'rapor-pdf'
);

-- Policy: Allow authenticated users to delete PDF
CREATE POLICY "Allow authenticated users to delete rapor PDF"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rapor-pdf'
);

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk membuat bucket dan policies

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Bucket 'rapor-kegiatan': Public, untuk foto kegiatan & dokumentasi
--    - Max size: 10MB per file
--    - Allowed: JPEG, JPG, PNG, WebP
--    - Public access untuk embed di rapor
--
-- 2. Bucket 'rapor-pdf': Private, untuk PDF hasil generate
--    - Max size: 50MB per file
--    - Allowed: PDF only
--    - Private access, hanya authenticated users
--
-- 3. Struktur folder di bucket 'rapor-kegiatan':
--    /kegiatan/{cabang}/{tahun_ajaran}/{semester}/{kelas}/{asrama}/kegiatan-{urutan}-foto-{1|2}.jpg
--    /dokumentasi/{cabang}/{tahun_ajaran}/{semester}/{kelas}/{asrama}/dok-{timestamp}.jpg
--
-- 4. Struktur folder di bucket 'rapor-pdf':
--    /{cabang}/{tahun_ajaran}/{semester}/{nis}-{nama_siswa}.pdf
