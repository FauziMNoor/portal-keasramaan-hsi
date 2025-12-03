# 🔧 Fix: Foto Siswa & Mapping Field Name

## 🐛 Masalah yang Diperbaiki

### 1. Error: Column foto_url does not exist

**Error Message:**
```
column data_siswa_keasramaan.foto_url does not exist
```

**Penyebab:**
- Kode menggunakan nama kolom `foto_url` yang salah
- Nama kolom yang benar di database adalah `foto`

**Solusi:**
- Update kode untuk menggunakan kolom `foto` (bukan `foto_url`)
- Tidak perlu menambah kolom baru karena kolom `foto` sudah ada

### 2. Error: Indikator not found for field: adab_sehari_hari

**Error Message:**
```
Indikator not found for field: adab_sehari_hari
```

**Penyebab:**
- Nama indikator di database: "Adab Sehari-hari" (dengan tanda hubung `-`)
- Setelah konversi: `adab_sehari-hari` (tanda hubung tidak di-replace)
- Field name di kode: `adab_sehari_hari` (dengan underscore)
- Mapping tidak cocok!

**Solusi:**
- Update fungsi `fetchIndikator()` untuk replace tanda hubung `-` menjadi underscore `_`

## ✅ Langkah-langkah Fix

### Step 1: (Opsional) Set Default Foto

Jika ingin set foto default menggunakan UI Avatars:

```sql
UPDATE data_siswa_keasramaan 
SET foto = 'https://ui-avatars.com/api/?name=' || REPLACE(nama_siswa, ' ', '+') || '&background=random&size=128'
WHERE foto IS NULL OR foto = '';
```

Atau jika sudah punya foto di Supabase Storage:

```sql
UPDATE data_siswa_keasramaan 
SET foto = 'https://your-project.supabase.co/storage/v1/object/public/photos/' || nis || '.jpg'
WHERE foto IS NULL OR foto = '';
```

### Step 2: Refresh Browser

Setelah menjalankan SQL, refresh browser dan test lagi.

## 🔍 Perubahan Kode

### 1. Fungsi fetchIndikator (Perbaikan Mapping)

**Sebelum:**
```typescript
const fieldName = ind.nama_indikator
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/,/g, '')
  .replace(/&/g, '')
  .replace(/__+/g, '_');
```

**Sesudah:**
```typescript
const fieldName = ind.nama_indikator
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/,/g, '')
  .replace(/&/g, '')
  .replace(/-/g, '_')      // ← TAMBAHAN: Replace hyphen
  .replace(/__+/g, '_');
```

### 2. Fetch Foto (Perbaikan Nama Kolom)

**Sebelum:**
```typescript
const { data: siswaData, error: siswaError } = await supabase
  .from('data_siswa_keasramaan')
  .select('nis, rombel, foto_url')  // ← SALAH: foto_url
  .in('nis', nisList);
```

**Sesudah:**
```typescript
const { data: siswaData, error: siswaError } = await supabase
  .from('data_siswa_keasramaan')
  .select('nis, rombel, foto')  // ← BENAR: foto
  .in('nis', nisList);

siswaData?.forEach((siswa) => {
  if (groupedData[siswa.nis]) {
    groupedData[siswa.nis].rombel = siswa.rombel || '-';
    groupedData[siswa.nis].foto = siswa.foto || '';  // ← BENAR: foto
  }
});
```

## 📋 Mapping Field Name

Berikut adalah mapping lengkap nama indikator ke field name:

