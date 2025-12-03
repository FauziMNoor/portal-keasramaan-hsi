# 📋 Panduan Lengkap Perizinan Kepulangan

## 🎯 Overview

Sistem Perizinan Kepulangan adalah fitur untuk mengelola izin kepulangan santri dengan alur approval bertingkat (Kepala Asrama → Kepala Sekolah) dan monitoring waktu secara real-time.

## 🔄 Alur Sistem

```
1. Wali Santri mengisi formulir via link token
   ↓
2. Kepala Asrama mereview dan approve/reject
   ↓
3. Kepala Sekolah mereview dan approve/reject
   ↓
4. Kepala Asrama mencetak dokumen untuk ditandatangani
   ↓
5. Monitoring di Rekap dengan countdown dinamis
```

## 📁 Struktur File

```
app/perizinan/kepulangan/
├── form/[token]/page.tsx          # Form public untuk wali santri
├── manage-link/page.tsx           # Kelola token link
├── approval/page.tsx              # Approval Kepas & Kepsek
├── rekap/page.tsx                 # Rekap dengan countdown
└── page.tsx                       # Redirect page

SETUP_PERIZINAN_KEPULANGAN.sql     # Database setup
```

## 🗄️ Database Schema

### Tabel: `token_perizinan_keasramaan`
Menyimpan token untuk link public form perizinan.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| nama_token | TEXT | Nama/label token |
| keterangan | TEXT | Deskripsi token |
| token | TEXT | Token unik (32 karakter) |
| is_active | BOOLEAN | Status aktif/nonaktif |
| created_at | TIMESTAMP | Waktu dibuat |

### Tabel: `perizinan_kepulangan_keasramaan`
Menyimpan data perizinan kepulangan santri.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| nis | TEXT | NIS santri |
| nama_siswa | TEXT | Nama santri |
| kelas | TEXT | Kelas santri |
| asrama | TEXT | Asrama santri |
| cabang | TEXT | Cabang/lokasi |
| tanggal_pengajuan | DATE | Tanggal pengajuan |
| tanggal_mulai | DATE | Tanggal mulai izin |
| tanggal_selesai | DATE | Tanggal selesai izin |
| durasi_hari | INTEGER | Durasi (auto-calculated) |
| alasan | TEXT | Alasan izin |
| keperluan | TEXT | Detail keperluan |
| alamat_tujuan | TEXT | Alamat tujuan |
| no_hp_wali | TEXT | No HP wali/ortu |
| status | TEXT | Status approval |
| approved_by_kepas | TEXT | Nama Kepala Asrama |
| approved_at_kepas | TIMESTAMP | Waktu approval Kepas |
| catatan_kepas | TEXT | Catatan dari Kepas |
| approved_by_kepsek | TEXT | Nama Kepala Sekolah |
| approved_at_kepsek | TIMESTAMP | Waktu approval Kepsek |
| catatan_kepsek | TEXT | Catatan dari Kepsek |

### Status Flow
- `pending` → Menunggu approval Kepala Asrama
- `approved_kepas` → Disetujui Kepas, menunggu Kepsek
- `approved_kepsek` → Disetujui Kepsek (final)
- `rejected` → Ditolak (bisa di level Kepas atau Kepsek)

## 🚀 Setup & Instalasi

### 1. Setup Database

Jalankan SQL script di Supabase SQL Editor:

```bash
# File: SETUP_PERIZINAN_KEPULANGAN.sql
```

Script ini akan:
- Membuat tabel `token_perizinan_keasramaan`
- Membuat tabel `perizinan_kepulangan_keasramaan`
- Membuat trigger untuk auto-calculate durasi hari
- Insert token default

### 2. Verifikasi Tabel

```sql
-- Cek tabel token
SELECT * FROM token_perizinan_keasramaan;

-- Cek tabel perizinan
SELECT * FROM perizinan_kepulangan_keasramaan;
```

### 3. Update Middleware (Sudah dilakukan)

File `middleware.ts` sudah diupdate untuk mengizinkan akses public ke form perizinan.

