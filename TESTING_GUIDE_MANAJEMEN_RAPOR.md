# Testing Guide - Sistem Manajemen Rapor Keasramaan

## Overview

Panduan ini berisi instruksi lengkap untuk melakukan testing manual dan otomatis pada Sistem Manajemen Rapor Keasramaan. Karena project ini belum memiliki testing framework, panduan ini fokus pada manual testing dengan contoh request yang dapat digunakan dengan tools seperti Postman, Thunder Client, atau curl.

## Table of Contents

1. [API Testing](#api-testing)
2. [PDF Generation Testing](#pdf-generation-testing)
3. [Token Validation Testing](#token-validation-testing)
4. [Integration Testing](#integration-testing)
5. [Error Handling Testing](#error-handling-testing)

---

## API Testing

### 1. Kegiatan API Tests

#### 1.1 GET /api/rapor/kegiatan - List Kegiatan

**Test Case: Get all kegiatan**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nama_kegiatan": "Pesantren Ramadhan",
      "deskripsi": "Kegiatan pesantren selama bulan Ramadhan",
      "tanggal_mulai": "2024-03-11",
      "tanggal_selesai": "2024-04-09",
      "tahun_ajaran": "2023/2024",
      "semester": "Genap",
      "scope": "seluruh_sekolah"
    }
  ]
}
```

**Test Case: Filter by tahun_ajaran and semester**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan?tahun_ajaran=2023/2024&semester=Genap" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Test Case: Filter by scope**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan?scope=asrama_putra" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

#### 1.2 POST /api/rapor/kegiatan - Create Kegiatan

**Test Case: Create new kegiatan**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_kegiatan": "Manasik Haji",
    "deskripsi": "Simulasi manasik haji untuk kelas 12",
    "tanggal_mulai": "2024-01-15",
    "tanggal_selesai": "2024-01-16",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap",
    "scope": "kelas_12"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kegiatan berhasil dibuat",
  "data": {
    "id": "new-uuid",
    "nama_kegiatan": "Manasik Haji",
    ...
  }
}
```

**Test Case: Validation - Missing required fields**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_kegiatan": "Test"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Field tanggal_mulai, tanggal_selesai, tahun_ajaran, semester, dan scope wajib diisi"
}
```

#### 1.3 PUT /api/rapor/kegiatan/[id] - Update Kegiatan

**Test Case: Update kegiatan**
```bash
curl -X PUT "http://localhost:3000/api/rapor/kegiatan/KEGIATAN_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_kegiatan": "Manasik Haji (Updated)",
    "deskripsi": "Updated description"
  }'
```

#### 1.4 DELETE /api/rapor/kegiatan/[id] - Delete Kegiatan

**Test Case: Delete kegiatan**
```bash
curl -X DELETE "http://localhost:3000/api/rapor/kegiatan/KEGIATAN_ID" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kegiatan dan semua foto terkait berhasil dihapus"
}
```

### 2. Foto Kegiatan API Tests

#### 2.1 POST /api/rapor/kegiatan/[id]/foto - Upload Foto

**Test Case: Upload single photo**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan/KEGIATAN_ID/foto" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -F "file=@/path/to/photo.jpg" \
  -F "caption=Foto kegiatan 1"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Foto berhasil diupload",
  "data": {
    "id": "foto-uuid",
    "foto_url": "https://storage.supabase.co/...",
    "caption": "Foto kegiatan 1",
    "urutan": 1
  }
}
```

**Test Case: Upload with invalid file type**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan/KEGIATAN_ID/foto" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP"
}
```

**Test Case: Upload file too large (>5MB)**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan/KEGIATAN_ID/foto" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -F "file=@/path/to/large-photo.jpg"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Ukuran file maksimal 5MB"
}
```

#### 2.2 PUT /api/rapor/kegiatan/foto/[fotoId] - Update Foto

**Test Case: Update caption**
```bash
curl -X PUT "http://localhost:3000/api/rapor/kegiatan/foto/FOTO_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "caption": "Updated caption"
  }'
```

**Test Case: Reorder foto**
```bash
curl -X PUT "http://localhost:3000/api/rapor/kegiatan/foto/FOTO_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "urutan": 5
  }'
```

