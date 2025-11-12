# 📇 QUICK REFERENCE CARD: Upload Bukti & Cetak Surat Izin

## 🚀 Setup (5 Menit)

```sql
-- 1. Jalankan di Supabase SQL Editor
MIGRATION_STEP_BY_STEP.sql

-- 2. Buat Storage Bucket
Nama: bukti_formulir_keasramaan
Type: Private

-- 3. Storage Policies
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'bukti_formulir_keasramaan');

-- 4. Deploy
npm run build
pm2 restart portal-keasramaan
```

---

## 👤 User Actions

### Kepala Asrama
```
1. Login → Perizinan → Approval
2. Klik ✓ (Setujui) pada perizinan pending
3. Upload screenshot formulir (JPG/PNG/PDF, <5MB)
4. Klik "Setujui & Upload"
```

### Kepala Sekolah
```
1. Login → Perizinan → Approval
2. Klik 👁️ (Bukti) untuk preview
3. Verifikasi bukti
4. Klik ✓ (Setujui)
5. Klik ⬇️ (Download Surat)
```

### Admin
```
1. Login → Identitas Sekolah
2. Isi semua data (otomatis sesuai cabang)
3. Klik "Simpan Data"
```

---

## 🗄️ Database

### Kolom Baru: `perizinan_kepulangan_keasramaan`
- `bukti_formulir_url` (TEXT)
- `bukti_formulir_uploaded_at` (TIMESTAMP)
- `bukti_formulir_uploaded_by` (TEXT)

### Tabel Baru: `info_sekolah_keasramaan`
- 17 kolom (id, cabang, nama_sekolah, alamat, kontak, pejabat, dll)

### Storage: `bukti_formulir_keasramaan`

---

## 🔧 Troubleshooting

### Upload Gagal
```
✓ Cek file <5MB
✓ Cek format JPG/PNG/PDF
✓ Cek storage bucket dibuat
✓ Cek storage policies
```

### PDF Tidak Generate
```
✓ Cek status = "Disetujui"
✓ Cek data info sekolah diisi
✓ Akses /settings/info-sekolah
```

### Error: guru_keasramaan not exist
```
✓ Gunakan MIGRATION_STEP_BY_STEP.sql
✓ Bukan MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql
```

---

## 📁 Files

### Must Read
- `README_FITUR_BARU.md` - Overview
- `QUICK_START_UPLOAD_BUKTI_SURAT.md` - Setup
- `USER_GUIDE_UPLOAD_BUKTI_SURAT.md` - User guide
- `TROUBLESHOOTING_MIGRATION.md` - Troubleshooting

### SQL
- `MIGRATION_STEP_BY_STEP.sql` ⭐ USE THIS
- `TEST_VERIFICATION.sql` - Testing

### Code
- `app/api/perizinan/upload-bukti/route.ts`
- `app/api/perizinan/generate-surat/route.ts`
- `app/api/info-sekolah/route.ts`
- `app/settings/info-sekolah/page.tsx`
- `app/perizinan/kepulangan/approval/page.tsx`

---

## ✅ Checklist

### Pre-Deploy
- [ ] Migration SQL run
- [ ] Storage bucket created
- [ ] Storage policies setup
- [ ] Info sekolah filled

### Testing
- [ ] Upload JPG works
- [ ] Upload PNG works
- [ ] Upload PDF works
- [ ] Preview works
- [ ] Generate PDF works
- [ ] Download works

### Go-Live
- [ ] All tests passed
- [ ] Users trained
- [ ] Documentation shared
- [ ] Support ready

---

## 📞 Quick Help

**Error?** → `TROUBLESHOOTING_MIGRATION.md`
**How to use?** → `USER_GUIDE_UPLOAD_BUKTI_SURAT.md`
**Setup?** → `QUICK_START_UPLOAD_BUKTI_SURAT.md`
**Deploy?** → `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Key Points

- ✅ Upload wajib untuk Kepala Asrama
- ✅ Max file size: 5MB
- ✅ Format: JPG, PNG, PDF
- ✅ Surat hanya bisa download setelah approved
- ✅ Data sekolah harus diisi dulu

---

**Version:** 1.0.0 | **Status:** ✅ READY
