-- =====================================================
-- MIGRATION: KPI System for Musyrif & Kepala Asrama
-- Date: 2024-12-10
-- Description: Setup tables for KPI calculation system
-- =====================================================

-- =====================================================
-- 1. Tabel Jadwal Libur Musyrif
-- =====================================================
CREATE TABLE IF NOT EXISTS jadwal_libur_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  
  -- Tanggal libur
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  
  -- Jenis libur
  jenis_libur VARCHAR(50) NOT NULL CHECK (jenis_libur IN ('rutin', 'cuti', 'sakit', 'izin')),
  keterangan TEXT,
  
  -- Musyrif pengganti (yang menitipkan asrama)
  musyrif_pengganti VARCHAR(255),
  asrama_pengganti VARCHAR(255),
  
  -- Jatah cuti (untuk tracking)
  sisa_cuti_tahunan INTEGER,
  
  -- Status approval (untuk cuti/izin, bukan rutin)
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved_kepala_asrama', 'approved_kepala_sekolah', 'rejected')),
  approved_by_kepala_asrama VARCHAR(255),
  approved_at_kepala_asrama TIMESTAMP,
  approved_by_kepala_sekolah VARCHAR(255),
  approved_at_kepala_sekolah TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_libur_musyrif ON jadwal_libur_musyrif_keasramaan(nama_musyrif);
CREATE INDEX IF NOT EXISTS idx_libur_tanggal ON jadwal_libur_musyrif_keasramaan(tanggal_mulai, tanggal_selesai);
CREATE INDEX IF NOT EXISTS idx_libur_status ON jadwal_libur_musyrif_keasramaan(status);
CREATE INDEX IF NOT EXISTS idx_libur_jenis ON jadwal_libur_musyrif_keasramaan(jenis_libur);

-- =====================================================
-- 2. Tabel Rapat Koordinasi
-- =====================================================
CREATE TABLE IF NOT EXISTS rapat_koordinasi_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  jenis_rapat VARCHAR(100) NOT NULL CHECK (jenis_rapat IN ('mingguan', 'bulanan', 'evaluasi', 'darurat')),
  cabang VARCHAR(255) NOT NULL,
  
  -- Peserta
  kepala_asrama VARCHAR(255),
  musyrif_list TEXT[], -- Array of musyrif names
  
  -- Agenda & Notulen
  agenda TEXT,
  notulen TEXT,
  
  -- Attachment (opsional)
  attachment_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapat_tanggal ON rapat_koordinasi_keasramaan(tanggal);
CREATE INDEX IF NOT EXISTS idx_rapat_cabang ON rapat_koordinasi_keasramaan(cabang);

-- =====================================================
-- 3. Tabel Kehadiran Rapat
-- =====================================================
CREATE TABLE IF NOT EXISTS kehadiran_rapat_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rapat_id UUID NOT NULL REFERENCES rapat_koordinasi_keasramaan(id) ON DELETE CASCADE,
  nama_musyrif VARCHAR(255) NOT NULL,
  status_kehadiran VARCHAR(20) NOT NULL CHECK (status_kehadiran IN ('hadir', 'izin', 'alpha')),
  keterangan TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(rapat_id, nama_musyrif)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kehadiran_musyrif ON kehadiran_rapat_keasramaan(nama_musyrif);
CREATE INDEX IF NOT EXISTS idx_kehadiran_rapat ON kehadiran_rapat_keasramaan(rapat_id);

-- =====================================================
-- 4. Tabel Log Kolaborasi
-- =====================================================
CREATE TABLE IF NOT EXISTS log_kolaborasi_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  
  -- Jenis Kolaborasi
  jenis VARCHAR(100) NOT NULL CHECK (jenis IN ('sharing_tips', 'bantuan_rekan', 'feedback', 'program_bersama', 'menitipkan_asrama')),
  deskripsi TEXT NOT NULL,
  
  -- Pihak yang terlibat
  kolaborator TEXT[], -- Array of names (musyrif lain yang terlibat)
  
  -- Penilaian (dari kepala asrama)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  catatan_penilaian TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kolaborasi_musyrif ON log_kolaborasi_keasramaan(nama_musyrif);
CREATE INDEX IF NOT EXISTS idx_kolaborasi_tanggal ON log_kolaborasi_keasramaan(tanggal);
CREATE INDEX IF NOT EXISTS idx_kolaborasi_jenis ON log_kolaborasi_keasramaan(jenis);

