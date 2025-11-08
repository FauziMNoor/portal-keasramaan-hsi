# Setup Guide - Template Builder Rapor

## Overview

Dokumen ini menjelaskan cara setup database untuk fitur Template Builder Rapor. Template Builder adalah sistem baru yang memungkinkan user membuat template rapor dengan drag-and-drop, mirip Google Slides.

## Prerequisites

Pastikan sudah menjalankan:
1. ✅ `SETUP_MANAJEMEN_RAPOR.sql` - Setup tabel rapor dasar
2. ✅ Database Supabase sudah aktif
3. ✅ Akses ke Supabase SQL Editor

## Migration Steps

### Step 1: Jalankan Migration Script

1. Buka Supabase Dashboard → SQL Editor
2. Buka file `supabase/SETUP_TEMPLATE_BUILDER.sql`
3. Copy seluruh isi file
4. Paste ke SQL Editor
5. Klik **Run** atau tekan `Ctrl+Enter`

### Step 2: Verifikasi Migration

Jalankan query berikut untuk memastikan semua tabel berhasil dibuat:

```sql
-- Check tabel baru
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%template%'
ORDER BY table_name;
```

Expected output:
- `rapor_template_assets_keasramaan`
- `rapor_template_elements_keasramaan`
- `rapor_template_keasramaan`
- `rapor_template_page_keasramaan`
- `rapor_template_versions_keasramaan`

### Step 3: Verifikasi Kolom Baru

```sql
-- Check kolom template_type dan canvas_config
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rapor_template_keasramaan'
AND column_name IN ('template_type', 'canvas_config');
```

Expected output:
- `template_type` | `character varying` | `'legacy'::character varying`
- `canvas_config` | `jsonb` | `NULL`

### Step 4: Verifikasi Existing Templates

```sql
-- Check bahwa existing templates sudah di-mark sebagai 'legacy'
SELECT id, nama_template, template_type, jenis_rapor
FROM rapor_template_keasramaan;
```

Semua template yang sudah ada harus memiliki `template_type = 'legacy'`.

## Database Schema Overview

### Modified Table: `rapor_template_keasramaan`

**New Columns:**
- `template_type` (VARCHAR): `'legacy'` atau `'builder'`
- `canvas_config` (JSONB): Konfigurasi canvas untuk builder templates

### New Table: `rapor_template_elements_keasramaan`

Menyimpan elemen-elemen dalam builder template (text, image, table, dll).

**Columns:**
- `id` (UUID): Primary key
- `template_id` (UUID): Reference ke template
- `element_type` (VARCHAR): Tipe elemen (header, text, data-table, image, image-gallery, signature, line)
- `position` (JSONB): Posisi di canvas `{x, y}`
- `size` (JSONB): Ukuran `{width, height}`
- `content` (JSONB): Konten spesifik per tipe
- `style` (JSONB): Styling (colors, fonts, borders)
- `data_binding` (JSONB): Data bindings (placeholders)
- `z_index` (INTEGER): Layer order
- `is_visible` (BOOLEAN): Visibility flag
- `is_locked` (BOOLEAN): Lock flag
- `created_at`, `updated_at` (TIMESTAMP)

### New Table: `rapor_template_versions_keasramaan`

Menyimpan version history untuk undo/redo dan restore.

**Columns:**
- `id` (UUID): Primary key
- `template_id` (UUID): Reference ke template
- `version_number` (INTEGER): Sequential version number
- `canvas_config` (JSONB): Snapshot canvas config
- `elements` (JSONB): Snapshot semua elements
- `notes` (TEXT): Optional notes
- `created_by` (VARCHAR): User yang save version
- `created_at` (TIMESTAMP)

### New Table: `rapor_template_assets_keasramaan`

Menyimpan assets (logo, images, backgrounds) yang diupload ke template.

**Columns:**
- `id` (UUID): Primary key
- `template_id` (UUID): Reference ke template
- `asset_type` (VARCHAR): Tipe asset (logo, background, image, icon)
- `file_name` (VARCHAR): Nama file
- `file_url` (TEXT): URL di Supabase Storage
- `file_size` (INTEGER): Ukuran file (bytes)
- `mime_type` (VARCHAR): MIME type
- `uploaded_by` (VARCHAR): User yang upload
- `uploaded_at` (TIMESTAMP)

## Indexes Created

Performance indexes untuk query optimization:

1. **rapor_template_elements_keasramaan:**
   - `idx_template_elements_template` - Query by template_id
   - `idx_template_elements_z_index` - Query by z_index (layer order)
   - `idx_template_elements_type` - Query by element_type

2. **rapor_template_versions_keasramaan:**
   - `idx_template_versions_template` - Query by template_id + version_number
   - `idx_template_versions_created` - Query by created_at

3. **rapor_template_assets_keasramaan:**
   - `idx_template_assets_template` - Query by template_id
   - `idx_template_assets_type` - Query by asset_type

4. **rapor_template_keasramaan:**
   - `idx_rapor_template_type` - Query by template_type

## RLS Policies

Semua tabel baru sudah dilengkapi dengan Row Level Security policies:
- ✅ Read access untuk semua users
- ✅ Insert/Update/Delete untuk authenticated users

## Backward Compatibility

✅ **Sistem lama (legacy) tetap berfungsi normal**

Migration ini tidak mengubah atau menghapus data existing. Semua template yang sudah ada akan tetap bekerja dengan sistem lama (legacy).

**How it works:**
1. Existing templates di-mark sebagai `template_type = 'legacy'`
2. PDF Generator akan detect tipe template
3. Legacy templates → gunakan renderer lama
4. Builder templates → gunakan renderer baru

## Next Steps

Setelah migration berhasil:

1. ✅ Lanjut ke Task 2: Install required dependencies
2. ✅ Lanjut ke Task 3: Create data models and TypeScript interfaces
3. ✅ Mulai develop Template Builder UI

## Troubleshooting

### Error: "relation already exists"

Jika ada error tabel sudah ada, skip error tersebut. Script menggunakan `IF NOT EXISTS` untuk safety.

### Error: "column already exists"

Jika kolom `template_type` atau `canvas_config` sudah ada, skip error tersebut. Script menggunakan `IF NOT EXISTS`.

### Rollback (jika diperlukan)

Jika perlu rollback migration:

```sql
-- HATI-HATI: Ini akan menghapus semua data builder templates!

-- Drop tabel baru
DROP TABLE IF EXISTS rapor_template_assets_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_template_versions_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_template_elements_keasramaan CASCADE;

-- Remove kolom baru
ALTER TABLE rapor_template_keasramaan 
  DROP COLUMN IF EXISTS template_type,
  DROP COLUMN IF EXISTS canvas_config;

-- Drop indexes
DROP INDEX IF EXISTS idx_rapor_template_type;
```

## Support

Jika ada masalah saat migration, check:
1. Supabase logs untuk error details
2. Pastikan user memiliki permission untuk CREATE TABLE
3. Pastikan database tidak dalam read-only mode

## Summary

✅ Migration menambahkan 3 tabel baru untuk Template Builder
✅ Modifikasi tabel existing dengan 2 kolom baru
✅ Backward compatible dengan sistem lama
✅ Semua indexes dan RLS policies sudah di-setup
✅ Ready untuk development Template Builder UI
