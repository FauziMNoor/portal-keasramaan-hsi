# 📊 Fitur Indikator Penilaian

## 📋 Deskripsi

Fitur untuk mengelola indikator penilaian habit tracker. Setiap indikator memiliki kategori, nama, nilai maksimal, dan rubrik penilaian.

## 🎯 Tujuan

- Mengelola master data indikator penilaian
- Mempermudah standardisasi penilaian habit tracker
- Memudahkan update rubrik penilaian
- Mengelompokkan indikator berdasarkan kategori

## 🗂️ Struktur Database

### Tabel: `indikator_keasramaan`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key (auto-generated) |
| kategori | TEXT | Kategori indikator (Ubudiyah, Akhlaq, dll) |
| nama_indikator | TEXT | Nama indikator penilaian |
| nilai | INTEGER | Nilai maksimal (1-10) |
| rubrik | TEXT | Rubrik/kriteria penilaian |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Kategori Default

1. **Ubudiyah** - Ibadah dan ketaatan
2. **Akhlaq** - Perilaku dan etika
3. **Kedisiplinan** - Disiplin dan ketepatan waktu
4. **Kebersihan & Kerapian** - Kebersihan dan kerapian

## ✨ Fitur CRUD

### 1. Create (Tambah Indikator)

**Cara:**
1. Klik tombol "Tambah Indikator"
2. Isi form:
   - Kategori (dropdown)
   - Nama Indikator
   - Nilai Maksimal (1-10)
   - Rubrik Penilaian
3. Klik "Simpan"

**Validasi:**
- Semua field wajib diisi
- Nilai harus antara 1-10

### 2. Read (Lihat Data)

**Tampilan:**
- Data dikelompokkan berdasarkan kategori
- Setiap kategori ditampilkan dalam card terpisah
- Tabel menampilkan: No, Nama Indikator, Nilai, Rubrik, Aksi

**Filter:**
- Filter berdasarkan kategori
- Dropdown "Semua Kategori" untuk melihat semua data

### 3. Update (Edit Indikator)

**Cara:**
1. Klik icon Edit (✏️) pada baris data
2. Form akan terisi dengan data yang dipilih
3. Edit data yang ingin diubah
4. Klik "Update"

**Catatan:**
- `updated_at` otomatis diupdate

### 4. Delete (Hapus Indikator)

**Cara:**
1. Klik icon Hapus (🗑️) pada baris data
2. Konfirmasi penghapusan
3. Data akan dihapus dari database

**Peringatan:**
- Penghapusan bersifat permanen
- Pastikan indikator tidak digunakan di form habit tracker

## 🎨 Tampilan UI

### Header
- Icon BarChart3 dengan gradient purple
- Judul "Indikator Penilaian"
- Subtitle deskripsi

### Filter & Action Bar
- Dropdown filter kategori
- Button "Tambah Indikator" (purple gradient)

### Data Display
- Card per kategori dengan header gradient purple
- Tabel dengan kolom: No, Nama Indikator, Nilai, Rubrik, Aksi
- Badge nilai dengan background purple
- Hover effect pada baris tabel

### Modal Form
- Header gradient purple
- Form fields dengan border rounded
- Button Batal & Simpan
- Responsive design

## 📊 Data Default

Sistem sudah include 21 indikator default:

### Ubudiyah (8 indikator)
- Shalat Fardhu Berjamaah (1-3)
- Tata Cara Shalat (1-3)
- Qiyamul Lail (1-3)
- Shalat Sunnah (1-3)
- Puasa Sunnah (1-5)
- Tata Cara Wudhu (1-3)
- Sedekah (1-4)
- Dzikir Pagi Petang (1-4)

### Akhlaq (4 indikator)
- Etika dalam Tutur Kata (1-3)
- Etika dalam Bergaul (1-3)
- Etika dalam Berpakaian (1-3)
- Adab Sehari-hari (1-3)

### Kedisiplinan (6 indikator)
- Waktu Tidur (1-4)
- Pelaksanaan Piket Kamar (1-3)
- Disiplin Halaqah Tahfidz (1-3)
- Perizinan (1-3)
- Belajar Malam (1-4)
- Disiplin Berangkat ke Masjid (1-4)

### Kebersihan & Kerapian (3 indikator)
- Kebersihan Tubuh, Berpakaian, Berpenampilan (1-3)
- Kamar (1-3)
- Ranjang dan Almari (1-3)

