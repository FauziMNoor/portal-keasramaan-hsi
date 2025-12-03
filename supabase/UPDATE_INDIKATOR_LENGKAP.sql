-- =====================================================
-- UPDATE TABEL INDIKATOR KEASRAMAAN
-- Menambah kolom untuk deskripsi lengkap per nilai
-- =====================================================

-- Hapus tabel log_habit_keasramaan jika ada
DROP TABLE IF EXISTS log_habit_keasramaan CASCADE;

-- Hapus data lama
TRUNCATE TABLE indikator_keasramaan;

-- Ubah struktur: setiap baris = 1 nilai dengan deskripsi lengkap
-- Hapus kolom 'nilai' dan 'rubrik', ganti dengan 'nilai_angka' dan 'deskripsi'
ALTER TABLE indikator_keasramaan DROP COLUMN IF EXISTS nilai;
ALTER TABLE indikator_keasramaan DROP COLUMN IF EXISTS rubrik;
ALTER TABLE indikator_keasramaan ADD COLUMN IF NOT EXISTS nilai_angka INTEGER NOT NULL DEFAULT 1;
ALTER TABLE indikator_keasramaan ADD COLUMN IF NOT EXISTS deskripsi TEXT NOT NULL DEFAULT '';

-- Insert data lengkap dengan deskripsi per nilai
-- =====================================================
-- UBUDIYAH
-- =====================================================

-- Shalat Fardhu Berjamaah
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Shalat Fardhu Berjamaah', 3, 'Ananda selalu menjaga agar di shaf pertama dan sangat semangat dalam shalat berjamaah'),
('Ubudiyah', 'Shalat Fardhu Berjamaah', 2, 'Ananda tidak pernah absen dari shalat berjamaah kecuali karena udzur syari'),
('Ubudiyah', 'Shalat Fardhu Berjamaah', 1, 'Ananda sering absen dari shalat berjamaah');

-- Tata Cara Shalat
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Tata Cara Shalat', 3, 'Ananda sangat memperhatikan shalatnya, melakukan gerakan shalat dengan sempurna, semangat dalam shalat, perhatian dengan pakaian shalat dan memakai parfum ketika shalat'),
('Ubudiyah', 'Tata Cara Shalat', 2, 'Ananda masih harus lebih memperhatikan shalatnya, lebih sempurna dalam gerakan shalat dan lebih rapi lagi ketika shalat.'),
('Ubudiyah', 'Tata Cara Shalat', 1, 'Ananda masih butuh bimbingan dalam shalatnya, ada beberapa hal yang belum sepurna dari shalat ananda, seperti sering tidak sempurna ketika ruku'' dll.');

-- Qiyamul Lail
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Qiyamul Lail', 3, 'Ananda rutin menegakkan Qiyamul lail'),
('Ubudiyah', 'Qiyamul Lail', 2, 'Ananda jarang melakukan qiyamul lail'),
('Ubudiyah', 'Qiyamul Lail', 1, 'Ananda sangat jarang melakukan qiyamul lail');

-- Shalat Sunnah
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Shalat Sunnah', 3, 'Ananda sudah rutin menegakkan shalat sunnah'),
('Ubudiyah', 'Shalat Sunnah', 2, 'Ananda jarang shalat sunnah'),
('Ubudiyah', 'Shalat Sunnah', 1, 'Ananda sangat jarang melakukan shalat sunnah');

-- Puasa Sunnah
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Puasa Sunnah', 5, 'Ananda sudah rutin melakukan puasa Dawud'),
('Ubudiyah', 'Puasa Sunnah', 4, 'Ananda sudah rutin melakukan puasa sunnah senin kamis'),
('Ubudiyah', 'Puasa Sunnah', 3, 'Ananda terkadang masih meninggalkan puasa sunnah'),
('Ubudiyah', 'Puasa Sunnah', 2, 'Ananda jarang puasa sunnah'),
('Ubudiyah', 'Puasa Sunnah', 1, 'Ananda sangat jarang melakukan puasa sunnah');

-- Tata Cara Wudhu
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Tata Cara Wudhu', 3, 'Ananda sudah bisa melakukannya sesuai sunnah Rasulullah dan membaca doa setelah berwudhu'),
('Ubudiyah', 'Tata Cara Wudhu', 2, 'Ananda masih membutuhkan bimbingan agar wudhunya sesuai sunnah'),
('Ubudiyah', 'Tata Cara Wudhu', 1, 'Ananda kurang peduli dengan tatacara wudhunya dan masih membutuhkan bimbingan');

