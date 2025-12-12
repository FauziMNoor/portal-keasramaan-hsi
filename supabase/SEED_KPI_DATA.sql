-- =====================================================
-- SEED DATA: KPI System
-- Purpose: Insert sample data for testing
-- =====================================================

-- =====================================================
-- 1. Seed Cuti Tahunan (2024)
-- =====================================================
-- Asumsi: Ada 10 musyrif di cabang Pusat

INSERT INTO cuti_tahunan_musyrif_keasramaan (nama_musyrif, cabang, tahun, jatah_cuti, cuti_terpakai, sisa_cuti)
VALUES
    ('Ustadz Ahmad', 'Pusat', 2024, 12, 0, 12),
    ('Ustadz Budi', 'Pusat', 2024, 12, 2, 10),
    ('Ustadz Candra', 'Pusat', 2024, 12, 0, 12),
    ('Ustadz Dedi', 'Pusat', 2024, 12, 1, 11),
    ('Ustadz Eko', 'Pusat', 2024, 12, 0, 12),
    ('Ustadz Fajar', 'Pusat', 2024, 12, 3, 9),
    ('Ustadz Gilang', 'Pusat', 2024, 12, 0, 12),
    ('Ustadz Hasan', 'Pusat', 2024, 12, 1, 11),
    ('Ustadz Irfan', 'Pusat', 2024, 12, 0, 12),
    ('Ustadz Joko', 'Pusat', 2024, 12, 2, 10)
ON CONFLICT (nama_musyrif, tahun) DO NOTHING;

-- =====================================================
-- 2. Seed Jadwal Libur Rutin (Desember 2024)
-- =====================================================
-- Grup 1: Libur minggu 1 & 3 (7-8 Des, 21-22 Des)
-- Grup 2: Libur minggu 2 & 4 (14-15 Des, 28-29 Des)

-- Grup 1
INSERT INTO jadwal_libur_musyrif_keasramaan (
    nama_musyrif, cabang, asrama, tanggal_mulai, tanggal_selesai, 
    jenis_libur, musyrif_pengganti, status
)
VALUES
    -- Minggu 1 (7-8 Des)
    ('Ustadz Ahmad', 'Pusat', 'Asrama A', '2024-12-07', '2024-12-08', 'rutin', 'Ustadz Budi', 'approved_kepala_sekolah'),
    ('Ustadz Candra', 'Pusat', 'Asrama C', '2024-12-07', '2024-12-08', 'rutin', 'Ustadz Dedi', 'approved_kepala_sekolah'),
    ('Ustadz Eko', 'Pusat', 'Asrama E', '2024-12-07', '2024-12-08', 'rutin', 'Ustadz Fajar', 'approved_kepala_sekolah'),
    ('Ustadz Gilang', 'Pusat', 'Asrama G', '2024-12-07', '2024-12-08', 'rutin', 'Ustadz Hasan', 'approved_kepala_sekolah'),
    ('Ustadz Irfan', 'Pusat', 'Asrama I', '2024-12-07', '2024-12-08', 'rutin', 'Ustadz Joko', 'approved_kepala_sekolah'),
    
    -- Minggu 3 (21-22 Des)
    ('Ustadz Ahmad', 'Pusat', 'Asrama A', '2024-12-21', '2024-12-22', 'rutin', 'Ustadz Budi', 'approved_kepala_sekolah'),
    ('Ustadz Candra', 'Pusat', 'Asrama C', '2024-12-21', '2024-12-22', 'rutin', 'Ustadz Dedi', 'approved_kepala_sekolah'),
    ('Ustadz Eko', 'Pusat', 'Asrama E', '2024-12-21', '2024-12-22', 'rutin', 'Ustadz Fajar', 'approved_kepala_sekolah'),
    ('Ustadz Gilang', 'Pusat', 'Asrama G', '2024-12-21', '2024-12-22', 'rutin', 'Ustadz Hasan', 'approved_kepala_sekolah'),
    ('Ustadz Irfan', 'Pusat', 'Asrama I', '2024-12-21', '2024-12-22', 'rutin', 'Ustadz Joko', 'approved_kepala_sekolah');

