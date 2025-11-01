# 📱 Fitur Laporan Wali Santri

## Overview
Fitur dashboard khusus untuk wali santri melihat perkembangan habit tracker anak mereka tanpa perlu login. Dioptimalkan untuk tampilan mobile.

## 🎯 Fitur Utama

### 1. **Halaman Admin - Kelola Token**
**URL:** `/habit-tracker/laporan`

**Fitur:**
- Generate token unik untuk wali santri
- Input nama wali dan nomor telepon
- Copy link untuk dikirim via WhatsApp
- Toggle aktif/nonaktif token
- Tabel daftar semua token

### 2. **Halaman Input NIS**
**URL:** `/habit-tracker/laporan/[token]`

**Fitur:**
- Validasi token aktif
- Form input NIS santri
- Validasi NIS di database
- Design mobile-first dengan gradient background
- Logo sekolah dinamis

### 3. **Dashboard Wali Santri**
**URL:** `/habit-tracker/laporan/[token]/[nis]`

**Fitur:**
- **Header Profile:**
  - Foto santri (bulat dengan badge online)
  - Nama, kelas, asrama
  - Tombol edit (future feature)

- **Period Selector:**
  - Toggle 7 hari / 30 hari
  - Smooth transition

- **4 Card Statistik:**
  1. 🕌 Ubudiyah (max 28)
  2. 💚 Akhlaq (max 12)
  3. ⏰ Kedisiplinan (max 21)
  4. ✨ Kebersihan & Kerapian (max 9)
  
  Setiap card menampilkan:
  - Icon kategori
  - Total nilai / max nilai
  - Trend persentase vs periode sebelumnya
  - Progress bar dengan gradient

- **Chart Perkembangan:**
  - Bar chart dengan gradient
  - Menampilkan trend per tanggal
  - Responsive untuk mobile

## 🎨 Design Highlights

### Mobile-First Design
- Optimized untuk layar HP (320px - 768px)
- Touch-friendly buttons (min 44px)
- Smooth scrolling
- Gradient backgrounds yang menarik

### Color Scheme
- Primary: Purple gradient (#8B5CF6 → #EC4899)
- Ubudiyah: Blue (#3B82F6)
- Akhlaq: Green (#10B981)
- Kedisiplinan: Orange (#F59E0B)
- Kebersihan: Purple (#A855F7)

### Typography
- Headers: Bold, 2xl-3xl
- Body: Regular, sm-base
- Numbers: Bold, 3xl untuk emphasis

## 📊 Database

### Tabel: `token_wali_santri_keasramaan`
```sql
CREATE TABLE token_wali_santri_keasramaan (
    id UUID PRIMARY KEY,
    nama_wali TEXT NOT NULL,
    no_telepon TEXT,
    token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Setup

### 1. Jalankan SQL
```bash
# Di Supabase SQL Editor
psql -f SETUP_TOKEN_WALI_SANTRI.sql
```

### 2. Generate Token
1. Login sebagai admin
2. Buka menu: Habit Tracker → Laporan Wali Santri
3. Klik "Buat Token Baru"
4. Input nama wali dan nomor telepon
5. Copy link dan kirim ke wali santri

### 3. Wali Santri Akses
1. Buka link di HP
2. Input NIS anak
3. Lihat dashboard perkembangan

## 📱 User Flow

```
Admin Generate Token
    ↓
Copy Link → Send via WhatsApp
    ↓
Wali Santri Buka Link
    ↓
Input NIS Santri
    ↓
Dashboard Laporan (Mobile-Optimized)
```

## ✨ Features Highlights

### Security
- ✅ Token-based access (no login required)
- ✅ NIS validation
- ✅ Token can be deactivated
- ✅ One token can access multiple children (if same wali)

### UX
- ✅ Mobile-first responsive design
- ✅ Smooth animations & transitions
- ✅ Touch-friendly interface
- ✅ Clear visual hierarchy
- ✅ Gradient backgrounds
- ✅ Progress indicators

### Performance
- ✅ Optimized queries
- ✅ Lazy loading images
- ✅ Efficient data aggregation
- ✅ Client-side caching

## 🎯 Future Enhancements

1. **Export PDF** - Download laporan sebagai PDF
2. **Notifikasi** - Push notification untuk update baru
3. **Perbandingan** - Compare dengan rata-rata kelas
4. **Detail View** - Drill-down ke sub-indikator
5. **Multi-Child** - Dashboard untuk beberapa anak sekaligus
6. **Historical Data** - View data semester sebelumnya

## 📞 Support

Jika wali santri mengalami kesulitan:
1. Pastikan link masih aktif
2. Pastikan NIS benar
3. Hubungi admin sekolah
4. Check koneksi internet

---

**Developed with ❤️ for HSI Boarding School**
