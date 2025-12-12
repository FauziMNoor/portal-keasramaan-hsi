-- =====================================================
-- TEST SCRIPT: KPI System Migration
-- Purpose: Verify all tables, indexes, and constraints
-- =====================================================

-- =====================================================
-- 1. Check All Tables Created
-- =====================================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'jadwal_libur_musyrif_keasramaan',
            'rapat_koordinasi_keasramaan',
            'kehadiran_rapat_keasramaan',
            'log_kolaborasi_keasramaan',
            'kpi_summary_keasramaan',
            'cuti_tahunan_musyrif_keasramaan'
        ) THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '%keasramaan'
ORDER BY table_name;

-- Expected: 6 tables dengan status ✅ Created

-- =====================================================
-- 2. Check Table Structures
-- =====================================================

-- 2.1 Jadwal Libur Musyrif
SELECT 
    'jadwal_libur_musyrif_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'jadwal_libur_musyrif_keasramaan';
-- Expected: 15 columns

-- 2.2 Rapat Koordinasi
SELECT 
    'rapat_koordinasi_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'rapat_koordinasi_keasramaan';
-- Expected: 9 columns

-- 2.3 Kehadiran Rapat
SELECT 
    'kehadiran_rapat_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'kehadiran_rapat_keasramaan';
-- Expected: 5 columns

-- 2.4 Log Kolaborasi
SELECT 
    'log_kolaborasi_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'log_kolaborasi_keasramaan';
-- Expected: 10 columns

-- 2.5 KPI Summary
SELECT 
    'kpi_summary_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'kpi_summary_keasramaan';
-- Expected: 26 columns

-- 2.6 Cuti Tahunan
SELECT 
    'cuti_tahunan_musyrif_keasramaan' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'cuti_tahunan_musyrif_keasramaan';
-- Expected: 8 columns

-- =====================================================
-- 3. Check Indexes Created
-- =====================================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'jadwal_libur_musyrif_keasramaan',
    'rapat_koordinasi_keasramaan',
    'kehadiran_rapat_keasramaan',
    'log_kolaborasi_keasramaan',
    'kpi_summary_keasramaan',
    'cuti_tahunan_musyrif_keasramaan'
)
ORDER BY tablename, indexname;

-- Expected: 15 indexes total
-- jadwal_libur: 4 indexes (musyrif, tanggal, status, jenis)
-- rapat: 2 indexes (tanggal, cabang)
-- kehadiran: 2 indexes (musyrif, rapat)
-- kolaborasi: 3 indexes (musyrif, tanggal, jenis)
-- kpi_summary: 3 indexes (periode, ranking, nama)
-- cuti_tahunan: 2 indexes (musyrif, tahun)

-- =====================================================
-- 4. Check Constraints
-- =====================================================

-- 4.1 Check constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN (
    'jadwal_libur_musyrif_keasramaan',
    'rapat_koordinasi_keasramaan',
    'kehadiran_rapat_keasramaan',
    'log_kolaborasi_keasramaan',
    'kpi_summary_keasramaan',
    'cuti_tahunan_musyrif_keasramaan'
)
ORDER BY tc.table_name, tc.constraint_type;

-- Expected:
-- jadwal_libur: CHECK (jenis_libur), CHECK (status)
-- rapat: CHECK (jenis_rapat)
-- kehadiran: CHECK (status_kehadiran), UNIQUE (rapat_id, nama_musyrif)
-- kolaborasi: CHECK (jenis), CHECK (rating)
-- kpi_summary: CHECK (role), UNIQUE (periode, role, nama, cabang)
-- cuti_tahunan: UNIQUE (nama_musyrif, tahun)

-- =====================================================
-- 5. Check Foreign Keys
-- =====================================================
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'kehadiran_rapat_keasramaan';

-- Expected: 1 foreign key
-- kehadiran_rapat.rapat_id → rapat_koordinasi.id (CASCADE DELETE)

-- =====================================================
-- 6. Check RLS Enabled
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN (
    'jadwal_libur_musyrif_keasramaan',
    'rapat_koordinasi_keasramaan',
    'kehadiran_rapat_keasramaan',
    'log_kolaborasi_keasramaan',
    'kpi_summary_keasramaan',
    'cuti_tahunan_musyrif_keasramaan'
)
ORDER BY tablename;

-- Expected: All tables should have rowsecurity = true

-- =====================================================
-- 7. Check RLS Policies
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN (
    'jadwal_libur_musyrif_keasramaan',
    'rapat_koordinasi_keasramaan',
    'kehadiran_rapat_keasramaan',
    'log_kolaborasi_keasramaan',
    'kpi_summary_keasramaan',
    'cuti_tahunan_musyrif_keasramaan'
)
ORDER BY tablename, policyname;

-- Expected: 6 policies (1 per table)
-- All policies: "Allow all on [table_name]" with cmd = ALL

-- =====================================================
-- 8. Test INSERT Operations
-- =====================================================

-- 8.1 Test Jadwal Libur
INSERT INTO jadwal_libur_musyrif_keasramaan (
    nama_musyrif,
    cabang,
    asrama,
    tanggal_mulai,
    tanggal_selesai,
    jenis_libur,
    keterangan,
    status
) VALUES (
    'Test Musyrif',
    'Test Cabang',
    'Test Asrama',
    '2024-12-14',
    '2024-12-15',
    'rutin',
    'Test libur rutin',
    'approved_kepala_sekolah'
);

