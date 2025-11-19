# 📋 IMPLEMENTASI: KONFIRMASI KEPULANGAN & PERPANJANGAN IZIN

## ✅ STATUS IMPLEMENTASI

### Phase 1: Konfirmasi Kepulangan ✅ SELESAI
- ✅ Database migration (5 field baru)
- ✅ Halaman konfirmasi kepulangan (`/perizinan/kepulangan/konfirmasi-kepulangan`)
- ✅ Fitur tracking santri kembali
- ✅ Deteksi otomatis terlambat

### Phase 2: Perpanjangan Izin dengan Upload Dokumen ✅ SELESAI
- ✅ Database migration (8 field baru + tabel dokumen)
- ✅ Form perpanjangan (`/perizinan/kepulangan/perpanjangan/[token]`)
- ✅ Upload dokumen pendukung (surat dokter, surat keluarga, dll)
- ✅ Validasi perpanjangan (max 3x, max 30 hari)
- ✅ API upload dokumen

---

## 📁 FILE YANG DIBUAT

### 1. Database Migration
```
portal-keasramaan/MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql
```
**Isi**:
- Kolom konfirmasi kepulangan (5 field)
- Kolom perpanjangan izin (8 field)
- Tabel dokumen perpanjangan
- Function & trigger validasi
- RLS policy & storage bucket

### 2. Halaman Konfirmasi Kepulangan
```
portal-keasramaan/app/perizinan/kepulangan/konfirmasi-kepulangan/page.tsx
```
**Fitur**:
- List santri yang sedang pulang
- Input tanggal kembali
- Deteksi otomatis terlambat
- Filter: Belum Pulang, Sudah Pulang, Terlambat
- Stats cards

### 3. Halaman Perpanjangan Izin
```
portal-keasramaan/app/perizinan/kepulangan/perpanjangan/[token]/page.tsx
```
**Fitur**:
- 3 step: Select → Form → Success
- Pilih perizinan yang ingin diperpanjang
- Input tanggal selesai baru
- Input alasan perpanjangan
- Upload dokumen pendukung (JPG, PNG, PDF)
- Validasi perpanjangan
- Preview dokumen

### 4. API Upload Dokumen
```
portal-keasramaan/app/api/perizinan/upload-dokumen-perpanjangan/route.ts
```
**Fitur**:
- Upload file ke storage
- Insert ke tabel dokumen_perpanjangan_keasramaan
- Return public URL

---

## 🚀 LANGKAH IMPLEMENTASI

### Step 1: Jalankan Database Migration
```sql
-- Buka Supabase SQL Editor
-- Copy-paste isi file: MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql
-- Jalankan semua query
```

**Verifikasi**:
```sql
-- Cek kolom baru di perizinan_kepulangan_keasramaan
SELECT * FROM perizinan_kepulangan_keasramaan LIMIT 1;

-- Cek tabel dokumen_perpanjangan_keasramaan
SELECT * FROM dokumen_perpanjangan_keasramaan LIMIT 1;
```

### Step 2: Buat Storage Bucket
Di Supabase Storage:
1. Klik "Create a new bucket"
2. Nama: `dokumen-perpanjangan`
3. Set public: ✅ Yes
4. Allowed MIME types: `image/*, application/pdf`
5. Klik "Create bucket"

### Step 3: Deploy File-File Baru
Copy file-file berikut ke project:
```
✅ app/perizinan/kepulangan/konfirmasi-kepulangan/page.tsx
✅ app/perizinan/kepulangan/perpanjangan/[token]/page.tsx
✅ app/api/perizinan/upload-dokumen-perpanjangan/route.ts
```

### Step 4: Update Navigation (Sidebar)
Tambahkan menu baru di Sidebar:
```tsx
// Di components/Sidebar.tsx atau menu perizinan

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

### Step 5: Build & Test
```bash
npm run build
npm run dev
```

---

## 📊 WORKFLOW KONFIRMASI KEPULANGAN

```
1. Santri Pulang (tanggal_mulai)
   ↓
2. Santri Kembali ke Asrama
   ↓
3. Kepala Asrama Buka: /perizinan/kepulangan/konfirmasi-kepulangan
   ↓
4. Pilih Santri → Input Tanggal Kembali
   ↓
5. Sistem Auto-Detect:
   - Jika tanggal_kembali > tanggal_selesai → Status: "terlambat"
   - Jika tanggal_kembali ≤ tanggal_selesai → Status: "sudah_pulang"
   ↓
