# 📋 Sistem Perizinan Kepulangan

## ✨ Fitur Utama

Sistem lengkap untuk mengelola izin kepulangan santri dengan:

✅ **Form Public untuk Wali Santri** (via token link)  
✅ **Multi-Level Approval** (Kepala Asrama → Kepala Sekolah)  
✅ **Countdown Dinamis** (monitoring sisa waktu real-time)  
✅ **Auto-Calculate Durasi** (otomatis hitung jumlah hari)  
✅ **Export to CSV** (untuk reporting)  
✅ **Token Management** (kelola multiple link)  

## 🎯 Alur Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                    ALUR PERIZINAN KEPULANGAN                │
└─────────────────────────────────────────────────────────────┘

1️⃣  WALI SANTRI
    ↓ Akses form via link token
    ↓ Isi formulir izin kepulangan
    ↓ Submit permohonan
    
2️⃣  KEPALA ASRAMA
    ↓ Review permohonan
    ↓ Approve/Reject dengan catatan
    
3️⃣  KEPALA SEKOLAH
    ↓ Review permohonan yang sudah disetujui Kepas
    ↓ Approve/Reject dengan catatan
    
4️⃣  KEPALA ASRAMA
    ↓ Cetak dokumen perizinan
    ↓ Tanda tangan santri & Kepas
    ↓ Mengetahui Kepsek
    
5️⃣  MONITORING
    ↓ Rekap dengan countdown dinamis
    ↓ Track santri yang belum kembali
    ↓ Export data untuk laporan
```

## 📂 Struktur Menu

```
Perizinan
├── Kelola Link Perizinan    → Buat & kelola token link
├── Approval Perizinan        → Approve/reject permohonan
└── Rekap Perizinan          → Monitoring dengan countdown
```

## 🗄️ Database Tables

### 1. `token_perizinan_keasramaan`
Token untuk akses public form perizinan.

### 2. `perizinan_kepulangan_keasramaan`
Data perizinan dengan approval tracking.

## 🚀 Quick Setup

### Step 1: Setup Database
```sql
-- Jalankan di Supabase SQL Editor
-- File: SETUP_PERIZINAN_KEPULANGAN.sql
```

### Step 2: Buat Token Link
1. Login sebagai Admin/Kepas
2. Menu: **Perizinan → Kelola Link Perizinan**
3. Klik **"Buat Token Baru"**
4. Copy link & share ke wali santri

### Step 3: Wali Santri Mengisi Form
1. Buka link dari sekolah
2. Input NIS (data auto-fill)
3. Isi tanggal & alasan
4. Submit

### Step 4: Approval
**Kepala Asrama:**
- Menu: **Perizinan → Approval Perizinan**
- Filter: "Menunggu Kepas"
- Review & Approve/Reject

**Kepala Sekolah:**
- Menu: **Perizinan → Approval Perizinan**
- Filter: "Menunggu Kepsek"
- Review & Approve/Reject

### Step 5: Monitoring
- Menu: **Perizinan → Rekap Perizinan**
- Lihat countdown dinamis
- Export CSV jika perlu

## 🎨 Fitur Detail

### 1. Form Wali Santri
- ✅ Auto-fill data siswa dari NIS
- ✅ Validasi tanggal
- ✅ Halaman konfirmasi setelah submit
- ✅ Responsive mobile-friendly

### 2. Token Management
- ✅ Generate token otomatis
- ✅ Copy link dengan 1 klik
- ✅ Toggle aktif/nonaktif
- ✅ Multiple token support

### 3. Approval System
- ✅ Multi-level approval (Kepas → Kepsek)
- ✅ Tambah catatan saat approve/reject
- ✅ Filter by status
- ✅ View detail lengkap

### 4. Rekap & Monitoring
- ✅ Countdown dinamis dengan color coding
- ✅ Stats cards (Total, Aktif, Terlambat, Menunggu)
- ✅ Filter by cabang & status
- ✅ Export to CSV
- ✅ Highlight santri terlambat

## 🎨 Color Code Countdown

| Warna | Status | Keterangan |
|-------|--------|------------|
| 🔵 Biru | Aman | Masih ada waktu >3 hari |
| 🟡 Kuning | Perhatian | Tinggal 1-3 hari lagi |
| 🟠 Orange | Urgent | Hari ini adalah hari terakhir |
| 🔴 Merah | Terlambat | Sudah melewati tanggal selesai |

## 🔐 Role & Access

| Fitur | Admin | Kepala Asrama | Guru/Musyrif | Wali Santri |
|-------|-------|---------------|--------------|-------------|
| Kelola Link | ✅ | ✅ | ❌ | ❌ |
| Approval Level 1 (Kepas) | ❌ | ✅ | ❌ | ❌ |
| Approval Level 2 (Kepsek) | ✅ | ❌ | ❌ | ❌ |
| Rekap | ✅ | ✅ | ❌ | ❌ |
| Form Public | ❌ | ❌ | ❌ | ✅ (via token) |

## 📊 Status Flow

```
pending
  ↓ (Kepala Asrama Approve)
approved_kepas
  ↓ (Kepala Sekolah Approve)
approved_kepsek ✅
  
  ↓ (Reject di level manapun)
rejected ❌
```

## 🛠️ Troubleshooting

### Token tidak valid
**Solusi**: Cek status aktif di menu Kelola Link

### Data siswa tidak muncul
**Solusi**: Pastikan NIS sudah terdaftar di `data_siswa_keasramaan`

### Tidak bisa approve
**Solusi**: 
- Cek role user (Kepas atau Admin)
- Cek status perizinan sesuai level approval

### Countdown tidak akurat
**Solusi**: Refresh halaman atau cek timezone server

## 📝 Best Practices

1. **Token Management**
   - Buat token baru setiap semester
   - Nonaktifkan token lama
   - Gunakan nama token yang jelas

2. **Approval**
   - Review dalam 1x24 jam
   - Berikan catatan yang jelas
   - Koordinasi dengan Kepas/Kepsek

3. **Monitoring**
   - Cek rekap setiap hari
   - Follow up santri terlambat
   - Export data untuk laporan bulanan

4. **Data Privacy**
   - Jangan share token di tempat public
   - Lindungi data pribadi santri
   - Backup data secara berkala

## 📚 Dokumentasi Lengkap

- **Setup Guide**: `SETUP_PERIZINAN_KEPULANGAN.sql`
- **Panduan Lengkap**: `PANDUAN_PERIZINAN_KEPULANGAN.md`
- **Quick Start**: `QUICK_START_PERIZINAN.md`

## 🎯 Roadmap Phase 2

- [ ] Perizinan Harian
- [ ] Notifikasi WhatsApp otomatis
- [ ] Print dokumen perizinan (PDF)
- [ ] QR Code untuk verifikasi
- [ ] Mobile app untuk wali santri
- [ ] Dashboard analytics
- [ ] Integration dengan absensi

## 📞 Support

Jika ada pertanyaan atau masalah, hubungi IT Support atau buka issue di repository.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Dibuat untuk**: HSI Boarding School
