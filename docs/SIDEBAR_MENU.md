# 📋 Struktur Menu Navigasi Portal Keasramaan

## ✅ Fitur Baru

### 1. **Collapsible Sidebar**
- Toggle button di kanan atas sidebar
- Sidebar bisa di-collapse menjadi icon-only mode
- Smooth transition animation
- Tooltip muncul saat collapsed

### 2. **Struktur Menu Baru**

```
🏠 Overview
├── Dashboard
├── Dashboard Habit Tracker (Coming Soon)
└── Dashboard Jurnal Musyrif (Coming Soon)

📂 Manajemen Data
├── Sekolah
│   ├── Identitas Sekolah
│   ├── Tahun Ajaran
│   └── Semester
├── Tempat
│   ├── Lokasi
│   ├── Asrama
│   ├── Kelas
│   └── Rombel
├── Pengurus
│   ├── Kepala Asrama
│   └── Musyrif
└── Siswa
    └── Input Data Siswa

📖 Habit Tracker
├── Input Formulir
└── Kelola Link Musyrif
```

## 🎨 Tampilan

### Normal Mode (Expanded)
- Width: 288px (w-72)
- Menampilkan logo + text
- Menampilkan label menu lengkap
- Section headers (Overview, Manajemen Data)
- Coming Soon badges untuk fitur yang belum tersedia

### Collapsed Mode
- Width: 80px (w-20)
- Hanya menampilkan logo
- Hanya menampilkan icon menu
- Tooltip muncul saat hover
- Section headers disembunyikan

## 🎯 Halaman Manajemen Data

### 1. Manajemen Data Sekolah
**URL:** `/manajemen-data/sekolah`

Card menu untuk:
- Identitas Sekolah (Blue)
- Tahun Ajaran (Green)
- Semester (Purple)

### 2. Manajemen Data Tempat
**URL:** `/manajemen-data/tempat`

Card menu untuk:
- Lokasi (Red)
- Asrama (Orange)
- Kelas (Teal)
- Rombel (Indigo)

### 3. Manajemen Data Pengurus
**URL:** `/manajemen-data/pengurus`

Card menu untuk:
- Kepala Asrama (Amber)
- Musyrif (Cyan)

## 🚀 Cara Menggunakan

### Toggle Sidebar
1. Klik tombol toggle di kanan atas sidebar
2. Sidebar akan collapse/expand dengan smooth animation
3. Saat collapsed, hover pada icon untuk melihat tooltip

### Navigasi Menu
1. **Dashboard** - Langsung ke halaman dashboard
2. **Manajemen Data** - Klik untuk expand/collapse submenu
3. **Submenu** - Klik untuk ke halaman manajemen kategori
4. **Card Menu** - Klik card untuk ke halaman spesifik

## 📱 Responsive Design

- Desktop: Full sidebar dengan semua fitur
- Tablet: Sidebar bisa di-collapse untuk space lebih
- Mobile: (Akan dikembangkan - hamburger menu)

## 🎨 Color Scheme

### Kategori Sekolah
- Identitas Sekolah: Blue (from-blue-500 to-blue-600)
- Tahun Ajaran: Green (from-green-500 to-green-600)
- Semester: Purple (from-purple-500 to-purple-600)

### Kategori Tempat
- Lokasi: Red (from-red-500 to-red-600)
- Asrama: Orange (from-orange-500 to-orange-600)
- Kelas: Teal (from-teal-500 to-teal-600)
- Rombel: Indigo (from-indigo-500 to-indigo-600)

### Kategori Pengurus
- Kepala Asrama: Amber (from-amber-500 to-amber-600)
- Musyrif: Cyan (from-cyan-500 to-cyan-600)

## ✨ Animasi & Interaksi

1. **Sidebar Toggle**
   - Smooth width transition (300ms)
   - Icon rotation animation

2. **Menu Hover**
   - Background color change
   - Subtle scale effect

3. **Card Hover**
   - Shadow elevation
   - Icon scale up (110%)
   - Arrow slide right
   - Title color change to blue

4. **Active State**
   - Gradient background (blue)
   - White text
   - Shadow effect

## 🔮 Coming Soon Features

1. **Dashboard Habit Tracker**
   - Statistik habit tracker
   - Grafik progress santri
   - Laporan bulanan

2. **Dashboard Jurnal Musyrif**
   - Jurnal harian musyrif
   - Catatan penting
   - Timeline aktivitas

## 📝 Notes

- Logo sekolah otomatis muncul di sidebar
- Fallback ke icon GraduationCap jika logo tidak ada
- Error handling untuk koneksi database
- Smooth transitions untuk semua interaksi
- Tooltip untuk collapsed mode