#### 2.3 DELETE /api/rapor/kegiatan/foto/[fotoId] - Delete Foto

**Test Case: Delete foto**
```bash
curl -X DELETE "http://localhost:3000/api/rapor/kegiatan/foto/FOTO_ID" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### 3. Template Rapor API Tests

#### 3.1 GET /api/rapor/template - List Templates

**Test Case: Get all templates**
```bash
curl -X GET "http://localhost:3000/api/rapor/template" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

#### 3.2 POST /api/rapor/template - Create Template

**Test Case: Create new template**
```bash
curl -X POST "http://localhost:3000/api/rapor/template" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_template": "Rapor Semester Genap 2024",
    "jenis_rapor": "semester",
    "ukuran_kertas_default": "A4",
    "orientasi_default": "portrait"
  }'
```

#### 3.3 POST /api/rapor/template/[id]/pages - Add Page to Template

**Test Case: Add static cover page**
```bash
curl -X POST "http://localhost:3000/api/rapor/template/TEMPLATE_ID/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "tipe_halaman": "static_cover",
    "urutan": 1,
    "config": {
      "cover_image_url": "https://...",
      "overlay_data": {
        "show_nama_siswa": true,
        "show_tahun_ajaran": true
      }
    }
  }'
```

**Test Case: Add dynamic data page**
```bash
curl -X POST "http://localhost:3000/api/rapor/template/TEMPLATE_ID/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "tipe_halaman": "dynamic_data",
    "urutan": 2,
    "config": {
      "kategori_indikator_ids": ["uuid1", "uuid2"],
      "show_deskripsi": true,
      "layout": "list"
    }
  }'
```

**Test Case: Add galeri kegiatan page**
```bash
curl -X POST "http://localhost:3000/api/rapor/template/TEMPLATE_ID/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "tipe_halaman": "galeri_kegiatan",
    "urutan": 3,
    "config": {
      "kegiatan_ids": ["uuid1"],
      "layout": "grid-4",
      "auto_paginate": true,
      "max_foto_per_page": 4
    }
  }'
```

**Test Case: Add QR code page**
```bash
curl -X POST "http://localhost:3000/api/rapor/template/TEMPLATE_ID/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "tipe_halaman": "qr_code",
    "urutan": 4,
    "config": {
      "qr_base_url": "https://portal.sekolah.com/galeri-publik/",
      "qr_size": 200,
      "qr_position": "center",
      "show_text": true,
      "text": "Scan untuk melihat galeri lengkap"
    }
  }'
```

### 4. Indikator & Capaian API Tests

#### 4.1 POST /api/rapor/indikator/kategori - Create Kategori

**Test Case: Create kategori**
```bash
curl -X POST "http://localhost:3000/api/rapor/indikator/kategori" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_kategori": "UBUDIYAH",
    "urutan": 1
  }'
```

#### 4.2 POST /api/rapor/indikator - Create Indikator

**Test Case: Create indikator**
```bash
curl -X POST "http://localhost:3000/api/rapor/indikator" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "kategori_id": "KATEGORI_UUID",
    "nama_indikator": "Shalat Fardhu Berjamaah",
    "deskripsi": "Kehadiran shalat fardhu berjamaah di masjid",
    "urutan": 1
  }'
```

#### 4.3 POST /api/rapor/indikator/capaian - Save Capaian Siswa

**Test Case: Save single capaian**
```bash
curl -X POST "http://localhost:3000/api/rapor/indikator/capaian" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "siswa_nis": "2024001",
    "indikator_id": "INDIKATOR_UUID",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap",
    "nilai": "A",
    "deskripsi": "Sangat baik dalam kehadiran shalat berjamaah"
  }'
```

**Test Case: Batch save capaian**
```bash
curl -X POST "http://localhost:3000/api/rapor/indikator/capaian/batch" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "siswa_nis": "2024001",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap",
    "capaian": [
      {
        "indikator_id": "uuid1",
        "nilai": "A",
        "deskripsi": "Sangat baik"
      },
      {
        "indikator_id": "uuid2",
        "nilai": "B",
        "deskripsi": "Baik"
      }
    ]
  }'
```

