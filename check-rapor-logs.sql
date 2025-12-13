-- Check rapor generate logs to see error messages
SELECT 
  nis,
  nama_siswa,
  status,
  error_message,
  generated_at,
  cabang,
  kelas,
  asrama
FROM rapor_generate_log_keasramaan
ORDER BY generated_at DESC
LIMIT 20;
