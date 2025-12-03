-- =====================================================
-- ⭐ QUICK FIX DOWNLOAD SURAT IZIN
-- Copy paste dan jalankan di Supabase SQL Editor
-- =====================================================

-- 1. FIX RLS POLICIES
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated insert info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated update info_sekolah_keasramaan" ON info_sekolah_keasramaan;
DROP POLICY IF EXISTS "Allow authenticated delete info_sekolah_keasramaan" ON info_sekolah_keasramaan;

CREATE POLICY "Allow all read info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete info_sekolah_keasramaan"
ON info_sekolah_keasramaan FOR DELETE TO authenticated USING (true);

-- 2. INSERT DATA DEFAULT UNTUK SEMUA CABANG
-- Sesuaikan data di bawah dengan cabang yang ada di sistem Anda

-- Cabang Purworejo
INSERT INTO info_sekolah_keasramaan (
    cabang, nama_sekolah, nama_singkat, alamat_lengkap, kota, kode_pos,
    no_telepon, email, website, nama_kepala_sekolah, nip_kepala_sekolah,
    kop_mode, kop_content_margin_top, kop_content_margin_bottom,
    kop_content_margin_left, kop_content_margin_right
) VALUES (
    'Purworejo',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Raya Purworejo No. 123, Purworejo, Jawa Tengah',
    'Purworejo',
    '54111',
    '0275-123456',
    'purworejo@smaithsi.sch.id',
    'https://smaithsi.sch.id',
    'Nama Kepala Sekolah Purworejo',
    '123456789',
    'dynamic',
    40, 30, 20, 20
) ON CONFLICT (cabang) DO UPDATE SET updated_at = NOW();

-- Cabang Sukabumi
INSERT INTO info_sekolah_keasramaan (
    cabang, nama_sekolah, nama_singkat, alamat_lengkap, kota, kode_pos,
    no_telepon, email, website, nama_kepala_sekolah, nip_kepala_sekolah,
    kop_mode, kop_content_margin_top, kop_content_margin_bottom,
    kop_content_margin_left, kop_content_margin_right
) VALUES (
    'Sukabumi',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Raya Sukabumi No. 456, Sukabumi, Jawa Barat',
    'Sukabumi',
    '43111',
    '0266-123456',
    'sukabumi@smaithsi.sch.id',
    'https://smaithsi.sch.id',
    'Nama Kepala Sekolah Sukabumi',
    '987654321',
    'dynamic',
    40, 30, 20, 20
) ON CONFLICT (cabang) DO NOTHING;

-- Tambahkan cabang lain jika ada
-- Copy paste block INSERT di atas dan sesuaikan datanya

-- 3. VERIFIKASI DATA
SELECT 
    cabang,
    nama_sekolah,
    kota,
    kop_mode,
    CASE 
        WHEN kop_template_url IS NOT NULL THEN '✅ Ada Template'
        ELSE '📝 Mode Dinamis'
    END as kop_status,
    created_at
FROM info_sekolah_keasramaan
ORDER BY cabang;

-- 4. CEK MATCHING DENGAN PERIZINAN
SELECT 
    p.cabang as perizinan_cabang,
    COUNT(*) as jumlah_perizinan,
    CASE 
        WHEN i.cabang IS NOT NULL THEN '✅ MATCH - Bisa Download'
        ELSE '❌ TIDAK MATCH - Perlu Fix'
    END as status,
    i.nama_sekolah
FROM perizinan_kepulangan_keasramaan p
LEFT JOIN info_sekolah_keasramaan i ON (
    p.cabang = i.cabang OR 
    TRIM(REPLACE(p.cabang, 'HSI Boarding School', '')) = i.cabang
)
GROUP BY p.cabang, i.cabang, i.nama_sekolah
ORDER BY p.cabang;

-- =====================================================
-- SELESAI! 
-- Sekarang coba download surat lagi
-- =====================================================
