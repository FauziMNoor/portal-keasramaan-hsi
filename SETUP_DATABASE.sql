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
