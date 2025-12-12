# Troubleshooting: Data KPI Kosong

## Mengapa Data KPI Kosong?

Data KPI kosong karena sistem KPI memerlukan **perhitungan manual** atau **otomatis** untuk menghasilkan data. KPI tidak otomatis muncul, harus dihitung terlebih dahulu.

---

## Langkah-Langkah Mengisi Data KPI

### 1. Pastikan Data Prerequisite Ada

KPI dihitung berdasarkan data dari sistem lain. Pastikan data berikut sudah ada:

#### A. Data Musyrif
**Tabel**: `musyrif_keasramaan`
- Harus ada data musyrif aktif
- Kolom penting: `nama_musyrif`, `cabang`, `asrama`, `status`

**Cek di database:**
```sql
SELECT nama_musyrif, cabang, asrama, status 
FROM musyrif_keasramaan 
WHERE status = 'aktif';
```

#### B. Data Jurnal Musyrif
**Tabel**: `formulir_jurnal_musyrif_keasramaan`
- Harus ada jurnal yang diinput musyrif
- Untuk periode yang ingin dihitung
- Kolom penting: `nama_musyrif`, `cabang`, `tanggal`, `status_terlaksana`

**Cek di database:**
```sql
SELECT COUNT(*) as total_jurnal, 
       DATE_TRUNC('month', tanggal) as bulan,
       COUNT(CASE WHEN status_terlaksana THEN 1 END) as terlaksana
FROM formulir_jurnal_musyrif_keasramaan
GROUP BY DATE_TRUNC('month', tanggal)
ORDER BY bulan DESC;
```

#### C. Data Habit Tracker
**Tabel**: `formulir_habit_tracker_keasramaan`
- Harus ada data habit tracker santri
- **Frekuensi input**: Setiap Jumat (mingguan), bukan harian
- **Target**: 4-5x per bulan (sesuai jumlah minggu)
- Untuk periode yang ingin dihitung
- Kolom penting: `nama_siswa`, `cabang`, `asrama`, `tanggal`, dan 21 kolom indikator

**Cek di database:**
```sql
SELECT COUNT(*) as total_records,
       COUNT(DISTINCT tanggal) as unique_days,
       DATE_TRUNC('month', tanggal) as bulan
FROM formulir_habit_tracker_keasramaan
GROUP BY DATE_TRUNC('month', tanggal)
ORDER BY bulan DESC;
```

#### D. Data Jadwal Libur (Optional)
**Tabel**: `jadwal_libur_musyrif_keasramaan`
- Data libur musyrif untuk exclude dari perhitungan
- Bisa di-generate otomatis

#### E. Data Rapat & Kolaborasi (Optional)
**Tabel**: 
- `rapat_koordinasi_keasramaan`
- `kehadiran_rapat_keasramaan`
- `log_kolaborasi_keasramaan`

---

### 2. Generate Jadwal Libur (Jika Belum Ada)

**Halaman**: `/manajemen-data/jadwal-libur-musyrif`

**Langkah:**
1. Klik tombol **"Generate Jadwal Rutin"**
2. Pilih Cabang, Bulan, Tahun
3. Sistem akan auto-generate jadwal libur Sabtu-Ahad (2 pekan sekali)
4. Musyrif dibagi 2 grup bergantian

**Atau via SQL:**
```sql
-- Contoh insert jadwal libur manual
INSERT INTO jadwal_libur_musyrif_keasramaan 
(nama_musyrif, cabang, asrama, tanggal_mulai, tanggal_selesai, jenis_libur, status)
VALUES 
('Ustadz Ahmad', 'Pusat', 'Asrama A', '2024-12-07', '2024-12-08', 'libur_rutin', 'approved');
```

---

### 3. Hitung KPI

Ada 2 cara menghitung KPI:

#### A. Via UI (Recommended)

**Halaman**: `/admin/kpi-calculation`

