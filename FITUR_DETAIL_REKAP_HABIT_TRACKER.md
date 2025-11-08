# Fitur Detail Perincian Kategori - Rekap Habit Tracker

## Deskripsi
Fitur ini menambahkan kolom-kolom detail untuk setiap indikator penilaian (Ubudiyah, Akhlaq, Kedisiplinan, Kebersihan) langsung di dalam tabel ringkasan.

## Cara Penggunaan

### 1. Tab Ringkasan
Di halaman `/habit-tracker/rekap`, pada tab **"Ringkasan"**, tabel sekarang menampilkan:

- **Kolom detail indikator** untuk setiap kategori
- **Nilai per indikator** (contoh: 4 / 5)
- **Tooltip deskripsi** - hover mouse pada nilai untuk melihat deskripsi rubrik lengkap
- **Total dan persentase** untuk setiap kategori

### 2. Struktur Kolom Tabel
Tabel sekarang memiliki urutan kolom sebagai berikut:
1. Data Siswa (No, Nama, NIS, Kelas, Rombel, Asrama, Cabang, Musyrif, Kepala Asrama)
2. Detail Ubudiyah (8 indikator) + Total + %
3. Detail Akhlaq (4 indikator) + Total + %
4. Detail Kedisiplinan (6 indikator) + Total + %
5. Detail Kebersihan (3 indikator) + Total + %
6. Total Asrama + % + Predikat

### 3. Detail yang Ditampilkan
Setiap kategori menampilkan nilai indikator-indikatornya:

#### 📿 UBUDIYAH (8 Indikator)
- Shalat Fardhu Berjamaah (max: 3)
- Tata Cara Shalat (max: 3)
- Qiyamul Lail (max: 3)
- Shalat Sunnah (max: 3)
- Puasa Sunnah (max: 5)
- Tata Cara Wudhu (max: 3)
- Sedekah (max: 4)
- Dzikir Pagi Petang (max: 4)

#### 🤝 AKHLAQ (4 Indikator)
- Etika Tutur Kata (max: 3)
- Etika Bergaul (max: 3)
- Etika Berpakaian (max: 3)
- Adab Sehari-hari (max: 3)

#### ⏰ KEDISIPLINAN (6 Indikator)
- Waktu Tidur (max: 4)
- Piket Kamar (max: 3)
- Halaqah Tahfidz (max: 3)
- Perizinan (max: 3)
- Belajar Malam (max: 4)
- Berangkat Masjid (max: 4)

#### 🧹 KEBERSIHAN & KERAPIAN (3 Indikator)
- Kebersihan Tubuh (max: 3)
- Kamar (max: 3)
- Ranjang & Almari (max: 3)

### 4. Informasi yang Ditampilkan
Setiap kolom indikator menampilkan:
- **Nilai**: Nilai yang diperoleh / Nilai maksimal (contoh: 4 / 5)
- **Tooltip**: Hover mouse pada nilai untuk melihat deskripsi rubrik lengkap

## Contoh Tampilan

```
┌────┬──────────────┬───────┬───────┬────────┬─────────┬────────┬──────────┬──────────────┬──────────────┬──────────┬──────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────────────┬────────────┬...
│ No │ Nama Siswa   │ NIS   │ Kelas │ Rombel │ Asrama  │ Cabang │ Musyrif  │ Kepala Asrama│ Shalat Fardhu│ Tata Cara│ Qiyamul  │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ Total Ubudiyah│ % Ubudiyah │...
│    │              │       │       │        │         │        │          │              │ Berjamaah    │ Shalat   │ Lail     │     │     │     │     │     │     │     │     │              │            │
├────┼──────────────┼───────┼───────┼────────┼─────────┼────────┼──────────┼──────────────┼──────────────┼──────────┼──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────────────┼────────────┼...
│ 1  │ Ahmad Fauzi  │ 12345 │  X    │   A    │ Putra 1 │ Pusat  │ Dega M.L.│ Dega M.L.    │   3 / 3      │  3 / 3   │  2 / 3   │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │   21 / 28    │    75%     │...
└────┴──────────────┴───────┴───────┴────────┴─────────┴────────┴──────────┴──────────────┴──────────────┴──────────┴──────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴──────────────┴────────────┴...

Hover pada nilai "3 / 3" akan menampilkan tooltip:
"Ananda sudah hafal dzikir pagi petang dan rutin mengamalkannya"
```

## Implementasi Teknis

### Helper Function
- `getRubrikDesc()`: Mengambil deskripsi rubrik dari `indikatorMap` untuk ditampilkan di tooltip

### Struktur Kolom
Total kolom: **40 kolom**
- 9 kolom data siswa
- 8 kolom detail Ubudiyah + 2 kolom total
- 4 kolom detail Akhlaq + 2 kolom total
- 6 kolom detail Kedisiplinan + 2 kolom total
- 3 kolom detail Kebersihan + 2 kolom total
- 3 kolom total asrama & predikat

## Styling
- Setiap kategori memiliki warna background yang berbeda:
  - Ubudiyah: bg-blue-50 (detail) & bg-blue-100 (total)
  - Akhlaq: bg-green-50 (detail) & bg-green-100 (total)
  - Kedisiplinan: bg-orange-50 (detail) & bg-orange-100 (total)
  - Kebersihan: bg-purple-50 (detail) & bg-purple-100 (total)
  - Total Asrama: bg-yellow-50
  - Predikat: bg-red-50

## Responsive Design
- Tabel menggunakan horizontal scroll untuk menampung semua kolom
- Min-width tabel: 5000px
- Setiap kolom memiliki min-width yang sesuai

## Catatan
- Detail ditampilkan langsung di kolom tabel, tidak perlu expand/collapse
- Tooltip muncul saat hover pada nilai indikator
- Tab "Detail Kategori" tetap menampilkan format lama dengan foto siswa
- Export Excel dan PDF perlu diupdate untuk menyertakan kolom detail baru
