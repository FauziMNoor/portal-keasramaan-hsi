# Setup Database Manajemen Rapor Keasramaan

## Overview

Script `SETUP_MANAJEMEN_RAPOR.sql` membuat database schema lengkap untuk Sistem Manajemen Rapor Keasramaan, termasuk:

- 9 tabel database dengan proper constraints
- Indexes untuk optimasi performa
- Row Level Security (RLS) policies
- Data awal untuk kategori dan indikator

## Cara Penggunaan

### 1. Buka Supabase SQL Editor

1. Login ke dashboard Supabase project Anda
2. Navigasi ke **SQL Editor** di sidebar
3. Klik **New Query**

### 2. Jalankan Script

1. Copy seluruh isi file `SETUP_MANAJEMEN_RAPOR.sql`
2. Paste ke SQL Editor
3. Klik **Run** atau tekan `Ctrl+Enter`
4. Tunggu hingga semua query selesai dijalankan

### 3. Verifikasi

Pastikan semua tabel berhasil dibuat dengan menjalankan query berikut:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%rapor%' OR table_name LIKE '%kegiatan%')
AND table_name LIKE '%keasramaan'
ORDER BY table_name;
```

Anda harus melihat 9 tabel:
- `kegiatan_asrama_keasramaan`
- `kegiatan_galeri_keasramaan`
- `rapor_capaian_siswa_keasramaan`
- `rapor_galeri_token_keasramaan`
- `rapor_generate_history_keasramaan`
- `rapor_indikator_keasramaan`
- `rapor_kategori_indikator_keasramaan`
- `rapor_template_keasramaan`
- `rapor_template_page_keasramaan`

### 4. Verifikasi Data Awal

Cek apakah data awal berhasil diinsert:

```sql
-- Cek kategori indikator
SELECT * FROM rapor_kategori_indikator_keasramaan ORDER BY urutan;

-- Cek indikator per kategori
SELECT 
  k.nama_kategori,
  i.nama_indikator,
  i.deskripsi,
  i.urutan
FROM rapor_indikator_keasramaan i
JOIN rapor_kategori_indikator_keasramaan k ON i.kategori_id = k.id
ORDER BY k.urutan, i.urutan;
```

## Struktur Database

### Tabel Utama

#### 1. kegiatan_asrama_keasramaan
Menyimpan data kegiatan asrama yang akan didokumentasikan.

**Kolom penting:**
- `scope`: Cakupan kegiatan (seluruh_sekolah, kelas_10, kelas_11, kelas_12, asrama_putra, asrama_putri)
- `tahun_ajaran`, `semester`: Untuk filtering

#### 2. kegiatan_galeri_keasramaan
Menyimpan foto-foto kegiatan.

**Kolom penting:**
- `kegiatan_id`: Foreign key ke kegiatan_asrama_keasramaan
- `urutan`: Untuk sorting foto

#### 3. rapor_template_keasramaan
Menyimpan template rapor yang dapat dikustomisasi.

**Kolom penting:**
- `jenis_rapor`: semester, bulanan, tahunan
- `ukuran_kertas_default`, `orientasi_default`: Setting default

#### 4. rapor_template_page_keasramaan
Menyimpan halaman-halaman dalam template.

**Kolom penting:**
- `tipe_halaman`: static_cover, dynamic_data, galeri_kegiatan, qr_code
- `config`: JSONB untuk konfigurasi spesifik per tipe
- `urutan`: Urutan halaman dalam template

#### 5. rapor_kategori_indikator_keasramaan
Kategori pengelompokan indikator (Ubudiyah, Akhlak, Kedisiplinan).

#### 6. rapor_indikator_keasramaan
Indikator penilaian keasramaan.

**Kolom penting:**
- `kategori_id`: Foreign key ke rapor_kategori_indikator_keasramaan
- `urutan`: Urutan dalam kategori

#### 7. rapor_capaian_siswa_keasramaan
Menyimpan data capaian siswa per indikator.

**Kolom penting:**
- `siswa_nis`: NIS siswa
- `indikator_id`: Foreign key ke rapor_indikator_keasramaan
- `nilai`: Nilai capaian (A, B, C, D, atau custom)
- `deskripsi`: Deskripsi detail capaian
- **UNIQUE constraint**: (siswa_nis, indikator_id, tahun_ajaran, semester)

#### 8. rapor_galeri_token_keasramaan
Token untuk akses galeri publik via QR code.

**Kolom penting:**
- `token`: Token unik untuk akses
- `siswa_nis`: NIS siswa
- `expires_at`: Nullable untuk permanent link

#### 9. rapor_generate_history_keasramaan
History pembuatan rapor PDF.

**Kolom penting:**
- `status`: processing, completed, failed
- `pdf_url`: URL file PDF yang dihasilkan
- `error_message`: Pesan error jika gagal

## Data Awal

### Kategori Indikator (3 kategori)

1. **UBUDIYAH** - Aspek ibadah dan ketaatan
2. **AKHLAK** - Aspek perilaku dan karakter
3. **KEDISIPLINAN** - Aspek disiplin dan kepatuhan

### Indikator (24 indikator total)

#### UBUDIYAH (8 indikator)
- Shalat Fardhu Berjamaah
- Shalat Sunnah Rawatib
- Shalat Dhuha
- Qiyamul Lail
- Tilawah Al-Quran
- Hafalan Al-Quran
- Dzikir dan Doa
- Puasa Sunnah

#### AKHLAK (8 indikator)
- Sopan Santun kepada Guru
- Hubungan dengan Teman
- Kejujuran
- Tanggung Jawab
- Kepedulian Sosial
- Adab Makan dan Minum
- Adab Berbicara
- Kontrol Emosi

#### KEDISIPLINAN (8 indikator)
- Kehadiran Kegiatan Asrama
- Ketepatan Waktu
- Kebersihan Diri
- Kebersihan Kamar
- Pelaksanaan Piket
- Kepatuhan Tata Tertib
- Penggunaan Waktu
- Izin dan Perizinan

## Security (RLS Policies)

Semua tabel dilindungi dengan Row Level Security (RLS) dengan policies:
- **SELECT**: Semua user dapat membaca
- **INSERT/UPDATE/DELETE**: Hanya authenticated users

Anda dapat menyesuaikan policies ini sesuai kebutuhan keamanan aplikasi.

## Troubleshooting

### Error: relation already exists

Jika tabel sudah ada, Anda dapat:

1. **Drop tabel yang ada** (HATI-HATI: akan menghapus semua data):
```sql
DROP TABLE IF EXISTS rapor_generate_history_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_galeri_token_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_capaian_siswa_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_indikator_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_kategori_indikator_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_template_page_keasramaan CASCADE;
DROP TABLE IF EXISTS rapor_template_keasramaan CASCADE;
DROP TABLE IF EXISTS kegiatan_galeri_keasramaan CASCADE;
DROP TABLE IF EXISTS kegiatan_asrama_keasramaan CASCADE;
```

2. **Atau skip error** karena script menggunakan `IF NOT EXISTS`

### Error: duplicate key value

Jika data awal sudah ada, Anda dapat:

1. Hapus data yang ada:
```sql
DELETE FROM rapor_indikator_keasramaan;
DELETE FROM rapor_kategori_indikator_keasramaan;
```

2. Atau skip insert data awal

## Next Steps

Setelah database setup selesai, Anda dapat:

1. Mulai implementasi API routes
2. Membuat UI untuk manajemen kegiatan
3. Membuat template builder
4. Implementasi PDF generator

Lihat `tasks.md` untuk daftar lengkap implementasi tasks.
