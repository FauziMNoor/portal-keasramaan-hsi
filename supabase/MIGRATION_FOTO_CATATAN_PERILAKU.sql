-- =====================================================
-- MIGRATION: Upload Foto Catatan Perilaku
-- Deskripsi: Menambahkan fitur upload foto pada catatan perilaku
-- Tanggal: 13 November 2025
-- =====================================================

-- 1. Tambah kolom foto_kegiatan ke tabel catatan_perilaku_keasramaan
ALTER TABLE catatan_perilaku_keasramaan
ADD COLUMN IF NOT EXISTS foto_kegiatan TEXT[] DEFAULT '{}';

-- 2. Tambah comment untuk dokumentasi
COMMENT ON COLUMN catatan_perilaku_keasramaan.foto_kegiatan 
IS 'Array of photo paths from storage bucket catatan-perilaku-keasramaan. Format: YYYY/MM/tipe/timestamp-random.ext';

-- 3. Tambah index untuk performa query dengan foto
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_foto 
ON catatan_perilaku_keasramaan 
USING GIN (foto_kegiatan);

-- 4. Tambah index untuk query berdasarkan ada/tidaknya foto
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_has_foto 
ON catatan_perilaku_keasramaan ((array_length(foto_kegiatan, 1) > 0));

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================
-- CATATAN: Bucket harus dibuat manual di Supabase Dashboard
-- Nama bucket: catatan-perilaku-keasramaan
-- Public: YES (centang!)
-- File size limit: 2MB per file
-- Allowed MIME types: image/*

-- =====================================================
-- RLS POLICIES untuk Storage Bucket
-- =====================================================
-- Jalankan setelah bucket dibuat

-- Policy 1: Public dapat melihat foto (SELECT)
CREATE POLICY "Public can view catatan perilaku photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'catatan-perilaku-keasramaan');

-- Policy 2: Authenticated users dapat upload foto (INSERT)
CREATE POLICY "Authenticated users can upload catatan perilaku photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'catatan-perilaku-keasramaan' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users dapat update foto mereka (UPDATE)
CREATE POLICY "Authenticated users can update catatan perilaku photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catatan-perilaku-keasramaan' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Authenticated users dapat delete foto (DELETE)
CREATE POLICY "Authenticated users can delete catatan perilaku photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catatan-perilaku-keasramaan' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Cek kolom foto_kegiatan sudah ada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'catatan_perilaku_keasramaan'
AND column_name = 'foto_kegiatan';

-- Cek indexes sudah dibuat
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'catatan_perilaku_keasramaan'
AND indexname LIKE '%foto%';

-- Cek storage policies (jalankan setelah bucket dibuat)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%catatan perilaku%';

-- =====================================================
-- TEST DATA (Optional)
-- =====================================================

-- Test insert catatan dengan foto
-- INSERT INTO catatan_perilaku_keasramaan (
--   tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
--   kepala_asrama, musyrif, kategori_perilaku_id, nama_kategori,
--   nama_pelanggaran_kebaikan, poin, dicatat_oleh,
--   tahun_ajaran, semester, foto_kegiatan
-- ) VALUES (
--   'kebaikan', CURRENT_DATE, '12345', 'Test Siswa', 'Pusat', '7A', 'Asrama A',
--   'Kepala Asrama A', 'Musyrif A', 'uuid-kategori', 'Imam Shalat',
--   'Menjadi Imam Shalat Maghrib', 10, 'Admin Test',
--   '2024/2025', 'Ganjil', 
--   ARRAY['2024/11/kebaikan/1730246400000-abc123.jpg', '2024/11/kebaikan/1730246500000-def456.jpg']
-- );

-- Query catatan yang punya foto
-- SELECT id, nama_siswa, nama_kategori, poin, 
--        array_length(foto_kegiatan, 1) as jumlah_foto,
--        foto_kegiatan
-- FROM catatan_perilaku_keasramaan
-- WHERE array_length(foto_kegiatan, 1) > 0
-- ORDER BY created_at DESC
-- LIMIT 10;

-- =====================================================
-- ROLLBACK (Jika diperlukan)
-- =====================================================

-- DROP INDEX IF EXISTS idx_catatan_perilaku_foto;
-- DROP INDEX IF EXISTS idx_catatan_perilaku_has_foto;
-- ALTER TABLE catatan_perilaku_keasramaan DROP COLUMN IF EXISTS foto_kegiatan;

-- =====================================================
-- SELESAI!
-- =====================================================
-- Next steps:
-- 1. Jalankan migration ini di Supabase SQL Editor
-- 2. Buat bucket 'catatan-perilaku-keasramaan' di Storage (MANUAL)
-- 3. Set bucket sebagai PUBLIC
-- 4. Jalankan RLS policies untuk storage
-- 5. Test upload foto
-- =====================================================
