-- Check kegiatan data
SELECT 
  cabang,
  tahun_ajaran,
  semester,
  kelas,
  asrama,
  urutan,
  nama_kegiatan
FROM rapor_kegiatan_keasramaan
ORDER BY cabang, kelas, asrama, urutan;

-- Check what filters are available
SELECT DISTINCT cabang FROM rapor_kegiatan_keasramaan;
SELECT DISTINCT tahun_ajaran FROM rapor_kegiatan_keasramaan;
SELECT DISTINCT semester FROM rapor_kegiatan_keasramaan;
SELECT DISTINCT kelas FROM rapor_kegiatan_keasramaan;
SELECT DISTINCT asrama FROM rapor_kegiatan_keasramaan;
