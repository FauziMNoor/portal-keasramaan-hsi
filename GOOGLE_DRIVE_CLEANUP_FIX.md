# 🗑️ Fix: Google Slides File Not Deleted

## Problem

**User Report:**
1. ✅ PDF tersimpan di Supabase bucket
2. ❌ Google Slides file TIDAK terhapus dari Google Drive

**Expected:**
- Slides file should be deleted after PDF export (temporary file)

**Actual:**
- Slides file remains in Google Drive (storage waste)

## Root Cause

### Authentication Mismatch 🔐

```typescript
// Step 1: Create Slides (using OAuth)
const slidesResult = await generateRaporSlides(
  data,
  params.accessToken,  // ✅ User's OAuth token
  params.refreshToken
);
// File owner: user@gmail.com

// Step 2: Try to delete (using Service Account)
const { drive } = getGoogleSlidesClient(); // ❌ Service Account
await drive.files.delete({
  fileId: slidesResult.presentationId
});
// ❌ PERMISSION DENIED!
// Service Account cannot delete user's file
```

**Why it fails:**
1. File created by **User OAuth** (your Google account)
2. Delete attempted by **Service Account** (different account)
3. Service Account has **no permission** to delete user's files
4. Error caught but not thrown → **Silent failure**
5. File remains in Google Drive

### Permission Model

```
User OAuth Account (user@gmail.com)
├── Creates file ✅
├── Owns file ✅
└── Can delete file ✅

Service Account (service@project.iam.gserviceaccount.com)
├── Different account ❌
├── No ownership ❌
└── Cannot delete ❌ (Permission Denied)
```

## Solution

### Use Same OAuth Client for Delete

```typescript
// ✅ CORRECT: Use OAuth client (same as creation)
const { drive } = getGoogleSlidesClientWithOAuth(
  params.accessToken,
  params.refreshToken
);

await drive.files.delete({
  fileId: slidesResult.presentationId
});
// ✅ SUCCESS! Same account can delete own file
```

## Code Changes

### File: `app/api/rapor/generate/route.ts`

#### Before (Wrong):
```typescript
// Delete using Service Account
const { drive } = await import('@/lib/googleSlides')
  .then(m => m.getGoogleSlidesClient()); // ❌ Service Account

await drive.files.delete({
  fileId: slidesResult.presentationId!,
});
```

#### After (Correct):
```typescript
// Delete using OAuth (same as creation)
const { drive } = await import('@/lib/googleSlides')
  .then(m => m.getGoogleSlidesClientWithOAuth(
    params.accessToken,      // ✅ Same OAuth token
    params.refreshToken
  ));

await drive.files.delete({
  fileId: slidesResult.presentationId!,
});
```

## Testing

### Test 1: Generate New Rapor

1. Delete old rapor (🗑️ button)
2. Generate new rapor
3. Check server logs:

**Expected logs:**
```
📄 Generating Google Slides for: Maulana Aqila...
✅ Template copied successfully: 1abc...xyz
✅ Text placeholders replaced
✅ Images inserted: 13/13
📥 Exporting to PDF...
✅ PDF exported successfully
☁️ Uploading PDF to storage...
✅ PDF uploaded: Pusat/2024-2025/Ganjil/202310029-Maulana-Aqila.pdf
🗑️ Deleting temporary Google Slides file...
✅ Temporary Slides file deleted from Google Drive  ← ✅ Should see this!
```

**If delete fails:**
```
⚠️ Failed to delete Slides file: Permission denied
   File ID: 1abc...xyz
   This file will remain in Google Drive and need manual cleanup
```

### Test 2: Check Google Drive

1. Open Google Drive: https://drive.google.com
2. Search for: "Rapor - Maulana"
3. Check if old Slides files exist

**Before fix:**
- ❌ Multiple Slides files accumulate
- ❌ Storage waste

**After fix:**
- ✅ Only latest Slides file (if any)
- ✅ Old files deleted automatically

### Test 3: Check Supabase Storage

1. Open Supabase Dashboard
2. Go to Storage → `rapor-pdf` bucket
3. Check PDF files

