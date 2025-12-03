# Instruksi Lengkap - Portal Keasramaan HSI Boarding School

## 📋 Persiapan

### 1. Setup Database di Supabase

1. Login ke dashboard Supabase Anda di https://sirriyah.smaithsi.sch.id
2. Buka **SQL Editor**
3. Copy semua isi file `SETUP_DATABASE.sql`
4. Paste dan jalankan di SQL Editor
5. Pastikan semua 9 tabel berhasil dibuat

### 2. Setup Storage untuk Upload Logo

1. Ikuti panduan lengkap di file `SETUP_STORAGE.md`
2. Buat bucket bernama `logos` (public)
3. Setup storage policies untuk upload, read, dan delete
4. Verifikasi dengan upload logo di halaman Identitas Sekolah

### 3. Verifikasi Koneksi

File `.env.local` sudah berisi:
```
NEXT_PUBLIC_SUPABASE_URL=https://sirriyah.smaithsi.sch.id
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Pastikan kredensial ini benar dan aktif.

## 🚀 Menjalankan Aplikasi

### Development Mode

```bash
cd portal-keasramaan
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

## 📱 Fitur Aplikasi

### Menu Data Sekolah
- **Identitas Sekolah**: Kelola identitas sekolah (logo, nama, kepala sekolah, alamat, kontak)
- **Tahun Ajaran**: Kelola tahun ajaran (contoh: 2024/2025)
- **Semester**: Kelola semester (Ganjil/Genap dengan angka)

### Menu Data Tempat
- **Lokasi**: Kelola lokasi gedung/area
- **Asrama**: Kelola data asrama dengan dropdown kelas dan lokasi
- **Kelas**: Kelola data kelas
- **Rombel**: Kelola rombongan belajar dengan dropdown kelas

### Menu Data Pengurus
- **Kepala Asrama**: Kelola data kepala asrama dengan dropdown lokasi
- **Musyrif**: Kelola data musyrif dengan cascading dropdown (Lokasi → Kelas → Asrama)

## 🎨 Desain UI

- **Tema**: Biru modern dengan gradasi
- **Layout**: Sidebar kiri + konten utama kanan
- **Komponen**: Rounded corners, shadow, smooth transitions
- **Icons**: Lucide React (informatif dan modern)
- **Tabel**: Zebra-striping untuk kemudahan membaca
- **Modal**: Form popup yang elegan

## 🔧 Teknologi

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## 📝 Operasi CRUD

Setiap halaman memiliki fitur lengkap:

1. **Create**: Tombol "Tambah Data" → Form modal → Simpan
2. **Read**: Tabel data dengan pagination otomatis
3. **Update**: Tombol edit (icon pensil) → Form modal → Update
4. **Delete**: Tombol hapus (icon tempat sampah) → Konfirmasi → Hapus

## 🎯 Tips Penggunaan

1. **Mulai dari Identitas Sekolah**: Isi data identitas sekolah terlebih dahulu
2. **Data Master**: Isi tahun ajaran, semester, lokasi, dan kelas
3. **Data Berelasi**: Isi asrama (pilih lokasi & kelas), rombel (pilih kelas)
4. **Data Pengurus**: Isi kepala asrama (pilih lokasi) dan musyrif (cascading: lokasi → kelas → asrama)

### Urutan Input yang Disarankan:
1. Identitas Sekolah
2. Tahun Ajaran & Semester
3. Lokasi
4. Kelas
5. Asrama (butuh Lokasi & Kelas)
6. Rombel (butuh Kelas)
7. Kepala Asrama (butuh Lokasi)
8. Musyrif (butuh Lokasi, Kelas, Asrama)

## 🐛 Troubleshooting

### Koneksi Database Gagal
- Cek kredensial di `.env.local`
- Pastikan Supabase instance aktif
- Verifikasi tabel sudah dibuat

### Error saat Build
```bash
npm install
npm run build
```

### Port 3000 Sudah Digunakan
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

## 📞 Support

Jika ada masalah atau pertanyaan, pastikan:
1. Semua dependencies terinstall (`npm install`)
2. Database tabel sudah dibuat
3. Kredensial Supabase benar
4. Node.js versi 18 atau lebih baru

---

**Selamat menggunakan Portal Keasramaan HSI Boarding School! 🎓**
