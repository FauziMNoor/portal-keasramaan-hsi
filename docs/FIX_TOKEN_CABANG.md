# Fix Token Musyrif - Kolom Cabang

## Masalah
Tabel `token_musyrif_keasramaan` masih menggunakan kolom `lokasi` (lama), bukan `cabang` (baru).
Akibatnya:
- Kolom "Cabang" di halaman Kelola Link tidak muncul
- Link token musyrif menampilkan 0 siswa

## Solusi

### 1. Jalankan Migration SQL
Buka Supabase SQL Editor dan jalankan file: `MIGRATION_TOKEN_LOKASI_TO_CABANG.sql`

```sql
-- Step 1: Tambah kolom cabang baru
ALTER TABLE token_musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS cabang TEXT;

-- Step 2: Copy data dari lokasi ke cabang
UPDATE token_musyrif_keasramaan 
SET cabang = lokasi 
WHERE cabang IS NULL;

-- Step 3: Set cabang sebagai NOT NULL
ALTER TABLE token_musyrif_keasramaan 
ALTER COLUMN cabang SET NOT NULL;
```

### 2. Verifikasi
```sql
SELECT id, nama_musyrif, cabang, lokasi, kelas, asrama 
FROM token_musyrif_keasramaan 
LIMIT 10;
```

Pastikan kolom `cabang` sudah terisi dengan data yang sama dengan `lokasi`.

### 3. Refresh Halaman
Setelah migration, refresh halaman:
- `/habit-tracker/manage-link` - Kolom cabang akan muncul
- `/habit-tracker/form/[token]` - Siswa akan muncul dengan benar

## Backward Compatibility
Kode sudah di-update untuk support kedua kolom (`cabang` dan `lokasi`):
- Jika `cabang` ada, gunakan `cabang`
- Jika tidak, fallback ke `lokasi`
- Link token TIDAK BERUBAH (tetap aman untuk barcode)

## Files yang Diupdate
1. `app/habit-tracker/manage-link/page.tsx` - Display cabang dengan fallback
2. `app/habit-tracker/form/[token]/page.tsx` - Query siswa dengan fallback
3. `MIGRATION_TOKEN_LOKASI_TO_CABANG.sql` - SQL migration script

## Catatan Penting
⚠️ **JANGAN hapus kolom `lokasi` dulu** sampai yakin semua sudah berjalan dengan baik.
Kolom `lokasi` bisa dihapus nanti setelah semua stabil.
