-- =====================================================
-- CHECK KPI MIGRATION STATUS
-- =====================================================

-- Check if KPI tables exist
SELECT 
  'jadwal_libur_musyrif_keasramaan' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'jadwal_libur_musyrif_keasramaan'
  ) as exists
UNION ALL
SELECT 
  'rapat_koordinasi_keasramaan',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rapat_koordinasi_keasramaan'
  )
UNION ALL
SELECT 
  'kehadiran_rapat_keasramaan',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'kehadiran_rapat_keasramaan'
  )
UNION ALL
SELECT 
  'log_kolaborasi_keasramaan',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'log_kolaborasi_keasramaan'
  )
UNION ALL
SELECT 
  'kpi_summary_keasramaan',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'kpi_summary_keasramaan'
  )
UNION ALL
SELECT 
  'kpi_detail_keasramaan',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'kpi_detail_keasramaan'
  );

-- If all return 'false', you need to run the migration:
-- File: supabase/migrations/20241210_kpi_system.sql
