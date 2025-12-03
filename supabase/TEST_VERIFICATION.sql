-- =====================================================
-- TEST & VERIFICATION SCRIPT
-- Upload Bukti & Cetak Surat Izin Kepulangan
-- =====================================================

-- =====================================================
-- 1. VERIFIKASI KOLOM BARU DI PERIZINAN
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan' 
AND column_name LIKE 'bukti%'
ORDER BY ordinal_position;

-- Expected Result: 3 kolom
-- bukti_formulir_url (text, YES, NULL)
-- bukti_formulir_uploaded_at (timestamp, YES, NULL)
-- bukti_formulir_uploaded_by (text, YES, NULL)

-- =====================================================
-- 2. VERIFIKASI TABEL INFO SEKOLAH
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'info_sekolah_keasramaan';

-- Expected Result: 1 row (info_sekolah_keasramaan, BASE TABLE)

-- =====================================================
-- 3. VERIFIKASI STRUKTUR TABEL INFO SEKOLAH
-- =====================================================
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'info_sekolah_keasramaan'
ORDER BY ordinal_position;

-- Expected Result: 17 kolom
-- id, cabang, nama_sekolah, nama_singkat, alamat_lengkap, kota, kode_pos,
-- no_telepon, email, website, nama_kepala_sekolah, nip_kepala_sekolah,
-- nama_kepala_asrama, nip_kepala_asrama, logo_url, stempel_url,
-- created_at, updated_at

-- =====================================================
-- 4. VERIFIKASI DATA INFO SEKOLAH
-- =====================================================
SELECT 
    cabang,
    nama_sekolah,
    nama_singkat,
    kota,
    nama_kepala_sekolah,
    nama_kepala_asrama,
    created_at
FROM info_sekolah_keasramaan;

-- Expected Result: Minimal 1 row untuk cabang 'Purworejo'

-- =====================================================
-- 5. VERIFIKASI RLS POLICIES
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

-- Expected Result: 4 policies
-- Allow authenticated users to delete info sekolah (DELETE)
-- Allow authenticated users to insert info sekolah (INSERT)
-- Allow authenticated users to read info sekolah (SELECT)
-- Allow authenticated users to update info sekolah (UPDATE)

-- =====================================================
-- 6. VERIFIKASI INDEXES
-- =====================================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'info_sekolah_keasramaan';

-- Expected Result: 2 indexes
-- info_sekolah_keasramaan_pkey (PRIMARY KEY)
-- idx_info_sekolah_cabang (INDEX)

-- =====================================================
-- 7. VERIFIKASI TRIGGERS
-- =====================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'info_sekolah_keasramaan';

-- Expected Result: 1 trigger
-- trigger_update_info_sekolah_timestamp (BEFORE UPDATE)

-- =====================================================
-- 8. VERIFIKASI FUNCTIONS
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'update_info_sekolah_timestamp';

-- Expected Result: 1 function
-- update_info_sekolah_timestamp (FUNCTION, trigger)

-- =====================================================
-- 9. TEST INSERT DATA INFO SEKOLAH
-- =====================================================
-- Test insert data baru (ganti cabang jika perlu)
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    no_telepon,
    email,
    nama_kepala_sekolah,
    nama_kepala_asrama
) VALUES (
    'Test Cabang',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Test Alamat No. 999',
    'Test Kota',
    '(0275) 999999',
    'test@hsiboardingschool.sch.id',
    'Dr. H. Test Kepala Sekolah, M.Pd.',
    'Ustadz Test Kepala Asrama, S.Pd.I.'
)
ON CONFLICT (cabang) DO NOTHING;

-- Cek hasil insert
SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'Test Cabang';

-- =====================================================
-- 10. TEST UPDATE DATA INFO SEKOLAH
-- =====================================================
-- Test update data
UPDATE info_sekolah_keasramaan
SET 
    no_telepon = '(0275) 888888',
    email = 'updated@hsiboardingschool.sch.id'
