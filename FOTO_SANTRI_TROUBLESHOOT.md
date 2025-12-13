# 🔍 Troubleshooting: Foto Santri Tidak Muncul

## Status Saat Ini

✅ **Fix sudah diaplikasikan** di `lib/slidesImageInserter.ts`
- Manual URL construction (server-side compatible)
- Logging lengkap untuk debugging
- Test script tersedia

⚠️ **Perlu testing** untuk verify fix bekerja dengan benar

## Langkah Testing

### 1. Test URL Accessibility

Jalankan test script untuk verify foto URL bisa diakses:

```bash
node test-image-generation.js
```

**Expected Output:**
```
✅ Database: Connected
✅ Santri Data: Found
✅ Foto URL: Converted
✅ URL Accessibility: OK
✅ Image Download: OK
```

**Jika ada error:**
- ❌ Database connection failed → Check `.env.local`
- ❌ URL not accessible → Check bucket permissions
- ❌ Download failed → Check network/firewall

### 2. Delete Old Rapor

Di halaman Legger (`http://localhost:3000/rapor/legger`):

1. Cari santri yang sudah pernah di-generate
2. Klik icon 🗑️ di kolom PDF
3. Confirm delete

**Kenapa harus delete?**
- Rapor lama dibuat sebelum fix
- Perlu generate ulang dengan code terbaru
- Database log akan di-update

### 3. Generate Rapor Baru

1. Klik tombol **"Generate Rapor"** untuk santri yang sama
2. Tunggu proses selesai (30-60 detik)
3. **PENTING:** Perhatikan console log di terminal server

### 4. Check Console Logs

Di terminal server, cari log berikut:

#### ✅ Logs yang HARUS muncul:

```
📸 Processing foto santri: foto-1765613661855.jpg
🔄 Converted to: https://sirriyah.smaithsi.sch.id/storage/v1/object/public/foto-siswa/foto-1765613661855.jpg
✅ Added foto santri to placeholders
📋 Prepared 1 image placeholders
🖼️ Starting image insertion for 1 images...
🔍 Finding placeholder positions...
✅ Found placeholder: <<Foto Santri>> on slide ...
✅ Found 1 placeholder positions
📥 Processing image for <<Foto Santri>>...
📥 Downloading image from: https://sirriyah.smaithsi.sch.id/...
✅ Image downloaded, size: 123456 bytes
☁️ Uploading image to Drive: rapor_image_Foto Santri_...
✅ Image uploaded to Drive, ID: ...
✅ Image permission set to public
✅ Prepared image insertion for <<Foto Santri>>
🔄 Executing batch update with 2 requests...
✅ Batch update completed successfully
✅ Images inserted: 1/1
```

#### ❌ Logs yang menunjukkan ERROR:

```
⚠️ No foto found for santri
⚠️ Foto URL is null after conversion
⚠️ Skipping empty image URL for <<Foto Santri>>
⚠️ Placeholder position not found for: <<Foto Santri>>
❌ Error downloading image: ...
❌ Error uploading image to Drive: ...
❌ Batch update failed: ...
```

### 5. Download & Verify PDF

1. Klik link **Download** di kolom PDF
2. Buka PDF
3. Check apakah foto santri muncul (bukan placeholder `<<Foto Santri>>`)

## Possible Issues & Solutions

### Issue 1: Placeholder Masih Terlihat

**Kemungkinan Penyebab:**

#### A. Foto tidak ada di database
```
⚠️ No foto found for santri
```

**Solution:**
- Check database: `SELECT foto FROM data_siswa_keasramaan WHERE nis = '202310029'`
- Upload foto jika belum ada
- Pastikan kolom `foto` tidak NULL

#### B. URL conversion gagal
```
⚠️ Foto URL is null after conversion
```

**Solution:**
- Check env var: `NEXT_PUBLIC_SUPABASE_URL`
- Pastikan format: `https://sirriyah.smaithsi.sch.id`
- Restart server setelah update env

