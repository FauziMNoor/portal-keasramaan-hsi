# Cara Test Fitur Keterangan Rubrik

## ✅ Fitur yang Sudah Ditambahkan

Keterangan rubrik sudah ditambahkan di **Tab Detail Kategori** pada halaman **Rekap Habit Tracker**.

Setiap nilai pencapaian (misalnya "3 / 3" pada Shalat Fardhu Berjamaah) akan menampilkan keterangan seperti:
- **Nilai 3** → "Selalu"
- **Nilai 2** → "Kadang-kadang"  
- **Nilai 1** → "Tidak pernah"

## 📋 Langkah-langkah Testing

### 1. Pastikan Data Indikator Sudah Ada di Database

Jalankan query ini di Supabase SQL Editor untuk memastikan data indikator sudah ada:

```sql
SELECT * FROM indikator_keasramaan;
```

Jika belum ada data, jalankan file `SETUP_DATABASE.sql` bagian INSERT indikator_keasramaan.

### 2. Buka Halaman Rekap Habit Tracker

1. Buka aplikasi di browser
2. Navigasi ke menu **Habit Tracker** → **Rekap**
3. Pilih filter:
   - **Semester** (wajib)
   - **Tahun Ajaran** (wajib)
   - Filter lainnya (opsional)
4. Klik tombol **"Tampilkan Rekap"**

### 3. Lihat Tab Detail Kategori

1. Setelah data muncul, klik tab **"📋 Detail Kategori"**
2. Scroll ke bawah untuk melihat detail setiap siswa
3. Di setiap kategori (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan), Anda akan melihat:
   - **Baris 1**: Nama indikator dan nilai (contoh: "Shalat Fardhu Berjamaah: 3 / 3")
   - **Baris 2**: Keterangan rubrik dalam italic dan warna (contoh: "_Selalu_")

### 4. Debugging (Jika Keterangan Tidak Muncul)

Buka **Browser Console** (F12) dan lihat log:

```
Indikator map: { ... }
```

Jika ada error atau keterangan tidak muncul, Anda akan melihat log seperti:
- `Indikator not found for field: shalat_fardhu_berjamaah`
- `No rubrik match for shalat_fardhu_berjamaah with value 3`

## 🎨 Tampilan yang Diharapkan

### Kategori Ubudiyah (Background Biru)
```
🕌 Ubudiyah                                    21 / 28 (76%)

Shalat Fardhu Berjamaah:                              3 / 3
Selalu

Tata Cara Shalat:                                     3 / 3
Sangat baik

Qiyamul Lail:                                         3 / 3
Rutin
...
```

### Kategori Akhlaq (Background Hijau)
```
💚 Akhlaq                                      10 / 12 (83%)

Etika Tutur Kata:                                     2 / 3
Cukup sopan

Etika Bergaul:                                        3 / 3
Sangat baik
...
```

## 🔧 Troubleshooting

### Keterangan Tidak Muncul

**Kemungkinan Penyebab:**

1. **Data indikator belum ada di database**
   - Solusi: Jalankan `SETUP_DATABASE.sql`

2. **Field name mapping tidak cocok**
   - Cek console log untuk melihat field name yang dicari
   - Pastikan nama indikator di database sesuai dengan yang diharapkan

3. **Nilai rubrik tidak cocok**
   - Pastikan format rubrik di database: `"1 = Deskripsi, 2 = Deskripsi, 3 = Deskripsi"`
   - Pastikan tidak ada spasi atau karakter aneh

### Contoh Mapping Field Name

| Nama Indikator di Database | Field Name di Code |
|---|---|
| Shalat Fardhu Berjamaah | shalat_fardhu_berjamaah |
| Tata Cara Shalat | tata_cara_shalat |
| Etika dalam Tutur Kata | etika_dalam_tutur_kata |
| Kebersihan Tubuh, Berpakaian, Berpenampilan | kebersihan_tubuh_berpakaian_berpenampilan |

## 📝 Catatan

- Keterangan rubrik hanya muncul di **Tab Detail Kategori**, tidak di Tab Ringkasan
- Warna keterangan disesuaikan dengan kategori:
  - Ubudiyah: Biru (`text-blue-600`)
  - Akhlaq: Hijau (`text-green-600`)
  - Kedisiplinan: Orange (`text-orange-600`)
  - Kebersihan: Ungu (`text-purple-600`)
