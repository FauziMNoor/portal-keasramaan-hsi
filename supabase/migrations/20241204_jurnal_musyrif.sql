-- =====================================================
-- MIGRATION: Jurnal Musyrif System
-- Date: 2024-12-04
-- Description: Setup tables for Jurnal Musyrif feature
-- =====================================================

-- 1. Tabel Sesi Jurnal Musyrif
CREATE TABLE IF NOT EXISTS sesi_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sesi VARCHAR(100) NOT NULL,
  urutan INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Jadwal Jurnal Musyrif
CREATE TABLE IF NOT EXISTS jadwal_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi_id UUID NOT NULL REFERENCES sesi_jurnal_musyrif_keasramaan(id) ON DELETE CASCADE,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  urutan INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Kegiatan Jurnal Musyrif
CREATE TABLE IF NOT EXISTS kegiatan_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_id UUID NOT NULL REFERENCES jadwal_jurnal_musyrif_keasramaan(id) ON DELETE CASCADE,
  deskripsi_kegiatan TEXT NOT NULL,
  urutan INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Token/Link Jurnal Musyrif
CREATE TABLE IF NOT EXISTS token_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  kelas VARCHAR(100) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Formulir Jurnal Musyrif (Data Input Harian)
CREATE TABLE IF NOT EXISTS formulir_jurnal_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  kelas VARCHAR(100) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  tahun_ajaran VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  sesi_id UUID NOT NULL REFERENCES sesi_jurnal_musyrif_keasramaan(id),
  jadwal_id UUID NOT NULL REFERENCES jadwal_jurnal_musyrif_keasramaan(id),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan_jurnal_musyrif_keasramaan(id),
  status_terlaksana BOOLEAN DEFAULT false,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_jadwal_sesi_keasramaan ON jadwal_jurnal_musyrif_keasramaan(sesi_id);
CREATE INDEX IF NOT EXISTS idx_kegiatan_jadwal_keasramaan ON kegiatan_jurnal_musyrif_keasramaan(jadwal_id);
CREATE INDEX IF NOT EXISTS idx_token_active_keasramaan ON token_jurnal_musyrif_keasramaan(is_active);
CREATE INDEX IF NOT EXISTS idx_formulir_tanggal_keasramaan ON formulir_jurnal_musyrif_keasramaan(tanggal);
CREATE INDEX IF NOT EXISTS idx_formulir_musyrif_keasramaan ON formulir_jurnal_musyrif_keasramaan(nama_musyrif);
CREATE INDEX IF NOT EXISTS idx_formulir_lookup_keasramaan ON formulir_jurnal_musyrif_keasramaan(tanggal, nama_musyrif, cabang);

-- Enable RLS (Row Level Security)
ALTER TABLE sesi_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulir_jurnal_musyrif_keasramaan ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - adjust based on your auth setup)
CREATE POLICY "Allow all on sesi_jurnal_musyrif_keasramaan" ON sesi_jurnal_musyrif_keasramaan FOR ALL USING (true);
CREATE POLICY "Allow all on jadwal_jurnal_musyrif_keasramaan" ON jadwal_jurnal_musyrif_keasramaan FOR ALL USING (true);
CREATE POLICY "Allow all on kegiatan_jurnal_musyrif_keasramaan" ON kegiatan_jurnal_musyrif_keasramaan FOR ALL USING (true);
CREATE POLICY "Allow all on token_jurnal_musyrif_keasramaan" ON token_jurnal_musyrif_keasramaan FOR ALL USING (true);
CREATE POLICY "Allow all on formulir_jurnal_musyrif_keasramaan" ON formulir_jurnal_musyrif_keasramaan FOR ALL USING (true);

-- =====================================================
-- SEED DATA: Default Sesi, Jadwal, dan Kegiatan
-- =====================================================

-- Insert Sesi 1
INSERT INTO sesi_jurnal_musyrif_keasramaan (id, nama_sesi, urutan) VALUES 
('11111111-1111-1111-1111-111111111111', 'SESI 1', 1);

