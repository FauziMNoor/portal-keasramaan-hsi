# 🔄 UPDATE CATATAN PERILAKU V2

## 📋 Perubahan Struktur

### Sebelum (V1)
- Kategori terpisah: `kategori_pelanggaran` dan `kategori_kebaikan`
- Setiap kategori punya nama dan poin fixed
- User hanya pilih kategori, poin otomatis

### Sesudah (V2)
- Kategori umum: `kategori_perilaku` (untuk pelanggaran & kebaikan)
- User pilih kategori, lalu **ketik sendiri** nama pelanggaran/kebaikan
- **Pelanggaran:** Pilih level dampak (Ringan/Sedang/Berat) → poin otomatis
- **Kebaikan:** Input poin manual

---

## 🗄️ Perubahan Database

### Tabel Baru

#### 1. `kategori_perilaku_keasramaan`
Kategori umum untuk pelanggaran & kebaikan:
```sql
- id (UUID)
- nama_kategori (VARCHAR) - Misal: Kedisiplinan, Kebersihan, Adab, Ibadah
- deskripsi (TEXT)
- status (VARCHAR)
```

**Data Default (10 kategori):**
1. Kedisiplinan
2. Kebersihan
3. Adab & Akhlak
4. Ibadah
5. Tanggung Jawab
6. Akademik
7. Sosial
8. Kesehatan
9. Kreativitas
10. Kepemimpinan

#### 2. `level_dampak_keasramaan`
Level dampak untuk pelanggaran:
```sql
- id (UUID)
- nama_level (VARCHAR) - Misal: Ringan, Sedang, Berat
- poin (INTEGER) - Misal: -5, -15, -30
- deskripsi (TEXT)
- urutan (INTEGER)
- status (VARCHAR)
```

**Data Default (3 level):**
1. Ringan: -5 poin
2. Sedang: -15 poin
3. Berat: -30 poin

### Tabel Diupdate

#### `catatan_perilaku_keasramaan`
Kolom baru:
```sql
- nama_pelanggaran_kebaikan (TEXT) - User ketik sendiri
- level_dampak (VARCHAR) - Nama level (Ringan/Sedang/Berat)
- level_dampak_id (UUID) - FK ke level_dampak_keasramaan
```

Kolom direname:
```sql
- kategori_id → kategori_perilaku_id
```

### Tabel Dihapus
- ❌ `kategori_pelanggaran_keasramaan` (diganti kategori_perilaku)
- ❌ `kategori_kebaikan_keasramaan` (diganti kategori_perilaku)

---

## 🎯 Flow Input Baru

### Pelanggaran
```
1. Pilih Santri
2. Pilih Kategori (Kedisiplinan, Kebersihan, dll)
3. Ketik Nama Pelanggaran (misal: "Terlambat Shalat Subuh")
4. Pilih Level Dampak (Ringan/Sedang/Berat)
   → Poin otomatis sesuai level
5. Tambah Deskripsi (optional)
6. Simpan
```

**Contoh:**
- Kategori: Kedisiplinan
- Nama Pelanggaran: Terlambat Shalat Subuh
- Level Dampak: Ringan (-5 poin)
- Deskripsi: Terlambat 10 menit

### Kebaikan
```
1. Pilih Santri
2. Pilih Kategori (Ibadah, Akademik, dll)
3. Ketik Nama Kebaikan (misal: "Menjadi Imam Shalat Maghrib")
4. Input Poin (misal: 10)
5. Tambah Deskripsi (optional)
6. Simpan
```

**Contoh:**
- Kategori: Ibadah
- Nama Kebaikan: Menjadi Imam Shalat Maghrib
- Poin: +10
- Deskripsi: Suara adzan bagus

---

## 📁 File yang Diubah/Dibuat

### Database
- ✅ `supabase/UPDATE_CATATAN_PERILAKU_V2.sql` - Script update database

### Pages
- ✅ `app/catatan-perilaku/kategori/page.tsx` - Kelola kategori & level dampak (REWRITE)
- ✅ `app/catatan-perilaku/input/page.tsx` - Input catatan (REWRITE)
- 📦 `app/catatan-perilaku/input/page-old.tsx` - Backup file lama

### Dokumentasi
- ✅ `UPDATE_CATATAN_PERILAKU_V2.md` - File ini

---

## 🚀 Cara Update

### Step 1: Backup Data (PENTING!)
```sql
-- Backup data catatan lama (jika ada)
CREATE TABLE catatan_perilaku_backup AS 
SELECT * FROM catatan_perilaku_keasramaan;

-- Backup kategori lama (jika ada)
CREATE TABLE kategori_pelanggaran_backup AS 
SELECT * FROM kategori_pelanggaran_keasramaan;

CREATE TABLE kategori_kebaikan_backup AS 
SELECT * FROM kategori_kebaikan_keasramaan;
```

### Step 2: Jalankan Update SQL
```bash
1. Buka Supabase Dashboard > SQL Editor
2. Copy isi file: supabase/UPDATE_CATATAN_PERILAKU_V2.sql
3. Paste dan klik Run
4. Tunggu sampai selesai (✅ Success)
```

### Step 3: Verifikasi
```bash
1. Cek tabel baru:
   - kategori_perilaku_keasramaan (10 data)
   - level_dampak_keasramaan (3 data)

2. Cek tabel lama sudah dihapus:
   - kategori_pelanggaran_keasramaan (DELETED)
   - kategori_kebaikan_keasramaan (DELETED)

3. Cek kolom baru di catatan_perilaku_keasramaan:
   - nama_pelanggaran_kebaikan
   - level_dampak
   - level_dampak_id
   - kategori_perilaku_id (renamed from kategori_id)
```