### 4. Update Sidebar (Sudah dilakukan)

Menu "Perizinan" sudah ditambahkan di Sidebar dengan 3 submenu.

## 📱 Cara Penggunaan

### A. Untuk Admin/Kepala Asrama

#### 1. Buat Token Link

1. Login ke sistem
2. Buka menu **Perizinan → Kelola Link Perizinan**
3. Klik **"Buat Token Baru"**
4. Isi:
   - Nama Token: `Link Perizinan Semester Ganjil 2024/2025`
   - Keterangan: `Link untuk wali santri mengajukan izin kepulangan`
5. Klik **Simpan**
6. Copy link yang dihasilkan (klik icon copy)

#### 2. Bagikan Link ke Wali Santri

Contoh link yang dihasilkan:
```
https://portal-keasramaan.com/perizinan/kepulangan/form/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Bagikan via:
- WhatsApp Group Wali Santri
- Broadcast WhatsApp
- Email
- Website sekolah

#### 3. Approval Perizinan

**Untuk Kepala Asrama:**
1. Buka menu **Perizinan → Approval Perizinan**
2. Filter status: **"Menunggu Kepas"**
3. Klik icon detail untuk melihat informasi lengkap
4. Klik icon ✓ untuk **Setujui** atau ✗ untuk **Tolak**
5. Tambahkan catatan jika diperlukan
6. Klik **Simpan**

**Untuk Kepala Sekolah (Admin):**
1. Buka menu **Perizinan → Approval Perizinan**
2. Filter status: **"Menunggu Kepsek"**
3. Review perizinan yang sudah disetujui Kepas
4. Klik icon ✓ untuk **Setujui** atau ✗ untuk **Tolak**
5. Tambahkan catatan jika diperlukan
6. Klik **Simpan**

#### 4. Monitoring & Rekap

1. Buka menu **Perizinan → Rekap Perizinan**
2. Lihat statistik:
   - Total Izin
   - Izin Aktif
   - Terlambat Kembali
   - Menunggu Approval
3. Filter berdasarkan:
   - Cabang
   - Status
4. Lihat countdown dinamis:
   - **Biru**: Masih lama (>3 hari)
   - **Kuning**: Tinggal 1-3 hari
   - **Orange**: Hari ini
   - **Merah**: Terlambat
5. Export data ke CSV jika diperlukan

### B. Untuk Wali Santri

#### 1. Akses Form Perizinan

1. Buka link yang diberikan oleh sekolah
2. Pastikan link valid dan aktif

#### 2. Isi Formulir

1. **NIS Santri**: Masukkan NIS, data akan auto-fill
2. **Nama, Kelas, Asrama**: Otomatis terisi
3. **Tanggal Mulai**: Pilih tanggal mulai izin
4. **Tanggal Selesai**: Pilih tanggal selesai izin
5. **Alasan**: Jelaskan alasan (contoh: Keperluan keluarga)
6. **Keperluan Detail**: Jelaskan lebih detail
7. **Alamat Tujuan**: Alamat lengkap tujuan
8. **No HP Wali**: Nomor HP yang bisa dihubungi
9. Klik **"Kirim Permohonan Izin"**

#### 3. Konfirmasi Berhasil

Setelah submit, akan muncul halaman konfirmasi dengan:
- Detail permohonan
- Status: Menunggu Persetujuan
- Proses selanjutnya
- Tombol untuk ajukan izin lagi

#### 4. Follow Up

- Hubungi Kepala Asrama untuk konfirmasi
- Tunggu approval dari Kepala Asrama dan Kepala Sekolah
- Setelah disetujui, Kepala Asrama akan mencetak dokumen

## 🎨 Fitur Unggulan

### 1. Auto-Fill Data Siswa
Setelah input NIS, data siswa otomatis terisi dari database.

### 2. Auto-Calculate Durasi
Durasi hari otomatis dihitung dari tanggal mulai dan selesai.

### 3. Countdown Dinamis
Rekap menampilkan sisa hari secara real-time dengan color coding:
- Biru: Aman (>3 hari)
- Kuning: Perhatian (1-3 hari)
- Orange: Hari ini
- Merah: Terlambat

### 4. Multi-Level Approval
Approval bertingkat: Kepas → Kepsek

### 5. Export Data
Export rekap ke CSV untuk analisis lebih lanjut.

### 6. Token Management
Kelola multiple token untuk berbagai periode/keperluan.

## 🔐 Role & Permission

| Role | Kelola Link | Approval | Rekap | Form Public |
|------|-------------|----------|-------|-------------|
| Admin (Kepsek) | ✅ | ✅ (Level 2) | ✅ | ❌ |
| Kepala Asrama | ✅ | ✅ (Level 1) | ✅ | ❌ |
| Guru/Musyrif | ❌ | ❌ | ❌ | ❌ |
| Wali Santri | ❌ | ❌ | ❌ | ✅ (via token) |

## 📊 Monitoring & Reporting

### Dashboard Stats
- Total izin
- Izin aktif
- Terlambat kembali
- Menunggu approval

### Filter Options
- Filter by Cabang
- Filter by Status
- Filter by Date Range (coming soon)

### Export Options
- CSV Export
- PDF Export (coming soon)

## 🛠️ Troubleshooting

### Token Tidak Valid
**Masalah**: Link tidak bisa diakses
**Solusi**:
1. Cek apakah token masih aktif di menu Kelola Link
2. Pastikan link lengkap dan tidak terpotong
3. Generate token baru jika diperlukan

### Data Siswa Tidak Muncul
**Masalah**: Setelah input NIS, data tidak auto-fill
**Solusi**:
1. Pastikan NIS sudah terdaftar di database
2. Cek tabel `data_siswa_keasramaan`
3. Pastikan NIS diketik dengan benar

### Approval Tidak Muncul
**Masalah**: Tidak bisa approve perizinan
**Solusi**:
1. Cek role user (harus Kepas atau Admin)
2. Cek status perizinan (harus sesuai level approval)
3. Refresh halaman

### Countdown Tidak Akurat
**Masalah**: Sisa hari tidak sesuai
**Solusi**:
1. Cek timezone server
2. Refresh halaman
3. Verifikasi tanggal selesai di database

## 🔄 Update & Maintenance

### Update Token
```sql
-- Nonaktifkan token lama
UPDATE token_perizinan_keasramaan
SET is_active = false
WHERE id = 'token-id';

