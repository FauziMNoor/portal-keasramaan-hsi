# 🚀 Quick Start - Perizinan Kepulangan

## Setup Database (5 menit)

1. Buka Supabase SQL Editor
2. Copy-paste isi file `SETUP_PERIZINAN_KEPULANGAN.sql`
3. Klik **Run**
4. Verifikasi: `SELECT * FROM token_perizinan_keasramaan;`

## Cara Pakai (Admin/Kepas)

### 1. Buat Link untuk Wali Santri
```
Menu: Perizinan → Kelola Link Perizinan
→ Klik "Buat Token Baru"
→ Isi nama & keterangan
→ Copy link yang dihasilkan
→ Share ke wali santri via WhatsApp
```

### 2. Approval Perizinan
```
Menu: Perizinan → Approval Perizinan

Kepala Asrama:
→ Filter: "Menunggu Kepas"
→ Review & Approve/Reject

Kepala Sekolah:
→ Filter: "Menunggu Kepsek"
→ Review & Approve/Reject
```

### 3. Monitoring
```
Menu: Perizinan → Rekap Perizinan
→ Lihat countdown dinamis
→ Filter by cabang/status
→ Export CSV jika perlu
```

## Cara Pakai (Wali Santri)

1. Buka link dari sekolah
2. Isi NIS → data auto-fill
3. Isi tanggal & alasan
4. Submit
5. Tunggu approval

## Status Flow

```
Pending → Approved Kepas → Approved Kepsek → Selesai
         ↓                ↓
      Rejected         Rejected
```

## Color Code Countdown

- 🔵 **Biru**: Masih lama (>3 hari)
- 🟡 **Kuning**: Tinggal 1-3 hari
- 🟠 **Orange**: Hari ini
- 🔴 **Merah**: Terlambat kembali

## Troubleshooting

**Token tidak valid?**
→ Cek status aktif di Kelola Link

**Data siswa tidak muncul?**
→ Pastikan NIS sudah terdaftar

**Tidak bisa approve?**
→ Cek role & status perizinan

---

Lihat dokumentasi lengkap: `PANDUAN_PERIZINAN_KEPULANGAN.md`
