# 🔧 Troubleshooting Migration

## ❌ Error: relation "guru_keasramaan" does not exist

**Penyebab:** 
Migration SQL mencoba membuat RLS policy yang mereferensikan tabel `guru_keasramaan` yang tidak ada.

**Solusi:**
Gunakan file `MIGRATION_STEP_BY_STEP.sql` yang sudah diperbaiki, bukan `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql`.

```sql
-- Jalankan file ini:
MIGRATION_STEP_BY_STEP.sql
```

---

## ❌ Error: relation "info_sekolah_keasramaan" already exists

**Penyebab:** 
Tabel sudah pernah dibuat sebelumnya.

**Solusi 1 (Recommended):** Skip error dan lanjut
```sql
-- Abaikan error, lanjut ke step berikutnya
```

**Solusi 2:** Drop dan buat ulang
```sql
DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;
-- Lalu jalankan ulang dari STEP 2
```

---

## ❌ Error: column "bukti_formulir_url" already exists

**Penyebab:** 
Kolom sudah pernah ditambahkan sebelumnya.

**Solusi:**
```sql
-- Abaikan error, kolom sudah ada
-- Atau cek dengan query:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan' 
AND column_name LIKE 'bukti%';
```

---

## ❌ Error: policy "Allow authenticated users to read info sekolah" already exists

**Penyebab:** 
Policy sudah pernah dibuat sebelumnya.

**Solusi:**
```sql
-- Drop policy lama
DROP POLICY IF EXISTS "Allow authenticated users to read info sekolah" 
ON info_sekolah_keasramaan;

-- Buat ulang
CREATE POLICY "Allow authenticated users to read info sekolah"
ON info_sekolah_keasramaan
FOR SELECT
TO authenticated
USING (true);
```

---

## ❌ Error: bucket "bukti_formulir_keasramaan" does not exist

**Penyebab:** 
Storage bucket belum dibuat.

**Solusi:**
1. Buka Supabase Dashboard
2. Klik "Storage" di sidebar
3. Klik "Create a new bucket"
4. Nama: `bukti_formulir_keasramaan`
5. Public: **No** (Private)
6. Klik "Create bucket"

---

## ❌ Upload File Gagal: "Failed to upload file"

**Penyebab:** 
Storage policies belum disetup.

**Solusi:**
```sql
-- Buka Supabase Dashboard → Storage → bukti_formulir_keasramaan → Policies

-- Policy 1: Allow upload
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

-- Policy 2: Allow read
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bukti_formulir_keasramaan');
```

---

## ❌ Generate PDF Gagal: "Data info sekolah tidak ditemukan"

**Penyebab:** 
Data info sekolah belum diisi.

**Solusi:**
1. Akses halaman: `/settings/info-sekolah`
2. Isi semua field yang diperlukan
3. Klik "Simpan Perubahan"

Atau via SQL:
```sql
-- Cek data
SELECT * FROM info_sekolah_keasramaan WHERE cabang = 'Purworejo';

-- Jika kosong, insert manual
INSERT INTO info_sekolah_keasramaan (
    cabang, nama_sekolah, nama_singkat, alamat_lengkap, kota,
    no_telepon, email, nama_kepala_sekolah, nama_kepala_asrama
) VALUES (
    'Purworejo',
    'PONDOK PESANTREN SMA IT HSI IDN',
    'HSI BOARDING SCHOOL',
    'Jl. Alamat Lengkap No. 123',
    'Purworejo',
    '(0275) 123456',
    'info@sekolah.sch.id',
    'Dr. H. Ahmad Fauzi, M.Pd.',
    'Ustadz Muhammad Ridwan, S.Pd.I.'
);
```

---

## ❌ Preview Bukti Tidak Muncul

**Penyebab:** 
URL bukti tidak valid atau storage policies salah.

