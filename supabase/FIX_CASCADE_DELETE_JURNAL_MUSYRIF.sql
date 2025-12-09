-- =====================================================
-- FIX: Add CASCADE DELETE to Formulir Jurnal Musyrif
-- Issue: Cannot delete Sesi/Jadwal/Kegiatan if Formulir exists
-- Solution: Add ON DELETE CASCADE to foreign keys
-- =====================================================

-- Drop existing foreign key constraints
ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  DROP CONSTRAINT IF EXISTS formulir_jurnal_musyrif_keasramaan_sesi_id_fkey;

ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  DROP CONSTRAINT IF EXISTS formulir_jurnal_musyrif_keasramaan_jadwal_id_fkey;

ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  DROP CONSTRAINT IF EXISTS formulir_jurnal_musyrif_keasramaan_kegiatan_id_fkey;

-- Add new foreign key constraints WITH CASCADE DELETE
ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  ADD CONSTRAINT formulir_jurnal_musyrif_keasramaan_sesi_id_fkey 
  FOREIGN KEY (sesi_id) 
  REFERENCES sesi_jurnal_musyrif_keasramaan(id) 
  ON DELETE CASCADE;

ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  ADD CONSTRAINT formulir_jurnal_musyrif_keasramaan_jadwal_id_fkey 
  FOREIGN KEY (jadwal_id) 
  REFERENCES jadwal_jurnal_musyrif_keasramaan(id) 
  ON DELETE CASCADE;

ALTER TABLE formulir_jurnal_musyrif_keasramaan 
  ADD CONSTRAINT formulir_jurnal_musyrif_keasramaan_kegiatan_id_fkey 
  FOREIGN KEY (kegiatan_id) 
  REFERENCES kegiatan_jurnal_musyrif_keasramaan(id) 
  ON DELETE CASCADE;

-- =====================================================
-- DONE! Now you can delete Sesi/Jadwal/Kegiatan
-- and related Formulir data will be deleted automatically
-- =====================================================
