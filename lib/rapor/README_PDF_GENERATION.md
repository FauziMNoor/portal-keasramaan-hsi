# PDF Generation for Builder Templates

This document describes the PDF generation system for builder templates in the Portal Keasramaan application.

## Overview

The PDF generation system converts builder templates (created with the drag-and-drop template builder) into PDF documents with real student data. It uses `@react-pdf/renderer` for PDF generation and includes comprehensive data fetching, image handling, and element rendering capabilities.

## Architecture

### Core Components

1. **builder-pdf-generator.tsx** - Main PDF generator
   - Orchestrates the entire PDF generation process
   - Handles element positioning and sizing conversion (pixels to mm)
   - Pre-loads and caches images for embedding
   - Validates templates before generation
   - Exports functions for generating, downloading, and validating PDFs

2. **data-fetcher.ts** - Data fetching utility
   - Fetches student data from database
   - Calculates habit tracker aggregates (averages, percentages)
   - Fetches galeri kegiatan filtered by periode
   - Fetches school and pembina information
   - Returns complete `DataBindingSchemaType` object

3. **image-handler.ts** - Image processing utility
   - Downloads images from URLs
   - Converts images to base64 for PDF embedding
   - Optimizes images (resize, compress)
   - Handles image load failures with fallbacks
   - Supports batch downloading with concurrency control

