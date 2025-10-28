# 📊 Fitur Rekap Habit Tracker

## 📋 Deskripsi

Fitur untuk menampilkan rekap dan analisis habit tracker siswa dengan perhitungan otomatis berdasarkan rata-rata nilai per kategori.

## 🎯 Tujuan

- Menampilkan rekap habit tracker per siswa
- Menghitung rata-rata nilai per kategori
- Menghitung total dan persentase pencapaian
- Menentukan predikat berdasarkan total nilai
- Export data ke Excel (coming soon)

## 📊 Struktur Perhitungan

### 1. Kategori & Target Nilai

| Kategori | Jumlah Indikator | Target Nilai | Indikator |
|----------|------------------|--------------|-----------|
| **Ubudiyah** | 8 | 28 | Shalat Fardhu (3), Tata Cara Shalat (3), Qiyamul Lail (3), Shalat Sunnah (3), Puasa Sunnah (5), Tata Cara Wudhu (3), Sedekah (4), Dzikir (4) |
| **Akhlaq** | 4 | 12 | Etika Tutur Kata (3), Etika Bergaul (3), Etika Berpakaian (3), Adab Sehari-hari (3) |
| **Kedisiplinan** | 6 | 21 | Waktu Tidur (4), Piket Kamar (3), Halaqah Tahfidz (3), Perizinan (3), Belajar Malam (4), Berangkat Masjid (4) |
| **Kebersihan & Kerapian** | 3 | 9 | Kebersihan Tubuh (3), Kamar (3), Ranjang & Almari (3) |
| **TOTAL ASRAMA** | 21 | **70** | Semua kategori |

### 2. Formula Perhitungan

#### A. Rata-rata Per Indikator
```
Rata-rata Indikator = Σ(Nilai Indikator) / Jumlah Data
```

**Contoh:**
- Siswa A punya 5 data habit tracker
- Shalat Fardhu: 3, 2, 3, 3, 2
- Rata-rata = (3+2+3+3+2) / 5 = 2.6

#### B. Total Per Kategori
```
Total Kategori = Σ(Rata-rata Semua Indikator dalam Kategori)
```

**Contoh Ubudiyah:**
```
Total Ubudiyah = Rata-rata Shalat Fardhu + 
                 Rata-rata Tata Cara Shalat + 
                 Rata-rata Qiyamul Lail + 
                 ... (8 indikator)
```

#### C. Persentase Kategori
```
Persentase = (Total Kategori / Target Kategori) × 100%
```

**Contoh:**
```
Persentase Ubudiyah = (Total Ubudiyah / 28) × 100%
```

#### D. Total Asrama
```
Total Asrama = Total Ubudiyah + 
               Total Akhlaq + 
               Total Kedisiplinan + 
               Total Kebersihan
```

#### E. Persentase Asrama
```
Persentase Asrama = (Total Asrama / 70) × 100%
```

### 3. Predikat

| Total Nilai | Predikat | Warna Badge |
|-------------|----------|-------------|
| > 65 | **Mumtaz** | Green |
| > 60 | **Jayyid Jiddan** | Blue |
| > 50 | **Jayyid** | Yellow |
| > 30 | **Dhaif** | Orange |
| > 0 | **Maqbul** | Red |

## 🔄 Alur Kerja

### 1. Filter Data
User memilih filter:
- **Semester** (required)
- **Tahun Ajaran** (required)
- Lokasi (optional)
- Kelas (optional)
- Asrama (optional)
- Tanggal Mulai (optional)
- Tanggal Akhir (optional)

### 2. Query Data
```sql
SELECT * FROM formulir_habit_tracker_keasramaan
WHERE semester = ? 
  AND tahun_ajaran = ?
  AND lokasi = ? (if selected)
  AND kelas = ? (if selected)
  AND asrama = ? (if selected)
  AND tanggal >= ? (if selected)
  AND tanggal <= ? (if selected)
```

### 3. Grouping by NIS
Data dikelompokkan berdasarkan NIS siswa:
```javascript
{
  "202410001": {
    nama_siswa: "Ahmad",
    records: [record1, record2, record3, ...]
  },
  "202410002": {
    nama_siswa: "Budi",
    records: [record1, record2, ...]
  }
}
```

### 4. Perhitungan
Untuk setiap siswa:
1. Hitung rata-rata setiap indikator
2. Jumlahkan rata-rata per kategori
3. Hitung persentase per kategori
4. Hitung total asrama
5. Hitung persentase asrama
6. Tentukan predikat

### 5. Tampilkan Hasil
Hasil ditampilkan dalam tabel dengan kolom:
- Data Siswa (Nama, NIS, Kelas, Rombel, Asrama, Lokasi, Musyrif, Kepas)
- Total & Persentase Ubudiyah
- Total & Persentase Akhlaq
- Total & Persentase Kedisiplinan
- Total & Persentase Kebersihan
- Total & Persentase Asrama
- Predikat

## 🎨 Tampilan UI

### Filter Section
- Grid layout 4 kolom
- Dropdown untuk master data
- Date picker untuk range tanggal
- Button "Tampilkan Rekap" (green)
- Button "Export Excel" (blue) - muncul jika ada data

### Tabel Rekap
- Sticky header
- Color-coded columns:
  - **Blue** - Ubudiyah
  - **Green** - Akhlaq
  - **Orange** - Kedisiplinan
  - **Purple** - Kebersihan
  - **Yellow** - Total Asrama
  - **Red** - Predikat
