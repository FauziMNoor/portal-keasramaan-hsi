-- =====================================================
-- DROP TABLE: info_sekolah_keasramaan (Tabel Baru)
-- =====================================================
-- Tabel ini tidak dipakai lagi, semua sudah pakai tabel lama
-- identitas_sekolah_keasramaan

-- =====================================================
-- 1. Backup Data (Opsional)
-- =====================================================
-- Jika ingin backup dulu sebelum hapus
-- CREATE TABLE info_sekolah_keasramaan_backup AS 
-- SELECT * FROM info_sekolah_keasramaan;

-- =====================================================
-- 2. Drop Table
-- =====================================================
DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;

-- =====================================================
-- 3. Verifikasi
-- =====================================================
-- Cek apakah tabel sudah terhapus
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'info_sekolah_keasramaan';

-- Expected: 0 rows (tabel sudah tidak ada)

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Tabel info_sekolah_keasramaan sudah dihapus
-- 2. Semua aplikasi sekarang pakai identitas_sekolah_keasramaan
-- 3. Tidak ada breaking change karena semua kode sudah diupdate