-- Insert Jadwal untuk Sesi 1
INSERT INTO jadwal_jurnal_musyrif_keasramaan (id, sesi_id, jam_mulai, jam_selesai, urutan) VALUES
('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '03:30', '03:45', 1),
('21111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '03:45', '04:00', 2),
('21111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', '04:00', '04:15', 3),
('21111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', '04:15', '04:30', 4),
('21111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', '04:30', '04:45', 5),
('21111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', '04:45', '05:15', 6),
('21111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', '05:15', '06:30', 7);

-- Insert Kegiatan untuk Sesi 1
INSERT INTO kegiatan_jurnal_musyrif_keasramaan (jadwal_id, deskripsi_kegiatan, urutan) VALUES
-- 03:30-03:45
('21111111-1111-1111-1111-111111111111', 'Sebelum membangunkan santri, Ustadz terlebih dahulu merapikan tempat tidurnya.', 1),
('21111111-1111-1111-1111-111111111111', 'Memastikan santri menjalankan adab bangun tidur seperti berdoa.', 2),
('21111111-1111-1111-1111-111111111111', 'Memastikan santri sudah merapikan tempat tidurnya sebelum berangkat ke masjid.', 3),
-- 03:45-04:00
('21111111-1111-1111-1111-111111111112', 'Memastikan santri telah siap untuk ke masjid dalam keadaan suci, baik badan maupun pakaian.', 1),
('21111111-1111-1111-1111-111111111112', 'Mengunci kamar, Ustadz menuju ke masjid, membimbing santri untuk melakukan ibadah.', 2),
('21111111-1111-1111-1111-111111111112', 'Ustadz dan seluruh santri sudah berada di masjid.', 3),
-- 04:00-04:15
('21111111-1111-1111-1111-111111111113', 'Memastikan santri mengerjakan shalat tahajud di masjid.', 1),
('21111111-1111-1111-1111-111111111113', 'Memastikan santri mengerjakan shalat witir.', 2),
-- 04:15-04:30
('21111111-1111-1111-1111-111111111114', 'Memastikan santri berdoa, beristighfar, dan membaca Al-Qur''an sambil menunggu adzan Subuh', 1),
-- 04:30-04:45
('21111111-1111-1111-1111-111111111115', 'Membangunkan santri yang masih mengantuk.', 1),
-- 04:45-05:15
('21111111-1111-1111-1111-111111111116', 'Adzan Subuh (santri diharapkan menjawab panggilan adzan dan berdoa).', 1),
('21111111-1111-1111-1111-111111111116', 'Memastikan santri shalat sunnah qabliyah Subuh.', 2),
('21111111-1111-1111-1111-111111111116', 'Memastikan seluruh santri ikut melaksanakan shalat Subuh berjamaah di masjid.', 3),
('21111111-1111-1111-1111-111111111116', 'Memastikan santri melakukan dzikir setelah shalat dan dzikir pagi. (Koordinator/Piket)', 4),
-- 05:15-06:30
('21111111-1111-1111-1111-111111111117', 'Ustadz mengampu tahfidz sesuai dengan kelompok masing-masing.', 1),
('21111111-1111-1111-1111-111111111117', 'Memastikan santri menyetorkan dan muroja''ah hafalan Al-Qur''an.', 2);

-- Insert Sesi 2
INSERT INTO sesi_jurnal_musyrif_keasramaan (id, nama_sesi, urutan) VALUES 
('22222222-2222-2222-2222-222222222222', 'SESI 2', 2);

-- Insert Jadwal untuk Sesi 2
INSERT INTO jadwal_jurnal_musyrif_keasramaan (id, sesi_id, jam_mulai, jam_selesai, urutan) VALUES
('22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', '05:30', '07:00', 1),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '07:00', '07:30', 2),
('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', '07:30', '07:45', 3);

-- Insert Kegiatan untuk Sesi 2
INSERT INTO kegiatan_jurnal_musyrif_keasramaan (jadwal_id, deskripsi_kegiatan, urutan) VALUES
-- 05:30-07:00
('22222222-2222-2222-2222-222222222221', 'Memastikan seluruh santri masuk kelas untuk mengikuti KBM pertama.', 1),
-- 07:00-07:30
('22222222-2222-2222-2222-222222222222', 'Setelah KBM pertama, santri diingatkan untuk mempersiapkan diri dengan mandi dan sarapan, serta mempersiapkan pelajaran (santri tidak boleh tidur pada waktu ini).', 1),
('22222222-2222-2222-2222-222222222222', 'Memastikan peralatan mandi tidak ditinggal di area kamar mandi.', 2),
('22222222-2222-2222-2222-222222222222', 'Memastikan semua santri makan di ruang makan.', 3),
('22222222-2222-2222-2222-222222222222', 'Memastikan tidak ada santri yang makan di kamar, kelas, dan ruangan lainnya.', 4),
('22222222-2222-2222-2222-222222222222', 'Memastikan peralatan makan tidak ditinggal.', 5),
('22222222-2222-2222-2222-222222222222', 'Mengajarkan, mengingatkan, membiasakan, dan mengontrol adab-adab makan', 6),
-- 07:30-07:45
('22222222-2222-2222-2222-222222222223', 'Memastikan santri sudah siap untuk mengikuti KBM di kelas (memakai seragam, sepatu, dan perlengkapan sekolah yang dipakai hari itu).', 1),
('22222222-2222-2222-2222-222222222223', 'Menggiring santri ke lapangan untuk melaksanakan morning spirit.', 2),
('22222222-2222-2222-2222-222222222223', 'Mengatur santri dalam baris-berbaris.', 3),
('22222222-2222-2222-2222-222222222223', 'Memulai kegiatan morning spirit.', 4),
('22222222-2222-2222-2222-222222222223', 'Dokumentasi setelah morning spirit.', 5),
('22222222-2222-2222-2222-222222222223', 'Memastikan santri sudah berangkat ke kelas.', 6);

-- Insert Sesi 3
INSERT INTO sesi_jurnal_musyrif_keasramaan (id, nama_sesi, urutan) VALUES 
('33333333-3333-3333-3333-333333333333', 'SESI 3', 3);

-- Insert Jadwal untuk Sesi 3
INSERT INTO jadwal_jurnal_musyrif_keasramaan (id, sesi_id, jam_mulai, jam_selesai, urutan) VALUES
('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', '10:00', '11:45', 1),
('33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', '11:45', '12:30', 2);

-- Insert Kegiatan untuk Sesi 3
INSERT INTO kegiatan_jurnal_musyrif_keasramaan (jadwal_id, deskripsi_kegiatan, urutan) VALUES
-- 10:00-11:45
('33333333-3333-3333-3333-333333333331', 'Memastikan tidak ada santri yang kembali ke asrama setelah KBM.', 1),
('33333333-3333-3333-3333-333333333331', 'Mengarahkan santri pergi ke masjid untuk shalat dhuha dan beristirahat.', 2),
('33333333-3333-3333-3333-333333333331', 'Belajar bahasa Arab.', 3),
-- 11:45-12:30
('33333333-3333-3333-3333-333333333332', 'Adzan Dzuhur: Memastikan santri menjawab panggilan adzan dan berdoa setelah adzan.', 1),
('33333333-3333-3333-3333-333333333332', 'Memastikan santri melaksanakan shalat 2 rakaat sebelum Dzuhur.', 2),
('33333333-3333-3333-3333-333333333332', 'Mengarahkan santri untuk berdoa atau membaca Al-Qur''an sambil menunggu iqamah.', 3),
('33333333-3333-3333-3333-333333333332', 'Memastikan seluruh santri ikut melaksanakan shalat Dzuhur secara berjamaah di masjid.', 4),
('33333333-3333-3333-3333-333333333332', 'Memastikan santri melakukan dzikir setelah shalat.', 5),
('33333333-3333-3333-3333-333333333332', 'Memastikan seluruh santri makan siang.', 6),
('33333333-3333-3333-3333-333333333332', 'Setelah makan siang, mengarahkan santri untuk mengikuti KBM siang.', 7);

-- Insert Sesi 4
INSERT INTO sesi_jurnal_musyrif_keasramaan (id, nama_sesi, urutan) VALUES 
('44444444-4444-4444-4444-444444444444', 'SESI 4', 4);

-- Insert Jadwal untuk Sesi 4
INSERT INTO jadwal_jurnal_musyrif_keasramaan (id, sesi_id, jam_mulai, jam_selesai, urutan) VALUES
('44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', '15:00', '15:15', 1),
('44444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', '15:15', '15:30', 2),
('44444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', '15:30', '15:45', 3),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '15:45', '16:00', 4),
('44444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', '16:00', '17:00', 5),
('44444444-4444-4444-4444-444444444446', '44444444-4444-4444-4444-444444444444', '17:00', '17:15', 6),
('44444444-4444-4444-4444-444444444447', '44444444-4444-4444-4444-444444444444', '17:15', '17:30', 7),
('44444444-4444-4444-4444-444444444448', '44444444-4444-4444-4444-444444444444', '17:30', '18:00', 8);

