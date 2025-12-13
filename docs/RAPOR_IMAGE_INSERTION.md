# 🖼️ Rapor Image Insertion - Documentation

## Overview

Fitur insert images ke Google Slides memungkinkan foto santri, foto kegiatan, dan dokumentasi program lainnya ter-insert otomatis ke dalam rapor PDF.

## How It Works

### 1. Flow Diagram

```
Generate Rapor API
    ↓
Copy Google Slides Template
    ↓
Replace Text Placeholders
    ↓
Prepare Image Placeholders
    ↓
For each image:
    ├─ Download image from URL (Supabase Storage)
    ├─ Upload to Google Drive
    ├─ Get Drive file ID
    ├─ Find placeholder position in Slides
    ├─ Insert image at placeholder position
    └─ Delete text placeholder
    ↓
Export to PDF
    ↓
Upload PDF to Supabase Storage
    ↓
Delete temporary Slides & Drive images
```

### 2. Image Placeholders

#### Foto Santri
- **Placeholder**: `<<Foto Santri>>`
- **Source**: `data_siswa_keasramaan.foto`
- **Position**: Header slide (biasanya slide 1)

#### Foto Kegiatan (6 kegiatan x 2 foto)
- **Placeholders**: 
  - `<<Foto Kegiatan 1a>>`, `<<Foto Kegiatan 1b>>`
  - `<<Foto Kegiatan 2a>>`, `<<Foto Kegiatan 2b>>`
  - `<<Foto Kegiatan 3a>>`, `<<Foto Kegiatan 3b>>`
  - `<<Foto Kegiatan 4a>>`, `<<Foto Kegiatan 4b>>`
  - `<<Foto Kegiatan 5a>>`, `<<Foto Kegiatan 5b>>`
  - `<<Foto Kegiatan 6a>>`, `<<Foto Kegiatan 6b>>`
- **Source**: `rapor_kegiatan_keasramaan.foto_1`, `foto_2`
- **Position**: Kegiatan section (biasanya slide 3-4)

#### Dokumentasi Program Lainnya
- **Placeholder**: `<<Dokumentasi Program Lainnya>>`
- **Source**: `rapor_dokumentasi_lainnya_keasramaan.foto_url`
- **Position**: Dokumentasi section (biasanya slide 5)

### 3. Technical Implementation

#### A. Image Helper (`lib/imageHelper.ts`)

**Functions**:
- `downloadImage(url)` - Download image dari URL menggunakan fetch API
- `uploadImageToDrive(buffer, fileName, mimeType, drive, folderId)` - Upload image ke Google Drive
- `getMimeTypeFromUrl(url)` - Detect MIME type dari URL
- `calculateScaledDimensions(...)` - Calculate scaled dimensions untuk maintain aspect ratio
- `pointsToEMU(points)` - Convert points to EMU (English Metric Units)

**Example**:
```typescript
const imageBuffer = await downloadImage('https://example.com/photo.jpg');
const driveFileId = await uploadImageToDrive(
  imageBuffer,
  'photo.jpg',
  'image/jpeg',
  drive,
  folderId
);
```

#### B. Slides Image Inserter (`lib/slidesImageInserter.ts`)

**Functions**:
- `findPlaceholderPositions(slides, presentationId, placeholders)` - Find position & size dari text placeholders
- `insertImagesIntoSlides(slides, drive, presentationId, imagePlaceholders, folderId)` - Insert images ke Slides
- `prepareImagePlaceholders(data)` - Prepare list of images to insert

**Example**:
```typescript
const imagePlaceholders = prepareImagePlaceholders({
  santri: santriData,
  kegiatan: kegiatanData,
  dokumentasi: dokumentasiData,
});

const result = await insertImagesIntoSlides(
  slides,
  drive,
  presentationId,
  imagePlaceholders,
  folderId
);
```

#### C. Google Slides Integration (`lib/googleSlides.ts`)

**Updated Function**:
```typescript
generateRaporSlides(data, accessToken, refreshToken, options)
```

**New Options**:
- `insertImages: boolean` - Enable/disable image insertion (default: true)