### Step 4: Test Aplikasi
```bash
1. Refresh browser (Ctrl+F5)
2. Buka "Kelola Kategori & Level"
   - Tab Kategori: Tampil 10 kategori
   - Tab Level Dampak: Tampil 3 level
3. Buka "Input Catatan"
   - Test input pelanggaran (dengan level dampak)
   - Test input kebaikan (dengan poin manual)
```

---

## 🎨 UI/UX Changes

### Halaman Kelola Kategori
**Sebelum:**
- 2 Tab: Pelanggaran & Kebaikan
- Setiap kategori punya poin

**Sesudah:**
- 2 Tab: Kategori Perilaku & Level Dampak
- Kategori tidak punya poin (umum)
- Level dampak punya poin (khusus pelanggaran)

### Halaman Input Catatan
**Sebelum:**
- Pilih kategori → Poin otomatis

**Sesudah:**
- Pilih kategori (umum)
- Ketik nama pelanggaran/kebaikan (manual input)
- **Pelanggaran:** Pilih level dampak → Poin otomatis
- **Kebaikan:** Input poin manual

---

## ✅ Keuntungan V2

### 1. Lebih Fleksibel
- User bisa ketik nama pelanggaran/kebaikan sesuai kasus
- Tidak terbatas pada kategori preset
- Kategori bisa digunakan berkali-kali

### 2. Lebih Terstruktur
- Kategori umum (Kedisiplinan, Kebersihan, dll)
- Level dampak terpisah (Ringan, Sedang, Berat)
- Poin konsisten per level

### 3. Lebih Mudah Dikelola
- Admin hanya kelola 10 kategori umum
- Admin hanya kelola 3 level dampak
- Tidak perlu buat puluhan kategori spesifik

### 4. Lebih Informatif
- Nama pelanggaran/kebaikan lebih spesifik
- Level dampak jelas (Ringan/Sedang/Berat)
- Deskripsi tambahan untuk detail

---

## 📊 Contoh Data

### Pelanggaran
| Kategori | Nama Pelanggaran | Level | Poin |
|----------|------------------|-------|------|
| Kedisiplinan | Terlambat Shalat Subuh | Ringan | -5 |
| Kedisiplinan | Tidak Mengikuti Shalat Berjamaah | Sedang | -15 |
| Adab & Akhlak | Berkelahi dengan Teman | Berat | -30 |
| Kebersihan | Kamar Kotor | Ringan | -5 |

### Kebaikan
| Kategori | Nama Kebaikan | Poin |
|----------|---------------|------|
| Ibadah | Menjadi Imam Shalat Maghrib | +10 |
| Ibadah | Adzan Subuh | +5 |
| Akademik | Juara Lomba Matematika | +20 |
| Sosial | Membantu Teman Belajar | +5 |

---

## 🔄 Migration Data Lama (Optional)

Jika ada data lama yang perlu dimigrate:

```sql
-- Migrate data pelanggaran lama
UPDATE catatan_perilaku_keasramaan
SET 
  nama_pelanggaran_kebaikan = nama_kategori,
  level_dampak = CASE 
    WHEN poin >= -10 THEN 'Ringan'
    WHEN poin >= -20 THEN 'Sedang'
    ELSE 'Berat'
  END,
  level_dampak_id = (
    SELECT id FROM level_dampak_keasramaan 
    WHERE nama_level = CASE 
      WHEN poin >= -10 THEN 'Ringan'
      WHEN poin >= -20 THEN 'Sedang'
      ELSE 'Berat'
    END
  )
WHERE tipe = 'pelanggaran';

-- Migrate data kebaikan lama
UPDATE catatan_perilaku_keasramaan
SET nama_pelanggaran_kebaikan = nama_kategori
WHERE tipe = 'kebaikan';
```

---

## ⚠️ Breaking Changes

### API Changes
- Field `kategori_id` → `kategori_perilaku_id`
- Field baru: `nama_pelanggaran_kebaikan` (required)
- Field baru: `level_dampak` (untuk pelanggaran)
- Field baru: `level_dampak_id` (untuk pelanggaran)

### Tabel Dihapus
- `kategori_pelanggaran_keasramaan`
- `kategori_kebaikan_keasramaan`

### Halaman yang Perlu Update
- ✅ Input Catatan (DONE)
- ✅ Kelola Kategori (DONE)
- ⏳ Riwayat Catatan (perlu update tampilan)
- ⏳ Dashboard Rekap (perlu update tampilan)
- ⏳ Form via Token (perlu update)

---

## 📝 TODO Next

- [ ] Update halaman Riwayat (tampilkan nama_pelanggaran_kebaikan)
- [ ] Update halaman Dashboard (tampilkan nama_pelanggaran_kebaikan)
- [ ] Update Form via Token (struktur baru)
- [ ] Update halaman Manage Link Token (jika perlu)
- [ ] Testing lengkap semua fitur
- [ ] Update dokumentasi user

---

## 🎉 Status

**V2 READY!** ✅

Database dan halaman utama sudah diupdate. Tinggal update halaman lainnya untuk konsistensi.

---

**Updated by:** Kiro AI Assistant  
**Date:** 2 November 2025  
**Version:** 2.0.0
