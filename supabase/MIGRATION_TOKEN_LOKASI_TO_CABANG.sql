-- =====================================================
-- MIGRATION: Ubah kolom 'lokasi' menjadi 'cabang' 
-- di tabel token_musyrif_keasramaan
-- =====================================================

-- Step 1: Tambah kolom cabang baru
ALTER TABLE token_musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS cabang TEXT;

-- Step 2: Copy data dari lokasi ke cabang
UPDATE token_musyrif_keasramaan 
SET cabang = lokasi 
WHERE cabang IS NULL;

-- Step 3: Set cabang sebagai NOT NULL
ALTER TABLE token_musyrif_keasramaan 
ALTER COLUMN cabang SET NOT NULL;

-- Step 4: Hapus kolom lokasi lama (OPTIONAL - bisa skip jika ingin keep backward compatibility)
-- ALTER TABLE token_musyrif_keasramaan DROP COLUMN lokasi;

-- =====================================================
-- VERIFIKASI
-- =====================================================
-- SELECT id, nama_musyrif, cabang, lokasi, kelas, asrama FROM token_musyrif_keasramaan LIMIT 10;
