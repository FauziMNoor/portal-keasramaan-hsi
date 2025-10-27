# 📊 Dashboard Dinamis Portal Keasramaan

## ✅ Fitur Dashboard

Dashboard ini menampilkan data real-time dari database dengan 3 lapisan utama sesuai spesifikasi.

## 🧱 Struktur Dashboard

### 1️⃣ Header Utama - Identitas Sekolah

**Sumber Data:** Tabel `identitas_sekolah_keasramaan`

**Tampilan:**
- Logo sekolah (kiri atas)
- Nama sekolah (judul besar, bold)
- Nama kepala sekolah (subjudul)
- Informasi kontak:
  - 📍 Alamat
  - 📞 No. Telepon
  - ✉️ Email
  - 🌐 Website

**Desain:**
- Background: Gradient blue (from-blue-600 to-blue-700)
- Text: White
- Logo: Container putih dengan shadow
- Layout: Flexbox dengan logo di kiri

---

### 2️⃣ Statistik Ringkas - Summary Cards

**6 Card Statistik:**

| Card | Icon | Data Source | Warna |
|------|------|-------------|-------|
| 👥 Total Santri | Users | `data_siswa_keasramaan` | Blue |
| 🏫 Total Asrama | Building2 | `asrama_keasramaan` | Indigo |
| 🧑‍🏫 Total Musyrif | UserCog | `musyrif_keasramaan` | Purple |
| 🎓 Total Kelas | GraduationCap | `kelas_keasramaan` | Green |
| 📍 Total Lokasi | MapPin | `lokasi_keasramaan` | Orange |
| 🛡️ Kepala Asrama | Shield | `kepala_asrama_keasramaan` | Amber |

**Fitur Card:**
- Gradient background
- Icon di kiri, angka besar di kanan
- Hover effect: scale up + shadow
- Responsive grid (2 cols mobile, 3 tablet, 6 desktop)

---

### 3️⃣ Panel Data Dinamis & Relasional

#### A. Distribusi Santri per Lokasi

**Sumber Data:** Agregasi dari `data_siswa_keasramaan` group by `lokasi`

**Tampilan:**
- Progress bar untuk setiap lokasi
- Persentase otomatis berdasarkan total santri
- Angka jumlah santri di kanan
- Warna: Blue gradient

**Contoh:**
```
Sukabumi    ████████████████░░░░  32
Bekasi      ████████████░░░░░░░░  24
Purworejo   ██████████░░░░░░░░░░  20
```

#### B. Struktur Pengurus Asrama

**Sumber Data:** Join dari:
- `lokasi_keasramaan`
- `kepala_asrama_keasramaan`
- `asrama_keasramaan` (count)
- `musyrif_keasramaan` (count)
- `data_siswa_keasramaan` (count)

**Tampilan:** Tabel dengan kolom:
- Lokasi
- Kepala Asrama (nama)
- Jumlah Asrama (badge indigo)
- Jumlah Musyrif (badge purple)
- Jumlah Santri (badge blue)

**Fitur:**
- Hover effect: background blue-50
- Badge dengan warna berbeda untuk setiap kolom
- Responsive table dengan scroll horizontal

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Blue: `from-blue-500 to-blue-600`
- Indigo: `from-indigo-500 to-indigo-600`
- Purple: `from-purple-500 to-purple-600`
- Green: `from-green-500 to-green-600`
- Orange: `from-orange-500 to-orange-600`
- Amber: `from-amber-500 to-amber-600`

**Background:**
- Main: `bg-slate-50`
- Card: `bg-white`
- Header: `bg-gradient-to-r from-blue-600 to-blue-700`

### Typography

**Font Family:** Inter, Poppins (system default)

**Sizes:**
- H1 (Nama Sekolah): `text-4xl font-bold`
- H2 (Section Title): `text-xl font-bold`
- Subtitle: `text-xl text-blue-100`
- Body: `text-sm` / `text-base`
- Stats Number: `text-3xl font-bold`

### Spacing

- Container: `max-w-7xl mx-auto`
- Section Gap: `space-y-6`
- Card Padding: `p-6` / `p-8`
- Grid Gap: `gap-4` / `gap-6`

---

## 🔄 Data Flow

### 1. Fetch All Data (Parallel)

```typescript
fetchAllData() {
  Promise.all([
    fetchIdentitas(),      // Identitas sekolah
    fetchStats(),          // 6 statistik count
    fetchDistribusiLokasi(), // Group by lokasi
    fetchStrukturPengurus(), // Join multiple tables
  ])
}
```

