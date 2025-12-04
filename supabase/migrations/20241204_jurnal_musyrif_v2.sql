-- =====================================================
-- MIGRATION: Jurnal Musyrif v2 - Link per Cabang
-- Date: 2024-12-04
-- Description: Update token table untuk link per cabang
-- =====================================================

-- Drop old table and create new one
DROP TABLE IF EXISTS token_jurnal_musyrif_keasramaan CASCADE;

-- Create new token table - hanya cabang
CREATE TABLE IF NOT EXISTS token_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_token_cabang_keasramaan ON token_jurnal_musyrif_keasramaan(cabang);
CREATE INDEX IF NOT EXISTS idx_token_active_keasramaan ON token_jurnal_musyrif_keasramaan(is_active);

-- RLS
ALTER TABLE token_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on token_jurnal_musyrif_keasramaan" ON token_jurnal_musyrif_keasramaan FOR ALL USING (true);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
