-- =====================================================
-- FIX RAPOR TABLES - RLS POLICIES
-- Created: 2024-12-13
-- Purpose: Enable RLS and add policies for rapor tables
-- =====================================================

-- Enable RLS on all rapor tables
ALTER TABLE rapor_kegiatan_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_dokumentasi_lainnya_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_rekap_habit_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_generate_log_keasramaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_catatan_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES FOR rapor_kegiatan_keasramaan
-- =====================================================

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read kegiatan"
ON rapor_kegiatan_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert kegiatan"
ON rapor_kegiatan_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update kegiatan"
ON rapor_kegiatan_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete kegiatan"
ON rapor_kegiatan_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- POLICIES FOR rapor_dokumentasi_lainnya_keasramaan
-- =====================================================

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete dokumentasi"
ON rapor_dokumentasi_lainnya_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- POLICIES FOR rapor_rekap_habit_keasramaan
-- =====================================================

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read rekap"
ON rapor_rekap_habit_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert rekap"
ON rapor_rekap_habit_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update rekap"
ON rapor_rekap_habit_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete rekap"
ON rapor_rekap_habit_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- POLICIES FOR rapor_generate_log_keasramaan
-- =====================================================

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read log"
ON rapor_generate_log_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert log"
ON rapor_generate_log_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update log"
ON rapor_generate_log_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete log"
ON rapor_generate_log_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- POLICIES FOR rapor_catatan_keasramaan
-- =====================================================

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read catatan"
ON rapor_catatan_keasramaan
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert catatan"
ON rapor_catatan_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update catatan"
ON rapor_catatan_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete catatan"
ON rapor_catatan_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- DONE
-- =====================================================
-- Run this script in Supabase SQL Editor to fix RLS policies
