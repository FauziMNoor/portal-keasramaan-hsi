-- =====================================================
-- MIGRATION STEP BY STEP: Upload Bukti & Cetak Surat
-- HSI Boarding School - Perizinan Kepulangan
-- =====================================================
-- Jalankan step by step untuk menghindari error

-- =====================================================
-- STEP 1: Tambah Kolom Bukti Formulir
-- =====================================================
-- Jalankan ini terlebih dahulu
ALTER TABLE perizinan_kepulangan_keasramaan
ADD COLUMN IF NOT EXISTS bukti_formulir_url TEXT,
ADD COLUMN IF NOT EXISTS bukti_formulir_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS bukti_formulir_uploaded_by TEXT;

-- Cek apakah kolom sudah ditambahkan
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'perizinan_kepulangan_keasramaan' 
-- AND column_name LIKE 'bukti%';

-- =====================================================
-- CATATAN PENTING: NAMA BUCKET STORAGE
-- =====================================================
-- Nama bucket di Supabase Storage: bukti-formulir-keasramaan
-- (Menggunakan tanda hubung "-" bukan underscore "_")

-- =====================================================
-- STEP 2: Buat Tabel Info Sekolah
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

-- Cek apakah tabel sudah dibuat
-- SELECT * FROM info_sekolah_keasramaan;

-- =====================================================
-- STEP 3: Buat Index
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_info_sekolah_cabang 
ON info_sekolah_keasramaan(cabang);

-- =====================================================
-- STEP 4: Insert Data Default
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
    'PONDOK PESANTREN SMAIT',
    'HSI BOARDING SCHOOL',
    'Jl. Contoh Alamat No. 123, Sukabumi',
    'Sukabumi',
    '(0275) 123456',
    'info@hsiboardingschool.sch.id',
    'Dr. H. Ahmad Fauzi, M.Pd.',
    'Ustadz Muhammad Alan, S.Pd.I.'
)
ON CONFLICT (cabang) DO NOTHING;

-- Cek data yang diinsert
-- SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'Purworejo';

-- =====================================================
-- STEP 5: Buat Function Update Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_info_sekolah_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Buat Trigger
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_info_sekolah_timestamp 
ON info_sekolah_keasramaan;

CREATE TRIGGER trigger_update_info_sekolah_timestamp
    BEFORE UPDATE ON info_sekolah_keasramaan
    FOR EACH ROW
    EXECUTE FUNCTION update_info_sekolah_timestamp();

-- =====================================================
-- STEP 7: Enable RLS
-- =====================================================
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: Buat RLS Policies
-- =====================================================

-- Policy untuk SELECT (semua authenticated user bisa read)
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

CREATE POLICY "Allow authenticated users to read info sekolah"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk INSERT (semua authenticated user bisa insert)
DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" 
ON info_sekolah_keasramaan;

CREATE POLICY "Allow authenticated users to insert info sekolah"
ON info_sekolah_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy untuk UPDATE (semua authenticated user bisa update)
DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" 
ON info_sekolah_keasramaan;

CREATE POLICY "Allow authenticated users to update info sekolah"
ON info_sekolah_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy untuk DELETE (semua authenticated user bisa delete)
DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" 
ON info_sekolah_keasramaan;

CREATE POLICY "Allow authenticated users to delete info sekolah"
ON info_sekolah_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- STEP 9: Verifikasi
-- =====================================================
-- Jalankan query ini untuk memastikan semuanya berhasil:

-- 1. Cek kolom baru di perizinan_kepulangan_keasramaan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan' 
AND column_name LIKE 'bukti%';

-- 2. Cek tabel info_sekolah_keasramaan
SELECT * FROM info_sekolah_keasramaan;

-- 3. Cek RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan';

-- =====================================================
-- SELESAI
-- =====================================================
-- Jika semua step berhasil, lanjut ke:
-- 1. Buat Storage Bucket: bukti_formulir_keasramaan
-- 2. Setup Storage Policies (lihat STEP 10 di bawah)
-- 3. Deploy aplikasi

-- =====================================================
-- STEP 10: Storage Bucket Policies (Manual di Dashboard)
-- =====================================================
-- Buka Supabase Dashboard → Storage → bukti_formulir_keasramaan → Policies

-- Policy 1: Allow authenticated upload
-- CREATE POLICY "Allow authenticated upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

-- Policy 2: Allow authenticated read
-- CREATE POLICY "Allow authenticated read"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'bukti_formulir_keasramaan');

-- Policy 3: Allow authenticated delete (optional)
-- CREATE POLICY "Allow authenticated delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'bukti_formulir_keasramaan');

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- Jika ada error "relation already exists":
-- DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;
-- Lalu jalankan ulang dari STEP 2

-- Jika ada error "policy already exists":
-- DROP POLICY IF EXISTS "nama_policy" ON info_sekolah_keasramaan;
-- Lalu jalankan ulang policy tersebut

-- Jika ada error "column already exists":
-- Abaikan error, kolom sudah ada

-- =====================================================
-- ROLLBACK (Jika perlu)
-- =====================================================

-- Hapus kolom bukti formulir
-- ALTER TABLE perizinan_kepulangan_keasramaan
-- DROP COLUMN IF EXISTS bukti_formulir_url,
-- DROP COLUMN IF EXISTS bukti_formulir_uploaded_at,
-- DROP COLUMN IF EXISTS bukti_formulir_uploaded_by;

-- Hapus tabel info sekolah
-- DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;

-- Hapus function
-- DROP FUNCTION IF EXISTS update_info_sekolah_timestamp() CASCADE;
