# 🧪 Test Guide - Image Insertion

## Pre-requisites

### 1. Template Setup
- [ ] Google Slides template sudah ada
- [ ] Template memiliki placeholders:
  - `<<Foto Santri>>`
  - `<<Foto Kegiatan 1a>>`, `<<Foto Kegiatan 1b>>`
  - `<<Foto Kegiatan 2a>>`, `<<Foto Kegiatan 2b>>`
  - `<<Foto Kegiatan 3a>>`, `<<Foto Kegiatan 3b>>`
  - `<<Foto Kegiatan 4a>>`, `<<Foto Kegiatan 4b>>`
  - `<<Foto Kegiatan 5a>>`, `<<Foto Kegiatan 5b>>`
  - `<<Foto Kegiatan 6a>>`, `<<Foto Kegiatan 6b>>`
  - `<<Dokumentasi Program Lainnya>>`

### 2. Data Setup
- [ ] Ada santri dengan foto di `data_siswa_keasramaan.foto`
- [ ] Ada kegiatan dengan foto di `rapor_kegiatan_keasramaan.foto_1`, `foto_2`
- [ ] Ada dokumentasi dengan foto di `rapor_dokumentasi_lainnya_keasramaan.foto_url`
- [ ] Semua foto URL accessible (public)

### 3. Environment
- [ ] Google OAuth configured
- [ ] Google Drive folder ID set
- [ ] Supabase storage configured
- [ ] Development server running

## Test Scenarios

### Scenario 1: Single Image (Foto Santri)

#### Setup
1. Pilih santri yang memiliki foto
2. Pastikan foto URL valid & accessible

#### Steps
1. Buka `/rapor/legger`
2. Pilih filter (Cabang, Tahun Ajaran, Semester, Kelas, Asrama)
3. Cari santri dengan foto
4. Klik tombol Generate

#### Expected Result
- ✅ Generate success
- ✅ Foto santri ter-insert di slide 1
- ✅ Placeholder text terhapus
- ✅ Image size sesuai placeholder
- ✅ PDF export includes foto

#### Verification
1. Buka Slides URL (sebelum delete)
2. Check foto santri ada di slide 1
3. Download PDF
4. Check foto santri ada di PDF

---

### Scenario 2: Multiple Images (Kegiatan)

#### Setup
1. Setup 6 kegiatan dengan foto (foto_1 & foto_2)
2. Pastikan semua foto URL valid

#### Steps
1. Generate rapor untuk santri di kelas dengan 6 kegiatan
2. Monitor console log untuk image insertion

#### Expected Result
- ✅ 12 foto kegiatan ter-insert (6 x 2)
- ✅ Semua placeholder terhapus
- ✅ Images positioned correctly
- ✅ PDF includes all kegiatan photos

#### Verification
1. Check Slides: 12 images inserted
2. Check PDF: All photos visible
3. Check console: No errors

---

### Scenario 3: Missing Images

#### Setup
1. Santri tanpa foto (foto = null)
2. Kegiatan dengan foto_1 only (foto_2 = null)

#### Steps
1. Generate rapor untuk santri tanpa foto
2. Check console log

#### Expected Result
- ✅ Generate success (tidak error)
- ⚠️ Placeholder tetap ada (tidak ter-replace)
- ✅ Other images ter-insert
- ✅ Console log: "Skipping empty image URL"

#### Verification
1. Check Slides: Placeholder text masih ada
2. Check PDF: Placeholder text visible
3. No errors thrown

---

### Scenario 4: Invalid Image URL

#### Setup
1. Santri dengan foto URL invalid (404)
2. Kegiatan dengan foto URL broken

#### Steps
1. Generate rapor
2. Monitor console log

#### Expected Result
- ⚠️ Generate success (partial)
- ❌ Invalid images skipped
- ✅ Valid images ter-insert
- ⚠️ Error logged in console
- ⚠️ Error in imageInsertResult.errors

#### Verification
1. Check console: "Failed to download image"
2. Check result: errors array not empty
3. Valid images still inserted

---

### Scenario 5: Large Images

#### Setup
1. Upload foto > 5 MB
2. Upload foto dengan resolution > 4K

#### Steps
1. Generate rapor
2. Monitor performance

#### Expected Result
- ✅ Generate success (may be slow)
- ⏱️ Longer processing time
- ✅ Images ter-insert
- ⚠️ May hit timeout (if too large)

#### Verification
1. Check processing time
2. Check image quality in PDF
3. Check file size

---

### Scenario 6: Batch Generate with Images

#### Setup
1. Kelas dengan 10 santri
2. Semua santri memiliki foto
3. Semua kegiatan memiliki foto

#### Steps
1. Klik "Generate Semua Rapor"
2. Monitor progress

#### Expected Result
- ✅ All rapor generated
- ✅ All images inserted
- ⏱️ ~1-2 minutes per santri
- ✅ No rate limit errors

#### Verification
1. Check all PDF files
2. Verify all images present
3. Check console for errors

---

### Scenario 7: Template Placeholder Not Found

