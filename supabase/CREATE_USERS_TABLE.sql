-- =====================================================
-- TABEL USERS UNTUK PORTAL KEASRAMAAN
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. Buat tabel users
CREATE TABLE IF NOT EXISTS users_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  -- Roles: 'admin', 'kepala_asrama', 'musyrif', 'user'
  
  -- Info tambahan
  lokasi VARCHAR(100),
  asrama VARCHAR(100),
  no_telepon VARCHAR(20),
  foto TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- 2. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_email ON users_keasramaan(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_keasramaan(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users_keasramaan(is_active);

-- 3. Buat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Buat trigger untuk auto-update timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON users_keasramaan;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users_keasramaan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Insert default admin user
-- Password: admin123 (GANTI SETELAH LOGIN PERTAMA!)
-- Hash ini adalah bcrypt hash untuk 'admin123'
INSERT INTO users_keasramaan (
  email, 
  password_hash, 
  nama_lengkap, 
  role,
  is_active
) VALUES (
  'admin@hsi.sch.id',
  '$2a$10$rKvVPZqGhf8VqKEZmKZN0.Xt5qJxKxKxKxKxKxKxKxKxKxKxKxKxK', -- Placeholder, akan diganti
  'Administrator',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- 6. Buat view untuk user info (tanpa password)
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE users_keasramaan ENABLE ROW LEVEL SECURITY;

-- 8. Buat policies untuk RLS
-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users_keasramaan
  FOR SELECT
  USING (auth.uid()::text = id::text OR role = 'admin');

-- Policy: Only admins can insert users
CREATE POLICY "Only admins can create users"
  ON users_keasramaan
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_keasramaan
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Users can update their own data, admins can update all
CREATE POLICY "Users can update own data"
  ON users_keasramaan
  FOR UPDATE
  USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM users_keasramaan
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON users_keasramaan
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_keasramaan
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- SELESAI!
-- =====================================================
-- Catatan:
-- 1. Ganti password admin setelah login pertama
-- 2. Sesuaikan roles sesuai kebutuhan
-- 3. Tambahkan kolom custom jika diperlukan
-- =====================================================

-- Verifikasi tabel sudah dibuat
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'users_keasramaan'
ORDER BY ordinal_position;
