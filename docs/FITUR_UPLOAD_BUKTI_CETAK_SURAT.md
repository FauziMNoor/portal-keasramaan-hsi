# 📋 Fitur Upload Bukti Formulir & Cetak Surat Izin Kepulangan

## 🎯 Overview

Fitur ini menambahkan kemampuan untuk:
1. **Kepala Asrama** upload bukti screenshot formulir saat approval
2. **Kepala Sekolah** verifikasi berkas upload sebelum approve
3. **Download & Cetak** surat izin resmi setelah disetujui penuh

---

## 🗄️ Database Changes

### 1. Tabel `perizinan_kepulangan_keasramaan`
**Kolom Baru:**
- `bukti_formulir_url` (TEXT) - URL file bukti formulir
- `bukti_formulir_uploaded_at` (TIMESTAMP) - Waktu upload
- `bukti_formulir_uploaded_by` (TEXT) - Nama yang upload

### 2. Tabel Baru: `info_sekolah_keasramaan`
**Struktur:**
```sql
- id (UUID)
- cabang (TEXT, UNIQUE)
- nama_sekolah (TEXT)
- nama_singkat (TEXT)
- alamat_lengkap (TEXT)
- kota (TEXT)
- kode_pos (TEXT)
- no_telepon (TEXT)
- email (TEXT)
- website (TEXT)
- nama_kepala_sekolah (TEXT)
- nip_kepala_sekolah (TEXT)
- nama_kepala_asrama (TEXT)
- nip_kepala_asrama (TEXT)
- logo_url (TEXT)
- stempel_url (TEXT)
```

---

## 📦 Storage Bucket

**Nama Bucket:** `bukti_formulir_keasramaan`

**Konfigurasi:**
- Public/Private: Sesuai kebutuhan (rekomendasi: private)
- Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf
- Max file size: 5MB

---

## 🔄 Alur Proses

### 1. Kepala Asrama - Approval dengan Upload Bukti
```
1. Kepala Asrama melihat perizinan pending
2. Klik tombol "Setujui"
3. Modal muncul dengan:
   - Form upload bukti formulir (wajib)
   - Field catatan (opsional)
4. Upload screenshot/foto formulir
5. Klik "Setujui & Upload"
6. Status berubah: pending → approved_kepas
7. File tersimpan di Storage
```

### 2. Kepala Sekolah - Verifikasi Berkas
```
1. Kepala Sekolah melihat perizinan approved_kepas
2. Klik tombol "Lihat Detail"
3. Modal menampilkan:
   - Data perizinan lengkap
   - Preview bukti formulir yang diupload
   - Tombol "Lihat Bukti Lengkap"
4. Verifikasi berkas
5. Klik "Setujui" atau "Tolak"
6. Status berubah: approved_kepas → approved_kepsek
```

### 3. Download Surat Izin
```
1. Setelah status = approved_kepsek
2. Tombol "Download Surat" muncul
3. Klik tombol
4. Generate PDF surat izin dengan:
   - Kop surat sekolah
   - Data lengkap perizinan
   - TTD digital (jika ada)
5. Download otomatis
```

---

## 📄 Format Surat Izin

```
🕌 PONDOK PESANTREN SMA IT HSI IDN
HSI BOARDING SCHOOL

Jl. [Alamat Lengkap]
Telp. [No Telepon] | Email: [Email]

═══════════════════════════════════════

SURAT IZIN KEPULANGAN SANTRI
Nomor: [Auto-generated]

Yang bertanda tangan di bawah ini, kami pihak Pondok Pesantren 
SMA IT HSI IDN, dengan ini menerangkan bahwa:

Nama Santri              : [Nama]
Nomor Induk Santri (NIS) : [NIS]
Kelas                    : [Kelas]
Asrama / Kamar           : [Asrama]

Santri tersebut diberikan izin untuk pulang ke rumah selama 
[X] hari, terhitung mulai tanggal [DD/MM/YYYY] s.d. [DD/MM/YYYY], 
dengan keterangan (alasan izin): [Alasan]

Berdasarkan permohonan wali santri dan hasil verifikasi Kepala 
Asrama, maka izin ini disetujui oleh Kepala Sekolah dan dinyatakan 
sah oleh sistem perizinan santri HSI Boarding School.

Demikian surat izin ini kami keluarkan untuk digunakan sebagaimana 
mestinya.

Purworejo, [Tanggal Cetak]

Kepala Asrama                    Kepala Sekolah
(Pemberi Izin)                   (Pengesahan)


[Nama Kepala Asrama]             [Nama Kepala Sekolah]


Santri yang Bersangkutan
(Penerima Izin)


[Nama Santri]
```

