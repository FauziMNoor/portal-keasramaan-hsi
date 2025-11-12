# 📄 FITUR DOWNLOAD SURAT: PDF & WORD

## 🎯 Fitur Baru

Sistem download surat izin sekarang mendukung **2 format**:
1. **PDF** - Format final, siap cetak
2. **WORD (DOCX)** - Format editable, bisa diperbaiki jika ada kesalahan

## ✨ Keunggulan

### Format PDF
- ✅ Siap cetak langsung
- ✅ Layout terjaga
- ✅ Tidak bisa diedit (final)
- ✅ Universal (bisa dibuka di semua device)

### Format WORD (DOCX)
- ✅ **Bisa diedit** jika ada kesalahan
- ✅ Bisa ubah teks, format, dll
- ✅ Bisa tambah/hapus konten
- ✅ Fleksibel untuk customisasi
- ✅ Support KOP template (gambar)

## 🚀 Cara Menggunakan

### Step 1: Buka Halaman Approval
```
http://localhost:3000/perizinan/kepulangan/approval
```

### Step 2: Pilih Perizinan yang Sudah Disetujui
- Status harus: **Disetujui Kepala Sekolah** (approved_kepsek)
- Klik tombol **Download** (icon ungu)

### Step 3: Pilih Format
Menu dropdown akan muncul dengan 2 pilihan:
- 📄 **Download PDF** - Format final
- 📝 **Download Word** - Format editable

### Step 4: Edit (Jika Perlu)
Jika download Word:
1. Buka file .docx di Microsoft Word / Google Docs / LibreOffice
2. Edit sesuai kebutuhan:
   - Ubah teks
   - Isi nomor surat (yang dikosongkan)
   - Perbaiki typo
   - Tambah/hapus konten
3. Save dan cetak

## 📋 Perubahan Nomor Surat

### Sebelumnya:
```
Nomor: 2025/01/F1768C44
```
(Auto-generated, tidak bisa diubah)

### Sekarang:
```
Nomor: ......................................
```
(Dikosongkan, user isi manual sesuai sistem penomoran masing-masing)

**Alasan:**
- Setiap sekolah punya sistem penomoran berbeda
- Lebih fleksibel
- User bisa isi sesuai kebutuhan

## 🎨 KOP Template di Word

### Mode Template (Gambar)
Jika menggunakan KOP template:
- ✅ Gambar KOP akan muncul di header Word
- ✅ Ukuran otomatis disesuaikan (A4 width)
- ✅ Bisa diedit/diganti jika perlu

### Mode Dinamis (Text)
Jika menggunakan KOP dinamis:
- ✅ Header text-based
- ✅ Bisa diedit langsung di Word
- ✅ Fleksibel untuk customisasi

## 🔧 Technical Details

### Library yang Digunakan
- **jsPDF** - Generate PDF
- **docx** - Generate DOCX
- **file-saver** - Save file

### API Endpoints
```
POST /api/perizinan/generate-surat       → PDF
POST /api/perizinan/generate-surat-docx  → DOCX
```

### File Structure
```
portal-keasramaan/
├── lib/
│   ├── pdf-generator.ts      ✏️ Updated (nomor surat dikosongkan)
│   └── docx-generator.ts     ✨ New (generate DOCX)
├── app/api/perizinan/
│   ├── generate-surat/route.ts       ✅ Existing (PDF)
│   └── generate-surat-docx/route.ts  ✨ New (DOCX)
└── app/perizinan/kepulangan/approval/
    └── page.tsx              ✏️ Updated (dropdown menu)
```

## 💡 Use Cases

### Use Case 1: Surat Standar (Tidak Ada Kesalahan)
**Pilih:** PDF
- Download langsung
- Cetak
- Selesai ✅

### Use Case 2: Perlu Edit Nomor Surat
**Pilih:** Word
- Download DOCX
- Buka di Word
- Isi nomor surat: `Nomor: 001/HSI/PWR/I/2025`
- Save as PDF
- Cetak ✅

### Use Case 3: Ada Typo atau Kesalahan Data
**Pilih:** Word
- Download DOCX
- Buka di Word
- Perbaiki kesalahan
- Save as PDF
- Cetak ✅

### Use Case 4: Perlu Customisasi
**Pilih:** Word
- Download DOCX
- Buka di Word
- Tambah/ubah konten sesuai kebutuhan
- Format ulang jika perlu
- Save as PDF
- Cetak ✅

## 🎯 Best Practices

### Untuk Admin/Kepala Sekolah:
1. **Cek data dulu** sebelum approve
2. Jika data sudah benar → Download **PDF**
3. Jika perlu edit → Download **Word**
4. Simpan file asli (DOCX) untuk arsip

### Untuk Kepala Asrama:
1. Pastikan data santri lengkap
2. Upload bukti formulir
3. Setelah approved → Download sesuai kebutuhan
4. Isi nomor surat manual di Word

### Untuk Sistem Penomoran:
1. Buat sistem penomoran sendiri (misal: 001/HSI/PWR/I/2025)
2. Download Word
3. Isi nomor surat sesuai sistem
4. Save dan cetak

## 🆘 Troubleshooting

### Download Word Gagal
**Solusi:**
1. Cek console browser (F12) untuk error
2. Pastikan package `docx` sudah terinstall
3. Restart development server

### KOP Tidak Muncul di Word
**Solusi:**
1. Cek apakah KOP template URL valid
2. Cek bucket storage sudah public
3. Lihat console untuk error detail
4. Fallback: Sistem akan gunakan KOP text-based

### File Word Corrupt
**Solusi:**
1. Download ulang
2. Coba buka di aplikasi lain (Google Docs, LibreOffice)
3. Cek console untuk error saat generate

### Dropdown Menu Tidak Muncul
**Solusi:**
1. Refresh halaman
2. Clear browser cache
3. Cek apakah perizinan sudah approved_kepsek

## 📊 Comparison

| Aspek | PDF | Word |
|-------|-----|------|
| Editable | ❌ Tidak | ✅ Ya |
| Layout | ✅ Terjaga | ⚠️ Bisa berubah |
| File Size | Kecil | Sedang |
| Compatibility | Universal | Perlu Word/Docs |
| Use Case | Final, siap cetak | Perlu edit |
| KOP Template | ✅ Support | ✅ Support |

## 🎉 Kesimpulan

Dengan fitur ini:
- ✅ Lebih fleksibel (bisa edit jika perlu)
- ✅ Nomor surat bisa diisi manual
- ✅ Support 2 format (PDF & Word)
- ✅ KOP template work di kedua format
- ✅ User experience lebih baik

**Rekomendasi:**
- Gunakan **PDF** untuk surat final yang sudah benar
- Gunakan **Word** jika perlu edit atau isi nomor surat manual

---
**Update:** 2024
**Status:** ✅ IMPLEMENTED
**Version:** 2.0
