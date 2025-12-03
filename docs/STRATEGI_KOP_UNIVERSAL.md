# 🌟 STRATEGI KOP UNIVERSAL

## 💡 Konsep

Sistem download surat izin sekarang menggunakan **strategi pencarian cerdas** untuk menentukan KOP mana yang akan digunakan.

## 🎯 Prioritas Pencarian

### 1️⃣ Prioritas Tertinggi: KOP Template (Universal)
```
Cari data dengan:
- kop_mode = 'template'
- kop_template_url IS NOT NULL
```

**Jika ditemukan:**
- ✅ Gunakan KOP template ini untuk **SEMUA cabang**
- ✅ Tidak perlu cek cabang lagi
- ✅ Satu KOP untuk semua surat izin

**Alasan:**
KOP template biasanya sudah mencakup semua cabang dalam desainnya. Misalnya:
- Header: "PONDOK PESANTREN SMA IT HSI IDN"
- Subheader: "Cabang Purworejo, Sukabumi, Jakarta, dll"
- Logo dan desain universal

### 2️⃣ Prioritas Kedua: KOP Dinamis per Cabang
```
Jika tidak ada KOP template, cari berdasarkan cabang:
1. Ekstrak nama cabang dari format "HSI Boarding School [Cabang]"
2. Cari dengan cabang yang sudah diekstrak
3. Jika tidak ketemu, cari dengan cabang original
```

**Jika ditemukan:**
- ✅ Gunakan data info sekolah untuk cabang tersebut
- ✅ Generate KOP dinamis dari data

### 3️⃣ Fallback: Data Pertama yang Ada
```
Jika semua strategi di atas gagal:
- Ambil data pertama dari tabel info_sekolah_keasramaan
- Gunakan sebagai fallback
```

## 📊 Flow Chart

```
Download Surat
    ↓
Cek: Ada KOP Template?
    ├─ YES → Gunakan KOP Template (UNIVERSAL) ✅
    │         └─ Selesai
    │
    └─ NO → Cari berdasarkan Cabang
            ├─ Found → Gunakan KOP Dinamis (per cabang)
            │          └─ Selesai
            │
            └─ Not Found → Gunakan Data Default (fallback)
                           └─ Selesai
```

## 🎨 Skenario Penggunaan

### Skenario 1: Multi-Cabang dengan KOP Universal
**Setup:**
- Upload 1 KOP template di menu Identitas Sekolah
- Pilih mode "Template (Gambar)"
- KOP sudah mencakup semua cabang

**Hasil:**
- ✅ Semua cabang (Purworejo, Sukabumi, Jakarta, dll) menggunakan KOP yang sama
- ✅ Tidak perlu isi data per cabang
- ✅ Maintenance mudah (update 1 file saja)

### Skenario 2: Multi-Cabang dengan KOP Berbeda
**Setup:**
- Jangan upload KOP template
- Isi data identitas sekolah untuk setiap cabang
- Pilih mode "Dinamis (Text)"

**Hasil:**
- ✅ Setiap cabang punya KOP berbeda
- ✅ Data spesifik per cabang (alamat, telp, dll)
- ✅ Fleksibel untuk customisasi per cabang

### Skenario 3: Testing/Development
**Setup:**
- Belum ada data apapun
- Jalankan SQL fix untuk insert data default

**Hasil:**
- ✅ Sistem gunakan data default
- ✅ Bisa langsung test download
- ✅ Update data nanti sesuai kebutuhan

## 🔧 Implementasi Teknis

### API Route: `app/api/perizinan/generate-surat/route.ts`

```typescript
// Strategi 1: Cari KOP template (prioritas tertinggi)
const { data: templateData } = await supabase
  .from('info_sekolah_keasramaan')
  .select('*')
  .eq('kop_mode', 'template')
  .not('kop_template_url', 'is', null)
  .limit(1)
  .single();

if (templateData) {
  // Gunakan KOP template untuk semua cabang
  infoSekolah = templateData;
} else {
  // Strategi 2: Cari berdasarkan cabang
  // ... (smart matching logic)
}
```

### PDF Generator: `lib/pdf-generator.ts`

```typescript
// Generate KOP based on mode
if (infoSekolah.kop_mode === 'template' && infoSekolah.kop_template_url) {
  // Load dan render KOP template (gambar)
  yPos = await generateKopTemplate(doc, infoSekolah);
} else {
  // Generate KOP dinamis (text)
  yPos = await generateKopDinamis(doc, infoSekolah);
}
```

## ✅ Keuntungan Strategi Ini

1. **Fleksibilitas Tinggi**
   - Support single KOP untuk semua cabang
   - Support KOP berbeda per cabang
   - Support mix & match

2. **User-Friendly**
   - Tidak perlu isi data berulang-ulang
   - Upload 1 file, semua cabang tercover
   - Maintenance mudah

3. **Robust & Reliable**
   - Multiple fallback mechanism
   - Tidak mudah error
   - Graceful degradation

4. **Performance**
   - Query efisien dengan prioritas
   - Cache-friendly
   - Minimal database hits

## 📝 Best Practices

### Untuk Production:
1. ✅ Upload KOP template universal
2. ✅ Pilih mode "Template (Gambar)"
3. ✅ Test download dari berbagai cabang
4. ✅ Pastikan semua data TTD lengkap

### Untuk Development:
1. ✅ Gunakan mode "Dinamis (Text)" untuk testing
2. ✅ Isi data minimal untuk 1 cabang
3. ✅ Test dengan berbagai skenario
4. ✅ Upgrade ke template saat production

## 🆘 Troubleshooting

### KOP tidak sesuai harapan?
**Cek:**
1. Mode KOP apa yang aktif? (template atau dinamis)
2. Apakah ada data dengan kop_mode='template'?
3. Apakah kop_template_url valid dan accessible?

**Query untuk cek:**
```sql
SELECT 
  cabang,
  kop_mode,
  kop_template_url,
  CASE 
    WHEN kop_mode = 'template' AND kop_template_url IS NOT NULL 
    THEN '✅ UNIVERSAL - Digunakan untuk semua cabang'
    ELSE '📝 DINAMIS - Spesifik per cabang'
  END as status
FROM info_sekolah_keasramaan
ORDER BY 
  CASE WHEN kop_mode = 'template' THEN 0 ELSE 1 END,
  cabang;
```

### Ingin ganti dari dinamis ke template?
1. Upload KOP template di menu Identitas Sekolah
2. Pilih mode "Template (Gambar)"
3. Save
4. Test download → Otomatis pakai template

### Ingin ganti dari template ke dinamis?
1. Hapus atau kosongkan kop_template_url
2. Atau ubah kop_mode ke 'dynamic'
3. Isi data per cabang
4. Test download → Otomatis pakai dinamis

---
**Update:** 2024
**Status:** ✅ IMPLEMENTED
**Version:** 2.0
