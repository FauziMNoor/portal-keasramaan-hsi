# Generate Rapor Module - Implementation Summary

## Overview
Modul Generate Rapor telah berhasil diimplementasikan. Modul ini memungkinkan admin untuk generate rapor PDF secara otomatis untuk siswa, baik single maupun bulk.

## Files Created

### 1. API Routes

#### Single PDF Generation
**File:** `app/api/rapor/generate/single/route.ts`
- Endpoint: `POST /api/rapor/generate/single`
- Fungsi: Generate rapor PDF untuk satu siswa
- Features:
  - Fetch template dan pages
  - Fetch siswa data dan capaian indikator
  - Render semua page types (cover, data, galeri, QR code)
  - Upload PDF ke Supabase Storage
  - Save history ke database
  - Error handling dengan status tracking

#### Bulk PDF Generation
**File:** `app/api/rapor/generate/bulk/route.ts`
- Endpoint: `POST /api/rapor/generate/bulk`
- Fungsi: Generate rapor PDF untuk multiple siswa sekaligus
- Features:
  - Batch processing (10 siswa per batch)
  - Parallel processing untuk efisiensi
  - Error handling per siswa
  - Progress tracking
  - Summary statistics

#### Master Data APIs
**Files:**
- `app/api/master/tahun-ajaran/route.ts`
- `app/api/master/semester/route.ts`

Endpoint untuk fetch data tahun ajaran dan semester yang aktif.

### 2. Frontend Pages

#### Generate Interface Page
**File:** `app/manajemen-rapor/generate-rapor/page.tsx`
- Route: `/manajemen-rapor/generate-rapor`
- Features:
  - Template selector dengan info detail
  - Periode selector (tahun ajaran & semester)
  - Mode selector (Single/Bulk)
  - Single mode: Input NIS satu siswa
  - Bulk mode: Textarea untuk multiple NIS (satu per baris)
  - Generate button dengan loading state
  - Results display dengan progress component

### 3. Components

#### Generate Progress Component
**File:** `components/rapor/GenerateProgress.tsx`
- Reusable component untuk menampilkan progress dan hasil generate
- Features:
  - Progress bar dengan percentage
  - Summary cards (Total, Berhasil, Gagal, Proses)
  - Detail list per siswa dengan status
  - Download button per siswa
  - Download all button untuk semua PDF yang berhasil
  - Support untuk processing state (untuk future streaming)

## How It Works

### Single Generate Flow
1. User pilih template, periode, dan masukkan NIS siswa
2. Click "Generate Rapor"
3. System create history record dengan status "processing"
4. System fetch template dan pages
5. System fetch siswa data dan capaian
6. System render setiap page sesuai tipe:
   - **static_cover**: Render cover dengan overlay data siswa
   - **dynamic_data**: Render tabel/list capaian indikator
   - **galeri_kegiatan**: Render foto kegiatan (filtered by scope)
   - **qr_code**: Generate QR code untuk galeri online
7. System compile semua pages menjadi PDF
8. System upload PDF ke Supabase Storage
9. System update history record dengan status "completed" dan PDF URL
10. User dapat download PDF

### Bulk Generate Flow
1. User pilih template, periode, dan masukkan multiple NIS (satu per baris)
2. Click "Generate Rapor"
3. System split NIS list menjadi batches (10 per batch)
4. System process setiap batch secara parallel
5. Setiap siswa di-generate menggunakan single generate API
6. System collect results dari semua batches
7. System tampilkan summary dan detail results
8. User dapat download PDF per siswa atau semua sekaligus

## Page Rendering Details

### Cover Page (static_cover)
- Render full-page cover image
- Overlay data siswa (nama, NIS, tahun ajaran, semester, kelas, asrama)
- Configurable position dan font size untuk setiap field

### Data Page (dynamic_data)
- Render capaian indikator siswa
- Grouped by kategori (Ubudiyah, Akhlak, Kedisiplinan)
- Support layout: list atau table
- Show nilai dan deskripsi capaian
- Handle missing data dengan placeholder

### Galeri Page (galeri_kegiatan)
- Render foto kegiatan
- Support layouts: grid-2, grid-4, grid-6, collage
- Auto-select kegiatan by scope (kelas/asrama siswa)
- Auto-paginate jika foto terlalu banyak
- Show caption per foto

