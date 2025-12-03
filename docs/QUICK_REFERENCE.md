# ⚡ QUICK REFERENCE - KONFIRMASI & PERPANJANGAN

## 🎯 AKSES CEPAT

### Halaman Baru
```
Konfirmasi Kepulangan:
  URL: /perizinan/kepulangan/konfirmasi-kepulangan
  Akses: Kepala Asrama, Admin, Kepala Sekolah
  Fitur: Tracking santri kembali, auto-detect terlambat

Perpanjangan Izin:
  URL: /perizinan/kepulangan/perpanjangan/[token]
  Akses: Wali Santri (via token link)
  Fitur: Perpanjang izin + upload dokumen pendukung
```

---

## 📁 FILE PENTING

### Database
```
MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql
├─ Kolom konfirmasi kepulangan (5)
├─ Kolom perpanjangan izin (8)
├─ Tabel dokumen perpanjangan
├─ Function & trigger
└─ RLS policies
```

### Frontend
```
app/perizinan/kepulangan/konfirmasi-kepulangan/page.tsx
app/perizinan/kepulangan/perpanjangan/[token]/page.tsx
```

### API
```
app/api/perizinan/upload-dokumen-perpanjangan/route.ts
```

### Dokumentasi
```
IMPLEMENTASI_KONFIRMASI_DAN_PERPANJANGAN.md (LENGKAP)
CHECKLIST_IMPLEMENTASI.md (STEP-BY-STEP)
RINGKASAN_IMPLEMENTASI.md (OVERVIEW)
QUICK_REFERENCE.md (INI)
```

---

## 🚀 IMPLEMENTASI CEPAT (20 MENIT)

### 1. Database Migration (5 min)
```sql
-- Buka Supabase SQL Editor
-- Copy-paste: MIGRATION_PERPANJANGAN_DAN_KONFIRMASI.sql
-- Jalankan semua query
```

### 2. Storage Bucket (2 min)
```
Supabase Storage → Create Bucket
├─ Nama: dokumen-perpanjangan
├─ Public: Yes
└─ MIME: image/*, application/pdf
```

### 3. Copy Files (2 min)
```
Copy 3 file ke project:
├─ konfirmasi-kepulangan/page.tsx
├─ perpanjangan/[token]/page.tsx
└─ api/perizinan/upload-dokumen-perpanjangan/route.ts
```

### 4. Update Navigation (2 min)
```tsx
// Di Sidebar atau menu
<NavItem href="/perizinan/kepulangan/konfirmasi-kepulangan" label="Konfirmasi Kepulangan" />
<NavItem href="/perizinan/kepulangan/perpanjangan" label="Perpanjangan Izin" />
```

### 5. Build & Test (10 min)
```bash
npm run build
npm run dev
# Test di browser
```

---

## 📊 DATABASE FIELDS

### Konfirmasi Kepulangan (5 kolom)
```sql
status_kepulangan TEXT DEFAULT 'belum_pulang'
  -- 'belum_pulang' | 'sudah_pulang' | 'terlambat'

tanggal_kembali DATE
  -- Tanggal santri kembali ke asrama

dikonfirmasi_oleh TEXT
  -- Nama kepala asrama yang konfirmasi

dikonfirmasi_at TIMESTAMP
  -- Waktu konfirmasi

catatan_kembali TEXT
  -- Catatan tambahan saat konfirmasi
```

### Perpanjangan Izin (8 kolom)
```sql
is_perpanjangan BOOLEAN DEFAULT false
  -- true jika ini perpanjangan

perizinan_induk_id UUID
  -- FK ke perizinan awal

alasan_perpanjangan TEXT
  -- Alasan perpanjangan

jumlah_perpanjangan_hari INTEGER
  -- Berapa hari diperpanjang

perpanjangan_ke INTEGER DEFAULT 0
  -- Perpanjangan ke-1, ke-2, atau ke-3

dokumen_pendukung_url TEXT
  -- URL dokumen di storage

dokumen_pendukung_uploaded_at TIMESTAMP
  -- Waktu upload dokumen

dokumen_pendukung_tipe TEXT
  -- 'surat_dokter' | 'surat_keluarga' | 'surat_lainnya'
```

