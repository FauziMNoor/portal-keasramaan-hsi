# ✅ TESTING CHECKLIST - Catatan Perilaku

## 📋 Pre-Testing Setup

- [ ] Database setup sudah dijalankan (SETUP_CATATAN_PERILAKU.sql)
- [ ] 4 tabel baru sudah ada di Supabase
- [ ] Data awal kategori sudah terisi (30 kategori)
- [ ] Aplikasi Next.js sudah di-refresh
- [ ] User sudah login ke dashboard

---

## 🧪 Test Cases

### 1. Menu & Navigation
- [ ] Menu "Catatan Perilaku" muncul di sidebar
- [ ] 5 sub-menu muncul:
  - [ ] Input Catatan
  - [ ] Kelola Link Token
  - [ ] Riwayat Catatan
  - [ ] Dashboard Rekap
  - [ ] Kelola Kategori
- [ ] Klik setiap menu tidak error
- [ ] URL routing benar

---

### 2. Kelola Kategori (`/catatan-perilaku/kategori`)

#### Tab Pelanggaran
- [ ] Tab "Pelanggaran" aktif by default
- [ ] Tampil 15 kategori pelanggaran
- [ ] Poin semua negatif (warna merah)
- [ ] Klik "Tambah Kategori" muncul modal
- [ ] Form tambah kategori:
  - [ ] Input nama kategori (required)
  - [ ] Input poin (required)
  - [ ] Input deskripsi (optional)
  - [ ] Simpan berhasil
  - [ ] Kategori baru muncul di tabel
- [ ] Edit kategori:
  - [ ] Klik icon edit
  - [ ] Form terisi data lama
  - [ ] Update berhasil
  - [ ] Data berubah di tabel
- [ ] Hapus kategori:
  - [ ] Klik icon hapus
  - [ ] Muncul konfirmasi
  - [ ] Hapus berhasil
  - [ ] Kategori hilang dari tabel

#### Tab Kebaikan
- [ ] Klik tab "Kebaikan"
- [ ] Tampil 15 kategori kebaikan
- [ ] Poin semua positif (warna hijau)
- [ ] CRUD kategori kebaikan sama seperti pelanggaran

---

### 3. Input Catatan (`/catatan-perilaku/input`)

#### Filter Data
- [ ] Dropdown tahun ajaran terisi
- [ ] Dropdown semester terisi
- [ ] Dropdown cabang terisi
- [ ] Dropdown kelas terisi
- [ ] Pilih cabang + kelas → santri muncul
- [ ] Counter "Ditemukan X santri" benar
- [ ] Filter asrama bekerja
- [ ] Filter musyrif bekerja

#### Tab Pelanggaran
- [ ] Tab "Pelanggaran" aktif by default
- [ ] Dropdown santri terisi
- [ ] Dropdown kategori pelanggaran terisi
- [ ] Pilih kategori → card info muncul (nama, deskripsi, poin)
- [ ] Poin negatif (warna merah)
- [ ] Input deskripsi tambahan (optional)
- [ ] Simpan berhasil
- [ ] Alert "Catatan berhasil disimpan"
- [ ] Form ter-reset

#### Tab Kebaikan
- [ ] Klik tab "Kebaikan"
- [ ] Dropdown kategori kebaikan terisi
- [ ] Pilih kategori → card info muncul
- [ ] Poin positif (warna hijau)
- [ ] Simpan berhasil

#### Validasi
- [ ] Simpan tanpa pilih santri → error
- [ ] Simpan tanpa pilih kategori → error
- [ ] Simpan tanpa tanggal → error
- [ ] Simpan tanpa tahun ajaran → error
- [ ] Simpan tanpa semester → error

---

### 4. Kelola Link Token (`/catatan-perilaku/manage-link`)

#### Buat Token
- [ ] Klik "Buat Token Baru" → modal muncul
- [ ] Form buat token:
  - [ ] Input nama pemberi (required)
  - [ ] Dropdown cabang (optional)
  - [ ] Dropdown kelas (optional)
  - [ ] Dropdown asrama (optional, filter by cabang+kelas)
  - [ ] Dropdown musyrif (optional, filter by cabang+kelas+asrama)
  - [ ] Dropdown tipe akses (required): Semua / Pelanggaran / Kebaikan
  - [ ] Simpan berhasil
  - [ ] Token baru muncul di tabel

#### Tabel Token
- [ ] Kolom lengkap: No, Nama Pemberi, Filter, Tipe Akses, Link, Status, Aksi
- [ ] Link token bisa di-copy
- [ ] Klik icon copy → alert "Link berhasil dicopy"
- [ ] Klik icon link → buka di tab baru
- [ ] Badge tipe akses warna benar (biru/merah/hijau)
- [ ] Badge status warna benar (hijau: aktif, merah: nonaktif)

