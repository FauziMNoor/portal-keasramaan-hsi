-- Check if data_siswa_keasramaan table exists and has data
SELECT COUNT(*) as total_siswa FROM data_siswa_keasramaan;

-- Check sample data
SELECT 
  nis,
  nama_siswa,
  cabang,
  kelas,
  asrama
FROM data_siswa_keasramaan
LIMIT 10;

-- Check distinct values
SELECT DISTINCT cabang FROM data_siswa_keasramaan WHERE cabang IS NOT NULL;
SELECT DISTINCT kelas FROM data_siswa_keasramaan WHERE kelas IS NOT NULL;
SELECT DISTINCT asrama FROM data_siswa_keasramaan WHERE asrama IS NOT NULL;

-- Check all columns in the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'data_siswa_keasramaan'
ORDER BY ordinal_position;