#### Setup
1. Template tanpa placeholder `<<Foto Santri>>`
2. Atau placeholder typo: `<<Foto Santrii>>`

#### Steps
1. Generate rapor
2. Check console log

#### Expected Result
- ⚠️ Generate success (partial)
- ⚠️ Warning: "Placeholder position not found"
- ✅ Other placeholders still work
- ⚠️ Error in imageInsertResult.errors

#### Verification
1. Check console: Warning logged
2. Check result: errors array contains message
3. Other images still inserted

---

### Scenario 8: Google Drive Permission Error

#### Setup
1. Drive folder dengan restricted permission
2. OAuth token tanpa Drive access

#### Steps
1. Generate rapor
2. Check error

#### Expected Result
- ❌ Generate fails
- ❌ Error: "Permission denied"
- ❌ No images inserted

#### Verification
1. Check error message
2. Verify OAuth scopes
3. Fix permissions

---

### Scenario 9: API Rate Limit

#### Setup
1. Generate 100+ rapor dalam 1 menit
2. Each rapor has 15 images

#### Steps
1. Batch generate large number
2. Monitor API calls

#### Expected Result
- ⚠️ Some requests may fail
- ⚠️ Error: "Rate limit exceeded"
- ✅ Retry logic (future)

#### Verification
1. Check failed count
2. Check rate limit headers
3. Implement delay if needed

---

### Scenario 10: Network Timeout

#### Setup
1. Slow network connection
2. Large image files

#### Steps
1. Generate rapor
2. Monitor timeout

#### Expected Result
- ⚠️ May timeout after 30 seconds
- ❌ Error: "Network timeout"
- ⚠️ Partial images inserted

#### Verification
1. Check timeout error
2. Verify timeout setting (30s)
3. Retry if needed

---

## Performance Benchmarks

### Target Performance
- **Single Image**: < 3 seconds
- **15 Images**: < 45 seconds
- **Batch (10 santri)**: < 10 minutes

### Actual Performance (to be measured)
- Single Image: ___ seconds
- 15 Images: ___ seconds
- Batch (10 santri): ___ minutes

### Bottlenecks
- [ ] Image download speed
- [ ] Drive upload speed
- [ ] Slides API latency
- [ ] Network bandwidth

## Error Tracking

### Common Errors

#### 1. "Failed to download image"
**Cause**: Invalid URL, 404, network error
**Solution**: Verify URL, check network, retry

#### 2. "Failed to upload image"
**Cause**: Drive API error, permission error
**Solution**: Check OAuth scopes, verify permissions

#### 3. "Placeholder position not found"
**Cause**: Placeholder not in template, typo
**Solution**: Check template, fix placeholder text

#### 4. "Batch update failed"
**Cause**: Invalid request, API error
**Solution**: Check request format, retry

#### 5. "Rate limit exceeded"
**Cause**: Too many API calls
**Solution**: Add delay, reduce batch size

## Debugging Tips

### Enable Verbose Logging
```typescript
console.log('📥 Downloading:', imageUrl);
console.log('☁️ Uploading:', fileName);
console.log('🔍 Finding placeholder:', placeholder);
console.log('✅ Inserted:', imageObjectId);
```

### Check Slides Before Delete
Comment out the delete Slides code to inspect:
```typescript
// await drive.files.delete({ fileId: presentationId });
console.log('🔗 Slides URL:', slidesUrl);
```

### Test with Single Image First
```typescript
const imagePlaceholders = [
  { placeholder: '<<Foto Santri>>', imageUrl: santri.foto }
];
```

### Monitor API Quotas
Check Google Cloud Console → APIs & Services → Quotas

## Sign-off Checklist

### Functionality
- [ ] Foto santri ter-insert
- [ ] Foto kegiatan ter-insert (12 foto)
- [ ] Dokumentasi ter-insert
- [ ] Missing images handled gracefully
- [ ] Invalid URLs handled gracefully
- [ ] Batch generate works

### Performance
- [ ] Single image < 3 seconds
- [ ] 15 images < 45 seconds
- [ ] No memory leaks
- [ ] No rate limit errors

### Error Handling
- [ ] Download errors logged
- [ ] Upload errors logged
- [ ] Placeholder not found logged
- [ ] Partial success handled
- [ ] User-friendly error messages

### Quality
- [ ] Images not distorted
- [ ] Aspect ratio maintained
- [ ] Position correct
- [ ] Size appropriate
- [ ] PDF quality good

### Documentation
- [ ] Code commented
- [ ] API documented
- [ ] User guide updated
- [ ] Troubleshooting guide complete

## Test Results

**Date**: _______________
**Tester**: _______________
**Version**: _______________

### Summary
- Total Scenarios: 10
- Passed: ___
- Failed: ___
- Skipped: ___

### Issues Found
1. 
2. 
3. 

### Performance Results
- Single Image: ___ seconds
- 15 Images: ___ seconds
- Batch (10 santri): ___ minutes

### Recommendations
- 
- 
- 

**Status**: ⬜ Pass / ⬜ Fail / ⬜ Needs Improvement

**Approved by**: _______________
**Date**: _______________
