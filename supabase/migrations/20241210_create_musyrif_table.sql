-- =====================================================
-- CREATE musyrif_keasramaan TABLE (IF NOT EXISTS)
-- =====================================================
-- Date: 2024-12-10
-- Purpose: Create musyrif table for KPI system if it doesn't exist

-- Create musyrif_keasramaan table
CREATE TABLE IF NOT EXISTS musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_musyrif TEXT NOT NULL UNIQUE,
  asrama TEXT,
  kelas TEXT,
  cabang TEXT,
  status TEXT DEFAULT 'aktif',
  
  -- Cuti tracking (for KPI system)
  jatah_cuti_tahunan INTEGER DEFAULT 12,
  sisa_cuti_tahunan INTEGER DEFAULT 12,
  
  -- Timestamps
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_musyrif_cabang ON musyrif_keasramaan(cabang);
CREATE INDEX IF NOT EXISTS idx_musyrif_status ON musyrif_keasramaan(status);
CREATE INDEX IF NOT EXISTS idx_musyrif_cabang_status ON musyrif_keasramaan(cabang, status);

-- Add comments
COMMENT ON TABLE musyrif_keasramaan IS 'Data musyrif/pembina asrama';
COMMENT ON COLUMN musyrif_keasramaan.nama_musyrif IS 'Nama lengkap musyrif (unique)';
COMMENT ON COLUMN musyrif_keasramaan.cabang IS 'Cabang sekolah (harus match dengan cabang_keasramaan.nama_cabang)';
COMMENT ON COLUMN musyrif_keasramaan.asrama IS 'Asrama yang dibina';
COMMENT ON COLUMN musyrif_keasramaan.status IS 'Status musyrif: aktif, cuti, resign';
COMMENT ON COLUMN musyrif_keasramaan.jatah_cuti_tahunan IS 'Jatah cuti per tahun (default 12 hari)';
COMMENT ON COLUMN musyrif_keasramaan.sisa_cuti_tahunan IS 'Sisa cuti yang belum digunakan';

-- Insert sample data for testing
INSERT INTO musyrif_keasramaan (
  nama_musyrif, 
  cabang, 
  asrama, 
  status, 
  jatah_cuti_tahunan, 
  sisa_cuti_tahunan
)
VALUES 
-- HSI Boarding School Bekasi
('Ustadz Ahmad Fauzi', 'HSI Boarding School Bekasi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Budi Santoso', 'HSI Boarding School Bekasi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Siti Nurhaliza', 'HSI Boarding School Bekasi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Fatimah Azzahra', 'HSI Boarding School Bekasi', 'Asrama Putri B', 'aktif', 12, 12),

-- HSI Boarding School Sukabumi
('Ustadz Muhammad Rizki', 'HSI Boarding School Sukabumi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Hasan Basri', 'HSI Boarding School Sukabumi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Aisyah Rahmawati', 'HSI Boarding School Sukabumi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Khadijah Maryam', 'HSI Boarding School Sukabumi', 'Asrama Putri B', 'aktif', 12, 12),

-- HSI Boarding School Purworejo
('Ustadz Abdullah Yusuf', 'HSI Boarding School Purworejo', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Ibrahim Khalil', 'HSI Boarding School Purworejo', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Maryam Zahra', 'HSI Boarding School Purworejo', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Zainab Husna', 'HSI Boarding School Purworejo', 'Asrama Putri B', 'aktif', 12, 12)
ON CONFLICT (nama_musyrif) DO NOTHING;

-- Verify
SELECT 
  cabang,
  COUNT(*) as total_musyrif,
  COUNT(CASE WHEN status = 'aktif' THEN 1 END) as total_aktif
FROM musyrif_keasramaan
GROUP BY cabang
ORDER BY cabang;
