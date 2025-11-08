-- Migration: Add PDF Generation Error Logging Table
-- Description: Creates table for logging PDF generation errors for debugging and monitoring
-- Date: 2024

-- Create rapor_generate_errors_keasramaan table
CREATE TABLE IF NOT EXISTS rapor_generate_errors_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES rapor_template_keasramaan(id) ON DELETE CASCADE,
  siswa_nis VARCHAR(50),
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  error_type VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  generated_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rapor_generate_errors_keasramaan_template 
  ON rapor_generate_errors_keasramaan(template_id);

CREATE INDEX IF NOT EXISTS idx_rapor_generate_errors_keasramaan_siswa 
  ON rapor_generate_errors_keasramaan(siswa_nis);

CREATE INDEX IF NOT EXISTS idx_rapor_generate_errors_keasramaan_periode 
  ON rapor_generate_errors_keasramaan(tahun_ajaran, semester);

CREATE INDEX IF NOT EXISTS idx_rapor_generate_errors_keasramaan_type 
  ON rapor_generate_errors_keasramaan(error_type);

CREATE INDEX IF NOT EXISTS idx_rapor_generate_errors_keasramaan_created 
  ON rapor_generate_errors_keasramaan(created_at DESC);

-- Add comment to table
COMMENT ON TABLE rapor_generate_errors_keasramaan IS 'Logs errors that occur during PDF generation for debugging and monitoring';

-- Add comments to columns
COMMENT ON COLUMN rapor_generate_errors_keasramaan.error_type IS 'Type of error: MISSING_DATA, IMAGE_LOAD_FAILED, RENDER_ERROR, GENERATION_FAILED, UPLOAD_FAILED, INVALID_BINDING, DATA_FETCH_FAILED, VALIDATION_FAILED';
COMMENT ON COLUMN rapor_generate_errors_keasramaan.error_details IS 'Additional error details in JSON format (element ID, field name, stack trace, etc.)';

-- Enable RLS
ALTER TABLE rapor_generate_errors_keasramaan ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view all error logs (for monitoring and debugging)
CREATE POLICY "Users can view error logs"
  ON rapor_generate_errors_keasramaan
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert error logs
CREATE POLICY "Users can insert error logs"
  ON rapor_generate_errors_keasramaan
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT ON rapor_generate_errors_keasramaan TO authenticated;

-- Create view for error summary
CREATE OR REPLACE VIEW rapor_error_summary_keasramaan AS
SELECT 
  error_type,
  COUNT(*) as error_count,
  COUNT(DISTINCT template_id) as affected_templates,
  COUNT(DISTINCT siswa_nis) as affected_students,
  MAX(created_at) as last_occurrence
FROM rapor_generate_errors_keasramaan
GROUP BY error_type
ORDER BY error_count DESC;

-- Grant access to view
GRANT SELECT ON rapor_error_summary_keasramaan TO authenticated;

-- Create function to clean old error logs (older than 90 days)
CREATE OR REPLACE FUNCTION clean_old_pdf_errors_keasramaan()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rapor_generate_errors_keasramaan
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job to clean old errors (if pg_cron is available)
-- Note: This requires pg_cron extension
-- SELECT cron.schedule('clean-pdf-errors', '0 2 * * 0', 'SELECT clean_old_pdf_errors_keasramaan()');

COMMENT ON FUNCTION clean_old_pdf_errors_keasramaan() IS 'Deletes PDF error logs older than 90 days';
