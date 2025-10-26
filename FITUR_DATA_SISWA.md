# Fitur Data Siswa - Portal Keasramaan

## 📋 Overview

Halaman Data Siswa adalah fitur untuk mengelola data siswa keasramaan dengan lengkap, termasuk upload foto siswa dan relasi otomatis ke data master lainnya.

## ✨ Fitur Utama

### 1. Upload Foto Siswa (Bulat)
- Upload foto langsung ke Supabase Storage bucket `foto-siswa`
- Preview foto berbentuk bulat (rounded-full)
- Tombol hapus foto (muncul saat hover)
- Validasi: hanya gambar, maksimal 2MB
- Auto delete foto lama saat upload baru

### 2. Cascading Dropdown (Relasi Otomatis)

**Urutan Input:**
1. **Lokasi** → Pilih lokasi dulu
2. **Kelas** → Otomatis terfilter berdasarkan lokasi
3. **Rombel** → Otomatis terfilter berdasarkan kelas
4. **Asrama** → Otomatis terfilter berdasarkan lokasi + kelas
5. **Musyrif** → Otomatis terfilter berdasarkan lokasi + kelas + asrama

### 3. Validasi Data
- **Nama**: Wajib diisi
- **NIS**: Wajib diisi dan unik (tidak boleh duplikat)
- **Foto**: Opsional, max 2MB
- **Lokasi, Kelas, Rombel, Asrama, Musyrif**: Opsional

### 4. Tampilan Tabel
- Foto siswa ditampilkan bulat di kolom pertama
- NIS dengan font monospace
- Zebra-striping untuk kemudahan membaca
- Tombol Edit dan Hapus per baris

## 🎯 Cara Penggunaan

### Tambah Data Siswa Baru

1. Klik tombol **"Tambah Siswa"**
2. **Upload Foto** (opsional):
   - Klik icon upload di foto placeholder
   - Pilih file gambar (JPG/PNG, max 2MB)
   - Foto akan otomatis terupload dan muncul preview
3. Isi **Nama Lengkap** dan **NIS** (wajib)
4. Pilih **Lokasi** (jika ingin mengisi data lengkap)
5. Pilih **Kelas** (dropdown otomatis terfilter)
6. Pilih **Rombel** (dropdown otomatis terfilter)
7. Pilih **Asrama** (dropdown otomatis terfilter)
8. Pilih **Musyrif** (dropdown otomatis terfilter)
9. Klik **"Simpan"**

### Edit Data Siswa

1. Klik tombol **Edit** (icon pensil) pada baris siswa
2. Modal akan terbuka dengan data siswa yang sudah terisi
3. Ubah data yang diperlukan
4. Untuk ganti foto:
   - Hover pada foto → klik tombol X untuk hapus
   - Klik icon upload untuk upload foto baru
5. Klik **"Update"**

### Hapus Data Siswa

1. Klik tombol **Hapus** (icon tempat sampah)
2. Konfirmasi penghapusan
3. Data siswa dan foto akan terhapus dari database dan storage

## 🔗 Relasi dengan Tabel Lain

Data Siswa berelasi dengan:
- `lokasi_keasramaan` → Field: lokasi
- `kelas_keasramaan` → Field: kelas
- `rombel_keasramaan` → Field: rombel (filtered by kelas)
- `asrama_keasramaan` → Field: asrama (filtered by lokasi + kelas)
- `musyrif_keasramaan` → Field: musyrif (filtered by lokasi + kelas + asrama)

## 📸 Storage Bucket

**Bucket Name**: `foto-siswa`

**Policies Required:**
- Allow public upload
- Allow public read
- Allow public delete
- Allow public update

**File Naming**: `foto-[timestamp].[extension]`

Contoh: `foto-1761485974153.jpg`

## 💡 Tips

1. **Isi Data Master Dulu**: Pastikan sudah ada data Lokasi, Kelas, Rombel, Asrama, dan Musyrif sebelum input siswa
2. **NIS Harus Unik**: Sistem akan error jika NIS sudah digunakan siswa lain
3. **Foto Opsional**: Siswa bisa disimpan tanpa foto, nanti bisa diupload kemudian via Edit
4. **Cascading Reset**: Jika ganti Lokasi, semua pilihan di bawahnya (Kelas, Rombel, Asrama, Musyrif) akan reset otomatis

## 🐛 Troubleshooting

**Error: "Bucket not found"**
- Pastikan bucket `foto-siswa` sudah dibuat di Supabase Storage
- Pastikan bucket di-set sebagai Public

**Error: "new row violates row-level security policy"**
- Pastikan 4 storage policies sudah dibuat (upload, read, delete, update)

**Error: "duplicate key value violates unique constraint"**
- NIS sudah digunakan siswa lain
- Gunakan NIS yang berbeda

**Foto tidak muncul**
- Cek apakah bucket `foto-siswa` public
- Cek apakah policy SELECT sudah dibuat
- Refresh browser dengan Ctrl+Shift+R

**Dropdown kosong**
- Pastikan data master (Lokasi, Kelas, dll) sudah diisi
- Pastikan status data master adalah "aktif"
- Cek relasi: Asrama harus punya lokasi dan kelas yang sesuai

---

**Selamat menggunakan fitur Data Siswa!** 🎓
