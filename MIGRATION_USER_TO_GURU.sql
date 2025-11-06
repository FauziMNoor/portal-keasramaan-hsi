-- =====================================================
-- MIGRATION: Update Role 'user' menjadi 'guru'
-- =====================================================
-- Deskripsi: Script ini mengubah semua user dengan role 'user' 
--            menjadi role 'guru' sesuai dengan perubahan sistem
-- Tanggal: 2025-11-06
-- =====================================================

-- 1. Cek jumlah user dengan role 'user' yang akan diupdate
SELECT 
    COUNT(*) as total_users,
    'user' as current_role,
    'guru' as new_role
FROM users_keasramaan 
WHERE role = 'user';

-- 2. Preview data yang akan diupdate
SELECT 
    id,
    email,
    nama_lengkap,
    role as current_role,
    'guru' as new_role,
    cabang,
    asrama,
    is_active
FROM users_keasramaan 
WHERE role = 'user'
ORDER BY created_at DESC;

-- 3. Backup data sebelum update (opsional, simpan ke tabel temporary)
CREATE TEMP TABLE backup_users_before_migration AS
SELECT * FROM users_keasramaan WHERE role = 'user';

-- 4. Update role 'user' menjadi 'guru'
UPDATE users_keasramaan 
SET 
    role = 'guru',
    updated_at = NOW()
WHERE role = 'user';

-- 5. Verifikasi hasil update
SELECT 
    COUNT(*) as total_updated,
    role
FROM users_keasramaan 
WHERE role = 'guru'
GROUP BY role;

-- 6. Cek apakah masih ada user dengan role 'user'
SELECT 
    COUNT(*) as remaining_user_role
FROM users_keasramaan 
WHERE role = 'user';

-- 7. Tampilkan semua role yang ada di sistem
SELECT 
    role,
    COUNT(*) as total_users
FROM users_keasramaan 
GROUP BY role
ORDER BY role;

-- =====================================================
-- ROLLBACK (Jika diperlukan)
-- =====================================================
-- Uncomment dan jalankan jika ingin rollback perubahan

-- UPDATE users_keasramaan 
-- SET 
--     role = 'user',
--     updated_at = NOW()
-- WHERE role = 'guru' 
-- AND id IN (SELECT id FROM backup_users_before_migration);

-- =====================================================
-- CATATAN
-- =====================================================
-- 1. Script ini aman dijalankan berkali-kali (idempotent)
-- 2. Backup data disimpan di tabel temporary untuk rollback
-- 3. Pastikan aplikasi sudah di-deploy dengan kode terbaru
--    sebelum menjalankan migration ini
-- 4. Setelah migration, user dengan role 'guru' akan memiliki
--    akses terbatas sesuai dengan konfigurasi di aplikasi
