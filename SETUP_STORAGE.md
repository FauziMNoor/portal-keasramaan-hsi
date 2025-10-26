# Setup Supabase Storage untuk Upload Logo

## Langkah-langkah Setup Storage Bucket

### 1. Buat Storage Bucket

1. Login ke dashboard Supabase: https://sirriyah.smaithsi.sch.id
2. Buka menu **Storage** di sidebar kiri
3. Klik tombol **"New bucket"** atau **"Create bucket"**
4. Isi form:
   - **Name**: `logos`
   - **Public bucket**: ✅ **CENTANG** (agar logo bisa diakses publik)
   - **File size limit**: 2MB (opsional)
   - **Allowed MIME types**: `image/*` (opsional)
5. Klik **"Create bucket"**

### 2. Setup Storage Policy (Agar Bisa Upload & Akses)

Setelah bucket dibuat, kita perlu set policy agar aplikasi bisa upload dan akses file.

#### Cara 1: Melalui Dashboard (Mudah)

1. Di halaman Storage, klik bucket **"logos"**
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih template **"Allow public access"** atau buat custom:

**Policy untuk Upload (INSERT):**
```
Policy name: Allow public upload
Target roles: public
Policy definition: 
  - Operation: INSERT
  - Check: true
```

**Policy untuk Read (SELECT):**
```
Policy name: Allow public read
Target roles: public
Policy definition:
  - Operation: SELECT
  - Check: true
```

**Policy untuk Delete:**
```
Policy name: Allow public delete
Target roles: public
Policy definition:
  - Operation: DELETE
  - Check: true
```

#### Cara 2: Melalui SQL Editor (Cepat)

1. Buka menu **SQL Editor**
2. Copy dan jalankan SQL ini:

```sql
-- Policy untuk upload file
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'logos');

-- Policy untuk membaca file
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Policy untuk menghapus file
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'logos');

-- Policy untuk update file
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'logos');
```

3. Klik **Run** atau tekan Ctrl+Enter

### 3. Verifikasi Setup

Setelah setup selesai, coba:
1. Buka aplikasi Portal Keasramaan
2. Masuk ke menu **Identitas Sekolah**
3. Klik **"Pilih File Logo"**
4. Upload gambar (JPG/PNG, max 2MB)
5. Logo harus muncul preview-nya
6. Klik **"Simpan Data"**
7. Refresh halaman - logo harus tetap muncul

### 4. Troubleshooting

**Error: "new row violates row-level security policy"**
- Pastikan policy sudah dibuat dengan benar
- Pastikan bucket name adalah `logos` (huruf kecil semua)
- Pastikan policy target role adalah `public`

**Error: "Bucket not found"**
- Pastikan bucket `logos` sudah dibuat
- Cek spelling bucket name (harus persis `logos`)

**Logo tidak muncul setelah upload**
- Pastikan bucket di-set sebagai **Public**
- Pastikan policy SELECT sudah dibuat
- Cek browser console untuk error

**File tidak bisa diupload**
- Pastikan ukuran file < 2MB
- Pastikan format file adalah gambar (JPG, PNG, SVG)
- Pastikan policy INSERT sudah dibuat

### 5. Struktur File di Storage

Setelah upload, file akan tersimpan di:
```
Storage > logos > logo-1234567890.jpg
```

Format nama file: `logo-[timestamp].[extension]`

---

**Setelah setup selesai, aplikasi siap digunakan untuk upload logo!** 🎉
