# ⚡ QUICK FIX: KOP Template Tidak Muncul

## 🎯 Problem
KOP template yang sudah diupload tidak muncul di PDF saat download surat izin.

## ✅ Solusi Cepat (3 Langkah)

### 1️⃣ Jalankan SQL Fix
Buka **Supabase SQL Editor** → Copy paste → Run:
```sql
-- File: FIX_STORAGE_KOP_PUBLIC.sql
```

### 2️⃣ Cek & Fix URL
```sql
-- Cek URL yang tersimpan
SELECT cabang, kop_mode, kop_template_url 
FROM info_sekolah_keasramaan 
WHERE kop_mode = 'template';

-- Jika URL tidak ada atau salah, update:
UPDATE info_sekolah_keasramaan
SET kop_template_url = 'https://sirriyah.supabase.co/storage/v1/object/public/kop-templates-keasramaan/[nama-file-kamu].png'
WHERE cabang = 'Sukabumi';
```

**Format URL yang BENAR:**
```
https://[PROJECT].supabase.co/storage/v1/object/public/kop-templates-keasramaan/[filename]
```

### 3️⃣ Test URL di Browser
1. Copy URL dari database
2. Paste di browser baru
3. **Jika gambar muncul** → ✅ OK, coba download surat lagi
4. **Jika error 403/404** → ❌ Bucket belum public atau file tidak ada

## 🔍 Cek Console Browser

Saat download surat, buka Console (F12), cari log:

**✅ SUKSES:**
```
✅ KOP template loaded successfully!
```

**❌ ERROR:**
```
❌ Error loading KOP template: HTTP 403: Forbidden
⚠️ Falling back to dynamic KOP
```

## 🆘 Jika Masih Error

### Error: 403 Forbidden
**Penyebab:** Bucket tidak public
**Solusi:** Jalankan `FIX_STORAGE_KOP_PUBLIC.sql`

### Error: 404 Not Found
**Penyebab:** File tidak ada atau URL salah
**Solusi:** Re-upload file via menu Identitas Sekolah

### Error: CORS
**Penyebab:** CORS policy
**Solusi:** Set bucket public di SQL fix

## 📚 Dokumentasi Lengkap
- `TROUBLESHOOT_KOP_TEMPLATE.md` - Troubleshooting detail
- `FIX_STORAGE_KOP_PUBLIC.sql` - SQL fix lengkap

---
**Quick Fix** | **Update:** 2024
