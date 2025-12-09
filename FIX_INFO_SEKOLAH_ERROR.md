# Fix Error: Info Sekolah - Permission Denied

## Error yang Terjadi
```
Insert error: {}
Error saving data: Error: Permission denied. Silakan jalankan FIX_RLS_INFO_SEKOLAH.sql di Supabase SQL Editor.
```

**Console Errors:**
- `406 Not Acceptable` - Format response tidak sesuai
- `401 Unauthorized` - RLS policy belum dijalankan

## Penyebab
1. RLS (Row Level Security) policy belum dikonfigurasi dengan benar
2. Tabel `info_sekolah_keasramaan` mungkin belum ada atau struktur tidak sesuai
3. Kolom KOP yang sudah dihapus dari frontend masih ada di database (jika ada)

## Solusi

### Langkah 1: Jalankan SQL Script
1. Buka **Supabase Dashboard**: https://sirriyah.smaithsi.sch.id
2. Login dengan kredensial admin
3. Klik menu **SQL Editor** di sidebar kiri
4. Buka file: `portal-keasramaan/supabase/FIX_RLS_INFO_SEKOLAH.sql`
5. Copy semua isi file tersebut
6. Paste ke SQL Editor
7. Klik tombol **Run** atau tekan `Ctrl+Enter`

### Langkah 2: Verifikasi
Setelah menjalankan script, cek hasil verifikasi:

**Expected Results:**
- ✅ 4 policies aktif:
  - `Allow public read info_sekolah` (SELECT, public)
  - `Allow authenticated insert info_sekolah` (INSERT, authenticated)
  - `Allow authenticated update info_sekolah` (UPDATE, authenticated)
  - `Allow authenticated delete info_sekolah` (DELETE, authenticated)

- ✅ Struktur tabel tanpa kolom KOP:
  - Tidak ada: `kop_mode`, `kop_template_url`, `kop_content_margin_*`
  - Ada: `logo_url`, `stempel_url`, `nama_sekolah`, dll.

- ✅ Data default untuk cabang Purworejo dan Sukabumi sudah ada

### Langkah 3: Test di Aplikasi
1. Refresh halaman: http://localhost:3000/identitas-sekolah
2. Isi form identitas sekolah
3. Klik **Simpan Data**
4. Seharusnya berhasil tanpa error

## Perubahan yang Dilakukan

### Frontend (Sudah Selesai)
- ✅ Hapus section "KOP Surat Dinamis" dari UI
- ✅ Hapus state: `kopTemplatePreview`, `kopTemplateInputRef`, `uploadingKopTemplate`
- ✅ Hapus functions: `handleKopTemplateSelect()`, `handleRemoveKopTemplate()`
- ✅ Hapus fields dari interface dan formData: `kop_mode`, `kop_template_url`, `kop_content_margin_*`
- ✅ Hapus unused imports: `FileText`, `ImageIcon`, `Settings`, `Zap`, `FileImage`, `Ruler`

### Backend (Perlu Dijalankan)
- ⏳ Jalankan `FIX_RLS_INFO_SEKOLAH.sql` di Supabase SQL Editor
- ⏳ Verifikasi RLS policies aktif
- ⏳ Verifikasi struktur tabel benar

## Masalah Data Duplikat

### Gejala
Setelah menyimpan data, muncul data baru padahal seharusnya update data yang sudah ada.

### Penyebab
Logic check existing data tidak bekerja karena RLS policy untuk SELECT tidak mengizinkan user melihat data yang sudah ada.

### Solusi
**Sudah diperbaiki** dengan menggunakan `upsert` instead of manual check + insert/update:

```typescript
// ❌ SEBELUM: Manual check
const { data: existing } = await supabase
  .from('info_sekolah_keasramaan')
  .select('id')
  .eq('cabang', userCabang)
  .maybeSingle();

if (existing) {
  // update
} else {
  // insert
}

// ✅ SESUDAH: Upsert otomatis
await supabase
  .from('info_sekolah_keasramaan')
  .upsert(dataToSave, {
    onConflict: 'cabang',
    ignoreDuplicates: false,
  });
```

### Cleanup Data Duplikat
Jika sudah terlanjur ada data duplikat, jalankan script:

1. Buka Supabase SQL Editor
2. Jalankan: `portal-keasramaan/supabase/CLEANUP_DUPLICATE_INFO_SEKOLAH.sql`
3. Script akan:
   - Cek berapa banyak duplikat per cabang
   - Hapus duplikat, simpan yang terbaru
   - Verifikasi hasil (setiap cabang hanya 1 row)

## Troubleshooting

### Jika Masih Error 401/406
1. **Cek apakah user sudah login:**
   - Buka Console browser (F12)
   - Cek Network tab, lihat request headers
   - Pastikan ada `Authorization: Bearer <token>`

2. **Cek RLS policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'info_sekolah_keasramaan';
   ```
   Harus ada 4 policies

3. **Cek struktur tabel:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'info_sekolah_keasramaan'
   ORDER BY ordinal_position;
   ```
   Tidak boleh ada kolom `kop_*`

4. **Clear cache dan restart dev server:**
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   ```

### Jika Masih Gagal
Jalankan script alternatif di SQL Editor:
```sql
-- Force drop dan recreate policies
ALTER TABLE info_sekolah_keasramaan DISABLE ROW LEVEL SECURITY;
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;

-- Kemudian jalankan FIX_RLS_INFO_SEKOLAH.sql lagi
```

## Catatan Penting
- Bucket `kop-templates-keasramaan` tidak lagi digunakan (bisa dihapus dari Supabase Storage jika mau)
- Fitur KOP Surat Dinamis sudah dihapus total dari aplikasi
- Halaman Identitas Sekolah sekarang lebih simple dan fokus pada data dasar
