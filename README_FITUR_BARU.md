# 🎉 FITUR BARU: Upload Bukti & Cetak Surat Izin Kepulangan

## ✅ Status: SIAP DIGUNAKAN

---

## 📋 Apa yang Sudah Dibuat?

### 1. Upload Bukti Formulir (Kepala Asrama)
✅ Kepala Asrama wajib upload screenshot formulir saat approval
✅ Validasi file: JPG, PNG, PDF (max 5MB)
✅ Preview image sebelum upload

### 2. Verifikasi Berkas (Kepala Sekolah)
✅ Kepala Sekolah bisa lihat & verifikasi bukti
✅ Preview dengan zoom
✅ Download bukti original

### 3. Cetak Surat Izin
✅ Generate PDF surat izin otomatis
✅ Kop surat dengan data sekolah lengkap
✅ Format resmi dengan TTD
✅ Download & print

### 4. Manage Info Sekolah
✅ Halaman settings untuk data sekolah
✅ Form lengkap untuk kop surat

---

## 🚀 Cara Install (PENTING!)

### Step 1: Database Migration
```
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste ISI FILE: MIGRATION_STEP_BY_STEP.sql
3. Klik RUN
4. Tunggu sampai selesai
```

### Step 2: Buat Storage Bucket
```
1. Supabase Dashboard → Storage
2. Create bucket: bukti_formulir_keasramaan
3. Set sebagai Private (bukan Public)
```

### Step 3: Setup Storage Policies
```sql
-- Copy paste di SQL Editor:

CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bukti_formulir_keasramaan');
```

### Step 4: Isi Info Sekolah
```
1. Login ke aplikasi
2. Akses: /settings/info-sekolah
3. Isi semua data
4. Klik "Simpan"
```

### Step 5: Deploy
```bash
npm run build
pm2 restart portal-keasramaan
```

---

## 📁 File Penting

### SQL Migration
- `MIGRATION_STEP_BY_STEP.sql` ⭐ **GUNAKAN INI**
- `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql` (versi lama, jangan gunakan)

### API Routes (Baru)
- `app/api/perizinan/upload-bukti/route.ts`
- `app/api/info-sekolah/route.ts`
- `app/api/perizinan/generate-surat/route.ts`

### Pages
- `app/perizinan/kepulangan/approval/page.tsx` (Updated)
- `app/settings/info-sekolah/page.tsx` (Baru)

### Dokumentasi
- `QUICK_START_UPLOAD_BUKTI_SURAT.md` - Quick start
- `TROUBLESHOOTING_MIGRATION.md` - Troubleshooting
- `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md` - Dokumentasi lengkap
- `SUMMARY_FITUR_UPLOAD_BUKTI_SURAT.md` - Summary detail

---

## 🐛 Troubleshooting

### Error: relation "guru_keasramaan" does not exist
**Solusi:** Gunakan `MIGRATION_STEP_BY_STEP.sql` bukan yang lama

### Upload Gagal
**Solusi:** Pastikan storage bucket & policies sudah dibuat

### PDF Tidak Generate
**Solusi:** Isi data info sekolah di `/settings/info-sekolah`

**Lihat lengkap:** `TROUBLESHOOTING_MIGRATION.md`

---

## 📖 Cara Pakai

### Kepala Asrama:
1. Buka "Perizinan" → "Approval"
2. Klik "Setujui" pada perizinan pending
3. Upload screenshot formulir
4. Klik "Setujui & Upload"

### Kepala Sekolah:
1. Buka "Perizinan" → "Approval"
2. Klik icon 👁️ untuk lihat bukti
3. Verifikasi bukti
4. Klik "Setujui"
5. Klik icon ⬇️ untuk download surat

---

## ✅ Checklist Sebelum Deploy

- [ ] Migration SQL dijalankan (`MIGRATION_STEP_BY_STEP.sql`)
- [ ] Storage bucket dibuat (`bukti_formulir_keasramaan`)
- [ ] Storage policies disetup
- [ ] Info sekolah diisi
- [ ] Test upload file
- [ ] Test generate PDF
- [ ] Test download surat

---

## 📞 Support

**Dokumentasi Lengkap:**
- Quick Start: `QUICK_START_UPLOAD_BUKTI_SURAT.md`
- Troubleshooting: `TROUBLESHOOTING_MIGRATION.md`
- Implementasi: `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md`

**Jika ada masalah:**
1. Cek `TROUBLESHOOTING_MIGRATION.md`
2. Cek browser console (F12)
3. Cek Supabase logs
4. Hubungi tim development

---

**Version:** 1.0.0
**Last Updated:** 2025-11-12
**Status:** ✅ READY FOR PRODUCTION