---

## 🎯 WORKFLOW SINGKAT

### Konfirmasi Kepulangan
```
1. Santri pulang (tanggal_mulai)
2. Santri kembali ke asrama
3. Kepala Asrama buka: /perizinan/kepulangan/konfirmasi-kepulangan
4. Input tanggal kembali
5. Sistem auto-detect terlambat
6. Simpan → Status terupdate
```

### Perpanjangan Izin
```
1. Wali santri akses: /perizinan/kepulangan/perpanjangan/[token]
2. Pilih perizinan yang ingin diperpanjang
3. Input tanggal selesai baru + alasan
4. Upload dokumen pendukung
5. Submit → Masuk approval queue
6. Kepala Asrama & Kepala Sekolah approve
7. Status: approved_kepsek
```

---

## ✅ VALIDASI PERPANJANGAN

```
✓ Tanggal baru > tanggal lama
✓ Total durasi ≤ 30 hari
✓ Perpanjangan ≤ 3x
✓ Dokumen harus diupload
✓ File size ≤ 5MB
✓ File type: JPG, PNG, PDF
```

---

## 🧪 QUICK TEST

### Test Konfirmasi
```
1. Akses: /perizinan/kepulangan/konfirmasi-kepulangan
2. Pilih santri → Klik "Konfirmasi"
3. Input tanggal kembali
4. Klik "Simpan Konfirmasi"
5. Verifikasi: Status terupdate
```

### Test Perpanjangan
```
1. Akses: /perizinan/kepulangan/perpanjangan/[token]
2. Pilih perizinan
3. Input tanggal baru + alasan
4. Upload dokumen
5. Klik "Kirim Perpanjangan"
6. Verifikasi: Success page tampil
```

---

## 🔍 VERIFIKASI DATABASE

### Konfirmasi Kepulangan
```sql
SELECT nis, nama_siswa, tanggal_selesai, tanggal_kembali, 
       status_kepulangan, dikonfirmasi_oleh
FROM perizinan_kepulangan_keasramaan
WHERE status_kepulangan IS NOT NULL
LIMIT 5;
```

### Perpanjangan Izin
```sql
SELECT nis, nama_siswa, perpanjangan_ke, 
       dokumen_pendukung_tipe, dokumen_pendukung_url
FROM perizinan_kepulangan_keasramaan
WHERE is_perpanjangan = true
LIMIT 5;
```

### Dokumen Perpanjangan
```sql
SELECT perizinan_id, nama_dokumen, tipe_dokumen, 
       file_url, uploaded_by
FROM dokumen_perpanjangan_keasramaan
LIMIT 5;
```

---

## ⚠️ COMMON ISSUES

| Issue | Solusi |
|-------|--------|
| Bucket tidak ditemukan | Buat bucket `dokumen-perpanjangan` di Storage |
| File upload gagal | Cek MIME type & ukuran file |
| Perpanjangan error | Cek validasi (max 3x, max 30 hari) |
| Konfirmasi tidak tersimpan | Cek user role & cabang |
| Halaman blank | Cek browser console (F12) |

---

## 📞 DOKUMENTASI LENGKAP

Untuk detail lebih lanjut, baca:
- `IMPLEMENTASI_KONFIRMASI_DAN_PERPANJANGAN.md` - Dokumentasi lengkap
- `CHECKLIST_IMPLEMENTASI.md` - Step-by-step checklist
- `RINGKASAN_IMPLEMENTASI.md` - Overview & summary

---

## 🎯 NEXT STEPS

1. ✅ Jalankan database migration
2. ✅ Buat storage bucket
3. ✅ Copy file-file baru
4. ✅ Update navigation
5. ✅ Build & test
6. ⏳ Update halaman approval (untuk filter perpanjangan)
7. ⏳ Update halaman rekap (untuk tampil perpanjangan)

---

**Status**: READY ✅  
**Waktu**: 20 menit  
**Kesulitan**: Sedang  
**Risk**: Rendah
