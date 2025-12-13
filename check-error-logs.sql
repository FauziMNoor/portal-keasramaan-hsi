-- Check latest error logs from rapor generation
SELECT 
  nis,
  nama_siswa,
  cabang,
  kelas,
  asrama,
  tahun_ajaran,
  semester,
  status,
  error_message,
  generated_at
FROM rapor_generate_log_keasramaan
WHERE status = 'failed'
ORDER BY generated_at DESC
LIMIT 10;

-- Check if there are any successful generations
SELECT 
  status,
  COUNT(*) as count
FROM rapor_generate_log_keasramaan
GROUP BY status;
