# Test: Logo Upload & Update URL

## Prerequisites
1. ✅ Data duplikat sudah dihapus dari database
2. ⏳ Bucket `logos` perlu dikonfigurasi
3. ⏳ RLS policies perlu diaktifkan

## Step 1: Setup Bucket & Policies

### Jalankan SQL Script
1. Buka **Supabase SQL Editor**: https://sirriyah.smaithsi.sch.id
2. Jalankan script: `portal-keasramaan/supabase/FIX_LOGOS_BUCKET.sql`
3. Script akan:
   - ✅ Buat bucket `logos` (jika belum ada)
   - ✅ Set bucket sebagai public
   - ✅ Set file size limit: 2MB
   - ✅ Set allowed types: JPG, PNG, SVG, WebP
   - ✅ Buat RLS policies untuk upload/delete (authenticated)
   - ✅ Buat RLS policy untuk read (public)

### Verifikasi Bucket
1. Buka **Supabase Dashboard** → **Storage**
2. Cek apakah bucket `logos` ada
3. Cek settings:
   - Public bucket: ✅ Yes
   - File size limit: 2 MB
   - Allowed MIME types: image/jpeg, image/png, image/svg+xml, image/webp

## Step 2: Test Upload Manual (Optional)

### Via Supabase Dashboard
1. Buka **Storage** → **logos** bucket
2. Klik **Upload file**
3. Pilih gambar logo (max 2MB)
4. Upload
5. Jika berhasil, berarti bucket & policies sudah benar

## Step 3: Test Upload via Aplikasi

### Test Case 1: Upload Logo Baru
1. Login ke aplikasi
2. Buka: http://localhost:3000/identitas-sekolah
3. Klik **"Pilih File Logo"**
4. Pilih file gambar (JPG/PNG, max 2MB)
5. **Expected**: 
   - ✅ Preview muncul
   - ✅ Muncul pesan: "⏳ Logo baru dipilih: filename.png - Klik Simpan Data untuk mengupload"
6. Isi form lainnya (nama sekolah, alamat, dll)
7. Klik **"Simpan Data"**
8. **Expected**:
   - ✅ Loading indicator muncul
   - ✅ File terupload ke bucket `logos`
   - ✅ URL tersimpan di database
   - ✅ Alert: "✅ Data berhasil disimpan!"
9. Refresh halaman
10. **Expected**:
    - ✅ Logo muncul dari database
    - ✅ URL format: `https://sirriyah.smaithsi.sch.id/storage/v1/object/public/logos/logo-[cabang]-[timestamp].[ext]`

### Test Case 2: Update Logo (Ganti Logo Lama)
1. Buka halaman identitas sekolah (logo sudah ada)
2. Klik **"Pilih File Logo"**
3. Pilih file gambar baru
4. **Expected**: Preview berubah ke logo baru
5. Klik **"Simpan Data"**
6. **Expected**:
   - ✅ Logo lama terhapus dari storage
   - ✅ Logo baru terupload
   - ✅ URL di database terupdate
7. Refresh halaman
8. **Expected**: Logo baru muncul

### Test Case 3: Hapus Logo
1. Buka halaman identitas sekolah (logo sudah ada)
2. Hover mouse ke logo
3. Klik tombol **X** (merah) di pojok kanan atas
4. **Expected**: Preview logo hilang
5. Klik **"Simpan Data"**
6. **Expected**:
   - ✅ Logo terhapus dari storage
   - ✅ `logo_url` di database jadi kosong/null
7. Refresh halaman
8. **Expected**: Logo tidak ada (placeholder muncul)

### Test Case 4: Cancel Upload
1. Pilih file logo → Preview muncul
2. **JANGAN** klik "Simpan Data"
3. Refresh halaman
4. **Expected**:
   - ✅ Logo lama masih ada (tidak berubah)
   - ✅ File tidak terupload ke storage

## Step 4: Verifikasi Database

### Cek URL Logo di Database
```sql
SELECT 
    cabang,
    nama_sekolah,
    logo_url,
    CASE 
        WHEN logo_url IS NULL OR logo_url = '' THEN '❌ Kosong'
        WHEN logo_url LIKE '%supabase%' THEN '✅ Supabase Storage'
        ELSE '⚠️ External URL'
    END as logo_status,
    updated_at
FROM info_sekolah_keasramaan
ORDER BY cabang;
```

