-- =====================================================
-- ALTER kpi_summary_keasramaan TABLE TO MATCH KPI SYSTEM
-- =====================================================
-- Date: 2024-12-10
-- Purpose: Modify existing kpi_summary_keasramaan table to match KPI system requirements

-- Drop existing constraints that conflict
ALTER TABLE kpi_summary_keasramaan 
DROP CONSTRAINT IF EXISTS kpi_summary_keasramaan_periode_role_nama_cabang_key;

ALTER TABLE kpi_summary_keasramaan 
DROP CONSTRAINT IF EXISTS kpi_summary_keasramaan_role_check;

-- Rename 'nama' column to 'nama_musyrif'
ALTER TABLE kpi_summary_keasramaan 
RENAME COLUMN nama TO nama_musyrif;

-- Drop 'role' column (not needed in KPI system)
ALTER TABLE kpi_summary_keasramaan 
DROP COLUMN IF EXISTS role;

-- Drop 'total_musyrif' column (not needed per record)
ALTER TABLE kpi_summary_keasramaan 
DROP COLUMN IF EXISTS total_musyrif;

-- Add missing columns that KPI system expects
ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier1_ubudiyah NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier1_akhlaq NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier1_kedisiplinan NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier1_kebersihan NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier1_total NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_jurnal NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_habit_tracker NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_koordinasi NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_catatan_perilaku NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_total NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_koordinasi_kehadiran_rapat NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_koordinasi_responsiveness NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier2_koordinasi_inisiatif NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier3_completion_rate NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier3_kehadiran NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier3_engagement NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS tier3_total NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS total_score NUMERIC(5,2);

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS ranking INTEGER;

ALTER TABLE kpi_summary_keasramaan 
ADD COLUMN IF NOT EXISTS hari_kerja_efektif INTEGER;

-- Add new unique constraint
ALTER TABLE kpi_summary_keasramaan 
ADD CONSTRAINT kpi_summary_unique_musyrif_periode 
UNIQUE (nama_musyrif, periode);

-- Update indexes
DROP INDEX IF EXISTS idx_kpi_nama;
CREATE INDEX IF NOT EXISTS idx_kpi_nama_musyrif ON kpi_summary_keasramaan(nama_musyrif, periode);

-- Add comments
COMMENT ON COLUMN kpi_summary_keasramaan.nama_musyrif IS 'Nama musyrif (renamed from nama)';
COMMENT ON COLUMN kpi_summary_keasramaan.tier1_total IS 'Total score Tier 1 (Output) - 50%';
COMMENT ON COLUMN kpi_summary_keasramaan.tier2_total IS 'Total score Tier 2 (Administrasi) - 30%';
COMMENT ON COLUMN kpi_summary_keasramaan.tier3_total IS 'Total score Tier 3 (Proses) - 20%';
COMMENT ON COLUMN kpi_summary_keasramaan.total_score IS 'Total KPI score (Tier1 + Tier2 + Tier3)';

-- Verify structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'kpi_summary_keasramaan'
ORDER BY ordinal_position;
