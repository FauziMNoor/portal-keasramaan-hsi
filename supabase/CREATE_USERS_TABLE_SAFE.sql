-- =====================================================
-- TABEL USERS UNTUK PORTAL KEASRAMAAN (SAFE VERSION)
-- =====================================================
-- Versi ini lebih aman dan tidak akan trigger warning
-- =====================================================

-- 1. Buat tabel users (hanya jika belum ada)
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

-- 2. Buat index untuk performa (hanya jika belum ada)
CREATE INDEX IF NOT EXISTS idx_users_email ON users_keasramaan(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_keasramaan(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users_keasramaan(is_active);

-- 3. Insert default admin user (hanya jika belum ada)
-- Password akan di-set nanti menggunakan bcrypt
INSERT INTO users_keasramaan (
  email, 
  password_hash, 
  nama_lengkap, 
  role,
  is_active
) 
SELECT 
  'admin@hsi.sch.id',
  'TEMPORARY_HASH_WILL_BE_UPDATED', 
  'Administrator',
  'admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM users_keasramaan WHERE email = 'admin@hsi.sch.id'
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE users_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELESAI! Tabel users_keasramaan sudah dibuat
-- =====================================================

-- Verifikasi tabel sudah dibuat
SELECT 
  'Tabel users_keasramaan berhasil dibuat!' as status,
  COUNT(*) as jumlah_user
FROM users_keasramaan;
