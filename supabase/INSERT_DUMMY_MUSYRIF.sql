-- =====================================================
-- INSERT DUMMY DATA MUSYRIF UNTUK TESTING KPI
-- =====================================================

-- Insert dummy musyrif untuk HSI Boarding School Bekasi
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, status, jatah_cuti_tahunan, sisa_cuti_tahunan)
VALUES 
-- Bekasi
('Ustadz Ahmad Fauzi', 'HSI Boarding School Bekasi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Budi Santoso', 'HSI Boarding School Bekasi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Siti Nurhaliza', 'HSI Boarding School Bekasi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Fatimah Azzahra', 'HSI Boarding School Bekasi', 'Asrama Putri B', 'aktif', 12, 12),

-- Sukabumi
('Ustadz Muhammad Rizki', 'HSI Boarding School Sukabumi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Hasan Basri', 'HSI Boarding School Sukabumi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Aisyah Rahmawati', 'HSI Boarding School Sukabumi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Khadijah Maryam', 'HSI Boarding School Sukabumi', 'Asrama Putri B', 'aktif', 12, 12),

-- Purworejo
('Ustadz Abdullah Yusuf', 'HSI Boarding School Purworejo', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Ibrahim Khalil', 'HSI Boarding School Purworejo', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Maryam Zahra', 'HSI Boarding School Purworejo', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Zainab Husna', 'HSI Boarding School Purworejo', 'Asrama Putri B', 'aktif', 12, 12)
ON CONFLICT (nama_musyrif) DO NOTHING;

-- Verify
SELECT 
  cabang,
  COUNT(*) as total_musyrif,
  COUNT(CASE WHEN status = 'aktif' THEN 1 END) as total_aktif
FROM musyrif_keasramaan
GROUP BY cabang
ORDER BY cabang;
