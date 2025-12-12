-- =====================================================
-- CHECK EXISTING MUSYRIF DATA
-- =====================================================

-- 1. Check all musyrif with their cabang
SELECT 
  nama_musyrif,
  cabang,
  asrama,
  kelas,
  status,
  created_at
FROM musyrif_keasramaan
ORDER BY cabang, nama_musyrif;

-- 2. Count musyrif per cabang
SELECT 
  cabang,
  COUNT(*) as total_musyrif,
  COUNT(CASE WHEN status = 'aktif' THEN 1 END) as total_aktif,
  COUNT(CASE WHEN status != 'aktif' OR status IS NULL THEN 1 END) as total_non_aktif
FROM musyrif_keasramaan
GROUP BY cabang
ORDER BY cabang;

-- 3. Check cabang names in cabang_keasramaan table
SELECT 
  nama_cabang,
  created_at
FROM cabang_keasramaan
ORDER BY nama_cabang;

-- 4. Find mismatched cabang names
SELECT DISTINCT 
  m.cabang as musyrif_cabang,
  c.nama_cabang as cabang_table_name,
  CASE 
    WHEN m.cabang = c.nama_cabang THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM musyrif_keasramaan m
FULL OUTER JOIN cabang_keasramaan c ON m.cabang = c.nama_cabang
ORDER BY status, musyrif_cabang;