#### 4.4 GET /api/rapor/indikator/capaian - Get Capaian History

**Test Case: Get capaian by siswa**
```bash
curl -X GET "http://localhost:3000/api/rapor/indikator/capaian?siswa_nis=2024001&tahun_ajaran=2023/2024&semester=Genap" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

---

## PDF Generation Testing

### 1. Single PDF Generation

**Test Case: Generate rapor for one siswa**
```bash
curl -X POST "http://localhost:3000/api/rapor/generate/single" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "template_id": "TEMPLATE_UUID",
    "siswa_nis": "2024001",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rapor berhasil digenerate",
  "data": {
    "pdf_url": "https://storage.supabase.co/.../rapor_2024001.pdf",
    "history_id": "uuid"
  }
}
```

**Test Scenarios:**
- ✅ Generate with complete data
- ✅ Generate with missing capaian data (should use placeholders)
- ✅ Generate with missing photos (should skip or show placeholder)
- ✅ Generate with all page types
- ✅ Generate with different paper sizes (A4, Letter, F4)
- ✅ Generate with different orientations (portrait, landscape)

### 2. Bulk PDF Generation

**Test Case: Generate rapor for multiple siswa**
```bash
curl -X POST "http://localhost:3000/api/rapor/generate/bulk" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "template_id": "TEMPLATE_UUID",
    "siswa_nis_list": ["2024001", "2024002", "2024003"],
    "tahun_ajaran": "2023/2024",
    "semester": "Genap"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk generation started",
  "data": {
    "total": 3,
    "processing": 3,
    "batch_id": "uuid"
  }
}
```

**Test Scenarios:**
- ✅ Generate for 5 siswa
- ✅ Generate for 20 siswa (test batching)
- ✅ Generate for 50+ siswa (test performance)
- ✅ Handle partial failures (some siswa succeed, some fail)
- ✅ Check progress updates
- ✅ Verify all PDFs are generated correctly

### 3. PDF Content Validation

**Manual Checks:**
1. **Cover Page**
   - ✅ Cover image displays correctly
   - ✅ Siswa name overlay is positioned correctly
   - ✅ Tahun ajaran and semester display correctly

2. **Dynamic Data Page**
   - ✅ All kategori indikator are displayed
   - ✅ Indikator are grouped by kategori
   - ✅ Nilai and deskripsi display correctly
   - ✅ Missing data shows placeholder

3. **Galeri Kegiatan Page**
   - ✅ Photos are filtered by scope correctly
   - ✅ Layout matches configuration (grid-2, grid-4, etc.)
   - ✅ Photos are displayed in correct order
   - ✅ Captions are displayed
   - ✅ Auto-pagination works when photos exceed max per page

4. **QR Code Page**
   - ✅ QR code is generated
   - ✅ QR code is scannable
   - ✅ QR code links to correct URL
   - ✅ Text displays correctly

---

## Token Validation Testing

### 1. Generate Token

**Test Case: Generate token for siswa**
```bash
curl -X POST "http://localhost:3000/api/rapor/galeri-publik/generate-token" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "siswa_nis": "2024001",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap",
    "expires_at": null
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "abc123xyz789",
    "url": "https://portal.sekolah.com/galeri-publik/abc123xyz789"
  }
}
```

### 2. Validate Token and Access Gallery

**Test Case: Access gallery with valid token**
```bash
curl -X GET "http://localhost:3000/api/rapor/galeri-publik/abc123xyz789"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "siswa": {
      "nis": "2024001",
      "nama": "Ahmad Zaki",
      "kelas": "12 IPA 1",
      "asrama": "Putra"
    },
    "kegiatan": [
      {
        "id": "uuid",
        "nama_kegiatan": "Pesantren Ramadhan",
        "tanggal_mulai": "2024-03-11",
        "tanggal_selesai": "2024-04-09",
        "foto": [
          {
            "id": "foto-uuid",
            "foto_url": "https://...",
            "caption": "Kegiatan 1"
          }
        ]
      }
    ]
  }
}
```

**Test Case: Access with invalid token**
```bash
curl -X GET "http://localhost:3000/api/rapor/galeri-publik/invalid-token"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Token tidak valid atau sudah kadaluarsa"
}
```

**Test Case: Access with expired token**
```bash
curl -X GET "http://localhost:3000/api/rapor/galeri-publik/expired-token"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Token sudah kadaluarsa"
}
```

### 3. Scope Filtering

**Test Scenarios:**
- ✅ Siswa kelas 10 only sees kegiatan with scope: seluruh_sekolah, kelas_10, asrama_putra/putri
- ✅ Siswa kelas 11 only sees kegiatan with scope: seluruh_sekolah, kelas_11, asrama_putra/putri
- ✅ Siswa kelas 12 only sees kegiatan with scope: seluruh_sekolah, kelas_12, asrama_putra/putri
- ✅ Siswa asrama putra doesn't see kegiatan with scope: asrama_putri
- ✅ Siswa asrama putri doesn't see kegiatan with scope: asrama_putra

---

## Integration Testing

### Complete Workflow Test

**Scenario: Create Template → Add Pages → Generate Rapor → Access via QR**

1. **Step 1: Create Kegiatan**
   ```bash
   POST /api/rapor/kegiatan
   # Save kegiatan_id
   ```

2. **Step 2: Upload Photos to Kegiatan**
   ```bash
   POST /api/rapor/kegiatan/{kegiatan_id}/foto
   # Upload 5 photos
   ```

3. **Step 3: Create Kategori Indikator**
   ```bash
   POST /api/rapor/indikator/kategori
   # Create "UBUDIYAH", "AKHLAK", "KEDISIPLINAN"
   ```

4. **Step 4: Create Indikator**
   ```bash
   POST /api/rapor/indikator
   # Create 3 indikator per kategori
   ```

5. **Step 5: Input Capaian Siswa**
   ```bash
   POST /api/rapor/indikator/capaian/batch
   # Input capaian for siswa
   ```

6. **Step 6: Create Template**
   ```bash
   POST /api/rapor/template
   # Save template_id
   ```

7. **Step 7: Add Pages to Template**
   ```bash
   POST /api/rapor/template/{template_id}/pages
   # Add cover, dynamic_data, galeri, qr_code pages
   ```

8. **Step 8: Generate Rapor**
   ```bash
   POST /api/rapor/generate/single
   # Generate PDF
   ```

9. **Step 9: Download and Verify PDF**
   - Download PDF from returned URL
   - Open PDF and verify all pages
   - Scan QR code

10. **Step 10: Access Gallery via QR Code**
    ```bash
    GET /api/rapor/galeri-publik/{token}
    # Verify siswa data and kegiatan
    ```

**Expected Result:**
- ✅ All steps complete without errors
- ✅ PDF contains all configured pages
- ✅ QR code is scannable and links work
- ✅ Gallery shows correct kegiatan filtered by scope

---

## Error Handling Testing

### 1. Authentication Errors

**Test Case: Access API without token**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 2. Validation Errors

**Test Case: Create kegiatan with invalid date range**
```bash
curl -X POST "http://localhost:3000/api/rapor/kegiatan" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "nama_kegiatan": "Test",
    "tanggal_mulai": "2024-12-31",
    "tanggal_selesai": "2024-01-01",
    "tahun_ajaran": "2023/2024",
    "semester": "Genap",
    "scope": "seluruh_sekolah"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Tanggal selesai harus setelah tanggal mulai"
}
```

### 3. Not Found Errors

**Test Case: Get non-existent kegiatan**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan/non-existent-uuid" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Kegiatan tidak ditemukan"
}
```

