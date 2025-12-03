# Fitur Link Formulir untuk Musyrif

## 📱 Overview

Fitur ini memungkinkan musyrif untuk mengisi formulir Habit Tracker melalui link khusus yang bisa dibuka di HP tanpa perlu login ke dashboard utama.

## ✨ Fitur Utama

### 1. Generate Link Unik
- Setiap musyrif mendapat link unik dengan token
- Link bisa diaktifkan/nonaktifkan kapan saja
- Token tersimpan aman di database

### 2. Form Mobile-Friendly
- Tampilan portrait untuk HP
- Card per siswa untuk kemudahan input
- Sticky button submit di bawah
- Responsive untuk semua ukuran layar

### 3. Auto-Filter Data
- Siswa otomatis terfilter berdasarkan asrama musyrif
- Data musyrif, lokasi, kelas, asrama otomatis terisi
- Musyrif hanya perlu isi tanggal, tahun ajaran, semester

### 4. Bulk Submit
- Sekali klik simpan semua data siswa
- Progress indicator saat menyimpan
- Notifikasi sukses/gagal

## 🚀 Cara Setup

### Step 1: Buat Tabel Token di Supabase

1. Login ke Supabase SQL Editor
2. Jalankan script dari file `SETUP_TOKEN_MUSYRIF.sql`
3. Tabel `token_musyrif_keasramaan` akan dibuat

### Step 2: Generate Token untuk Musyrif

1. Buka dashboard → **Habit Tracker** → **Kelola Link Musyrif**
2. Klik tombol **"Generate Semua Token"**
3. Sistem akan otomatis generate token untuk semua musyrif aktif
4. Link akan muncul di tabel

### Step 3: Share Link ke Musyrif

1. Copy link dari kolom "Link Formulir"
2. Kirim via WhatsApp/Telegram ke musyrif
3. Musyrif buka link di HP dan langsung bisa input

## 📋 Cara Penggunaan (Musyrif)

### Di HP:

1. **Buka link** yang dikirim admin
2. **Lihat info** musyrif, lokasi, kelas, asrama (otomatis terisi)
3. **Pilih**:
   - Tanggal (hari ini)
   - Tahun Ajaran
   - Semester
4. **Scroll ke bawah**, akan muncul card untuk setiap siswa
5. **Isi nilai** untuk setiap aspek (dropdown 1-3, 1-4, atau 1-5)
6. **Klik "Simpan X Data"** di bawah
7. **Selesai!** ✅

### Kategori Penilaian:

#### 🕌 Ubudiyah (8 aspek)
- Shalat Fardhu Berjamaah (1-3)
- Tata Cara Shalat (1-3)
- Qiyamul Lail (1-3)
- Shalat Sunnah (1-3)
- Puasa Sunnah (1-5)
- Tata Cara Wudhu (1-3)
- Sedekah (1-4)
- Dzikir Pagi Petang (1-4)

#### 💚 Akhlaq (4 aspek)
- Etika Tutur Kata (1-3)
- Etika Bergaul (1-3)
- Etika Berpakaian (1-3)
- Adab Sehari-hari (1-3)

#### ⏰ Kedisiplinan (6 aspek)
- Waktu Tidur (1-4)
- Piket Kamar (1-3)
- Halaqah Tahfidz (1-3)
- Perizinan (1-3)
- Belajar Malam (1-4)
- Berangkat Masjid (1-4)

#### ✨ Kebersihan & Kerapian (3 aspek)
- Kebersihan Tubuh (1-3)
- Kamar (1-3)
- Ranjang & Almari (1-3)

## 🔐 Keamanan

- **Token unik** untuk setiap musyrif
- **Validasi token** sebelum akses form
- **Filter otomatis** - musyrif hanya lihat siswa di asramanya
- **Bisa dinonaktifkan** kapan saja oleh admin

## 🎯 Keuntungan

### Untuk Admin:
✅ Tidak perlu buat akun untuk setiap musyrif
✅ Kontrol penuh (aktif/nonaktif link)
✅ Data terpusat di satu database
✅ Mudah monitoring siapa yang sudah input

### Untuk Musyrif:
✅ Tidak perlu login/password
✅ Bisa akses dari HP kapan saja
✅ Interface simple dan mudah
✅ Cepat - hanya isi dropdown
✅ Bulk submit - tidak perlu save satu-satu

## 📱 Tampilan Mobile

Form dioptimalkan untuk HP dengan:
- **Card per siswa** - mudah fokus per anak
- **Grid 2 kolom** - maksimalkan layar HP
- **Sticky button** - tombol simpan selalu terlihat
- **Color coding** - setiap kategori punya warna berbeda
- **Compact labels** - text kecil tapi jelas
- **Touch-friendly** - dropdown besar untuk jari

## 🔄 Workflow

```
Admin Generate Link
      ↓
Share Link ke Musyrif (WhatsApp/Telegram)
      ↓
Musyrif Buka Link di HP
      ↓
Isi Tanggal, Tahun Ajaran, Semester
      ↓
Scroll & Isi Nilai untuk Setiap Siswa
      ↓
Klik Simpan
      ↓
Data Masuk ke Database ✅
```

## 💡 Tips

1. **Generate token di awal semester** untuk semua musyrif
2. **Share link via grup WhatsApp** untuk efisiensi
3. **Nonaktifkan link** setelah periode input selesai
4. **Reaktifkan** saat perlu input lagi
5. **Monitor** dari dashboard siapa yang sudah input

## 🐛 Troubleshooting

**Link tidak bisa dibuka:**
- Cek apakah link masih aktif di dashboard
- Pastikan token belum expired
- Coba generate ulang token

**Siswa tidak muncul:**
- Pastikan data siswa sudah diinput
- Cek filter lokasi, kelas, asrama, musyrif sudah benar
- Pastikan siswa punya musyrif yang sesuai

**Gagal menyimpan:**
- Cek koneksi internet
- Pastikan tanggal, tahun ajaran, semester sudah diisi
- Coba refresh halaman dan isi ulang

---

**Fitur ini membuat input Habit Tracker jadi super mudah dan cepat!** 🚀📱
