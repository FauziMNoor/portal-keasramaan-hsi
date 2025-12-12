-- =====================================================
-- CHECK ALL TABLES IN DATABASE
-- =====================================================

-- 1. List all tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Search for tables with 'musyrif' in name
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name LIKE '%musyrif%'
ORDER BY table_schema, table_name;

-- 3. Search for tables with 'keasramaan' in name
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name LIKE '%keasramaan%'
ORDER BY table_schema, table_name;

-- 4. Check if KPI tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'jadwal_libur_musyrif_keasramaan' THEN '✅ Exists'
    WHEN table_name = 'rapat_koordinasi_keasramaan' THEN '✅ Exists'
    WHEN table_name = 'kpi_summary_keasramaan' THEN '✅ Exists'
    ELSE '❓ Other'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'jadwal_libur_musyrif_keasramaan',
    'rapat_koordinasi_keasramaan',
    'kehadiran_rapat_keasramaan',
    'log_kolaborasi_keasramaan',
    'kpi_summary_keasramaan',
    'kpi_detail_keasramaan'
  )
ORDER BY table_name;
