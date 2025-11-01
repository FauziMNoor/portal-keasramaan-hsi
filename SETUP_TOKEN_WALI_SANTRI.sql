-- =====================================================
-- Tabel Token Wali Santri untuk Link Laporan
-- =====================================================

CREATE TABLE IF NOT EXISTS token_wali_santri_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_token TEXT NOT NULL,
    keterangan TEXT,
    token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_token_wali_santri_token ON token_wali_santri_keasramaan(token);
CREATE INDEX IF NOT EXISTS idx_token_wali_santri_active ON token_wali_santri_keasramaan(is_active);

-- =====================================================
-- Contoh Insert Data
-- =====================================================
-- Token Universal untuk Semua Wali Santri
INSERT INTO token_wali_santri_keasramaan (nama_token, keterangan, token)
VALUES 
('Link Wali Santri 2024/2025', 'Link universal untuk semua wali santri semester ganjil', encode(gen_random_bytes(16), 'hex'));

-- =====================================================
-- Keuntungan Token Universal:
-- =====================================================
-- 1. Satu link untuk semua wali santri
-- 2. Mudah disebarkan via broadcast WhatsApp
-- 3. Wali santri input NIS untuk akses anak masing-masing
-- 4. Bisa buat token baru per semester/tahun ajaran
-- 5. Nonaktifkan token lama jika sudah tidak digunakan
