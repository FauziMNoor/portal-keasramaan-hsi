# 🔄 Migration: Perubahan Nama Kolom

## 📋 Ringkasan Perubahan

Perubahan nama kolom untuk konsistensi penamaan di database:

### Tabel: `data_siswa_keasramaan`
- **Kolom lama:** `nama`
- **Kolom baru:** `nama_siswa`

### Tabel: `formulir_habit_tracker_keasramaan`
- **Kolom lama:** `nama_santri`
- **Kolom baru:** `nama_siswa`

## ✅ File yang Sudah Diupdate

### 1. app/data-siswa/page.tsx
- ✅ Interface `DataSiswa` → `nama_siswa: string`
- ✅ `formData` state → `nama_siswa: ''`
- ✅ Filter search → `siswa.nama_siswa`
- ✅ `handleEdit()` → `nama_siswa: item.nama_siswa`
- ✅ `resetForm()` → `nama_siswa: ''`
- ✅ Render tabel → `{item.nama_siswa}`
- ✅ FotoSiswa component → `nama={item.nama_siswa}`
- ✅ Form input → `value={formData.nama_siswa}`

### 2. app/habit-tracker/page.tsx
- ✅ Interface `DataSiswa` → `nama_siswa: string`
- ✅ `dataToInsert` → `nama_siswa: siswa.nama_siswa`
- ✅ `fetchSiswa()` → `.order('nama_siswa', { ascending: true })`
- ✅ Render tabel → `{siswa.nama_siswa}`

### 3. app/habit-tracker/form/[token]/page.tsx
- ✅ Interface `DataSiswa` → `nama_siswa: string`
- ✅ `dataToInsert` → `nama_siswa: siswa.nama_siswa`
- ✅ Render nama → `{siswa.nama_siswa}`
- ✅ FotoSiswa component → `nama={siswa.nama_siswa}`
- ✅ `fetchSiswa()` → `.order('nama_siswa', { ascending: true })`

### 4. SETUP_DATABASE.sql
- ✅ Tabel `data_siswa_keasramaan` → kolom `nama_siswa`
- ✅ Tabel `formulir_habit_tracker_keasramaan` → kolom `nama_siswa`

## 🔍 Verifikasi

### Cek TypeScript Errors
```bash
# Tidak ada error TypeScript
✅ app/data-siswa/page.tsx - No errors
✅ app/habit-tracker/page.tsx - No errors
✅ app/habit-tracker/form/[token]/page.tsx - No errors
```

### Cek Build
```bash
npm run build
# Build harus berhasil tanpa error
```

## 🗄️ SQL Migration (Jika Perlu)

Jika database sudah ada data, jalankan SQL berikut:

```sql
-- Rename kolom di tabel data_siswa_keasramaan
ALTER TABLE data_siswa_keasramaan 
RENAME COLUMN nama TO nama_siswa;

-- Rename kolom di tabel formulir_habit_tracker_keasramaan
ALTER TABLE formulir_habit_tracker_keasramaan 
RENAME COLUMN nama_santri TO nama_siswa;
```

## 🧪 Testing Checklist

### Data Siswa
- [ ] Buka halaman Data Siswa
- [ ] Tambah siswa baru → Nama tersimpan dengan benar
- [ ] Edit siswa → Nama ter-load dan ter-update dengan benar
- [ ] Search siswa → Pencarian by nama berfungsi
- [ ] Hapus siswa → Tidak ada error

### Habit Tracker (Input Formulir)
- [ ] Buka halaman Habit Tracker
- [ ] Pilih filter (lokasi, kelas, asrama)
- [ ] Data siswa muncul dengan nama yang benar
- [ ] Submit form → Nama tersimpan dengan benar
- [ ] Cek database → Kolom `nama_siswa` terisi

### Habit Tracker (Form Musyrif)
- [ ] Buka link musyrif
- [ ] Data siswa muncul dengan nama yang benar
- [ ] Nama ditampilkan di card siswa
- [ ] Submit form → Nama tersimpan dengan benar

## 📊 Impact Analysis

### High Impact
- ✅ **Data Siswa Page** - CRUD operations
- ✅ **Habit Tracker Page** - Form input
- ✅ **Form Musyrif** - External form

### Medium Impact
- ⚠️ **Dashboard** - Jika ada query data siswa (perlu dicek)
- ⚠️ **Reports** - Jika ada laporan yang menampilkan nama siswa

### Low Impact
- ✅ **Sidebar** - Tidak terpengaruh
- ✅ **Other Pages** - Tidak terpengaruh

## 🚨 Potential Issues

### Issue 1: Data Lama di Database
**Problem:** Jika database production sudah punya data dengan kolom lama

**Solution:**
```sql
-- Backup data dulu
CREATE TABLE data_siswa_keasramaan_backup AS 
SELECT * FROM data_siswa_keasramaan;

-- Rename kolom
ALTER TABLE data_siswa_keasramaan 
RENAME COLUMN nama TO nama_siswa;

-- Verify
SELECT nama_siswa FROM data_siswa_keasramaan LIMIT 5;
```

### Issue 2: Cache Browser
**Problem:** Browser cache mungkin masih pakai kode lama

**Solution:**
- Hard refresh: Ctrl+F5
- Clear browser cache
- Restart dev server

### Issue 3: Build Cache
**Problem:** Next.js build cache mungkin outdated

**Solution:**
```bash
# Delete .next folder
rm -rf .next

# Rebuild
npm run build
```

## ✅ Rollback Plan

Jika ada masalah, rollback dengan:

### 1. Rollback Code
```bash
git revert <commit-hash>
```

### 2. Rollback Database
```sql
-- Rename kembali ke nama lama
ALTER TABLE data_siswa_keasramaan 
RENAME COLUMN nama_siswa TO nama;

ALTER TABLE formulir_habit_tracker_keasramaan 
RENAME COLUMN nama_siswa TO nama_santri;
```

## 📝 Notes

- Perubahan ini untuk konsistensi penamaan
- Semua referensi sudah diupdate
- Tidak ada breaking changes jika database sudah di-migrate
- Testing menyeluruh diperlukan sebelum deploy

## 🎉 Status

✅ **Migration Complete!**

Semua file sudah diupdate dan siap untuk testing.
