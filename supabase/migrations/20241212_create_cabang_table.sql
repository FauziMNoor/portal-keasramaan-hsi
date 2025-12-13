-- =====================================================
-- CREATE CABANG TABLE
-- Created: 2024-12-12
-- =====================================================
-- Tabel ini mungkin sudah ada, jika error "already exists" abaikan saja

-- =====================================================
-- 1. Create Tabel Cabang
-- =====================================================
CREATE TABLE IF NOT EXISTS cabang_keasramaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_cabang TEXT NOT NULL UNIQUE,
    alamat TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. Insert Sample Data
-- =====================================================
INSERT INTO cabang_keasramaan (nama_cabang) 
VALUES ('Pusat')
ON CONFLICT (nama_cabang) DO NOTHING;

-- =====================================================
-- 3. Enable RLS
-- =====================================================
ALTER TABLE cabang_keasramaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS Policies
-- =====================================================
CREATE POLICY "Allow authenticated users to select cabang"
ON cabang_keasramaan
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert cabang"
ON cabang_keasramaan
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cabang"
ON cabang_keasramaan
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete cabang"
ON cabang_keasramaan
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- SELESAI
-- =====================================================
-- Cek data:
-- SELECT * FROM cabang_keasramaan;
