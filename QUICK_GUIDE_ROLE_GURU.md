# Quick Guide: Role Guru

## 🎯 Apa itu Role Guru?

Role **Guru** adalah role baru yang menggantikan role "User" dengan akses terbatas ke fitur-fitur tertentu dalam Portal Keasramaan. Role ini dirancang khusus untuk guru yang perlu mengakses data dan input catatan perilaku siswa, tetapi tidak memerlukan akses ke manajemen data master.

## 📋 Akses Menu Role Guru

### ✅ Yang Bisa Diakses:

#### 1. Dashboard (3 Dashboard)
- **Dashboard Data** - Lihat statistik umum
- **Dashboard Habit Tracker** - Lihat statistik habit tracker
- **Dashboard Catatan Perilaku** - Lihat statistik catatan perilaku

#### 2. Habit Tracker
- **Rekap Habit Tracker** - Lihat dan export rekap habit tracker siswa

#### 3. Catatan Perilaku
- **Input Catatan** - Input catatan perilaku siswa (positif/negatif)
- **Riwayat Catatan** - Lihat riwayat catatan perilaku yang sudah diinput

### ❌ Yang Tidak Bisa Diakses:

- Semua menu **Manajemen Data** (Sekolah, Tempat, Pengurus, Siswa, Users)
- **Habit Tracker**: Input Formulir, Kelola Link, Laporan Wali Santri, Indikator
- **Catatan Perilaku**: Kelola Link Token, Kelola Kategori

## 🚀 Cara Membuat User dengan Role Guru

### Untuk Admin:

1. Login sebagai **Admin**
2. Buka menu **Users** di sidebar
3. Klik tombol **"Tambah User"**
4. Isi form:
   - Email: email guru
   - Password: password untuk login
   - Nama Lengkap: nama lengkap guru
   - **Role: Pilih "Guru"** (sudah default)
   - Cabang: pilih cabang (opsional)
   - Asrama: pilih asrama (opsional)
   - No. Telepon: nomor telepon (opsional)
   - Status: Aktif
5. Klik **"Simpan"**

## 🔐 Cara Login sebagai Guru

1. Buka halaman login: `http://localhost:3000/login`
2. Masukkan **email** dan **password** yang sudah dibuat
3. Klik **"Login"**
4. Anda akan diarahkan ke Dashboard Data
5. Menu sidebar akan otomatis menyesuaikan dengan akses role Guru

## 📱 Tampilan Menu untuk Guru

Setelah login sebagai Guru, sidebar akan menampilkan:

```
📊 Overview
├── Dashboard Data
├── Dashboard Habit Tracker
└── Dashboard Catatan Perilaku

📚 Habit Tracker
└── Rekap Habit Tracker

📝 Catatan Perilaku
├── Input Catatan
└── Riwayat Catatan
```

## 🔄 Migration User Lama

Jika sudah ada user dengan role "user" di sistem lama:

### Opsi 1: Manual Update (Untuk Admin)
1. Login sebagai Admin
2. Buka menu **Users**
3. Edit user yang role-nya "user"
4. Ubah role menjadi **"Guru"**
5. Klik **"Update"**

### Opsi 2: SQL Migration (Untuk Developer)
Jalankan file: `MIGRATION_USER_TO_GURU.sql`

```sql
UPDATE users_keasramaan 
SET role = 'guru' 
WHERE role = 'user';
```

## 💡 Tips Penggunaan

### Untuk Guru:
1. **Input Catatan Perilaku**
   - Gunakan menu "Input Catatan" untuk mencatat perilaku siswa
   - Pilih kategori yang sesuai (positif/negatif)
   - Isi deskripsi dengan detail

2. **Lihat Riwayat**
   - Gunakan menu "Riwayat Catatan" untuk melihat catatan yang sudah diinput
   - Gunakan filter untuk mencari catatan tertentu

3. **Rekap Habit Tracker**
   - Gunakan menu "Rekap Habit Tracker" untuk melihat progress siswa
   - Export data jika diperlukan untuk laporan

### Untuk Admin:
1. **Manajemen User Guru**
   - Buat user guru sesuai kebutuhan
   - Set cabang dan asrama untuk filter data
   - Nonaktifkan user jika sudah tidak diperlukan

2. **Monitoring Akses**
   - Pastikan guru hanya mengakses menu yang diizinkan
   - Jika ada masalah akses, cek role user di menu Users

## ❓ FAQ

### Q: Kenapa saya tidak bisa akses menu Manajemen Data?
**A:** Role Guru memang tidak memiliki akses ke menu Manajemen Data. Jika Anda perlu akses tersebut, hubungi Admin untuk mengubah role Anda.

### Q: Bagaimana cara mengubah password?
**A:** Saat ini belum ada fitur ubah password sendiri. Hubungi Admin untuk reset password.

### Q: Apakah Guru bisa melihat data semua cabang?
**A:** Tergantung setting cabang di user profile. Jika cabang diset, Guru hanya bisa melihat data cabang tersebut.

### Q: Kenapa menu saya berbeda dengan teman saya?
**A:** Menu yang tampil disesuaikan dengan role user. Pastikan role Anda sudah benar di menu Users.

## 🆘 Troubleshooting

### Problem: Menu tidak sesuai setelah login
**Solution:**
1. Logout dan login kembali
2. Clear browser cache
3. Cek role di menu Users (untuk Admin)

### Problem: Tidak bisa akses halaman tertentu
**Solution:**
1. Pastikan role Anda adalah "Guru"
2. Cek apakah halaman tersebut memang diizinkan untuk role Guru
3. Hubungi Admin jika masih bermasalah

### Problem: Error saat input catatan
**Solution:**
1. Pastikan semua field required sudah diisi
2. Cek koneksi internet
3. Refresh halaman dan coba lagi

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Hubungi Admin sistem
2. Atau hubungi tim IT support

---

**Terakhir diupdate:** 6 November 2025
