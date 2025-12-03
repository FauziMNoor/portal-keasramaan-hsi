-- =====================================================
-- MIGRATION: UPLOAD BUKTI FORMULIR & CETAK SURAT IZIN
-- HSI Boarding School - Perizinan Kepulangan
-- =====================================================

-- =====================================================
-- 1. Tambah Kolom Upload Bukti Formulir di Tabel Perizinan
-- =====================================================
ALTER TABLE perizinan_kepulangan_keasramaan
ADD COLUMN IF NOT EXISTS bukti_formulir_url TEXT,
ADD COLUMN IF NOT EXISTS bukti_formulir_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS bukti_formulir_uploaded_by TEXT;

-- =====================================================
-- 2. Tabel Info Sekolah (untuk Kop Surat)
-- =====================================================
CREATE TABLE IF NOT EXISTS info_sekolah_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cabang TEXT NOT NULL UNIQUE,
    
    -- Identitas Sekolah
    nama_sekolah TEXT NOT NULL DEFAULT 'PONDOK PESANTREN SMA IT HSI IDN',
    nama_singkat TEXT NOT NULL DEFAULT 'HSI BOARDING SCHOOL',
    
    -- Alamat & Kontak
    alamat_lengkap TEXT NOT NULL,
    kota TEXT NOT NULL DEFAULT 'Purworejo',
    kode_pos TEXT,
    no_telepon TEXT,
    email TEXT,
    website TEXT,
    
    -- Pejabat
    nama_kepala_sekolah TEXT NOT NULL,
    nip_kepala_sekolah TEXT,
    nama_kepala_asrama TEXT,
    nip_kepala_asrama TEXT,
    
    -- Logo & Stempel (URL dari Supabase Storage)
    logo_url TEXT,
    stempel_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_info_sekolah_cabang ON info_sekolah_keasramaan(cabang);

-- =====================================================
-- 3. Insert Data Default Info Sekolah
-- =====================================================
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    no_telepon,
    email,
    nama_kepala_sekolah,
    nama_kepala_asrama
) VALUES 
(
    'Sukabumi',
    'PONDOK PESANTREN SMAIT HSI ',
    'HSI BOARDING SCHOOL',
    'Jl. Contoh Alamat No. 123, Sukabumi',
    'Sukabumi',
    '(0275) 123456',
    'info@smaboardingschool.sch.id',
    'Dr. H. Ahmad Fauzi, M.Pd.',
    'Kiai Haji Alan Nuari, S.Pd.I.'
)
ON CONFLICT (cabang) DO NOTHING;

-- =====================================================
-- 4. Storage Bucket untuk Bukti Formulir
-- =====================================================
-- Jalankan di Supabase Storage UI atau via SQL:
-- Buat bucket: bukti_formulir_keasramaan
-- Set sebagai public atau private sesuai kebutuhan

-- =====================================================
-- 5. RLS Policy untuk Tabel Info Sekolah
-- =====================================================
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user authenticated bisa read
CREATE POLICY "Allow authenticated users to read info sekolah"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Policy: Semua user authenticated bisa insert
CREATE POLICY "Allow authenticated users to insert info sekolah"
ON info_sekolah_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Semua user authenticated bisa update
-- (Nanti bisa dibatasi sesuai role jika sudah ada tabel user/guru)
CREATE POLICY "Allow authenticated users to update info sekolah"
ON info_sekolah_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 6. Function untuk Update Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_info_sekolah_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_info_sekolah_timestamp ON info_sekolah_keasramaan;
CREATE TRIGGER trigger_update_info_sekolah_timestamp
    BEFORE UPDATE ON info_sekolah_keasramaan
    FOR EACH ROW
    EXECUTE FUNCTION update_info_sekolah_timestamp();

-- =====================================================
-- SELESAI
-- =====================================================
-- Catatan:
-- 1. Jalankan script ini di Supabase SQL Editor
-- 2. Buat bucket 'bukti_formulir_keasramaan' di Supabase Storage
-- 3. Update data info_sekolah sesuai dengan data sekolah Anda