**Example**:
```typescript
const result = await generateRaporSlides(
  {
    santriData,
    habitData,
    kegiatanData,
    dokumentasiData,
    replacements,
  },
  accessToken,
  refreshToken,
  {
    insertImages: true, // Enable image insertion
  }
);
```

### 4. Google Slides API Requests

#### Find Placeholder Position
```typescript
// Get presentation structure
const presentation = await slides.presentations.get({
  presentationId,
});

// Iterate through slides and elements
for (const slide of presentation.data.slides) {
  for (const element of slide.pageElements) {
    if (element.shape?.text) {
      // Check if text contains placeholder
      // Store position & size
    }
  }
}
```

#### Insert Image
```typescript
{
  createImage: {
    url: 'https://drive.google.com/uc?export=view&id=FILE_ID',
    elementProperties: {
      pageObjectId: 'slide_id',
      size: {
        width: { magnitude: 3000000, unit: 'EMU' },
        height: { magnitude: 2000000, unit: 'EMU' },
      },
      transform: {
        scaleX: 1,
        scaleY: 1,
        translateX: 1000000,
        translateY: 1000000,
        unit: 'EMU',
      },
    },
    objectId: 'unique_image_id',
  },
}
```

#### Delete Placeholder
```typescript
{
  deleteObject: {
    objectId: 'placeholder_element_id',
  },
}
```

### 5. Error Handling

#### Image Download Errors
- **Timeout**: 30 seconds timeout untuk download
- **HTTP Error**: Check response status
- **Network Error**: Retry logic (future enhancement)

#### Image Upload Errors
- **Drive API Error**: Log error & skip image
- **Permission Error**: Set file to public readable
- **Quota Error**: Handle quota exceeded

#### Image Insertion Errors
- **Placeholder Not Found**: Log warning & skip
- **Invalid Image URL**: Skip empty/invalid URLs
- **Batch Update Error**: Rollback & retry

**Error Response**:
```typescript
{
  success: true,
  insertedCount: 10,
  errors: [
    'Position not found: <<Foto Kegiatan 3a>>',
    'Failed to download: Network timeout',
  ],
}
```

### 6. Performance Considerations

#### Optimization Strategies
1. **Parallel Downloads**: Download multiple images concurrently
2. **Image Compression**: Compress images before upload (future)
3. **Caching**: Cache Drive file IDs (future)
4. **Batch Requests**: Combine multiple operations in single API call

#### Current Performance
- **Single Image**: ~2-3 seconds (download + upload + insert)
- **15 Images** (1 santri + 12 kegiatan + 2 dokumentasi): ~30-45 seconds
- **Batch Generate**: Add ~30-45 seconds per santri

#### Rate Limits
- **Google Slides API**: 300 requests per minute
- **Google Drive API**: 1000 requests per 100 seconds
- **Delay Between Batch**: 2 seconds (already implemented)

### 7. Image Requirements

#### Supported Formats
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

#### Recommended Specs
- **Resolution**: 1920x1080 (Full HD) or lower
- **File Size**: < 5 MB per image
- **Aspect Ratio**: 16:9 or 4:3
- **Color Space**: RGB

#### Image Sources
- **Supabase Storage**: Public bucket URLs
- **Google Drive**: Shared links
- **External URLs**: Must be publicly accessible

### 8. Template Setup

#### Placeholder Format
```
Text box with placeholder text: <<Foto Santri>>
```

#### Placeholder Positioning
1. Create text box in Slides
2. Type placeholder text (e.g., `<<Foto Santri>>`)
3. Position & resize text box to desired image size
4. Image will replace text box at same position & size

#### Best Practices
- Use consistent placeholder naming
- Set text box size to desired image size
- Use contrasting color for easy identification
- Test with sample data before production

### 9. Testing

#### Unit Tests
```typescript
// Test image download
const buffer = await downloadImage('https://example.com/test.jpg');
expect(buffer).toBeInstanceOf(Buffer);

// Test MIME type detection
const mimeType = getMimeTypeFromUrl('photo.jpg');
expect(mimeType).toBe('image/jpeg');

// Test placeholder preparation
const placeholders = prepareImagePlaceholders(testData);
expect(placeholders.length).toBeGreaterThan(0);
```

