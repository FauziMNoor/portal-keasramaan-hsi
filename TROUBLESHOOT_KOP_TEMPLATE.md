# 🔧 TROUBLESHOOTING: KOP Template Tidak Muncul di PDF

## ❌ Masalah

Saat download surat izin, KOP template yang sudah diupload tidak muncul di PDF. PDF masih menggunakan KOP dinamis (text).

## 🔍 Diagnosis

### Step 1: Cek Data di Database

```sql
-- Cek data info sekolah
SELECT 
    cabang,
    kop_mode,
    kop_template_url,
    kop_content_margin_top
FROM info_sekolah_keasramaan;
```

**Yang harus dicek:**
- ✅ `kop_mode` harus = `'template'`
- ✅ `kop_template_url` harus ada dan valid
- ✅ URL harus format: `https://[project].supabase.co/storage/v1/object/public/kop-templates-keasramaan/[filename]`

### Step 2: Cek Console Browser

Buka browser console (F12) saat download surat, lihat log:

**Log yang BENAR:**
```
📄 Generate Surat Request: { perizinan_id: '...' }
✅ Perizinan found: { nama: '...', cabang: '...', status: 'approved_kepsek' }
🔍 Mencari info sekolah dengan KOP template...
✅ Menggunakan KOP template universal: { cabang: '...', template_url: 'https://...' }
📝 Generating PDF...
📄 PDF Generator - Info Sekolah: { kop_mode: 'template', has_template_url: true, ... }
🎨 Using KOP Template mode
🔄 Loading KOP template from: https://...
✅ Fetch successful, converting to blob...
📦 Blob created: { type: 'image/png', size: 123456 }
✅ Base64 conversion complete
🎨 Adding image to PDF: { format: 'PNG', width: 210, height: 297 }
✅ KOP template loaded successfully!
📏 Content will start at Y position: 40
✅ PDF generated successfully
```

**Log yang ERROR:**
```
❌ Error loading KOP template: { message: 'HTTP 403: Forbidden', ... }
⚠️ Falling back to dynamic KOP
```

### Step 3: Cek Storage Bucket

```sql
-- Cek bucket settings
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'kop-templates-keasramaan';
```

**Yang harus dicek:**
- ✅ `public` harus = `true`
- ✅ `allowed_mime_types` harus include `image/png`, `image/jpeg`

### Step 4: Test URL Langsung

Copy URL dari `kop_template_url`, paste di browser baru:
- ✅ Jika gambar muncul → URL valid, bucket public
- ❌ Jika error 403 → Bucket private, perlu fix
- ❌ Jika error 404 → File tidak ada atau URL salah

## ✅ SOLUSI

### Solusi 1: Fix Bucket Public Access

**Jalankan SQL:**
```sql
-- File: FIX_STORAGE_KOP_PUBLIC.sql
```

Script ini akan:
- ✅ Set bucket ke PUBLIC
- ✅ Create policy untuk public read
- ✅ Verify configuration

### Solusi 2: Fix URL Format

**Jika URL salah format:**

```sql
-- Update URL dengan format yang benar
UPDATE info_sekolah_keasramaan
SET kop_template_url = 'https://sirriyah.supabase.co/storage/v1/object/public/kop-templates-keasramaan/kop-sukabumi.png'
WHERE cabang = 'Sukabumi';
```

**Format URL yang BENAR:**
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/kop-templates-keasramaan/[filename]
```

**Format URL yang SALAH:**
```
❌ https://[PROJECT_REF].supabase.co/storage/v1/object/kop-templates-keasramaan/[filename]
   (missing "public")

❌ /storage/v1/object/public/kop-templates-keasramaan/[filename]
   (missing domain)

❌ kop-templates-keasramaan/[filename]
   (relative path)