-- Sedekah
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Sedekah', 4, 'Ananda sudah rutin bersedekah setiap hari tanpa diingatkan dengan jumlah yang banyak'),
('Ubudiyah', 'Sedekah', 3, 'Ananda sudah rutin bersedekah setiap hari walaupun sedikit'),
('Ubudiyah', 'Sedekah', 2, 'Ananda masih jarang bersedekah dan masih perlu dimotivasi akan keutamaan sedekah'),
('Ubudiyah', 'Sedekah', 1, 'Ananda jarang sekali bersedekah dan terasa berat untuk memberi sehingga masih sangat butuh motivasi akan keutamaan sedekah');

-- Dzikir Pagi Petang
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Ubudiyah', 'Dzikir Pagi Petang', 4, 'Ananda sudah hafal dzikir pagi petang dan rutin mengamalkannya'),
('Ubudiyah', 'Dzikir Pagi Petang', 3, 'Ananda belum hafal dzikir pagi petang tapi rutin mengamalkannya'),
('Ubudiyah', 'Dzikir Pagi Petang', 2, 'Ananda sudah hafal dzikir pagi petang, akan tetapi belum rutin mengamalkannya'),
('Ubudiyah', 'Dzikir Pagi Petang', 1, 'Ananda belum hafal dan belum rutin dalam mengamalkannya');

-- =====================================================
-- AKHLAQ
-- =====================================================

-- Etika Tutur Kata
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Akhlaq', 'Etika dalam Tutur Kata', 3, 'Ananda baik dalam tuturkata kepada semua warga sekolah'),
('Akhlaq', 'Etika dalam Tutur Kata', 2, 'Ananda terkadang masih berkata kurang baik dan belum bisa mengontrol perkataan'),
('Akhlaq', 'Etika dalam Tutur Kata', 1, 'Ananda sangat sering berkata kurang baik');

-- Etika Bergaul
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Akhlaq', 'Etika dalam Bergaul', 3, 'Ananda bisa bergaul dengan baik dengan seluruh siswa baik di lingkungan asrama atau sekolah'),
('Akhlaq', 'Etika dalam Bergaul', 2, 'Ananda bisa bergaul dengan baik, akan tetapi masih di dapati sering melakukan pembulian kepada teman, bercanda berlebihan, memukul fisik dll'),
('Akhlaq', 'Etika dalam Bergaul', 1, 'Ananda masih membutuhkan lebih banyak penyesuaian dalam bersosial.');

-- Etika Berpakaian
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Akhlaq', 'Etika dalam Berpakaian', 3, 'Ananda sangat perhatian dengan pakaiannya baik dari segi kerapian, kebersihan dan menutup aurat.'),
('Akhlaq', 'Etika dalam Berpakaian', 2, 'Ananda sudah rapi dan bersih dalam berpakaian akan tetapi masih bermudah-mudahan dalam memakai pakaian yang menampakkan auratnya (paha)'),
('Akhlaq', 'Etika dalam Berpakaian', 1, 'Ananda masih memerlukan waktu untuk belajar kerapaian dan kebersihan pakaian.');

-- Adab Sehari-hari
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Akhlaq', 'Adab Sehari-hari', 3, 'Ananda sudah memperhatikan adab sehari-hari seperti ketika makan dengan tangan kanan dan tidak berdiri, tidur berwudhu terlebih dahulu, santun dalam bertutur kata, suka menebar salam dll'),
('Akhlaq', 'Adab Sehari-hari', 2, 'Ananda cukup dalam menerapkan adab sehari-hari, seperti adab makan, tidur, bergaul, bertemu dengan orang lain dll'),
('Akhlaq', 'Adab Sehari-hari', 1, 'Ananda masih membutuhkan waktu lagi untuk belajar menerapkan adab, karena terkadang masih makan dengan tangan kiri, tidak mengucapkan salam, kadang juga masih berkata kurang baik.');

-- =====================================================
-- KEDISIPLINAN
-- =====================================================

-- Waktu Tidur
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Waktu Tidur', 4, 'Ananda tidur dan bangun selalu tepat waktu'),
('Kedisiplinan', 'Waktu Tidur', 3, 'Ananda sering telat tidur akan tetapi bangun tepat waktu'),
('Kedisiplinan', 'Waktu Tidur', 2, 'Ananda tidur tepat waktu akan tetapi telat bangun'),
('Kedisiplinan', 'Waktu Tidur', 1, 'Ananda sering telat tidur dan telat bangun');

