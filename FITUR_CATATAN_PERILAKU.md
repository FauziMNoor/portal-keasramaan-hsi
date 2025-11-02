# 📋 FITUR CATATAN PERILAKU - DOKUMENTASI LENGKAP

## 🎯 Overview

Fitur **Catatan Perilaku** adalah sistem untuk mencatat pelanggaran dan kebaikan santri dengan sistem poin. Fitur ini terintegrasi penuh dengan sistem keasramaan yang sudah ada dan menggunakan teknologi yang sama dengan Habit Tracker.

---

## 🚀 CARA SETUP

### 1. Setup Database

Jalankan script SQL di Supabase SQL Editor:

```bash
File: supabase/SETUP_CATATAN_PERILAKU.sql
```

Script ini akan membuat:
- ✅ Tabel `kategori_pelanggaran_keasramaan`
- ✅ Tabel `kategori_kebaikan_keasramaan`
- ✅ Tabel `catatan_perilaku_keasramaan`
- ✅ Tabel `token_catatan_perilaku_keasramaan`
- ✅ Data awal kategori pelanggaran (15 kategori)
- ✅ Data awal kategori kebaikan (15 kategori)
- ✅ RLS Policies untuk keamanan

### 2. Verifikasi Setup

Setelah menjalankan script SQL, cek di Supabase:
1. Buka **Table Editor**
2. Pastikan 4 tabel baru sudah ada
3. Cek data awal kategori sudah terisi

### 3. Akses Fitur

Menu baru **"Catatan Perilaku"** sudah otomatis muncul di sidebar dengan 5 sub-menu:
- Input Catatan
- Kelola Link Token
- Riwayat Catatan
- Dashboard Rekap
- Kelola Kategori

---

## 📱 FITUR-FITUR UTAMA

### 1. **Kelola Kategori** (`/catatan-perilaku/kategori`)

Mengelola kategori pelanggaran dan kebaikan:
- ✅ CRUD kategori pelanggaran
- ✅ CRUD kategori kebaikan
- ✅ Set poin untuk setiap kategori
- ✅ Tambah deskripsi kategori
- ✅ Tab switching antara pelanggaran & kebaikan

**Contoh Kategori Pelanggaran:**
- Terlambat Shalat Berjamaah: -5 poin
- Tidak Mengikuti Shalat Berjamaah: -10 poin
- Keluar Asrama Tanpa Izin: -15 poin
- Berkelahi: -20 poin
- Merokok: -25 poin

**Contoh Kategori Kebaikan:**
- Imam Shalat Berjamaah: +10 poin
- Adzan: +5 poin
- Hafalan Quran Bertambah: +10 poin
- Juara Lomba: +15 poin
- Tahajud: +10 poin

---

### 2. **Input Catatan** (`/catatan-perilaku/input`)

Input catatan perilaku langsung dari dashboard admin:
- ✅ Filter santri berdasarkan cabang, kelas, asrama, musyrif
- ✅ Tab switching: Pelanggaran / Kebaikan
- ✅ Pilih santri dari dropdown
- ✅ Pilih kategori (otomatis tampil poin)
- ✅ Tambah deskripsi detail (opsional)
- ✅ Auto-save dengan nama user yang login

**Flow:**
1. Pilih tanggal, tahun ajaran, semester
2. Filter santri (cabang, kelas, asrama, musyrif)
3. Pilih tipe: Pelanggaran atau Kebaikan
4. Pilih santri
5. Pilih kategori
6. Tambah deskripsi (opsional)
7. Simpan

---

### 3. **Kelola Link Token** (`/catatan-perilaku/manage-link`)

Generate link token untuk input via HP (seperti Habit Tracker):
- ✅ Buat token untuk musyrif, kepala asrama, atau user lain
- ✅ Set filter: cabang, kelas, asrama, musyrif (atau biarkan kosong untuk semua)
- ✅ Set tipe akses: Semua / Hanya Pelanggaran / Hanya Kebaikan
- ✅ Copy link dan kirim via WhatsApp/Telegram
- ✅ Aktifkan/nonaktifkan token
- ✅ Edit dan hapus token

**Contoh Use Case:**
- Token untuk Musyrif Ahmad (filter: Asrama A, Kelas 7, akses: Semua)
- Token untuk Kepala Asrama (filter: Semua asrama di cabang Pusat, akses: Semua)
- Token untuk Guru BK (filter: Semua, akses: Hanya Pelanggaran)

---

### 4. **Form via Token** (`/catatan-perilaku/form/[token]`)

