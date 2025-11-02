-- =====================================================
-- UPDATE TOKEN CATATAN PERILAKU - ADD AUTHENTICATION
-- =====================================================

-- 1. Rename column 'nama_pemberi' to 'nama_token'
ALTER TABLE token_catatan_perilaku_keasramaan 
RENAME COLUMN nama_pemberi TO nama_token;

-- 2. Add require_auth column (default true for security)
ALTER TABLE token_catatan_perilaku_keasramaan 
ADD COLUMN IF NOT EXISTS require_auth BOOLEAN DEFAULT true;

-- 3. Add description column for token
ALTER TABLE token_catatan_perilaku_keasramaan 
ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- 4. Update existing tokens to have require_auth = true
UPDATE token_catatan_perilaku_keasramaan 
SET require_auth = true 
WHERE require_auth IS NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN token_catatan_perilaku_keasramaan.nama_token IS 'Nama/label untuk token ini (bukan nama user)';
COMMENT ON COLUMN token_catatan_perilaku_keasramaan.require_auth IS 'Apakah token ini memerlukan autentikasi user';
COMMENT ON COLUMN token_catatan_perilaku_keasramaan.deskripsi IS 'Deskripsi penggunaan token';

-- =====================================================
-- NOTES
-- =====================================================
-- Setelah update ini:
-- 1. 'nama_token' = Label/nama untuk token (misal: "Token Musyrif Asrama A")
-- 2. 'dicatat_oleh' di catatan_perilaku_keasramaan = Nama user yang login dan input
-- 3. 'require_auth' = true berarti user harus login dulu sebelum bisa input
