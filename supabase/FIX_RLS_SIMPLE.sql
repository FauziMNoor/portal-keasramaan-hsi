-- =====================================================
-- FIX RLS - SOLUSI PALING SIMPLE
-- Copy paste SEMUA script ini ke Supabase SQL Editor
-- =====================================================

-- =====================================================
-- OPSI 1: DISABLE RLS (Paling Mudah - Untuk Testing)
-- =====================================================
-- Uncomment jika ingin disable RLS sementara
-- ALTER TABLE info_sekolah_keasramaan DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPSI 2: FIX POLICY (Recommended)
-- =====================================================

-- Step 1: Lihat policy yang ada
SELECT policyname FROM pg_policies WHERE tablename = 'info_sekolah_keasramaan';

-- Step 2: Hapus SEMUA policy (paksa, abaikan error)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'info_sekolah_keasramaan'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON info_sekolah_keasramaan', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Verifikasi semua policy sudah terhapus
SELECT policyname FROM pg_policies WHERE tablename = 'info_sekolah_keasramaan';
-- Harus kosong (0 rows)

-- Step 4: Buat policy baru yang PASTI BEKERJA
CREATE POLICY "allow_all_authenticated_select"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_all_authenticated_insert"
ON info_sekolah_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_update"
ON info_sekolah_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_delete"
ON info_sekolah_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- Step 5: Verifikasi policy baru
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'info_sekolah_keasramaan';
-- Harus ada 4 policies

-- =====================================================
-- TEST INSERT
-- =====================================================
-- Test apakah bisa insert (uncomment untuk test)
/*
INSERT INTO info_sekolah_keasramaan (
    cabang, nama_sekolah, nama_singkat, 
    alamat_lengkap, kota, nama_kepala_sekolah
) VALUES (
    'TestABC', 'Test', 'Test', 'Test', 'Test', 'Test'
);

SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'TestABC';
DELETE FROM info_sekolah_keasramaan WHERE cabang = 'TestABC';
*/

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah run script ini:
-- 1. Refresh browser (F5)
-- 2. Logout & login ulang (jika perlu)
-- 3. Coba simpan data
-- 4. HARUS BERHASIL!

-- Jika masih error, gunakan OPSI 1 (disable RLS) untuk testing
