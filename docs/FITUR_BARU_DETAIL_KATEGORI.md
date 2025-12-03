# 🎉 Fitur Baru: Detail Kategori dengan Foto & Export

## ✨ Fitur yang Ditambahkan

### 1. 📸 Foto Siswa di Detail Kategori

Setiap siswa di tab "Detail Kategori" sekarang menampilkan foto profil berbentuk bulat.

**Tampilan:**
```
┌─────────────────────────────────────────────────────────┐
│  ╭───╮                                                   │
│  │ 📷 │  1. Harun                          55 / 70      │
│  ╰───╯  NIS: 202410009 | Kelas: 11 | ...   [Jayyid]    │
└─────────────────────────────────────────────────────────┘
```

**Fitur Foto:**
- Bentuk: Bulat (rounded-full)
- Ukuran: 64x64 pixel
- Border: Putih 4px dengan shadow
- Fallback: Icon user jika foto tidak ada/gagal load
- Sumber: Field `foto_url` dari tabel `data_siswa_keasramaan`

### 2. 📥 Export Detail Kategori

Dua tombol export baru di tab "Detail Kategori":

#### A. Export Excel Detail
- **Format**: .xlsx dengan multiple sheets
- **Isi**: 1 sheet per siswa dengan deskripsi lengkap
- **Kolom**: Indikator | Nilai | Keterangan
- **Tombol**: Biru dengan icon FileSpreadsheet

#### B. Export PDF Detail  
- **Format**: .pdf dengan multiple pages
- **Isi**: 1 halaman per siswa dengan tabel detail
- **Layout**: Portrait A4
- **Tombol**: Merah dengan icon Download

## 🎯 Cara Menggunakan

### Melihat Foto Siswa

1. Buka **Habit Tracker → Rekap**
2. Pilih filter dan klik "Tampilkan Rekap"
3. Klik tab **"📋 Detail Kategori"**
4. Foto siswa akan muncul di sebelah kiri nama

**Catatan:**
- Jika foto tidak ada, akan muncul icon user default
- Foto diambil dari field `foto_url` di tabel `data_siswa_keasramaan`
- Pastikan URL foto valid dan accessible

### Export Detail ke Excel

1. Buka tab **"📋 Detail Kategori"**
2. Klik tombol **"Excel Detail"** (biru) di kanan atas tab
3. File akan terdownload dengan nama:
   ```
   Detail_Habit_Tracker_[Semester]_[Tahun_Ajaran]_[Tanggal].xlsx
   ```

**Isi File Excel:**
- **Multiple Sheets**: 1 sheet per siswa
- **Nama Sheet**: "1_Nama Siswa", "2_Nama Siswa", dst
- **Struktur per Sheet**:
  ```
  REKAP DETAIL HABIT TRACKER KEASRAMAAN
  
  Nama Siswa: Harun
  NIS: 202410009
  Kelas: 11
  ...
  Total Nilai: 55 / 70  Persentase: 79%  Predikat: Jayyid
  
  UBUDIYAH: 21 / 28 (76%)
  ┌────────────────────────────┬───────┬──────────────────────────┐
  │ Indikator                  │ Nilai │ Keterangan               │
  ├────────────────────────────┼───────┼──────────────────────────┤
  │ Shalat Fardhu Berjamaah    │ 3 / 3 │ Ananda selalu menjaga... │
  │ Tata Cara Shalat           │ 3 / 3 │ Ananda sangat memper...  │
  └────────────────────────────┴───────┴──────────────────────────┘
  
  AKHLAQ: 10 / 12 (83%)
  ...
  
  KEDISIPLINAN: 15 / 21 (71%)
  ...
  
  KEBERSIHAN & KERAPIAN: 9 / 9 (100%)
  ...
  ```

### Export Detail ke PDF

1. Buka tab **"📋 Detail Kategori"**
2. Klik tombol **"PDF Detail"** (merah) di kanan atas tab
3. File akan terdownload dengan nama:
   ```
   Detail_Habit_Tracker_[Semester]_[Tahun_Ajaran]_[Tanggal].pdf
   ```

**Isi File PDF:**
- **Multiple Pages**: 1 halaman per siswa
- **Layout**: Portrait A4
- **Header**: Info siswa lengkap
- **Body**: 4 tabel (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan)
- **Footer**: Nomor halaman

**Contoh Tampilan PDF:**
```
┌─────────────────────────────────────────────────────────┐
│     REKAP DETAIL HABIT TRACKER KEASRAMAAN               │
│                                                          │
│ Nama: Harun                                             │
│ NIS: 202410009 | Kelas: 11 | Rombel: A                 │
│ Asrama: Ibnu Hajar | Lokasi: Putra                     │
│ Musyrif: Ustadz Ahmad | Kepala Asrama: Ustadz Budi     │
│ Semester: Ganjil | Tahun Ajaran: 2024-2025             │
│                                                          │
│ Total: 55 / 70 (79%) - Predikat: Jayyid                │
│                                                          │
│ UBUDIYAH: 21 / 28 (76%)                                 │
│ ┌──────────────────────┬───────┬────────────────────┐  │
│ │ Indikator            │ Nilai │ Keterangan         │  │
│ ├──────────────────────┼───────┼────────────────────┤  │
│ │ Shalat Fardhu...     │ 3/3   │ Ananda selalu...   │  │
│ └──────────────────────┴───────┴────────────────────┘  │
│                                                          │
│ AKHLAQ: 10 / 12 (83%)                                   │
│ ...                                                      │
│                                                          │
│                    Halaman 1 dari 6                     │
└─────────────────────────────────────────────────────────┘
```

