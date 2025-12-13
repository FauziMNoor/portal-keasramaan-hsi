-- =====================================================
-- Add drive_pdf_url column to rapor_generate_log_keasramaan
-- =====================================================
-- Purpose: Store Google Drive PDF URL in addition to Supabase Storage
-- Date: 2024-12-13

-- Add column for Google Drive PDF URL
ALTER TABLE rapor_generate_log_keasramaan 
ADD COLUMN IF NOT EXISTS drive_pdf_url TEXT;

-- Add comment
COMMENT ON COLUMN rapor_generate_log_keasramaan.drive_pdf_url 
IS 'Google Drive PDF view link (webViewLink)';

-- Update existing records to have null (they don't have Drive PDF yet)
-- No need to update, new column defaults to NULL

-- Note: 
-- - presentation_id now stores PDF file ID in Google Drive (not Slides)
-- - pdf_url stores path in Supabase Storage
-- - drive_pdf_url stores view link in Google Drive
