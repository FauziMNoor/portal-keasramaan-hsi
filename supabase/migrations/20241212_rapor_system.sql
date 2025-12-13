-- =====================================================
-- RAPOR SYSTEM - PORTAL KEASRAMAAN
-- Created: 2024-12-12
-- =====================================================

-- Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Tabel Kegiatan Rapor
-- =====================================================
-- Menyimpan data kegiatan untuk rapor per cabang/semester/kelas/asrama
CREATE TABLE IF NOT EXISTS rapor_kegiatan_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cabang TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    semester TEXT NOT NULL,
    kelas TEXT NOT NULL,
    asrama TEXT NOT NULL,
    nama_kegiatan TEXT NOT NULL,
    keterangan_kegiatan TEXT,
    foto_1 TEXT, -- URL/path foto pertama
    foto_2 TEXT, -- URL/path foto kedua
    urutan INTEGER NOT NULL CHECK (urutan >= 1 AND urutan <= 6), -- Urutan 1-6
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_rapor_kegiatan_filter 
ON rapor_kegiatan_keasramaan(cabang, tahun_ajaran, semester, kelas, asrama);

CREATE INDEX IF NOT EXISTS idx_rapor_kegiatan_urutan 
ON rapor_kegiatan_keasramaan(urutan);

-- Constraint: Kombinasi cabang+tahun_ajaran+semester+kelas+asrama+urutan harus unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_rapor_kegiatan_unique 
ON rapor_kegiatan_keasramaan(cabang, tahun_ajaran, semester, kelas, asrama, urutan);

-- =====================================================
-- 2. Tabel Dokumentasi Lainnya
-- =====================================================
-- Menyimpan foto-foto dokumentasi program lainnya
CREATE TABLE IF NOT EXISTS rapor_dokumentasi_lainnya_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cabang TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    semester TEXT NOT NULL,
    kelas TEXT NOT NULL,
    asrama TEXT NOT NULL,
    foto TEXT NOT NULL, -- URL/path foto
    keterangan TEXT, -- Keterangan opsional untuk foto
    urutan INTEGER, -- Urutan tampilan (opsional)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_rapor_dokumentasi_filter 
ON rapor_dokumentasi_lainnya_keasramaan(cabang, tahun_ajaran, semester, kelas, asrama);

CREATE INDEX IF NOT EXISTS idx_rapor_dokumentasi_urutan 
ON rapor_dokumentasi_lainnya_keasramaan(urutan);

-- =====================================================
-- 3. Tabel Rekap Habit Tracker (untuk cache)
-- =====================================================
-- Menyimpan hasil rekap habit tracker per santri per semester
-- Ini untuk mempercepat generate rapor tanpa harus hitung ulang
CREATE TABLE IF NOT EXISTS rapor_rekap_habit_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis TEXT NOT NULL,
    nama_siswa TEXT NOT NULL,
    cabang TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    semester TEXT NOT NULL,
    kelas TEXT NOT NULL,
    asrama TEXT NOT NULL,
    
    -- Ubudiyah
    shalat_fardhu_berjamaah_nilai NUMERIC(3,2), -- Rata-rata nilai
    shalat_fardhu_berjamaah_deskripsi TEXT, -- Deskripsi dari indikator
    tata_cara_shalat_nilai NUMERIC(3,2),
    tata_cara_shalat_deskripsi TEXT,
    qiyamul_lail_nilai NUMERIC(3,2),
    qiyamul_lail_deskripsi TEXT,
    shalat_sunnah_nilai NUMERIC(3,2),
    shalat_sunnah_deskripsi TEXT,
    puasa_sunnah_nilai NUMERIC(3,2),
    puasa_sunnah_deskripsi TEXT,
    tata_cara_wudhu_nilai NUMERIC(3,2),
    tata_cara_wudhu_deskripsi TEXT,
    sedekah_nilai NUMERIC(3,2),
    sedekah_deskripsi TEXT,
    dzikir_pagi_petang_nilai NUMERIC(3,2),
    dzikir_pagi_petang_deskripsi TEXT,
    
    -- Akhlaq
    etika_dalam_tutur_kata_nilai NUMERIC(3,2),
    etika_dalam_tutur_kata_deskripsi TEXT,
    etika_dalam_bergaul_nilai NUMERIC(3,2),
    etika_dalam_bergaul_deskripsi TEXT,
    etika_dalam_berpakaian_nilai NUMERIC(3,2),
    etika_dalam_berpakaian_deskripsi TEXT,
    adab_sehari_hari_nilai NUMERIC(3,2),
    adab_sehari_hari_deskripsi TEXT,
    
    -- Kedisiplinan
    waktu_tidur_nilai NUMERIC(3,2),
    waktu_tidur_deskripsi TEXT,
    pelaksanaan_piket_kamar_nilai NUMERIC(3,2),
    pelaksanaan_piket_kamar_deskripsi TEXT,
    disiplin_halaqah_tahfidz_nilai NUMERIC(3,2),
    disiplin_halaqah_tahfidz_deskripsi TEXT,
    perizinan_nilai NUMERIC(3,2),
    perizinan_deskripsi TEXT,
    belajar_malam_nilai NUMERIC(3,2),
    belajar_malam_deskripsi TEXT,
    disiplin_berangkat_ke_masjid_nilai NUMERIC(3,2),
    disiplin_berangkat_ke_masjid_deskripsi TEXT,
    
    -- Kebersihan & Kerapian
    kebersihan_tubuh_berpakaian_berpenampilan_nilai NUMERIC(3,2),
    kebersihan_tubuh_berpakaian_berpenampilan_deskripsi TEXT,
    kamar_nilai NUMERIC(3,2),
    kamar_deskripsi TEXT,
    ranjang_dan_almari_nilai NUMERIC(3,2),
    ranjang_dan_almari_deskripsi TEXT,
    
    -- Metadata
    total_entry INTEGER, -- Jumlah entry habit tracker yang direkap
    periode_mulai DATE, -- Tanggal mulai periode rekap
    periode_selesai DATE, -- Tanggal selesai periode rekap
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_rapor_rekap_nis 
ON rapor_rekap_habit_keasramaan(nis);

