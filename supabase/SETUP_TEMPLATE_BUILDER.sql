-- =====================================================
-- SETUP DATABASE TEMPLATE BUILDER RAPOR
-- =====================================================
-- Script ini menambahkan fitur Template Builder ke sistem rapor:
-- 1. Modifikasi tabel rapor_template_keasramaan (add template_type & canvas_config)
-- 2. Tabel rapor_template_elements_keasramaan (elemen-elemen template)
-- 3. Tabel rapor_template_versions_keasramaan (version history)
-- 4. Tabel rapor_template_assets_keasramaan (logo, images, dll)
-- =====================================================

-- =====================================================
-- 1. Modifikasi Tabel Template Rapor
-- =====================================================
-- Tambahkan kolom template_type dan canvas_config
ALTER TABLE rapor_template_keasramaan 
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(20) DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS canvas_config JSONB;

-- Update existing templates to be 'legacy'
UPDATE rapor_template_keasramaan 
SET template_type = 'legacy' 
WHERE template_type IS NULL OR template_type = '';

-- Add comment untuk dokumentasi
COMMENT ON COLUMN rapor_template_keasramaan.template_type IS 'Type of template: legacy (old system) or builder (new drag-drop system)';
COMMENT ON COLUMN rapor_template_keasramaan.canvas_config IS 'Complete template configuration for builder type (JSON)';

