# 📖 User Guide - Jadwal Libur & Cuti Musyrif

## 🎯 Overview

Sistem Jadwal Libur & Cuti membantu Anda mengelola:
- Jadwal libur rutin musyrif (Sabtu-Ahad, 2 pekan sekali)
- Pengajuan cuti tahunan (12 hari/tahun)
- Pengajuan sakit dan izin
- Approval workflow (2 level: Kepala Asrama → Kepala Sekolah)

---

## 👥 User Roles

### 1. Admin / Kepala Asrama
- Generate jadwal libur rutin
- Ajukan cuti/izin untuk musyrif
- Approve/reject pengajuan (level 1)
- Lihat semua jadwal libur

### 2. Kepala Sekolah
- Approve/reject pengajuan (level 2 - final)
- Lihat semua jadwal libur

### 3. Musyrif
- Lihat jadwal libur sendiri
- Ajukan cuti/izin (jika ada akses)

---

## 📋 Halaman Jadwal Libur

**URL:** `/manajemen-data/jadwal-libur-musyrif`

### Fitur Utama

#### 1. Filter Jadwal
- **Cabang:** Pilih Pusat atau Sukabumi
- **Bulan:** Pilih bulan (1-12)
- **Tahun:** Pilih tahun (2024, 2025)
- **Musyrif:** (Optional) Filter by nama musyrif

#### 2. Generate Jadwal Rutin

**Langkah-langkah:**
1. Klik tombol **"Generate Jadwal Rutin"**
2. Pilih **Cabang**, **Bulan**, **Tahun**
3. Klik **"Generate"**
4. Sistem akan:
   - Fetch semua musyrif aktif di cabang
   - Bagi musyrif menjadi 2 grup (random)
   - Generate jadwal Sabtu-Ahad untuk 4 minggu
   - Grup 1 libur di minggu ganjil (minggu 1, 3)
   - Grup 2 libur di minggu genap (minggu 2, 4)
   - Auto-assign musyrif pengganti
5. Jadwal langsung approved (status: approved_kepala_sekolah)

**Contoh Output:**
```
✅ Berhasil generate 16 jadwal libur rutin
```

**Tips:**
- Generate di awal bulan untuk bulan berjalan
- Jika sudah ada jadwal, sistem akan menambahkan (tidak replace)
- Musyrif pengganti dipilih dari grup lain secara otomatis

---

#### 3. Ajukan Cuti/Izin

**Langkah-langkah:**
1. Klik tombol **"Ajukan Cuti/Izin"**
2. Isi form:
   - **Cabang:** Pilih cabang
   - **Musyrif:** Pilih musyrif yang akan cuti/izin
   - **Jenis:** Pilih Cuti, Sakit, atau Izin
   - **Tanggal Mulai:** Pilih tanggal mulai
   - **Tanggal Selesai:** Pilih tanggal selesai
   - **Musyrif Pengganti:** (Optional) Pilih pengganti
   - **Keterangan:** Isi alasan cuti/izin
3. Klik **"Ajukan"**
4. Pengajuan akan masuk ke status **"Pending"**
5. Menunggu approval dari Kepala Asrama

**Validasi:**
- Jika jenis = **Cuti**, sistem akan cek sisa cuti
- Jika sisa cuti tidak cukup, pengajuan ditolak
- Sistem akan display sisa cuti di modal

**Contoh:**
```
Sisa Cuti: 9 hari
```

---

#### 4. Lihat Jadwal Libur

**Table Columns:**
- **Musyrif:** Nama musyrif
- **Asrama:** Asrama yang dijaga
- **Tanggal:** Tanggal mulai - tanggal selesai
- **Jenis:** Badge (Rutin, Cuti, Sakit, Izin)
- **Pengganti:** Nama musyrif pengganti
- **Status:** Badge (Pending, Approved, Rejected)
- **Aksi:** Tombol Hapus

**Status Badges:**
- 🟡 **Pending:** Menunggu approval
- 🔵 **Approved Kepala Asrama:** Sudah di-approve level 1
- 🟢 **Approved:** Sudah di-approve final (level 2)
- 🔴 **Rejected:** Ditolak

**Jenis Libur Badges:**
- 🟣 **Rutin:** Libur rutin (Sabtu-Ahad)
- 🔵 **Cuti:** Cuti tahunan
- 🟠 **Sakit:** Sakit
- 🔷 **Izin:** Izin

---

#### 5. Hapus Jadwal

**Langkah-langkah:**
1. Klik tombol **"Hapus"** di kolom Aksi
2. Konfirmasi penghapusan
3. Jadwal akan dihapus dari database

**Catatan:**
- Hanya admin yang bisa hapus jadwal
- Hati-hati menghapus jadwal yang sudah approved

---

## ✅ Halaman Approval Cuti

**URL:** `/approval/cuti-musyrif`

### Fitur Utama

#### 1. Filter Pengajuan
- **Status:** Pilih status (Pending, Approved, Rejected)
- **Cabang:** Pilih cabang

#### 2. Lihat Detail Pengajuan

**Card Display:**
- **Musyrif:** Nama & asrama
- **Tanggal:** Tanggal mulai - selesai (X hari)
- **Jenis:** Badge (Cuti, Sakit, Izin)
- **Pengganti:** Nama musyrif pengganti
- **Keterangan:** Alasan cuti/izin
- **Status:** Badge dengan icon

---

#### 3. Approve Pengajuan (Kepala Asrama)

**Langkah-langkah:**
1. Lihat pengajuan dengan status **"Pending"**
2. Klik tombol **"Approve (Kepala Asrama)"**
3. Konfirmasi approval
4. Status berubah menjadi **"Approved Kepala Asrama"**
5. Pengajuan diteruskan ke Kepala Sekolah

