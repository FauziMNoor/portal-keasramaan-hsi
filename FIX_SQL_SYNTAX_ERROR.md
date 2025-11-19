# 🔧 FIX: SQL SYNTAX ERROR - ALTER TABLE

## ❌ ERROR YANG TERJADI

```
ERROR: 42601: syntax error at or near "(" LINE 9: 
ALTER TABLE perizinan_kepulangan_keasramaan ADD COLUMN IF NOT EXISTS ( ^
```

---

## 🔍 PENYEBAB ERROR

Syntax SQL untuk `ALTER TABLE` dengan multiple columns **tidak boleh** menggunakan kurung buka langsung:

### ❌ SALAH (Syntax Lama)
```sql
ALTER TABLE perizinan_kepulangan_keasramaan ADD COLUMN IF NOT EXISTS (
    status_kepulangan TEXT DEFAULT 'belum_pulang',
    tanggal_kembali DATE,
    dikonfirmasi_oleh TEXT,
    dikonfirmasi_at TIMESTAMP,
    catatan_kembali TEXT
);
```

**Masalah**: PostgreSQL tidak mendukung syntax ini untuk multiple columns dalam satu statement.

---

## ✅ SOLUSI

Setiap kolom harus ditambahkan dengan statement `ALTER TABLE` terpisah:

### ✅ BENAR (Syntax Baru)
```sql
ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS status_kepulangan TEXT DEFAULT 'belum_pulang';

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS tanggal_kembali DATE;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dikonfirmasi_oleh TEXT;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS dikonfirmasi_at TIMESTAMP;

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS catatan_kembali TEXT;
```

---

## 📋 FILE YANG SUDAH DIPERBAIKI

### File Lama (Ada Error)
```
MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql
```

### File Baru (Sudah Diperbaiki)
```
MIGRATION_PERPANJANGAN_DAN_KONFIRMASI_FIXED.sql
```

---

## 🚀 CARA MENGGUNAKAN FILE YANG SUDAH DIPERBAIKI

### Step 1: Gunakan File FIXED
```
Buka: MIGRATION_PERPANJANGAN_DAN_KONFIRMASI_FIXED.sql
```

### Step 2: Copy-Paste ke Supabase SQL Editor
```
1. Buka Supabase Dashboard
2. Klik "SQL Editor"
3. Klik "New Query"
4. Copy-paste isi file FIXED
5. Klik "Run"
```

### Step 3: Verifikasi Berhasil
```sql
-- Jalankan query ini untuk verifikasi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan'
ORDER BY ordinal_position;
```

**Expected**: Kolom baru sudah ada:
- ✅ status_kepulangan
- ✅ tanggal_kembali
- ✅ dikonfirmasi_oleh
- ✅ dikonfirmasi_at
- ✅ catatan_kembali
- ✅ is_perpanjangan
- ✅ perizinan_induk_id
- ✅ alasan_perpanjangan
- ✅ jumlah_perpanjangan_hari
- ✅ perpanjangan_ke
- ✅ dokumen_pendukung_url
- ✅ dokumen_pendukung_uploaded_at
- ✅ dokumen_pendukung_uploaded_by
- ✅ dokumen_pendukung_tipe

---

## 📚 REFERENSI SYNTAX

### Menambah 1 Kolom
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name DATA_TYPE;
```

### Menambah Multiple Kolom (Cara Benar)
```sql
-- Cara 1: Separate statements (RECOMMENDED)
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS col1 TYPE1;
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS col2 TYPE2;
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS col3 TYPE3;

-- Cara 2: Menggunakan CREATE TABLE AS (untuk tabel baru)
CREATE TABLE new_table AS
SELECT 
    *,
    NULL::TYPE1 as col1,
    NULL::TYPE2 as col2,
    NULL::TYPE3 as col3
FROM old_table;
```

---

## 🎯 BEST PRACTICES

### ✅ DO
```sql
-- Gunakan separate ALTER TABLE statements
ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS status_kepulangan TEXT DEFAULT 'belum_pulang';

ALTER TABLE perizinan_kepulangan_keasramaan 
ADD COLUMN IF NOT EXISTS tanggal_kembali DATE;
```

### ❌ DON'T
```sql
-- Jangan gunakan kurung buka untuk multiple columns
ALTER TABLE perizinan_kepulangan_keasramaan ADD COLUMN IF NOT EXISTS (
    status_kepulangan TEXT DEFAULT 'belum_pulang',
    tanggal_kembali DATE
);
```

---

## 🔧 TROUBLESHOOTING

### Error: "column already exists"
**Solusi**: Kolom sudah ada, skip atau gunakan `IF NOT EXISTS`

### Error: "syntax error at or near"
**Solusi**: Cek syntax SQL, pastikan tidak ada kurung buka untuk multiple columns

### Error: "foreign key constraint"
**Solusi**: Pastikan tabel referensi sudah ada sebelum membuat FK

---

## 📝 SUMMARY

| Aspek | Detail |
|-------|--------|
| **Error** | Syntax error at or near "(" |
| **Penyebab** | Multiple columns dalam satu ALTER TABLE statement |
| **Solusi** | Gunakan separate ALTER TABLE untuk setiap kolom |
| **File Diperbaiki** | MIGRATION_PERPANJANGAN_DAN_KONFIRMASI_FIXED.sql |
| **Status** | ✅ FIXED |

---

## ✅ NEXT STEPS

1. Gunakan file: `MIGRATION_PERPANJANGAN_DAN_KONFIRMASI_FIXED.sql`
2. Copy-paste ke Supabase SQL Editor
3. Jalankan semua query
4. Verifikasi kolom baru sudah ada
5. Lanjutkan implementasi

---

**Version**: 1.0.0  
**Date**: November 2025  
**Status**: FIXED ✅
