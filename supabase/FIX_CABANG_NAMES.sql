-- =====================================================
-- FIX CABANG NAMES MISMATCH
-- =====================================================
-- Date: 2024-12-10
-- Purpose: Standardize cabang names between tables

-- Common mismatch patterns and fixes:
-- "Pusat" → "HSI Boarding School Bekasi"
-- "Sukabumi" → "HSI Boarding School Sukabumi"
-- "Purworejo" → "HSI Boarding School Purworejo"

-- OPTION 1: Update musyrif_keasramaan to match cabang_keasramaan
-- (Use this if you want to use full names)

UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Bekasi'
WHERE cabang IN ('Pusat', 'Bekasi', 'pusat', 'bekasi');

UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Sukabumi'
WHERE cabang IN ('Sukabumi', 'sukabumi');

UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Purworejo'
WHERE cabang IN ('Purworejo', 'purworejo');

-- OPTION 2: Update cabang_keasramaan to use short names
-- (Use this if you prefer short names like "Pusat", "Sukabumi")
-- Uncomment if you want to use this option:

-- UPDATE cabang_keasramaan 
-- SET nama_cabang = 'Pusat'
-- WHERE nama_cabang = 'HSI Boarding School Bekasi';

-- UPDATE cabang_keasramaan 
-- SET nama_cabang = 'Sukabumi'
-- WHERE nama_cabang = 'HSI Boarding School Sukabumi';

-- UPDATE cabang_keasramaan 
-- SET nama_cabang = 'Purworejo'
-- WHERE nama_cabang = 'HSI Boarding School Purworejo';

-- Verify after update
SELECT 
  m.cabang as musyrif_cabang,
  COUNT(*) as total_musyrif,
  COUNT(CASE WHEN m.status = 'aktif' THEN 1 END) as total_aktif
FROM musyrif_keasramaan m
GROUP BY m.cabang
ORDER BY m.cabang;

-- Check if all cabang now match
SELECT DISTINCT 
  m.cabang as musyrif_cabang,
  c.nama_cabang as cabang_table_name,
  CASE 
    WHEN m.cabang = c.nama_cabang THEN '✅ Match'
    ELSE '❌ Still Mismatch'
  END as status
FROM musyrif_keasramaan m
FULL OUTER JOIN cabang_keasramaan c ON m.cabang = c.nama_cabang
ORDER BY status;