-- =====================================================
-- 5. Tabel KPI Summary
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_summary_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode DATE NOT NULL, -- Tanggal akhir bulan (2024-11-30)
  role VARCHAR(50) NOT NULL CHECK (role IN ('musyrif', 'kepala_asrama')),
  nama VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255), -- NULL untuk kepala asrama
  
  -- Hari kerja efektif (exclude libur)
  total_hari_bulan INTEGER NOT NULL,
  hari_libur INTEGER NOT NULL,
  hari_kerja_efektif INTEGER NOT NULL,
  
  -- Tier 1: Output (50%)
  score_ubudiyah DECIMAL(5,2),
  score_akhlaq DECIMAL(5,2),
  score_kedisiplinan DECIMAL(5,2),
  score_kebersihan DECIMAL(5,2),
  total_tier1 DECIMAL(5,2),
  
  -- Tier 2: Administrasi (30%)
  score_jurnal DECIMAL(5,2),
  hari_input_jurnal INTEGER, -- Actual days
  score_habit_tracker DECIMAL(5,2),
  score_koordinasi DECIMAL(5,2),
  score_catatan_perilaku DECIMAL(5,2),
  total_tier2 DECIMAL(5,2),
  
  -- Tier 3: Proses (20%)
  score_completion_rate DECIMAL(5,2),
  score_kehadiran DECIMAL(5,2),
  score_engagement DECIMAL(5,2),
  total_tier3 DECIMAL(5,2),
  
  -- Total & Ranking
  total_score DECIMAL(5,2),
  ranking INTEGER,
  total_musyrif INTEGER, -- Total musyrif di cabang (untuk context ranking)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint
  UNIQUE(periode, role, nama, cabang)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kpi_periode ON kpi_summary_keasramaan(periode);
CREATE INDEX IF NOT EXISTS idx_kpi_ranking ON kpi_summary_keasramaan(periode, role, ranking);
CREATE INDEX IF NOT EXISTS idx_kpi_nama ON kpi_summary_keasramaan(nama, periode);

-- =====================================================
-- 6. Tabel Cuti Tahunan Musyrif
-- =====================================================
CREATE TABLE IF NOT EXISTS cuti_tahunan_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  tahun INTEGER NOT NULL,
  
  -- Jatah cuti
  jatah_cuti INTEGER DEFAULT 12, -- 12 hari per tahun
  cuti_terpakai INTEGER DEFAULT 0,
  sisa_cuti INTEGER DEFAULT 12,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint
  UNIQUE(nama_musyrif, tahun)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cuti_musyrif ON cuti_tahunan_musyrif_keasramaan(nama_musyrif);
CREATE INDEX IF NOT EXISTS idx_cuti_tahun ON cuti_tahunan_musyrif_keasramaan(tahun);

-- =====================================================
-- Enable RLS (Row Level Security)
-- =====================================================
ALTER TABLE jadwal_libur_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapat_koordinasi_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran_rapat_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_kolaborasi_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_summary_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuti_tahunan_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies (Allow all for now - adjust based on auth)
-- =====================================================
CREATE POLICY "Allow all on jadwal_libur_musyrif_keasramaan" 
ON jadwal_libur_musyrif_keasramaan FOR ALL USING (true);

CREATE POLICY "Allow all on rapat_koordinasi_keasramaan" 
ON rapat_koordinasi_keasramaan FOR ALL USING (true);

CREATE POLICY "Allow all on kehadiran_rapat_keasramaan" 
ON kehadiran_rapat_keasramaan FOR ALL USING (true);

CREATE POLICY "Allow all on log_kolaborasi_keasramaan" 
ON log_kolaborasi_keasramaan FOR ALL USING (true);

CREATE POLICY "Allow all on kpi_summary_keasramaan" 
ON kpi_summary_keasramaan FOR ALL USING (true);

CREATE POLICY "Allow all on cuti_tahunan_musyrif_keasramaan" 
ON cuti_tahunan_musyrif_keasramaan FOR ALL USING (true);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Catatan:
-- 1. Semua tabel sudah dibuat dengan indexes
-- 2. RLS enabled dengan policy "Allow all" (adjust sesuai kebutuhan)
-- 3. Foreign key constraint sudah ditambahkan (CASCADE DELETE)
-- 4. Check constraints untuk validasi data
-- 5. Unique constraints untuk prevent duplicate

-- Next Steps:
-- 1. Run migration di Supabase SQL Editor
-- 2. Verify semua tabel & indexes created
-- 3. Test insert/update/delete operations
-- 4. Implement API endpoints
-- 5. Build dashboard UI

-- =====================================================
