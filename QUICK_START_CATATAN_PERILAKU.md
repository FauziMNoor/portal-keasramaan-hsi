# 🚀 QUICK START - Catatan Perilaku

## Setup dalam 5 Menit!

### Step 1: Setup Database (2 menit)
1. Buka **Supabase Dashboard** > **SQL Editor**
2. Copy semua isi file `supabase/SETUP_CATATAN_PERILAKU.sql`
3. Paste dan klik **Run**
4. Tunggu sampai selesai (✅ Success)

### Step 2: Verifikasi (1 menit)
1. Buka **Table Editor** di Supabase
2. Cek 4 tabel baru:
   - ✅ `kategori_pelanggaran_keasramaan` (15 data)
   - ✅ `kategori_kebaikan_keasramaan` (15 data)
   - ✅ `catatan_perilaku_keasramaan` (kosong)
   - ✅ `token_catatan_perilaku_keasramaan` (kosong)

### Step 3: Test Fitur (2 menit)
1. Refresh aplikasi Next.js
2. Login ke dashboard
3. Lihat menu baru **"Catatan Perilaku"** di sidebar
4. Klik **Input Catatan** dan coba input
5. Klik **Kelola Link Token** dan buat token
6. Copy link token dan buka di tab baru (test form)

---

## 🎯 Fitur Utama

### 1. Input Catatan (Admin)
**Path:** `/catatan-perilaku/input`

Langkah cepat:
1. Pilih tanggal, tahun ajaran, semester
2. Filter: cabang, kelas (wajib)
3. Pilih tab: Pelanggaran atau Kebaikan
4. Pilih santri
5. Pilih kategori (poin otomatis muncul)
6. Simpan ✅

### 2. Kelola Link Token
**Path:** `/catatan-perilaku/manage-link`

Langkah cepat:
1. Klik "Buat Token Baru"
2. Isi nama pemberi (misal: Musyrif Ahmad)
3. Set filter (opsional): cabang, kelas, asrama, musyrif
4. Pilih tipe akses: Semua / Pelanggaran / Kebaikan
5. Simpan
6. Copy link dan kirim via WhatsApp

### 3. Form via Token (Mobile)
**Path:** `/catatan-perilaku/form/[token]`

User yang dapat link:
1. Buka link di HP
2. Pilih tanggal, tahun ajaran, semester
3. Pilih santri (sudah terfilter otomatis)
4. Pilih kategori
5. Simpan ✅

### 4. Riwayat Catatan
**Path:** `/catatan-perilaku/riwayat`

Fitur:
- Lihat semua catatan
- Filter: search, tipe, tanggal
- Stats: total pelanggaran, kebaikan, poin
- Export CSV
- Hapus catatan

### 5. Dashboard Rekap
**Path:** `/catatan-perilaku/dashboard`

Fitur:
- Filter: cabang, kelas, asrama
- Top 5 santri terbaik
- Top 5 perlu perhatian
- Ranking semua santri
- Total poin per santri

### 6. Kelola Kategori
**Path:** `/catatan-perilaku/kategori`

Fitur:
- CRUD kategori pelanggaran
- CRUD kategori kebaikan
- Set poin dan deskripsi
- Tab switching

---

## 💡 Tips Penggunaan

### Untuk Musyrif
1. Minta admin buatkan token khusus asrama Anda
2. Simpan link di bookmark HP
3. Setiap ada pelanggaran/kebaikan, langsung input via HP
4. Tidak perlu login!

### Untuk Kepala Asrama
1. Minta token dengan akses semua asrama di cabang Anda
2. Monitor dashboard rekap setiap minggu
3. Export CSV untuk laporan bulanan

### Untuk Admin
1. Buat token untuk semua musyrif
2. Monitor riwayat catatan
3. Lihat dashboard untuk identifikasi santri perlu perhatian
4. Kelola kategori sesuai kebutuhan

---

## 🎨 Kategori Default

### Pelanggaran (15 kategori)
- Terlambat Shalat Berjamaah: -5
- Tidak Mengikuti Shalat Berjamaah: -10
- Keluar Asrama Tanpa Izin: -15
- Berkelahi: -20
- Merokok: -25
- Mencuri: -30
- Dan lainnya...

### Kebaikan (15 kategori)
- Adzan: +5
- Membantu Teman: +5
- Shalat Dhuha Rutin: +5
- Imam Shalat: +10
- Hafalan Quran Bertambah: +10
- Juara Lomba: +15
- Dan lainnya...

Anda bisa tambah/edit kategori di menu **Kelola Kategori**!

---

## 🔥 Use Case Cepat

### Scenario 1: Input Pelanggaran
```
Musyrif Ahmad melihat santri Budi terlambat shalat subuh.

1. Buka link token di HP
2. Pilih tanggal hari ini
3. Pilih santri: Budi
4. Tab: Pelanggaran
5. Kategori: Terlambat Shalat Berjamaah (-5 poin)
6. Deskripsi: "Terlambat 10 menit"
7. Simpan ✅

Poin Budi: -5
```

### Scenario 2: Input Kebaikan
```
Kepala Asrama melihat santri Andi jadi imam shalat maghrib.

1. Buka link token di HP
2. Pilih tanggal hari ini
3. Pilih santri: Andi
4. Tab: Kebaikan
5. Kategori: Imam Shalat Berjamaah (+10 poin)
6. Simpan ✅

Poin Andi: +10
```

### Scenario 3: Lihat Rekap
```
Admin ingin lihat santri terbaik bulan ini.

1. Buka Dashboard Rekap
2. Filter: Cabang Pusat, Kelas 7
3. Lihat Top 5 Terbaik
4. Export CSV untuk laporan

Top 1: Andi (+85 poin)
Top 2: Budi (+72 poin)
...
```

---

## ❓ FAQ

**Q: Apakah token bisa digunakan berkali-kali?**
A: Ya! Token bisa digunakan berkali-kali selama masih aktif.

**Q: Bagaimana cara nonaktifkan token?**
A: Buka Kelola Link Token > Klik icon mata (👁️) > Token jadi nonaktif.

**Q: Apakah bisa edit catatan yang sudah disimpan?**
A: Saat ini hanya bisa hapus. Edit akan ditambahkan di versi berikutnya.

**Q: Apakah poin bisa negatif?**
A: Ya! Jika pelanggaran lebih banyak dari kebaikan, total poin bisa negatif.

**Q: Bagaimana cara tambah kategori baru?**
A: Buka Kelola Kategori > Klik "Tambah Kategori" > Isi form > Simpan.

**Q: Apakah wali santri bisa lihat poin anaknya?**
A: Belum. Fitur ini akan ditambahkan di versi berikutnya (integrasi dengan laporan wali santri).

---

## 🎉 Selesai!

Fitur Catatan Perilaku sudah siap digunakan. Selamat mencoba! 🚀

**Butuh bantuan?** Baca dokumentasi lengkap di `FITUR_CATATAN_PERILAKU.md`
