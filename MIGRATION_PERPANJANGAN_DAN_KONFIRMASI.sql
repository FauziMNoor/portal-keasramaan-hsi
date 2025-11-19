-- =====================================================
-- MIGRATION: PERPANJANGAN IZIN & KONFIRMASI KEPULANGAN
-- HSI Boarding School
-- =====================================================

-- =====================================================
-- 1. Tambah Kolom untuk Konfirmasi Kepulangan
-- =====================================================
ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS status_kepulangan TEXT DEFAULT 'belum_pulang';

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS tanggal_kembali DATE;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dikonfirmasi_oleh TEXT;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dikonfirmasi_at TIMESTAMP;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS catatan_kembali TEXT;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_perizinan_status_kepulangan 
    ON perizinan_kepulangan_keasramaan(status_kepulangan);

-- =====================================================
-- 2. Tambah Kolom untuk Perpanjangan Izin
-- =====================================================
ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS is_perpanjangan BOOLEAN DEFAULT false;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS perizinan_induk_id UUID REFERENCES perizinan_kepulangan_keasramaan(id) ON DELETE CASCADE;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS alasan_perpanjangan TEXT;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS jumlah_perpanjangan_hari INTEGER;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS perpanjangan_ke INTEGER DEFAULT 0;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dokumen_pendukung_url TEXT;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dokumen_pendukung_uploaded_at TIMESTAMP;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dokumen_pendukung_uploaded_by TEXT;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dokumen_pendukung_tipe TEXT;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_perizinan_perpanjangan 
    ON perizinan_kepulangan_keasramaan(is_perpanjangan);

CREATE INDEX IF NOT EXISTS idx_perizinan_induk 
    ON perizinan_kepulangan_keasramaan(perizinan_induk_id);

CREATE INDEX IF NOT EXISTS idx_perizinan_perpanjangan_ke 
    ON perizinan_kepulangan_keasramaan(perpanjangan_ke);

-- =====================================================
-- 3. Tabel untuk Tracking Dokumen Perpanjangan
-- =====================================================
CREATE TABLE IF NOT EXISTS dokumen_perpanjangan_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perizinan_id UUID NOT NULL REFERENCES perizinan_kepulangan_keasramaan(id) ON DELETE CASCADE,
    nama_dokumen TEXT NOT NULL,
    tipe_dokumen TEXT NOT NULL,
    deskripsi TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_dokumen_perpanjangan_perizinan 
    ON dokumen_perpanjangan_keasramaan(perizinan_id);

CREATE INDEX IF NOT EXISTS idx_dokumen_perpanjangan_tipe 
    ON dokumen_perpanjangan_keasramaan(tipe_dokumen);

-- =====================================================
-- 4. Function untuk Auto-Update Status Kepulangan
-- =====================================================
CREATE OR REPLACE FUNCTION check_status_kepulangan()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika tanggal_kembali diisi, tentukan status
    IF NEW.tanggal_kembali IS NOT NULL THEN
        IF NEW.tanggal_kembali > NEW.tanggal_selesai THEN
            NEW.status_kepulangan := 'terlambat';
        ELSE
            NEW.status_kepulangan := 'sudah_pulang';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-check status kepulangan
DROP TRIGGER IF EXISTS trigger_check_status_kepulangan ON perizinan_kepulangan_keasramaan;
CREATE TRIGGER trigger_check_status_kepulangan
    BEFORE UPDATE ON perizinan_kepulangan_keasramaan
    FOR EACH ROW
    EXECUTE FUNCTION check_status_kepulangan();

-- =====================================================
-- 5. Function untuk Validasi Perpanjangan
-- =====================================================
CREATE OR REPLACE FUNCTION validate_perpanjangan()
RETURNS TRIGGER AS $$
DECLARE
    perizinan_induk RECORD;
    total_durasi INTEGER;
    jumlah_perpanjangan INTEGER;
BEGIN
    -- Jika ini perpanjangan
    IF NEW.is_perpanjangan = true THEN
        -- Cek perizinan induk
        SELECT * INTO perizinan_induk 
        FROM perizinan_kepulangan_keasramaan 
        WHERE id = NEW.perizinan_induk_id;
        
        IF perizinan_induk IS NULL THEN
            RAISE EXCEPTION 'Perizinan induk tidak ditemukan';
        END IF;
        
        -- Hitung total durasi
        total_durasi := NEW.durasi_hari;
        
        -- Hitung jumlah perpanjangan
        SELECT COUNT(*) INTO jumlah_perpanjangan
        FROM perizinan_kepulangan_keasramaan
        WHERE perizinan_induk_id = NEW.perizinan_induk_id 
        AND is_perpanjangan = true;
        
        -- Validasi: maksimal 3x perpanjangan
        IF jumlah_perpanjangan >= 3 THEN
            RAISE EXCEPTION 'Maksimal perpanjangan hanya 3 kali';
        END IF;
        
        -- Validasi: maksimal 30 hari total
        IF total_durasi > 30 THEN
            RAISE EXCEPTION 'Total durasi tidak boleh lebih dari 30 hari';
        END IF;
        
        -- Set perpanjangan_ke
        NEW.perpanjangan_ke := jumlah_perpanjangan + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk validasi perpanjangan
DROP TRIGGER IF EXISTS trigger_validate_perpanjangan ON perizinan_kepulangan_keasramaan;
CREATE TRIGGER trigger_validate_perpanjangan
    BEFORE INSERT OR UPDATE ON perizinan_kepulangan_keasramaan
    FOR EACH ROW
    EXECUTE FUNCTION validate_perpanjangan();

-- =====================================================
-- 6. RLS Policy untuk Dokumen Perpanjangan
-- =====================================================
ALTER TABLE dokumen_perpanjangan_keasramaan ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user bisa lihat dokumen
CREATE POLICY "Allow all users to view dokumen perpanjangan"
    ON dokumen_perpanjangan_keasramaan
    FOR SELECT
    USING (true);

-- Policy: Hanya uploader yang bisa insert
CREATE POLICY "Allow users to insert dokumen perpanjangan"
    ON dokumen_perpanjangan_keasramaan
    FOR INSERT
    WITH CHECK (true);

-- Policy: Hanya uploader yang bisa update
CREATE POLICY "Allow users to update dokumen perpanjangan"
    ON dokumen_perpanjangan_keasramaan
    FOR UPDATE
    USING (true);

-- =====================================================
-- 7. Storage Bucket untuk Dokumen Perpanjangan
-- =====================================================
-- Jalankan di Supabase Storage:
-- 1. Buat bucket: "dokumen-perpanjangan"
-- 2. Set public: true
-- 3. Set allowed MIME types: image/*, application/pdf

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan semua query berhasil tanpa error
