# ✅ DEPLOYMENT CHECKLIST: Upload Bukti & Cetak Surat Izin

## 📋 Pre-Deployment

### 1. Backup Database
- [ ] Backup database Supabase
- [ ] Export semua tabel penting
- [ ] Simpan backup di tempat aman
- [ ] Test restore backup (optional)

### 2. Review Code
- [ ] Review semua file yang dibuat/dimodifikasi
- [ ] Check diagnostics (no errors)
- [ ] Review API routes
- [ ] Review UI components

### 3. Environment Check
- [ ] Supabase URL configured
- [ ] Supabase Anon Key configured
- [ ] Node.js version compatible
- [ ] Dependencies installed

---

## 🗄️ Database Migration

### 1. Run Migration SQL
- [ ] Buka Supabase Dashboard
- [ ] Klik "SQL Editor"
- [ ] Copy paste `MIGRATION_STEP_BY_STEP.sql`
- [ ] Klik "RUN"
- [ ] Tunggu sampai selesai (no errors)
- [ ] Refresh page untuk memastikan

### 2. Verify Migration
- [ ] Run `TEST_VERIFICATION.sql`
- [ ] Check semua hasil ✅ OK
- [ ] Verify kolom baru ada
- [ ] Verify tabel info_sekolah ada
- [ ] Verify RLS policies aktif
- [ ] Verify triggers aktif

### 3. Insert Default Data
- [ ] Data info sekolah Purworejo ter-insert
- [ ] Verify data dengan query SELECT
- [ ] Update data sesuai kebutuhan

---

## 📦 Storage Setup

### 1. Create Bucket
- [ ] Buka Supabase Dashboard → Storage
- [ ] Klik "Create a new bucket"
- [ ] Nama: `bukti_formulir_keasramaan`
- [ ] Public: **No** (Private)
- [ ] Klik "Create bucket"
- [ ] Verify bucket muncul di list

### 2. Setup Storage Policies
- [ ] Buka bucket → Policies
- [ ] Create policy "Allow authenticated upload"
  ```sql
  CREATE POLICY "Allow authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bukti_formulir_keasramaan');
  ```
- [ ] Create policy "Allow authenticated read"
  ```sql
  CREATE POLICY "Allow authenticated read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'bukti_formulir_keasramaan');
  ```
- [ ] Verify policies aktif

### 3. Test Upload (Manual)
- [ ] Upload test file via Dashboard
- [ ] Verify file muncul di bucket
- [ ] Verify bisa diakses
- [ ] Delete test file

---

## 🎨 Frontend Deployment

### 1. Build Application
```bash
cd portal-keasramaan
npm run build
```
- [ ] Build berhasil (no errors)
- [ ] Check build output
- [ ] Verify all pages compiled

### 2. Test Locally (Optional)
```bash
npm run start
```
- [ ] App berjalan di localhost
- [ ] Test upload bukti
- [ ] Test generate PDF
- [ ] Test download surat
- [ ] Stop local server

### 3. Deploy to Production
```bash
pm2 restart portal-keasramaan
# atau
pm2 reload portal-keasramaan
```
- [ ] Deployment berhasil
- [ ] Check PM2 logs
- [ ] Verify app running
- [ ] Check no errors in logs

---

## ⚙️ Configuration

### 1. Update Info Sekolah
- [ ] Login sebagai Admin
- [ ] Akses `/settings/info-sekolah`
- [ ] Isi semua field:
  - [ ] Nama Sekolah Lengkap
  - [ ] Nama Singkat
  - [ ] Alamat Lengkap
  - [ ] Kota
  - [ ] Kode Pos
  - [ ] No. Telepon
  - [ ] Email
  - [ ] Website (optional)
  - [ ] Nama Kepala Sekolah
  - [ ] NIP Kepala Sekolah (optional)
  - [ ] Nama Kepala Asrama
  - [ ] NIP Kepala Asrama (optional)
- [ ] Klik "Simpan Perubahan"
- [ ] Verify data tersimpan

### 2. Verify API Endpoints
- [ ] Test `/api/perizinan/upload-bukti` (POST)
- [ ] Test `/api/info-sekolah?cabang=Purworejo` (GET)
- [ ] Test `/api/perizinan/generate-surat` (POST)
- [ ] Check response codes (200 OK)
- [ ] Check error handling

---

## 🧪 Testing

### 1. Test Upload Bukti (Kepala Asrama)
- [ ] Login sebagai Kepala Asrama
- [ ] Buka "Perizinan" → "Approval"
- [ ] Pilih perizinan pending
- [ ] Klik "Setujui"
- [ ] Upload file JPG (test)
- [ ] Verify preview muncul
- [ ] Klik "Setujui & Upload"
- [ ] Verify upload berhasil
- [ ] Verify status berubah
- [ ] Verify bukti tersimpan di database

### 2. Test Verifikasi (Kepala Sekolah)
- [ ] Login sebagai Kepala Sekolah
- [ ] Buka "Perizinan" → "Approval"
- [ ] Filter "Menunggu Kepsek"
- [ ] Klik icon bukti (preview)
- [ ] Verify preview muncul
- [ ] Verify zoom berfungsi
- [ ] Tutup preview
- [ ] Klik "Setujui"
- [ ] Verify modal muncul dengan bukti
- [ ] Klik "Setujui"
- [ ] Verify status berubah

