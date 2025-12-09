-- =====================================================
-- FIX RLS: identitas_sekolah_keasramaan (Tabel Lama)
-- =====================================================

-- =====================================================
-- 1. Enable RLS
-- =====================================================
ALTER TABLE identitas_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Drop SEMUA Policy Lama
-- =====================================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'identitas_sekolah_keasramaan'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON identitas_sekolah_keasramaan';
    END LOOP;
END $$;

-- =====================================================
-- 3. Buat Policy Baru (Allow ALL untuk Public)
-- =====================================================
CREATE POLICY "allow_all_public"
ON identitas_sekolah_keasramaan
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. Verifikasi
-- =====================================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'identitas_sekolah_keasramaan';

-- Expected: 1 policy
-- allow_all_public | PERMISSIVE | {public} | ALL

-- =====================================================
-- 5. Cek Data
-- =====================================================
SELECT 
    id,
    nama_sekolah,
    nama_kepala_sekolah,
    alamat,
    no_telepon,
    email,
    website,
    CASE 
        WHEN logo IS NULL OR logo = '' THEN '❌ Kosong'
        WHEN logo LIKE '%supabase%' THEN '✅ Supabase Storage'
        WHEN logo LIKE 'http%' THEN '⚠️ External URL'
        ELSE '❓ Unknown'
    END as logo_status,
    created_at,
    updated_at
FROM identitas_sekolah_keasramaan;

-- =====================================================
-- SELESAI
-- =====================================================
