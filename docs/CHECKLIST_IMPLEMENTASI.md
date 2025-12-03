# ✅ CHECKLIST IMPLEMENTASI KONFIRMASI & PERPANJANGAN

## 📋 PRE-IMPLEMENTATION

- [ ] Backup database
- [ ] Backup project files
- [ ] Siapkan Supabase SQL Editor
- [ ] Siapkan Supabase Storage

---

## 🗄️ STEP 1: DATABASE MIGRATION

### 1.1 Jalankan Migration
- [ ] Buka Supabase SQL Editor
- [ ] Copy-paste isi file: `MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql`
- [ ] Jalankan semua query
- [ ] Verifikasi tidak ada error

### 1.2 Verifikasi Kolom Baru
```sql
-- Jalankan query ini untuk verifikasi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perizinan_kepulangan_keasramaan'
ORDER BY ordinal_position;
```

**Expected Columns**:
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

### 1.3 Verifikasi Tabel Dokumen
```sql
-- Jalankan query ini untuk verifikasi
SELECT * FROM dokumen_perpanjangan_keasramaan LIMIT 1;
```

**Expected**: Tabel ada dengan kolom:
- ✅ id
- ✅ perizinan_id
- ✅ nama_dokumen
- ✅ tipe_dokumen
- ✅ deskripsi
- ✅ file_url
- ✅ file_size
- ✅ file_type
- ✅ uploaded_by
- ✅ uploaded_at
- ✅ created_at
- ✅ updated_at

---

## 💾 STEP 2: STORAGE BUCKET

### 2.1 Buat Bucket
- [ ] Buka Supabase Dashboard → Storage
- [ ] Klik "Create a new bucket"
- [ ] Nama: `dokumen-perpanjangan`
- [ ] Set public: ✅ Yes
- [ ] Klik "Create bucket"

### 2.2 Konfigurasi Bucket
- [ ] Buka bucket `dokumen-perpanjangan`
- [ ] Klik "Policies"
- [ ] Verifikasi RLS policies sudah ada:
  - ✅ Allow all users to view
  - ✅ Allow users to insert
  - ✅ Allow users to update

### 2.3 Verifikasi MIME Types
- [ ] Buka bucket settings
- [ ] Allowed MIME types: `image/*, application/pdf`
- [ ] Klik "Save"

---

## 📁 STEP 3: COPY FILE-FILE BARU

### 3.1 Konfirmasi Kepulangan
- [ ] Copy file: `app/perizinan/kepulangan/konfirmasi-kepulangan/page.tsx`
- [ ] Paste ke project
- [ ] Verifikasi file ada

### 3.2 Perpanjangan Izin
- [ ] Copy file: `app/perizinan/kepulangan/perpanjangan/[token]/page.tsx`
- [ ] Paste ke project
- [ ] Verifikasi file ada

### 3.3 API Upload Dokumen
- [ ] Copy file: `app/api/perizinan/upload-dokumen-perpanjangan/route.ts`
- [ ] Paste ke project
- [ ] Verifikasi file ada

---

## 🧭 STEP 4: UPDATE NAVIGATION

### 4.1 Update Sidebar (Jika Ada)
- [ ] Buka file: `components/Sidebar.tsx` atau menu perizinan
- [ ] Tambahkan menu baru:

```tsx
// Tambahkan di bagian perizinan menu

<NavItem 
  href="/perizinan/kepulangan/konfirmasi-kepulangan"
  icon={CheckCircle}
  label="Konfirmasi Kepulangan"
/>

<NavItem 
  href="/perizinan/kepulangan/perpanjangan"
  icon={Calendar}
  label="Perpanjangan Izin"
/>
```

- [ ] Verifikasi import icon sudah ada
- [ ] Simpan file

### 4.2 Update Main Menu (Jika Ada)
- [ ] Buka file: `app/perizinan/kepulangan/page.tsx`
- [ ] Tambahkan link ke halaman baru
- [ ] Simpan file

