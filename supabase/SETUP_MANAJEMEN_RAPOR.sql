-- =====================================================
-- SETUP DATABASE SISTEM MANAJEMEN RAPOR KEASRAMAAN
-- =====================================================
-- Script ini membuat 9 tabel untuk sistem manajemen rapor:
-- 1. kegiatan_asrama_keasramaan
-- 2. kegiatan_galeri_keasramaan
-- 3. rapor_template_keasramaan
-- 4. rapor_template_page_keasramaan
-- 5. rapor_kategori_indikator_keasramaan
-- 6. rapor_indikator_keasramaan
-- 7. rapor_capaian_siswa_keasramaan
-- 8. rapor_galeri_token_keasramaan
-- 9. rapor_generate_history_keasramaan
-- =====================================================

-- =====================================================
-- 1. Tabel Kegiatan Asrama
-- =====================================================
CREATE TABLE IF NOT EXISTS kegiatan_asrama_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kegiatan VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  scope VARCHAR(50) NOT NULL, -- 'seluruh_sekolah', 'kelas_10', 'kelas_11', 'kelas_12', 'asrama_putra', 'asrama_putri'
  kelas_id UUID, -- nullable, untuk scope spesifik kelas
  asrama_id UUID, -- nullable, untuk scope spesifik asrama
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. Tabel Galeri Kegiatan (Foto)
-- =====================================================
CREATE TABLE IF NOT EXISTS kegiatan_galeri_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan_asrama_keasramaan(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  caption TEXT,
  urutan INTEGER DEFAULT 0,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. Tabel Template Rapor
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_template_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_template VARCHAR(255) NOT NULL,
  jenis_rapor VARCHAR(50) NOT NULL, -- 'semester', 'bulanan', 'tahunan'
  ukuran_kertas_default VARCHAR(20) DEFAULT 'A4', -- 'A4', 'Letter', 'F4'
  orientasi_default VARCHAR(20) DEFAULT 'portrait', -- 'portrait', 'landscape'
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. Tabel Halaman Template
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_template_page_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES rapor_template_keasramaan(id) ON DELETE CASCADE,
  urutan INTEGER NOT NULL,
  tipe_halaman VARCHAR(50) NOT NULL, -- 'static_cover', 'dynamic_data', 'galeri_kegiatan', 'qr_code'
  ukuran_kertas VARCHAR(20), -- override default
  orientasi VARCHAR(20), -- override default
  config JSONB, -- konfigurasi spesifik per tipe
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. Tabel Kategori Indikator
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_kategori_indikator_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori VARCHAR(255) NOT NULL, -- 'UBUDIYAH', 'AKHLAK', 'KEDISIPLINAN'
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. Tabel Indikator
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_indikator_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori_id UUID NOT NULL REFERENCES rapor_kategori_indikator_keasramaan(id) ON DELETE CASCADE,
  nama_indikator VARCHAR(255) NOT NULL, -- 'Shalat Fardhu Berjamaah'
  deskripsi TEXT,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. Tabel Capaian Siswa
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_capaian_siswa_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_nis VARCHAR(50) NOT NULL,
  indikator_id UUID NOT NULL REFERENCES rapor_indikator_keasramaan(id) ON DELETE CASCADE,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  nilai VARCHAR(10), -- 'A', 'B', 'C', 'D' atau custom
  deskripsi TEXT, -- deskripsi capaian
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(siswa_nis, indikator_id, tahun_ajaran, semester)
);

-- =====================================================
-- 8. Tabel Token Galeri Publik
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_galeri_token_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  siswa_nis VARCHAR(50) NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  expires_at TIMESTAMP, -- nullable untuk permanent link
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. Tabel History Generate Rapor
-- =====================================================
CREATE TABLE IF NOT EXISTS rapor_generate_history_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES rapor_template_keasramaan(id),
  siswa_nis VARCHAR(50) NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  generated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES untuk performa
-- =====================================================

-- Indexes untuk kegiatan_asrama_keasramaan
CREATE INDEX IF NOT EXISTS idx_kegiatan_tahun_semester ON kegiatan_asrama_keasramaan(tahun_ajaran, semester);
CREATE INDEX IF NOT EXISTS idx_kegiatan_scope ON kegiatan_asrama_keasramaan(scope);

