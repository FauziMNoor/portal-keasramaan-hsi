-- =====================================================
-- MIGRATION: Merge Identitas Sekolah ke Info Sekolah
-- HSI Boarding School
-- =====================================================

-- =====================================================
-- 1. Cek Data yang Ada
-- =====================================================
-- Cek data di tabel lama
SELECT * FROM identitas_sekolah_keasramaan;

-- Cek data di tabel baru
SELECT * FROM info_sekolah_keasramaan;

-- =====================================================
-- 2. Migrate Data dari Tabel Lama ke Tabel Baru
-- =====================================================
-- Jika ada data di identitas_sekolah_keasramaan, migrate ke info_sekolah_keasramaan

-- Untuk setiap cabang, buat entry di info_sekolah_keasramaan
-- Sesuaikan dengan cabang yang ada di sistem Anda

-- Contoh untuk cabang Purworejo
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    no_telepon,
    email,
    website,
    logo_url,
    nama_kepala_sekolah,
    nama_kepala_asrama
)
SELECT 
    'Purworejo' as cabang,
    COALESCE(nama_sekolah, 'PONDOK PESANTREN SMA IT HSI IDN') as nama_sekolah,
    'HSI BOARDING SCHOOL' as nama_singkat,
    COALESCE(alamat, '') as alamat_lengkap,
    'Purworejo' as kota,
    COALESCE(no_telepon, '') as no_telepon,
    COALESCE(email, '') as email,
    COALESCE(website, '') as website,
    COALESCE(logo, '') as logo_url,
    COALESCE(nama_kepala_sekolah, '') as nama_kepala_sekolah,
    '' as nama_kepala_asrama
FROM identitas_sekolah_keasramaan
LIMIT 1
ON CONFLICT (cabang) DO UPDATE SET
    nama_sekolah = EXCLUDED.nama_sekolah,
    alamat_lengkap = EXCLUDED.alamat_lengkap,
    no_telepon = EXCLUDED.no_telepon,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    logo_url = EXCLUDED.logo_url,
    nama_kepala_sekolah = EXCLUDED.nama_kepala_sekolah,
    updated_at = NOW();

-- Jika ada cabang lain (Sukabumi, dll), tambahkan juga
-- Contoh untuk cabang Sukabumi
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    no_telepon,
    email,
    website,
    nama_kepala_sekolah
)
VALUES (
    'Sukabumi',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Alamat Sukabumi',
    'Sukabumi',
    '(0266) 123456',
    'sukabumi@hsiboardingschool.sch.id',
    'https://www.hsiboardingschool.sch.id',
    ''
)
ON CONFLICT (cabang) DO NOTHING;

-- =====================================================
-- 3. Auto-populate Kepala Asrama dari Master Data
-- =====================================================
-- Update nama kepala asrama dari tabel kepala_asrama_keasramaan

UPDATE info_sekolah_keasramaan i
SET nama_kepala_asrama = k.nama
FROM (
    SELECT DISTINCT ON (lokasi) 
        lokasi,
        nama
    FROM kepala_asrama_keasramaan
    WHERE status = 'aktif'
    ORDER BY lokasi, created_at DESC
) k
WHERE i.cabang = k.lokasi
AND (i.nama_kepala_asrama IS NULL OR i.nama_kepala_asrama = '');

-- =====================================================
-- 4. Verifikasi Data
-- =====================================================
-- Cek hasil migration
SELECT 
    cabang,
    nama_sekolah,
    nama_singkat,
    kota,
    nama_kepala_sekolah,
    nama_kepala_asrama,
    no_telepon,
    email
FROM info_sekolah_keasramaan
ORDER BY cabang;

-- =====================================================
-- 5. Update Data Perizinan yang Sudah Ada
-- =====================================================
-- Pastikan semua perizinan punya data cabang yang benar
-- (Jika ada perizinan yang cabangnya NULL atau salah)

-- Cek perizinan tanpa cabang
SELECT COUNT(*) 
FROM perizinan_kepulangan_keasramaan 
WHERE cabang IS NULL OR cabang = '';

-- Update cabang dari data siswa (jika ada)
-- UPDATE perizinan_kepulangan_keasramaan p
-- SET cabang = s.lokasi
-- FROM data_siswa_keasramaan s
-- WHERE p.nis = s.nis
-- AND (p.cabang IS NULL OR p.cabang = '');

-- =====================================================
-- 6. Cleanup (OPSIONAL - Jangan jalankan jika masih butuh data lama)
-- =====================================================
-- Setelah yakin data sudah migrate dengan benar, 
-- Anda bisa backup dan hapus tabel lama

-- Backup tabel lama
-- CREATE TABLE identitas_sekolah_keasramaan_backup AS 
-- SELECT * FROM identitas_sekolah_keasramaan;

-- Hapus tabel lama (HATI-HATI!)
-- DROP TABLE identitas_sekolah_keasramaan;

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Data sudah di-migrate dari tabel lama ke tabel baru
-- 2. Setiap cabang punya data info sekolah sendiri
-- 3. Nama kepala asrama auto-populate dari master data
-- 4. Halaman /identitas-sekolah sudah terintegrasi dengan sistem cabang
-- 5. Generate PDF surat izin akan menggunakan data sesuai cabang santri
