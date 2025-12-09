-- =====================================================
-- CLEANUP: Hapus Data Duplikat Info Sekolah
-- =====================================================
-- Script ini akan menghapus data duplikat dan hanya menyimpan
-- data terbaru (berdasarkan created_at atau updated_at)

-- =====================================================
-- 1. Cek Data Duplikat
-- =====================================================
-- Lihat berapa banyak data per cabang
SELECT 
    cabang,
    COUNT(*) as jumlah,
    STRING_AGG(id::text, ', ') as ids,
    MAX(created_at) as created_terakhir,
    MAX(updated_at) as updated_terakhir
FROM info_sekolah_keasramaan
GROUP BY cabang
ORDER BY cabang;

-- Expected: Setiap cabang hanya 1 row
-- Jika ada yang > 1, berarti ada duplikat

-- =====================================================
-- 2. Lihat Detail Data Duplikat
-- =====================================================
SELECT 
    id,
    cabang,
    nama_sekolah,
    kota,
    email,
    logo_url,
    created_at,
    updated_at
FROM info_sekolah_keasramaan
ORDER BY cabang, created_at DESC;

-- =====================================================
-- 3. Hapus Data Duplikat (Simpan yang Terbaru)
-- =====================================================
-- Strategi: Untuk setiap cabang, hapus semua kecuali yang paling baru

-- Backup dulu (optional)
-- CREATE TABLE info_sekolah_keasramaan_backup AS 
-- SELECT * FROM info_sekolah_keasramaan;

-- Hapus duplikat, simpan yang terbaru berdasarkan updated_at atau created_at
DELETE FROM info_sekolah_keasramaan
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            cabang,
            ROW_NUMBER() OVER (
                PARTITION BY cabang 
                ORDER BY 
                    COALESCE(updated_at, created_at) DESC,
                    created_at DESC
            ) as row_num
        FROM info_sekolah_keasramaan
    ) ranked
    WHERE row_num > 1
);

-- =====================================================
-- 4. Verifikasi Hasil
-- =====================================================
-- Cek lagi, seharusnya setiap cabang hanya 1 row
SELECT 
    cabang,
    COUNT(*) as jumlah,
    MAX(created_at) as created_at,
    MAX(updated_at) as updated_at
FROM info_sekolah_keasramaan
GROUP BY cabang
ORDER BY cabang;

-- Expected: Setiap cabang jumlah = 1

-- =====================================================
-- 5. Lihat Data Final
-- =====================================================
SELECT 
    cabang,
    nama_sekolah,
    kota,
    email,
    no_telepon,
    nama_kepala_sekolah,
    CASE 
        WHEN logo_url IS NOT NULL AND logo_url != '' THEN '✅ Ada'
        ELSE '❌ Kosong'
    END as logo_status,
    created_at,
    updated_at
FROM info_sekolah_keasramaan
ORDER BY cabang;

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Script ini akan menghapus data duplikat
-- 2. Data yang disimpan adalah yang paling baru (updated_at terbaru)
-- 3. Jika updated_at NULL, gunakan created_at
-- 4. Pastikan backup data jika perlu (uncomment CREATE TABLE backup)
-- 5. Setelah cleanup, aplikasi akan menggunakan upsert untuk mencegah duplikat