### 2. Loading State

- Spinner animation saat loading
- Text: "Memuat dashboard..."
- Centered layout

### 3. Error Handling

- Try-catch untuk setiap fetch
- Console.error untuk debugging
- Fallback values (0, '-', empty array)

---

## 📱 Responsive Design

### Desktop (lg: 1024px+)
- Grid 6 columns untuk stats cards
- Grid 2 columns untuk panel data
- Full sidebar expanded

### Tablet (md: 768px+)
- Grid 3 columns untuk stats cards
- Grid 1 column untuk panel data
- Sidebar bisa collapsed

### Mobile (< 768px)
- Grid 2 columns untuk stats cards
- Stack layout untuk panel data
- Horizontal scroll untuk table

---

## ✨ Animasi & Interaksi

### Hover Effects

**Stats Cards:**
- `hover:scale-105` - Scale up 5%
- `hover:shadow-xl` - Shadow elevation
- `transition-all` - Smooth transition

**Table Rows:**
- `hover:bg-blue-50` - Background highlight
- `transition-colors` - Color transition

### Loading Animation

```css
animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600
```

### Progress Bar Animation

```css
transition-all duration-500
width: calculated percentage
```

---

## 🚀 Performance Optimization

### 1. Parallel Fetching
- Semua data di-fetch bersamaan dengan `Promise.all()`
- Mengurangi waktu loading total

### 2. Count Queries
- Menggunakan `{ count: 'exact', head: true }` untuk statistik
- Tidak fetch semua data, hanya count

### 3. Single Query untuk Distribusi
- Fetch sekali, aggregate di client-side
- Mengurangi jumlah query ke database

### 4. Conditional Rendering
- Logo hanya render jika ada
- Section hanya render jika data tersedia

---

## 📊 Data Aggregation

### Distribusi Lokasi

```typescript
// Input: Array of siswa
[
  { lokasi: 'Sukabumi' },
  { lokasi: 'Sukabumi' },
  { lokasi: 'Bekasi' },
  ...
]

// Output: Aggregated
[
  { lokasi: 'Sukabumi', jumlah: 32 },
  { lokasi: 'Bekasi', jumlah: 24 },
  { lokasi: 'Purworejo', jumlah: 20 },
]
```

### Struktur Pengurus

```typescript
// For each lokasi:
1. Get kepala asrama name
2. Count asrama
3. Count musyrif
4. Count santri

// Output:
[
  {
    lokasi: 'Sukabumi',
    kepala_asrama: 'Ust. Ahmad',
    jumlah_asrama: 3,
    jumlah_musyrif: 5,
    jumlah_santri: 32
  },
  ...
]
```

---

## 🎯 Future Enhancements

### Phase 2 (Coming Soon)

1. **Dashboard Habit Tracker**
   - Grafik progress santri
   - Statistik per kategori (Ubudiyah, Akhlaq, dll)
   - Trend bulanan

2. **Dashboard Jurnal Musyrif**
   - Timeline aktivitas
   - Catatan penting
   - Laporan harian

3. **Filter & Search**
   - Filter by lokasi, kelas, asrama
   - Search santri by nama/NIS
   - Date range filter

4. **Export Data**
   - Export to Excel
   - Export to PDF
   - Print dashboard

5. **Real-time Updates**
   - WebSocket untuk live data
   - Auto-refresh setiap X menit
   - Notification untuk perubahan data

---

## 🔧 Troubleshooting

### Dashboard tidak muncul data

1. **Cek koneksi database**
   - Pastikan `.env.local` sudah benar
   - Test koneksi ke Supabase

2. **Cek data di tabel**
   - Pastikan ada data di tabel yang dibutuhkan
   - Minimal harus ada data di `identitas_sekolah_keasramaan`

3. **Cek console browser**
   - Buka DevTools (F12)
   - Lihat error di Console tab
   - Lihat network requests di Network tab

### Loading terlalu lama

1. **Optimasi query**
   - Gunakan index di kolom yang sering di-query
   - Batasi jumlah data yang di-fetch

2. **Caching**
   - Implement client-side caching
   - Set cache headers di Supabase

---

## 📝 Notes

- Dashboard auto-refresh saat page reload
- Data real-time dari database
- Responsive untuk semua device
- Error handling untuk koneksi gagal
- Loading state untuk UX yang baik
