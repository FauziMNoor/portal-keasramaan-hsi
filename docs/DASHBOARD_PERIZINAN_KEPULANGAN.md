# 📊 DASHBOARD PERIZINAN KEPULANGAN
## Portal Keasramaan - HSI Boarding School

---

## 📋 RINGKASAN FITUR

Dashboard **Perizinan Kepulangan** memberikan visualisasi lengkap dan analisis mendalam tentang perizinan kepulangan santri, termasuk status approval, status kepulangan, trend bulanan, dan distribusi keperluan.

---

## ✨ FITUR UTAMA

### **1. Stats Cards - Status Perizinan (Row 1)**
- ✅ **Total Perizinan** - Total semua perizinan (Blue)
- ✅ **Menunggu Approval** - Status pending (Amber)
- ✅ **Disetujui** - Status approved_kepsek (Green)
- ✅ **Ditolak** - Status rejected (Red)

### **2. Stats Cards - Status Kepulangan (Row 2)**
- ✅ **Belum Pulang** - Santri yang belum kembali (Purple)
- ✅ **Sudah Pulang** - Santri yang sudah kembali tepat waktu (Teal)
- ✅ **Terlambat** - Santri yang terlambat kembali (Orange)
- ✅ **Perpanjangan** - Total perpanjangan izin (Indigo)

### **3. Charts & Visualisasi**

#### **A. Trend Perizinan per Bulan (Line Chart)**
- ✅ Total perizinan per bulan
- ✅ Perizinan yang disetujui
- ✅ Perizinan yang ditolak
- ✅ Smooth line dengan dots
- ✅ Grid background
- ✅ Responsive design

#### **B. Distribusi Keperluan (Pie Chart)**
- ✅ Persentase per kategori keperluan
- ✅ Label dengan persentase
- ✅ Multi-color scheme
- ✅ Interactive tooltip

#### **C. Status Kepulangan per Cabang (Bar Chart)**
- ✅ Grouped bar chart
- ✅ 3 kategori: Belum Pulang, Sudah Pulang, Terlambat
- ✅ Perbandingan antar cabang
- ✅ Color-coded bars

### **4. Informasi Ringkasan**
- ✅ **Rata-rata Durasi Izin** - Dalam hari
- ✅ **Tingkat Approval** - Persentase perizinan yang disetujui
- ✅ **Tingkat Keterlambatan** - Persentase santri yang terlambat

### **5. Filter & Controls**
- ✅ **Filter Cabang** - Dropdown semua cabang
- ✅ **Filter Tahun** - Dropdown tahun (2024-2027)
- ✅ Auto-refresh saat filter berubah

---

## 🎨 STYLE & DESIGN

### **Color Scheme (Konsisten dengan Dashboard Lain):**