-- Insert Kegiatan untuk Sesi 4
INSERT INTO kegiatan_jurnal_musyrif_keasramaan (jadwal_id, deskripsi_kegiatan, urutan) VALUES
-- 15:00-15:15
('44444444-4444-4444-4444-444444444441', 'Shalat Ashar: Guru asrama sudah berada di masjid bersama santri.', 1),
('44444444-4444-4444-4444-444444444441', 'Memastikan santri tidak ada yang kembali ke asrama dan langsung menuju masjid untuk persiapan.', 2),
-- 15:15-15:30
('44444444-4444-4444-4444-444444444442', 'Adzan Ashar: Memastikan santri menjawab panggilan adzan dan berdoa setelah adzan.', 1),
('44444444-4444-4444-4444-444444444442', 'Memastikan santri melaksanakan shalat 2 rakaat sebelum Ashar.', 2),
('44444444-4444-4444-4444-444444444442', 'Mengarahkan santri untuk berdoa atau membaca Al-Qur''an sambil menunggu iqamah.', 3),
-- 15:30-15:45
('44444444-4444-4444-4444-444444444443', 'Memastikan seluruh santri ikut melaksanakan shalat Ashar secara berjamaah di masjid.', 1),
('44444444-4444-4444-4444-444444444443', 'Memastikan santri melakukan dzikir setelah shalat.', 2),
-- 15:45-16:00
('44444444-4444-4444-4444-444444444444', 'Memastikan santri melakukan dzikir sore.', 1),
-- 16:00-17:00
('44444444-4444-4444-4444-444444444445', 'Membuka kunci asrama untuk persiapan kegiatan ekstrakurikuler atau olahraga sore.', 1),
('44444444-4444-4444-4444-444444444445', 'Memantau berjalannya kegiatan sore.', 2),
('44444444-4444-4444-4444-444444444445', 'Memastikan bahwa pada pukul 17.30 semua kegiatan telah selesai.', 3),
-- 17:00-17:15
('44444444-4444-4444-4444-444444444446', 'Persiapan untuk mandi santri.', 1),
('44444444-4444-4444-4444-444444444446', 'Memastikan santri sudah mandi dan menanyakan kondisi secara personal.', 2),
-- 17:15-17:30
('44444444-4444-4444-4444-444444444447', 'Makan sore.', 1),
('44444444-4444-4444-4444-444444444447', 'Memastikan santri menuju ke masjid tanpa terlambat.', 2),
-- 17:30-18:00
('44444444-4444-4444-4444-444444444448', 'Saat adzan Maghrib, memastikan santri tidak terlambat ke masjid dan tidak membuka kamar asrama kecuali setelah kegiatan di luar asrama selesai atau ada hal urgent dari santri yang mempunyai hajat.', 1),
('44444444-4444-4444-4444-444444444448', 'Mengarahkan santri pergi ke masjid.', 2),
('44444444-4444-4444-4444-444444444448', 'Memastikan santri melaksanakan shalat Maghrib.', 3),
('44444444-4444-4444-4444-444444444448', 'Memastikan santri melakukan dzikir setelah shalat.', 4),
('44444444-4444-4444-4444-444444444448', 'Memastikan santri melaksanakan shalat sunnah ba''diyah.', 5);

