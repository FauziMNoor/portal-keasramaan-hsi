-- Check available santri data
SELECT 
  nis,
  nama_siswa,
  cabang,
  kelas,
  asrama,
  status
FROM data_siswa_keasramaan
WHERE status = 'aktif'
ORDER BY cabang, kelas, asrama, nama_siswa
LIMIT 20;

-- Check specific filters
SELECT DISTINCT
  cabang,
  kelas,
  asrama
FROM data_siswa_keasramaan
WHERE status = 'aktif'
ORDER BY cabang, kelas, asrama;
