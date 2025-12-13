-- =====================================================
-- RAPOR SAMPLE DATA (OPTIONAL)
-- Created: 2024-12-12
-- =====================================================
-- Jalankan script ini jika data master belum ada
-- untuk testing Setup Rapor

-- =====================================================
-- 1. Sample Cabang
-- =====================================================
INSERT INTO cabang_keasramaan (nama_cabang) 
VALUES ('Pusat')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Sample Tahun Ajaran
-- =====================================================
INSERT INTO tahun_ajaran_keasramaan (tahun_ajaran, status) 
VALUES 
  ('2024/2025', 'aktif'),
  ('2023/2024', 'non-aktif')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. Sample Semester
-- =====================================================
INSERT INTO semester_keasramaan (semester, angka, status) 
VALUES 
  ('Ganjil', 1, 'aktif'),
  ('Genap', 2, 'aktif')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Sample Kelas
-- =====================================================
INSERT INTO kelas_keasramaan (nama_kelas, status) 
VALUES 
  ('7', 'aktif'),
  ('8', 'aktif'),
  ('9', 'aktif')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. Sample Asrama
-- =====================================================
INSERT INTO asrama_keasramaan (asrama, kelas, lokasi, status) 
VALUES 
  ('Asrama A', '7', 'Pusat', 'aktif'),
  ('Asrama B', '8', 'Pusat', 'aktif'),
  ('Asrama C', '9', 'Pusat', 'aktif')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SELESAI
-- =====================================================
-- Cek data sudah masuk:
-- SELECT * FROM lokasi_keasramaan;
-- SELECT * FROM tahun_ajaran_keasramaan;
-- SELECT * FROM semester_keasramaan;
-- SELECT * FROM kelas_keasramaan;
-- SELECT * FROM asrama_keasramaan;