-- Insert Sesi 5
INSERT INTO sesi_jurnal_musyrif_keasramaan (id, nama_sesi, urutan) VALUES 
('55555555-5555-5555-5555-555555555555', 'SESI 5', 5);

-- Insert Jadwal untuk Sesi 5
INSERT INTO jadwal_jurnal_musyrif_keasramaan (id, sesi_id, jam_mulai, jam_selesai, urutan) VALUES
('55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', '18:15', '19:00', 1),
('55555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', '19:00', '19:15', 2),
('55555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', '19:15', '19:30', 3),
('55555555-5555-5555-5555-555555555554', '55555555-5555-5555-5555-555555555555', '19:30', '19:45', 4),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '19:45', '20:15', 5),
('55555555-5555-5555-5555-555555555556', '55555555-5555-5555-5555-555555555555', '20:15', '20:30', 6),
('55555555-5555-5555-5555-555555555557', '55555555-5555-5555-5555-555555555555', '20:30', '20:45', 7),
('55555555-5555-5555-5555-555555555558', '55555555-5555-5555-5555-555555555555', '20:45', '21:30', 8),
('55555555-5555-5555-5555-555555555559', '55555555-5555-5555-5555-555555555555', '21:30', '22:00', 9);

-- Insert Kegiatan untuk Sesi 5
INSERT INTO kegiatan_jurnal_musyrif_keasramaan (jadwal_id, deskripsi_kegiatan, urutan) VALUES
-- 18:15-19:00
('55555555-5555-5555-5555-555555555551', 'Melanjutkan halaqah Al-Qur''an.', 1),
('55555555-5555-5555-5555-555555555551', 'Memastikan semua santri menyetorkan hafalan atau muroja''ah hafalan.', 2),
-- 19:00-19:15
('55555555-5555-5555-5555-555555555552', 'Adzan Isya'': Menjawab adzan dan berdoa.', 1),
('55555555-5555-5555-5555-555555555552', 'Shalat sunnah qabliyah.', 2),
-- 19:15-19:30
('55555555-5555-5555-5555-555555555553', 'Memastikan seluruh santri ikut melaksanakan shalat Isya'' secara berjamaah di masjid.', 1),
('55555555-5555-5555-5555-555555555553', 'Memastikan seluruh santri melakukan dzikir setelah shalat.', 2),
('55555555-5555-5555-5555-555555555553', 'Memastikan seluruh santri melaksanakan shalat sunnah ba''diyah.', 3),
-- 19:30-19:45
('55555555-5555-5555-5555-555555555554', 'Memastikan seluruh santri mengikuti KBM (jika ada).', 1),
-- 19:45-20:15
('55555555-5555-5555-5555-555555555555', 'Berbicara dengan bahasa asing kepada 10 santri yang berbeda, minimal satu menit per santri.', 1),
('55555555-5555-5555-5555-555555555555', 'Mengunjungi santri di asrama atau kamar, minimal 5 menit dan maksimal 10 menit.', 2),
('55555555-5555-5555-5555-555555555555', 'Memberikan nasehat, teguran, atau pengumuman yang dianggap penting.', 3),
-- 20:15-20:30
('55555555-5555-5555-5555-555555555556', 'Memastikan santri sudah tidak berada di masjid.', 1),
('55555555-5555-5555-5555-555555555556', 'Memastikan pintu asrama tidak terkunci.', 2),
-- 20:30-20:45
('55555555-5555-5555-5555-555555555557', 'Menggiring santri masuk ke asrama.', 1),
('55555555-5555-5555-5555-555555555557', 'Persiapan kegiatan malam di asrama.', 2),
-- 20:45-21:30
('55555555-5555-5555-5555-555555555558', 'Mengajarkan adab harian atau siroh.', 1),
('55555555-5555-5555-5555-555555555558', 'Melakukan absensi.', 2),
-- 21:30-22:00
('55555555-5555-5555-5555-555555555559', 'Input Habit Tracker Santri', 1),
('55555555-5555-5555-5555-555555555559', 'Memastikan santri persiapan untuk tidur.', 2),
('55555555-5555-5555-5555-555555555559', 'Memastikan santri sudah wudhu'' sebelum tidur.', 3),
('55555555-5555-5555-5555-555555555559', 'Memastikan santri membaca doa-doa sebelum tidur (Ayat Kursi, Al-Ikhlas, Al-Falaq, dan An-Naas).', 4),
('55555555-5555-5555-5555-555555555559', 'Memastikan santri membaca doa sebelum tidur.', 5);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
