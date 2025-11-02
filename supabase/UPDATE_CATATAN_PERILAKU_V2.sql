-- =====================================================
-- UPDATE CATATAN PERILAKU V2
-- Perubahan: Kategori menjadi general, pelanggaran/kebaikan manual input
-- =====================================================

-- 1. Hapus tabel kategori lama (backup dulu jika perlu!)
DROP TABLE IF EXISTS kategori_pelanggaran_keasramaan CASCADE;
DROP TABLE IF EXISTS kategori_kebaikan_keasramaan CASCADE;

-- 2. Buat tabel kategori umum (untuk pelanggaran & kebaikan)
CREATE TABLE IF NOT EXISTS kategori_perilaku_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori VARCHAR(255) NOT NULL UNIQUE,
  deskripsi TEXT,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Buat tabel level dampak (untuk pelanggaran)
CREATE TABLE IF NOT EXISTS level_dampak_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_level VARCHAR(50) NOT NULL UNIQUE,
  poin INTEGER NOT NULL,
  deskripsi TEXT,
  urutan INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Update tabel catatan_perilaku_keasramaan
-- Tambah kolom baru
ALTER TABLE catatan_perilaku_keasramaan 
  ADD COLUMN IF NOT EXISTS nama_pelanggaran_kebaikan TEXT,
  ADD COLUMN IF NOT EXISTS level_dampak VARCHAR(50),
  ADD COLUMN IF NOT EXISTS level_dampak_id UUID;

-- Rename kolom kategori_id jadi kategori_perilaku_id
ALTER TABLE catatan_perilaku_keasramaan 
  RENAME COLUMN kategori_id TO kategori_perilaku_id;

-- Update kolom nama_kategori jadi nullable (karena sekarang kategori umum)
ALTER TABLE catatan_perilaku_keasramaan 
  ALTER COLUMN nama_kategori DROP NOT NULL;

-- =====================================================
-- DATA AWAL - Kategori Umum
-- =====================================================

INSERT INTO kategori_perilaku_keasramaan (nama_kategori, deskripsi) VALUES
('Kedisiplinan', 'Kategori terkait disiplin waktu, aturan, dan ketertiban'),
('Kebersihan', 'Kategori terkait kebersihan diri, kamar, dan lingkungan'),
('Adab & Akhlak', 'Kategori terkait sopan santun, etika, dan perilaku'),
('Ibadah', 'Kategori terkait pelaksanaan ibadah dan kegiatan keagamaan'),
('Tanggung Jawab', 'Kategori terkait tanggung jawab tugas dan amanah'),
('Akademik', 'Kategori terkait prestasi dan kegiatan belajar'),
('Sosial', 'Kategori terkait hubungan sosial dan kerjasama'),
('Kesehatan', 'Kategori terkait kesehatan fisik dan mental'),
('Kreativitas', 'Kategori terkait kreativitas dan inovasi'),
('Kepemimpinan', 'Kategori terkait jiwa kepemimpinan dan inisiatif');

-- =====================================================
-- DATA AWAL - Level Dampak (untuk Pelanggaran)
-- =====================================================

INSERT INTO level_dampak_keasramaan (nama_level, poin, deskripsi, urutan) VALUES
('Ringan', -5, 'Pelanggaran ringan yang tidak berdampak signifikan', 1),
('Sedang', -15, 'Pelanggaran sedang yang cukup berdampak', 2),
('Berat', -30, 'Pelanggaran berat yang sangat berdampak', 3);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_kategori_perilaku_nama ON kategori_perilaku_keasramaan(nama_kategori);
CREATE INDEX IF NOT EXISTS idx_level_dampak_nama ON level_dampak_keasramaan(nama_level);
CREATE INDEX IF NOT EXISTS idx_catatan_kategori_perilaku ON catatan_perilaku_keasramaan(kategori_perilaku_id);
CREATE INDEX IF NOT EXISTS idx_catatan_level_dampak ON catatan_perilaku_keasramaan(level_dampak_id);

-- =====================================================
-- RLS Policies untuk tabel baru
-- =====================================================

-- Enable RLS
ALTER TABLE kategori_perilaku_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_dampak_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policies untuk kategori_perilaku_keasramaan
CREATE POLICY "Allow read access to all users" ON kategori_perilaku_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON kategori_perilaku_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON kategori_perilaku_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON kategori_perilaku_keasramaan FOR DELETE USING (true);

-- Policies untuk level_dampak_keasramaan
CREATE POLICY "Allow read access to all users" ON level_dampak_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON level_dampak_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON level_dampak_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON level_dampak_keasramaan FOR DELETE USING (true);

-- =====================================================
-- CONTOH DATA PELANGGARAN & KEBAIKAN (Optional)
-- =====================================================

-- Contoh insert catatan pelanggaran dengan struktur baru:
-- INSERT INTO catatan_perilaku_keasramaan (
--   tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
--   kategori_perilaku_id, nama_kategori, 
--   nama_pelanggaran_kebaikan, level_dampak, level_dampak_id, poin,
--   deskripsi_tambahan, dicatat_oleh, tahun_ajaran, semester
-- ) VALUES (
--   'pelanggaran', '2025-11-02', '12345', 'Ahmad', 'Pusat', '7', 'Asrama A',
--   (SELECT id FROM kategori_perilaku_keasramaan WHERE nama_kategori = 'Kedisiplinan'),
--   'Kedisiplinan',
--   'Terlambat Shalat Subuh', 'Ringan',
--   (SELECT id FROM level_dampak_keasramaan WHERE nama_level = 'Ringan'),
--   -5,
--   'Terlambat 10 menit', 'Musyrif Ahmad', '2024/2025', 'Ganjil'
-- );

-- Contoh insert catatan kebaikan dengan struktur baru:
-- INSERT INTO catatan_perilaku_keasramaan (
--   tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
--   kategori_perilaku_id, nama_kategori,
--   nama_pelanggaran_kebaikan, poin,
--   deskripsi_tambahan, dicatat_oleh, tahun_ajaran, semester
-- ) VALUES (
--   'kebaikan', '2025-11-02', '12345', 'Ahmad', 'Pusat', '7', 'Asrama A',
--   (SELECT id FROM kategori_perilaku_keasramaan WHERE nama_kategori = 'Ibadah'),
--   'Ibadah',
--   'Menjadi Imam Shalat Maghrib', 10,
--   'Suara adzan bagus', 'Musyrif Ahmad', '2024/2025', 'Ganjil'
-- );

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- PERHATIAN: Script ini akan menghapus tabel kategori lama!
-- Backup data dulu jika diperlukan!
