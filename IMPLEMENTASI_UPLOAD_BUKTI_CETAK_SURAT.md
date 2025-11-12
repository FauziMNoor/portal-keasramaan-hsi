# 🎯 IMPLEMENTASI: Upload Bukti & Cetak Surat Izin Kepulangan

## ✅ Status: SIAP DEPLOY

---

## 📋 Ringkasan Fitur

### 1. Upload Bukti Formulir (Kepala Asrama)
- Kepala Asrama wajib upload screenshot/foto formulir saat approval
- Validasi file: JPG, PNG, PDF (max 5MB)
- Preview image sebelum upload
- File tersimpan di Supabase Storage

### 2. Verifikasi Berkas (Kepala Sekolah)
- Kepala Sekolah dapat melihat bukti yang diupload
- Preview image dengan zoom
- Download bukti original
- Approve/reject setelah verifikasi

### 3. Cetak Surat Izin
- Generate PDF surat izin otomatis
- Kop surat dengan data sekolah lengkap
- Format resmi dengan TTD
- Download langsung setelah approved

---

## 🗄️ Database Migration

### File: `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql`

**Langkah-langkah:**

1. **Buka Supabase Dashboard** → SQL Editor

2. **Jalankan Migration SQL:**
   ```sql
   -- Copy paste isi file MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql
   ```

3. **Buat Storage Bucket:**
   - Buka Storage → Create bucket
   - Nama: `bukti_formulir_keasramaan`
   - Public: No (Private)
   - Allowed MIME types: image/jpeg, image/png, application/pdf
   - Max file size: 5MB

4. **Setup Storage Policy:**
   ```sql
   -- Policy untuk upload (authenticated users)
   CREATE POLICY "Allow authenticated users to upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

   -- Policy untuk read (authenticated users)
   CREATE POLICY "Allow authenticated users to read"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'bukti_formulir_keasramaan');
   ```

5. **Update Data Info Sekolah:**
   - Akses halaman: `/settings/info-sekolah`
   - Isi data lengkap sekolah
   - Atau via SQL:
   ```sql
   UPDATE info_sekolah_keasramaan
   SET 
     alamat_lengkap = 'Jl. Alamat Sebenarnya No. 123',
     no_telepon = '(0275) 123456',
     email = 'info@hsiboardingschool.sch.id',
     nama_kepala_sekolah = 'Dr. H. Ahmad Fauzi, M.Pd.',
     nama_kepala_asrama = 'Ustadz Muhammad Ridwan, S.Pd.I.'
   WHERE cabang = 'Purworejo';
   ```

---

## 📁 File yang Dibuat/Dimodifikasi

### API Routes (Baru)
1. `app/api/perizinan/upload-bukti/route.ts` - Upload bukti formulir
2. `app/api/info-sekolah/route.ts` - Get info sekolah
3. `app/api/perizinan/generate-surat/route.ts` - Generate PDF surat

### Pages (Dimodifikasi)
1. `app/perizinan/kepulangan/approval/page.tsx` - Tambah upload & preview

### Pages (Baru)
1. `app/settings/info-sekolah/page.tsx` - Manage info sekolah

### Dokumentasi
1. `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql` - SQL migration
2. `FITUR_UPLOAD_BUKTI_CETAK_SURAT.md` - Dokumentasi fitur
3. `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md` - Panduan implementasi (file ini)

---

## 🔄 Alur Lengkap

### Skenario 1: Kepala Asrama Approve dengan Upload Bukti

```
1. Login sebagai Kepala Asrama
2. Buka menu "Perizinan" → "Approval"
3. Lihat perizinan dengan status "Menunggu Kepas"
4. Klik tombol "Setujui" (✓)
5. Modal muncul dengan form upload
6. Klik area upload atau drag & drop file
7. Preview muncul (untuk image)
8. Isi catatan (opsional)
9. Klik "Setujui & Upload"
10. Loading... upload file
11. Status berubah: "Menunggu Kepsek"
12. Notifikasi: "✅ Perizinan berhasil disetujui"
```