#### C. Placeholder tidak ditemukan di template
```
⚠️ Placeholder position not found for: <<Foto Santri>>
```

**Solution:**
- Buka Google Slides template
- Pastikan ada text box dengan **exact text**: `<<Foto Santri>>`
- Case-sensitive! Harus persis sama
- Tidak boleh ada spasi extra

#### D. Image download gagal
```
❌ Error downloading image: ...
```

**Solution:**
- Test URL di browser: `https://sirriyah.smaithsi.sch.id/storage/v1/object/public/foto-siswa/foto-xxx.jpg`
- Check bucket public: Supabase Dashboard → Storage → foto-siswa → Settings → Public
- Check firewall/network

#### E. Upload ke Drive gagal
```
❌ Error uploading image to Drive: ...
```

**Solution:**
- Check Google OAuth permissions
- Pastikan scope includes: `https://www.googleapis.com/auth/drive`
- Re-connect Google account
- Check Drive storage quota

### Issue 2: Server Error 500

**Kemungkinan Penyebab:**
- Google API rate limit
- Network timeout
- Invalid OAuth token

**Solution:**
```bash
# Check server logs
npm run dev

# Look for detailed error message
# Usually shows exact API error
```

### Issue 3: Foto Muncul Tapi Blur/Rusak

**Kemungkinan Penyebab:**
- Image corruption during download
- Wrong MIME type
- Size too large

**Solution:**
- Check original image di Supabase Storage
- Verify MIME type: `image/jpeg`, `image/png`
- Compress image if > 5MB

## Debug Checklist

Sebelum generate rapor, pastikan:

- [ ] `.env.local` sudah update dengan credentials baru
- [ ] Server sudah restart setelah update env
- [ ] Test script passed: `node test-image-generation.js`
- [ ] Foto exists di database (not NULL)
- [ ] Foto accessible via URL (test di browser)
- [ ] Google Slides template punya placeholder `<<Foto Santri>>`
- [ ] Google account connected dengan OAuth
- [ ] Old rapor sudah di-delete

## File Locations

### Code Files
- `lib/slidesImageInserter.ts` - Image insertion logic (FIXED)
- `lib/imageHelper.ts` - Download & upload helpers
- `lib/googleSlides.ts` - Main generate function
- `app/api/rapor/generate/route.ts` - API endpoint

### Test Files
- `test-image-generation.js` - Comprehensive test (NEW)
- `test-foto-url.js` - Simple URL test

### Documentation
- `RAPOR_FOTO_SERVER_SIDE_FIX.md` - Technical fix details
- `FOTO_SANTRI_TROUBLESHOOT.md` - This file

## Expected Behavior

### Before Fix
```
Input: foto-1765613661855.jpg
Process: supabase.storage.getPublicUrl() → null (server-side)
Result: ❌ Placeholder remains
```

### After Fix
```
Input: foto-1765613661855.jpg
Process: Manual URL construction
Output: https://sirriyah.smaithsi.sch.id/storage/v1/object/public/foto-siswa/foto-1765613661855.jpg
Download: ✅ Success
Upload to Drive: ✅ Success
Insert to Slides: ✅ Success
Result: ✅ Foto appears in PDF
```

## Contact Points

Jika masih ada masalah setelah mengikuti semua langkah:

1. **Share console logs** - Copy semua log dari terminal
2. **Share screenshot** - PDF yang di-generate
3. **Share test results** - Output dari `test-image-generation.js`
4. **Share error message** - Jika ada error di browser/server

## Quick Commands

```bash
# Test URL accessibility
node test-image-generation.js

# Test simple URL
node test-foto-url.js

# Start dev server with logs
npm run dev

# Check database
psql -h sirriyah.smaithsi.sch.id -U postgres -d postgres
```

---

**Last Updated:** December 13, 2024
**Status:** Fix applied, awaiting user testing
**Next Step:** User needs to test generate rapor and report results