WHERE cabang = 'Test Cabang';

-- Cek hasil update (updated_at harus berubah)
SELECT 
    cabang,
    no_telepon,
    email,
    created_at,
    updated_at
FROM info_sekolah_keasramaan 
WHERE cabang = 'Test Cabang';

-- =====================================================
-- 11. TEST UPDATE PERIZINAN DENGAN BUKTI
-- =====================================================
-- Ambil 1 perizinan untuk test
SELECT 
    id,
    nama_siswa,
    status,
    bukti_formulir_url
FROM perizinan_kepulangan_keasramaan
LIMIT 1;

-- Update dengan bukti (ganti ID sesuai hasil query di atas)
-- UPDATE perizinan_kepulangan_keasramaan
-- SET 
--     bukti_formulir_url = 'https://example.com/test-bukti.jpg',
--     bukti_formulir_uploaded_at = NOW(),
--     bukti_formulir_uploaded_by = 'Test User'
-- WHERE id = 'GANTI_DENGAN_ID_DARI_QUERY_ATAS';

-- =====================================================
-- 12. VERIFIKASI PERIZINAN DENGAN BUKTI
-- =====================================================
SELECT 
    id,
    nama_siswa,
    nis,
    status,
    bukti_formulir_url,
    bukti_formulir_uploaded_at,
    bukti_formulir_uploaded_by
FROM perizinan_kepulangan_keasramaan
WHERE bukti_formulir_url IS NOT NULL
ORDER BY bukti_formulir_uploaded_at DESC
LIMIT 5;

-- =====================================================
-- 13. STATISTIK PERIZINAN DENGAN BUKTI
-- =====================================================
SELECT 
    status,
    COUNT(*) as total,
    COUNT(bukti_formulir_url) as dengan_bukti,
    COUNT(*) - COUNT(bukti_formulir_url) as tanpa_bukti
FROM perizinan_kepulangan_keasramaan
GROUP BY status
ORDER BY status;

-- =====================================================
-- 14. CLEANUP TEST DATA (OPSIONAL)
-- =====================================================
-- Hapus data test jika sudah selesai testing
-- DELETE FROM info_sekolah_keasramaan WHERE cabang = 'Test Cabang';

-- =====================================================
-- 15. SUMMARY VERIFICATION
-- =====================================================
-- Jalankan query ini untuk summary lengkap
SELECT 
    'Kolom Bukti di Perizinan' as check_item,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ OK'
        ELSE '❌ GAGAL'
    END as status
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan' 
AND column_name LIKE 'bukti%'

UNION ALL

SELECT 
    'Tabel Info Sekolah' as check_item,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ OK'
        ELSE '❌ GAGAL'
    END as status
FROM information_schema.tables
WHERE table_name = 'info_sekolah_keasramaan'

UNION ALL

SELECT 
    'Data Info Sekolah' as check_item,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ OK'
        ELSE '❌ GAGAL'
    END as status
FROM info_sekolah_keasramaan

UNION ALL

SELECT 
    'RLS Policies' as check_item,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ OK'
        ELSE '❌ GAGAL'
    END as status
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'

UNION ALL

SELECT 
    'Trigger Update Timestamp' as check_item,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ OK'
        ELSE '❌ GAGAL'
    END as status
FROM information_schema.triggers
WHERE event_object_table = 'info_sekolah_keasramaan';

-- =====================================================
-- EXPECTED RESULT SUMMARY:
-- =====================================================
-- Kolom Bukti di Perizinan     | ✅ OK
-- Tabel Info Sekolah           | ✅ OK
-- Data Info Sekolah            | ✅ OK
-- RLS Policies                 | ✅ OK
-- Trigger Update Timestamp     | ✅ OK

-- Jika semua ✅ OK, migration berhasil!
-- Jika ada ❌ GAGAL, cek query detail di atas untuk troubleshooting

-- =====================================================
-- SELESAI
-- =====================================================
