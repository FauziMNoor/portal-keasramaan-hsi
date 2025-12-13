# 📄 API Generate Rapor Documentation

## Overview

API untuk generate rapor santri berdasarkan data habit tracker, kegiatan, dan dokumentasi yang sudah di-setup.

---

## 🔄 Flow Generate Rapor

```
1. User pilih filter & mode
   ↓
2. Frontend call API /api/rapor/generate
   ↓
3. Backend compile data:
   - Data santri (dari data_siswa_keasramaan)
   - Rekap habit tracker (dari formulir_habit_tracker_keasramaan)
   - Mapping ke indikator (dari indikator_keasramaan)
   - Data kegiatan (dari rapor_kegiatan_keasramaan)
   - Data dokumentasi (dari rapor_dokumentasi_lainnya_keasramaan)
   - Catatan musyrif (dari rapor_catatan_keasramaan)
   ↓
4. Generate Google Slides:
   - Copy template
   - Replace placeholder dengan data
   ↓
5. Export to PDF
   ↓
6. Upload PDF to Supabase Storage
   ↓
7. Save log to rapor_generate_log_keasramaan
   ↓
8. Return PDF URL to frontend
```

---

## 📡 API Endpoint

### **POST /api/rapor/generate**

Generate rapor santri (single atau batch).

#### **Request Body:**

```json
{
  "mode": "single" | "kelas" | "asrama",
  "cabang": "string",
  "tahunAjaran": "string",
  "semester": "string",
  "kelas": "string",
  "asrama": "string",
  "nis": "string" // required for mode=single
}
```

#### **Response (Success - Single):**

```json
{
  "success": true,
  "message": "Rapor berhasil di-generate!",
  "data": {
    "pdf_url": "https://...",
    "presentation_url": "https://docs.google.com/presentation/d/..."
  }
}
```

#### **Response (Success - Batch):**

```json
{
  "success": true,
  "message": "Batch generate selesai: 25 berhasil, 2 gagal",
  "data": {
    "batch_id": "uuid",
    "total": 27,
    "success": 25,
    "failed": 2,
    "results": [
      {
        "nis": "12345",
        "nama_siswa": "Ahmad",
        "success": true,
        "pdf_url": "https://..."
      },
      ...
    ]
  }
}
```

#### **Response (Error):**

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🔧 Helper Functions

### **1. rekapHabitTracker()**

Merekap data habit tracker per santri per semester.

**Input:**
- `nis`: NIS santri
- `tahunAjaran`: Tahun ajaran
- `semester`: Semester

**Output:**
```typescript
{
  success: true,
  data: {
    nis: "12345",
    nama_siswa: "Ahmad",
    total_entry: 30,
    periode_mulai: "2024-01-01",
    periode_selesai: "2024-06-30",
    shalat_fardhu_berjamaah_nilai: 3,
    shalat_fardhu_berjamaah_deskripsi: "Selalu melaksanakan...",
    // ... 20 habit lainnya
  }
}
```

**Logic:**
1. Fetch semua entry habit tracker untuk santri di semester tersebut
2. Hitung rata-rata nilai per habit
3. Bulatkan ke integer terdekat
4. Mapping ke indikator untuk dapat deskripsi

---

### **2. compileRaporData()**

Compile semua data yang dibutuhkan untuk rapor.

**Input:**
```typescript
{
  nis: string;
  cabang: string;
  tahunAjaran: string;
  semester: string;
  kelas: string;
  asrama: string;
}
```

**Output:**
```typescript
{
  success: true,
  data: {
    santri: {...},      // Data santri
    habit: {...},       // Rekap habit tracker
    kegiatan: [...],    // 6 kegiatan
    dokumentasi: [...], // Foto dokumentasi
    catatan: {...}      // Catatan musyrif
  }
}
```

---

### **3. generateRaporSlides()**

Generate Google Slides dari template.

**Input:**
```typescript
{
  santriData: any;
  habitData: any;
  kegiatanData: any;
  replacements: {
    "<<Placeholder>>": "Value",
    ...
  }
}
```

**Output:**
```typescript
{
  success: true,
  presentationId: "google-slides-id",
  url: "https://docs.google.com/presentation/d/..."
}
```

---

### **4. exportToPDF()**

Export Google Slides to PDF.

**Input:**
- `presentationId`: Google Slides ID

**Output:**
```typescript
{
  success: true,
  pdfBuffer: Buffer
}
```

---

### **5. uploadPDFRapor()**

Upload PDF to Supabase Storage.

**Input:**
```typescript
{
  pdfBuffer: Buffer,
  metadata: {
    cabang: string,
    tahun_ajaran: string,
    semester: string,
    nis: string,
    nama_siswa: string
  }
}
```

**Output:**
```typescript
{
  success: true,
  path: "Pusat/2024-2025/Ganjil/12345-Ahmad.pdf",
  url: "https://..."
}
```

---

## 📊 Data Mapping

### **Habit Tracker → Indikator**

**Example:**

**Habit Tracker Entry:**
```
shalat_fardhu_berjamaah: "3"
```

**Rekap (Average):**
```
shalat_fardhu_berjamaah_nilai: 3
```