4. **pdf-elements/** - Element renderers
   - Individual renderer for each element type
   - Uses React-PDF components (View, Text, Image, etc.)
   - Applies styling from element configurations
   - Resolves data bindings using placeholder resolver

## Element Renderers

### HeaderElement.tsx
Renders header sections with:
- Logo (optional, with positioning)
- Title text with styling
- Subtitle (optional)
- Background color and borders

### TextElement.tsx
Renders text blocks with:
- Font styling (family, size, weight, color)
- Text alignment
- Line height and letter spacing
- Background and borders

### DataTableElement.tsx
Renders data tables with:
- Dynamic column configuration
- Data binding to habit tracker or other sources
- Header and row styling
- Alternate row colors
- Cell formatting (text, number, percentage, date)

### ImageElement.tsx
Renders single images with:
- Multiple fit options (cover, contain, fill)
- Border and border radius
- Opacity control
- Fallback for missing images

### ImageGalleryElement.tsx
Renders image galleries with:
- Grid, row, or column layouts
- Configurable image count
- Image captions (below or overlay)
- Fallback for missing images

### SignatureElement.tsx
Renders signature blocks with:
- Label text
- Signature line (optional)
- Name with data binding
- Date display (optional)

### LineElement.tsx
Renders divider lines with:
- Solid, dashed, or dotted styles
- Configurable color and thickness
- Horizontal or vertical orientation

## Data Flow

```
1. Fetch Template & Elements
   ↓
2. Fetch Student Data (data-fetcher.ts)
   - Student info
   - Habit tracker with aggregates
   - Galeri kegiatan
   - School & pembina data
   ↓
3. Collect Image URLs from Elements
   ↓
4. Pre-download & Cache Images (image-handler.ts)
   - Download in parallel (5 concurrent)
   - Optimize (resize, compress)
   - Convert to base64
   - Cache for reuse
   ↓
5. Render PDF Document (builder-pdf-generator.tsx)
   - Sort elements by z-index
   - Render each element with data
   - Apply positioning and styling
   ↓
6. Generate PDF Blob
   ↓
7. Upload to Storage or Download
```

## Usage Examples

### Generate PDF Blob

```typescript
import { generateBuilderPDF } from '@/lib/rapor/builder-pdf-generator';
import { fetchRaporData } from '@/lib/rapor/data-fetcher';

// Fetch template and elements from database
const template = await fetchTemplate(templateId);
const elements = await fetchElements(templateId);

// Fetch student data
const data = await fetchRaporData(siswaId, {
  tahun_ajaran: '2024/2025',
  semester: 1,
});

// Generate PDF
const pdfBlob = await generateBuilderPDF(template, elements, data);

// Upload to Supabase Storage
const { data: uploadData } = await supabase.storage
  .from('rapor-pdfs')
  .upload(`rapor_${siswaId}_${Date.now()}.pdf`, pdfBlob);
```

### Download PDF in Browser

```typescript
import { downloadBuilderPDF } from '@/lib/rapor/builder-pdf-generator';

await downloadBuilderPDF(
  template,
  elements,
  data,
  `Rapor_${data.siswa.nama}_${periode.tahun_ajaran}.pdf`
);
```

### Validate Template

```typescript
import { validateTemplateForPDF } from '@/lib/rapor/builder-pdf-generator';

const validation = validateTemplateForPDF(template, elements);

if (!validation.valid) {
  console.error('Template validation errors:', validation.errors);
  // Handle errors
}
```

### Fetch Sample Data for Preview

```typescript
import { fetchSampleRaporData } from '@/lib/rapor/data-fetcher';

const sampleData = await fetchSampleRaporData({
  tahun_ajaran: '2024/2025',
  semester: 1,
});
```

## Coordinate System

### Canvas (Builder UI)
- Uses pixels as unit
- Origin (0, 0) at top-left
- Standard web coordinate system

### PDF Output
- Uses millimeters (mm) as unit
- Converted to points for React-PDF (1 point = 1/72 inch)
- Conversion: `pixels * 25.4 / 96 = mm`

### Page Sizes
- A4: 210mm × 297mm
- A5: 148mm × 210mm
- Letter: 215.9mm × 279.4mm
- F4: 210mm × 330mm

## Image Handling

### Optimization
- Max dimensions: 1200×1200 pixels
- Quality: 85%
- Format: JPEG (for photos)
- Timeout: 10 seconds per image

### Caching
- Images are pre-downloaded before PDF generation
- Converted to base64 for embedding
- Cached in memory during generation
- Reduces PDF generation time for multiple students

### Fallbacks
- Placeholder shown if image fails to load
- Gray background with "Gambar tidak tersedia" text
- PDF generation continues even if some images fail

## Data Binding

### Placeholder Format
- `{{source.field}}` - e.g., `{{siswa.nama}}`
- `{{source.nested.field}}` - e.g., `{{habit_tracker.ubudiyah.average}}`

### Available Data Sources
- `siswa.*` - Student information
- `habit_tracker.*` - Habit tracker data with aggregates
- `galeri_kegiatan` - Array of gallery items
- `school.*` - School information
- `pembina.*` - Pembina information
- `kepala_sekolah.*` - Principal information

### Habit Tracker Aggregates
Automatically calculated:
- `habit_tracker.ubudiyah.average` - Average score
- `habit_tracker.ubudiyah.percentage` - Percentage score
- `habit_tracker.ubudiyah.details` - Array of sub-indicators
- Similar for akhlaq, kedisiplinan, kebersihan
- `habit_tracker.overall_average` - Overall average
- `habit_tracker.overall_percentage` - Overall percentage

## Performance Considerations

### Image Pre-loading
- Downloads images in parallel (5 concurrent)
- Optimizes images before embedding
- Caches for reuse in batch generation

### Memory Management
- Images converted to base64 (increases size ~33%)
- Large templates may require more memory
- Consider batch size for bulk generation

### Generation Time
- Single PDF: ~2-5 seconds (depending on images)
- Bulk generation: Process in batches of 10
- Image download is the main bottleneck

## Error Handling

### Template Validation
- Checks for required elements
- Validates element positions within bounds
- Checks for duplicate IDs
- Validates page size and orientation

### Data Fetching
- Handles missing student data
- Returns empty aggregates if no habit tracker data
- Continues with empty arrays if no gallery data

### Image Loading
- Timeout after 10 seconds
- Shows placeholder on failure
- Logs errors but continues generation

### PDF Generation
- Catches and logs all errors
- Throws descriptive error messages
- Validates template before generation

## Testing

### Manual Testing Checklist
- [ ] Generate PDF with all element types
- [ ] Test with missing data (empty habit tracker)
- [ ] Test with missing images
- [ ] Test with different page sizes and orientations
- [ ] Test placeholder resolution
- [ ] Test data table with various data sources
- [ ] Test image gallery with different layouts
- [ ] Test signature blocks with and without dates
- [ ] Test line elements (solid, dashed, dotted)

### Performance Testing
- [ ] Generate PDF with 50+ elements
- [ ] Generate PDF with 10+ images
- [ ] Bulk generate 100+ PDFs
- [ ] Test with slow network (image downloads)

## Future Enhancements

1. **Multi-page Support**
   - Automatic page breaks for long content
   - Page numbers and headers/footers

2. **Advanced Elements**
   - Charts and graphs (bar, line, pie)
   - QR codes
   - Barcodes

3. **Conditional Rendering**
   - Show/hide elements based on data
   - If-else logic in templates

4. **Performance Optimization**
   - Worker threads for parallel generation
   - Image caching across sessions
   - Incremental rendering

5. **Enhanced Styling**
   - Gradients and shadows
   - Custom fonts
   - Advanced text formatting

## Troubleshooting

### PDF Generation Fails
- Check template validation errors
- Verify all required data is present
- Check browser console for errors
- Ensure images are accessible

### Images Not Showing
- Verify image URLs are correct
- Check CORS settings for external images
- Ensure Supabase storage is accessible
- Check image format is supported

### Incorrect Positioning
- Verify element positions in template
- Check page size and orientation
- Ensure margins are set correctly
- Test with different zoom levels

### Data Not Showing
- Verify placeholder syntax
- Check data binding configuration
- Ensure data is fetched correctly
- Test with sample data first

## Support

For issues or questions:
1. Check this documentation
2. Review console logs for errors
3. Test with sample data
4. Contact development team
