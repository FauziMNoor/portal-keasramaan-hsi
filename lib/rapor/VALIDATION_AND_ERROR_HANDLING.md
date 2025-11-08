# Validation and Error Handling for Template Builder

This document describes the validation and error handling system implemented for the Template Builder Rapor feature.

## Overview

The validation and error handling system ensures that:
1. **Elements are valid** before being saved or rendered
2. **Templates are complete** before PDF generation
3. **Errors are logged** for debugging and monitoring
4. **User-friendly messages** are displayed when issues occur

## Components

### 1. Element Validation (`element-validator.ts`)

Validates individual template elements to ensure they meet all requirements.

#### Features

- **Position Validation**: Ensures elements are within canvas bounds
- **Size Validation**: Checks that element dimensions are positive
- **Placeholder Validation**: Verifies data bindings reference valid fields
- **Element-Specific Validation**: Custom validation for each element type

#### Valid Placeholder Paths

```typescript
// Siswa data
siswa.nama, siswa.nis, siswa.kelas, siswa.asrama, siswa.cabang

// Habit tracker
habit_tracker.ubudiyah.average
habit_tracker.akhlaq.percentage
habit_tracker.overall_average

// School data
school.nama, school.logo_url, school.alamat

// Pembina & Kepala Sekolah
pembina.nama, kepala_sekolah.nama
```

#### Usage

```typescript
import { validateElement } from '@/lib/rapor/element-validator';

const result = validateElement(element, canvasDimensions);

if (!result.valid) {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

#### Validation Rules

**Header Element:**
- Title text is required
- Logo URL must be valid if logo is present
- Font size must be positive

**Text Element:**
- Text content should not be empty (warning)
- Font size must be positive
- Line height must be positive

**Data Table Element:**
- Must have valid data source
- Must have at least 1 column
- Column IDs must be unique
- Header and field names are required

**Image Element:**
- Image source URL is required
- Binding placeholders must be valid

**Image Gallery Element:**
- Data source must be 'galeri_kegiatan'
- Max images must be positive (1-50)
- Grid layout requires columns > 0

**Signature Element:**
- Label is required
- Font size must be positive

**Line Element:**
- Line width (thickness) must be positive

### 2. Template Validation (`template-validator.ts`)

Validates complete templates before saving or PDF generation.

#### Features

- **Element Count**: Ensures template has at least one element
- **Unique IDs**: Checks for duplicate element IDs
- **Z-Index Validation**: Verifies z-index values are valid integers
- **Template Config**: Validates page size, orientation, dimensions, margins
- **Overlap Detection**: Warns about overlapping elements
- **Size Warnings**: Alerts if template is too large (>100 elements)

#### Usage

```typescript
import { validateBeforeSave, validateBeforeGenerate } from '@/lib/rapor/template-validator';

// Before saving
const saveValidation = validateBeforeSave(template, elements);
if (saveValidation.valid) {
  // Save template
}

// Before PDF generation (stricter)
const generateValidation = validateBeforeGenerate(template, elements);
if (generateValidation.valid) {
  // Generate PDF
}
```

#### Validation Levels

**Before Save:**
- Basic template structure
- Element validity
- Configuration correctness

**Before Generate:**
- All "Before Save" checks
- At least one visible element
- Data binding presence check

### 3. React Hooks

#### `use-element-validation.ts`

Hooks for validating elements in the Template Builder UI.

```typescript
import { useElementValidation, useSelectedElementErrors } from '@/lib/hooks/use-element-validation';

// Validate specific element
const validation = useElementValidation(elementId);

// Get errors for selected element
const errors = useSelectedElementErrors();

// Get validation summary
const summary = useValidationSummary();
```

#### `use-template-validation.ts`

Hooks for validating the entire template.

```typescript
import { useTemplateValidation, useCanSaveTemplate } from '@/lib/hooks/use-template-validation';

// Validate template
const validation = useTemplateValidation();

// Check if can save
const canSave = useCanSaveTemplate();

// Check if can generate PDF
const canGenerate = useCanGeneratePDF();
```

### 4. Validation UI Components (`ValidationAlert.tsx`)

React components for displaying validation results.

#### Components

**ValidationAlert**
```tsx
<ValidationAlert 
  errors={errors} 
  warnings={warnings} 
