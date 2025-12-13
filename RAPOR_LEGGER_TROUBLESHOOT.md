# 🔧 Troubleshooting - Rapor Legger

## Error 406 - Supabase Query Failed

### Symptoms
```
Failed to load resource: the server responded with a status of 406
```

### Causes
1. **Table tidak ada** - Migration belum dijalankan
2. **RLS Policy** - Row Level Security blocking queries
3. **Authentication** - User tidak authenticated

### Solutions

#### 1. Run Migrations
Jalankan migration files di Supabase SQL Editor:

```sql
-- 1. Create tables
-- Run: supabase/migrations/20241212_rapor_system.sql

-- 2. Fix RLS policies
-- Run: supabase/migrations/20241213_fix_rapor_tables_rls.sql
```

#### 2. Check Tables Exist
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'rapor_%';

-- Should return:
-- rapor_kegiatan_keasramaan
-- rapor_dokumentasi_lainnya_keasramaan
-- rapor_rekap_habit_keasramaan
-- rapor_generate_log_keasramaan
-- rapor_catatan_keasramaan
```

#### 3. Check RLS Policies
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'rapor_%';

-- All should have rowsecurity = true
```

#### 4. Verify Authentication
```typescript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// If null, user needs to login
```

---

## Image URL Error

### Symptoms
```
TypeError: Failed to construct 'URL': Invalid URL
Error: Failed to parse src "foto-xxx.jpg" on `next/image`
```

### Causes
1. **Relative path** - Image URL is relative (e.g., `foto-123.jpg`)
2. **Missing protocol** - URL doesn't start with `http://` or `https://`
3. **Null/empty URL** - Image URL is null or empty string

### Solutions

#### 1. Fix Image URLs in Database
```sql
-- Check current foto URLs
SELECT nis, nama_siswa, foto 
FROM data_siswa_keasramaan 
WHERE foto IS NOT NULL 
LIMIT 10;

-- If foto is relative path, update to full URL
UPDATE data_siswa_keasramaan
SET foto = 'https://sirriyah.smaithsi.sch.id/storage/v1/object/public/user-photos/' || foto
WHERE foto IS NOT NULL 
AND foto NOT LIKE 'http%';
```

#### 2. Fix in Code (Already Fixed)
```typescript
// Check if URL is valid before rendering Image
{row.foto_url && (row.foto_url.startsWith('http://') || row.foto_url.startsWith('https://')) ? (
  <Image src={row.foto_url} ... />
) : (
  <div>No Photo</div>
)}
```

#### 3. Use Supabase Storage Helper
```typescript
// Get public URL from Supabase Storage
const getFotoUrl = (foto: string | null) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  
  const { data } = supabase.storage
    .from('user-photos')
    .getPublicUrl(foto);
  
  return data.publicUrl;
};
```

---

## Data Tidak Muncul di Legger

### Symptoms
- Tabel kosong
- "Tidak ada santri di kelas/asrama ini"

### Causes
1. **Filter salah** - Kombinasi filter tidak ada datanya
2. **Data belum ada** - Belum ada santri di kelas/asrama tersebut
3. **Query error** - Error saat fetch data

### Solutions

#### 1. Check Data Exists
```sql
-- Check santri data
SELECT cabang, kelas, asrama, COUNT(*) as total
FROM data_siswa_keasramaan
GROUP BY cabang, kelas, asrama
ORDER BY cabang, kelas, asrama;
```

#### 2. Check Filter Values
```typescript
// Log filter values
console.log('Filters:', {
  cabang: selectedCabang,
  tahunAjaran: selectedTahunAjaran,
  semester: selectedSemester,
  kelas: selectedKelas,
  asrama: selectedAsrama,
});
```

#### 3. Check Console Errors
- Open browser console (F12)
- Look for error messages
- Check network tab for failed requests

---

## Generate Rapor Fails

### Symptoms
- "Generate gagal"
- Error message in alert
- No PDF generated