### Skenario 2: Kepala Sekolah Verifikasi & Approve

```
1. Login sebagai Kepala Sekolah/Admin
2. Buka menu "Perizinan" → "Approval"
3. Lihat perizinan dengan status "Menunggu Kepsek"
4. Klik icon "👁️" di kolom Bukti untuk preview
5. Modal preview muncul dengan zoom image
6. Verifikasi keaslian bukti
7. Tutup preview
8. Klik tombol "Setujui" (✓)
9. Modal detail muncul dengan preview bukti
10. Isi catatan (opsional)
11. Klik "Setujui"
12. Status berubah: "Disetujui"
13. Tombol "Download Surat" muncul
```

### Skenario 3: Download Surat Izin

```
1. Perizinan dengan status "Disetujui"
2. Tombol "⬇️" (Download) muncul di kolom Aksi
3. Klik tombol download
4. Loading... generate PDF
5. PDF otomatis terdownload
6. Buka PDF untuk cek
7. Print untuk tanda tangan fisik
```

---

## 🎨 UI/UX Changes

### Halaman Approval

**Tabel Perizinan:**
- Kolom baru: "Bukti"
  - Icon 🖼️ jika ada bukti → klik untuk preview
  - Text "Belum ada" jika belum upload
- Kolom "Aksi":
  - Tombol ⬇️ (Download Surat) untuk status "Disetujui"

**Modal Approval Kepala Asrama:**
- Area upload file dengan drag & drop
- Preview image sebelum upload
- Progress indicator saat upload
- Validasi: file wajib untuk approve

**Modal Approval Kepala Sekolah:**
- Section "Bukti Formulir"
- Preview image dengan klik untuk zoom
- Link "Buka di Tab Baru" untuk PDF
- Tombol download bukti original

**Modal Preview Bukti:**
- Full screen preview
- Zoom image
- Tombol "Buka di Tab Baru"
- Tombol "Download"

---

## 🧪 Testing Checklist

### Database
- [ ] Migration berhasil dijalankan
- [ ] Tabel `info_sekolah_keasramaan` terbuat
- [ ] Kolom baru di `perizinan_kepulangan_keasramaan` ada
- [ ] Bucket `bukti_formulir_keasramaan` terbuat
- [ ] RLS policies aktif

### Upload Bukti (Kepala Asrama)
- [ ] Upload JPG berhasil
- [ ] Upload PNG berhasil
- [ ] Upload PDF berhasil
- [ ] Validasi file type berfungsi
- [ ] Validasi file size (>5MB) berfungsi
- [ ] Preview image muncul
- [ ] Progress upload terlihat
- [ ] Error handling jika upload gagal
- [ ] Tidak bisa approve tanpa upload bukti

### Verifikasi (Kepala Sekolah)
- [ ] Bisa lihat bukti yang diupload
- [ ] Preview image berfungsi
- [ ] Zoom image berfungsi
- [ ] Download bukti berfungsi
- [ ] Bisa approve setelah verifikasi
- [ ] Bisa reject jika bukti tidak valid

### Generate Surat
- [ ] PDF ter-generate dengan benar
- [ ] Kop surat sesuai data sekolah
- [ ] Data perizinan lengkap
- [ ] Format tanggal Indonesia
- [ ] Nama pejabat sesuai
- [ ] Download otomatis
- [ ] File PDF bisa dibuka
- [ ] Bisa di-print

### Info Sekolah
- [ ] Halaman `/settings/info-sekolah` bisa diakses
- [ ] Form bisa diisi
- [ ] Data tersimpan ke database
- [ ] Data ter-load saat buka halaman
- [ ] Update data berfungsi

