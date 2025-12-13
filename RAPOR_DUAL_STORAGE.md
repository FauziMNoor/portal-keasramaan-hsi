# 📦 Dual Storage: Supabase + Google Drive

## Overview

Rapor PDF sekarang disimpan di **2 lokasi**:

1. ✅ **Supabase Storage** - Primary storage (fast access, signed URL)
2. ✅ **Google Drive** - Backup storage (easy sharing, unlimited storage)

## Storage Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Generate Google Slides (with images)                │
│     ↓                                                    │
│  2. Export to PDF (Buffer in memory)                    │
│     ↓                                                    │
│  3. Upload PDF to Supabase Storage ✅                   │
│     ↓                                                    │
│  4. Upload PDF to Google Drive ✅                       │
│     ↓                                                    │
│  5. Delete temporary Slides file ✅                     │
│     ↓                                                    │
│  6. Save log to database                                │
└─────────────────────────────────────────────────────────┘
```

## Implementation

### Code Changes

**File:** `app/api/rapor/generate/route.ts`

```typescript
// Step 4: Export to PDF
const pdfResult = await exportToPDF(presentationId, accessToken, refreshToken);

// Step 5: Upload to Supabase Storage
const uploadResult = await uploadPDFRapor(pdfResult.pdfBuffer, metadata);

// Step 6: Upload to Google Drive (NEW!)
const driveUploadResult = await drive.files.create({
  requestBody: {
    name: `Rapor - ${santri.nama_siswa} - ${semester} ${tahunAjaran}.pdf`,
    mimeType: 'application/pdf',
    parents: [folderId], // Save to specific folder
  },
  media: {
    mimeType: 'application/pdf',
    body: pdfResult.pdfBuffer, // Upload PDF buffer
  },
  fields: 'id, webViewLink, webContentLink',
});

// Step 7: Delete temporary Slides file
await drive.files.delete({
  fileId: presentationId,
});

// Step 8: Save to database
await supabase.from('rapor_generate_log_keasramaan').insert([{
  presentation_id: driveUploadResult.data.id, // PDF file ID in Drive
  pdf_url: uploadResult.path, // Path in Supabase Storage
  drive_pdf_url: driveUploadResult.data.webViewLink, // View link in Drive
}]);
```

### Database Schema

**Migration:** `20241213_add_drive_pdf_url.sql`

```sql
ALTER TABLE rapor_generate_log_keasramaan 
ADD COLUMN IF NOT EXISTS drive_pdf_url TEXT;
```

**Columns:**
- `presentation_id` → PDF file ID in Google Drive (not Slides anymore!)
- `pdf_url` → Path in Supabase Storage (`Pusat/2024-2025/Ganjil/202310029-Maulana.pdf`)
- `drive_pdf_url` → View link in Google Drive (`https://drive.google.com/file/d/.../view`)

## Benefits

### 1. Redundancy 🛡️
- **Primary:** Supabase (fast, reliable)
- **Backup:** Google Drive (unlimited storage)
- If one fails, still have the other