**Solusi:**
1. Cek URL di database:
```sql
SELECT id, nama_siswa, bukti_formulir_url 
FROM perizinan_kepulangan_keasramaan 
WHERE bukti_formulir_url IS NOT NULL;
```

2. Cek storage policies (lihat solusi di atas)

3. Cek CORS settings di Supabase:
   - Dashboard → Settings → API
   - Pastikan CORS enabled untuk domain Anda

---

## ❌ Error 403: Forbidden saat upload

**Penyebab:** 
User tidak authenticated atau RLS policy salah.

**Solusi:**
1. Pastikan user sudah login
2. Cek RLS policies:
```sql
-- Lihat policies yang ada
SELECT * FROM pg_policies 
WHERE tablename = 'info_sekolah_keasramaan';

-- Jika perlu, disable RLS sementara untuk testing
ALTER TABLE info_sekolah_keasramaan DISABLE ROW LEVEL SECURITY;

-- Setelah testing, enable kembali
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;
```

---

## ❌ File Upload Terlalu Lama

**Penyebab:** 
File terlalu besar atau koneksi lambat.

**Solusi:**
1. Compress image sebelum upload
2. Gunakan format JPG (lebih kecil dari PNG)
3. Resize image ke ukuran maksimal 1920x1080
4. Pastikan file < 5MB

---

## ❌ PDF Tidak Ter-download

**Penyebab:** 
Browser block download atau error di server.

**Solusi:**
1. Cek browser console (F12) untuk error
2. Cek network tab untuk response
3. Pastikan popup blocker tidak aktif
4. Coba browser lain

---

## 🔍 Verifikasi Migration Berhasil

Jalankan query ini untuk memastikan semuanya OK:

```sql
-- 1. Cek kolom baru
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan' 
AND column_name LIKE 'bukti%';
-- Harus ada 3 kolom: bukti_formulir_url, bukti_formulir_uploaded_at, bukti_formulir_uploaded_by

-- 2. Cek tabel info sekolah
SELECT * FROM info_sekolah_keasramaan;
-- Harus ada minimal 1 row

-- 3. Cek RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan';
-- Harus ada 4 policies: SELECT, INSERT, UPDATE, DELETE

-- 4. Cek storage bucket (via Dashboard)
-- Buka Storage → Harus ada bucket "bukti_formulir_keasramaan"

-- 5. Cek storage policies (via Dashboard)
-- Buka Storage → bukti_formulir_keasramaan → Policies
-- Harus ada minimal 2 policies: INSERT dan SELECT
```

---

## 🔄 Rollback Migration

Jika perlu rollback semua perubahan:

```sql
-- 1. Hapus kolom bukti formulir
ALTER TABLE perizinan_kepulangan_keasramaan
DROP COLUMN IF EXISTS bukti_formulir_url,
DROP COLUMN IF EXISTS bukti_formulir_uploaded_at,
DROP COLUMN IF EXISTS bukti_formulir_uploaded_by;

-- 2. Hapus tabel info sekolah
DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;

-- 3. Hapus function
DROP FUNCTION IF EXISTS update_info_sekolah_timestamp() CASCADE;

-- 4. Hapus storage bucket (via Dashboard)
-- Storage → bukti_formulir_keasramaan → Delete bucket
```

---

## 📞 Masih Ada Masalah?

1. Cek log error di browser console (F12)
2. Cek log error di Supabase Dashboard → Logs
3. Cek dokumentasi lengkap di `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md`
4. Hubungi tim development

---

## ✅ Checklist Troubleshooting

Sebelum report issue, pastikan sudah cek:

- [ ] Migration SQL sudah dijalankan semua
- [ ] Storage bucket sudah dibuat
- [ ] Storage policies sudah disetup
- [ ] RLS policies sudah aktif
- [ ] Info sekolah sudah diisi
- [ ] User sudah login
- [ ] Browser console tidak ada error
- [ ] Network tab menunjukkan request berhasil
- [ ] File yang diupload valid (type & size)

---

**Last Updated:** 2025-11-12
