# 📥 Fitur Export Rekap Habit Tracker

## ✨ Fitur yang Tersedia

Sistem rekap habit tracker sekarang mendukung export data dalam 2 format:

### 1. 📊 Export Excel (.xlsx)
- Format: Microsoft Excel
- Cocok untuk: Analisis data lebih lanjut, edit data, pivot table
- Ukuran file: Kecil
- Kolom yang di-export: Semua data lengkap (20 kolom)

### 2. 📄 Export PDF (.pdf)
- Format: Portable Document Format
- Cocok untuk: Cetak, arsip, presentasi
- Layout: Landscape A4
- Tampilan: Tabel rapi dengan header berwarna hijau

## 🎯 Cara Menggunakan

### Langkah 1: Tampilkan Data Rekap

1. Buka halaman **Habit Tracker → Rekap**
2. Pilih filter:
   - **Semester** (wajib)
   - **Tahun Ajaran** (wajib)
   - Lokasi, Kelas, Asrama (opsional)
   - Tanggal Mulai & Akhir (opsional)
3. Klik tombol **"Tampilkan Rekap"**
4. Tunggu hingga data muncul

### Langkah 2: Export Data

Setelah data muncul, Anda akan melihat 2 tombol export:

#### Export Excel (Tombol Biru)
- Klik tombol **"Export Excel"** 
- File akan otomatis terdownload dengan nama:
  ```
  Rekap_Habit_Tracker_[Semester]_[Tahun_Ajaran]_[Tanggal].xlsx
  ```
- Contoh: `Rekap_Habit_Tracker_Ganjil_2024-2025_2025-10-28.xlsx`

#### Export PDF (Tombol Merah)
- Klik tombol **"Export PDF"**
- File akan otomatis terdownload dengan nama:
  ```
  Rekap_Habit_Tracker_[Semester]_[Tahun_Ajaran]_[Tanggal].pdf
  ```
- Contoh: `Rekap_Habit_Tracker_Ganjil_2024-2025_2025-10-28.pdf`

## 📋 Data yang Di-Export

### Kolom Excel (20 kolom):

| No | Kolom | Deskripsi |
|----|-------|-----------|
| 1 | No | Nomor urut |
| 2 | Nama Siswa | Nama lengkap siswa |
| 3 | NIS | Nomor Induk Siswa |
| 4 | Kelas | Kelas siswa |
| 5 | Rombel | Rombongan belajar |
| 6 | Asrama | Nama asrama |
| 7 | Lokasi | Lokasi asrama |
| 8 | Musyrif | Nama musyrif |
| 9 | Kepala Asrama | Nama kepala asrama |
| 10 | Total Ubudiyah | Nilai total (contoh: "21 / 28") |
| 11 | % Ubudiyah | Persentase (contoh: "76%") |
| 12 | Total Akhlaq | Nilai total (contoh: "10 / 12") |
| 13 | % Akhlaq | Persentase (contoh: "83%") |
| 14 | Total Kedisiplinan | Nilai total (contoh: "15 / 21") |
| 15 | % Kedisiplinan | Persentase (contoh: "71%") |
| 16 | Total Kebersihan | Nilai total (contoh: "9 / 9") |
| 17 | % Kebersihan | Persentase (contoh: "100%") |
| 18 | Total Asrama | Nilai total keseluruhan (contoh: "55 / 70") |
| 19 | % Asrama | Persentase keseluruhan (contoh: "79%") |
| 20 | Predikat | Predikat (Mumtaz, Jayyid Jiddan, Jayyid, Dhaif, Maqbul) |

### Kolom PDF (16 kolom):

PDF menggunakan layout landscape dengan kolom yang lebih ringkas:
- No, Nama Siswa, NIS, Kelas, Asrama
- Ubudiyah (nilai + %), Akhlaq (nilai + %), Kedisiplinan (nilai + %), Kebersihan (nilai + %)
- Total (nilai + %), Predikat

## 🎨 Tampilan File