### 2. Easy Sharing 🔗
- Google Drive link can be shared directly
- No need to generate signed URL
- Permanent link (doesn't expire)

### 3. Unlimited Storage 💾
- Google Workspace has unlimited storage
- Supabase has limited storage (depends on plan)
- Long-term storage in Google Drive

### 4. User Preference 👥
- Some users prefer Google Drive
- Familiar interface
- Easy to organize in folders

## Storage Comparison

| Feature | Supabase Storage | Google Drive |
|---------|------------------|--------------|
| **Speed** | ⚡ Very Fast | 🐢 Slower |
| **Access** | Signed URL (expires) | Permanent link |
| **Storage** | Limited (plan-based) | Unlimited |
| **Cost** | Paid (after free tier) | Free (Workspace) |
| **API** | Simple | Complex |
| **Sharing** | Need signed URL | Direct share |
| **Organization** | Flat structure | Folder hierarchy |

## File Naming

### Supabase Storage
```
Path: {cabang}/{tahun_ajaran}/{semester}/{nis}-{nama_siswa}.pdf
Example: Pusat/2024-2025/Ganjil/202310029-Maulana-Aqila-Umar-Abdul-Aziz.pdf
```

### Google Drive
```
Name: Rapor - {nama_siswa} - {semester} {tahun_ajaran}.pdf
Example: Rapor - Maulana Aqila Umar Abdul Aziz - Ganjil 2024/2025.pdf
Location: {GOOGLE_DRIVE_FOLDER_ID}/
```

## Access URLs

### Supabase Storage
```typescript
// Get signed URL (expires in 1 hour)
const { data } = await supabase.storage
  .from('rapor-pdf')
  .createSignedUrl(pdf_url, 3600);

console.log(data.signedUrl);
// https://sirriyah.smaithsi.sch.id/storage/v1/object/sign/rapor-pdf/...?token=...
```

### Google Drive
```typescript
// Direct view link (permanent)
console.log(drive_pdf_url);
// https://drive.google.com/file/d/1abc...xyz/view

// Download link
const downloadLink = drive_pdf_url.replace('/view', '/download');
// https://drive.google.com/file/d/1abc...xyz/download
```

## Migration Steps

### 1. Run Migration
```bash
psql -h sirriyah.smaithsi.sch.id -U postgres -d postgres -f supabase/migrations/20241213_add_drive_pdf_url.sql
```

### 2. Test Generate
- Delete old rapor (🗑️ button)
- Generate new rapor
- Check both storage locations

### 3. Verify Database
```sql
SELECT 
  nama_siswa,
  pdf_url, -- Supabase path
  drive_pdf_url -- Google Drive link
FROM rapor_generate_log_keasramaan
WHERE status = 'success'
ORDER BY generated_at DESC
LIMIT 5;
```

## Cleanup Strategy

### Temporary Files (Auto-deleted)
- ✅ Google Slides file → Deleted after PDF export
- ✅ In-memory PDF buffer → Garbage collected

### Permanent Files (Manual cleanup)
- ⚠️ Supabase Storage → Manual delete if needed
- ⚠️ Google Drive → Manual delete if needed

### When to Clean Up
- **Old semester rapor** → Archive or delete
- **Test rapor** → Delete after testing
- **Duplicate rapor** → Keep latest only

## Error Handling

### If Supabase Upload Fails
```
✅ Continue with Google Drive upload
⚠️ Log error but don't stop process
✅ User can still access from Google Drive
```

### If Google Drive Upload Fails
```
✅ Continue with Supabase storage
⚠️ Log error but don't stop process
✅ User can still download from Supabase
```

### If Both Fail
```
❌ Return error to user
❌ Save error log to database
❌ User needs to retry
```

## Monitoring

### Check Storage Usage

**Supabase:**
```sql
SELECT 
  COUNT(*) as total_files,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
FROM storage.objects
WHERE bucket_id = 'rapor-pdf';
```

**Google Drive:**
```typescript
// Use Drive API to check storage
const response = await drive.about.get({
  fields: 'storageQuota',
});

console.log('Used:', response.data.storageQuota.usage);
console.log('Limit:', response.data.storageQuota.limit);
```

## Future Enhancements

### 1. Sync Status
- Track if file exists in both locations
- Auto-repair if one is missing
- Periodic sync check

### 2. Storage Preference
- Let user choose primary storage
- Download from preferred location
- Fallback to secondary if primary fails

### 3. Automatic Archival
- Move old rapor to archive folder
- Compress old files
- Delete after retention period

### 4. Batch Operations
- Bulk upload to Drive
- Bulk download from Drive
- Bulk delete old files

## Summary

**Before:**
- ❌ Only Supabase Storage
- ❌ Slides file remains in Drive
- ❌ No backup

**After:**
- ✅ Dual storage (Supabase + Drive)
- ✅ PDF format in both locations
- ✅ Automatic cleanup of Slides
- ✅ Redundancy and backup

---

**Updated:** December 13, 2024  
**Version:** 4.0.0  
**Status:** Ready for testing
