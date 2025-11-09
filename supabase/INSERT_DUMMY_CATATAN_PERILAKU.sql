-- =====================================================
-- INSERT DATA DUMMY CATATAN PERILAKU UNTUK TESTING
-- =====================================================
-- NIS: 202410020 (M. Sovra Aludjava Pasopati)
-- Gunakan script ini untuk testing fitur Catatan Perilaku di Laporan Wali Santri
-- =====================================================

-- Hapus data dummy sebelumnya (opsional)
-- DELETE FROM catatan_perilaku_keasramaan WHERE nis = '202410020';

-- =====================================================
-- DATA KEBAIKAN (10 records)
-- =====================================================

-- Kebaikan 1: Imam Shalat Berjamaah
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE,
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Imam Shalat Berjamaah' LIMIT 1),
  'Imam Shalat Berjamaah',
  10,
  'Memimpin shalat Maghrib dengan khusyuk',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 2: Hafalan Quran Bertambah
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '1 day',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Hafalan Quran Bertambah' LIMIT 1),
  'Hafalan Quran Bertambah',
  10,
  'Hafal 1 halaman baru (Surah Al-Baqarah)',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 3: Membantu Teman
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '2 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Membantu Teman' LIMIT 1),
  'Membantu Teman',
  5,
  'Membantu teman yang sakit membersihkan kamar',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 4: Shalat Dhuha Rutin
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '3 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Shalat Dhuha Rutin' LIMIT 1),
  'Shalat Dhuha Rutin',
  5,
  'Konsisten shalat dhuha selama seminggu',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 5: Adzan
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '4 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Adzan' LIMIT 1),
  'Adzan',
  5,
  'Adzan Subuh dengan suara merdu',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 6: Piket Tambahan
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '5 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Piket Tambahan' LIMIT 1),
  'Piket Tambahan',
  5,
  'Membersihkan musholla tanpa diminta',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 7: Sedekah
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '6 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Sedekah' LIMIT 1),
  'Sedekah',
  5,
  'Bersedekah untuk korban bencana',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 8: Tahajud
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '7 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Tahajud' LIMIT 1),
  'Tahajud',
  10,
  'Shalat tahajud sepertiga malam',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 9: Akhlak Terpuji
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '8 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Akhlak Terpuji' LIMIT 1),
  'Akhlak Terpuji',
  10,
  'Sangat sopan dan menghormati guru',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Kebaikan 10: Mentoring Teman
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE - INTERVAL '9 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Mentoring Teman' LIMIT 1),
  'Mentoring Teman',
  10,
  'Mengajar teman matematika',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- =====================================================
-- DATA PELANGGARAN (5 records)
-- =====================================================

-- Pelanggaran 1: Terlambat Shalat Berjamaah
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '2 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Terlambat Shalat Berjamaah' LIMIT 1),
  'Terlambat Shalat Berjamaah',
  -5,
  'Terlambat 10 menit shalat Ashar',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Pelanggaran 2: Tidak Mengikuti Piket
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '5 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Tidak Mengikuti Piket' LIMIT 1),
  'Tidak Mengikuti Piket',
  -5,
  'Tidak hadir piket pagi tanpa izin',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Pelanggaran 3: Kamar Kotor/Berantakan
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '8 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Kamar Kotor/Berantakan' LIMIT 1),
  'Kamar Kotor/Berantakan',
  -5,
  'Kamar tidak rapi saat inspeksi',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Pelanggaran 4: Tidur Saat Kegiatan
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '12 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Tidur Saat Kegiatan' LIMIT 1),
  'Tidur Saat Kegiatan',
  -5,
  'Tertidur saat kajian malam',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- Pelanggaran 5: Terlambat Masuk Asrama
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, 
  deskripsi_tambahan, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '15 days',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Terlambat Masuk Asrama' LIMIT 1),
  'Terlambat Masuk Asrama',
  -10,
  'Terlambat 30 menit dari kegiatan ekstrakurikuler',
  'Musyrif Ahmad',
  '2024/2025',
  'Semester 1'
);

-- =====================================================
-- VERIFIKASI DATA
-- =====================================================

-- Cek total data yang diinsert
SELECT 
  tipe,
  COUNT(*) as jumlah,
  SUM(poin) as total_poin
FROM catatan_perilaku_keasramaan
WHERE nis = '202410020'
GROUP BY tipe;

-- Expected result:
-- tipe        | jumlah | total_poin
-- ------------|--------|------------
-- kebaikan    |   10   |    +75
-- pelanggaran |    5   |    -30
-- 
-- Total Poin Akhir: +45

-- Cek detail semua data
SELECT 
  tipe,
  tanggal,
  nama_kategori,
  poin,
  deskripsi_tambahan
FROM catatan_perilaku_keasramaan
WHERE nis = '202410020'
ORDER BY tanggal DESC;

-- =====================================================
-- SELESAI
-- =====================================================
-- Setelah menjalankan script ini:
-- 1. Refresh halaman laporan wali santri
-- 2. Clear cache browser (Ctrl+Shift+R)
-- 3. Fitur "Catatan Perilaku" akan muncul dengan data dummy
-- =====================================================
