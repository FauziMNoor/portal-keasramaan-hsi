-- =====================================================
-- SETUP DATABASE CATATAN PERILAKU (PELANGGARAN & KEBAIKAN)
-- =====================================================

-- 1. Tabel Kategori Pelanggaran
CREATE TABLE IF NOT EXISTS kategori_pelanggaran_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori VARCHAR(255) NOT NULL,
  poin INTEGER NOT NULL,
  deskripsi TEXT,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabel Kategori Kebaikan
CREATE TABLE IF NOT EXISTS kategori_kebaikan_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori VARCHAR(255) NOT NULL,
  poin INTEGER NOT NULL,
  deskripsi TEXT,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabel Catatan Perilaku (gabungan pelanggaran & kebaikan)
CREATE TABLE IF NOT EXISTS catatan_perilaku_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe VARCHAR(20) NOT NULL, -- 'pelanggaran' atau 'kebaikan'
  tanggal DATE NOT NULL,
  nis VARCHAR(50) NOT NULL,
  nama_siswa VARCHAR(255) NOT NULL,
  cabang VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  asrama VARCHAR(100) NOT NULL,
  kepala_asrama VARCHAR(255),
  musyrif VARCHAR(255),
  kategori_id UUID NOT NULL,
  nama_kategori VARCHAR(255) NOT NULL,
  poin INTEGER NOT NULL,
  deskripsi_tambahan TEXT,
  dicatat_oleh VARCHAR(255) NOT NULL, -- nama user yang input
  tahun_ajaran VARCHAR(20),
  semester VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabel Token Input Catatan Perilaku
CREATE TABLE IF NOT EXISTS token_catatan_perilaku_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  nama_pemberi VARCHAR(255) NOT NULL,
  cabang VARCHAR(100),
  kelas VARCHAR(50),
  asrama VARCHAR(100),
  musyrif VARCHAR(255),
  tipe_akses VARCHAR(20) DEFAULT 'semua', -- 'semua', 'pelanggaran', 'kebaikan'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES untuk performa
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_nis ON catatan_perilaku_keasramaan(nis);
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_tanggal ON catatan_perilaku_keasramaan(tanggal);
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_tipe ON catatan_perilaku_keasramaan(tipe);
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_cabang ON catatan_perilaku_keasramaan(cabang);
CREATE INDEX IF NOT EXISTS idx_catatan_perilaku_kelas ON catatan_perilaku_keasramaan(kelas);
CREATE INDEX IF NOT EXISTS idx_token_catatan_perilaku_token ON token_catatan_perilaku_keasramaan(token);

-- =====================================================
-- DATA AWAL - Kategori Pelanggaran
-- =====================================================

INSERT INTO kategori_pelanggaran_keasramaan (nama_kategori, poin, deskripsi) VALUES
('Terlambat Shalat Berjamaah', -5, 'Terlambat mengikuti shalat berjamaah di masjid'),
('Tidak Mengikuti Shalat Berjamaah', -10, 'Tidak hadir shalat berjamaah tanpa izin'),
('Keluar Asrama Tanpa Izin', -15, 'Keluar dari area asrama tanpa izin musyrif'),
('Terlambat Masuk Asrama', -10, 'Terlambat kembali ke asrama dari kegiatan'),
('Tidak Mengikuti Piket', -5, 'Tidak melaksanakan piket kebersihan kamar'),
('Kamar Kotor/Berantakan', -5, 'Kondisi kamar tidak rapi dan bersih'),
('Berbicara Kasar', -10, 'Menggunakan kata-kata kasar atau tidak sopan'),
('Berkelahi', -20, 'Terlibat perkelahian dengan santri lain'),
('Merokok', -25, 'Kedapatan merokok di area asrama'),
('Membawa HP Tanpa Izin', -15, 'Membawa handphone tanpa izin pengurus'),
('Tidak Mengikuti Tahfidz', -10, 'Tidak hadir halaqah tahfidz tanpa izin'),
('Tidur Saat Kegiatan', -5, 'Tertidur saat kegiatan berlangsung'),
('Merusak Fasilitas', -20, 'Merusak fasilitas asrama dengan sengaja'),
('Mencuri', -30, 'Mengambil barang milik orang lain'),
('Berbohong', -10, 'Memberikan keterangan yang tidak benar');

-- =====================================================
-- DATA AWAL - Kategori Kebaikan
-- =====================================================

INSERT INTO kategori_kebaikan_keasramaan (nama_kategori, poin, deskripsi) VALUES
('Imam Shalat Berjamaah', 10, 'Menjadi imam shalat berjamaah'),
('Adzan', 5, 'Melaksanakan adzan untuk shalat berjamaah'),
('Membantu Teman', 5, 'Membantu teman yang kesulitan'),
('Juara Lomba', 15, 'Menjuarai lomba/kompetisi'),
('Hafalan Quran Bertambah', 10, 'Menambah hafalan Al-Quran'),
('Piket Tambahan', 5, 'Melakukan piket di luar jadwal'),
('Menjaga Kebersihan', 5, 'Aktif menjaga kebersihan asrama'),
('Memimpin Kegiatan', 10, 'Memimpin kegiatan asrama dengan baik'),
('Sedekah', 5, 'Bersedekah kepada teman atau lembaga'),
('Shalat Dhuha Rutin', 5, 'Melaksanakan shalat dhuha secara rutin'),
('Tahajud', 10, 'Melaksanakan shalat tahajud'),
('Mentoring Teman', 10, 'Membantu mengajar/mentoring teman'),
('Prestasi Akademik', 15, 'Mendapat prestasi akademik'),
('Inisiatif Positif', 10, 'Mengambil inisiatif untuk kebaikan bersama'),
('Akhlak Terpuji', 10, 'Menunjukkan akhlak yang sangat baik');

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE kategori_pelanggaran_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_kebaikan_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE catatan_perilaku_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_catatan_perilaku_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policies untuk kategori_pelanggaran_keasramaan
CREATE POLICY "Allow read access to all users" ON kategori_pelanggaran_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON kategori_pelanggaran_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON kategori_pelanggaran_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON kategori_pelanggaran_keasramaan FOR DELETE USING (true);

-- Policies untuk kategori_kebaikan_keasramaan
CREATE POLICY "Allow read access to all users" ON kategori_kebaikan_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON kategori_kebaikan_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON kategori_kebaikan_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON kategori_kebaikan_keasramaan FOR DELETE USING (true);

-- Policies untuk catatan_perilaku_keasramaan
CREATE POLICY "Allow read access to all users" ON catatan_perilaku_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON catatan_perilaku_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON catatan_perilaku_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON catatan_perilaku_keasramaan FOR DELETE USING (true);

-- Policies untuk token_catatan_perilaku_keasramaan
CREATE POLICY "Allow read access to all users" ON token_catatan_perilaku_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON token_catatan_perilaku_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON token_catatan_perilaku_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON token_catatan_perilaku_keasramaan FOR DELETE USING (true);

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan semua query berhasil dijalankan