**Catatan:**
- Hanya pengajuan dengan status "Pending" yang bisa di-approve
- Setelah approve, pengajuan tidak bisa di-cancel

---

#### 4. Approve Pengajuan (Kepala Sekolah)

**Langkah-langkah:**
1. Lihat pengajuan dengan status **"Approved Kepala Asrama"**
2. Klik tombol **"Approve (Kepala Sekolah)"**
3. Konfirmasi approval
4. Status berubah menjadi **"Approved"** (final)
5. Sistem akan:
   - Update cuti terpakai (jika jenis = cuti)
   - Update sisa cuti
   - Jadwal libur aktif

**Contoh:**
```
Jatah Cuti: 12 hari
Cuti Terpakai: 3 hari → 6 hari (setelah approve 3 hari cuti)
Sisa Cuti: 9 hari → 6 hari
```

---

#### 5. Reject Pengajuan

**Langkah-langkah:**
1. Klik tombol **"Tolak"**
2. Isi **Alasan Penolakan** di modal
3. Klik **"Tolak Pengajuan"**
4. Status berubah menjadi **"Rejected"**
5. Musyrif akan melihat alasan penolakan

**Contoh Alasan:**
```
Sisa cuti tidak mencukupi. Silakan ajukan izin atau reschedule.
```

**Catatan:**
- Alasan penolakan wajib diisi
- Pengajuan yang ditolak tidak bisa di-approve lagi
- Musyrif harus ajukan ulang jika ingin cuti/izin

---

## 📊 Ketentuan Libur

### 1. Libur Rutin
- **Frekuensi:** 2 pekan sekali
- **Durasi:** Sabtu-Ahad (2 hari)
- **Sistem:** Bergantian (2 grup)
- **Status:** Langsung approved
- **KPI:** Tidak mengurangi score

### 2. Cuti Tahunan
- **Jatah:** 12 hari per tahun
- **Approval:** 2 level (Kepala Asrama → Kepala Sekolah)
- **Validasi:** Cek sisa cuti
- **KPI:** Tidak mengurangi score

### 3. Sakit
- **Jatah:** Tidak terbatas (sesuai kebutuhan)
- **Approval:** 2 level
- **Dokumen:** Surat keterangan sakit (optional)
- **KPI:** Tidak mengurangi score

### 4. Izin
- **Jatah:** Tidak terbatas (sesuai kebutuhan)
- **Approval:** 2 level
- **Alasan:** Wajib diisi
- **KPI:** Tidak mengurangi score

---

## 🔄 Workflow Approval

```
1. Musyrif Ajukan Cuti/Izin
   ↓
2. Status: Pending
   ↓
3. Kepala Asrama Review
   ↓
   ├─ Approve → Status: Approved Kepala Asrama
   │              ↓
   │           4. Kepala Sekolah Review
   │              ↓
   │              ├─ Approve → Status: Approved (Final)
   │              │              ↓
   │              │           5. Cuti Terpakai Updated
   │              │              ↓
   │              │           6. Jadwal Libur Aktif
   │              │
   │              └─ Reject → Status: Rejected
   │
   └─ Reject → Status: Rejected
```

---

## ❓ FAQ

### Q1: Bagaimana cara generate jadwal libur untuk bulan depan?
**A:** Pilih bulan depan di form Generate Jadwal Rutin, lalu klik Generate.

### Q2: Apakah bisa edit jadwal libur yang sudah di-generate?
**A:** Saat ini belum ada fitur edit. Anda bisa hapus jadwal lalu generate ulang.

### Q3: Bagaimana jika sisa cuti tidak cukup?
**A:** Sistem akan menolak pengajuan. Musyrif bisa ajukan izin sebagai alternatif.

### Q4: Apakah bisa approve pengajuan tanpa musyrif pengganti?
**A:** Ya, musyrif pengganti bersifat optional. Tapi disarankan untuk diisi.

### Q5: Bagaimana cara cek sisa cuti musyrif?
**A:** Saat ajukan cuti, sistem akan otomatis display sisa cuti di modal.

### Q6: Apakah hari libur mengurangi score KPI?
**A:** Tidak. Hari libur (rutin, cuti, sakit, izin) tidak mengurangi score KPI. Sistem akan exclude hari libur dari perhitungan.

### Q7: Bagaimana jika musyrif sakit mendadak?
**A:** Ajukan sakit dengan tanggal hari ini. Kepala Asrama bisa langsung approve.

### Q8: Apakah bisa cancel pengajuan yang sudah di-submit?
**A:** Saat ini belum ada fitur cancel. Hubungi admin untuk hapus pengajuan.

---

## 🐛 Troubleshooting

### Issue 1: Tidak bisa generate jadwal rutin
**Solusi:**
- Pastikan ada musyrif aktif di cabang
- Cek koneksi database
- Refresh halaman dan coba lagi

### Issue 2: Sisa cuti tidak muncul
**Solusi:**
- Pastikan musyrif sudah dipilih
- Pastikan jenis = "Cuti"
- Refresh halaman

### Issue 3: Pengajuan tidak muncul di halaman approval
**Solusi:**
- Cek filter status (pilih "Pending")
- Cek filter cabang
- Refresh halaman

### Issue 4: Tidak bisa approve pengajuan
**Solusi:**
- Pastikan status = "Pending" (untuk Kepala Asrama)
- Pastikan status = "Approved Kepala Asrama" (untuk Kepala Sekolah)
- Cek role user (harus Kepala Asrama atau Kepala Sekolah)

---

## 📞 Support

Jika ada pertanyaan atau issue, hubungi:
- **IT Support:** [email/phone]
- **Admin Keasramaan:** [email/phone]

---

**Version:** 1.0.0  
**Last Updated:** December 10, 2024  
**Status:** ✅ Ready for Use
