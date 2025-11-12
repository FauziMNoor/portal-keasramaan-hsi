# 🚀 QUICK FIX: Download Surat Izin Error

## ❌ Error
```
Data info sekolah tidak ditemukan untuk cabang HSI Boarding School Sukabumi
404 Not Found
```

## ✅ Solusi Cepat (3 Langkah)

### 1️⃣ Jalankan SQL Fix
Buka **Supabase SQL Editor** → Copy paste → Run:
```
QUICK_FIX_DOWNLOAD_SURAT.sql
```

### 2️⃣ Isi Data Identitas Sekolah
- Buka: http://localhost:3000/identitas-sekolah
- **Pilih Mode KOP:**
  - **Template (Gambar)** ⭐ RECOMMENDED
    - Upload 1 gambar KOP A4
    - **UNIVERSAL untuk SEMUA cabang** 🌟
    - Tidak perlu isi data per cabang lagi
  - **Dinamis (Text)**
    - KOP otomatis dari data
    - Perlu isi data per cabang
    - Fleksibel untuk customisasi

### 3️⃣ Test Download
- Buka: http://localhost:3000/perizinan/kepulangan/approval
- Pilih perizinan yang sudah **approved_kepsek**
- Klik tombol **Download** (icon ungu)
- ✅ PDF terdownload!

## 📚 Dokumentasi Lengkap

- **Quick Fix:** `QUICK_FIX_DOWNLOAD_SURAT.sql`
- **Panduan Lengkap:** `CARA_FIX_DOWNLOAD_SURAT.md`
- **Technical Details:** `FIX_SUMMARY_DOWNLOAD_SURAT.md`
- **Advanced Fix:** `FIX_INFO_SEKOLAH_CABANG.sql`

## 🆘 Masih Error?

1. Cek console browser (F12)
2. Cek server log di terminal
3. Baca `CARA_FIX_DOWNLOAD_SURAT.md`

---
**Status:** ✅ FIXED | **Update:** 2024
