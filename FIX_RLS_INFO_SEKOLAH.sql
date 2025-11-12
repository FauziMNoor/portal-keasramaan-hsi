-- =====================================================
-- FIX RLS POLICY: Info Sekolah Keasramaan
-- Error: new row violates row-level security policy
-- =====================================================

-- =====================================================
-- 1. Drop Policy Lama (Jika Ada)
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" 
ON info_sekolah_keasramaan;

-- =====================================================
-- 2. Buat Policy Baru yang Lebih Permisif
-- =====================================================

-- Policy untuk SELECT (semua authenticated user bisa read)
CREATE POLICY "Enable read access for authenticated users"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk INSERT (semua authenticated user bisa insert)
CREATE POLICY "Enable insert access for authenticated users"
ON info_sekolah_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy untuk UPDATE (semua authenticated user bisa update)
CREATE POLICY "Enable update access for authenticated users"
ON info_sekolah_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy untuk DELETE (semua authenticated user bisa delete)
CREATE POLICY "Enable delete access for authenticated users"
ON info_sekolah_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 3. Verifikasi Policy
-- =====================================================
-- Cek policy yang aktif
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;

-- Expected Result: 4 policies
-- Enable delete access for authenticated users (DELETE)
-- Enable insert access for authenticated users (INSERT)
-- Enable read access for authenticated users (SELECT)
-- Enable update access for authenticated users (UPDATE)

-- =====================================================
-- 4. Test Insert (Optional)
-- =====================================================
-- Test insert data untuk memastikan policy bekerja
-- Ganti 'Test Cabang' dengan cabang yang sesuai

/*
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    no_telepon,
    email,
    nama_kepala_sekolah
) VALUES (
    'Test Cabang',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Test Alamat',
    'Test Kota',
    '(0275) 123456',
    'test@hsiboardingschool.sch.id',
    'Test Kepala Sekolah'
)
ON CONFLICT (cabang) DO UPDATE SET
    nama_sekolah = EXCLUDED.nama_sekolah;

-- Cek hasil
SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'Test Cabang';

-- Hapus test data
DELETE FROM info_sekolah_keasramaan WHERE cabang = 'Test Cabang';
*/

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Policy sekarang mengizinkan semua authenticated user untuk CRUD
-- 2. Jika ingin lebih ketat, bisa tambahkan kondisi berdasarkan role
-- 3. Pastikan user sudah login (authenticated) saat akses halaman