CREATE INDEX IF NOT EXISTS idx_rapor_rekap_filter 
ON rapor_rekap_habit_keasramaan(cabang, tahun_ajaran, semester, kelas, asrama);

-- Constraint: Kombinasi nis+tahun_ajaran+semester harus unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_rapor_rekap_unique 
ON rapor_rekap_habit_keasramaan(nis, tahun_ajaran, semester);

-- =====================================================
-- 4. Tabel Log Generate Rapor
-- =====================================================
-- Menyimpan history generate rapor
CREATE TABLE IF NOT EXISTS rapor_generate_log_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID, -- ID untuk batch generate (kelas/asrama)
    nis TEXT,
    nama_siswa TEXT,
    cabang TEXT,
    tahun_ajaran TEXT,
    semester TEXT,
    kelas TEXT,
    asrama TEXT,
    mode_generate TEXT, -- 'single', 'kelas', 'asrama'
    status TEXT, -- 'processing', 'success', 'failed'
    presentation_id TEXT, -- Google Slides ID
    pdf_url TEXT, -- URL PDF hasil generate
    error_message TEXT, -- Pesan error jika gagal
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_rapor_log_batch 
ON rapor_generate_log_keasramaan(batch_id);

CREATE INDEX IF NOT EXISTS idx_rapor_log_nis 
ON rapor_generate_log_keasramaan(nis);

CREATE INDEX IF NOT EXISTS idx_rapor_log_status 
ON rapor_generate_log_keasramaan(status);

CREATE INDEX IF NOT EXISTS idx_rapor_log_date 
ON rapor_generate_log_keasramaan(generated_at DESC);

-- =====================================================
-- 5. Tabel Catatan Rapor
-- =====================================================
-- Menyimpan catatan musyrif dan pengesahan untuk rapor
CREATE TABLE IF NOT EXISTS rapor_catatan_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    semester TEXT NOT NULL,
    catatan_musyrif TEXT, -- Catatan dari musyrif
    nama_ketua_asrama TEXT, -- Nama ketua asrama untuk pengesahan
    nama_musyrif TEXT, -- Nama musyrif untuk pengesahan
    tanggal_pengesahan DATE, -- Tanggal pengesahan rapor
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_rapor_catatan_nis 
ON rapor_catatan_keasramaan(nis);

-- Constraint: Kombinasi nis+tahun_ajaran+semester harus unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_rapor_catatan_unique 
ON rapor_catatan_keasramaan(nis, tahun_ajaran, semester);

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk membuat semua tabel yang diperlukan untuk sistem rapor

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Tabel rapor_kegiatan_keasramaan: Menyimpan 6 kegiatan utama per kelas/asrama
-- 2. Tabel rapor_dokumentasi_lainnya_keasramaan: Menyimpan foto dokumentasi tambahan
-- 3. Tabel rapor_rekap_habit_keasramaan: Cache hasil rekap untuk performa
-- 4. Tabel rapor_generate_log_keasramaan: History generate rapor
-- 5. Tabel rapor_catatan_keasramaan: Catatan dan pengesahan rapor
