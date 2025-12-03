# 🔧 CARA FIX ERROR: Permission Denied (RLS)

## ❌ Error yang Muncul:

```
Error: Permission denied. Silakan jalankan FIX_RLS_INFO_SEKOLAH.sql di Supabase SQL Editor.

Code: 42501
Message: new row violates row-level security policy for table "info_sekolah_keasramaan"
```

---

## ✅ SOLUSI CEPAT (3 Langkah):

### 📍 Langkah 1: Buka Supabase Dashboard

1. Buka browser
2. Pergi ke: **https://app.supabase.com**
3. Login dengan akun Anda
4. Pilih project: **sirriyah** (atau nama project Anda)

### 📍 Langkah 2: Buka SQL Editor

1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik **"New Query"**

### 📍 Langkah 3: Copy Paste & Run Script

1. **Copy** script di bawah ini:

```sql
-- Drop policy lama
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to insert info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to update info sekolah" 
ON info_sekolah_keasramaan;

DROP POLICY IF EXISTS "Allow authenticated users to delete info sekolah" 
ON info_sekolah_keasramaan;

-- Buat policy baru yang benar
CREATE POLICY "Enable read access for authenticated users"
ON info_sekolah_keasramaan FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON info_sekolah_keasramaan FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON info_sekolah_keasramaan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON info_sekolah_keasramaan FOR DELETE TO authenticated USING (true);
```

2. **Paste** di SQL Editor
3. Klik tombol **"RUN"** (atau tekan Ctrl+Enter)
4. Tunggu sampai muncul **"Success"**

---

## 🎯 Setelah Menjalankan Script:

1. **Kembali ke aplikasi**
2. **Refresh browser** (tekan F5)
3. **Coba simpan data lagi**
4. **Harus berhasil!** ✅

---

## 📁 Alternatif: Gunakan File SQL

Jika lebih mudah, Anda bisa:

1. Buka file: **`QUICK_FIX_ALL_ERRORS.sql`**
2. Copy semua isinya
3. Paste di Supabase SQL Editor
4. Klik RUN

---

## 🔍 Cara Verifikasi Berhasil:

Setelah run script, cek dengan query ini:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;
```

**Harus muncul 4 policies:**
- Enable delete access for authenticated users (DELETE)
- Enable insert access for authenticated users (INSERT)
- Enable read access for authenticated users (SELECT)
- Enable update access for authenticated users (UPDATE)

Jika sudah ada 4 policies, berarti **BERHASIL!** ✅

---

## ❓ Masih Error?

### Jika masih muncul error yang sama:

1. **Logout dari aplikasi**
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Login lagi**
4. **Coba simpan data**

### Jika error berbeda:

1. Screenshot error message
2. Cek browser console (F12)
3. Report ke developer dengan screenshot

---

## 📞 Butuh Bantuan?

**File Dokumentasi:**
- `FIX_RLS_INFO_SEKOLAH.sql` - Script fix lengkap
- `QUICK_FIX_ALL_ERRORS.sql` - Quick fix semua error
- `TROUBLESHOOTING_RLS_ERROR.md` - Troubleshooting detail

**Kontak:**
- Developer: [Nama Developer]
- Email: [Email Support]

---

**Status:** ✅ Solusi Tersedia
**Waktu:** ~3 menit
**Kesulitan:** Mudah (Copy-Paste)
