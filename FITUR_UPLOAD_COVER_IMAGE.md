# Fitur Upload Cover Image - Template Rapor

## Overview

Fitur ini memungkinkan user untuk upload gambar cover langsung dari form konfigurasi halaman template, tanpa perlu manual upload ke Supabase Storage dan copy-paste URL.

## Perubahan yang Dilakukan

### 1. UI/UX Improvements

**Sebelum:**
- User harus manual upload gambar ke Supabase Storage
- Copy URL dari storage
- Paste URL ke field "URL Gambar Cover"
- Tidak ada preview gambar

**Sesudah:**
- User klik tombol "Upload Gambar Cover"
- Pilih file dari komputer
- Gambar otomatis diupload ke Supabase Storage
- Preview gambar langsung ditampilkan
- Tombol hapus untuk mengganti gambar

### 2. File Changes

#### Frontend (`PageConfigForm.tsx`)
- ✅ Tambah state `uploading` dan `fileInputRef`
- ✅ Tambah fungsi `handleCoverImageUpload()`
- ✅ Ubah UI dari text input menjadi upload button dengan preview
- ✅ Tambah loading state saat upload
- ✅ Tambah tombol hapus gambar

#### Backend (`upload-cover/route.ts`)
- ✅ Buat API route baru untuk upload cover image
- ✅ Validasi file type dan size (max 10MB)
- ✅ Upload ke bucket `rapor-covers`
- ✅ Return public URL

#### Validation (`validation.ts`)
- ✅ Tambah `MAX_SIZE_COVER` constant (10MB)

## Cara Menggunakan

### 1. Buat/Edit Template Rapor

1. Buka **Manajemen Rapor** → **Template Rapor**
2. Klik template yang ingin diedit atau buat baru
3. Tambah halaman dengan tipe **"Static Cover"**

### 2. Upload Cover Image

1. Di form konfigurasi halaman, lihat section **"Gambar Cover"**
2. Klik tombol **"Upload Gambar Cover"**
3. Pilih file gambar dari komputer (JPG, PNG, WEBP)
4. Tunggu proses upload selesai
5. Preview gambar akan muncul
6. Klik **"Simpan"** untuk menyimpan konfigurasi

### 3. Ganti Cover Image

1. Jika sudah ada cover image, akan muncul preview
2. Klik tombol **X** di pojok kanan atas preview untuk hapus
3. Atau klik **"Ganti Gambar Cover"** untuk upload gambar baru

## Spesifikasi File

| Parameter | Value |
|-----------|-------|
| Format | JPG, JPEG, PNG, WEBP |
| Ukuran Maksimal | 10 MB |
| Resolusi Rekomendasi | 1920 x 1080 px atau lebih |
| Bucket Storage | `rapor-covers` |

## API Endpoint

### POST `/api/rapor/upload-cover`

Upload cover image ke Supabase Storage.

**Request:**
```
Content-Type: multipart/form-data

file: File (image file)
bucket: string (optional, default: 'rapor-covers')
```

**Response Success (201):**
```json
{
  "success": true,
  "url": "https://storage.supabase.co/.../covers/xxx.jpg",
  "message": "Cover image berhasil diupload"
}
```

**Response Error (400/500):**
```json
{
  "error": "Error message"
}
```

## Storage Setup

Pastikan bucket `rapor-covers` sudah dibuat di Supabase Storage:

```sql
-- Sudah termasuk di SETUP_STORAGE_RAPOR.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapor-covers',
  'rapor-covers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);
```

Lihat [SETUP_STORAGE_RAPOR_GUIDE.md](./SETUP_STORAGE_RAPOR_GUIDE.md) untuk panduan lengkap.

## Benefits

✅ **Lebih Cepat**: Upload langsung dari form, tidak perlu buka Supabase Dashboard
✅ **Lebih Mudah**: Tidak perlu copy-paste URL manual
✅ **Preview**: Langsung lihat gambar yang diupload
✅ **User Friendly**: UI yang intuitif dengan drag & drop support
✅ **Validation**: Otomatis validasi file type dan size

## Troubleshooting

### Upload gagal dengan error "Bucket not found"

**Solusi:**
1. Pastikan bucket `rapor-covers` sudah dibuat
2. Jalankan script `SETUP_STORAGE_RAPOR.sql`
3. Atau buat manual via Supabase Dashboard

### File terlalu besar

**Solusi:**
1. Compress gambar menggunakan tools seperti TinyPNG
2. Atau resize gambar ke resolusi yang lebih kecil
3. Maksimal file size: 10MB

### Preview tidak muncul

**Solusi:**
1. Cek console browser untuk error
2. Pastikan URL gambar valid
3. Pastikan bucket adalah public
4. Refresh halaman

## Future Improvements

Fitur yang bisa ditambahkan di masa depan:
- [ ] Drag & drop upload
- [ ] Crop/resize gambar sebelum upload
- [ ] Multiple cover images untuk dipilih
- [ ] Gallery cover images yang sudah diupload
- [ ] Compress otomatis untuk file besar

