# ⚡ QUICK START: Upload Bukti & Cetak Surat Izin

## 🚀 Setup Cepat (5 Menit)

### 1. Database Migration
```sql
-- GUNAKAN FILE: MIGRATION_STEP_BY_STEP.sql
-- Buka Supabase SQL Editor
-- Copy paste SEMUA isi file MIGRATION_STEP_BY_STEP.sql
-- Klik RUN
-- Tunggu sampai selesai (akan ada notifikasi success)
```

**PENTING:** Gunakan `MIGRATION_STEP_BY_STEP.sql` bukan `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql`

### 2. Buat Storage Bucket
```
Supabase Dashboard → Storage → Create Bucket
Nama: bukti_formulir_keasramaan
Public: No
```

### 3. Setup Storage Policy
```sql
-- Policy Upload
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');

-- Policy Read
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bukti_formulir_keasramaan');
```

### 4. Isi Info Sekolah
```
Akses: /identitas-sekolah
Isi semua field (data akan otomatis sesuai cabang Anda)
Klik "Simpan Data"
```

### 5. Deploy
```bash
npm run build
pm2 restart portal-keasramaan
```

---

## 📋 Cara Pakai

### Kepala Asrama
1. Buka "Perizinan" → "Approval"
2. Klik "Setujui" pada perizinan pending
3. Upload screenshot formulir (JPG/PNG/PDF, max 5MB)
4. Klik "Setujui & Upload"

### Kepala Sekolah
1. Buka "Perizinan" → "Approval"
2. Klik icon 👁️ untuk lihat bukti
3. Verifikasi bukti
4. Klik "Setujui"
5. Klik icon ⬇️ untuk download surat

---

## ✅ Test Checklist

- [ ] Upload JPG berhasil
- [ ] Upload PNG berhasil
- [ ] Upload PDF berhasil
- [ ] Preview bukti muncul
- [ ] Generate PDF berhasil
- [ ] Download surat berhasil

---

## 🐛 Troubleshooting

**Upload Gagal?**
→ Cek bucket sudah dibuat & policies sudah disetup

**PDF Tidak Generate?**
→ Isi data info sekolah di `/settings/info-sekolah`

**Preview Tidak Muncul?**
→ Cek storage policies & CORS settings

---

## 📁 File Penting

- `MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql` - SQL migration
- `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md` - Dokumentasi lengkap
- `app/api/perizinan/upload-bukti/route.ts` - API upload
- `app/api/perizinan/generate-surat/route.ts` - API generate PDF
- `app/settings/info-sekolah/page.tsx` - Manage info sekolah

---

**Status:** ✅ READY
**Time:** ~5 menit setup
