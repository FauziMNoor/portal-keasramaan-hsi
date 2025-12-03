# ⚡ FITUR KOP SURAT DINAMIS

## 🎯 Overview

Fitur revolusioner yang memungkinkan 2 mode KOP surat:

### Mode 1: KOP Dinamis (Text-Based) ✨
Generate KOP otomatis dari data sistem:
- Logo sekolah
- Nama sekolah & nama singkat
- Alamat lengkap
- Kontak (telepon, email, website)
- Garis pemisah profesional

### Mode 2: KOP Template (Image-Based) 🖼️
Upload template KOP full A4 sebagai background:
- Upload PNG/JPG ukuran A4 (210mm x 297mm)
- Konten surat overlay di atas template
- Atur margin area konten
- Cocok untuk KOP yang sudah di-design

---

## 🎨 Fitur Utama

### 1. ✅ Pilihan Mode Fleksibel
- Radio button untuk pilih mode
- Switch antar mode kapan saja
- Preview real-time

### 2. ✅ Upload Template KOP
- Drag & drop atau klik upload
- Validasi file type (PNG/JPG)
- Validasi ukuran (max 10MB)
- Preview template sebelum save
- Hapus template jika tidak cocok

### 3. ✅ Pengaturan Margin
- Margin atas (top)
- Margin bawah (bottom)
- Margin kiri (left)
- Margin kanan (right)
- Satuan: milimeter (mm)
- Untuk positioning konten yang tepat

### 4. ✅ Auto-Populate Kepala Asrama
- Data diambil dari Master Kepala Asrama
- Ter-filter per cabang
- Link langsung ke halaman master
- Info jika belum ada data

### 5. ✅ Multi-Cabang Support
- Setiap cabang punya KOP sendiri
- Data otomatis sesuai cabang user
- Template KOP per cabang

---

## 📁 File Structure

### Database:
- `MIGRATION_KOP_DINAMIS.sql` - Migration untuk kolom KOP

### Frontend:
- `app/identitas-sekolah/page.tsx` - Form input identitas & KOP

### Backend:
- `app/api/perizinan/generate-surat/route.ts` - API generate PDF
- `lib/pdf-generator.ts` - Library generate PDF dengan KOP

### Storage:
- Bucket: `kop-templates-keasramaan` - Untuk template KOP

---

## 🗄️ Database Schema

### Tabel: `info_sekolah_keasramaan`

**Kolom Baru:**
```sql
kop_mode TEXT DEFAULT 'dynamic'
  -- 'dynamic' atau 'template'

kop_template_url TEXT
  -- URL template KOP dari storage

kop_content_margin_top INTEGER DEFAULT 40
  -- Margin atas konten (mm)

kop_content_margin_bottom INTEGER DEFAULT 30
  -- Margin bawah konten (mm)

kop_content_margin_left INTEGER DEFAULT 20
  -- Margin kiri konten (mm)

kop_content_margin_right INTEGER DEFAULT 20
  -- Margin kanan konten (mm)
```

---

## 🚀 Cara Menggunakan

### Mode 1: KOP Dinamis (Default)

1. **Login** ke sistem
2. **Buka** menu "Identitas Sekolah"
3. **Isi** data lengkap:
   - Nama sekolah
   - Alamat
   - Kontak
   - Upload logo (opsional)
4. **Pilih** Mode 1: KOP Dinamis
5. **Simpan**
6. **Generate** surat izin → KOP otomatis ter-generate

**Hasil:**
```
┌─────────────────────────────────────┐
│ 🕌 PONDOK PESANTREN SMA IT HSI IDN  │
│     HSI BOARDING SCHOOL             │
│ Jl. Alamat Lengkap, Kota            │
│ Telp. (0275) 123456 | Email: ...    │
│ ═══════════════════════════════════ │
│                                     │
│   SURAT IZIN KEPULANGAN SANTRI      │
│   Nomor: ...                        │
│                                     │
│   [Konten Surat]                    │
│                                     │
└─────────────────────────────────────┘
```

### Mode 2: KOP Template

1. **Login** ke sistem
2. **Buka** menu "Identitas Sekolah"
3. **Pilih** Mode 2: KOP Template
4. **Upload** template KOP full A4:
   - Format: PNG atau JPG
   - Ukuran: 210mm x 297mm (A4)
   - Resolusi: 300dpi (2480px x 3508px)
   - Max: 10MB
5. **Atur** margin area konten:
   - Margin atas: 40mm (default)
   - Margin bawah: 30mm (default)
   - Margin kiri: 20mm (default)
   - Margin kanan: 20mm (default)
6. **Preview** template
7. **Simpan**
8. **Generate** surat izin → Template sebagai background

**Hasil:**
```
┌─────────────────────────────────────┐
│ [TEMPLATE KOP FULL A4 SEBAGAI BG]   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Area Konten dengan Margin] │   │
│   │                             │   │
│   │ SURAT IZIN KEPULANGAN       │   │
│   │ Nomor: ...                  │   │
│   │                             │   │
│   │ [Konten Surat]              │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│ [TEMPLATE KOP FULL A4 SEBAGAI BG]   │
└─────────────────────────────────────┘
```

---

## 📐 Panduan Ukuran Template KOP

### Ukuran A4:
- **Milimeter:** 210mm x 297mm
- **Pixel (72dpi):** 595px x 842px
- **Pixel (150dpi):** 1240px x 1754px
- **Pixel (300dpi):** 2480px x 3508px ⭐ **Recommended**

