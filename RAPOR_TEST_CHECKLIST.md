# ✅ Checklist Test Setup Rapor

## 📋 Pre-Test Setup

### 1. Database Migration
- [ ] Run `20241212_rapor_system.sql` di Supabase SQL Editor
- [ ] Run `20241212_rapor_storage_bucket.sql` di Supabase SQL Editor
- [ ] Run `20241212_rapor_rls_policies.sql` di Supabase SQL Editor

**Cara cek:**
```sql
-- Cek tabel sudah ada
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'rapor_%';

-- Expected: 5 tabel
-- rapor_kegiatan_keasramaan
-- rapor_dokumentasi_lainnya_keasramaan
-- rapor_rekap_habit_keasramaan
-- rapor_generate_log_keasramaan
-- rapor_catatan_keasramaan
```

### 2. Storage Bucket
- [ ] Bucket `rapor-kegiatan` sudah ada (public)
- [ ] Bucket `rapor-pdf` sudah ada (private)

**Cara cek:**
1. Buka Supabase Dashboard
2. Klik **Storage** di sidebar
3. Harusnya ada 2 bucket

### 3. Data Master
- [ ] Ada data di tabel `cabang_keasramaan` (untuk dropdown Cabang)
- [ ] Ada data di tabel `tahun_ajaran_keasramaan` (untuk dropdown Tahun Ajaran)
- [ ] Ada data di tabel `semester_keasramaan` (untuk dropdown Semester)
- [ ] Ada data di tabel `kelas_keasramaan` (untuk dropdown Kelas)
- [ ] Ada data di tabel `asrama_keasramaan` (untuk dropdown Asrama)

**Cara cek:**
```sql
SELECT * FROM cabang_keasramaan;
SELECT * FROM tahun_ajaran_keasramaan WHERE status = 'aktif';
SELECT * FROM semester_keasramaan WHERE status = 'aktif';
SELECT * FROM kelas_keasramaan WHERE status = 'aktif';
SELECT * FROM asrama_keasramaan WHERE status = 'aktif';
```

**Jika belum ada data, jalankan:**
```sql
-- File: supabase/migrations/20241212_rapor_sample_data.sql
-- Atau manual insert:
INSERT INTO cabang_keasramaan (nama_cabang) VALUES ('Pusat');
INSERT INTO tahun_ajaran_keasramaan (tahun_ajaran, status) VALUES ('2024/2025', 'aktif');
INSERT INTO semester_keasramaan (semester, angka, status) VALUES ('Ganjil', 1, 'aktif');
INSERT INTO kelas_keasramaan (nama_kelas, status) VALUES ('7', 'aktif');
INSERT INTO asrama_keasramaan (asrama, kelas, lokasi, status) VALUES ('Asrama A', '7', 'Pusat', 'aktif');
```

### 4. Dev Server
- [ ] Dev server running (`npm run dev`)
- [ ] Bisa akses http://localhost:3000

---

## 🧪 Test Flow

### Test 1: Akses Halaman
- [ ] Buka http://localhost:3000/rapor/setup
- [ ] Halaman load tanpa error
- [ ] Sidebar muncul dengan menu "Manajemen Rapor" → "Setup Rapor"

### Test 2: Filter Dropdown
- [ ] Dropdown **Cabang** terisi (ada pilihan)
- [ ] Dropdown **Tahun Ajaran** terisi
- [ ] Dropdown **Semester** terisi
- [ ] Dropdown **Kelas** terisi
- [ ] Dropdown **Asrama** terisi