**Langkah:**
1. Login sebagai **Admin**
2. Buka menu **KPI Musyrif** → **Hitung KPI**
3. Pilih **Bulan** dan **Tahun** yang ingin dihitung
4. Klik tombol **"Hitung KPI (Batch)"**
5. Tunggu proses selesai (bisa 10-30 detik tergantung jumlah musyrif)
6. Hasil akan muncul di tabel

**Screenshot:**
```
┌─────────────────────────────────────┐
│  KPI Calculation Engine             │
├─────────────────────────────────────┤
│  Bulan: [November ▼]                │
│  Tahun: [2024    ]                  │
│                                     │
│  [▶ Hitung KPI (Batch)]            │
└─────────────────────────────────────┘
```

#### B. Via API

**Endpoint**: `POST /api/kpi/calculate/batch`

**Request:**
```json
{
  "bulan": 11,
  "tahun": 2024
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_calculated": 10,
    "results": [...]
  }
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/kpi/calculate/batch \
  -H "Content-Type: application/json" \
  -d '{"bulan": 11, "tahun": 2024}'
```

---

### 4. Verifikasi Data KPI Sudah Ada

**Cek di database:**
```sql
SELECT 
  nama_musyrif,
  cabang,
  periode,
  total_score,
  ranking
FROM kpi_summary_keasramaan
ORDER BY periode DESC, ranking ASC
LIMIT 10;
```

**Expected Result:**
```
nama_musyrif    | cabang | periode    | total_score | ranking
----------------|--------|------------|-------------|--------
Ustadz Ahmad    | Pusat  | 2024-11-01 | 94.1        | 1
Ustadzah Fatimah| Pusat  | 2024-11-01 | 92.5        | 2
...
```

---

### 5. Refresh Dashboard

Setelah data KPI dihitung:

1. **Dashboard Musyrif**: `/kpi/musyrif/dashboard`
   - Akan redirect ke `/kpi/musyrif/[nama]`
   - Menampilkan KPI individual

2. **Dashboard Kepala Asrama**: `/kpi/kepala-asrama`
   - Pilih Cabang dan Periode
   - Menampilkan ranking tim

3. **Dashboard Kepala Sekolah**: `/kpi/kepala-sekolah`
   - Pilih Periode
   - Menampilkan overview global

---

## Troubleshooting Umum

### Problem 1: "No data found" setelah hitung KPI

**Penyebab:**
- Tidak ada musyrif aktif di database
- Tidak ada data jurnal/habit tracker untuk periode tersebut

**Solusi:**
1. Cek data musyrif: `SELECT * FROM musyrif_keasramaan WHERE status = 'aktif'`
2. Cek data jurnal: `SELECT COUNT(*) FROM jurnal_musyrif_keasramaan WHERE tanggal >= '2024-11-01' AND tanggal < '2024-12-01'`
3. Pastikan ada data untuk periode yang dihitung

### Problem 2: KPI Score = 0

**Penyebab:**
- Data jurnal/habit tracker kosong
- Semua musyrif libur di periode tersebut

**Solusi:**
1. Input data jurnal musyrif terlebih dahulu
2. Input data habit tracker santri
3. Hitung ulang KPI

### Problem 3: Error saat hitung KPI

**Penyebab:**
- Tabel belum di-migrate
- Data tidak lengkap
- Error di calculation logic

**Solusi:**
1. Cek console browser untuk error message
2. Cek network tab untuk API response
3. Cek server logs
4. Pastikan migration sudah dijalankan

---

## Quick Start untuk Testing

Jika ingin testing dengan data dummy:

### 1. Insert Data Musyrif Dummy
```sql
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, status)
VALUES 
('Ustadz Ahmad', 'Pusat', 'Asrama A', 'aktif'),
('Ustadzah Fatimah', 'Pusat', 'Asrama B', 'aktif'),
('Ustadz Budi', 'Sukabumi', 'Asrama C', 'aktif');
```