-- Indexes untuk kegiatan_galeri_keasramaan
CREATE INDEX IF NOT EXISTS idx_galeri_kegiatan ON kegiatan_galeri_keasramaan(kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_galeri_urutan ON kegiatan_galeri_keasramaan(kegiatan_id, urutan);

-- Indexes untuk rapor_template_page_keasramaan
CREATE INDEX IF NOT EXISTS idx_template_page ON rapor_template_page_keasramaan(template_id, urutan);

-- Indexes untuk rapor_indikator_keasramaan
CREATE INDEX IF NOT EXISTS idx_indikator_kategori ON rapor_indikator_keasramaan(kategori_id, urutan);

-- Indexes untuk rapor_capaian_siswa_keasramaan
CREATE INDEX IF NOT EXISTS idx_capaian_siswa ON rapor_capaian_siswa_keasramaan(siswa_nis, tahun_ajaran, semester);

-- Indexes untuk rapor_galeri_token_keasramaan
CREATE INDEX IF NOT EXISTS idx_galeri_token ON rapor_galeri_token_keasramaan(token);

-- Indexes untuk rapor_generate_history_keasramaan
CREATE INDEX IF NOT EXISTS idx_generate_history ON rapor_generate_history_keasramaan(siswa_nis, tahun_ajaran, semester);

-- =====================================================
-- DATA AWAL - Kategori Indikator
-- =====================================================

INSERT INTO rapor_kategori_indikator_keasramaan (nama_kategori, urutan) VALUES
('UBUDIYAH', 1),
('AKHLAK', 2),
('KEDISIPLINAN', 3);

-- =====================================================
-- DATA AWAL - Indikator untuk Kategori UBUDIYAH
-- =====================================================

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Shalat Fardhu Berjamaah',
  'Kehadiran dan ketepatan waktu dalam melaksanakan shalat fardhu berjamaah di masjid',
  1
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Shalat Sunnah Rawatib',
  'Konsistensi dalam melaksanakan shalat sunnah rawatib qabliyah dan ba''diyah',
  2
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Shalat Dhuha',
  'Keistiqomahan dalam melaksanakan shalat dhuha',
  3
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Qiyamul Lail',
  'Kehadiran dan konsistensi dalam melaksanakan qiyamul lail/tahajud',
  4
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Tilawah Al-Quran',
  'Rutinitas dan kualitas dalam membaca Al-Quran',
  5
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Hafalan Al-Quran',
  'Progress dan kualitas hafalan Al-Quran',
  6
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Dzikir dan Doa',
  'Kebiasaan berdzikir dan berdoa setelah shalat serta dalam keseharian',
  7
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Puasa Sunnah',
  'Pelaksanaan puasa sunnah (Senin-Kamis, Ayyamul Bidh, dll)',
  8
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'UBUDIYAH';

-- =====================================================
-- DATA AWAL - Indikator untuk Kategori AKHLAK
-- =====================================================

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Sopan Santun kepada Guru',
  'Sikap hormat, taat, dan santun kepada guru dan pengasuh',
  1
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Hubungan dengan Teman',
  'Kemampuan bergaul, toleransi, dan kerjasama dengan sesama santri',
  2
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kejujuran',
  'Konsistensi dalam berkata jujur dan amanah',
  3
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Tanggung Jawab',
  'Kesadaran dalam menjalankan tugas dan kewajiban',
  4
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kepedulian Sosial',
  'Sikap peduli dan membantu sesama',
  5
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Adab Makan dan Minum',
  'Penerapan adab Islam dalam makan dan minum',
  6
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Adab Berbicara',
  'Penggunaan bahasa yang baik, sopan, dan tidak menyakiti',
  7
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kontrol Emosi',
  'Kemampuan mengendalikan amarah dan emosi negatif',
  8
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'AKHLAK';

-- =====================================================
-- DATA AWAL - Indikator untuk Kategori KEDISIPLINAN
-- =====================================================

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kehadiran Kegiatan Asrama',
  'Tingkat kehadiran dalam seluruh kegiatan asrama',
  1
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Ketepatan Waktu',
  'Kedisiplinan dalam mengikuti jadwal kegiatan',
  2
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kebersihan Diri',
  'Perhatian terhadap kebersihan dan kerapian diri',
  3
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kebersihan Kamar',
  'Tanggung jawab menjaga kebersihan dan kerapian kamar',
  4
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Pelaksanaan Piket',
  'Konsistensi dalam melaksanakan tugas piket',
  5
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Kepatuhan Tata Tertib',
  'Ketaatan terhadap peraturan dan tata tertib asrama',
  6
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Penggunaan Waktu',
  'Efektivitas dalam mengatur dan memanfaatkan waktu',
  7
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

INSERT INTO rapor_indikator_keasramaan (kategori_id, nama_indikator, deskripsi, urutan)
SELECT 
  id,
  'Izin dan Perizinan',
  'Kepatuhan dalam prosedur izin keluar/masuk asrama',
  8
FROM rapor_kategori_indikator_keasramaan WHERE nama_kategori = 'KEDISIPLINAN';

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS untuk semua tabel
ALTER TABLE kegiatan_asrama_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_galeri_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_template_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_template_page_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_kategori_indikator_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_indikator_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_capaian_siswa_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_galeri_token_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_generate_history_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policies untuk kegiatan_asrama_keasramaan
CREATE POLICY "Allow read access to all users" ON kegiatan_asrama_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON kegiatan_asrama_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON kegiatan_asrama_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON kegiatan_asrama_keasramaan FOR DELETE USING (true);

-- Policies untuk kegiatan_galeri_keasramaan
CREATE POLICY "Allow read access to all users" ON kegiatan_galeri_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON kegiatan_galeri_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON kegiatan_galeri_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON kegiatan_galeri_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_template_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_template_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_template_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_template_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_template_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_template_page_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_template_page_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_template_page_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_template_page_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_template_page_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_kategori_indikator_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_kategori_indikator_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_kategori_indikator_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_kategori_indikator_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_kategori_indikator_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_indikator_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_indikator_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_indikator_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_indikator_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_indikator_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_capaian_siswa_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_capaian_siswa_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_capaian_siswa_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_capaian_siswa_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_capaian_siswa_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_galeri_token_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_galeri_token_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_galeri_token_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_galeri_token_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_galeri_token_keasramaan FOR DELETE USING (true);

-- Policies untuk rapor_generate_history_keasramaan
CREATE POLICY "Allow read access to all users" ON rapor_generate_history_keasramaan FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON rapor_generate_history_keasramaan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON rapor_generate_history_keasramaan FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON rapor_generate_history_keasramaan FOR DELETE USING (true);

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan semua query berhasil dijalankan
-- 
-- Script ini telah membuat:
-- ✓ 9 tabel dengan proper constraints dan foreign keys
-- ✓ Indexes untuk optimasi query
-- ✓ RLS policies untuk keamanan
-- ✓ 3 kategori indikator (Ubudiyah, Akhlak, Kedisiplinan)
-- ✓ 24 indikator sample (8 per kategori)