#### **Status Perizinan:**
- **Blue** (#3b82f6) - Total Perizinan
- **Amber** (#f59e0b) - Pending
- **Green** (#10b981) - Approved
- **Red** (#ef4444) - Rejected

#### **Status Kepulangan:**
- **Purple** (#8b5cf6) - Belum Pulang
- **Teal** (#14b8a6) - Sudah Pulang
- **Orange** (#f59e0b) - Terlambat
- **Indigo** (#6366f1) - Perpanjangan

### **Typography:**
- **Title**: 2xl-3xl, bold, gray-800
- **Subtitle**: sm-base, gray-600
- **Stats Numbers**: 2xl-3xl, bold, white
- **Labels**: sm, gray-700

### **Components:**
- **Cards**: rounded-2xl, shadow-lg, gradient background
- **Charts**: rounded-2xl, shadow-md, white background
- **Filters**: rounded-lg, border-2, focus:ring-2
- **Hover Effects**: scale-105, shadow-xl

---

## 📊 DATA SOURCE

### **Tabel Database:**
```sql
perizinan_kepulangan_keasramaan
```

### **Kolom yang Digunakan:**
- `id` - Primary key
- `nis` - Nomor Induk Santri
- `nama_siswa` - Nama santri
- `cabang` - Cabang asrama
- `tanggal_pengajuan` - Tanggal pengajuan izin
- `tanggal_mulai` - Tanggal mulai izin
- `tanggal_selesai` - Tanggal selesai izin
- `durasi_hari` - Durasi izin dalam hari
- `keperluan` - Kategori keperluan
- `status` - Status approval (pending, approved_kepas, approved_kepsek, rejected)
- `status_kepulangan` - Status kepulangan (belum_pulang, sudah_pulang, terlambat)
- `is_perpanjangan` - Boolean perpanjangan
- `tanggal_kembali` - Tanggal kembali aktual

---

## 🔄 ALUR DATA

### **1. Fetch Master Data:**
```typescript
- Cabang list dari tabel cabang_keasramaan
- Filter status = 'aktif'
```

### **2. Fetch Dashboard Data:**
```typescript
- Query perizinan_kepulangan_keasramaan
- Apply filter cabang (jika dipilih)
- Apply filter tahun (range tanggal_pengajuan)
```

### **3. Calculate Stats:**
```typescript
- Total perizinan: COUNT(*)
- Pending: COUNT WHERE status = 'pending'
- Approved: COUNT WHERE status = 'approved_kepsek'
- Rejected: COUNT WHERE status = 'rejected'
- Belum pulang: COUNT WHERE status_kepulangan = 'belum_pulang'
- Sudah pulang: COUNT WHERE status_kepulangan = 'sudah_pulang'
- Terlambat: COUNT WHERE status_kepulangan = 'terlambat'
- Perpanjangan: COUNT WHERE is_perpanjangan = true
- Avg durasi: AVG(durasi_hari)
```

### **4. Process Chart Data:**

#### **Trend Data:**
```typescript
- Group by month (Jan-Des)
- Count total, approved, rejected per month
```

#### **Keperluan Stats:**
```typescript
- Group by keperluan
- Count jumlah per keperluan
- Calculate persentase
```

#### **Cabang Stats:**
```typescript
- Group by cabang
- Count belum_pulang, sudah_pulang, terlambat per cabang
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints:**
- **Mobile** (<640px): 1 column layout
- **Tablet** (640px-1024px): 2 columns layout
- **Desktop** (>1024px): 4 columns layout

### **Responsive Features:**
- ✅ Stats cards: 1 col (mobile) → 2 col (tablet) → 4 col (desktop)
- ✅ Charts: 1 col (mobile) → 2 col (desktop)
- ✅ Filters: Stack vertical (mobile) → Horizontal (desktop)
- ✅ Font sizes: Smaller on mobile
- ✅ Padding: Reduced on mobile

---

## 🧪 TESTING CHECKLIST

### **Test 1: Stats Cards**
- [ ] Total perizinan sesuai dengan data
- [ ] Pending count benar
- [ ] Approved count benar
- [ ] Rejected count benar
- [ ] Belum pulang count benar
- [ ] Sudah pulang count benar
- [ ] Terlambat count benar
- [ ] Perpanjangan count benar

### **Test 2: Charts**
- [ ] Line chart menampilkan trend per bulan
- [ ] Pie chart menampilkan distribusi keperluan
- [ ] Bar chart menampilkan status per cabang
- [ ] Tooltip muncul saat hover
- [ ] Legend ditampilkan dengan benar

### **Test 3: Filters**
- [ ] Filter cabang berfungsi
- [ ] Filter tahun berfungsi
- [ ] Data ter-update saat filter berubah
- [ ] Loading state ditampilkan

### **Test 4: Responsive**
- [ ] Mobile view (resize browser < 640px)
- [ ] Tablet view (resize browser 640px-1024px)
- [ ] Desktop view (resize browser > 1024px)
- [ ] Charts responsive
- [ ] No horizontal scroll

### **Test 5: Informasi Ringkasan**
- [ ] Rata-rata durasi dihitung dengan benar
- [ ] Tingkat approval dihitung dengan benar
- [ ] Tingkat keterlambatan dihitung dengan benar

---

## 🎯 POSISI DI SIDEBAR

```
🏠 Overview
├── Dashboard Data
├── Dashboard Habit Tracker
├── Dashboard Catatan Perilaku
└── ✨ Dashboard Perizinan (NEW!) ← Tepat di bawah Dashboard Catatan Perilaku
```

**URL**: `/perizinan/kepulangan/dashboard`

**Icon**: BarChart3 (Lucide React)

**Color**: Blue gradient (from-blue-500 to-blue-600)

---

## 📁 FILES

### **Created:**
1. ✅ `app/perizinan/kepulangan/dashboard/page.tsx` - Main dashboard page

### **Modified:**
2. ✅ `components/Sidebar.tsx` - Added dashboard link

### **Documentation:**
3. ✅ `DASHBOARD_PERIZINAN_KEPULANGAN.md` - This file

---

## 🚀 CARA MENGGUNAKAN

### **1. Akses Dashboard**
```
http://localhost:3000/perizinan/kepulangan/dashboard
```

### **2. Pilih Filter**
- Pilih cabang (opsional)
- Pilih tahun (default: tahun sekarang)

### **3. Analisis Data**
- Lihat stats cards untuk overview cepat
- Lihat trend chart untuk pola bulanan
- Lihat pie chart untuk distribusi keperluan
- Lihat bar chart untuk perbandingan antar cabang
- Lihat informasi ringkasan untuk metrics penting

---

**Dibuat oleh**: Augment AI Assistant  
**Tanggal**: 20 November 2025  
**Versi**: 1.0  
**Status**: ✅ READY TO USE