### 4. File Upload Errors

**Test Scenarios:**
- ✅ Upload file > 5MB → Error: "Ukuran file maksimal 5MB"
- ✅ Upload non-image file → Error: "Format file tidak didukung"
- ✅ Upload corrupted image → Error: "File tidak valid"

### 5. PDF Generation Errors

**Test Scenarios:**
- ✅ Generate with non-existent template → Error: "Template tidak ditemukan"
- ✅ Generate with non-existent siswa → Error: "Siswa tidak ditemukan"
- ✅ Generate with empty template (no pages) → Error: "Template tidak memiliki halaman"
- ✅ Generate with missing cover image → Should use placeholder or skip
- ✅ Generate with missing capaian data → Should show "Belum ada data"

---

## Performance Testing

### 1. Bulk Generation Performance

**Test Scenarios:**
- Generate 10 rapor → Should complete in < 30 seconds
- Generate 50 rapor → Should complete in < 3 minutes
- Generate 100 rapor → Should complete in < 6 minutes

**Metrics to Track:**
- Time per PDF
- Memory usage
- CPU usage
- Success rate

### 2. Photo Upload Performance

**Test Scenarios:**
- Upload 1 photo (2MB) → Should complete in < 3 seconds
- Upload 10 photos simultaneously → Should complete in < 15 seconds
- Upload 50 photos in bulk → Should complete in < 60 seconds