### Tips Design Template:
1. **Header Area:** 30-50mm dari atas
2. **Footer Area:** 20-30mm dari bawah
3. **Content Area:** Sisakan ruang di tengah
4. **Margin Safe Zone:** Min 10mm dari tepi
5. **Format:** PNG dengan transparency atau JPG

### Contoh Margin Settings:
```
Header tinggi 40mm → Margin Top: 40mm
Footer tinggi 30mm → Margin Bottom: 30mm
Side margin 20mm → Margin Left/Right: 20mm
```

---

## 🎨 UI/UX

### Halaman Identitas Sekolah

**Section KOP Surat:**
```
⚡ KOP Surat Dinamis
┌─────────────────────────────────────────┐
│ 🎯 Pilih Mode KOP Surat:                │
│                                         │
│ ○ Mode 1: KOP Dinamis (Text-Based)     │
│   Generate KOP otomatis dari data       │
│                                         │
│ ● Mode 2: KOP Template (Image-Based)   │
│   Upload template KOP full A4           │
└─────────────────────────────────────────┘

[Upload Template KOP Full A4]
┌─────────────────────────────────────────┐
│ 📐 Ukuran: A4 (210mm x 297mm)           │
│ 📄 Format: PNG atau JPG                 │
│ 💾 Max: 10MB                            │
└─────────────────────────────────────────┘

[Preview Template]

📏 Pengaturan Area Konten (mm)
┌──────┬──────┬──────┬──────┐
│ Top  │Bottom│ Left │Right │
│ [40] │ [30] │ [20] │ [20] │
└──────┴──────┴──────┴──────┘
```

---

## 🔄 Alur Generate Surat

### Mode Dinamis:
```
1. User klik "Download Surat"
   ↓
2. API: /api/perizinan/generate-surat
   ↓
3. Load data perizinan & info sekolah
   ↓
4. Cek kop_mode = 'dynamic'
   ↓
5. Generate KOP dari data:
   - Logo (jika ada)
   - Nama sekolah
   - Alamat
   - Kontak
   - Garis pemisah
   ↓
6. Generate konten surat
   ↓
7. Return PDF
```

### Mode Template:
```
1. User klik "Download Surat"
   ↓
2. API: /api/perizinan/generate-surat
   ↓
3. Load data perizinan & info sekolah
   ↓
4. Cek kop_mode = 'template'
   ↓
5. Load template image dari storage
   ↓
6. Add image sebagai background (full page)
   ↓
7. Generate konten surat dengan margin:
   - Top: kop_content_margin_top
   - Bottom: kop_content_margin_bottom
   - Left: kop_content_margin_left
   - Right: kop_content_margin_right
   ↓
8. Return PDF
```

---

## 🧪 Testing

### Test Case 1: Mode Dinamis
```
1. Login → Identitas Sekolah
2. Pilih Mode 1: KOP Dinamis
3. Isi data lengkap
4. Simpan
5. Buat perizinan → Approve
6. Download surat
7. Verify: KOP ter-generate dari data
```

### Test Case 2: Mode Template
```
1. Login → Identitas Sekolah
2. Pilih Mode 2: KOP Template
3. Upload template A4
4. Atur margin (40, 30, 20, 20)
5. Simpan
6. Buat perizinan → Approve
7. Download surat
8. Verify: Template sebagai background
9. Verify: Konten tidak tertimpa header/footer
```

### Test Case 3: Switch Mode
```
1. Mode Dinamis → Generate surat → OK
2. Switch ke Mode Template
3. Upload template
4. Generate surat → OK
5. Switch kembali ke Mode Dinamis
6. Generate surat → OK
```

---

## 🐛 Troubleshooting

### Template Tidak Muncul
**Masalah:** Template tidak ter-load di PDF

**Solusi:**
1. Cek URL template di database
2. Cek storage bucket & policies
3. Cek format file (PNG/JPG)
4. Cek ukuran file (<10MB)

### Konten Tertimpa Header/Footer
**Masalah:** Text konten tertimpa template

**Solusi:**
1. Atur margin top lebih besar
2. Atur margin bottom lebih besar
3. Ukur tinggi header/footer di template
4. Set margin sesuai ukuran

### Upload Gagal
**Masalah:** Error saat upload template

**Solusi:**
1. Cek bucket `kop-templates-keasramaan` sudah dibuat
2. Cek storage policies
3. Cek ukuran file
4. Cek format file

---

## 📊 Benefits

### Untuk Sekolah:
- ✅ Fleksibilitas tinggi
- ✅ Bisa pakai design sendiri
- ✅ Profesional & konsisten
- ✅ Hemat waktu

### Untuk Developer:
- ✅ Modular & maintainable
- ✅ Easy to extend
- ✅ Clean code structure
- ✅ Well documented

### Untuk User:
- ✅ Mudah digunakan
- ✅ Preview real-time
- ✅ Tidak perlu coding
- ✅ Hasil profesional

---

## 🔮 Future Improvements

- [ ] Multiple templates per cabang
- [ ] Template gallery/library
- [ ] Drag & drop positioning
- [ ] Visual margin editor
- [ ] Template preview before save
- [ ] Export template settings
- [ ] Import template settings
- [ ] Template versioning

---

## 📞 Support

**Dokumentasi:**
- `FITUR_KOP_DINAMIS.md` - Dokumentasi lengkap (file ini)
- `MIGRATION_KOP_DINAMIS.sql` - Migration SQL
- `lib/pdf-generator.ts` - Source code generator

**Jika ada masalah:**
1. Cek dokumentasi
2. Cek troubleshooting section
3. Hubungi tim development

---

**Version:** 1.0.0
**Last Updated:** 2025-11-12
**Status:** ✅ READY FOR PRODUCTION