Halaman mobile-friendly untuk input via link token:
- ✅ Validasi token (aktif/nonaktif)
- ✅ Auto-filter santri sesuai token
- ✅ Tab switching (jika tipe_akses = semua)
- ✅ UI mobile-optimized
- ✅ Logo sekolah otomatis
- ✅ Nama pemberi token ditampilkan
- ✅ Success feedback setelah simpan

**Flow User:**
1. Buka link token di HP
2. Pilih tanggal, tahun ajaran, semester
3. Pilih santri (sudah terfilter otomatis)
4. Pilih tipe (jika akses semua)
5. Pilih kategori
6. Tambah deskripsi (opsional)
7. Simpan

---

### 5. **Riwayat Catatan** (`/catatan-perilaku/riwayat`)

Lihat semua catatan perilaku yang sudah diinput:
- ✅ Tabel lengkap semua catatan
- ✅ Filter: Search, Tipe, Tanggal Mulai-Akhir
- ✅ Stats cards: Total catatan, pelanggaran, kebaikan, poin
- ✅ Badge warna untuk tipe (merah: pelanggaran, hijau: kebaikan)
- ✅ Hapus catatan
- ✅ Export ke CSV

**Kolom Tabel:**
- Tanggal
- Tipe (Pelanggaran/Kebaikan)
- Santri (Nama + NIS)
- Cabang/Kelas
- Kategori + Deskripsi
- Poin
- Dicatat Oleh
- Aksi (Hapus)

---

### 6. **Dashboard Rekap** (`/catatan-perilaku/dashboard`)

Dashboard analitik poin santri:
- ✅ Filter: Cabang, Kelas, Asrama
- ✅ Stats cards: Total santri, pelanggaran, kebaikan, total poin
- ✅ Top 5 Santri Terbaik (poin tertinggi)
- ✅ Top 5 Perlu Perhatian (poin terendah)
- ✅ Tabel lengkap rekap per santri
- ✅ Ranking otomatis berdasarkan total poin

**Kolom Tabel:**
- Peringkat
- Nama Santri + NIS
- Cabang/Kelas
- Total Pelanggaran
- Total Kebaikan
- Total Poin (warna: biru jika positif, orange jika negatif)

---

## 🎨 DESIGN SYSTEM

### Color Scheme
- **Pelanggaran**: Red (from-red-500 to-red-600)
- **Kebaikan**: Green (from-green-500 to-green-600)
- **Neutral**: Blue (from-blue-500 to-blue-600)
- **Warning**: Orange (from-orange-500 to-orange-600)

### Icons
- Pelanggaran: `<AlertCircle />` ⚠️
- Kebaikan: `<Award />` ⭐
- Input: `<Save />` 💾
- Link: `<LinkIcon />` 🔗
- Dashboard: `<BarChart3 />` 📊

### Responsive
- Desktop: Full table view
- Mobile: Optimized cards & forms
- Tablet: Hybrid layout

---

## 🔐 SECURITY & PERMISSIONS

### RLS Policies
Semua tabel menggunakan Row Level Security:
- ✅ Read: Public (semua user bisa baca)
- ✅ Insert/Update/Delete: Authenticated users only

### Token Validation
- Token harus aktif (`is_active = true`)
- Token expired otomatis ditolak
- Link token unik dan random (32 karakter hex)

---

## 📊 DATABASE SCHEMA

### 1. `kategori_pelanggaran_keasramaan`
```sql
- id (UUID, PK)
- nama_kategori (VARCHAR)
- poin (INTEGER, negatif)
- deskripsi (TEXT)
- status (VARCHAR, default: 'aktif')
- created_at, updated_at
```

### 2. `kategori_kebaikan_keasramaan`
```sql
- id (UUID, PK)
- nama_kategori (VARCHAR)
- poin (INTEGER, positif)
- deskripsi (TEXT)
- status (VARCHAR, default: 'aktif')
- created_at, updated_at
```

### 3. `catatan_perilaku_keasramaan`
```sql
- id (UUID, PK)
- tipe (VARCHAR: 'pelanggaran' | 'kebaikan')
- tanggal (DATE)
- nis, nama_siswa (VARCHAR)
- cabang, kelas, asrama (VARCHAR)
- kepala_asrama, musyrif (VARCHAR)
- kategori_id (UUID, FK)
- nama_kategori (VARCHAR)
- poin (INTEGER)
- deskripsi_tambahan (TEXT)
- dicatat_oleh (VARCHAR)
- tahun_ajaran, semester (VARCHAR)
- created_at, updated_at
```

