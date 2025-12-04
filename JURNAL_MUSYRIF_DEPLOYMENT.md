# Jurnal Musyrif - Deployment Guide

## 📋 Checklist Deployment

### 1. Database Migration
```bash
# Jalankan migration SQL
# File: supabase/migrations/20241204_jurnal_musyrif.sql

# Via Supabase Dashboard:
# 1. Buka Supabase Dashboard
# 2. Pilih project Anda
# 3. Klik "SQL Editor"
# 4. Copy-paste isi file migration
# 5. Klik "Run"

# Via Supabase CLI (jika sudah setup):
supabase db push
```

### 2. Verifikasi Database
```bash
# Jalankan test script
# File: scripts/test-jurnal-musyrif-migration.sql

# Expected results:
# - 5 sesi (SESI 1-5)
# - ~30-35 jadwal
# - ~70-80 kegiatan
# - 6 indexes
```

### 3. File Structure
```
portal-keasramaan/
├── app/
│   ├── jurnal-musyrif/
│   │   ├── page.tsx                    # Landing page
│   │   ├── setup/
│   │   │   └── page.tsx                # Setup sesi/jadwal/kegiatan
│   │   ├── manage-link/
│   │   │   └── page.tsx                # Manage link musyrif
│   │   └── form/
│   │       └── [token]/
│   │           └── page.tsx            # Form input jurnal
│   └── overview/
│       └── jurnal-musyrif/
│           └── page.tsx                # Dashboard
├── components/
│   └── Sidebar.tsx                     # Updated with menu
├── supabase/
│   └── migrations/
│       └── 20241204_jurnal_musyrif.sql # Migration file
├── scripts/
│   └── test-jurnal-musyrif-migration.sql
└── docs/
    └── JURNAL_MUSYRIF.md               # Dokumentasi
```

### 4. Menu Navigation
Menu sudah ditambahkan di Sidebar:
- **Jurnal Musyrif** (parent menu)
  - Setup Jurnal
  - Manage Link
- **Dashboard Jurnal Musyrif** (di section Overview)

### 5. Testing Flow

#### A. Setup (Admin)
1. Login sebagai admin
2. Buka `/jurnal-musyrif/setup`
3. Verifikasi data seed sudah ada (5 sesi)
4. Test CRUD sesi/jadwal/kegiatan

#### B. Generate Link (Admin)
1. Buka `/jurnal-musyrif/manage-link`
2. Klik "Buat Link Baru"
3. Pilih musyrif dari dropdown
4. Klik "Buat Link"
5. Copy link yang dihasilkan

#### C. Input Jurnal (Musyrif)
1. Akses link yang sudah di-generate
2. Pilih tanggal, tahun ajaran, semester
3. Centang kegiatan yang terlaksana
4. Test "Select All" per sesi dan per jadwal
5. Isi catatan (opsional)
6. Klik "Simpan Jurnal Harian"

#### D. Monitor Dashboard (Admin/Kepala Asrama)
1. Buka `/overview/jurnal-musyrif`
2. Pilih periode tanggal
3. Lihat stats: total jurnal, musyrif aktif, completion rate
4. Lihat tabel performa musyrif

### 6. Fitur Utama

✅ **Setup Master Data**
- CRUD Sesi (nama, urutan, status)
- CRUD Jadwal (sesi, jam mulai-selesai, urutan)
- CRUD Kegiatan (jadwal, deskripsi, urutan)

✅ **Link Management**
- Generate link unik per musyrif
- Auto-fill data musyrif (cabang, kelas, asrama)
- Toggle aktif/nonaktif
- Copy link

✅ **Form Input dengan Select All**
- Checkbox per kegiatan
- Select All per sesi
- Select All per jadwal
- Textarea catatan per kegiatan
- Validasi input

✅ **Dashboard Monitoring**
- Total jurnal tercatat
- Musyrif aktif
- Completion rate
- Jurnal hari ini
- Ranking performa musyrif
- Filter periode

### 7. Data Seed Default

Migration sudah include data seed lengkap:
- **SESI 1**: 7 jadwal, ~15 kegiatan (03:30 - 06:30)
- **SESI 2**: 3 jadwal, ~13 kegiatan (05:30 - 07:45)
- **SESI 3**: 2 jadwal, ~10 kegiatan (10:00 - 12:30)
- **SESI 4**: 8 jadwal, ~20 kegiatan (15:00 - 18:00)
- **SESI 5**: 9 jadwal, ~20 kegiatan (18:15 - 22:00)

Total: **5 sesi, 29 jadwal, 78 kegiatan**

### 8. Role Access
Semua role bisa akses:
- ✅ Admin
- ✅ Kepala Sekolah
- ✅ Kepala Asrama
- ✅ Musyrif (via link)
- ✅ Guru

### 9. Known Issues / Limitations
- Belum ada export PDF/Excel
- Belum ada notifikasi reminder
- Dashboard belum ada grafik trend
- Belum ada filter by cabang/kelas/asrama di dashboard

### 10. Future Enhancements
- [ ] Export laporan ke PDF/Excel
- [ ] Email/WhatsApp reminder untuk musyrif
- [ ] Grafik trend completion rate
- [ ] Filter dashboard by cabang/kelas/asrama
- [ ] Bulk edit kegiatan
- [ ] Template jurnal (copy from previous day)

## 🚀 Ready to Deploy!

Semua file sudah siap. Tinggal:
1. Run migration SQL
2. Test flow lengkap
3. Deploy ke production

## 📞 Support
Jika ada issue, cek:
- Console browser untuk error
- Supabase logs untuk database error
- Network tab untuk API error

---
**Created**: December 4, 2024
**Version**: 1.0.0
**Status**: ✅ Ready for Production