#### Integration Tests
```typescript
// Test full image insertion flow
const result = await insertImagesIntoSlides(
  slides,
  drive,
  presentationId,
  imagePlaceholders,
  folderId
);
expect(result.success).toBe(true);
expect(result.insertedCount).toBe(imagePlaceholders.length);
```

#### Manual Testing Checklist
- [ ] Foto santri ter-insert dengan benar
- [ ] Semua foto kegiatan ter-insert (12 foto)
- [ ] Dokumentasi ter-insert
- [ ] Position & size sesuai placeholder
- [ ] Aspect ratio maintained
- [ ] No distortion
- [ ] PDF export includes images
- [ ] Temporary files deleted

### 10. Troubleshooting

#### Images Not Showing
**Possible Causes**:
- Placeholder text tidak exact match
- Image URL tidak accessible
- Drive permission error
- Slides API quota exceeded

**Solutions**:
- Check placeholder spelling
- Verify image URL is public
- Check Google OAuth permissions
- Wait for quota reset

#### Images Distorted
**Possible Causes**:
- Aspect ratio not maintained
- Placeholder size too small/large
- Image resolution too low

**Solutions**:
- Use `calculateScaledDimensions()`
- Adjust placeholder size in template
- Use higher resolution images

#### Slow Performance
**Possible Causes**:
- Large image files
- Slow network
- Many images to insert

**Solutions**:
- Compress images before upload
- Use CDN for image hosting
- Implement parallel downloads
- Add progress indicator

#### Batch Generate Fails
**Possible Causes**:
- API rate limit exceeded
- Timeout
- Memory issues

**Solutions**:
- Increase delay between batches
- Reduce batch size
- Implement retry logic
- Monitor API quotas

### 11. Future Enhancements

#### Phase 3 (Planned)
- [ ] Image compression before upload
- [ ] Parallel image downloads
- [ ] Image caching (Drive file IDs)
- [ ] Retry logic for failed downloads
- [ ] Progress tracking per image
- [ ] Image optimization (resize, crop)
- [ ] Support for multiple dokumentasi images
- [ ] Watermark support
- [ ] Image filters (grayscale, sepia)

#### Phase 4 (Future)
- [ ] AI-powered image enhancement
- [ ] Auto-crop faces
- [ ] Background removal
- [ ] Image quality analysis
- [ ] Duplicate image detection
- [ ] Bulk image upload
- [ ] Image library management

### 12. API Reference

#### `downloadImage(imageUrl: string): Promise<Buffer>`
Download image dari URL.

**Parameters**:
- `imageUrl` - URL of the image

**Returns**: Promise<Buffer>

**Throws**: Error if download fails

---

#### `uploadImageToDrive(imageBuffer, fileName, mimeType, drive, folderId): Promise<string>`
Upload image ke Google Drive.

**Parameters**:
- `imageBuffer` - Image buffer
- `fileName` - File name
- `mimeType` - MIME type
- `drive` - Google Drive client
- `folderId` - Target folder ID (optional)

**Returns**: Promise<string> - Drive file ID

**Throws**: Error if upload fails

---

#### `insertImagesIntoSlides(slides, drive, presentationId, imagePlaceholders, folderId): Promise<Result>`
Insert images ke Google Slides.

**Parameters**:
- `slides` - Google Slides client
- `drive` - Google Drive client
- `presentationId` - Presentation ID
- `imagePlaceholders` - Array of image placeholders
- `folderId` - Target folder ID (optional)

**Returns**: Promise<{ success, insertedCount, errors }>

---

#### `prepareImagePlaceholders(data): ImagePlaceholder[]`
Prepare list of images to insert.

**Parameters**:
- `data` - Object containing santri, kegiatan, dokumentasi

**Returns**: Array of ImagePlaceholder

---

### 13. Summary

✅ **Implemented**:
- Download images from URLs
- Upload to Google Drive
- Find placeholder positions
- Insert images at correct positions
- Delete text placeholders
- Error handling & logging
- Support for 15+ images per rapor

⏳ **TODO** (Future):
- Image compression
- Parallel downloads
- Caching
- Retry logic
- Progress tracking

🎉 **Result**: Rapor PDF sekarang include semua foto (santri, kegiatan, dokumentasi)!