6. Simpan Konfirmasi
   ↓
7. Status Terupdate di Rekap Perizinan
```

---

## 📊 WORKFLOW PERPANJANGAN IZIN

```
1. Santri Ingin Perpanjang Izin
   ↓
2. Wali Santri Buka: /perizinan/kepulangan/perpanjangan/[token]
   ↓
3. Step 1: Pilih Perizinan yang Ingin Diperpanjang
   - Filter: Hanya perizinan yang sudah approved & belum selesai
   ↓
4. Step 2: Isi Form Perpanjangan
   - Tanggal selesai baru
   - Alasan perpanjangan
   - Tipe dokumen (surat dokter, surat keluarga, dll)
   - Upload dokumen pendukung
   ↓
5. Validasi:
   - Tanggal baru > tanggal lama ✓
   - Total durasi ≤ 30 hari ✓
   - Perpanjangan ≤ 3x ✓
   - Dokumen harus diupload ✓
   ↓
6. Submit Perpanjangan
   - Buat record baru dengan is_perpanjangan = true
   - Upload dokumen ke storage
   - Status: "pending"
   ↓
7. Step 3: Success Page
   - Tampilkan detail perpanjangan
   - Informasi status
   ↓
8. Kepala Asrama Review Perpanjangan
   - Buka: /perizinan/kepulangan/approval
   - Filter: "Perpanjangan Izin"
   - Lihat dokumen pendukung
   - Approve/Reject
   ↓
9. Kepala Sekolah Final Approval
   - Review perpanjangan
   - Approve/Reject
   ↓
10. Status: "approved_kepsek"
    - Santri bisa pulang lebih lama