## 📊 Perbedaan Export Ringkasan vs Detail

| Aspek | Export Ringkasan | Export Detail |
|-------|------------------|---------------|
| **Tombol** | Di bawah filter | Di tab Detail Kategori |
| **Format Excel** | 1 sheet, semua siswa | Multiple sheets, 1 per siswa |
| **Format PDF** | Landscape, tabel ringkas | Portrait, tabel lengkap |
| **Isi** | Nilai total per kategori | Nilai + deskripsi per indikator |
| **Ukuran File** | Kecil | Lebih besar |
| **Cocok untuk** | Overview, ranking | Rapor individual, evaluasi detail |

## 🎨 Warna Kategori di PDF

- **Ubudiyah**: Biru (#3B82F6)
- **Akhlaq**: Hijau (#22C55E)
- **Kedisiplinan**: Orange (#F97316)
- **Kebersihan**: Ungu (#A855F7)

## 💡 Tips Penggunaan

### Foto Siswa

1. **Upload Foto**: Pastikan foto sudah diupload ke storage dan URL tersimpan di `data_siswa_keasramaan.foto_url`
2. **Format Foto**: Gunakan format JPG/PNG dengan ukuran maksimal 2MB
3. **Rasio**: Foto persegi (1:1) akan terlihat lebih baik
4. **Fallback**: Jika foto tidak ada, sistem otomatis menampilkan icon user

### Export Excel Detail

1. **Analisis Per Siswa**: Buka sheet siswa yang ingin dianalisis
2. **Edit Keterangan**: Keterangan bisa diedit langsung di Excel
3. **Print**: Print per sheet untuk rapor individual
4. **Share**: Kirim file ke orang tua via email

### Export PDF Detail

1. **Cetak Rapor**: Langsung print untuk rapor fisik
2. **Arsip**: Simpan sebagai dokumentasi per siswa
3. **Email Orang Tua**: Kirim PDF individual ke orang tua
4. **Presentasi**: Tampilkan saat konseling siswa

## 🔧 Troubleshooting

### Foto Tidak Muncul

**Penyebab:**
- Field `foto_url` kosong di database
- URL foto tidak valid
- Foto dihapus dari storage
- CORS issue

**Solusi:**
1. Cek field `foto_url` di tabel `data_siswa_keasramaan`
2. Pastikan URL foto accessible (buka di browser)
3. Upload ulang foto jika perlu
4. Gunakan URL dari Supabase Storage

### Tombol Export Detail Tidak Muncul

**Penyebab:**
- Belum klik tab "Detail Kategori"

**Solusi:**
- Klik tab "📋 Detail Kategori" terlebih dahulu
- Tombol export hanya muncul di tab Detail Kategori

### Export Excel Terlalu Besar

**Penyebab:**
- Terlalu banyak siswa (>100)
- Deskripsi terlalu panjang

**Solusi:**
- Filter data per kelas/asrama
- Export per batch (misalnya per kelas)

### PDF Terpotong

**Penyebab:**
- Deskripsi terlalu panjang
- Tabel tidak muat di 1 halaman

**Solusi:**
- Sistem otomatis membuat halaman baru jika perlu
- Cek halaman berikutnya
- Atau edit deskripsi di database agar lebih ringkas

## 📝 Struktur Data

### Field Baru di RekapData

```typescript
interface RekapData {
  // ... field lainnya
  foto_url?: string; // URL foto siswa
}
```

### Query Database

```sql
-- Fetch foto dari data_siswa_keasramaan
SELECT nis, rombel, foto_url 
FROM data_siswa_keasramaan 
WHERE nis IN ('202410009', '202410010', ...);
```

## 🎯 Use Case

### 1. Rapor Individual
```
1. Export PDF Detail
2. Print per halaman (1 siswa = 1 halaman)
3. Serahkan ke siswa/orang tua
```

### 2. Konseling Siswa
```
1. Buka tab Detail Kategori
2. Lihat foto dan detail nilai siswa
3. Diskusikan indikator yang perlu ditingkatkan
```

### 3. Evaluasi Musyrif
```
1. Filter per asrama
2. Export Excel Detail
3. Analisis per siswa di Excel
4. Buat action plan per siswa
```

### 4. Laporan Orang Tua
```
1. Export PDF Detail
2. Kirim via email ke orang tua
3. Orang tua bisa lihat detail pencapaian anak
```

## ✅ Checklist Implementasi

- [x] Tambah field `foto_url` di interface RekapData
- [x] Fetch foto dari `data_siswa_keasramaan`
- [x] Tampilkan foto bulat di Detail Kategori
- [x] Tambah fallback icon jika foto tidak ada
- [x] Buat fungsi `exportDetailToExcel()`
- [x] Buat fungsi `exportDetailToPDF()`
- [x] Tambah tombol export di tab Detail Kategori
- [x] Test export Excel dengan multiple sheets
- [x] Test export PDF dengan multiple pages
- [x] Dokumentasi lengkap

## 🎉 Selesai!

Fitur foto siswa dan export detail kategori sudah siap digunakan. Silakan refresh browser dan test fiturnya!
