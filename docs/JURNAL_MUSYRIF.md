# Jurnal Musyrif - Dokumentasi

## Overview
Sistem Jurnal Musyrif adalah fitur untuk mencatat dan memonitor aktivitas harian musyrif dalam membimbing santri dari pagi hingga malam.

## Fitur Utama

### 1. Setup Jurnal (`/jurnal-musyrif/setup`)
Halaman untuk mengelola master data jurnal:
- **Sesi**: Kelola sesi jurnal (SESI 1, SESI 2, dst)
- **Jadwal**: Kelola jadwal waktu per sesi (jam mulai - jam selesai)
- **Kegiatan**: Kelola deskripsi kegiatan per jadwal

### 2. Manage Link (`/jurnal-musyrif/manage-link`)
Halaman untuk mengelola link akses musyrif:
- Generate link unik untuk setiap musyrif
- Link otomatis terisi data musyrif (cabang, kelas, asrama)
- Toggle aktif/nonaktif link
- Copy link untuk dibagikan ke musyrif

### 3. Form Input Jurnal (`/jurnal-musyrif/form/[token]`)
Halaman input jurnal harian untuk musyrif (via link):
- Tampil semua sesi, jadwal, dan kegiatan dari setup
- Checkbox untuk setiap kegiatan (terlaksana/tidak)
- Textarea untuk catatan tambahan per kegiatan
- **Select All** per sesi dan per jadwal
- Validasi tanggal, tahun ajaran, semester

### 4. Dashboard (`/overview/jurnal-musyrif`)
Dashboard monitoring jurnal musyrif:
- Total jurnal tercatat
- Jumlah musyrif aktif
- Completion rate kegiatan
- Jurnal hari ini
- Tabel performa musyrif (ranking berdasarkan completion rate)
- Filter berdasarkan periode tanggal

## Database Schema

### Tabel: `sesi_jurnal_musyrif`
- `id` (UUID, PK)
- `nama_sesi` (VARCHAR) - Contoh: "SESI 1"
- `urutan` (INTEGER)
- `status` (VARCHAR) - 'aktif' atau 'nonaktif'

### Tabel: `jadwal_jurnal_musyrif`
- `id` (UUID, PK)
- `sesi_id` (UUID, FK → sesi_jurnal_musyrif)
- `jam_mulai` (TIME)
- `jam_selesai` (TIME)
- `urutan` (INTEGER)

### Tabel: `kegiatan_jurnal_musyrif`
- `id` (UUID, PK)
- `jadwal_id` (UUID, FK → jadwal_jurnal_musyrif)
- `deskripsi_kegiatan` (TEXT)
- `urutan` (INTEGER)

### Tabel: `token_jurnal_musyrif`
- `id` (UUID, PK)
- `token` (VARCHAR, UNIQUE)
- `nama_musyrif` (VARCHAR)
- `cabang` (VARCHAR)
- `kelas` (VARCHAR)
- `asrama` (VARCHAR)
- `is_active` (BOOLEAN)

### Tabel: `formulir_jurnal_musyrif`
- `id` (UUID, PK)
- `tanggal` (DATE)
- `nama_musyrif` (VARCHAR)
- `cabang` (VARCHAR)
- `kelas` (VARCHAR)
- `asrama` (VARCHAR)
- `tahun_ajaran` (VARCHAR)
- `semester` (VARCHAR)
- `sesi_id` (UUID, FK)
- `jadwal_id` (UUID, FK)
- `kegiatan_id` (UUID, FK)
- `status_terlaksana` (BOOLEAN)
- `catatan` (TEXT)

## Migration
File migration: `supabase/migrations/20241204_jurnal_musyrif.sql`

Untuk menjalankan migration:
```bash
# Via Supabase CLI
supabase db push

# Atau manual via Supabase Dashboard
# Copy-paste isi file SQL ke SQL Editor
```

## Flow Penggunaan

1. **Admin** setup sesi, jadwal, dan kegiatan di `/jurnal-musyrif/setup`
2. **Admin** generate link untuk musyrif di `/jurnal-musyrif/manage-link`
3. **Admin** bagikan link ke musyrif via WhatsApp/Email
4. **Musyrif** akses link dan input jurnal harian
5. **Admin/Kepala Asrama** monitor di dashboard `/overview/jurnal-musyrif`

## Fitur Select All
- **Select All Sesi**: Centang semua kegiatan dalam 1 sesi
- **Select All Jadwal**: Centang semua kegiatan dalam 1 jadwal waktu
- Memudahkan input jika semua kegiatan terlaksana

## Catatan
- Data seed default sudah include 5 sesi dengan jadwal dan kegiatan lengkap
- Link bersifat reusable (bisa digunakan berkali-kali)
- Data jurnal tersimpan per kegiatan (granular tracking)
- Dashboard menghitung completion rate otomatis

## TODO / Future Enhancement
- Export laporan jurnal ke PDF/Excel
- Notifikasi reminder untuk musyrif yang belum input
- Grafik trend completion rate per musyrif
- Filter dashboard by cabang/kelas/asrama