```

---

## 🎯 FITUR DETAIL

### Konfirmasi Kepulangan

**Halaman**: `/perizinan/kepulangan/konfirmasi-kepulangan`

**Akses**: Kepala Asrama, Admin, Kepala Sekolah

**Fitur**:
- List santri yang sedang pulang (status = "approved_kepsek")
- Filter: Belum Pulang, Sudah Pulang, Terlambat
- Stats: Total, Belum Pulang, Sudah Pulang, Terlambat
- Modal konfirmasi:
  - Input tanggal kembali
  - Input catatan kembali
  - Auto-detect terlambat
  - Simpan konfirmasi

**Database Fields**:
```
status_kepulangan: 'belum_pulang' | 'sudah_pulang' | 'terlambat'
tanggal_kembali: DATE
dikonfirmasi_oleh: TEXT
dikonfirmasi_at: TIMESTAMP
catatan_kembali: TEXT
```

---

### Perpanjangan Izin

**Halaman**: `/perizinan/kepulangan/perpanjangan/[token]`

**Akses**: Wali Santri (via token link)

**Fitur**:
- 3 Step UI:
  1. **Select**: Pilih perizinan yang ingin diperpanjang
  2. **Form**: Isi form perpanjangan + upload dokumen
  3. **Success**: Konfirmasi perpanjangan berhasil

- **Form Fields**:
  - Tanggal selesai baru (required)
  - Alasan perpanjangan (required)
  - Tipe dokumen (dropdown)
  - Upload dokumen (required)

- **Validasi**:
  - Tanggal baru > tanggal lama
  - Total durasi ≤ 30 hari
  - Perpanjangan ≤ 3x
  - Dokumen harus diupload
  - File size ≤ 5MB
  - File type: JPG, PNG, PDF

- **Upload Dokumen**:
  - Tipe: surat_dokter, surat_keluarga, surat_lainnya
  - Storage: dokumen-perpanjangan bucket
  - Preview: Untuk image files
  - Metadata: Nama, tipe, deskripsi, size, type

**Database Fields**:
```
is_perpanjangan: BOOLEAN
perizinan_induk_id: UUID (FK)
alasan_perpanjangan: TEXT
jumlah_perpanjangan_hari: INTEGER
perpanjangan_ke: INTEGER
dokumen_pendukung_url: TEXT
dokumen_pendukung_uploaded_at: TIMESTAMP
dokumen_pendukung_uploaded_by: TEXT
dokumen_pendukung_tipe: TEXT
```

---

## 🔍 TESTING CHECKLIST

### Konfirmasi Kepulangan

- [ ] Halaman bisa diakses: `/perizinan/kepulangan/konfirmasi-kepulangan`
- [ ] List santri tampil dengan benar
- [ ] Filter bekerja: Belum Pulang, Sudah Pulang, Terlambat
- [ ] Stats cards menampilkan angka yang benar
- [ ] Modal konfirmasi bisa dibuka
- [ ] Input tanggal kembali berfungsi
- [ ] Auto-detect terlambat bekerja:
  - Jika tanggal_kembali > tanggal_selesai → "Terlambat X hari"
  - Jika tanggal_kembali ≤ tanggal_selesai → "Tepat waktu"
- [ ] Simpan konfirmasi berhasil
- [ ] Status terupdate di database
- [ ] Bisa edit konfirmasi (ubah tanggal kembali)

### Perpanjangan Izin

- [ ] Halaman bisa diakses: `/perizinan/kepulangan/perpanjangan/[token]`
- [ ] Token validation bekerja
- [ ] Step 1 (Select):
  - [ ] List perizinan tampil
  - [ ] Hanya perizinan yang bisa diperpanjang
  - [ ] Bisa pilih perizinan
- [ ] Step 2 (Form):
  - [ ] Form fields tampil
  - [ ] Input tanggal selesai baru
  - [ ] Hitung perpanjangan hari otomatis
  - [ ] Hitung total durasi otomatis
  - [ ] Input alasan perpanjangan
  - [ ] Dropdown tipe dokumen
  - [ ] Upload dokumen berfungsi
  - [ ] Preview dokumen (untuk image)
  - [ ] Validasi file size & type
- [ ] Validasi perpanjangan:
  - [ ] Tanggal baru > tanggal lama
  - [ ] Total durasi ≤ 30 hari
  - [ ] Perpanjangan ≤ 3x
  - [ ] Dokumen harus diupload
- [ ] Submit perpanjangan:
  - [ ] Record baru dibuat
  - [ ] Dokumen terupload
  - [ ] Status = "pending"
  - [ ] is_perpanjangan = true
  - [ ] perizinan_induk_id terisi
- [ ] Step 3 (Success):
  - [ ] Success page tampil
  - [ ] Detail perpanjangan benar
  - [ ] Bisa kembali ke beranda

### Approval Perpanjangan

- [ ] Halaman approval bisa filter perpanjangan
- [ ] Dokumen perpanjangan bisa dilihat
- [ ] Approve/Reject perpanjangan bekerja
- [ ] Status terupdate dengan benar

### Rekap Perpanjangan

- [ ] Kolom perpanjangan tampil
- [ ] Filter perpanjangan bekerja
- [ ] Export CSV include perpanjangan

---

## 📱 RESPONSIVE TESTING

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Tabel scroll horizontal jika perlu
- [ ] Modal responsive
- [ ] Form fields responsive

---

## 🐛 TROUBLESHOOTING

### Error: "Bucket dokumen-perpanjangan tidak ditemukan"
**Solusi**: Buat bucket di Supabase Storage dengan nama `dokumen-perpanjangan`

### Error: "File upload gagal"
**Solusi**: 
- Cek MIME type file
- Cek ukuran file (max 5MB)
- Cek permission bucket

### Error: "Perpanjangan tidak bisa dibuat"
**Solusi**:
- Cek validasi perpanjangan (max 3x, max 30 hari)
- Cek perizinan_induk_id valid
- Cek status perizinan = "approved_kepsek"

### Error: "Konfirmasi kepulangan gagal"
**Solusi**:
- Cek tanggal_kembali valid
- Cek perizinan status = "approved_kepsek"
- Cek user role = "kepala_asrama"

---

## 📞 NEXT STEPS

1. **Jalankan migration database**
2. **Buat storage bucket**
3. **Deploy file-file baru**
4. **Update navigation/sidebar**
5. **Build & test**
6. **Update halaman approval** (untuk filter perpanjangan)
7. **Update halaman rekap** (untuk tampil perpanjangan)

---

## 📝 NOTES

- Konfirmasi kepulangan bisa diakses oleh Kepala Asrama, Admin, Kepala Sekolah
- Perpanjangan izin bisa diakses oleh Wali Santri via token link
- Dokumen perpanjangan disimpan di storage bucket `dokumen-perpanjangan`
- Validasi perpanjangan dilakukan di database (trigger function)
- Status perpanjangan mengikuti alur approval yang sama (pending → approved_kepas → approved_kepsek)

---

**Version**: 1.0.0  
**Date**: November 2025  
**Status**: READY FOR IMPLEMENTATION ✅