- Badge predikat dengan warna sesuai level
- Zebra striping untuk rows

## 📊 Contoh Data

### Input (Formulir Habit Tracker)
```
Siswa: Ahmad (NIS: 202410001)
Tanggal: 2025-10-01 s/d 2025-10-05 (5 hari)

Shalat Fardhu: 3, 2, 3, 3, 2
Tata Cara Shalat: 3, 3, 2, 3, 3
... (semua indikator)
```

### Output (Rekap)
```
Nama: Ahmad
NIS: 202410001

Ubudiyah:
- Rata-rata Shalat Fardhu: 2.6
- Rata-rata Tata Cara Shalat: 2.8
- ... (8 indikator)
- Total Ubudiyah: 22.5 / 28
- Persentase: 80.36%

Akhlaq:
- Total: 10.2 / 12
- Persentase: 85%

Kedisiplinan:
- Total: 18.5 / 21
- Persentase: 88.1%

Kebersihan:
- Total: 8.1 / 9
- Persentase: 90%

TOTAL ASRAMA: 59.3 / 70
PERSENTASE: 84.71%
PREDIKAT: Jayyid Jiddan
```

## 🔍 Use Case

### Skenario 1: Rekap Bulanan
**Tujuan:** Melihat rekap habit tracker bulan Oktober 2025

**Steps:**
1. Pilih Semester: Ganjil
2. Pilih Tahun Ajaran: 2025/2026
3. Pilih Tanggal Mulai: 2025-10-01
4. Pilih Tanggal Akhir: 2025-10-31
5. Klik "Tampilkan Rekap"

**Hasil:** Rekap semua siswa untuk bulan Oktober

### Skenario 2: Rekap Per Kelas
**Tujuan:** Melihat rekap kelas 11 saja

**Steps:**
1. Pilih Semester: Ganjil
2. Pilih Tahun Ajaran: 2025/2026
3. Pilih Kelas: 11
4. Klik "Tampilkan Rekap"

**Hasil:** Rekap hanya siswa kelas 11

### Skenario 3: Rekap Per Asrama
**Tujuan:** Melihat rekap asrama Ibnu Hajar

**Steps:**
1. Pilih Semester: Ganjil
2. Pilih Tahun Ajaran: 2025/2026
3. Pilih Lokasi: HSI Boarding School Sukabumi
4. Pilih Asrama: Ibnu Hajar
5. Klik "Tampilkan Rekap"

**Hasil:** Rekap hanya siswa asrama Ibnu Hajar

## 🚀 Future Enhancements

### Phase 2
1. **Export Excel**
   - Export tabel ke Excel
   - Include semua detail indikator
   - Format professional

2. **Export PDF**
   - Generate PDF report
   - Include charts
   - Print-ready format

3. **Charts & Visualisasi**
   - Bar chart per kategori
   - Pie chart distribusi predikat
   - Line chart trend per bulan
   - Radar chart per siswa

4. **Perbandingan**
   - Compare antar siswa
   - Compare antar asrama
   - Compare antar periode

5. **Ranking**
   - Top 10 siswa
   - Ranking per asrama
   - Ranking per kelas

6. **Detail View**
   - Klik siswa untuk lihat detail
   - Breakdown per indikator
   - History trend

## 📝 Notes

- Data rekap dihitung real-time saat user klik "Tampilkan Rekap"
- Tidak ada tabel khusus untuk menyimpan rekap (calculated on-the-fly)
- Perhitungan menggunakan rata-rata untuk menghindari bias jumlah data
- Predikat ditentukan berdasarkan total nilai, bukan persentase

## 🔒 Validasi

### Input Validation
- ✅ Semester wajib dipilih
- ✅ Tahun Ajaran wajib dipilih
- ✅ Tanggal akhir harus >= tanggal mulai

### Data Validation
- ✅ Hanya data dengan nilai > 0 yang dihitung
- ✅ Jika tidak ada data, rata-rata = 0
- ✅ Pembulatan 2 desimal untuk semua perhitungan

## 🆘 Troubleshooting

### Data tidak muncul
1. Pastikan sudah pilih Semester & Tahun Ajaran
2. Pastikan ada data habit tracker di periode tersebut
3. Cek filter lokasi/kelas/asrama tidak terlalu spesifik

### Perhitungan tidak sesuai
1. Cek data input di formulir habit tracker
2. Pastikan nilai indikator sudah benar
3. Refresh halaman dan hitung ulang

### Loading terlalu lama
1. Kurangi range tanggal
2. Tambah filter lokasi/kelas/asrama
3. Cek koneksi database

## ✅ Testing Checklist

- [ ] Filter semester & tahun ajaran berfungsi
- [ ] Filter optional (lokasi, kelas, asrama) berfungsi
- [ ] Filter tanggal range berfungsi
- [ ] Perhitungan rata-rata benar
- [ ] Perhitungan total per kategori benar
- [ ] Perhitungan persentase benar
- [ ] Predikat sesuai dengan total nilai
- [ ] Tabel responsive
- [ ] Data ter-sort dengan benar
- [ ] Export Excel berfungsi (coming soon)

## 🎉 Selesai!

Fitur Rekap Habit Tracker siap digunakan! 🚀
