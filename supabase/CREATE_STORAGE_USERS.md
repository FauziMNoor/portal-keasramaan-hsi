# 📦 Setup Storage untuk Foto Users

## Langkah-langkah di Supabase Dashboard:

### 1. Buat Storage Bucket

1. Buka Supabase Dashboard
2. Klik **Storage** di sidebar kiri
3. Klik **"New bucket"**
4. Isi form:
   - **Name**: `user-photos`
   - **Public bucket**: ✅ **CENTANG** (agar foto bisa diakses publik)
   - **File size limit**: 2 MB (optional)
   - **Allowed MIME types**: `image/*` (optional)
5. Klik **"Create bucket"**

### 2. Setup RLS Policies (WAJIB!)

⚠️ **PENTING**: Tanpa policies akan error "row-level security policy"

**Cara setup:**
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy semua isi file **`CREATE_STORAGE_POLICIES.sql`**
3. Paste di SQL Editor
4. Klik **Run** atau tekan Ctrl+Enter
5. Tunggu sampai success ✅

**File SQL**: `supabase/CREATE_STORAGE_POLICIES.sql`

Policies yang akan dibuat:
- ✅ Public Read (semua bisa lihat)
- ✅ Authenticated Upload (user login bisa upload)
- ✅ Authenticated Update (user login bisa update)
- ✅ Authenticated Delete (user login bisa delete)

### 3. Verifikasi

1. Klik bucket **user-photos**
2. Coba upload file test
3. Jika berhasil, bucket sudah siap! ✅

---

**Status**: ⚠️ Perlu dibuat di Supabase Dashboard
**Bucket Name**: `user-photos`
**Public**: ✅ Yes
