-- =====================================================
-- Tabel Token Musyrif untuk Link Formulir
-- =====================================================

CREATE TABLE token_musyrif_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    musyrif_id UUID NOT NULL,
    nama_musyrif TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    kelas TEXT NOT NULL,
    asrama TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_token_musyrif_token ON token_musyrif_keasramaan(token);
CREATE INDEX idx_token_musyrif_active ON token_musyrif_keasramaan(is_active);

-- =====================================================
-- Cara Generate Token untuk Musyrif
-- =====================================================
-- Jalankan query ini untuk setiap musyrif:
-- 
-- INSERT INTO token_musyrif_keasramaan (musyrif_id, nama_musyrif, lokasi, kelas, asrama, token)
-- SELECT 
--     id,
--     nama_musyrif,
--     lokasi,
--     kelas,
--     asrama,
--     encode(gen_random_bytes(16), 'hex') as token
-- FROM musyrif_keasramaan
-- WHERE status = 'aktif';