**Indikator Mapping:**
```sql
SELECT deskripsi FROM indikator_keasramaan
WHERE nama_indikator = 'Shalat Fardhu Berjamaah'
  AND nilai_angka = 3;
```

**Result:**
```
"Selalu melaksanakan shalat berjamaah dengan tertib"
```

**Output to Rapor:**
```
<<Shalat Fardhu Berjamaah>> → "Selalu melaksanakan shalat berjamaah dengan tertib"
```

---

## 🎨 Template Placeholder

Template Google Slides harus memiliki placeholder berikut:

### **Data Santri:**
- `<<Foto Santri>>`
- `<<Nama Santri>>`
- `<<Semester>>`
- `<<Tahun Ajaran>>`

### **Habit Tracker (21 habits):**
- `<<Shalat Fardhu Berjamaah>>`
- `<<Tata Cara Shalat>>`
- `<<Qiyamul Lail>>`
- `<<Shalat Sunnah>>`
- `<<Puasa Sunnah>>`
- `<<Tata Cara Wudhu>>`
- `<<Sedekah>>`
- `<<Dzikir Pagi Petang>>`
- `<<Etika Dalam Tutur Kata>>`
- `<<Etika Dalam Bergaul>>`
- `<<Etika Dalam Berpakaian>>`
- `<<Adab Sehari-hari>>`
- `<<Waktu Tidur>>`
- `<<Pelaksanaan Piket Kamar>>`
- `<<Disiplin Halaqah Tahfidz>>`
- `<<Perizinan>>`
- `<<Belajar Malam>>`
- `<<Disiplin Berangkat ke Masjid>>`
- `<<Kebersihan Tubuh, Berpakaian & Berpenampilan>>`
- `<<Kamar>>`
- `<<Ranjang & Almari>>`

### **Kegiatan (6 kegiatan):**
- `<<Nama Kegiatan 1>>` ... `<<Nama Kegiatan 6>>`
- `<<Foto Kegiatan 1a>>` ... `<<Foto Kegiatan 6b>>`
- `<<Ket Kegiatan 1>>` ... `<<Ket Kegiatan 6>>`

### **Dokumentasi:**
- `<<Dokumentasi Program Lainnya>>`

### **Catatan & Pengesahan:**
- `<<Catatan Musyrif>>`
- `<<Ketua Asrama>>`
- `<<Musyrif>>`

---

## 🐛 Error Handling

### **Common Errors:**

1. **"Data santri tidak ditemukan"**
   - Santri dengan NIS tersebut tidak ada di database
   - Solusi: Cek data_siswa_keasramaan

2. **"Data habit tracker tidak ditemukan"**
   - Tidak ada entry habit tracker untuk santri di semester tersebut
   - Solusi: Input habit tracker dulu

3. **"Failed to generate Google Slides"**
   - Template ID salah
   - Service account tidak punya akses ke template
   - Solusi: Cek GOOGLE_SLIDES_TEMPLATE_ID dan share template

4. **"Failed to export PDF"**
   - Google API error
   - Solusi: Cek credentials dan quota

5. **"Failed to upload PDF"**
   - Storage bucket tidak ada
   - RLS policy menghalangi
   - Solusi: Cek bucket rapor-pdf dan policies

---

## 📝 Database Log

Setiap generate akan di-log ke `rapor_generate_log_keasramaan`:

```sql
INSERT INTO rapor_generate_log_keasramaan (
  batch_id,
  nis,
  nama_siswa,
  cabang,
  tahun_ajaran,
  semester,
  kelas,
  asrama,
  mode_generate,
  status,
  presentation_id,
  pdf_url,
  error_message,
  generated_at
) VALUES (...);
```

**Status:**
- `success`: Generate berhasil
- `failed`: Generate gagal

---

## 🚀 Testing

### **Test Single Generate:**

```bash
curl -X POST http://localhost:3000/api/rapor/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "cabang": "Pusat",
    "tahunAjaran": "2024/2025",
    "semester": "Ganjil",
    "kelas": "7",
    "asrama": "Asrama A",
    "nis": "12345"
  }'
```

### **Test Batch Generate:**

```bash
curl -X POST http://localhost:3000/api/rapor/generate \
  -H "Content-Type": application/json" \
  -d '{
    "mode": "kelas",
    "cabang": "Pusat",
    "tahunAjaran": "2024/2025",
    "semester": "Ganjil",
    "kelas": "7",
    "asrama": "Asrama A"
  }'
```

---

## ⚠️ Important Notes

1. **Google Slides Template** harus sudah di-share ke service account
2. **Habit Tracker** harus sudah diinput untuk santri yang akan di-generate
3. **Kegiatan & Dokumentasi** harus sudah di-setup di halaman Setup Rapor
4. **Indikator Penilaian** harus sudah ada di database
5. **Storage Bucket** `rapor-pdf` harus sudah dibuat

---

## 🎯 Next Improvements

- [ ] Add image insertion untuk foto kegiatan
- [ ] Add progress callback untuk batch generate
- [ ] Add queue system untuk batch generate (background job)
- [ ] Add email notification setelah generate selesai
- [ ] Add preview rapor sebelum generate
- [ ] Add custom template per cabang
