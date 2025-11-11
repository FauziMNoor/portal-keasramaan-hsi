-- =====================================================
-- SETUP DATABASE PERIZINAN KEPULANGAN
-- HSI Boarding School
-- =====================================================

-- =====================================================
-- 1. Tabel Token Perizinan (untuk wali santri)
-- =====================================================
CREATE TABLE IF NOT EXISTS token_perizinan_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_token TEXT NOT NULL,
    deskripsi TEXT,
    token TEXT NOT NULL UNIQUE,
    cabang TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_token_perizinan_token ON token_perizinan_keasramaan(token);
CREATE INDEX IF NOT EXISTS idx_token_perizinan_active ON token_perizinan_keasramaan(is_active);

-- =====================================================
-- 2. Tabel Perizinan Kepulangan
-- =====================================================
CREATE TABLE IF NOT EXISTS perizinan_kepulangan_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Data Santri
    nis TEXT NOT NULL,
    nama_siswa TEXT NOT NULL,
    kelas TEXT,
    asrama TEXT,
    cabang TEXT,
    
    -- Data Perizinan
    tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    durasi_hari INTEGER,
    alasan TEXT NOT NULL,
    keperluan TEXT NOT NULL,
    alamat_tujuan TEXT NOT NULL,
    no_hp_wali TEXT NOT NULL,
    
    -- Status Approval
    status TEXT DEFAULT 'pending', -- pending, approved_kepas, approved_kepsek, rejected
    
    -- Approval Kepala Asrama
    approved_by_kepas TEXT,
    approved_at_kepas TIMESTAMP,
    catatan_kepas TEXT,
    
    -- Approval Kepala Sekolah
    approved_by_kepsek TEXT,
    approved_at_kepsek TIMESTAMP,
    catatan_kepsek TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_perizinan_nis ON perizinan_kepulangan_keasramaan(nis);
CREATE INDEX IF NOT EXISTS idx_perizinan_status ON perizinan_kepulangan_keasramaan(status);
CREATE INDEX IF NOT EXISTS idx_perizinan_tanggal ON perizinan_kepulangan_keasramaan(tanggal_mulai, tanggal_selesai);
CREATE INDEX IF NOT EXISTS idx_perizinan_cabang ON perizinan_kepulangan_keasramaan(cabang);

-- =====================================================
-- 3. Insert Token Default
-- =====================================================
INSERT INTO token_perizinan_keasramaan (nama_token, deskripsi, token, cabang)
VALUES 
('Link Perizinan 2024/2025', 'Link universal untuk semua wali santri mengajukan izin kepulangan', encode(gen_random_bytes(16), 'hex'), NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Function untuk menghitung durasi hari
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_durasi_hari()
RETURNS TRIGGER AS $$
BEGIN
    NEW.durasi_hari := (NEW.tanggal_selesai - NEW.tanggal_mulai) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-calculate durasi
DROP TRIGGER IF EXISTS trigger_calculate_durasi ON perizinan_kepulangan_keasramaan;
CREATE TRIGGER trigger_calculate_durasi
    BEFORE INSERT OR UPDATE ON perizinan_kepulangan_keasramaan
    FOR EACH ROW
    EXECUTE FUNCTION calculate_durasi_hari();

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