-- 8.2 Test Rapat
INSERT INTO rapat_koordinasi_keasramaan (
    tanggal,
    waktu,
    jenis_rapat,
    cabang,
    kepala_asrama,
    musyrif_list,
    agenda
) VALUES (
    '2024-12-15',
    '14:00',
    'mingguan',
    'Test Cabang',
    'Test Kepala Asrama',
    ARRAY['Test Musyrif 1', 'Test Musyrif 2'],
    'Test agenda rapat'
);

-- 8.3 Test Log Kolaborasi
INSERT INTO log_kolaborasi_keasramaan (
    tanggal,
    nama_musyrif,
    cabang,
    asrama,
    jenis,
    deskripsi,
    kolaborator,
    rating
) VALUES (
    '2024-12-10',
    'Test Musyrif',
    'Test Cabang',
    'Test Asrama',
    'sharing_tips',
    'Test sharing tips pembinaan',
    ARRAY['Test Musyrif 2'],
    5
);

-- 8.4 Test Cuti Tahunan
INSERT INTO cuti_tahunan_musyrif_keasramaan (
    nama_musyrif,
    cabang,
    tahun,
    jatah_cuti,
    cuti_terpakai,
    sisa_cuti
) VALUES (
    'Test Musyrif',
    'Test Cabang',
    2024,
    12,
    0,
    12
);

-- =====================================================
-- 9. Verify Test Data
-- =====================================================

-- 9.1 Check Jadwal Libur
SELECT * FROM jadwal_libur_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

-- 9.2 Check Rapat
SELECT * FROM rapat_koordinasi_keasramaan 
WHERE cabang = 'Test Cabang';

-- 9.3 Check Log Kolaborasi
SELECT * FROM log_kolaborasi_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

-- 9.4 Check Cuti Tahunan
SELECT * FROM cuti_tahunan_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

-- =====================================================
-- 10. Test UPDATE Operations
-- =====================================================

-- Update jadwal libur
UPDATE jadwal_libur_musyrif_keasramaan 
SET keterangan = 'Updated test libur'
WHERE nama_musyrif = 'Test Musyrif';

-- Verify update
SELECT keterangan FROM jadwal_libur_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';
-- Expected: 'Updated test libur'

-- =====================================================
-- 11. Test DELETE Operations
-- =====================================================

-- Delete test data
DELETE FROM jadwal_libur_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

DELETE FROM rapat_koordinasi_keasramaan 
WHERE cabang = 'Test Cabang';

DELETE FROM log_kolaborasi_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

DELETE FROM cuti_tahunan_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';

-- Verify deletion
SELECT COUNT(*) as remaining_test_data
FROM jadwal_libur_musyrif_keasramaan 
WHERE nama_musyrif = 'Test Musyrif';
-- Expected: 0

-- =====================================================
-- 12. Test CASCADE DELETE
-- =====================================================

-- Insert rapat
INSERT INTO rapat_koordinasi_keasramaan (
    tanggal, waktu, jenis_rapat, cabang, agenda
) VALUES (
    '2024-12-15', '14:00', 'mingguan', 'Test Cabang', 'Test'
) RETURNING id;

-- Note the returned ID, then insert kehadiran
-- Replace [rapat_id] with actual ID from above
/*
INSERT INTO kehadiran_rapat_keasramaan (
    rapat_id, nama_musyrif, status_kehadiran
) VALUES (
    '[rapat_id]', 'Test Musyrif', 'hadir'
);

-- Delete rapat (should cascade delete kehadiran)
DELETE FROM rapat_koordinasi_keasramaan WHERE id = '[rapat_id]';

-- Verify cascade delete
SELECT COUNT(*) FROM kehadiran_rapat_keasramaan WHERE rapat_id = '[rapat_id]';
-- Expected: 0 (kehadiran deleted automatically)
*/

-- =====================================================
-- 13. Summary Report
-- =====================================================

SELECT 
    '✅ Migration Test Complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name LIKE '%keasramaan' 
     AND table_name IN (
         'jadwal_libur_musyrif_keasramaan',
         'rapat_koordinasi_keasramaan',
         'kehadiran_rapat_keasramaan',
         'log_kolaborasi_keasramaan',
         'kpi_summary_keasramaan',
         'cuti_tahunan_musyrif_keasramaan'
     )) as tables_created,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename IN (
         'jadwal_libur_musyrif_keasramaan',
         'rapat_koordinasi_keasramaan',
         'kehadiran_rapat_keasramaan',
         'log_kolaborasi_keasramaan',
         'kpi_summary_keasramaan',
         'cuti_tahunan_musyrif_keasramaan'
     )) as indexes_created,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename IN (
         'jadwal_libur_musyrif_keasramaan',
         'rapat_koordinasi_keasramaan',
         'kehadiran_rapat_keasramaan',
         'log_kolaborasi_keasramaan',
         'kpi_summary_keasramaan',
         'cuti_tahunan_musyrif_keasramaan'
     )) as policies_created;

-- Expected:
-- tables_created: 6
-- indexes_created: 15+
-- policies_created: 6

-- =====================================================
-- DONE!
-- =====================================================
-- Next Steps:
-- 1. If all tests pass, migration is successful ✅
-- 2. Proceed to implement API endpoints
-- 3. Build frontend UI
-- 4. Implement KPI calculation engine

-- =====================================================
