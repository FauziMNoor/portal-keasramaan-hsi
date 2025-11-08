# Panduan Setup Storage untuk Manajemen Rapor

## Overview

Sistem Manajemen Rapor membutuhkan 3 storage buckets di Supabase untuk menyimpan:
1. **kegiatan-galeri** - Foto-foto kegiatan asrama
2. **rapor-covers** - Cover image untuk template rapor
3. **rapor-pdf** - File PDF rapor yang sudah digenerate

## Cara Setup

### Opsi 1: Via Supabase Dashboard (Recommended)

#### Step 1: Buka Supabase Dashboard
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik menu **Storage** di sidebar kiri

#### Step 2: Buat Bucket "kegiatan-galeri"
1. Klik tombol **"New bucket"**
2. Isi form:
   - **Name**: `kegiatan-galeri`
   - **Public bucket**: ✅ **Centang** (untuk akses public URL)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
3. Klik **"Create bucket"**

#### Step 3: Buat Bucket "rapor-covers"
1. Klik tombol **"New bucket"** lagi
2. Isi form:
   - **Name**: `rapor-covers`
   - **Public bucket**: ✅ **Centang**
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
3. Klik **"Create bucket"**

#### Step 4: Buat Bucket "rapor-pdf"
1. Klik tombol **"New bucket"** lagi
2. Isi form:
   - **Name**: `rapor-pdf`
   - **Public bucket**: ✅ **Centang**
   - **File size limit**: `50 MB`
   - **Allowed MIME types**: 
     - `application/pdf`
3. Klik **"Create bucket"**

#### Step 5: Setup Policies (Opsional - jika belum otomatis)

Untuk setiap bucket, tambahkan policies berikut:

**Policies untuk semua bucket:**

1. **SELECT (Read) Policy**
   - Policy name: `Allow public read access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'nama-bucket'`

2. **INSERT (Upload) Policy**
   - Policy name: `Allow authenticated users to upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'nama-bucket'`

3. **UPDATE Policy**
   - Policy name: `Allow authenticated users to update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'nama-bucket'`
   - WITH CHECK expression: `bucket_id = 'nama-bucket'`

4. **DELETE Policy**
   - Policy name: `Allow authenticated users to delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'nama-bucket'`

---

### Opsi 2: Via SQL Script

Jika Anda lebih suka menggunakan SQL:

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy paste isi file `supabase/SETUP_STORAGE_RAPOR.sql`
3. Klik **"Run"**

Script akan otomatis:
- ✅ Membuat 3 buckets
- ✅ Setup semua RLS policies
- ✅ Skip jika bucket sudah ada (ON CONFLICT DO NOTHING)

---

## Verifikasi Setup

### 1. Cek Buckets

Di Supabase Dashboard → Storage, Anda harus melihat 3 buckets:
- ✅ kegiatan-galeri (Public, 5MB limit)
- ✅ rapor-covers (Public, 10MB limit)
- ✅ rapor-pdf (Public, 50MB limit)

### 2. Test Upload

1. Buka aplikasi Portal Keasramaan
2. Login sebagai admin
3. Buka **Manajemen Rapor** → **Galeri Kegiatan**
4. Buat kegiatan baru atau buka kegiatan yang sudah ada
5. Coba upload foto
6. Jika berhasil, foto akan muncul di galeri

### 3. Cek via SQL

Jalankan query ini di SQL Editor:

```sql
-- Cek buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('kegiatan-galeri', 'rapor-covers', 'rapor-pdf');

-- Cek policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%kegiatan%' OR policyname LIKE '%rapor%')
ORDER BY policyname;
```

---

## Troubleshooting

### Problem: Upload foto gagal dengan error "Bucket not found"

**Solusi:**
1. Pastikan bucket `kegiatan-galeri` sudah dibuat
2. Cek nama bucket di Supabase Dashboard (harus exact match)
3. Refresh browser dan coba lagi

### Problem: Upload foto gagal dengan error "Permission denied"

**Solusi:**
1. Pastikan bucket adalah **Public bucket** (centang saat create)
2. Cek RLS policies untuk bucket tersebut
3. Pastikan ada policy untuk INSERT dengan target role `authenticated`

### Problem: Foto berhasil diupload tapi tidak bisa diakses (404)

**Solusi:**
1. Pastikan bucket adalah **Public bucket**
2. Cek policy SELECT untuk role `public`
3. Coba akses URL foto langsung di browser

### Problem: File size terlalu besar

**Solusi:**
1. Compress foto sebelum upload
2. Atau tingkatkan file size limit di bucket settings
3. Recommended: Gunakan tools seperti TinyPNG untuk compress

---

## File Size Limits

| Bucket | Limit | Alasan |
|--------|-------|--------|
| kegiatan-galeri | 5 MB | Foto kegiatan biasanya tidak perlu resolusi sangat tinggi |
| rapor-covers | 10 MB | Cover image bisa lebih besar untuk kualitas print |
| rapor-pdf | 50 MB | PDF dengan banyak foto bisa cukup besar |

Jika perlu, Anda bisa adjust limits ini di bucket settings.

---

## Security Notes

1. **Public Buckets**: Semua buckets dibuat public untuk memudahkan akses via URL. Ini aman karena:
   - Upload hanya bisa dilakukan oleh authenticated users
   - File names di-generate secara random (tidak bisa ditebak)
   - Tidak ada data sensitif di foto/PDF

2. **RLS Policies**: Policies memastikan:
   - Hanya authenticated users yang bisa upload/update/delete
   - Public hanya bisa read (via URL)
   - Tidak ada akses langsung ke list files

3. **MIME Type Restrictions**: Hanya file types tertentu yang diizinkan untuk mencegah upload file berbahaya.

---

## Next Steps

Setelah storage setup selesai:
1. ✅ Test upload foto di Galeri Kegiatan
2. ✅ Test upload cover image di Template Rapor
3. ✅ Test generate PDF rapor
4. ✅ Verifikasi semua file bisa diakses via public URL

---

## Support

Jika masih ada masalah:
1. Cek console browser untuk error message detail
2. Cek Supabase logs di Dashboard → Logs
3. Pastikan environment variables sudah benar (.env.local)