### Excel:
```
┌────┬──────────────┬────────────┬───────┬────────┬─────────────┬─────────┐
│ No │ Nama Siswa   │ NIS        │ Kelas │ Rombel │ Asrama      │ Lokasi  │
├────┼──────────────┼────────────┼───────┼────────┼─────────────┼─────────┤
│ 1  │ Harun        │ 202410009  │ 11    │ A      │ Ibnu Hajar  │ Putra   │
└────┴──────────────┴────────────┴───────┴────────┴─────────────┴─────────┘
```

### PDF:
```
┌─────────────────────────────────────────────────────────────────────────┐
│           REKAP HABIT TRACKER KEASRAMAAN                                │
│           Semester: Ganjil | Tahun Ajaran: 2024-2025                   │
├────┬──────────────┬────────────┬───────┬─────────────┬──────────────────┤
│ No │ Nama Siswa   │ NIS        │ Kelas │ Asrama      │ Ubudiyah  │ %    │
├────┼──────────────┼────────────┼───────┼─────────────┼───────────┼──────┤
│ 1  │ Harun        │ 202410009  │ 11    │ Ibnu Hajar  │ 21/28     │ 76%  │
└────┴──────────────┴────────────┴───────┴─────────────┴───────────┴──────┘
                        Halaman 1 dari 1
```

## 💡 Tips Penggunaan

### Excel:
1. **Analisis Data**: Gunakan fitur Sort & Filter untuk analisis
2. **Pivot Table**: Buat pivot table untuk summary per kelas/asrama
3. **Chart**: Buat grafik untuk visualisasi data
4. **Edit**: Data bisa diedit langsung di Excel

### PDF:
1. **Cetak**: Langsung print untuk arsip fisik
2. **Share**: Kirim via email atau WhatsApp
3. **Presentasi**: Tampilkan di projector untuk rapat
4. **Arsip**: Simpan sebagai dokumentasi resmi

## 🔧 Troubleshooting

### File Tidak Terdownload

**Penyebab:**
- Browser memblokir download otomatis
- Pop-up blocker aktif

**Solusi:**
1. Cek notification bar di browser
2. Klik "Allow" untuk download
3. Atau cek folder Downloads

### File Excel Tidak Bisa Dibuka

**Penyebab:**
- Excel versi lama
- File corrupt

**Solusi:**
1. Update Microsoft Excel ke versi terbaru
2. Atau buka dengan Google Sheets
3. Atau gunakan LibreOffice Calc

### PDF Terpotong

**Penyebab:**
- Data terlalu banyak untuk 1 halaman

**Solusi:**
- PDF otomatis membuat multiple pages
- Cek halaman berikutnya
- Atau filter data untuk mengurangi jumlah siswa

### Nama File Terlalu Panjang

**Penyebab:**
- Nama semester/tahun ajaran terlalu panjang

**Solusi:**
- File akan otomatis tersimpan dengan nama yang valid
- Rename file setelah download jika perlu

## 📊 Contoh Use Case

### 1. Laporan Bulanan
```
Filter: Semester Ganjil, Tahun 2024-2025, Tanggal 1-30 Sept
Export: PDF untuk dicetak dan diserahkan ke kepala sekolah
```

### 2. Analisis Per Asrama
```
Filter: Semester Ganjil, Asrama Ibnu Hajar
Export: Excel untuk analisis detail per siswa
```

### 3. Evaluasi Akhir Semester
```
Filter: Semester Ganjil, Semua data
Export: Excel untuk membuat ranking dan statistik
```

### 4. Dokumentasi Arsip
```
Filter: Semester Ganjil, Tahun 2024-2025
Export: PDF untuk arsip dokumentasi sekolah
```

## 🎯 Fitur Tambahan (Coming Soon)

- [ ] Export Detail Kategori (dengan deskripsi lengkap)
- [ ] Export per Siswa (rapor individual)
- [ ] Export dengan Chart/Grafik
- [ ] Email otomatis ke orang tua
- [ ] Template custom untuk PDF

## 📝 Catatan

- File Excel menggunakan format `.xlsx` (Excel 2007+)
- File PDF menggunakan format landscape A4
- Nama file otomatis include tanggal export
- Data yang di-export sesuai dengan filter yang dipilih
- Tidak ada limit jumlah data yang bisa di-export