### Edge Cases
- [ ] Upload file corrupt
- [ ] Network error saat upload
- [ ] Generate PDF saat data sekolah kosong
- [ ] Multiple upload bersamaan
- [ ] File dengan nama special characters
- [ ] Very large file (>5MB)

---

## 🚀 Deployment Steps

### 1. Database Setup
```bash
# 1. Buka Supabase Dashboard
# 2. SQL Editor → New Query
# 3. Copy paste MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql
# 4. Run query
```

### 2. Storage Setup
```bash
# 1. Supabase Dashboard → Storage
# 2. Create new bucket: bukti_formulir_keasramaan
# 3. Set policies (lihat migration SQL)
```

### 3. Update Info Sekolah
```bash
# Akses: https://your-domain.com/settings/info-sekolah
# Isi semua field yang diperlukan
# Klik "Simpan Perubahan"
```

### 4. Build & Deploy
```bash
cd portal-keasramaan
npm run build
pm2 restart portal-keasramaan
```

### 5. Verify
```bash
# Test upload bukti
# Test generate PDF
# Test download surat
```

---

## 📝 Environment Variables

Tidak ada environment variable baru yang diperlukan. Pastikan yang sudah ada:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔒 Security

### Upload Security
- File type validation (whitelist)
- File size limit (5MB)
- Authenticated users only
- Random filename (UUID)
- RLS policies aktif

### Storage Security
- Private bucket
- Authenticated access only
- No public URL (kecuali via signed URL)

### PDF Generation
- Server-side only
- No user input injection
- Sanitized data

---

## 📞 Troubleshooting

### Upload Gagal
```
Error: "Failed to upload file"
Solution:
1. Cek bucket sudah dibuat
2. Cek RLS policies
3. Cek file size < 5MB
4. Cek file type allowed
```

### PDF Tidak Ter-generate
```
Error: "Data info sekolah tidak ditemukan"
Solution:
1. Buka /settings/info-sekolah
2. Isi data lengkap
3. Simpan
4. Coba generate lagi
```

### Preview Bukti Tidak Muncul
```
Error: Image tidak load
Solution:
1. Cek URL bukti di database
2. Cek storage policies
3. Cek network tab di browser
4. Cek CORS settings
```

---

## 🎉 Fitur Tambahan (Future)

- [ ] Upload multiple files
- [ ] Compress image otomatis
- [ ] OCR untuk validasi formulir
- [ ] Digital signature
- [ ] Email notification dengan surat
- [ ] QR code di surat untuk verifikasi
- [ ] Template surat custom per cabang
- [ ] Watermark di surat

---

## 📚 Dependencies

Library yang digunakan:
- `jspdf` (v3.0.3) - Generate PDF ✅ Sudah terinstall
- `@supabase/supabase-js` - Database & Storage ✅ Sudah terinstall

Tidak perlu install library tambahan!

---

## ✅ Checklist Deployment

- [ ] Migration SQL dijalankan
- [ ] Bucket storage dibuat
- [ ] RLS policies disetup
- [ ] Info sekolah diisi
- [ ] Build berhasil
- [ ] Deploy ke production
- [ ] Test upload bukti
- [ ] Test generate PDF
- [ ] Test download surat
- [ ] Training user (Kepala Asrama & Kepala Sekolah)
- [ ] Dokumentasi user manual

---

## 🎓 User Training

### Untuk Kepala Asrama:
1. Cara upload bukti formulir
2. Format file yang diterima
3. Cara mengambil screenshot yang baik
4. Apa yang harus dilakukan jika upload gagal

### Untuk Kepala Sekolah:
1. Cara verifikasi bukti
2. Cara preview dan zoom image
3. Cara download surat izin
4. Cara print surat untuk TTD fisik

---

## 📧 Support

Jika ada pertanyaan atau issue:
1. Cek dokumentasi ini
2. Cek troubleshooting section
3. Hubungi tim development

---

**Status:** ✅ READY TO DEPLOY
**Last Updated:** 2025-11-12
**Version:** 1.0.0