## 🔄 Integrasi dengan Form Habit Tracker

Indikator ini akan digunakan sebagai referensi untuk:
1. Menampilkan field input di form habit tracker
2. Validasi nilai maksimal
3. Menampilkan rubrik penilaian
4. Grouping berdasarkan kategori

## 🎯 Use Case

### Skenario 1: Menambah Indikator Baru
**Contoh:** Sekolah ingin menambah indikator "Hafalan Al-Quran"

1. Buka menu Habit Tracker → Indikator Penilaian
2. Klik "Tambah Indikator"
3. Isi form:
   - Kategori: Ubudiyah
   - Nama: Hafalan Al-Quran
   - Nilai: 5
   - Rubrik: "1 = < 1 juz, 2 = 1-2 juz, 3 = 3-5 juz, 4 = 6-10 juz, 5 = > 10 juz"
4. Simpan

### Skenario 2: Update Rubrik Penilaian
**Contoh:** Mengubah kriteria penilaian "Shalat Fardhu"

1. Cari indikator "Shalat Fardhu Berjamaah"
2. Klik Edit
3. Update rubrik sesuai kebutuhan
4. Simpan

### Skenario 3: Filter by Kategori
**Contoh:** Melihat semua indikator Akhlaq

1. Pilih "Akhlaq" di dropdown filter
2. Sistem akan menampilkan hanya indikator kategori Akhlaq

## 🔒 Validasi & Error Handling

### Validasi Input
- ✅ Kategori wajib dipilih
- ✅ Nama indikator wajib diisi
- ✅ Nilai harus angka 1-10
- ✅ Rubrik wajib diisi

### Error Handling
- ❌ Koneksi database gagal → Alert error
- ❌ Validasi gagal → Alert peringatan
- ❌ Duplikasi data → Alert error
- ✅ Sukses → Alert sukses + refresh data

## 📱 Responsive Design

### Desktop (lg: 1024px+)
- Tabel full width
- Modal centered
- Filter & button side by side

### Tablet (md: 768px+)
- Tabel dengan horizontal scroll
- Filter & button stacked
- Modal full width

### Mobile (< 768px)
- Tabel dengan horizontal scroll
- Filter & button stacked
- Modal full screen

## 🎨 Color Scheme

**Primary Color:** Purple
- Gradient: `from-purple-500 to-purple-600`
- Hover: `from-purple-600 to-purple-700`
- Badge: `bg-purple-100 text-purple-700`

**Accent Colors:**
- Edit: Blue (`text-blue-600`)
- Delete: Red (`text-red-600`)
- Success: Green (alert)
- Error: Red (alert)

## 🚀 Future Enhancements

### Phase 2
1. **Import/Export**
   - Import indikator dari Excel
   - Export indikator ke Excel/PDF

2. **Bulk Actions**
   - Bulk delete
   - Bulk edit kategori
   - Bulk update nilai

3. **History**
   - Log perubahan indikator
   - Audit trail

4. **Advanced Filter**
   - Filter by nilai
   - Search by nama
   - Sort by created_at

5. **Validation**
   - Cek indikator yang digunakan di form
   - Warning sebelum delete indikator aktif

## 📝 Notes

- Data indikator bersifat master data
- Perubahan indikator tidak mempengaruhi data habit tracker yang sudah tersimpan
- Backup data sebelum melakukan perubahan besar
- Koordinasi dengan tim sebelum menghapus indikator

## 🆘 Troubleshooting

### Data tidak muncul
1. Cek koneksi database
2. Cek console browser untuk error
3. Pastikan tabel `indikator_keasramaan` sudah dibuat
4. Jalankan SQL insert data default

### Form tidak bisa submit
1. Cek validasi form
2. Pastikan semua field required terisi
3. Cek console untuk error
4. Cek koneksi ke Supabase

### Filter tidak berfungsi
1. Refresh halaman
2. Clear browser cache
3. Cek console untuk error

## ✅ Checklist Setup

- [ ] Tabel `indikator_keasramaan` sudah dibuat
- [ ] Data default sudah di-insert
- [ ] Menu "Indikator Penilaian" muncul di sidebar
- [ ] Halaman bisa diakses
- [ ] CRUD berfungsi dengan baik
- [ ] Filter kategori berfungsi
- [ ] Modal form berfungsi
- [ ] Validasi berjalan
- [ ] Responsive di semua device

## 🎉 Selesai!

Fitur Indikator Penilaian siap digunakan! 🚀
