-- =====================================================
-- FIX STATUS COLUMN LENGTH
-- =====================================================
-- Date: 2024-12-10
-- Purpose: Fix "value too long for type character varying(20)" error
-- Issue: status column is VARCHAR(20) but values like 'approved_kepala_asrama' (23 chars) are too long

-- Fix jadwal_libur_musyrif_keasramaan.status column
ALTER TABLE jadwal_libur_musyrif_keasramaan 
ALTER COLUMN status TYPE VARCHAR(50);

-- Verify
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'jadwal_libur_musyrif_keasramaan' 
  AND column_name = 'status';

-- Expected result: character_maximum_length = 50