-- Atau via UI: Kelola Link → Toggle status
```

### Cleanup Data Lama
```sql
-- Hapus perizinan yang sudah selesai >1 tahun
DELETE FROM perizinan_kepulangan_keasramaan
WHERE tanggal_selesai < NOW() - INTERVAL '1 year'
AND status = 'approved_kepsek';
```

### Backup Data
```sql
-- Export perizinan per semester
SELECT * FROM perizinan_kepulangan_keasramaan
WHERE tanggal_pengajuan BETWEEN '2024-07-01' AND '2024-12-31'
ORDER BY tanggal_pengajuan DESC;
```

## 📝 Catatan Penting

1. **Token Security**: Jangan share token di tempat public
2. **Data Privacy**: Lindungi data pribadi santri dan wali
3. **Approval SLA**: Usahakan approve dalam 1x24 jam
4. **Follow Up**: Hubungi santri yang terlambat kembali
5. **Documentation**: Simpan dokumen fisik yang sudah ditandatangani

## 🎯 Roadmap

### Phase 2 (Coming Soon)
- [ ] Perizinan Harian
- [ ] Notifikasi WhatsApp otomatis
- [ ] Print dokumen perizinan
- [ ] QR Code untuk verifikasi
- [ ] Mobile app untuk wali santri
- [ ] Dashboard analytics
- [ ] Integration dengan sistem absensi

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Hubungi IT Support
2. Buka issue di repository
3. Email: support@hsi-boarding.com

---

**Dibuat dengan ❤️ untuk HSI Boarding School**
