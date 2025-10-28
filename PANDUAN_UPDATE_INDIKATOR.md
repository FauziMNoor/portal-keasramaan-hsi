# 📋 Panduan Update Indikator Keasramaan dengan Deskripsi Lengkap

## 🎯 Perubahan yang Dilakukan

Sistem indikator keasramaan telah diupdate untuk menampilkan **deskripsi lengkap** pada setiap nilai pencapaian siswa, bukan hanya label singkat.

### Sebelum:
```
Shalat Fardhu Berjamaah: 3 / 3
Selalu
```

### Sesudah:
```
Shalat Fardhu Berjamaah: 3 / 3
Ananda selalu menjaga agar di shaf pertama dan sangat semangat dalam shalat berjamaah
```

## 🔧 Langkah-langkah Update Database

### 1. Backup Data Lama (Opsional)

Jika Anda sudah memiliki data di tabel `indikator_keasramaan`, backup terlebih dahulu:

```sql
-- Backup data lama
CREATE TABLE indikator_keasramaan_backup AS 
SELECT * FROM indikator_keasramaan;
```

### 2. Jalankan Script Update

Buka **Supabase SQL Editor** dan jalankan file `UPDATE_INDIKATOR_LENGKAP.sql`:

1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste isi file `UPDATE_INDIKATOR_LENGKAP.sql`
6. Klik **Run** atau tekan `Ctrl+Enter`

### 3. Verifikasi Data

Setelah script berhasil dijalankan, verifikasi dengan query:

```sql
-- Cek jumlah data (harus ada 70 baris)
SELECT COUNT(*) FROM indikator_keasramaan;

-- Lihat contoh data
SELECT * FROM indikator_keasramaan 
WHERE nama_indikator = 'Shalat Fardhu Berjamaah'
ORDER BY nilai_angka DESC;
```

Hasilnya harus menampilkan 3 baris dengan deskripsi lengkap untuk nilai 3, 2, dan 1.

## 📊 Struktur Tabel Baru

### Kolom-kolom:

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key |
| kategori | TEXT | Kategori (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan & Kerapian) |
| nama_indikator | TEXT | Nama indikator (contoh: "Shalat Fardhu Berjamaah") |
| nilai_angka | INTEGER | Nilai (1-5 tergantung indikator) |
| deskripsi | TEXT | Deskripsi lengkap untuk nilai tersebut |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Contoh Data:

```sql
kategori: 'Ubudiyah'
nama_indikator: 'Shalat Fardhu Berjamaah'
nilai_angka: 3
deskripsi: 'Ananda selalu menjaga agar di shaf pertama dan sangat semangat dalam shalat berjamaah'
```

## 🎨 Tampilan di Aplikasi

Setelah update, buka halaman **Habit Tracker → Rekap → Tab Detail Kategori**.

Setiap indikator akan ditampilkan dalam kotak putih dengan:
- **Baris 1**: Nama indikator dan nilai (bold, warna sesuai kategori)
- **Baris 2**: Deskripsi lengkap (text kecil, warna abu-abu)

### Contoh Tampilan:

#### 🕌 Ubudiyah (Background Biru Muda)
```
┌─────────────────────────────────────────────────┐
│ Shalat Fardhu Berjamaah:              3 / 3    │
│ Ananda selalu menjaga agar di shaf pertama dan  │
│ sangat semangat dalam shalat berjamaah          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Tata Cara Shalat:                     2 / 3    │
│ Ananda masih harus lebih memperhatikan          │
│ shalatnya, lebih sempurna dalam gerakan shalat  │
│ dan lebih rapi lagi ketika shalat.              │
└─────────────────────────────────────────────────┘
```

## 📝 Cara Mengedit Deskripsi

Jika ingin mengubah deskripsi, edit langsung di Supabase:

### Via SQL Editor:

```sql
UPDATE indikator_keasramaan
SET deskripsi = 'Deskripsi baru yang lebih detail'
WHERE nama_indikator = 'Shalat Fardhu Berjamaah' 
  AND nilai_angka = 3;
```

### Via Table Editor:

1. Buka **Table Editor** di Supabase
2. Pilih tabel `indikator_keasramaan`
3. Cari baris yang ingin diedit
4. Klik cell `deskripsi` dan edit langsung
5. Tekan Enter untuk save

## 🔍 Troubleshooting

### Deskripsi Tidak Muncul

**Cek Console Browser (F12):**

Jika muncul log:
```
Indikator not found for field: shalat_fardhu_berjamaah
```

**Solusi:**
- Pastikan script `UPDATE_INDIKATOR_LENGKAP.sql` sudah dijalankan
- Cek apakah data ada di tabel dengan query:
  ```sql
  SELECT * FROM indikator_keasramaan LIMIT 10;
  ```

### Mapping Field Name Salah

Jika muncul log:
```
No description for shalat_fardhu_berjamaah with value 3
```

**Solusi:**
- Cek mapping di console log: `Indikator map: { ... }`
- Pastikan nama indikator di database sesuai dengan yang diharapkan
- Field name dibuat dengan cara:
  - Lowercase semua huruf
  - Ganti spasi dengan underscore
  - Hapus koma dan ampersand
  - Contoh: "Shalat Fardhu Berjamaah" → "shalat_fardhu_berjamaah"

### Nilai Tidak Cocok

Jika nilai siswa adalah 2.7, sistem akan membulatkan ke 3 dan menampilkan deskripsi untuk nilai 3.

## 📊 Daftar Lengkap Indikator

### Ubudiyah (8 indikator)
1. Shalat Fardhu Berjamaah (1-3)
2. Tata Cara Shalat (1-3)
3. Qiyamul Lail (1-3)
4. Shalat Sunnah (1-3)
5. Puasa Sunnah (1-5)
6. Tata Cara Wudhu (1-3)
7. Sedekah (1-4)
8. Dzikir Pagi Petang (1-4)

### Akhlaq (4 indikator)
1. Etika dalam Tutur Kata (1-3)
2. Etika dalam Bergaul (1-3)
3. Etika dalam Berpakaian (1-3)
4. Adab Sehari-hari (1-3)

### Kedisiplinan (6 indikator)
1. Waktu Tidur (1-4)
2. Pelaksanaan Piket Kamar (1-3)
3. Disiplin Halaqah Tahfidz (1-3)
4. Perizinan (1-3)
5. Belajar Malam (1-4)
6. Disiplin Berangkat ke Masjid (1-4)

### Kebersihan & Kerapian (3 indikator)
1. Kebersihan Tubuh, Berpakaian, Berpenampilan (1-3)
2. Kamar (1-3)
3. Ranjang dan Almari (1-3)

**Total: 21 indikator dengan 70 deskripsi**

## ✅ Checklist Setelah Update

- [ ] Script SQL sudah dijalankan tanpa error
- [ ] Verifikasi jumlah data (70 baris)
- [ ] Refresh browser dan clear cache
- [ ] Buka halaman Rekap Habit Tracker
- [ ] Pilih Semester dan Tahun Ajaran
- [ ] Klik tab "Detail Kategori"
- [ ] Verifikasi deskripsi muncul di semua indikator
- [ ] Cek console browser tidak ada error

## 🎉 Selesai!

Sistem sekarang akan menampilkan deskripsi lengkap untuk setiap nilai pencapaian siswa, memberikan informasi yang lebih detail dan bermakna untuk evaluasi.
