-- =====================================================
-- QUICK FIX: Semua Error Identitas Sekolah
-- Jalankan script ini untuk fix semua error sekaligus
-- =====================================================

-- =====================================================
-- 1. FIX RLS POLICY - Info Sekolah
-- =====================================================
-- Drop policy lama yang bermasalah
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" 
ON info_sekolah_keasramaan;

-- Buat policy baru yang benar
CREATE POLICY "Enable read access for authenticated users"
ON info_sekolah_keasramaan FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON info_sekolah_keasramaan FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON info_sekolah_keasramaan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON info_sekolah_keasramaan FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 2. VERIFIKASI
-- =====================================================
-- Cek policy yang aktif
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;

-- Expected: 4 policies
-- Enable delete access for authenticated users | DELETE
-- Enable insert access for authenticated users | INSERT
-- Enable read access for authenticated users   | SELECT
-- Enable update access for authenticated users | UPDATE

-- =====================================================
-- 3. TEST INSERT (Optional)
-- =====================================================
-- Uncomment untuk test
/*
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota
) VALUES (
    'Test',
    'Test Sekolah',
    'Test',
    'Test Alamat',
    'Test Kota'
)
ON CONFLICT (cabang) DO NOTHING;

SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'Test';
DELETE FROM info_sekolah_keasramaan WHERE cabang = 'Test';
*/

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah menjalankan script ini:
-- 1. Refresh browser (F5)
-- 2. Coba simpan data lagi
-- 3. Harus berhasil!