### 4. `token_catatan_perilaku_keasramaan`
```sql
- id (UUID, PK)
- token (VARCHAR, UNIQUE)
- nama_pemberi (VARCHAR)
- cabang, kelas, asrama, musyrif (VARCHAR, nullable)
- tipe_akses (VARCHAR: 'semua' | 'pelanggaran' | 'kebaikan')
- is_active (BOOLEAN)
- created_at, updated_at
```

---

## 🔄 INTEGRASI DENGAN SISTEM LAIN

### Data Siswa
- Menggunakan tabel `data_siswa_keasramaan` yang sudah ada
- Auto-populate: NIS, Nama, Cabang, Kelas, Asrama, Kepala Asrama, Musyrif

### Master Data
- Tahun Ajaran: `tahun_ajaran_keasramaan`
- Semester: `semester_keasramaan`
- Cabang: `cabang_keasramaan`
- Kelas: `kelas_keasramaan`
- Asrama: `asrama_keasramaan`
- Musyrif: `musyrif_keasramaan`

### User Authentication
- Menggunakan sistem auth yang sudah ada
- Nama user otomatis tercatat di field `dicatat_oleh`

---

## 📱 CARA PENGGUNAAN

### Untuk Admin/Musyrif (via Dashboard)
1. Login ke dashboard
2. Buka menu **Catatan Perilaku** > **Input Catatan**
3. Pilih filter dan santri
4. Pilih tipe dan kategori
5. Simpan

### Untuk User External (via Token Link)
1. Admin buat token di **Kelola Link Token**
2. Copy link dan kirim ke user (WhatsApp/Telegram)
3. User buka link di HP
4. Langsung input tanpa login
5. Data tersimpan dengan nama pemberi token

---

## 🎯 USE CASES

### 1. Musyrif Input Pelanggaran
- Musyrif dapat link token khusus asramanya
- Buka link di HP
- Input pelanggaran santri yang terlambat shalat
- Data tersimpan dengan nama musyrif

### 2. Kepala Asrama Input Kebaikan
- Kepala asrama dapat link token untuk semua asrama
- Input kebaikan santri yang juara lomba
- Data tersimpan dengan nama kepala asrama

### 3. Admin Lihat Rekap
- Admin buka Dashboard Rekap
- Filter berdasarkan cabang/kelas
- Lihat top 5 santri terbaik dan perlu perhatian
- Export data untuk laporan

### 4. Wali Santri (Future)
- Bisa diintegrasikan dengan laporan wali santri
- Tampilkan total poin perilaku anak
- Riwayat pelanggaran dan kebaikan

---

## 🚀 NEXT FEATURES (Roadmap)

- [ ] Integrasi dengan Laporan Wali Santri
- [ ] Notifikasi WhatsApp untuk pelanggaran berat
- [ ] Dashboard per santri (detail riwayat)
- [ ] Export PDF laporan per santri
- [ ] Grafik trend poin per bulan
- [ ] Sistem reward otomatis (misal: poin > 100 dapat hadiah)
- [ ] Approval system untuk pelanggaran berat

---

## 🐛 TROUBLESHOOTING

### Token tidak valid
- Cek apakah token masih aktif di **Kelola Link Token**
- Pastikan link tidak typo
- Coba generate token baru

### Data santri tidak muncul
- Cek filter token (cabang, kelas, asrama, musyrif)
- Pastikan data siswa sudah ada di database
- Cek status siswa aktif

### Kategori tidak muncul
- Cek status kategori di **Kelola Kategori**
- Pastikan kategori aktif
- Refresh halaman

---

## 📞 SUPPORT

Jika ada pertanyaan atau issue:
1. Cek dokumentasi ini dulu
2. Cek file SQL setup
3. Cek console browser untuk error
4. Hubungi developer

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Jalankan script SQL di Supabase
- [ ] Verifikasi 4 tabel baru sudah ada
- [ ] Cek data awal kategori sudah terisi (30 kategori)
- [ ] Test input catatan via dashboard
- [ ] Test buat token dan input via link
- [ ] Test filter dan search di riwayat
- [ ] Test dashboard rekap
- [ ] Test export CSV
- [ ] Test responsive di mobile
- [ ] Test semua CRUD kategori

---

**🎉 FITUR CATATAN PERILAKU SIAP DIGUNAKAN!**

Semua fitur sudah terintegrasi dengan sistem yang ada dan menggunakan pattern yang sama dengan Habit Tracker. Enjoy! 🚀