-- Pelaksanaan Piket Kamar
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Pelaksanaan Piket Kamar', 3, 'Ananda sudah sepenuhnya sadar dengan tugas piket kamar.'),
('Kedisiplinan', 'Pelaksanaan Piket Kamar', 2, 'Ananda masih harus diingatkan dengan melakukan tugas piket kamar'),
('Kedisiplinan', 'Pelaksanaan Piket Kamar', 1, 'Ananda terkadang enggan piket kamar walau sudah diingatkan');

-- Disiplin Halaqah Tahfidz
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Disiplin Halaqah Tahfidz', 3, 'Ananda sudah menunjukkan kedisiplinan dalam mengikuti halaqah Tahfidz dengan datang tepat waktu, beradab ketika bermajelis dan meninggalkan halaqah sesuai waktunya.'),
('Kedisiplinan', 'Disiplin Halaqah Tahfidz', 2, 'Ananda masih kurang disiplin dalam mengikuti halaqah Tahfidz'),
('Kedisiplinan', 'Disiplin Halaqah Tahfidz', 1, 'Ananda masih membutuhkan bimbingan lebih agar bisa lebih disiplin dalam halaqah tahfidz');

-- Perizinan
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Perizinan', 3, 'Ananda selalu meminta izin ketika meninggalkan sekolah dan datang tepat waktu'),
('Kedisiplinan', 'Perizinan', 2, 'Ananda selalu meminta izin ketika meninggalkan sekolah dan terkadang datang tidak tepat waktu'),
('Kedisiplinan', 'Perizinan', 1, 'Ananda terkadang tidak meminta izin dan sering kembali tidak tepat waktu');

-- Belajar Malam
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Belajar Malam', 4, 'Ananda selalu mengikuti belajar malam dengan disiplin'),
('Kedisiplinan', 'Belajar Malam', 3, 'Ananda jarang mengikuti belajar malam'),
('Kedisiplinan', 'Belajar Malam', 2, 'Ananda tidak tepat waktu ketika belajar malam'),
('Kedisiplinan', 'Belajar Malam', 1, 'Ananda kurang disiplin dalam belajar malam');

-- Disiplin Berangkat ke Masjid
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kedisiplinan', 'Disiplin Berangkat ke Masjid', 4, 'Ananda selalu datang ke masjid tepat waktu'),
('Kedisiplinan', 'Disiplin Berangkat ke Masjid', 3, 'Ananda terkadang masih terlambat datang ke masjid'),
('Kedisiplinan', 'Disiplin Berangkat ke Masjid', 2, 'Ananda sering terlambat datang ke masjid'),
('Kedisiplinan', 'Disiplin Berangkat ke Masjid', 1, 'Ananda sangat sering terlambat datang ke masjid');

-- =====================================================
-- KEBERSIHAN & KERAPIAN
-- =====================================================

-- Kebersihan Tubuh
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kebersihan & Kerapian', 'Kebersihan Tubuh, Berpakaian, Berpenampilan', 3, 'Ananda sangat perhatian dengan kebersihan tubuh dan penampilan'),
('Kebersihan & Kerapian', 'Kebersihan Tubuh, Berpakaian, Berpenampilan', 2, 'Ananda kurang dalam menjaga kebersihan tubuh dan penampilan'),
('Kebersihan & Kerapian', 'Kebersihan Tubuh, Berpakaian, Berpenampilan', 1, 'Ananda belum bisa menjaga kebersihan tubuh dan penampilan');

-- Kamar
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kebersihan & Kerapian', 'Kamar', 3, 'Ananda bisa menjaga kebersihan dan kerapian kamar'),
('Kebersihan & Kerapian', 'Kamar', 2, 'Ananda kurang bisa menjaga kebersihan dan kerapian kamar'),
('Kebersihan & Kerapian', 'Kamar', 1, 'Ananda belum bisa menjaga kebersihan dan kerapian kamar');

-- Ranjang dan Almari
INSERT INTO indikator_keasramaan (kategori, nama_indikator, nilai_angka, deskripsi) VALUES
('Kebersihan & Kerapian', 'Ranjang dan Almari', 3, 'Ananda bisa menjaga kebersihan dan kerapian ranjang dan almari'),
('Kebersihan & Kerapian', 'Ranjang dan Almari', 2, 'Ananda kurang bisa menjaga kebersihan dan kerapian ranjang dan almari'),
('Kebersihan & Kerapian', 'Ranjang dan Almari', 1, 'Ananda belum bisa menjaga kebersihan dan kerapian ranjang dan almari');

-- =====================================================
-- SELESAI
-- =====================================================