### QR Code Page (qr_code)
- Generate unique QR code per siswa
- QR code mengarah ke galeri online
- Configurable position, size, dan text
- Show siswa info dan URL

## Error Handling

### Single Generate
- Template not found → Error message
- Missing pages → Error message
- Missing siswa data → Use placeholder
- Missing capaian → Show "-" atau empty
- Photo load failure → Skip photo, continue
- PDF generation failure → Update history dengan status "failed"

### Bulk Generate
- Error per siswa tidak menghentikan proses
- Setiap error di-track dan di-report
- Summary menunjukkan berapa yang berhasil dan gagal
- Detail error message per siswa

## Database Tables Used

### Read Operations
- `rapor_template_keasramaan` - Template info
- `rapor_template_page_keasramaan` - Pages dalam template
- `rapor_kategori_indikator_keasramaan` - Kategori indikator
- `rapor_indikator_keasramaan` - Indikator list
- `rapor_capaian_siswa_keasramaan` - Capaian siswa
- `kegiatan_asrama_keasramaan` - Kegiatan list
- `kegiatan_galeri_keasramaan` - Foto kegiatan
- `tahun_ajaran_keasramaan` - Tahun ajaran aktif
- `semester_keasramaan` - Semester aktif

### Write Operations
- `rapor_generate_history_keasramaan` - History generate
- `rapor_galeri_token_keasramaan` - QR code tokens

### Storage
- Bucket: `rapor-pdf` - Untuk menyimpan PDF yang di-generate

## Usage Example

### Single Generate
```typescript
POST /api/rapor/generate/single
{
  "template_id": "uuid-template",
  "siswa_nis": "12345",
  "tahun_ajaran": "2024/2025",
  "semester": "Ganjil"
}

Response:
{
  "success": true,
  "data": {
    "history_id": "uuid-history",
    "pdf_url": "https://storage.supabase.co/.../rapor_12345_2024-2025_Ganjil_1234567890.pdf",
    "siswa_nis": "12345",
    "tahun_ajaran": "2024/2025",
    "semester": "Ganjil"
  },
  "message": "Rapor berhasil di-generate"
}
```

### Bulk Generate
```typescript
POST /api/rapor/generate/bulk
{
  "template_id": "uuid-template",
  "siswa_nis_list": ["12345", "12346", "12347"],
  "tahun_ajaran": "2024/2025",
  "semester": "Ganjil"
}

Response:
{
  "success": true,
  "data": {
    "total": 3,
    "completed": 2,
    "failed": 1,
    "results": [
      {
        "siswa_nis": "12345",
        "status": "completed",
        "pdf_url": "https://...",
        "history_id": "uuid-1"
      },
      {
        "siswa_nis": "12346",
        "status": "completed",
        "pdf_url": "https://...",
        "history_id": "uuid-2"
      },
      {
        "siswa_nis": "12347",
        "status": "failed",
        "error_message": "Template tidak memiliki halaman"
      }
    ]
  },
  "message": "Bulk generate selesai: 2 berhasil, 1 gagal"
}
```

## Next Steps

1. **Testing**: Test dengan berbagai skenario:
   - Template dengan berbagai kombinasi page types
   - Siswa dengan data lengkap dan tidak lengkap
   - Bulk generate dengan jumlah siswa besar (50+)
   - Error scenarios

2. **Optimization**:
   - Implement caching untuk template dan kategori
   - Optimize image loading untuk galeri
   - Consider background job untuk bulk generate yang sangat besar

3. **Enhancement**:
   - Add preview before generate
   - Add email notification setelah generate selesai
   - Add download history page
   - Add regenerate option

## Notes

- PDF generation menggunakan jsPDF library
- QR code generation menggunakan qrcode library
- File upload ke Supabase Storage bucket `rapor-pdf`
- Batch size untuk bulk generate: 10 siswa per batch (configurable)
- Semua error di-log dan di-track di history table

## Dependencies

Pastikan packages berikut sudah terinstall:
- jspdf
- jspdf-autotable
- qrcode

```bash
npm install jspdf jspdf-autotable qrcode
npm install --save-dev @types/qrcode
```
