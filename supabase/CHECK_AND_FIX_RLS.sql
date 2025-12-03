-- =====================================================
-- CHECK & FIX RLS POLICY
-- Untuk melihat dan memperbaiki policy yang ada
-- =====================================================

-- =====================================================
-- 1. CEK POLICY YANG ADA SEKARANG
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
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;

-- Lihat hasilnya dulu!
-- Jika ada policy yang salah, lanjut ke step 2

-- =====================================================
-- 2. HAPUS SEMUA POLICY (Paksa)
-- =====================================================
-- Jalankan satu per satu, abaikan error "does not exist"

DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON info_sekolah_keasramaan;

-- Cek lagi, harus kosong
SELECT policyname FROM pg_policies WHERE tablename = 'info_sekolah_keasramaan';

-- =====================================================
-- 3. BUAT POLICY BARU YANG BENAR
-- =====================================================

-- Policy SELECT
CREATE POLICY "info_sekolah_select_policy"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Policy INSERT
CREATE POLICY "info_sekolah_insert_policy"
ON info_sekolah_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy UPDATE
CREATE POLICY "info_sekolah_update_policy"
ON info_sekolah_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy DELETE
CREATE POLICY "info_sekolah_delete_policy"
ON info_sekolah_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 4. VERIFIKASI HASIL
-- =====================================================
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;

-- Expected Result: 4 policies
-- info_sekolah_delete_policy | DELETE | true | <null>
-- info_sekolah_insert_policy | INSERT | <null> | true
-- info_sekolah_select_policy | SELECT | true | <null>
-- info_sekolah_update_policy | UPDATE | true | true

-- =====================================================
-- 5. TEST INSERT
-- =====================================================
-- Test apakah bisa insert
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    nama_kepala_sekolah
) VALUES (
    'TestCabang123',
    'Test Sekolah',
    'Test',
    'Test Alamat',
    'Test Kota',
    'Test Kepala Sekolah'
)
ON CONFLICT (cabang) DO NOTHING;

-- Cek hasil
SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'TestCabang123';

-- Hapus test data
DELETE FROM info_sekolah_keasramaan WHERE cabang = 'TestCabang123';

-- =====================================================
-- SELESAI!
-- =====================================================
-- Jika test insert berhasil, berarti policy sudah benar!
-- Refresh browser dan coba simpan data lagi.
