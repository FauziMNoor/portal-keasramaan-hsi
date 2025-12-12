-- =====================================================
-- ADD MISSING COLUMNS TO musyrif_keasramaan
-- =====================================================
-- Date: 2024-12-10
-- Purpose: Add cuti tracking columns for KPI system

-- Add jatah_cuti_tahunan column (default 12 hari per tahun)
ALTER TABLE musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS jatah_cuti_tahunan INTEGER DEFAULT 12;

-- Add sisa_cuti_tahunan column (default sama dengan jatah)
ALTER TABLE musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS sisa_cuti_tahunan INTEGER DEFAULT 12;

-- Update existing records to have default values
UPDATE musyrif_keasramaan 
SET jatah_cuti_tahunan = 12, 
    sisa_cuti_tahunan = 12
WHERE jatah_cuti_tahunan IS NULL 
   OR sisa_cuti_tahunan IS NULL;

-- Add comment
COMMENT ON COLUMN musyrif_keasramaan.jatah_cuti_tahunan IS 'Jatah cuti tahunan musyrif (default 12 hari)';
COMMENT ON COLUMN musyrif_keasramaan.sisa_cuti_tahunan IS 'Sisa cuti yang belum digunakan tahun ini';

-- Verify
SELECT 
  nama_musyrif,
  cabang,
  asrama,
  status,
  jatah_cuti_tahunan,
  sisa_cuti_tahunan
FROM musyrif_keasramaan
LIMIT 5;