### Causes
1. **Google OAuth** - Token expired or invalid
2. **Template missing** - Google Slides template not found
3. **API error** - Backend error
4. **Network timeout** - Slow connection

### Solutions

#### 1. Reconnect Google Account
```
1. Click "Connect Google Account"
2. Authorize again
3. Try generate again
```

#### 2. Check Template ID
```env
# .env.local
GOOGLE_SLIDES_TEMPLATE_ID=your_template_id_here
```

#### 3. Check Console Logs
```typescript
// Server logs (terminal)
console.log('📄 Generating rapor for:', nis);
console.log('✅ Success:', result);
console.log('❌ Error:', error);
```

#### 4. Check API Response
```typescript
// Browser console
const response = await fetch('/api/rapor/generate', {...});
const result = await response.json();
console.log('API Response:', result);
```

---

## Images Not Showing in PDF

### Symptoms
- PDF generated but images missing
- Placeholders still visible
- Only text data in PDF

### Causes
1. **Image URLs invalid** - URLs not accessible
2. **Insert images disabled** - Feature not enabled
3. **Placeholder not found** - Template missing placeholders
4. **Download failed** - Network error downloading images

### Solutions

#### 1. Check Image URLs
```sql
-- Check if image URLs are valid
SELECT nis, nama_siswa, foto
FROM data_siswa_keasramaan
WHERE foto IS NOT NULL
LIMIT 5;

-- Test URL in browser
-- Should be accessible: https://...
```

#### 2. Enable Image Insertion
```typescript
// In generateRaporSlides call
const result = await generateRaporSlides(
  data,
  accessToken,
  refreshToken,
  {
    insertImages: true, // Make sure this is true
  }
);
```

#### 3. Check Template Placeholders
```
Open Google Slides template
Check placeholders exist:
- <<Foto Santri>>
- <<Foto Kegiatan 1a>>
- <<Foto Kegiatan 1b>>
- etc.
```

#### 4. Check Console Logs
```
Look for:
- "📥 Downloading image from: ..."
- "☁️ Uploading to Drive: ..."
- "✅ Image inserted: ..."
- "❌ Error: ..."
```

---

## Slow Performance

### Symptoms
- Generate takes > 2 minutes
- Browser freezes
- Timeout errors

### Causes
1. **Large images** - Image files > 5 MB
2. **Many images** - 15+ images per rapor
3. **Slow network** - Poor internet connection
4. **API rate limit** - Too many requests

### Solutions

#### 1. Optimize Images
```sql
-- Check image file sizes
-- Compress images before upload
-- Recommended: < 1 MB per image
```

#### 2. Reduce Batch Size
```typescript
// Generate in smaller batches
// Instead of 50 santri, do 10 at a time
```

#### 3. Increase Timeout
```typescript
// In fetch call
const response = await fetch('/api/rapor/generate', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(120000), // 2 minutes
});
```

#### 4. Add Delay Between Batches
```typescript
// Already implemented: 2 seconds delay
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## Quick Fixes Checklist

### Before Testing
- [ ] Run all migrations
- [ ] Check RLS policies enabled
- [ ] Verify tables exist
- [ ] Check user authenticated
- [ ] Verify Google OAuth connected
- [ ] Check template ID correct
- [ ] Test image URLs accessible

### During Testing
- [ ] Open browser console
- [ ] Monitor network tab
- [ ] Check server logs
- [ ] Verify data in database
- [ ] Test with single santri first
- [ ] Check PDF output quality

### After Error
- [ ] Read error message carefully
- [ ] Check console logs
- [ ] Verify data completeness
- [ ] Test with different data
- [ ] Check network connection
- [ ] Restart server if needed

---

## Contact Support

If issues persist:
1. Copy error message
2. Take screenshot
3. Check console logs
4. Document steps to reproduce
5. Contact admin/developer

---

**Last Updated**: December 13, 2024
**Version**: 2.0.0