### 3. API Response Time

**Target Response Times:**
- GET requests → < 500ms
- POST/PUT requests → < 1000ms
- File uploads → < 3000ms
- PDF generation (single) → < 10000ms

---

## Security Testing

### 1. Authorization Tests

**Test Scenarios:**
- ✅ Non-admin user cannot create template
- ✅ Non-admin user cannot delete kegiatan
- ✅ User can only access data from their cabang
- ✅ Public gallery only accessible via valid token

### 2. SQL Injection Tests

**Test Case: Attempt SQL injection in search**
```bash
curl -X GET "http://localhost:3000/api/rapor/kegiatan?search='; DROP TABLE kegiatan_asrama; --" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**Expected Result:**
- ✅ Query is safely escaped
- ✅ No database modification occurs
- ✅ Returns empty result or error

### 3. File Upload Security

**Test Scenarios:**
- ✅ Upload PHP file with .jpg extension → Should be rejected
- ✅ Upload file with malicious EXIF data → Should be sanitized
- ✅ Upload file with XSS in filename → Should be sanitized

---

## Checklist Summary

### API Endpoints
- [ ] GET /api/rapor/kegiatan
- [ ] POST /api/rapor/kegiatan
- [ ] PUT /api/rapor/kegiatan/[id]
- [ ] DELETE /api/rapor/kegiatan/[id]
- [ ] POST /api/rapor/kegiatan/[id]/foto
- [ ] PUT /api/rapor/kegiatan/foto/[fotoId]
- [ ] DELETE /api/rapor/kegiatan/foto/[fotoId]
- [ ] GET /api/rapor/template
- [ ] POST /api/rapor/template
- [ ] POST /api/rapor/template/[id]/pages
- [ ] GET /api/rapor/indikator/kategori
- [ ] POST /api/rapor/indikator/kategori
- [ ] GET /api/rapor/indikator
- [ ] POST /api/rapor/indikator
- [ ] POST /api/rapor/indikator/capaian
- [ ] GET /api/rapor/indikator/capaian
- [ ] POST /api/rapor/generate/single
- [ ] POST /api/rapor/generate/bulk
- [ ] GET /api/rapor/galeri-publik/[token]

### PDF Generation
- [ ] Cover page renders correctly
- [ ] Dynamic data page renders correctly
- [ ] Galeri kegiatan page renders correctly
- [ ] QR code page renders correctly
- [ ] Multiple page sizes work (A4, Letter, F4)
- [ ] Multiple orientations work (portrait, landscape)
- [ ] Bulk generation works for 50+ siswa

### Token Validation
- [ ] Valid token grants access
- [ ] Invalid token is rejected
- [ ] Expired token is rejected
- [ ] Scope filtering works correctly

### Error Handling
- [ ] Authentication errors handled
- [ ] Validation errors handled
- [ ] Not found errors handled
- [ ] File upload errors handled
- [ ] PDF generation errors handled

---

## Notes

1. **Testing Tools**: Gunakan Postman, Thunder Client, atau curl untuk testing API
2. **Test Data**: Pastikan database memiliki test data yang cukup
3. **Environment**: Test di development environment terlebih dahulu
4. **Documentation**: Update dokumentasi jika menemukan bug atau behavior yang tidak sesuai
5. **Automation**: Pertimbangkan untuk setup automated testing dengan Jest atau Vitest di masa depan