### 2. Insert Data Jurnal Dummy
```sql
-- Note: Anda perlu sesi_id, jadwal_id, dan kegiatan_id yang valid
-- Contoh jika sudah ada data di tabel referensi:
INSERT INTO formulir_jurnal_musyrif_keasramaan 
(nama_musyrif, cabang, kelas, asrama, tahun_ajaran, semester, tanggal, 
 sesi_id, jadwal_id, kegiatan_id, status_terlaksana, catatan)
SELECT 
  'Ustadz Ahmad',
  'Pusat',
  'X IPA 1',
  'Asrama A',
  '2024/2025',
  'Ganjil',
  generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval),
  (SELECT id FROM sesi_jurnal_musyrif_keasramaan LIMIT 1),
  (SELECT id FROM jadwal_jurnal_musyrif_keasramaan LIMIT 1),
  (SELECT id FROM kegiatan_jurnal_musyrif_keasramaan LIMIT 1),
  true, -- status_terlaksana
  'Test data';
```

### 3. Insert Data Habit Tracker Dummy
```sql
-- Insert dummy habit tracker data
-- Note: Kolom menggunakan nilai text: 'Baik', 'Cukup', 'Kurang'
INSERT INTO formulir_habit_tracker_keasramaan 
(nama_siswa, nis, kelas, asrama, cabang, tanggal, musyrif,
 shalat_fardhu_berjamaah, tata_cara_shalat, qiyamul_lail, shalat_sunnah,
 puasa_sunnah, tata_cara_wudhu, sedekah, dzikir_pagi_petang,
 etika_dalam_tutur_kata, etika_dalam_bergaul, etika_dalam_berpakaian, adab_sehari_hari,
 waktu_tidur, pelaksanaan_piket_kamar, disiplin_halaqah_tahfidz, perizinan,
 belajar_malam, disiplin_berangkat_ke_masjid,
 kebersihan_tubuh_berpakaian_berpenampilan, kamar, ranjang_dan_almari)
SELECT 
  s.nama_santri,
  s.nis,
  s.kelas,
  'Asrama A',
  'Pusat',
  generate_series('2024-11-01'::date, '2024-11-30'::date, '1 day'::interval),
  'Ustadz Ahmad',
  'Baik', 'Baik', 'Cukup', 'Baik', -- Ubudiyah (4 dari 8)
  'Baik', 'Baik', 'Cukup', 'Baik', -- Ubudiyah (4 dari 8)
  'Baik', 'Baik', 'Baik', 'Cukup', -- Akhlaq (4)
  'Baik', 'Baik', 'Baik', 'Cukup', -- Kedisiplinan (4 dari 6)
  'Baik', 'Baik', -- Kedisiplinan (2 dari 6)
  'Baik', 'Baik', 'Baik' -- Kebersihan (3)
FROM data_siswa_keasramaan s
WHERE s.asrama = 'Asrama A'
LIMIT 30;
```

### 4. Hitung KPI
Buka `/admin/kpi-calculation` dan hitung untuk November 2024.

---

## Checklist Sebelum Hitung KPI

- [ ] Tabel `musyrif_keasramaan` ada data (minimal 1 musyrif aktif)
- [ ] Tabel `jurnal_musyrif_keasramaan` ada data untuk periode yang dihitung
- [ ] Tabel `habit_tracker_keasramaan` ada data untuk periode yang dihitung
- [ ] Tabel `cabang_keasramaan` ada data cabang
- [ ] Migration `20241210_kpi_system.sql` sudah dijalankan
- [ ] User login sebagai Admin untuk akses halaman KPI Calculation

---

## Next Steps

Setelah data KPI ada:

1. ✅ Dashboard akan menampilkan data
2. ✅ Ranking akan muncul
3. ✅ Trend 3 bulan akan terlihat (setelah 3x hitung)
4. ✅ Export report bisa dilakukan
5. ✅ Notifikasi bisa dikirim (future enhancement)

---

**Dokumentasi Lengkap**: Lihat `KPI_FINAL_DOCUMENTATION.md`
**Testing Guide**: Lihat `KPI_TESTING_GUIDE.md`
**Deployment**: Lihat `KPI_DEPLOYMENT_GUIDE.md`
