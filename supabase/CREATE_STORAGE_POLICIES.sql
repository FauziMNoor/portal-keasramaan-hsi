-- ============================================
-- STORAGE POLICIES untuk bucket user-photos
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- setelah bucket user-photos dibuat
-- ============================================

-- 1. Enable RLS pada bucket (jika belum)
-- Biasanya sudah otomatis enabled

-- 2. Policy untuk PUBLIC READ (semua orang bisa lihat foto)
CREATE POLICY "Public Access untuk melihat foto user"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-photos');

-- 3. Policy untuk AUTHENTICATED UPLOAD (user login bisa upload)
CREATE POLICY "Authenticated users dapat upload foto"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.role() = 'authenticated'
);

-- 4. Policy untuk AUTHENTICATED UPDATE (user login bisa update)
CREATE POLICY "Authenticated users dapat update foto"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-photos' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.role() = 'authenticated'
);

-- 5. Policy untuk AUTHENTICATED DELETE (user login bisa delete)
CREATE POLICY "Authenticated users dapat delete foto"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-photos' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFIKASI
-- ============================================
-- Cek policies yang sudah dibuat:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- ============================================
-- NOTES
-- ============================================
-- 1. Public Access (SELECT) = Semua orang bisa lihat foto via URL
-- 2. Authenticated (INSERT/UPDATE/DELETE) = Hanya user login yang bisa upload/edit/hapus
-- 3. Bucket harus sudah dibuat dengan nama 'user-photos'
-- 4. Bucket harus di-set sebagai PUBLIC bucket