**Expected Result:**
- Cabang yang sudah upload logo: `logo_status = '✅ Supabase Storage'`
- URL format: `https://sirriyah.smaithsi.sch.id/storage/v1/object/public/logos/logo-[cabang]-[timestamp].[ext]`

### Cek File di Storage
```sql
SELECT 
    name,
    bucket_id,
    created_at,
    metadata->>'size' as size_bytes,
    metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'logos'
ORDER BY created_at DESC;
```

**Expected Result:**
- File dengan nama: `logo-[cabang]-[timestamp].[ext]`
- Size: < 2MB
- MIME type: image/jpeg, image/png, dll

## Troubleshooting

### Error: "Failed to upload"
**Kemungkinan:**
1. Bucket `logos` belum ada → Jalankan `FIX_LOGOS_BUCKET.sql`
2. RLS policies belum aktif → Jalankan `FIX_LOGOS_BUCKET.sql`
3. User belum login → Pastikan sudah login
4. File size > 2MB → Pilih file yang lebih kecil
5. File type tidak didukung → Gunakan JPG/PNG/SVG/WebP

**Debug:**
1. Buka Console browser (F12)
2. Lihat Network tab
3. Cari request ke `/storage/v1/object/logos/...`
4. Lihat response error detail

### Error: "Permission denied"
**Solusi:**
1. Pastikan user sudah login (authenticated)
2. Jalankan `FIX_LOGOS_BUCKET.sql` untuk fix policies
3. Cek apakah policies aktif:
   ```sql
   SELECT policyname, cmd, roles
   FROM pg_policies
   WHERE tablename = 'objects' AND policyname LIKE '%logos%';
   ```

### Logo Tidak Muncul Setelah Upload
**Kemungkinan:**
1. URL tidak tersimpan di database → Cek query di Step 4
2. Bucket tidak public → Jalankan `FIX_LOGOS_BUCKET.sql`
3. File tidak terupload → Cek storage.objects

**Debug:**
1. Cek URL di database (query di Step 4)
2. Copy URL, paste di browser
3. Jika 404 → File tidak ada di storage
4. Jika 403 → Bucket tidak public atau policy salah

### Logo Lama Tidak Terhapus
**Kemungkinan:**
1. Delete policy tidak aktif → Jalankan `FIX_LOGOS_BUCKET.sql`
2. Filename parsing salah → Cek console error

**Debug:**
1. Cek file di storage (query di Step 4)
2. Seharusnya hanya ada 1 file per cabang
3. Jika ada banyak file lama → Hapus manual via dashboard

## Summary Checklist

### Setup (One-time)
- [ ] Jalankan `FIX_RLS_INFO_SEKOLAH.sql`
- [ ] Jalankan `FIX_LOGOS_BUCKET.sql`
- [ ] Verifikasi bucket `logos` ada di dashboard
- [ ] Verifikasi policies aktif (4 policies)

### Testing
- [ ] Test upload logo baru → ✅ Berhasil
- [ ] Test update logo (ganti) → ✅ Logo lama terhapus, baru tersimpan
- [ ] Test hapus logo → ✅ Logo terhapus dari storage & database
- [ ] Test cancel upload → ✅ Tidak ada side effect
- [ ] Verifikasi URL di database → ✅ Format benar
- [ ] Verifikasi file di storage → ✅ File ada

### Production Ready
- [ ] Semua test case passed
- [ ] Tidak ada file orphan di storage
- [ ] Setiap cabang hanya 1 logo
- [ ] URL format konsisten
- [ ] Logo muncul di aplikasi

## Flow Diagram

```
User Action          →  Frontend              →  Backend/Storage        →  Database
─────────────────────────────────────────────────────────────────────────────────────
1. Pilih file        →  setSelectedLogoFile   →  (belum upload)         →  (belum update)
                        setLogoPreview
                        
2. Klik "Simpan"     →  handleSubmit()        →  Upload ke bucket       →  (belum update)
                                                  'logos'
                                                  
3. Upload success    →  Get public URL        →  File tersimpan         →  Update logo_url
                        
4. Upsert data       →  (selesai)             →  (selesai)              →  Data tersimpan
                        
5. Refresh page      →  fetchData()           →  Get public URL         →  Load logo_url
                        loadLogoPreview()        dari storage
```

## Related Files
- `portal-keasramaan/app/identitas-sekolah/page.tsx` - Upload logic
- `portal-keasramaan/supabase/FIX_LOGOS_BUCKET.sql` - Bucket setup
- `portal-keasramaan/supabase/FIX_RLS_INFO_SEKOLAH.sql` - Table RLS
