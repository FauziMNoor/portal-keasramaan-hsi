-- =====================================================
-- RAPOR RLS POLICIES
-- Created: 2024-12-12
-- =====================================================

-- =====================================================
-- 1. Enable RLS untuk tabel rapor
-- =====================================================
ALTER TABLE rapor_kegiatan_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_dokumentasi_lainnya_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_rekap_habit_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_generate_log_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_catatan_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Policies untuk rapor_kegiatan_keasramaan
-- =====================================================

-- Allow authenticated users to select
CREATE POLICY "Allow authenticated users to select kegiatan"
ON rapor_kegiatan_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert kegiatan"
ON rapor_kegiatan_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update kegiatan"
ON rapor_kegiatan_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete kegiatan"
ON rapor_kegiatan_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 3. Policies untuk rapor_dokumentasi_lainnya_keasramaan
-- =====================================================

-- Allow authenticated users to select
CREATE POLICY "Allow authenticated users to select dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 4. Policies untuk rapor_rekap_habit_keasramaan
-- =====================================================

-- Allow authenticated users to select
CREATE POLICY "Allow authenticated users to select rekap"
ON rapor_rekap_habit_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert rekap"
ON rapor_rekap_habit_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update rekap"
ON rapor_rekap_habit_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete rekap"
ON rapor_rekap_habit_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 5. Policies untuk rapor_generate_log_keasramaan
-- =====================================================

-- Allow authenticated users to select
CREATE POLICY "Allow authenticated users to select log"
ON rapor_generate_log_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert log"
ON rapor_generate_log_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- 6. Policies untuk rapor_catatan_keasramaan
-- =====================================================

-- Allow authenticated users to select
CREATE POLICY "Allow authenticated users to select catatan"
ON rapor_catatan_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert catatan"
ON rapor_catatan_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update catatan"
ON rapor_catatan_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete catatan"
ON rapor_catatan_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- ALTERNATIVE: Disable RLS (untuk development/testing)
-- =====================================================
-- Uncomment baris di bawah jika ingin disable RLS sementara untuk testing
-- WARNING: Jangan gunakan di production!

-- ALTER TABLE rapor_kegiatan_keasramaan DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rapor_dokumentasi_lainnya_keasramaan DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rapor_rekap_habit_keasramaan DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rapor_generate_log_keasramaan DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rapor_catatan_keasramaan DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk setup RLS policies

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Policies ini mengizinkan semua authenticated users untuk CRUD
-- 2. Untuk production, bisa ditambahkan logic berdasarkan role/cabang
-- 3. Jika masih error saat insert/update, coba disable RLS sementara