/>
```

**ValidationBadge**
```tsx
<ValidationBadge 
  errorCount={5} 
  warningCount={2} 
/>
```

**ValidationSummary**
```tsx
<ValidationSummary
  totalElements={10}
  validElements={8}
  invalidElements={2}
  totalErrors={5}
  totalWarnings={3}
/>
```

### 5. PDF Generation Error Handling (`pdf-error-handler.ts`)

Handles errors during PDF generation with graceful fallbacks.

#### Error Types

```typescript
type PDFErrorType = 
  | 'MISSING_DATA'           // Data field not available
  | 'IMAGE_LOAD_FAILED'      // Image failed to load
  | 'RENDER_ERROR'           // Error rendering element
  | 'GENERATION_FAILED'      // PDF generation failed
  | 'UPLOAD_FAILED'          // Upload to storage failed
  | 'INVALID_BINDING'        // Invalid placeholder binding
  | 'DATA_FETCH_FAILED'      // Failed to fetch data
  | 'VALIDATION_FAILED';     // Template validation failed
```

#### Features

**Missing Data Handling:**
```typescript
const result = handleMissingDataWithError('siswa.nama', elementId);
// Returns: { value: '-', error: PDFError }
```

**Invalid Binding Handling:**
```typescript
const result = handleInvalidBinding('invalid.field', elementId);
// Returns: { value: '{{invalid.field}}', error: PDFError }
```

**Safe Data Resolution:**
```typescript
const result = safeResolveBinding('siswa.nama', data, elementId);
// Returns: { value: 'Ahmad', error?: PDFError }
```

**Error Collection:**
```typescript
const collector = new PDFErrorCollector();
collector.addError(error);
collector.addWarning(warning);

console.log(collector.getSummary()); // "2 error(s), 1 warning(s)"
```

**Error Logging:**
```typescript
await logPDFErrorToDatabase({
  template_id: 'uuid',
  siswa_nis: '12345',
  tahun_ajaran: '2024/2025',
  semester: '1',
  error_type: 'MISSING_DATA',
  error_message: 'Data siswa tidak tersedia',
  generated_by: 'user-uuid',
});
```

### 6. Enhanced PDF Generator

The PDF generator now includes error handling:

```typescript
const result = await generateBuilderPDF(
  template,
  elements,
  data,
  {
    onError: (error) => console.error('PDF Error:', error),
    onWarning: (warning) => console.warn('PDF Warning:', warning),
  }
);

// result = { blob: Blob, errors: [], warnings: [] }
```

## Database Schema

### Error Logging Table

```sql
CREATE TABLE rapor_generate_errors_keasramaan (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES rapor_templates_keasramaan(id),
  siswa_nis VARCHAR(50),
  tahun_ajaran VARCHAR(20),
  semester VARCHAR(10),
  error_type VARCHAR(50),
  error_message TEXT,
  error_details JSONB,
  generated_by UUID REFERENCES guru_keasramaan(id),
  created_at TIMESTAMPTZ
);
```

### Error Summary View

```sql
CREATE VIEW rapor_error_summary_keasramaan AS
SELECT 
  error_type,
  COUNT(*) as error_count,
  COUNT(DISTINCT template_id) as affected_templates,
  COUNT(DISTINCT siswa_nis) as affected_students,
  MAX(created_at) as last_occurrence
FROM rapor_generate_errors_keasramaan
GROUP BY error_type;
```

## Integration Guide

### In Properties Panel

```tsx
import { useElementValidation } from '@/lib/hooks/use-element-validation';
import { ValidationAlert } from '@/components/template-builder/ValidationAlert';

function PropertiesPanel() {
  const selectedElementId = useTemplateBuilderStore(state => state.selectedElementId);
  const validation = useElementValidation(selectedElementId);
  
  return (
    <div>
      {validation && (
        <ValidationAlert 
          errors={validation.errors}
          warnings={validation.warnings}
        />
      )}
      {/* Property editors */}
    </div>
  );
}
```

### Before Saving Template

```tsx
import { useCanSaveTemplate, useTemplateValidationErrors } from '@/lib/hooks/use-template-validation';
import { toast } from 'sonner';

