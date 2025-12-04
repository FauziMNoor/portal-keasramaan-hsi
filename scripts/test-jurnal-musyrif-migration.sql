-- Test Script untuk Jurnal Musyrif Migration
-- Jalankan ini setelah migration utama untuk verifikasi

-- 1. Cek apakah semua tabel sudah dibuat
SELECT 
  'sesi_jurnal_musyrif_keasramaan' as table_name, 
  COUNT(*) as record_count 
FROM sesi_jurnal_musyrif_keasramaan
UNION ALL
SELECT 
  'jadwal_jurnal_musyrif_keasramaan', 
  COUNT(*) 
FROM jadwal_jurnal_musyrif_keasramaan
UNION ALL
SELECT 
  'kegiatan_jurnal_musyrif_keasramaan', 
  COUNT(*) 
FROM kegiatan_jurnal_musyrif_keasramaan
UNION ALL
SELECT 
  'token_jurnal_musyrif_keasramaan', 
  COUNT(*) 
FROM token_jurnal_musyrif_keasramaan
UNION ALL
SELECT 
  'formulir_jurnal_musyrif_keasramaan', 
  COUNT(*) 
FROM formulir_jurnal_musyrif_keasramaan;

-- 2. Cek seed data sesi (harus ada 5 sesi)
SELECT * FROM sesi_jurnal_musyrif_keasramaan ORDER BY urutan;

-- 3. Cek total jadwal per sesi
SELECT 
  s.nama_sesi,
  COUNT(j.id) as total_jadwal
FROM sesi_jurnal_musyrif_keasramaan s
LEFT JOIN jadwal_jurnal_musyrif_keasramaan j ON s.id = j.sesi_id
GROUP BY s.id, s.nama_sesi
ORDER BY s.urutan;

-- 4. Cek total kegiatan per sesi
SELECT 
  s.nama_sesi,
  COUNT(k.id) as total_kegiatan
FROM sesi_jurnal_musyrif_keasramaan s
LEFT JOIN jadwal_jurnal_musyrif_keasramaan j ON s.id = j.sesi_id
LEFT JOIN kegiatan_jurnal_musyrif_keasramaan k ON j.id = k.jadwal_id
GROUP BY s.id, s.nama_sesi
ORDER BY s.urutan;

-- 5. Cek indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename LIKE '%jurnal_musyrif%'
ORDER BY tablename, indexname;

-- Expected Results:
-- - 5 sesi (SESI 1 sampai SESI 5)
-- - Total jadwal: ~30-35 jadwal
-- - Total kegiatan: ~70-80 kegiatan
-- - Indexes: minimal 6 indexes