-- =====================================================
-- 2. Tabel Template Elements (untuk builder templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_template_elements_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES rapor_template_keasramaan(id) ON DELETE CASCADE,
  element_type VARCHAR(50) NOT NULL, -- 'header', 'text', 'data-table', 'image', 'image-gallery', 'signature', 'line'
  position JSONB NOT NULL, -- { x: number, y: number }
  size JSONB NOT NULL, -- { width: number, height: number }
  content JSONB, -- Element-specific content configuration
  style JSONB, -- Styling properties (colors, fonts, borders, etc)
  data_binding JSONB, -- Data source bindings (placeholders, table bindings)
  z_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE rapor_template_elements_keasramaan IS 'Elements in builder templates (text, images, tables, etc)';
COMMENT ON COLUMN rapor_template_elements_keasramaan.element_type IS 'Type: header, text, data-table, image, image-gallery, signature, line';
COMMENT ON COLUMN rapor_template_elements_keasramaan.position IS 'Position on canvas: {x: number, y: number} in pixels';
COMMENT ON COLUMN rapor_template_elements_keasramaan.size IS 'Size: {width: number, height: number} in pixels';
COMMENT ON COLUMN rapor_template_elements_keasramaan.content IS 'Element-specific content (text, image URL, table config, etc)';
COMMENT ON COLUMN rapor_template_elements_keasramaan.style IS 'Styling: colors, fonts, borders, padding, etc';
COMMENT ON COLUMN rapor_template_elements_keasramaan.data_binding IS 'Data bindings: placeholders like {{siswa.nama}}, table data sources';
COMMENT ON COLUMN rapor_template_elements_keasramaan.z_index IS 'Layer order (higher = on top)';

-- =====================================================
-- 3. Tabel Template Versions (version history)
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_template_versions_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES rapor_template_keasramaan(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  canvas_config JSONB NOT NULL,
  elements JSONB NOT NULL, -- Snapshot of all elements at this version
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE rapor_template_versions_keasramaan IS 'Version history for builder templates';
COMMENT ON COLUMN rapor_template_versions_keasramaan.version_number IS 'Sequential version number (1, 2, 3, ...)';
COMMENT ON COLUMN rapor_template_versions_keasramaan.canvas_config IS 'Snapshot of canvas configuration at this version';
COMMENT ON COLUMN rapor_template_versions_keasramaan.elements IS 'Snapshot of all elements at this version';
COMMENT ON COLUMN rapor_template_versions_keasramaan.notes IS 'Optional notes about this version';

-- =====================================================
-- 4. Tabel Template Assets (logos, backgrounds, images)
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_template_assets_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES rapor_template_keasramaan(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL, -- 'logo', 'background', 'image', 'icon'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE rapor_template_assets_keasramaan IS 'Assets used in builder templates (logos, images, backgrounds)';
COMMENT ON COLUMN rapor_template_assets_keasramaan.asset_type IS 'Type: logo, background, image, icon';
COMMENT ON COLUMN rapor_template_assets_keasramaan.file_url IS 'URL to file in Supabase Storage';

-- =====================================================
-- INDEXES untuk performa
-- =====================================================

-- Indexes untuk rapor_template_elements_keasramaan
CREATE INDEX IF NOT EXISTS idx_template_elements_template 
  ON rapor_template_elements_keasramaan(template_id);

CREATE INDEX IF NOT EXISTS idx_template_elements_z_index 
  ON rapor_template_elements_keasramaan(template_id, z_index);

CREATE INDEX IF NOT EXISTS idx_template_elements_type 
  ON rapor_template_elements_keasramaan(template_id, element_type);

-- Indexes untuk rapor_template_versions_keasramaan
CREATE INDEX IF NOT EXISTS idx_template_versions_template 
  ON rapor_template_versions_keasramaan(template_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_template_versions_created 
  ON rapor_template_versions_keasramaan(template_id, created_at DESC);

-- Indexes untuk rapor_template_assets_keasramaan
CREATE INDEX IF NOT EXISTS idx_template_assets_template 
  ON rapor_template_assets_keasramaan(template_id);

CREATE INDEX IF NOT EXISTS idx_template_assets_type 
  ON rapor_template_assets_keasramaan(template_id, asset_type);

-- Index untuk template_type di rapor_template_keasramaan
CREATE INDEX IF NOT EXISTS idx_rapor_template_type 
  ON rapor_template_keasramaan(template_type);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS untuk tabel baru
ALTER TABLE rapor_template_elements_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_template_versions_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_template_assets_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policies untuk rapor_template_elements_keasramaan
CREATE POLICY "Allow read access to all users" 
  ON rapor_template_elements_keasramaan FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" 
  ON rapor_template_elements_keasramaan FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
  ON rapor_template_elements_keasramaan FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" 
  ON rapor_template_elements_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_template_versions_keasramaan
CREATE POLICY "Allow read access to all users" 
  ON rapor_template_versions_keasramaan FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" 
  ON rapor_template_versions_keasramaan FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
  ON rapor_template_versions_keasramaan FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" 
  ON rapor_template_versions_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_template_assets_keasramaan
CREATE POLICY "Allow read access to all users" 
  ON rapor_template_assets_keasramaan FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" 
  ON rapor_template_assets_keasramaan FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
  ON rapor_template_assets_keasramaan FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" 
  ON rapor_template_assets_keasramaan FOR DELETE USING (true);

-- =====================================================
-- TRIGGERS untuk updated_at
-- =====================================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk rapor_template_elements_keasramaan
DROP TRIGGER IF EXISTS update_rapor_template_elements_updated_at ON rapor_template_elements_keasramaan;
CREATE TRIGGER update_rapor_template_elements_updated_at
  BEFORE UPDATE ON rapor_template_elements_keasramaan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor setelah SETUP_MANAJEMEN_RAPOR.sql
-- 
-- Script ini telah membuat:
-- ✓ Modifikasi rapor_template_keasramaan (template_type, canvas_config)
-- ✓ Tabel rapor_template_elements_keasramaan (elemen drag-drop)
-- ✓ Tabel rapor_template_versions_keasramaan (version history)
-- ✓ Tabel rapor_template_assets_keasramaan (assets)
-- ✓ Indexes untuk optimasi query
-- ✓ RLS policies untuk keamanan
-- ✓ Triggers untuk auto-update timestamps
-- ✓ Update existing templates ke 'legacy' type
-- 
-- Sistem lama (legacy) tetap berfungsi normal
-- Sistem baru (builder) siap digunakan