#### Aksi Token
- [ ] Klik icon mata (aktif) → token jadi nonaktif
- [ ] Klik icon mata (nonaktif) → token jadi aktif
- [ ] Klik icon edit → modal edit muncul, data terisi
- [ ] Update token berhasil
- [ ] Klik icon hapus → konfirmasi muncul
- [ ] Hapus token berhasil

---

### 5. Form via Token (`/catatan-perilaku/form/[token]`)

#### Validasi Token
- [ ] Buka link token yang aktif → form muncul
- [ ] Buka link token yang nonaktif → error "Link tidak valid"
- [ ] Buka link token random → error "Link tidak valid"

#### Header Form
- [ ] Logo sekolah muncul (jika ada)
- [ ] Nama pemberi token muncul
- [ ] Filter token muncul (cabang, kelas, asrama, musyrif)
- [ ] Counter santri benar

#### Form Input
- [ ] Dropdown santri terisi (sesuai filter token)
- [ ] Dropdown tahun ajaran terisi
- [ ] Dropdown semester terisi
- [ ] Input tanggal default hari ini

#### Tab (jika tipe_akses = semua)
- [ ] Tab Pelanggaran dan Kebaikan muncul
- [ ] Switch tab bekerja
- [ ] Dropdown kategori berubah sesuai tab

#### Tab (jika tipe_akses = pelanggaran)
- [ ] Hanya tab Pelanggaran muncul
- [ ] Tidak bisa switch ke Kebaikan

#### Tab (jika tipe_akses = kebaikan)
- [ ] Hanya tab Kebaikan muncul
- [ ] Tidak bisa switch ke Pelanggaran

#### Submit Form
- [ ] Pilih semua field required
- [ ] Pilih kategori → card info muncul
- [ ] Simpan berhasil
- [ ] Alert "Catatan berhasil disimpan"
- [ ] Form ter-reset
- [ ] Bisa input lagi

#### Responsive Mobile
- [ ] Form responsive di HP
- [ ] Dropdown mudah diklik
- [ ] Button besar dan mudah diklik
- [ ] Scroll smooth

---

### 6. Riwayat Catatan (`/catatan-perilaku/riwayat`)

#### Stats Cards
- [ ] Card "Total Catatan" benar
- [ ] Card "Pelanggaran" benar (warna merah)
- [ ] Card "Kebaikan" benar (warna hijau)
- [ ] Card "Total Poin" benar (warna biru/orange)

#### Filter
- [ ] Search by nama santri bekerja
- [ ] Search by NIS bekerja
- [ ] Search by kategori bekerja
- [ ] Filter tipe (Semua/Pelanggaran/Kebaikan) bekerja
- [ ] Filter tanggal mulai bekerja
- [ ] Filter tanggal akhir bekerja
- [ ] Kombinasi filter bekerja

#### Tabel
- [ ] Kolom lengkap: No, Tanggal, Tipe, Santri, Cabang/Kelas, Kategori, Poin, Dicatat Oleh, Aksi
- [ ] Badge tipe warna benar (merah/hijau)
- [ ] Badge poin warna benar (merah/hijau)
- [ ] Tanggal format Indonesia
- [ ] Deskripsi tambahan muncul (jika ada)

#### Aksi
- [ ] Klik icon hapus → konfirmasi muncul
- [ ] Hapus berhasil
- [ ] Data hilang dari tabel
- [ ] Stats cards update otomatis

#### Export CSV
- [ ] Klik "Export CSV"
- [ ] File CSV ter-download
- [ ] Isi CSV benar (header + data)
- [ ] Nama file format: `riwayat-catatan-perilaku-YYYY-MM-DD.csv`

---

### 7. Dashboard Rekap (`/catatan-perilaku/dashboard`)

#### Filter
- [ ] Dropdown cabang terisi
- [ ] Dropdown kelas terisi
- [ ] Dropdown asrama terisi (filter by cabang+kelas)
- [ ] Filter bekerja
- [ ] Data update sesuai filter

#### Stats Cards
- [ ] Card "Total Santri" benar
- [ ] Card "Total Pelanggaran" benar (warna merah)
- [ ] Card "Total Kebaikan" benar (warna hijau)
- [ ] Card "Total Poin" benar (warna biru/orange)