**Expected:**
- ✅ PDF files exist
- ✅ One PDF per santri per semester
- ✅ Overwritten on re-generate

## Storage Flow (After Fix)

### Complete Flow

```
1. Generate Rapor
   ├── Create Slides (OAuth) → Google Drive
   ├── Replace text placeholders
   ├── Insert images
   ├── Export to PDF (in-memory Buffer)
   ├── Upload PDF → Supabase Storage ✅
   ├── Delete Slides (OAuth) → Google Drive ✅
   └── Save log → Database ✅

2. Result
   ├── PDF in Supabase ✅ (permanent)
   ├── Slides in Drive ❌ (deleted)
   └── Log in Database ✅ (permanent)
```

### Storage Locations

| Item | Location | Status | Lifecycle |
|------|----------|--------|-----------|
| **PDF File** | Supabase Storage (`rapor-pdf`) | ✅ Permanent | Until manual delete |
| **Slides File** | Google Drive | ✅ Deleted | Temporary (auto-delete) |
| **Generate Log** | Database (`rapor_generate_log_keasramaan`) | ✅ Permanent | Until manual delete |

## Benefits

### 1. Storage Savings 💾
- No accumulation of Slides files
- Only PDF stored (final output)
- Google Drive quota preserved

### 2. Clean Workspace 🧹
- No clutter in Google Drive
- Easy to find files
- Better organization

### 3. Security 🔒
- Temporary files removed
- Only final PDF accessible
- Less exposure

### 4. Cost Efficiency 💰
- Less storage usage
- Lower Google Workspace costs
- Optimized resource usage

## Troubleshooting

### Issue: Delete Still Fails

**Check 1: OAuth Token Valid?**
```
Error: "Invalid credentials"
→ Re-connect Google account
→ Check token expiration
```

**Check 2: OAuth Scope Includes Drive?**
```
Required scopes:
- https://www.googleapis.com/auth/presentations
- https://www.googleapis.com/auth/drive  ← Must have this!
```

**Check 3: File ID Correct?**
```
Check logs for:
   File ID: 1abc...xyz
Verify in Google Drive URL:
   https://docs.google.com/presentation/d/1abc...xyz/edit
```

### Issue: Permission Denied

**Possible causes:**
1. File owned by different account
2. OAuth token expired
3. Insufficient permissions
4. File already deleted

**Solution:**
```typescript
// Check error details
catch (deleteError: any) {
  console.error('Delete error:', deleteError);
  console.error('Error code:', deleteError.code);
  console.error('Error message:', deleteError.message);
}
```

## Manual Cleanup (If Needed)

If old Slides files accumulated before fix:

### Option 1: Manual Delete
1. Open Google Drive
2. Search: "Rapor -"
3. Select old Slides files
4. Delete

### Option 2: Script Delete
```javascript
// Use Google Apps Script
function cleanupOldRapor() {
  const files = DriveApp.searchFiles(
    'title contains "Rapor -" and mimeType = "application/vnd.google-apps.presentation"'
  );
  
  while (files.hasNext()) {
    const file = files.next();
    const created = file.getDateCreated();
    const now = new Date();
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    // Delete files older than 7 days
    if (daysDiff > 7) {
      Logger.log('Deleting: ' + file.getName());
      file.setTrashed(true);
    }
  }
}
```

## Summary

### What Was Wrong ❌
- Delete using Service Account (different from creator)
- Permission denied (cannot delete user's files)
- Silent failure (error caught but not thrown)
- Files accumulate in Google Drive

### What Was Fixed ✅
- Delete using OAuth client (same as creator)
- Proper permissions (owner can delete)
- Better error logging
- Files cleaned up automatically

### Expected Result 🎯
- ✅ PDF saved to Supabase Storage
- ✅ Slides file deleted from Google Drive
- ✅ Log saved to database
- ✅ Clean workspace, no clutter

---

**Fixed by:** Kiro AI Assistant  
**Date:** December 13, 2024  
**Issue:** Google Slides files not deleted (OAuth vs Service Account)  
**Status:** Fixed, ready for testing
