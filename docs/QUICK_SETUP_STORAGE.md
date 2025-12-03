# Quick Setup Storage - Manajemen Rapor

## 🚀 Setup Cepat (5 Menit)

### Via Supabase Dashboard

1. **Login** ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih **project** Anda
3. Klik **Storage** di sidebar
4. Buat 3 buckets berikut:

---

### Bucket 1: kegiatan-galeri

```
Name: kegiatan-galeri
Public: ✅ YES
File size limit: 5 MB
Allowed MIME types:
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp
```

**Klik "Create bucket"**

---

### Bucket 2: rapor-covers

```
Name: rapor-covers
Public: ✅ YES
File size limit: 10 MB
Allowed MIME types:
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp
```

**Klik "Create bucket"**

---

### Bucket 3: rapor-pdf

```
Name: rapor-pdf
Public: ✅ YES
File size limit: 50 MB
Allowed MIME types:
  - application/pdf
```

**Klik "Create bucket"**

---

## ✅ Verifikasi

Setelah setup, Anda harus melihat 3 buckets di Storage:

- ✅ kegiatan-galeri (Public)
- ✅ rapor-covers (Public)
- ✅ rapor-pdf (Public)

## 🧪 Test

1. Buka aplikasi Portal Keasramaan
2. Login sebagai admin
3. Buka **Manajemen Rapor** → **Galeri Kegiatan**
4. Buat kegiatan baru
5. Upload foto
6. ✅ Jika berhasil, foto akan muncul di galeri

## ❌ Troubleshooting

**Upload gagal?**
- Pastikan bucket name **exact match**: `kegiatan-galeri` (bukan `kegiatan_galeri`)
- Pastikan bucket adalah **Public** (centang saat create)
- Refresh browser dan coba lagi

**Foto tidak muncul?**
- Cek console browser untuk error
- Pastikan file size < 5MB
- Pastikan format file: JPG, PNG, atau WEBP

---

## 📚 Dokumentasi Lengkap

Lihat [SETUP_STORAGE_RAPOR_GUIDE.md](./SETUP_STORAGE_RAPOR_GUIDE.md) untuk:
- Setup via SQL script
- RLS policies detail
- Security notes
- Advanced troubleshooting

