-- =====================================================
-- UPDATE PASSWORD ADMIN
-- =====================================================
-- Jalankan ini di Supabase SQL Editor
-- Password: admin123
-- =====================================================

UPDATE users_keasramaan
SET password_hash = '$2b$10$J6LasLvJw4SHaZNdAUHTQO5RH/Q8/sqdz3CQh2cviLZjWjESJqoVy'
WHERE email = 'admin@hsi.sch.id';

-- Verifikasi update berhasil
SELECT 
  email,
  nama_lengkap,
  role,
  is_active,
  created_at,
  'Password updated successfully!' as status
FROM users_keasramaan
WHERE email = 'admin@hsi.sch.id';