---

## 🔨 STEP 5: BUILD & TEST

### 5.1 Build Project
```bash
npm run build
```

- [ ] Build berhasil tanpa error
- [ ] Tidak ada warning yang critical

### 5.2 Run Development Server
```bash
npm run dev
```

- [ ] Server berjalan tanpa error
- [ ] Bisa akses http://localhost:3000

### 5.3 Test Konfirmasi Kepulangan
- [ ] Akses: `/perizinan/kepulangan/konfirmasi-kepulangan`
- [ ] Halaman loading
- [ ] List santri tampil
- [ ] Filter bekerja
- [ ] Stats cards tampil
- [ ] Modal bisa dibuka
- [ ] Input tanggal kembali
- [ ] Simpan konfirmasi
- [ ] Status terupdate

### 5.4 Test Perpanjangan Izin
- [ ] Akses: `/perizinan/kepulangan/perpanjangan/[token]`
- [ ] Token validation bekerja
- [ ] Step 1: List perizinan tampil
- [ ] Step 2: Form tampil
- [ ] Input tanggal selesai baru
- [ ] Hitung perpanjangan otomatis
- [ ] Upload dokumen
- [ ] Validasi bekerja
- [ ] Submit perpanjangan
- [ ] Step 3: Success page tampil

---

## 🧪 STEP 6: FUNCTIONAL TESTING

### 6.1 Konfirmasi Kepulangan

**Test Case 1: Santri Tepat Waktu**
- [ ] Buka konfirmasi kepulangan
- [ ] Pilih santri
- [ ] Input tanggal kembali = tanggal_selesai
- [ ] Verifikasi: "Tepat waktu"
- [ ] Simpan
- [ ] Verifikasi status = "sudah_pulang"

**Test Case 2: Santri Terlambat**
- [ ] Buka konfirmasi kepulangan
- [ ] Pilih santri
- [ ] Input tanggal kembali > tanggal_selesai
- [ ] Verifikasi: "Terlambat X hari"
- [ ] Simpan
- [ ] Verifikasi status = "terlambat"

**Test Case 3: Filter Bekerja**
- [ ] Filter: "Belum Pulang" → Hanya tampil belum_pulang
- [ ] Filter: "Sudah Pulang" → Hanya tampil sudah_pulang
- [ ] Filter: "Terlambat" → Hanya tampil terlambat

### 6.2 Perpanjangan Izin

**Test Case 1: Perpanjangan Berhasil**
- [ ] Akses form perpanjangan
- [ ] Pilih perizinan
- [ ] Input tanggal selesai baru (+5 hari)
- [ ] Input alasan
- [ ] Upload dokumen (JPG/PNG/PDF)
- [ ] Submit
- [ ] Verifikasi success page
- [ ] Verifikasi record baru di database

**Test Case 2: Validasi Tanggal**
- [ ] Input tanggal selesai baru < tanggal lama
- [ ] Verifikasi error: "Tanggal harus lebih besar"

**Test Case 3: Validasi Durasi**
- [ ] Input tanggal selesai baru sehingga total > 30 hari
- [ ] Verifikasi error: "Total durasi tidak boleh > 30 hari"

**Test Case 4: Validasi Dokumen**
- [ ] Coba submit tanpa upload dokumen
- [ ] Verifikasi error: "Dokumen harus diupload"

**Test Case 5: Validasi File**
- [ ] Upload file > 5MB
- [ ] Verifikasi error: "File terlalu besar"
- [ ] Upload file .exe
- [ ] Verifikasi error: "Tipe file tidak didukung"

---

## 📊 STEP 7: DATA VERIFICATION

