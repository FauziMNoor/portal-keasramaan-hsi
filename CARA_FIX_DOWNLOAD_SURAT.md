# 🔧 CARA FIX ERROR DOWNLOAD SURAT IZIN

## ❌ Error yang Terjadi
```
Data info sekolah tidak ditemukan untuk cabang HSI Boarding School Sukabumi
404 Not Found
```

## 🎯 Penyebab Masalah

1. **Mismatch Nama Cabang**
   - Di tabel `perizinan_kepulangan_keasramaan`: cabang = "HSI Boarding School Sukabumi"
   - Di tabel `info_sekolah_keasramaan`: cabang = "Sukabumi"
   - Sistem tidak bisa match karena nama berbeda

2. **Data Info Sekolah Belum Ada**
   - Belum ada data di menu Identitas Sekolah untuk cabang tersebut

3. **RLS Policy Terlalu Ketat**
   - Row Level Security menghalangi akses data

## ✅ SOLUSI LENGKAP

### Step 1: Jalankan SQL Fix
Buka **Supabase SQL Editor** dan jalankan file:
```
FIX_INFO_SEKOLAH_CABANG.sql
```

Script ini akan:
- ✅ Fix RLS policies
- ✅ Insert data default untuk setiap cabang
- ✅ Verifikasi matching data

### Step 2: Isi Data Identitas Sekolah
1. Buka menu **Identitas Sekolah**: http://localhost:3000/identitas-sekolah
2. Pilih cabang yang sesuai (misal: Sukabumi)
3. Isi semua data yang diperlukan:
   - Nama Sekolah
   - Alamat Lengkap
   - Kontak (Telp, Email)
   - Nama Kepala Sekolah
   - **Pilih Mode KOP:**
     - **Dinamis (Text)**: KOP dibuat otomatis dari data
     - **Template (Gambar)**: Upload gambar KOP A4 (PNG/JPG)

### Step 3: Upload KOP Template (Jika Pilih Mode Template)
1. Pilih mode "Template (Gambar)"
2. Upload file KOP dengan format:
   - Format: PNG atau JPG
   - Ukuran: A4 (210 x 297 mm)
   - Resolusi: Minimal 300 DPI
   - Max size: 5MB
3. Atur margin konten:
   - Top: 40px (jarak dari atas)
   - Bottom: 30px
   - Left: 20px
   - Right: 20px

### Step 4: Test Download Surat
1. Buka menu **Approval Perizinan**: http://localhost:3000/perizinan/kepulangan/approval
2. Pilih perizinan yang sudah **Disetujui Kepala Sekolah** (status: approved_kepsek)
3. Klik tombol **Download** (icon download ungu)
4. Surat izin akan terdownload dalam format PDF

## 🔍 TROUBLESHOOTING

### Error: "Data info sekolah tidak ditemukan"
**Solusi:**
1. Pastikan sudah jalankan `FIX_INFO_SEKOLAH_CABANG.sql`
2. Cek data di Supabase:
   ```sql
   SELECT * FROM info_sekolah_keasramaan;
   ```
3. Pastikan ada data untuk cabang yang dimaksud

### Error: "Permission denied" saat save
**Solusi:**
1. Jalankan SQL fix RLS policy di `FIX_INFO_SEKOLAH_CABANG.sql`
2. Atau jalankan `FIX_RLS_SIMPLE.sql`

### KOP Template tidak muncul di PDF
**Solusi:**
1. Pastikan file sudah terupload ke bucket `kop-templates-keasramaan`
2. Cek URL di database:
   ```sql
   SELECT cabang, kop_mode, kop_template_url 
   FROM info_sekolah_keasramaan;
   ```
3. Pastikan URL bisa diakses (buka di browser)
4. Cek console browser untuk error CORS atau fetch

### PDF kosong atau error
**Solusi:**
1. Cek console browser (F12) untuk error detail
2. Pastikan semua data perizinan lengkap
3. Pastikan data kepala asrama dan kepala sekolah sudah ada
4. Jika KOP template error, sistem akan fallback ke KOP dinamis

## 🎨 MODE KOP: Dinamis vs Template

### Mode 1: Dinamis (Text-Based)
- KOP dibuat otomatis dari data sistem
- Tidak perlu upload gambar
- **Spesifik per cabang** (setiap cabang bisa punya data berbeda)

### Mode 2: Template (Image-Based) ⭐ RECOMMENDED
- Upload gambar KOP A4 (PNG/JPG)
- **UNIVERSAL untuk SEMUA cabang** 🌟
- Tidak perlu isi data per cabang lagi
- Sistem otomatis prioritaskan KOP template

**💡 PENTING:**
Jika kamu upload KOP template, sistem akan **otomatis menggunakan KOP tersebut untuk SEMUA cabang**. Jadi tidak perlu lagi isi data identitas sekolah untuk setiap cabang. Cukup upload 1 KOP template, dan semua surat izin dari cabang manapun akan menggunakan KOP yang sama!

## 📋 CHECKLIST SEBELUM DOWNLOAD

- [ ] SQL fix sudah dijalankan
- [ ] **PILIH SALAH SATU:**
  - [ ] Mode Dinamis: Data info sekolah sudah diisi untuk cabang yang sesuai
  - [ ] Mode Template: File KOP sudah diupload (1 file untuk semua cabang) ⭐
- [ ] Perizinan sudah disetujui Kepala Sekolah (status: approved_kepsek)
- [ ] Bukti formulir sudah diupload oleh Kepala Asrama

## 🎨 TIPS MEMBUAT KOP TEMPLATE

1. **Desain KOP di aplikasi desain** (Canva, Photoshop, dll)
   - Ukuran: A4 (210 x 297 mm)
   - Resolusi: 300 DPI
   - Format: PNG dengan background transparan atau JPG

2. **Elemen KOP yang perlu ada:**
   - Logo sekolah
   - Nama sekolah
   - Alamat lengkap
   - Kontak (telp, email, website)
   - Garis pemisah header

3. **Sisakan ruang untuk konten:**
   - Top: minimal 40mm untuk header
   - Bottom: minimal 30mm untuk footer/TTD
   - Left & Right: minimal 20mm untuk margin

4. **Export dan Upload:**
   - Save as PNG atau JPG
   - Compress jika lebih dari 5MB
   - Upload di menu Identitas Sekolah

## 📞 BANTUAN

Jika masih ada masalah:
1. Cek console browser (F12) untuk error detail
2. Cek network tab untuk melihat request yang gagal
3. Pastikan semua SQL script sudah dijalankan
4. Restart development server jika perlu

---
**Update Terakhir:** 2024
**Versi:** 2.0