---

## 🛠️ Technical Implementation

### API Endpoints

#### 1. Upload Bukti Formulir
```typescript
POST /api/perizinan/upload-bukti
Body: FormData {
  file: File
  perizinan_id: string
}
Response: { url: string }
```

#### 2. Get Info Sekolah
```typescript
GET /api/info-sekolah?cabang=Purworejo
Response: InfoSekolah
```

#### 3. Generate Surat PDF
```typescript
POST /api/perizinan/generate-surat
Body: { perizinan_id: string }
Response: PDF Blob
```

### Components

1. **UploadBuktiModal** - Modal upload saat approval Kepala Asrama
2. **PreviewBuktiModal** - Modal preview bukti untuk Kepala Sekolah
3. **SuratIzinPDF** - Component generate PDF surat izin

---

## 🎨 UI/UX Changes

### Halaman Approval Kepala Asrama
- Tombol "Setujui" membuka modal dengan upload form
- Preview image sebelum upload
- Progress bar saat upload
- Validasi: file wajib diupload

### Halaman Approval Kepala Sekolah
- Badge "Ada Bukti" jika sudah upload
- Tombol "Lihat Bukti" untuk preview
- Modal preview dengan zoom image
- Tombol download bukti original

### Halaman Rekap
- Kolom "Bukti" dengan icon
- Tombol "Download Surat" untuk status approved_kepsek
- Loading state saat generate PDF

---

## ✅ Checklist Implementasi

### Database
- [x] Migration SQL dibuat
- [ ] Jalankan migration di Supabase
- [ ] Buat bucket `bukti_formulir_keasramaan`
- [ ] Setup RLS policies
- [ ] Insert data info_sekolah default

### Backend
- [ ] API upload bukti formulir
- [ ] API get info sekolah
- [ ] API generate PDF surat
- [ ] Validasi file upload (type, size)
- [ ] Handle error upload

### Frontend
- [ ] Update halaman approval Kepala Asrama
- [ ] Tambah modal upload bukti
- [ ] Update halaman approval Kepala Sekolah
- [ ] Tambah preview bukti
- [ ] Tambah tombol download surat
- [ ] Generate PDF component
- [ ] Loading states
- [ ] Error handling

### Testing
- [ ] Test upload berbagai format file
- [ ] Test approval flow lengkap
- [ ] Test generate PDF
- [ ] Test download surat
- [ ] Test RLS policies
- [ ] Test error scenarios

---

## 🚀 Deployment Steps

1. **Database Migration**
   ```bash
   # Jalankan MIGRATION_PERIZINAN_UPLOAD_BUKTI.sql di Supabase SQL Editor
   ```

2. **Storage Setup**
   ```
   - Buka Supabase Dashboard → Storage
   - Create new bucket: bukti_formulir_keasramaan
   - Set policies sesuai kebutuhan
   ```

3. **Update Info Sekolah**
   ```sql
   UPDATE info_sekolah_keasramaan
   SET 
     alamat_lengkap = 'Alamat sebenarnya',
     no_telepon = 'Nomor sebenarnya',
     email = 'Email sebenarnya',
     nama_kepala_sekolah = 'Nama sebenarnya',
     nama_kepala_asrama = 'Nama sebenarnya'
   WHERE cabang = 'Purworejo';
   ```

4. **Deploy Frontend**
   ```bash
   npm run build
   pm2 restart portal-keasramaan
   ```

---

## 📝 Notes

- File bukti maksimal 5MB
- Format yang diterima: JPG, PNG, PDF
- Surat izin di-generate on-demand (tidak disimpan)
- Nomor surat auto-generated: `[Tahun]/[Bulan]/[ID]`
- PDF menggunakan library `jspdf` atau `react-pdf`

---

## 🔒 Security

- Upload hanya bisa dilakukan oleh Kepala Asrama
- File disimpan dengan nama random (UUID)
- RLS policy untuk akses file
- Validasi file type di backend
- Sanitize filename
- Rate limiting untuk prevent abuse

---

## 📞 Support

Jika ada pertanyaan atau issue, hubungi tim development.