**Jika dropdown kosong:**
- Cek data master di database (lihat Pre-Test Setup #3)

### Test 3: Pilih Filter
- [ ] Pilih Cabang: `Pusat`
- [ ] Pilih Tahun Ajaran: `2024/2025`
- [ ] Pilih Semester: `Ganjil`
- [ ] Pilih Kelas: `7`
- [ ] Pilih Asrama: `Asrama A`

**Expected:**
- Muncul 6 card kegiatan
- Muncul section "Dokumentasi Program Lainnya"

### Test 4: Input Kegiatan 1
- [ ] Isi **Nama Kegiatan**: `Kegiatan Pramuka`
- [ ] Isi **Keterangan**: `Kegiatan pramuka rutin setiap Jumat sore`
- [ ] Upload **Foto 1** (pilih file JPG/PNG, max 10MB)
- [ ] Upload **Foto 2** (pilih file JPG/PNG, max 10MB)

**Expected:**
- Foto langsung ter-upload
- Preview foto muncul di card
- Tidak ada error di console

**Jika error upload:**
- Cek console browser (F12)
- Cek apakah bucket `rapor-kegiatan` sudah public
- Cek storage policies di Supabase

### Test 5: Input Kegiatan 2-6 (Opsional)
- [ ] Isi minimal 2-3 kegiatan lagi (untuk test lebih lengkap)

### Test 6: Simpan Data
- [ ] Klik tombol **"Simpan Semua"** (hijau, di kanan atas)
- [ ] Tunggu proses saving

**Expected:**
- Alert: `✅ Data berhasil disimpan!`
- Tidak ada error

**Jika error:**
- Cek console browser
- Cek RLS policies (run `20241212_rapor_rls_policies.sql`)
- Atau disable RLS sementara untuk testing

### Test 7: Verifikasi Data di Database
```sql
-- Cek data kegiatan tersimpan
SELECT * FROM rapor_kegiatan_keasramaan
WHERE cabang = 'Pusat' 
  AND tahun_ajaran = '2024/2025'
  AND semester = 'Ganjil'
  AND kelas = '7'
  AND asrama = 'Asrama A';

-- Expected: Ada row sesuai jumlah kegiatan yang diisi
```

### Test 8: Upload Dokumentasi Lainnya
- [ ] Scroll ke bawah ke section **"Dokumentasi Program Lainnya"**
- [ ] Klik area upload (border dashed)
- [ ] Pilih **multiple foto** (5-10 foto sekaligus)

**Expected:**
- Semua foto ter-upload satu per satu
- Foto muncul dalam grid (2-6 kolom)
- Tidak ada error

### Test 9: Verifikasi Dokumentasi di Database
```sql
-- Cek dokumentasi tersimpan
SELECT * FROM rapor_dokumentasi_lainnya_keasramaan
WHERE cabang = 'Pusat' 
  AND tahun_ajaran = '2024/2025'
  AND semester = 'Ganjil'
  AND kelas = '7'
  AND asrama = 'Asrama A';

-- Expected: Ada row sesuai jumlah foto yang diupload
```

### Test 10: Delete Dokumentasi
- [ ] Hover salah satu foto dokumentasi
- [ ] Klik tombol **trash** (merah, muncul saat hover)
- [ ] Confirm delete

**Expected:**
- Foto hilang dari tampilan
- Foto terhapus dari storage
- Data terhapus dari database

### Test 11: Reload Data
- [ ] Refresh halaman (F5)
- [ ] Pilih filter yang sama (Pusat, 2024/2025, Ganjil, 7, Asrama A)

**Expected:**
- Data kegiatan yang sudah disimpan muncul kembali
- Foto kegiatan muncul
- Dokumentasi yang tersisa muncul

### Test 12: Edit Kegiatan
- [ ] Ubah nama kegiatan 1 menjadi: `Kegiatan Pramuka (Updated)`
- [ ] Klik **"Simpan Semua"**

**Expected:**
- Alert: `✅ Data berhasil disimpan!`
- Refresh, data terupdate

### Test 13: Ganti Foto Kegiatan
- [ ] Hover foto kegiatan yang sudah ada
- [ ] Klik area foto (muncul icon upload saat hover)
- [ ] Pilih foto baru

**Expected:**
- Foto lama ter-replace dengan foto baru
- Preview update

---

## 🐛 Common Issues & Solutions

### Issue 1: Dropdown filter kosong
**Solusi:** Insert sample data (lihat Pre-Test Setup #3)

### Issue 2: Error saat upload foto
**Possible causes:**
- Bucket belum dibuat → Run `20241212_rapor_storage_bucket.sql`
- Storage policies belum di-setup → Cek di Supabase Dashboard > Storage > Policies
- File terlalu besar → Max 10MB, compress dulu

### Issue 3: Error saat simpan data
**Possible causes:**
- RLS policies belum di-setup → Run `20241212_rapor_rls_policies.sql`
- User belum authenticated → Login dulu
- Unique constraint violation → Cek apakah data dengan filter yang sama sudah ada

**Quick fix (untuk testing):**
```sql
-- Disable RLS sementara
ALTER TABLE rapor_kegiatan_keasramaan DISABLE ROW LEVEL SECURITY;
ALTER TABLE rapor_dokumentasi_lainnya_keasramaan DISABLE ROW LEVEL SECURITY;
```

### Issue 4: Foto tidak muncul setelah upload
**Solusi:**
- Cek apakah bucket `rapor-kegiatan` sudah **public**
- Cek URL foto di database, coba akses langsung di browser

### Issue 5: "Cannot read properties of undefined"
**Solusi:**
- Cek console untuk detail error
- Kemungkinan ada field yang null/undefined
- Cek apakah semua filter sudah dipilih

---

## 📸 Screenshot Checklist

Ambil screenshot untuk dokumentasi:
- [ ] Halaman dengan filter terisi
- [ ] Form 6 kegiatan dengan foto
- [ ] Section dokumentasi dengan multiple foto
- [ ] Alert "Data berhasil disimpan"
- [ ] Data di Supabase Dashboard (tabel & storage)

---

## ✅ Success Criteria

Test dianggap **BERHASIL** jika:
1. ✅ Semua dropdown filter terisi
2. ✅ Bisa input minimal 1 kegiatan dengan 2 foto
3. ✅ Data tersimpan ke database
4. ✅ Foto tersimpan ke storage
5. ✅ Bisa upload dokumentasi lainnya
6. ✅ Bisa delete dokumentasi
7. ✅ Data muncul kembali setelah reload

---

## 🎯 Next Steps

Setelah test berhasil:
- [ ] Screenshot hasil test
- [ ] Lanjut ke **Phase 2: Generate Rapor**

---

**Mulai test sekarang! Kasih tau jika ada error atau stuck di step tertentu.** 😊
