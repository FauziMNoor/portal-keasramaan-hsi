-- =====================================================
-- FIX INFO SEKOLAH & CABANG MATCHING
-- Mengatasi error "Data info sekolah tidak ditemukan"
-- =====================================================

-- 1. CEK DATA YANG ADA
-- Jalankan query ini untuk melihat data cabang di perizinan
SELECT DISTINCT cabang FROM perizinan_kepulangan_keasramaan ORDER BY cabang;

-- Jalankan query ini untuk melihat data cabang di info sekolah
SELECT cabang, nama_sekolah, kop_mode, kop_template_url FROM info_sekolah_keasramaan ORDER BY cabang;

-- =====================================================
-- 2. PASTIKAN RLS POLICY SUDAH BENAR
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated insert info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated update info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated delete info_sekolah_keasramaan" ON info_sekolah_keasramaan;

-- Enable RLS
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

-- Create new policies (lebih permisif untuk testing)
CREATE POLICY "Allow all read info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 3. INSERT DATA DEFAULT JIKA BELUM ADA
-- =====================================================

-- Insert data untuk cabang Purworejo (sesuaikan dengan kebutuhan)
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    kode_pos,
    no_telepon,
    email,
    website,
    nama_kepala_sekolah,
    nip_kepala_sekolah,
    kop_mode,
    kop_content_margin_top,
    kop_content_margin_bottom,
    kop_content_margin_left,
    kop_content_margin_right
)
VALUES (
    'Purworejo',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Raya Purworejo No. 123, Purworejo',
    'Purworejo',
    '54111',
    '0275-123456',
    'info@smaithsi.sch.id',
    'https://smaithsi.sch.id',
    'Nama Kepala Sekolah',
    '123456789',
    'dynamic',
    40,
    30,
    20,
    20
)
ON CONFLICT (cabang) DO UPDATE SET
    updated_at = NOW();

-- Insert data untuk cabang Sukabumi (jika ada)
INSERT INTO info_sekolah_keasramaan (
    cabang,
    nama_sekolah,
    nama_singkat,
    alamat_lengkap,
    kota,
    kode_pos,
    no_telepon,
    email,
    website,
    nama_kepala_sekolah,
    nip_kepala_sekolah,
    kop_mode,
    kop_content_margin_top,
    kop_content_margin_bottom,
    kop_content_margin_left,
    kop_content_margin_right
)
VALUES (
    'Sukabumi',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Raya Sukabumi No. 456, Sukabumi',
    'Sukabumi',
    '43111',
    '0266-123456',
    'sukabumi@smaithsi.sch.id',
    'https://smaithsi.sch.id',
    'Nama Kepala Sekolah Sukabumi',
    '987654321',
    'dynamic',
    40,
    30,
    20,
    20
)
ON CONFLICT (cabang) DO NOTHING;

-- =====================================================
-- 4. UPDATE CABANG DI PERIZINAN (JIKA PERLU)
-- =====================================================

-- Jika cabang di perizinan formatnya "HSI Boarding School Purworejo"
-- Update menjadi "Purworejo" saja agar match dengan info_sekolah_keasramaan

-- HATI-HATI: Backup data dulu sebelum menjalankan UPDATE!
-- Uncomment baris di bawah jika ingin update:

-- UPDATE perizinan_kepulangan_keasramaan
-- SET cabang = TRIM(REPLACE(cabang, 'HSI Boarding School', ''))
-- WHERE cabang LIKE '%HSI Boarding School%';

-- =====================================================
-- 5. VERIFIKASI
-- =====================================================

-- Cek apakah data sudah match
SELECT 
    p.cabang as perizinan_cabang,
    i.cabang as info_cabang,
    i.nama_sekolah,
    i.kop_mode,
    CASE 
        WHEN i.cabang IS NULL THEN '❌ TIDAK MATCH'
        ELSE '✅ MATCH'
    END as status
FROM (SELECT DISTINCT cabang FROM perizinan_kepulangan_keasramaan) p
LEFT JOIN info_sekolah_keasramaan i ON p.cabang = i.cabang
ORDER BY p.cabang;

-- =====================================================
-- SELESAI
-- =====================================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan data sudah match sebelum test download surat