### 3. Test Generate PDF
- [ ] Perizinan dengan status "Disetujui"
- [ ] Klik tombol download surat
- [ ] Verify PDF ter-generate
- [ ] Verify PDF ter-download
- [ ] Buka PDF
- [ ] Verify kop surat benar
- [ ] Verify data santri benar
- [ ] Verify tanggal benar
- [ ] Verify nama pejabat benar

### 4. Test Edge Cases
- [ ] Upload file >5MB (harus gagal)
- [ ] Upload file type tidak valid (harus gagal)
- [ ] Upload tanpa file (harus gagal)
- [ ] Generate PDF tanpa info sekolah (harus gagal)
- [ ] Generate PDF sebelum approved (harus gagal)

### 5. Test Multiple Users
- [ ] Test concurrent upload
- [ ] Test multiple approval
- [ ] Test multiple download
- [ ] Verify no conflicts

---

## 📱 Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest) - if available

### Mobile
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Test responsive layout
- [ ] Test upload from mobile

---

## 🔒 Security Check

### 1. Authentication
- [ ] Verify login required
- [ ] Verify role-based access
- [ ] Verify Kepala Asrama can upload
- [ ] Verify Kepala Sekolah can approve
- [ ] Verify unauthorized access blocked

### 2. File Upload Security
- [ ] Verify file type validation
- [ ] Verify file size validation
- [ ] Verify filename sanitization
- [ ] Verify storage permissions
- [ ] Verify no direct URL access (if private)

### 3. RLS Policies
- [ ] Verify RLS enabled
- [ ] Verify policies working
- [ ] Test unauthorized access
- [ ] Verify data isolation

---

## 📊 Monitoring

### 1. Setup Monitoring
- [ ] Monitor upload success rate
- [ ] Monitor PDF generation success rate
- [ ] Monitor error logs
- [ ] Monitor storage usage
- [ ] Setup alerts (optional)

### 2. Check Logs
- [ ] Check Supabase logs
- [ ] Check application logs
- [ ] Check PM2 logs
- [ ] Check browser console
- [ ] Check network requests

---

## 📚 Documentation

### 1. User Documentation
- [ ] `USER_GUIDE_UPLOAD_BUKTI_SURAT.md` ready
- [ ] Share with users
- [ ] Create video tutorial (optional)

### 2. Technical Documentation
- [ ] `README_FITUR_BARU.md` ready
- [ ] `IMPLEMENTASI_UPLOAD_BUKTI_CETAK_SURAT.md` ready
- [ ] `TROUBLESHOOTING_MIGRATION.md` ready
- [ ] API documentation ready

### 3. Training Materials
- [ ] Prepare training slides
- [ ] Prepare demo data
- [ ] Schedule training session

---

## 👥 User Training

### 1. Kepala Asrama Training
- [ ] Explain upload bukti feature
- [ ] Demo upload process
- [ ] Explain file requirements
- [ ] Q&A session

### 2. Kepala Sekolah Training
- [ ] Explain verification process
- [ ] Demo preview & approve
- [ ] Demo download surat
- [ ] Explain print process
- [ ] Q&A session

### 3. Admin Training
- [ ] Explain info sekolah management
- [ ] Demo update data
- [ ] Explain troubleshooting
- [ ] Q&A session

---

## 🚀 Go Live

### 1. Final Check
- [ ] All tests passed
- [ ] All documentation ready
- [ ] All users trained
- [ ] Backup completed
- [ ] Rollback plan ready

### 2. Announcement
- [ ] Announce to users
- [ ] Send user guide
- [ ] Provide support contact
- [ ] Set expectations

### 3. Monitor First Day
- [ ] Monitor usage
- [ ] Monitor errors
- [ ] Respond to issues quickly
- [ ] Collect feedback

---

## 📈 Post-Deployment

### 1. Week 1 Review
- [ ] Review usage statistics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Fix critical issues

### 2. Week 2-4 Review
- [ ] Review performance
- [ ] Optimize if needed
- [ ] Update documentation
- [ ] Plan improvements

### 3. Monthly Review
- [ ] Review storage usage
- [ ] Review success rates
- [ ] Plan new features
- [ ] Update training materials

---

## 🔄 Rollback Plan

### If Critical Issues Found:

1. **Immediate Rollback**
   ```bash
   # Revert to previous version
   pm2 restart portal-keasramaan --update-env
   ```

2. **Database Rollback**
   ```sql
   -- Drop new columns
   ALTER TABLE perizinan_kepulangan_keasramaan
   DROP COLUMN IF EXISTS bukti_formulir_url,
   DROP COLUMN IF EXISTS bukti_formulir_uploaded_at,
   DROP COLUMN IF EXISTS bukti_formulir_uploaded_by;
   
   -- Drop new table
   DROP TABLE IF EXISTS info_sekolah_keasramaan CASCADE;
   ```

3. **Restore Backup**
   - Restore database from backup
   - Restore application from previous version

4. **Communicate**
   - Inform users about rollback
   - Explain reason
   - Provide timeline for fix

---

## ✅ Sign-off

### Technical Lead
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Signed off by: _________________ Date: _______

### Project Manager
- [ ] Requirements met
- [ ] Users trained
- [ ] Go-live approved
- [ ] Signed off by: _________________ Date: _______

### Stakeholders
- [ ] Demo approved
- [ ] Training completed
- [ ] Ready for production
- [ ] Signed off by: _________________ Date: _______

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Version:** 1.0.0
**Status:** ⬜ Pending / ⬜ In Progress / ⬜ Completed