```

### Solusi 3: Re-upload File

Jika file corrupt atau tidak bisa diakses:

1. **Hapus file lama di Supabase Storage:**
   - Buka Supabase Dashboard
   - Storage → kop-templates-keasramaan
   - Delete file lama

2. **Upload ulang via UI:**
   - Buka: http://localhost:3000/identitas-sekolah
   - Pilih mode "Template (Gambar)"
   - Upload file KOP baru
   - Save

3. **Verify URL:**
   ```sql
   SELECT kop_template_url FROM info_sekolah_keasramaan WHERE kop_mode = 'template';
   ```

### Solusi 4: Fix CORS (Jika Perlu)

Jika error CORS di console:

**Di Supabase Dashboard:**
1. Settings → API
2. CORS Configuration
3. Add allowed origin: `http://localhost:3000`
4. Save

**Atau via SQL:**
```sql
-- Pastikan bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'kop-templates-keasramaan';
```

## 🧪 Testing

### Test 1: URL Accessibility
```bash
# Test dengan curl
curl -I "https://sirriyah.supabase.co/storage/v1/object/public/kop-templates-keasramaan/kop-sukabumi.png"

# Response yang BENAR:
# HTTP/2 200
# content-type: image/png
# content-length: 123456

# Response yang ERROR:
# HTTP/2 403 Forbidden
# atau
# HTTP/2 404 Not Found
```

### Test 2: Download Surat
1. Buka: http://localhost:3000/perizinan/kepulangan/approval
2. Pilih perizinan yang approved_kepsek
3. Klik Download
4. Buka PDF
5. **Cek:** Apakah KOP gambar muncul?

### Test 3: Console Log
1. Buka browser console (F12)
2. Download surat
3. **Cek log:** Apakah ada error?
4. **Cek:** Apakah ada log "✅ KOP template loaded successfully"?

## 📋 Checklist Debugging

- [ ] Data `kop_mode` = 'template' di database
- [ ] Data `kop_template_url` ada dan tidak null
- [ ] URL format benar (include "public" dan domain lengkap)
- [ ] Bucket `kop-templates-keasramaan` sudah PUBLIC
- [ ] Policy public read sudah ada
- [ ] File KOP bisa diakses langsung via URL di browser
- [ ] Console browser tidak ada error CORS
- [ ] Console browser ada log "✅ KOP template loaded successfully"
- [ ] PDF yang didownload menampilkan KOP gambar

## 🎯 Quick Fix Command

**Jalankan semua fix sekaligus:**

```sql
-- 1. Set bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'kop-templates-keasramaan';

-- 2. Create public read policy
DROP POLICY IF EXISTS "Allow public read kop templates" ON storage.objects;
CREATE POLICY "Allow public read kop templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kop-templates-keasramaan');

-- 3. Verify data
SELECT 
    cabang,
    kop_mode,
    kop_template_url,
    CASE 
        WHEN kop_mode = 'template' AND kop_template_url IS NOT NULL 
        THEN '✅ OK'
        ELSE '❌ PERLU FIX'
    END as status
FROM info_sekolah_keasramaan;
```

## 🆘 Masih Bermasalah?

### Cek Server Log (Terminal)

Lihat terminal development server untuk error detail:

```
❌ Error loading KOP template: {
  message: 'HTTP 403: Forbidden',
  url: 'https://...',
  error: ...
}
```

### Fallback ke KOP Dinamis

Jika KOP template terus error, sementara gunakan KOP dinamis:

```sql
-- Ubah mode ke dinamis
UPDATE info_sekolah_keasramaan
SET kop_mode = 'dynamic'
WHERE cabang = 'Sukabumi';
```

Sistem akan otomatis generate KOP dari data text.

## 📞 Support

Jika masih error setelah semua solusi:
1. Screenshot console error
2. Copy URL `kop_template_url` dari database
3. Test URL di browser
4. Share hasil test untuk debugging lebih lanjut

---
**Update:** 2024
**Status:** Troubleshooting Guide
**Version:** 1.0