#### Top 5 Terbaik
- [ ] Tampil 5 santri dengan poin tertinggi
- [ ] Urutan benar (tertinggi ke terendah)
- [ ] Badge peringkat warna benar (emas, perak, perunggu, hijau)
- [ ] Poin positif (warna hijau)
- [ ] Jumlah kebaikan benar

#### Top 5 Perlu Perhatian
- [ ] Tampil 5 santri dengan poin terendah
- [ ] Urutan benar (terendah ke tertinggi)
- [ ] Badge peringkat warna merah
- [ ] Poin negatif (warna merah)
- [ ] Jumlah pelanggaran benar

#### Tabel Lengkap
- [ ] Kolom lengkap: Peringkat, Nama Santri, Cabang/Kelas, Pelanggaran, Kebaikan, Total Poin
- [ ] Urutan ranking benar (poin tertinggi ke terendah)
- [ ] Badge pelanggaran warna merah
- [ ] Badge kebaikan warna hijau
- [ ] Badge total poin warna benar (biru/orange)
- [ ] Semua santri yang punya catatan muncul

---

## 🔄 Integration Testing

### Integrasi dengan Data Siswa
- [ ] Santri dari `data_siswa_keasramaan` muncul di dropdown
- [ ] Data santri (NIS, nama, cabang, kelas, asrama, musyrif) tersimpan benar
- [ ] Filter by cabang/kelas/asrama/musyrif bekerja

### Integrasi dengan Master Data
- [ ] Tahun ajaran dari `tahun_ajaran_keasramaan` muncul
- [ ] Semester dari `semester_keasramaan` muncul
- [ ] Cabang dari `cabang_keasramaan` muncul
- [ ] Kelas dari `kelas_keasramaan` muncul
- [ ] Asrama dari `asrama_keasramaan` muncul
- [ ] Musyrif dari `musyrif_keasramaan` muncul

### Integrasi dengan User Auth
- [ ] Nama user login tersimpan di `dicatat_oleh` (input via dashboard)
- [ ] Nama pemberi token tersimpan di `dicatat_oleh` (input via token)
- [ ] Logout bekerja normal

---

## 🎨 UI/UX Testing

### Desktop
- [ ] Layout responsive
- [ ] Sidebar tidak overlap content
- [ ] Tabel tidak overflow
- [ ] Button mudah diklik
- [ ] Form tidak terlalu lebar

### Tablet
- [ ] Layout responsive
- [ ] Tabel bisa di-scroll horizontal
- [ ] Filter tidak terlalu sempit

### Mobile
- [ ] Sidebar jadi hamburger menu
- [ ] Form input mudah diisi
- [ ] Dropdown mudah diklik
- [ ] Button cukup besar
- [ ] Tabel bisa di-scroll
- [ ] Card tidak terlalu kecil

### Color & Typography
- [ ] Warna konsisten (merah: pelanggaran, hijau: kebaikan)
- [ ] Font size readable
- [ ] Contrast ratio cukup
- [ ] Icon jelas

---

## 🔐 Security Testing

### RLS Policies
- [ ] User bisa read semua data
- [ ] User bisa insert data
- [ ] User bisa update data
- [ ] User bisa delete data
- [ ] Token validation bekerja

### Token Security
- [ ] Token random dan unik
- [ ] Token nonaktif tidak bisa diakses
- [ ] Token tidak bisa ditebak

---

## 🐛 Edge Cases

### Data Kosong
- [ ] Tidak ada kategori → tampil pesan "Belum ada kategori"
- [ ] Tidak ada santri → tampil pesan "Pilih filter dulu"
- [ ] Tidak ada catatan → tampil pesan "Belum ada data"
- [ ] Tidak ada token → tampil pesan "Belum ada token"

### Data Banyak
- [ ] 100+ santri → dropdown tidak lag
- [ ] 1000+ catatan → tabel tidak lag
- [ ] Filter tetap cepat

### Network Error
- [ ] Fetch error → tampil error message
- [ ] Timeout → tampil loading state
- [ ] Retry bekerja

---

## ✅ Final Checklist

- [ ] Semua test case passed
- [ ] Tidak ada error di console
- [ ] Tidak ada warning kritis
- [ ] Performance baik (loading < 3 detik)
- [ ] Mobile responsive
- [ ] Data tersimpan benar di database
- [ ] Export CSV bekerja
- [ ] Token system bekerja
- [ ] Integrasi dengan sistem lain bekerja

---

## 📊 Test Results

**Total Test Cases:** ~150+

**Passed:** _____ / _____

**Failed:** _____ / _____

**Notes:**
```
[Tulis catatan testing di sini]
```

---

## 🎉 Testing Complete!

Jika semua test passed, fitur siap untuk production! 🚀