| Nama Indikator di Database | Field Name di Kode |
|---|---|
| Shalat Fardhu Berjamaah | shalat_fardhu_berjamaah |
| Tata Cara Shalat | tata_cara_shalat |
| Qiyamul Lail | qiyamul_lail |
| Shalat Sunnah | shalat_sunnah |
| Puasa Sunnah | puasa_sunnah |
| Tata Cara Wudhu | tata_cara_wudhu |
| Sedekah | sedekah |
| Dzikir Pagi Petang | dzikir_pagi_petang |
| Etika dalam Tutur Kata | etika_dalam_tutur_kata |
| Etika dalam Bergaul | etika_dalam_bergaul |
| Etika dalam Berpakaian | etika_dalam_berpakaian |
| **Adab Sehari-hari** | **adab_sehari_hari** ← Fixed! |
| Waktu Tidur | waktu_tidur |
| Pelaksanaan Piket Kamar | pelaksanaan_piket_kamar |
| Disiplin Halaqah Tahfidz | disiplin_halaqah_tahfidz |
| Perizinan | perizinan |
| Belajar Malam | belajar_malam |
| Disiplin Berangkat ke Masjid | disiplin_berangkat_ke_masjid |
| Kebersihan Tubuh, Berpakaian, Berpenampilan | kebersihan_tubuh_berpakaian_berpenampilan |
| Kamar | kamar |
| Ranjang dan Almari | ranjang_dan_almari |

## 🎨 Cara Upload Foto Siswa

### Opsi 1: Menggunakan UI Avatars (Otomatis)

UI Avatars akan generate foto berdasarkan nama:

```sql
UPDATE data_siswa_keasramaan 
SET foto_url = 'https://ui-avatars.com/api/?name=' || REPLACE(nama_siswa, ' ', '+') || '&background=random&size=128&color=fff'
WHERE foto_url IS NULL OR foto_url = '';
```

**Contoh URL:**
- Nama: "Harun" → `https://ui-avatars.com/api/?name=Harun&background=random&size=128&color=fff`
- Hasil: Avatar dengan huruf "H"

### Opsi 2: Upload ke Supabase Storage

1. **Buat Bucket di Supabase:**
   - Buka Supabase Dashboard → Storage
   - Klik "New bucket"
   - Nama: `photos`
   - Public: Yes

2. **Upload Foto:**
   - Buka bucket `photos`
   - Upload foto dengan nama: `[NIS].jpg` (contoh: `202410009.jpg`)

3. **Update Database:**
   ```sql
   UPDATE data_siswa_keasramaan 
   SET foto_url = 'https://[your-project].supabase.co/storage/v1/object/public/photos/' || nis || '.jpg';
   ```

### Opsi 3: URL External

Jika foto sudah ada di server lain:

```sql
UPDATE data_siswa_keasramaan 
SET foto_url = 'https://example.com/photos/' || nis || '.jpg'
WHERE nis = '202410009';
```

## ✅ Verifikasi

### 1. Cek Kolom foto

```sql
-- Cek struktur tabel
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'data_siswa_keasramaan' 
  AND column_name = 'foto';
```

### 2. Cek Data Foto

```sql
-- Lihat data foto
SELECT nis, nama_siswa, foto 
FROM data_siswa_keasramaan 
LIMIT 10;
```

### 3. Test di Browser

1. Refresh browser (Ctrl+F5)
2. Buka Habit Tracker → Rekap
3. Tampilkan data
4. Klik tab "Detail Kategori"
5. Foto harus muncul (atau icon user jika foto tidak ada)
6. Tidak ada error di console

## 🐛 Troubleshooting

### Foto Masih Tidak Muncul

**Cek Console Browser:**
```
Error fetching rombel: column data_siswa_keasramaan.foto does not exist
```

**Solusi:**
- Pastikan kolom `foto` ada di tabel
- Cek dengan query: `SELECT * FROM data_siswa_keasramaan LIMIT 1;`
- Refresh browser

### Error CORS

**Error:**
```
Access to image at 'https://...' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solusi:**
- Gunakan UI Avatars (sudah support CORS)
- Atau gunakan Supabase Storage (sudah support CORS)
- Atau set CORS header di server foto

### Foto Broken/404

**Solusi:**
- Cek URL foto di database
- Pastikan file foto exist
- Test URL di browser langsung

## 📝 Catatan

- Kolom `foto` sudah ada di tabel `data_siswa_keasramaan` sejak awal
- Tidak perlu menambah kolom baru
- Jika kolom `foto` kosong/null, sistem akan menampilkan icon user default
- Mapping field name sekarang support tanda hubung `-` yang akan dikonversi ke underscore `_`

## 🎉 Selesai!

Setelah menjalankan SQL dan refresh browser, fitur foto dan mapping field name sudah berfungsi dengan baik!
