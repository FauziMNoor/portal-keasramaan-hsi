-- =====================================================
-- FIX: Memastikan semua template memiliki template_type
-- =====================================================
-- Script ini memastikan kolom template_type ada dan terisi
-- =====================================================

-- Tambahkan kolom template_type jika belum ada
ALTER TABLE rapor_template_keasramaan 
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(20) DEFAULT 'legacy';

-- Update template yang belum memiliki template_type
UPDATE rapor_template_keasramaan 
SET template_type = 'legacy' 
WHERE template_type IS NULL OR template_type = '';

-- Tambahkan kolom canvas_config jika belum ada
ALTER TABLE rapor_template_keasramaan 
  ADD COLUMN IF NOT EXISTS canvas_config JSONB;

-- Verify hasil
SELECT 
  id,
  nama_template,
  template_type,
  CASE 
    WHEN canvas_config IS NULL THEN 'No config'
    ELSE 'Has config'
  END as config_status
FROM rapor_template_keasramaan
ORDER BY created_at DESC;