### 7.1 Verifikasi Konfirmasi Kepulangan
```sql
-- Cek data konfirmasi
SELECT 
  id, nis, nama_siswa, 
  tanggal_selesai, tanggal_kembali, 
  status_kepulangan, dikonfirmasi_oleh, dikonfirmasi_at
FROM perizinan_kepulangan_keasramaan
WHERE status_kepulangan IS NOT NULL
LIMIT 10;
```

**Expected**:
- ✅ tanggal_kembali terisi
- ✅ status_kepulangan = 'sudah_pulang' atau 'terlambat'
- ✅ dikonfirmasi_oleh terisi
- ✅ dikonfirmasi_at terisi

### 7.2 Verifikasi Perpanjangan Izin
```sql
-- Cek data perpanjangan
SELECT 
  id, nis, nama_siswa, 
  tanggal_selesai, perpanjangan_ke,
  is_perpanjangan, perizinan_induk_id,
  dokumen_pendukung_url, dokumen_pendukung_tipe
FROM perizinan_kepulangan_keasramaan
WHERE is_perpanjangan = true
LIMIT 10;
```

**Expected**:
- ✅ is_perpanjangan = true
- ✅ perizinan_induk_id terisi
- ✅ perpanjangan_ke = 1, 2, atau 3
- ✅ dokumen_pendukung_url terisi
- ✅ dokumen_pendukung_tipe terisi

### 7.3 Verifikasi Dokumen
```sql
-- Cek dokumen perpanjangan
SELECT 
  id, perizinan_id, nama_dokumen, 
  tipe_dokumen, file_url, uploaded_by
FROM dokumen_perpanjangan_keasramaan
LIMIT 10;
```

**Expected**:
- ✅ Dokumen terisi
- ✅ file_url valid
- ✅ tipe_dokumen terisi

---

## 🎯 STEP 8: INTEGRATION TESTING

### 8.1 Update Halaman Approval
- [ ] Buka halaman approval
- [ ] Verifikasi perpanjangan tampil
- [ ] Bisa filter perpanjangan
- [ ] Bisa lihat dokumen perpanjangan
- [ ] Bisa approve/reject perpanjangan

### 8.2 Update Halaman Rekap
- [ ] Buka halaman rekap
- [ ] Verifikasi kolom perpanjangan tampil
- [ ] Verifikasi kolom status kepulangan tampil
- [ ] Filter bekerja
- [ ] Export CSV include perpanjangan

---

## 🚀 STEP 9: PRODUCTION DEPLOYMENT

### 9.1 Pre-Deployment
- [ ] Semua test case passed
- [ ] Tidak ada error di console
- [ ] Database backup sudah dibuat
- [ ] Project backup sudah dibuat

### 9.2 Deployment
- [ ] Push code ke repository
- [ ] Deploy ke production
- [ ] Verifikasi halaman bisa diakses
- [ ] Verifikasi database migration applied

### 9.3 Post-Deployment
- [ ] Monitor error logs
- [ ] Test di production environment
- [ ] Verifikasi semua fitur bekerja
- [ ] Dokumentasi update

---

## 📝 NOTES

- Jika ada error, cek file `IMPLEMENTASI_KONFIRMASI_DAN_PERPANJANGAN.md`
- Jika ada database error, cek file `MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql`
- Jika ada file upload error, cek storage bucket configuration
- Jika ada UI error, cek browser console

---

## ✅ FINAL CHECKLIST

- [ ] Database migration berhasil
- [ ] Storage bucket dibuat
- [ ] File-file baru dicopy
- [ ] Navigation diupdate
- [ ] Build berhasil
- [ ] Semua test case passed
- [ ] Data verification passed
- [ ] Integration testing passed
- [ ] Production deployment berhasil
- [ ] Dokumentasi lengkap

---

**Status**: READY FOR IMPLEMENTATION ✅

**Estimasi Waktu**: 2-3 jam (termasuk testing)

**Kesulitan**: Sedang

**Risk Level**: Rendah (tidak ada breaking changes)

---

Jika ada pertanyaan atau masalah, hubungi IT Support!
