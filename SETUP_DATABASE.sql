-- =====================================================
-- SETUP DATABASE PORTAL KEASRAMAAN
-- HSI Boarding School
-- =====================================================

-- Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Tabel Tahun Ajaran
-- =====================================================
CREATE TABLE tahun_ajaran_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun_ajaran TEXT NOT NULL,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. Tabel Lokasi
-- =====================================================
CREATE TABLE lokasi_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lokasi TEXT NOT NULL,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. Tabel Asrama
-- =====================================================
CREATE TABLE asrama_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asrama TEXT NOT NULL,
    kelas TEXT,
    lokasi TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. Tabel Semester
-- =====================================================
CREATE TABLE semester_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester TEXT NOT NULL,
    angka INTEGER,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. Tabel Kelas
-- =====================================================
CREATE TABLE kelas_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas TEXT NOT NULL,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. Tabel Rombel
-- =====================================================
CREATE TABLE rombel_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_rombel TEXT NOT NULL,
    kelas TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. Tabel Kepala Asrama
-- =====================================================
CREATE TABLE kepala_asrama_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    lokasi TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. Tabel Identitas Sekolah
-- =====================================================
CREATE TABLE identitas_sekolah_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_sekolah TEXT NOT NULL,
    nama_kepala_sekolah TEXT,
    alamat TEXT,
    no_telepon TEXT,
    email TEXT,
    website TEXT,
    logo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. Tabel Musyrif
-- =====================================================
CREATE TABLE musyrif_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_musyrif TEXT NOT NULL,
    asrama TEXT,
    kelas TEXT,
    lokasi TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. Tabel Data Siswa
-- =====================================================
CREATE TABLE data_siswa_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    nis TEXT NOT NULL UNIQUE,
    lokasi TEXT,
    kelas TEXT,
    rombel TEXT,
    asrama TEXT,
    kepala_asrama TEXT,
    musyrif TEXT,
    foto TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. Tabel Formulir Habit Tracker
-- =====================================================
CREATE TABLE formulir_habit_tracker_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE NOT NULL,
    nama_santri TEXT NOT NULL,
    nis TEXT NOT NULL,
    kelas TEXT,
    kepas TEXT,
    musyrif TEXT,
    asrama TEXT,
    lokasi TEXT,
    semester TEXT,
    tahun_ajaran TEXT,
    shalat_fardhu_berjamaah TEXT,
    tata_cara_shalat TEXT,
    qiyamul_lail TEXT,
    shalat_sunnah TEXT,
    puasa_sunnah TEXT,
    tata_cara_wudhu TEXT,
    sedekah TEXT,
    dzikir_pagi_petang TEXT,
    etika_dalam_tutur_kata TEXT,
    etika_dalam_bergaul TEXT,
    etika_dalam_berpakaian TEXT,
    adab_sehari_hari TEXT,
    waktu_tidur TEXT,
    pelaksanaan_piket_kamar TEXT,
    disiplin_halaqah_tahfidz TEXT,
    perizinan TEXT,
    belajar_malam TEXT,
    disiplin_berangkat_ke_masjid TEXT,
    kebersihan_tubuh_berpakaian_berpenampilan TEXT,
    kamar TEXT,
    ranjang_dan_almari TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk membuat semua tabel yang diperlukan

-- =====================================================
-- 11. Tabel Indikator Penilaian
-- =====================================================
CREATE TABLE indikator_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori TEXT NOT NULL,
    nama_indikator TEXT NOT NULL,
    nilai INTEGER NOT NULL,
    rubrik TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert data default indikator
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai, rubrik) VALUES
-- Ubudiyah
('Ubudiyah', 'Shalat Fardhu Berjamaah', 3, '1 = Tidak pernah, 2 = Kadang-kadang, 3 = Selalu'),
('Ubudiyah', 'Tata Cara Shalat', 3, '1 = Kurang baik, 2 = Cukup baik, 3 = Sangat baik'),
('Ubudiyah', 'Qiyamul Lail', 3, '1 = Tidak pernah, 2 = Kadang-kadang, 3 = Rutin'),
('Ubudiyah', 'Shalat Sunnah', 3, '1 = Tidak pernah, 2 = Kadang-kadang, 3 = Rutin'),
('Ubudiyah', 'Puasa Sunnah', 5, '1 = Tidak pernah, 2 = Jarang, 3 = Kadang-kadang, 4 = Sering, 5 = Rutin'),
('Ubudiyah', 'Tata Cara Wudhu', 3, '1 = Kurang baik, 2 = Cukup baik, 3 = Sangat baik'),
('Ubudiyah', 'Sedekah', 4, '1 = Tidak pernah, 2 = Jarang, 3 = Kadang-kadang, 4 = Sering'),
('Ubudiyah', 'Dzikir Pagi Petang', 4, '1 = Tidak pernah, 2 = Jarang, 3 = Kadang-kadang, 4 = Rutin'),

-- Akhlaq
('Akhlaq', 'Etika dalam Tutur Kata', 3, '1 = Kurang sopan, 2 = Cukup sopan, 3 = Sangat sopan'),
('Akhlaq', 'Etika dalam Bergaul', 3, '1 = Kurang baik, 2 = Cukup baik, 3 = Sangat baik'),
('Akhlaq', 'Etika dalam Berpakaian', 3, '1 = Kurang rapi, 2 = Cukup rapi, 3 = Sangat rapi'),
('Akhlaq', 'Adab Sehari-hari', 3, '1 = Kurang baik, 2 = Cukup baik, 3 = Sangat baik'),

-- Kedisiplinan
('Kedisiplinan', 'Waktu Tidur', 4, '1 = Sangat larut, 2 = Larut, 3 = Tepat waktu, 4 = Lebih awal'),
('Kedisiplinan', 'Pelaksanaan Piket Kamar', 3, '1 = Tidak pernah, 2 = Kadang-kadang, 3 = Selalu'),
('Kedisiplinan', 'Disiplin Halaqah Tahfidz', 3, '1 = Tidak hadir, 2 = Kadang hadir, 3 = Selalu hadir'),
('Kedisiplinan', 'Perizinan', 3, '1 = Tidak izin, 2 = Kadang izin, 3 = Selalu izin'),
('Kedisiplinan', 'Belajar Malam', 4, '1 = Tidak pernah, 2 = Jarang, 3 = Kadang-kadang, 4 = Rutin'),
('Kedisiplinan', 'Disiplin Berangkat ke Masjid', 4, '1 = Sangat terlambat, 2 = Terlambat, 3 = Tepat waktu, 4 = Lebih awal'),

-- Kebersihan & Kerapian
('Kebersihan & Kerapian', 'Kebersihan Tubuh, Berpakaian, Berpenampilan', 3, '1 = Kurang bersih, 2 = Cukup bersih, 3 = Sangat bersih'),
('Kebersihan & Kerapian', 'Kamar', 3, '1 = Kotor, 2 = Cukup bersih, 3 = Sangat bersih'),
('Kebersihan & Kerapian', 'Ranjang dan Almari', 3, '1 = Tidak rapi, 2 = Cukup rapi, 3 = Sangat rapi');
