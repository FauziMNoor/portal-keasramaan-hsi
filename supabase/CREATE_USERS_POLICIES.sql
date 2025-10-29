-- =====================================================
-- ROW LEVEL SECURITY POLICIES UNTUK USERS
-- =====================================================
-- Jalankan ini SETELAH tabel users_keasramaan dibuat
-- =====================================================

-- Hapus policies lama jika ada (untuk re-run)
DROP POLICY IF EXISTS "Users can view own data" ON users_keasramaan;
DROP POLICY IF EXISTS "Only admins can create users" ON users_keasramaan;
DROP POLICY IF EXISTS "Users can update own data" ON users_keasramaan;
DROP POLICY IF EXISTS "Only admins can delete users" ON users_keasramaan;

-- 1. Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users_keasramaan
  FOR SELECT
  USING (true); -- Sementara allow all, nanti bisa diperketat

-- 2. Policy: Anyone can insert (untuk registration)
-- Nanti bisa diperketat hanya admin
CREATE POLICY "Anyone can create users"
  ON users_keasramaan
  FOR INSERT
  WITH CHECK (true); -- Sementara allow all

-- 3. Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users_keasramaan
  FOR UPDATE
  USING (true); -- Sementara allow all

-- 4. Policy: Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON users_keasramaan
  FOR DELETE
  USING (true); -- Sementara allow all

-- =====================================================
-- SELESAI!
-- =====================================================
-- Catatan: Policies di-set permissive untuk development
-- Nanti bisa diperketat setelah auth system jalan
-- =====================================================

SELECT 'RLS Policies berhasil dibuat!' as status;