function SaveButton() {
  const canSave = useCanSaveTemplate();
  const errors = useTemplateValidationErrors();
  
  const handleSave = async () => {
    if (!canSave) {
      toast.error(`Tidak dapat menyimpan: ${errors.length} error ditemukan`);
      return;
    }
    
    // Save template
    await saveTemplate();
    toast.success('Template berhasil disimpan');
  };
  
  return (
    <button onClick={handleSave} disabled={!canSave}>
      Simpan Template
    </button>
  );
}
```

### Before Generating PDF

```tsx
import { validateBeforeGenerate } from '@/lib/rapor/template-validator';
import { generateBuilderPDF } from '@/lib/rapor/builder-pdf-generator';
import { logPDFErrorsBatch } from '@/lib/rapor/pdf-error-handler';

async function generatePDF(template, elements, data, userId) {
  // Validate first
  const validation = validateBeforeGenerate(template, elements);
  
  if (!validation.valid) {
    toast.error('Template tidak valid untuk generate PDF');
    return;
  }
  
  try {
    // Generate with error handling
    const result = await generateBuilderPDF(template, elements, data, {
      onError: (error) => console.error('PDF Error:', error),
      onWarning: (warning) => console.warn('PDF Warning:', warning),
    });
    
    // Log errors if any
    if (result.errors.length > 0) {
      await logPDFErrorsBatch(result.errors, {
        template_id: template.id,
        siswa_nis: data.siswa.nis,
        tahun_ajaran: data.habit_tracker.periode.tahun_ajaran,
        semester: data.habit_tracker.periode.semester.toString(),
        generated_by: userId,
      });
    }
    
    // Show warnings to user
    if (result.warnings.length > 0) {
      toast.warning(`PDF generated dengan ${result.warnings.length} peringatan`);
    }
    
    return result.blob;
  } catch (error) {
    toast.error('Gagal generate PDF');
    throw error;
  }
}
```

## Best Practices

1. **Validate Early**: Validate elements as they're created/modified
2. **Show Feedback**: Display validation errors in the UI immediately
3. **Graceful Degradation**: Use placeholders for missing data instead of failing
4. **Log Errors**: Always log errors to database for debugging
5. **User-Friendly Messages**: Convert technical errors to readable messages
6. **Retry Logic**: Implement retry for transient failures (image loading)
7. **Monitor Errors**: Regularly check error summary view for patterns

## Error Recovery Strategies

### Missing Data
- Use placeholder text ("-" or "Data tidak tersedia")
- Continue PDF generation
- Log as warning

### Image Load Failure
- Retry up to 3 times with exponential backoff
- Use gray placeholder rectangle with text
- Log as warning

### Invalid Binding
- Keep placeholder visible in PDF ({{field.name}})
- Log as error
- Continue generation

### Validation Failure
- Block PDF generation
- Show detailed errors to user
- Require fixes before proceeding

## Monitoring

Query error summary:
```sql
SELECT * FROM rapor_error_summary_keasramaan;
```

Find templates with most errors:
```sql
SELECT 
  template_id,
  COUNT(*) as error_count
FROM rapor_generate_errors_keasramaan
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY template_id
ORDER BY error_count DESC
LIMIT 10;
```

## Maintenance

The system includes automatic cleanup:
- Errors older than 90 days are automatically deleted
- Run manually: `SELECT clean_old_pdf_errors_keasramaan();`

## Testing

Test validation:
```typescript
import { validateElement } from '@/lib/rapor/element-validator';

// Test with invalid element
const invalidElement = {
  id: 'test',
  type: 'text',
  position: { x: -10, y: 0 }, // Invalid: negative position
  size: { width: 0, height: 100 }, // Invalid: zero width
  // ...
};

const result = validateElement(invalidElement, { width: 800, height: 1200 });
expect(result.valid).toBe(false);
expect(result.errors.length).toBeGreaterThan(0);
```

## Troubleshooting

**Q: Validation passes but PDF generation fails**
- Check if data is actually available at runtime
- Verify image URLs are accessible
- Check browser console for detailed errors

**Q: Too many validation warnings**
- Review element positions and sizes
- Check for overlapping elements
- Verify placeholder paths are correct

**Q: Errors not being logged to database**
- Check Supabase connection
- Verify RLS policies allow insert
- Check user authentication

## Future Enhancements

- [ ] Real-time validation as user types
- [ ] Validation rule customization
- [ ] Error analytics dashboard
- [ ] Automated error reporting
- [ ] Validation presets/templates
