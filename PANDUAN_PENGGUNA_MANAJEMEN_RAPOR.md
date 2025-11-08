# Panduan Pengguna - Sistem Manajemen Rapor Keasramaan

## Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Akses Menu Manajemen Rapor](#akses-menu-manajemen-rapor)
3. [Mengelola Galeri Kegiatan](#mengelola-galeri-kegiatan)
4. [Mengelola Indikator & Capaian](#mengelola-indikator--capaian)
5. [Membuat Template Rapor](#membuat-template-rapor)
6. [Generate Rapor PDF](#generate-rapor-pdf)
7. [Akses Galeri Publik via QR Code](#akses-galeri-publik-via-qr-code)
8. [Tips & Troubleshooting](#tips--troubleshooting)

---

## Pengenalan

Sistem Manajemen Rapor Keasramaan adalah fitur untuk mengotomasi pembuatan rapor semesteran siswa asrama. Sistem ini memungkinkan Anda untuk:

- 📸 Mengelola galeri foto kegiatan asrama
- 📊 Mengelola indikator penilaian dan capaian siswa
- 📄 Membuat template rapor yang fleksibel
- 🖨️ Generate rapor PDF secara otomatis (single atau bulk)
- 📱 Memberikan akses galeri online via QR code untuk orang tua

---

## Akses Menu Manajemen Rapor

1. Login ke Portal Keasramaan dengan akun admin
2. Pada sidebar kiri, klik menu **"Manajemen Rapor"**
3. Anda akan melihat 4 submenu:
   - **Galeri Kegiatan** - Kelola foto kegiatan
   - **Indikator & Capaian** - Kelola penilaian siswa
   - **Template Rapor** - Buat dan kelola template
   - **Generate Rapor** - Buat rapor PDF

---

## Mengelola Galeri Kegiatan

### Membuat Kegiatan Baru

1. Klik menu **"Galeri Kegiatan"**
2. Klik tombol **"+ Tambah Kegiatan"**
3. Isi form dengan informasi berikut:
   - **Nama Kegiatan**: Contoh: "Pesantren Ramadhan 2024"
   - **Deskripsi**: Penjelasan singkat tentang kegiatan
   - **Tanggal Mulai**: Pilih tanggal mulai kegiatan
   - **Tanggal Selesai**: Pilih tanggal selesai kegiatan
   - **Tahun Ajaran**: Contoh: "2023/2024"
   - **Semester**: Pilih "Ganjil" atau "Genap"
   - **Scope Kegiatan**: Pilih cakupan peserta:
     - **Seluruh Sekolah**: Semua siswa
     - **Kelas 10**: Hanya siswa kelas 10
     - **Kelas 11**: Hanya siswa kelas 11
     - **Kelas 12**: Hanya siswa kelas 12
     - **Asrama Putra**: Hanya siswa asrama putra
     - **Asrama Putri**: Hanya siswa asrama putri
4. Klik **"Simpan"**

> **💡 Tips**: Scope kegiatan penting untuk filtering otomatis saat generate rapor. Kegiatan dengan scope "Kelas 10" hanya akan muncul di rapor siswa kelas 10.

### Menambah Foto ke Kegiatan

1. Pada daftar kegiatan, klik nama kegiatan yang ingin ditambahkan foto
2. Anda akan masuk ke halaman detail kegiatan
3. Ada 2 cara upload foto:

   **Cara 1: Upload Single**
   - Klik tombol **"Upload Foto"**
   - Pilih 1 foto dari komputer
   - Tambahkan caption (opsional)
   - Klik **"Upload"**

   **Cara 2: Upload Bulk**
   - Klik tombol **"Upload Multiple"**
   - Pilih beberapa foto sekaligus (Ctrl+Click atau Shift+Click)
   - Foto akan diupload satu per satu
   - Anda bisa menambahkan caption setelah upload selesai

4. Foto yang berhasil diupload akan muncul di galeri

> **⚠️ Perhatian**: 
> - Format foto yang didukung: JPG, PNG, WEBP
> - Ukuran maksimal per foto: 5MB
> - Foto akan otomatis dikompres untuk menghemat storage

### Mengedit Caption Foto

1. Pada halaman detail kegiatan, arahkan kursor ke foto
2. Klik icon **"Edit"** (pensil)
3. Ubah caption
4. Klik **"Simpan"**

### Mengatur Urutan Foto

1. Pada halaman detail kegiatan, aktifkan mode **"Reorder"**
2. Drag & drop foto untuk mengubah urutan
3. Urutan akan otomatis tersimpan
4. Urutan ini akan digunakan saat foto ditampilkan di rapor

### Menghapus Foto

1. Pada halaman detail kegiatan, arahkan kursor ke foto
2. Klik icon **"Delete"** (tempat sampah)
3. Konfirmasi penghapusan
4. Foto akan dihapus dari storage dan database

### Mengedit Kegiatan

1. Pada daftar kegiatan, klik icon **"Edit"** pada kegiatan yang ingin diubah
2. Ubah informasi yang diperlukan
3. Klik **"Simpan"**

### Menghapus Kegiatan

1. Pada daftar kegiatan, klik icon **"Delete"** pada kegiatan yang ingin dihapus
2. Konfirmasi penghapusan
3. Kegiatan dan **semua foto terkait** akan dihapus

> **⚠️ Perhatian**: Penghapusan kegiatan bersifat permanen dan tidak dapat dibatalkan!

---

## Mengelola Indikator & Capaian

### Membuat Kategori Indikator

1. Klik menu **"Indikator & Capaian"**
2. Klik tombol **"+ Tambah Kategori"**
3. Isi nama kategori, contoh:
   - UBUDIYAH
   - AKHLAK
   - KEDISIPLINAN
4. Klik **"Simpan"**

### Membuat Indikator

1. Pada halaman Indikator & Capaian, pilih kategori
2. Klik tombol **"+ Tambah Indikator"**
3. Isi form:
   - **Nama Indikator**: Contoh: "Shalat Fardhu Berjamaah"
   - **Deskripsi**: Penjelasan kriteria penilaian
   - **Kategori**: Pilih kategori yang sesuai
4. Klik **"Simpan"**

**Contoh Indikator:**

**Kategori: UBUDIYAH**
- Shalat Fardhu Berjamaah
- Qiyamul Lail
- Tilawah Al-Qur'an
- Shalat Dhuha

**Kategori: AKHLAK**
- Sopan Santun
- Kejujuran
- Tanggung Jawab
- Kerjasama

**Kategori: KEDISIPLINAN**
- Kehadiran
- Ketepatan Waktu
- Kebersihan
- Kerapihan

### Mengatur Urutan Indikator

1. Pada halaman Indikator & Capaian, aktifkan mode **"Reorder"**
2. Drag & drop indikator untuk mengubah urutan
3. Urutan akan otomatis tersimpan
4. Urutan ini akan digunakan saat indikator ditampilkan di rapor

### Input Capaian Siswa

1. Klik tab **"Input Capaian"**
2. Pilih **Siswa** dari dropdown
3. Pilih **Tahun Ajaran** dan **Semester**
4. Sistem akan menampilkan semua indikator yang tersedia
5. Untuk setiap indikator, isi:
   - **Nilai**: A, B, C, atau D (atau custom)
   - **Deskripsi**: Penjelasan capaian siswa
6. Klik **"Simpan Semua"** untuk menyimpan semua capaian sekaligus

**Contoh Input Capaian:**

| Indikator | Nilai | Deskripsi |
|-----------|-------|-----------|
| Shalat Fardhu Berjamaah | A | Sangat baik, selalu hadir shalat berjamaah |
| Qiyamul Lail | B | Baik, sering mengikuti qiyamul lail |
| Sopan Santun | A | Sangat sopan kepada guru dan teman |

> **💡 Tips**: Anda bisa menyimpan capaian per indikator atau semua sekaligus. Gunakan tombol "Simpan Semua" untuk efisiensi.

### Melihat History Capaian

1. Klik tab **"History Capaian"**
2. Pilih siswa
3. Sistem akan menampilkan capaian siswa per semester
4. Anda bisa membandingkan capaian antar semester

---

## Membuat Template Rapor

### Konsep Template

Template rapor adalah blueprint/cetakan yang menentukan:
- Urutan halaman dalam rapor
- Jenis konten di setiap halaman
- Layout dan konfigurasi setiap halaman

Satu template bisa digunakan untuk generate rapor banyak siswa.

### Membuat Template Baru

1. Klik menu **"Template Rapor"**
2. Klik tombol **"+ Buat Template"**
3. Isi form:
   - **Nama Template**: Contoh: "Rapor Semester Genap 2024"
   - **Jenis Rapor**: Pilih "Semester", "Bulanan", atau "Tahunan"
   - **Ukuran Kertas Default**: Pilih A5, A4, Letter, atau F4
   - **Orientasi Default**: Pilih Portrait atau Landscape
4. Klik **"Simpan"**

### Menambah Halaman ke Template

Setelah template dibuat, Anda perlu menambahkan halaman. Ada 4 tipe halaman:

#### 1. Static Cover (Halaman Cover)

Halaman cover dengan gambar background dan overlay data siswa.

**Cara Menambah:**
1. Klik tombol **"+ Tambah Halaman"**
2. Pilih tipe **"Static Cover"**
3. Upload gambar cover (JPG/PNG)
4. Konfigurasi overlay:
   - Centang data yang ingin ditampilkan:
     - ☑️ Nama Siswa
     - ☑️ Tahun Ajaran
     - ☑️ Semester
   - Atur posisi setiap data (X, Y koordinat)
5. Klik **"Simpan"**

> **💡 Tips**: Gunakan gambar cover dengan resolusi tinggi (minimal 1920x1080) untuk hasil terbaik.

#### 2. Dynamic Data (Halaman Data Indikator)

Halaman yang menampilkan data capaian indikator siswa.

**Cara Menambah:**
1. Klik tombol **"+ Tambah Halaman"**
2. Pilih tipe **"Dynamic Data"**
3. Pilih kategori indikator yang ingin ditampilkan:
   - ☑️ UBUDIYAH
   - ☑️ AKHLAK
   - ☑️ KEDISIPLINAN
4. Pilih layout:
   - **List**: Tampilan list sederhana
   - **Table**: Tampilan tabel
5. Centang **"Tampilkan Deskripsi"** jika ingin menampilkan deskripsi capaian
6. Klik **"Simpan"**

> **💡 Tips**: Jika indikator banyak, pertimbangkan untuk membuat beberapa halaman Dynamic Data, masing-masing untuk 1-2 kategori.

#### 3. Galeri Kegiatan (Halaman Foto)

Halaman yang menampilkan foto-foto kegiatan.

**Cara Menambah:**
1. Klik tombol **"+ Tambah Halaman"**
2. Pilih tipe **"Galeri Kegiatan"**
3. Ada 2 mode pemilihan kegiatan:

   **Mode Manual:**
   - Pilih kegiatan spesifik dari daftar
   - Foto dari kegiatan yang dipilih akan ditampilkan

   **Mode Auto (Recommended):**
   - Centang **"Auto Select by Scope"**
   - Sistem akan otomatis memilih kegiatan berdasarkan scope siswa
   - Contoh: Siswa kelas 10 akan melihat kegiatan dengan scope "Seluruh Sekolah" dan "Kelas 10"

4. Pilih layout foto:
   - **Grid 2**: 2 foto per halaman
   - **Grid 4**: 4 foto per halaman (2x2)
   - **Grid 6**: 6 foto per halaman (2x3)
   - **Collage**: Layout bebas

5. Atur **Max Foto per Halaman**
6. Centang **"Auto Paginate"** jika ingin otomatis membuat halaman baru saat foto melebihi kapasitas
7. Klik **"Simpan"**

> **💡 Tips**: Gunakan mode "Auto Select by Scope" untuk memastikan setiap siswa melihat kegiatan yang relevan dengan mereka.

#### 4. QR Code (Halaman QR Code)

Halaman yang berisi QR code untuk akses galeri online.

**Cara Menambah:**
1. Klik tombol **"+ Tambah Halaman"**
2. Pilih tipe **"QR Code"**
3. Konfigurasi:
   - **Base URL**: URL galeri publik (default: https://portal.sekolah.com/galeri-publik/)
   - **Ukuran QR**: 150-300 pixel
   - **Posisi**: Center, Bottom Right, atau Bottom Center
   - **Tampilkan Text**: Centang jika ingin menampilkan text
   - **Text**: Contoh: "Scan untuk melihat galeri lengkap"
4. Klik **"Simpan"**

### Mengatur Urutan Halaman

1. Pada halaman Template Builder, Anda akan melihat daftar halaman
2. Drag & drop halaman untuk mengubah urutan
3. Urutan akan otomatis tersimpan
4. Urutan ini menentukan urutan halaman di PDF

**Contoh Urutan yang Baik:**
1. Static Cover (Cover)
2. Dynamic Data - UBUDIYAH (Halaman 2)
3. Dynamic Data - AKHLAK (Halaman 3)
4. Dynamic Data - KEDISIPLINAN (Halaman 4)
5. Galeri Kegiatan (Halaman 5-6)
6. QR Code (Halaman terakhir)

### Preview Template

1. Pada daftar template, klik tombol **"Preview"**
2. Pilih siswa untuk preview dengan data real
3. Navigasi antar halaman dengan tombol **"Previous"** dan **"Next"**
4. Verifikasi bahwa semua halaman tampil dengan benar

> **💡 Tips**: Selalu preview template sebelum generate rapor untuk memastikan layout sudah sesuai.

### Mengedit Template

1. Pada daftar template, klik nama template
2. Anda bisa:
   - Menambah halaman baru
   - Mengedit halaman yang ada
   - Menghapus halaman
   - Mengubah urutan halaman
3. Perubahan akan otomatis tersimpan

### Menghapus Template

1. Pada daftar template, klik icon **"Delete"**
2. Konfirmasi penghapusan
3. Template akan dihapus (history generate tidak akan terhapus)

---

## Generate Rapor PDF

### Generate Rapor Single (1 Siswa)

1. Klik menu **"Generate Rapor"**
2. Pilih **Template** yang akan digunakan
3. Pilih mode **"Single"**
4. Pilih **Siswa** dari dropdown
5. Pilih **Tahun Ajaran** dan **Semester**
6. Klik tombol **"Preview"** untuk melihat preview (opsional)
7. Klik tombol **"Generate Rapor"**
8. Tunggu proses generate selesai (biasanya 5-10 detik)
9. Setelah selesai, klik tombol **"Download PDF"**

### Generate Rapor Bulk (Multiple Siswa)

1. Klik menu **"Generate Rapor"**
2. Pilih **Template** yang akan digunakan
3. Pilih mode **"Bulk"**
4. Ada 2 cara memilih siswa:

   **Cara 1: Pilih Manual**
   - Centang siswa yang ingin digenerate
   - Gunakan Ctrl+Click untuk pilih multiple

   **Cara 2: Filter by Kelas/Asrama**
   - Pilih filter "Kelas 10", "Kelas 11", "Kelas 12", dll.
   - Semua siswa di kelas/asrama tersebut akan dipilih

5. Pilih **Tahun Ajaran** dan **Semester**
6. Klik tombol **"Generate Bulk"**
7. Sistem akan memproses rapor dalam batch (10 siswa per batch)
8. Anda akan melihat progress bar dan status per siswa:
   - 🔄 **Processing**: Sedang diproses
   - ✅ **Completed**: Berhasil
   - ❌ **Failed**: Gagal (lihat error message)
9. Setelah selesai, Anda bisa:
   - Download semua PDF sekaligus (ZIP)
   - Download per siswa

> **💡 Tips**: 
> - Bulk generation untuk 50 siswa memakan waktu sekitar 5-10 menit
> - Jangan tutup browser saat proses bulk generation berjalan
> - Jika ada yang gagal, Anda bisa retry hanya untuk siswa yang gagal

### Troubleshooting Generate Rapor

**Problem: PDF tidak berisi foto**
- **Solusi**: Pastikan kegiatan memiliki foto dan scope kegiatan sesuai dengan siswa

**Problem: Data capaian tidak muncul**
- **Solusi**: Pastikan capaian siswa sudah diinput untuk periode yang dipilih

**Problem: Generate gagal dengan error "Template tidak memiliki halaman"**
- **Solusi**: Tambahkan minimal 1 halaman ke template

**Problem: QR Code tidak bisa discan**
- **Solusi**: Pastikan Base URL sudah benar dan token sudah digenerate

---

## Akses Galeri Publik via QR Code

### Untuk Admin: Generate Token

Token QR code otomatis digenerate saat rapor dibuat. Namun, Anda juga bisa generate token manual:

1. Klik menu **"Generate Rapor"**
2. Klik tab **"Token Management"**
3. Pilih siswa
4. Pilih periode (tahun ajaran & semester)
5. Atur expiration (opsional):
   - **Permanent**: Token tidak pernah expired
   - **Custom**: Set tanggal expired
6. Klik **"Generate Token"**
7. Copy URL atau QR code

### Untuk Orang Tua: Akses Galeri

1. Scan QR code di rapor menggunakan smartphone
2. Browser akan otomatis membuka halaman galeri
3. Anda akan melihat:
   - Informasi siswa (nama, kelas, asrama)
   - Daftar kegiatan yang diikuti siswa
   - Foto-foto kegiatan
4. Klik foto untuk melihat dalam ukuran penuh
5. Swipe untuk navigasi antar foto

> **💡 Tips untuk Orang Tua**:
> - Galeri bisa diakses kapan saja selama token masih valid
> - Bookmark URL untuk akses cepat
> - Galeri responsive dan bisa diakses dari smartphone atau tablet

### Keamanan Token

- Token bersifat unik per siswa dan periode
- Token bisa diset expired untuk keamanan
- Token tidak bisa digunakan untuk akses data siswa lain
- Galeri hanya menampilkan kegiatan yang relevan dengan siswa

---

## Tips & Troubleshooting

### Tips Umum

1. **Persiapan Data**
   - Input semua data capaian siswa sebelum generate rapor
   - Upload foto kegiatan dengan caption yang jelas
   - Buat template dan preview sebelum generate bulk

2. **Optimasi Foto**
   - Gunakan foto dengan resolusi yang cukup (minimal 1280x720)
   - Compress foto sebelum upload jika ukuran > 3MB
   - Gunakan format WEBP untuk ukuran file lebih kecil

3. **Template Design**
   - Jangan terlalu banyak halaman (maksimal 10 halaman)
   - Gunakan layout yang konsisten
   - Test template dengan data real sebelum production

4. **Bulk Generation**
   - Generate di waktu yang tidak sibuk (malam hari)
   - Jangan generate terlalu banyak sekaligus (maksimal 100 siswa)
   - Monitor progress dan catat siswa yang gagal

### Troubleshooting Umum

**Problem: Upload foto gagal**
- Cek ukuran file (maksimal 5MB)
- Cek format file (harus JPG, PNG, atau WEBP)
- Cek koneksi internet
- Coba compress foto terlebih dahulu

**Problem: Template tidak bisa disimpan**
- Pastikan semua field required sudah diisi
- Cek apakah ada error message
- Refresh halaman dan coba lagi

**Problem: Generate rapor sangat lambat**
- Cek jumlah foto per kegiatan (jangan terlalu banyak)
- Cek ukuran foto (compress jika terlalu besar)
- Coba generate di waktu yang berbeda

**Problem: QR Code tidak bisa discan**
- Pastikan QR code tidak terlalu kecil (minimal 150px)
- Pastikan kualitas print PDF bagus
- Coba scan dengan aplikasi QR scanner yang berbeda

**Problem: Galeri publik tidak menampilkan foto**
- Cek apakah token masih valid
- Cek apakah kegiatan memiliki scope yang sesuai dengan siswa
- Cek apakah foto sudah diupload ke kegiatan

### Kontak Support

Jika mengalami masalah yang tidak bisa diselesaikan:
1. Screenshot error message
2. Catat langkah-langkah yang dilakukan
3. Hubungi admin sistem atau IT support

---

## Checklist Workflow Lengkap

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

### Persiapan Data
- [ ] Buat kategori indikator (UBUDIYAH, AKHLAK, KEDISIPLINAN)
- [ ] Buat indikator untuk setiap kategori
- [ ] Buat kegiatan dengan scope yang sesuai
- [ ] Upload foto ke setiap kegiatan
- [ ] Input capaian siswa untuk periode yang akan digenerate

### Membuat Template
- [ ] Buat template baru
- [ ] Tambah halaman cover
- [ ] Tambah halaman dynamic data untuk setiap kategori
- [ ] Tambah halaman galeri kegiatan
- [ ] Tambah halaman QR code
- [ ] Atur urutan halaman
- [ ] Preview template dengan data real

### Generate Rapor
- [ ] Pilih template yang sudah dibuat
- [ ] Pilih mode (single atau bulk)
- [ ] Pilih siswa
- [ ] Pilih periode
- [ ] Generate rapor
- [ ] Download PDF
- [ ] Verifikasi PDF (buka dan cek semua halaman)
- [ ] Test QR code (scan dan akses galeri)

### Distribusi
- [ ] Print rapor atau kirim PDF ke orang tua
- [ ] Informasikan cara akses galeri via QR code
- [ ] Monitor akses galeri (opsional)

---

## Penutup

Sistem Manajemen Rapor Keasramaan dirancang untuk mempermudah proses pembuatan rapor semesteran. Dengan mengikuti panduan ini, Anda dapat:

✅ Mengelola galeri kegiatan dengan mudah
✅ Input capaian siswa secara efisien
✅ Membuat template rapor yang fleksibel
✅ Generate rapor PDF secara otomatis
✅ Memberikan akses galeri online untuk orang tua

Selamat menggunakan! 🎉

