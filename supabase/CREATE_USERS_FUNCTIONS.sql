-- =====================================================
-- FUNCTIONS & TRIGGERS UNTUK USERS (OPTIONAL)
-- =====================================================
-- Jalankan ini SETELAH tabel users_keasramaan dibuat
-- Script ini akan trigger warning, tapi AMAN
-- =====================================================

-- 1. Buat function untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Buat trigger untuk auto-update timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON users_keasramaan;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users_keasramaan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Buat view untuk user info (tanpa password)
CREATE OR REPLACE VIEW users_info_keasramaan AS
SELECT 
  id,
  email,
  nama_lengkap,
  role,
  lokasi,
  asrama,
  no_telepon,
  foto,
  is_active,
  last_login,
  created_at,
  updated_at
FROM users_keasramaan;

-- =====================================================
-- SELESAI!
-- =====================================================

SELECT 'Functions, Triggers, dan Views berhasil dibuat!' as status;
