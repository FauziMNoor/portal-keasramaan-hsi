-- =====================================================
-- FIX: Foreign Key Constraint untuk rapor_generate_history_keasramaan
-- =====================================================
-- Menambahkan ON DELETE CASCADE pada foreign key template_id
-- sehingga ketika template dihapus, history terkait juga ikut terhapus
-- =====================================================

-- Drop existing foreign key constraint
ALTER TABLE rapor_generate_history_keasramaan
DROP CONSTRAINT IF EXISTS rapor_generate_history_keasramaan_template_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE rapor_generate_history_keasramaan
ADD CONSTRAINT rapor_generate_history_keasramaan_template_id_fkey
FOREIGN KEY (template_id)
REFERENCES rapor_template_keasramaan(id)
ON DELETE CASCADE;

-- Verify the constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'rapor_generate_history_keasramaan'
  AND kcu.column_name = 'template_id';