-- Grup 2
INSERT INTO jadwal_libur_musyrif_keasramaan (
    nama_musyrif, cabang, asrama, tanggal_mulai, tanggal_selesai, 
    jenis_libur, musyrif_pengganti, status
)
VALUES
    -- Minggu 2 (14-15 Des)
    ('Ustadz Budi', 'Pusat', 'Asrama B', '2024-12-14', '2024-12-15', 'rutin', 'Ustadz Ahmad', 'approved_kepala_sekolah'),
    ('Ustadz Dedi', 'Pusat', 'Asrama D', '2024-12-14', '2024-12-15', 'rutin', 'Ustadz Candra', 'approved_kepala_sekolah'),
    ('Ustadz Fajar', 'Pusat', 'Asrama F', '2024-12-14', '2024-12-15', 'rutin', 'Ustadz Eko', 'approved_kepala_sekolah'),
    ('Ustadz Hasan', 'Pusat', 'Asrama H', '2024-12-14', '2024-12-15', 'rutin', 'Ustadz Gilang', 'approved_kepala_sekolah'),
    ('Ustadz Joko', 'Pusat', 'Asrama J', '2024-12-14', '2024-12-15', 'rutin', 'Ustadz Irfan', 'approved_kepala_sekolah'),
    
    -- Minggu 4 (28-29 Des)
    ('Ustadz Budi', 'Pusat', 'Asrama B', '2024-12-28', '2024-12-29', 'rutin', 'Ustadz Ahmad', 'approved_kepala_sekolah'),
    ('Ustadz Dedi', 'Pusat', 'Asrama D', '2024-12-28', '2024-12-29', 'rutin', 'Ustadz Candra', 'approved_kepala_sekolah'),
    ('Ustadz Fajar', 'Pusat', 'Asrama F', '2024-12-28', '2024-12-29', 'rutin', 'Ustadz Eko', 'approved_kepala_sekolah'),
    ('Ustadz Hasan', 'Pusat', 'Asrama H', '2024-12-28', '2024-12-29', 'rutin', 'Ustadz Gilang', 'approved_kepala_sekolah'),
    ('Ustadz Joko', 'Pusat', 'Asrama J', '2024-12-28', '2024-12-29', 'rutin', 'Ustadz Irfan', 'approved_kepala_sekolah');

-- =====================================================
-- 3. Seed Rapat Koordinasi (Desember 2024)
-- =====================================================

-- Rapat Mingguan
INSERT INTO rapat_koordinasi_keasramaan (
    tanggal, waktu, jenis_rapat, cabang, kepala_asrama, 
    musyrif_list, agenda
)
VALUES
    ('2024-12-02', '14:00', 'mingguan', 'Pusat', 'Pak Budi',
     ARRAY['Ustadz Ahmad', 'Ustadz Budi', 'Ustadz Candra', 'Ustadz Dedi', 'Ustadz Eko'],
     'Evaluasi minggu pertama Desember'),
    
    ('2024-12-09', '14:00', 'mingguan', 'Pusat', 'Pak Budi',
     ARRAY['Ustadz Ahmad', 'Ustadz Budi', 'Ustadz Candra', 'Ustadz Dedi', 'Ustadz Eko'],
     'Evaluasi minggu kedua Desember'),
    
    ('2024-12-16', '14:00', 'mingguan', 'Pusat', 'Pak Budi',
     ARRAY['Ustadz Ahmad', 'Ustadz Budi', 'Ustadz Candra', 'Ustadz Dedi', 'Ustadz Eko'],
     'Evaluasi minggu ketiga Desember'),
    
    ('2024-12-23', '14:00', 'mingguan', 'Pusat', 'Pak Budi',
     ARRAY['Ustadz Ahmad', 'Ustadz Budi', 'Ustadz Candra', 'Ustadz Dedi', 'Ustadz Eko'],
     'Evaluasi minggu keempat Desember');

-- Rapat Bulanan
INSERT INTO rapat_koordinasi_keasramaan (
    tanggal, waktu, jenis_rapat, cabang, kepala_asrama, 
    musyrif_list, agenda
)
VALUES
    ('2024-12-30', '09:00', 'bulanan', 'Pusat', 'Pak Budi',
     ARRAY['Ustadz Ahmad', 'Ustadz Budi', 'Ustadz Candra', 'Ustadz Dedi', 'Ustadz Eko', 
           'Ustadz Fajar', 'Ustadz Gilang', 'Ustadz Hasan', 'Ustadz Irfan', 'Ustadz Joko'],
     'Evaluasi bulan Desember & Perencanaan Januari 2025');

-- =====================================================
-- 4. Seed Kehadiran Rapat
-- =====================================================

