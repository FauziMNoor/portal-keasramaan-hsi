# 🧪 Test Setup Rapor Page

## Checklist Sebelum Test

- [x] Database migration sudah dijalankan
- [x] Storage bucket sudah dibuat
- [x] Menu Rapor sudah ditambahkan ke Sidebar
- [x] Halaman Setup Rapor sudah dibuat

---

## 🚀 Cara Test

### 1. Akses Halaman
```
http://localhost:3000/rapor/setup
```

### 2. Test Filter
- Pilih **Cabang** (dari dropdown)
- Pilih **Tahun Ajaran** (dari dropdown)
- Pilih **Semester** (dari dropdown)
- Pilih **Kelas** (dari dropdown)
- Pilih **Asrama** (dari dropdown)

**Expected:** Setelah semua filter dipilih, muncul form 6 kegiatan

---

### 3. Test Input Kegiatan

**Kegiatan 1:**
- Nama: `Kegiatan Pramuka`
- Keterangan: `Kegiatan pramuka rutin setiap Jumat`
- Upload Foto 1 (max 10MB, format: JPG/PNG/WebP)
- Upload Foto 2

**Expected:**
- Foto langsung ter-upload ke Supabase Storage
- Preview foto muncul
- URL foto tersimpan

**Ulangi untuk Kegiatan 2-6** (opsional, bisa skip)

---

### 4. Test Simpan Kegiatan

- Klik tombol **"Simpan Semua"**

**Expected:**
- Alert: "✅ Data berhasil disimpan!"
- Data tersimpan ke tabel `rapor_kegiatan_keasramaan`

---

### 5. Test Upload Dokumentasi Lainnya

- Scroll ke bawah ke section **"Dokumentasi Program Lainnya"**
- Klik area upload
- Pilih **multiple foto** (bisa 5-10 foto sekaligus)

**Expected:**
- Semua foto ter-upload
- Foto muncul dalam grid
- Data tersimpan ke tabel `rapor_dokumentasi_lainnya_keasramaan`

---

### 6. Test Delete Dokumentasi

- Hover foto dokumentasi
- Klik tombol **trash** (merah)
- Confirm delete

**Expected:**
- Foto terhapus dari storage
- Foto hilang dari tampilan
- Data terhapus dari database

---

### 7. Test Reload Data

- Refresh halaman
- Pilih filter yang sama

**Expected:**
- Data kegiatan yang sudah disimpan muncul kembali
- Foto dokumentasi yang sudah diupload muncul kembali

---

## 🐛 Troubleshooting

### Error: "Pilih semua filter terlebih dahulu"
**Solusi:** Pastikan semua dropdown filter sudah dipilih

### Error: "Ukuran file maksimal 10MB"
**Solusi:** Compress foto dulu sebelum upload

### Error: "Format file harus JPEG, PNG, atau WebP"
**Solusi:** Convert foto ke format yang didukung

### Foto tidak muncul setelah upload
**Solusi:** 
1. Cek console browser untuk error
2. Cek apakah bucket `rapor-kegiatan` sudah public
3. Cek RLS policies di Supabase

### Data tidak tersimpan
**Solusi:**
1. Cek console browser untuk error
2. Cek apakah tabel `rapor_kegiatan_keasramaan` sudah ada
3. Cek RLS policies di Supabase (pastikan authenticated users bisa insert)

---

## ✅ Expected Result

Setelah semua test berhasil:

1. **Database `rapor_kegiatan_keasramaan`:**
   ```sql
   SELECT * FROM rapor_kegiatan_keasramaan
   WHERE cabang = 'Pusat' 
     AND tahun_ajaran = '2024/2025'
     AND semester = 'Ganjil';
   ```
   Harusnya ada 6 row (atau sesuai jumlah kegiatan yang diisi)

2. **Database `rapor_dokumentasi_lainnya_keasramaan`:**
   ```sql
   SELECT * FROM rapor_dokumentasi_lainnya_keasramaan
   WHERE cabang = 'Pusat' 
     AND tahun_ajaran = '2024/2025'
     AND semester = 'Ganjil';
   ```
   Harusnya ada row sesuai jumlah foto yang diupload

3. **Storage Bucket `rapor-kegiatan`:**
   - Folder: `kegiatan/Pusat/2024-2025/Ganjil/7/Asrama-A/`
   - Files: `kegiatan-1-foto-1.jpg`, `kegiatan-1-foto-2.jpg`, dst
   - Folder: `dokumentasi/Pusat/2024-2025/Ganjil/7/Asrama-A/`
   - Files: `dok-1702345678901.jpg`, dst

---

## 📸 Screenshot Checklist

- [ ] Filter dropdown terisi semua
- [ ] Form 6 kegiatan muncul
- [ ] Foto kegiatan berhasil diupload & preview muncul
- [ ] Alert "Data berhasil disimpan" muncul
- [ ] Dokumentasi lainnya berhasil diupload
- [ ] Foto dokumentasi muncul dalam grid
- [ ] Delete dokumentasi berhasil
- [ ] Reload data berhasil (data muncul kembali)

---

## 🎯 Next Steps

Setelah Setup Rapor berhasil, lanjut ke:
1. **Generate Rapor Page** (generate PDF dari data yang sudah di-setup)
2. **History Page** (lihat history generate)

---

**Sudah test? Kasih tau hasilnya!** 😊