-- Get rapat IDs first (you'll need to replace these with actual IDs)
-- For now, we'll use a subquery approach

-- Kehadiran Rapat 2 Desember
INSERT INTO kehadiran_rapat_keasramaan (rapat_id, nama_musyrif, status_kehadiran)
SELECT 
    id,
    musyrif,
    'hadir'
FROM rapat_koordinasi_keasramaan,
     UNNEST(musyrif_list) AS musyrif
WHERE tanggal = '2024-12-02';

-- Kehadiran Rapat 9 Desember (1 musyrif izin)
INSERT INTO kehadiran_rapat_keasramaan (rapat_id, nama_musyrif, status_kehadiran, keterangan)
SELECT 
    id,
    musyrif,
    CASE 
        WHEN musyrif = 'Ustadz Candra' THEN 'izin'
        ELSE 'hadir'
    END,
    CASE 
        WHEN musyrif = 'Ustadz Candra' THEN 'Sakit'
        ELSE NULL
    END
FROM rapat_koordinasi_keasramaan,
     UNNEST(musyrif_list) AS musyrif
WHERE tanggal = '2024-12-09';

-- =====================================================
-- 5. Seed Log Kolaborasi
-- =====================================================

INSERT INTO log_kolaborasi_keasramaan (
    tanggal, nama_musyrif, cabang, asrama, jenis, deskripsi, kolaborator, rating, catatan_penilaian
)
VALUES
    ('2024-12-03', 'Ustadz Ahmad', 'Pusat', 'Asrama A', 'sharing_tips',
     'Sharing strategi meningkatkan kedisiplinan shalat berjamaah',
     ARRAY['Ustadz Budi', 'Ustadz Candra'], 5, 'Sangat bermanfaat, bisa diterapkan di asrama lain'),
    
    ('2024-12-05', 'Ustadz Dedi', 'Pusat', 'Asrama D', 'program_bersama',
     'Inisiasi program Tahfidz Bersama antar asrama',
     ARRAY['Ustadz Ahmad', 'Ustadz Eko'], 5, 'Program inovatif, meningkatkan hafalan santri'),
    
    ('2024-12-10', 'Ustadz Ahmad', 'Pusat', 'Asrama A', 'bantuan_rekan',
     'Membantu Ustadz Eko menangani santri bermasalah',
     ARRAY['Ustadz Eko'], 4, 'Responsif dan solutif'),
    
    ('2024-12-12', 'Ustadz Budi', 'Pusat', 'Asrama B', 'menitipkan_asrama',
     'Menitipkan Asrama A saat Ustadz Ahmad libur',
     ARRAY['Ustadz Ahmad'], 5, 'Bertanggung jawab penuh'),
    
    ('2024-12-15', 'Ustadz Ahmad', 'Pusat', 'Asrama A', 'menitipkan_asrama',
     'Menitipkan Asrama B saat Ustadz Budi libur',
     ARRAY['Ustadz Budi'], 5, 'Asrama terjaga dengan baik');

-- =====================================================
-- 6. Verify Seed Data
-- =====================================================

-- Count records
SELECT 
    'cuti_tahunan' as table_name,
    COUNT(*) as total_records
FROM cuti_tahunan_musyrif_keasramaan
UNION ALL
SELECT 
    'jadwal_libur',
    COUNT(*)
FROM jadwal_libur_musyrif_keasramaan
UNION ALL
SELECT 
    'rapat',
    COUNT(*)
FROM rapat_koordinasi_keasramaan
UNION ALL
SELECT 
    'kehadiran_rapat',
    COUNT(*)
FROM kehadiran_rapat_keasramaan
UNION ALL
SELECT 
    'log_kolaborasi',
    COUNT(*)
FROM log_kolaborasi_keasramaan;

-- Expected:
-- cuti_tahunan: 10 records
-- jadwal_libur: 20 records (10 musyrif × 2 libur)
-- rapat: 5 records (4 mingguan + 1 bulanan)
-- kehadiran_rapat: ~10 records (depends on musyrif_list)
-- log_kolaborasi: 5 records

-- =====================================================
-- 7. Sample Queries for Testing
-- =====================================================

-- Get jadwal libur Ustadz Ahmad di Desember
SELECT * FROM jadwal_libur_musyrif_keasramaan
WHERE nama_musyrif = 'Ustadz Ahmad'
    AND tanggal_mulai >= '2024-12-01'
    AND tanggal_selesai <= '2024-12-31'
ORDER BY tanggal_mulai;

-- Get kehadiran rapat per musyrif
SELECT 
    nama_musyrif,
    COUNT(*) as total_rapat,
    SUM(CASE WHEN status_kehadiran = 'hadir' THEN 1 ELSE 0 END) as hadir,
    SUM(CASE WHEN status_kehadiran = 'izin' THEN 1 ELSE 0 END) as izin,
    SUM(CASE WHEN status_kehadiran = 'alpha' THEN 1 ELSE 0 END) as alpha
FROM kehadiran_rapat_keasramaan
GROUP BY nama_musyrif
ORDER BY nama_musyrif;

-- Get log kolaborasi per musyrif
SELECT 
    nama_musyrif,
    COUNT(*) as total_kolaborasi,
    AVG(rating) as avg_rating
FROM log_kolaborasi_keasramaan
WHERE rating IS NOT NULL
GROUP BY nama_musyrif
ORDER BY total_kolaborasi DESC;

-- Get sisa cuti per musyrif
SELECT 
    nama_musyrif,
    jatah_cuti,
    cuti_terpakai,
    sisa_cuti
FROM cuti_tahunan_musyrif_keasramaan
WHERE tahun = 2024
ORDER BY sisa_cuti ASC;

-- =====================================================
-- DONE!
-- =====================================================
-- Seed data berhasil di-insert
-- Siap untuk testing API & UI

-- =====================================================
