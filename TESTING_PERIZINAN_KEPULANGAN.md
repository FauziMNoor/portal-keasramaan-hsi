# ✅ Testing Checklist - Perizinan Kepulangan

## 🗄️ Database Setup

- [ ] Jalankan `SETUP_PERIZINAN_KEPULANGAN.sql` di Supabase
- [ ] Verifikasi tabel `token_perizinan_keasramaan` terbuat
- [ ] Verifikasi tabel `perizinan_kepulangan_keasramaan` terbuat
- [ ] Verifikasi trigger `calculate_durasi_hari` berfungsi
- [ ] Verifikasi token default ter-insert

```sql
-- Test query
SELECT * FROM token_perizinan_keasramaan;
SELECT * FROM perizinan_kepulangan_keasramaan;
```

## 🔗 Token Management

### Buat Token Baru
- [ ] Login sebagai Admin/Kepala Asrama
- [ ] Buka menu **Perizinan → Kelola Link Perizinan**
- [ ] Klik **"Buat Token Baru"**
- [ ] Isi nama token: "Test Token Perizinan"
- [ ] Isi keterangan: "Token untuk testing"
- [ ] Klik **Simpan**
- [ ] Verifikasi token muncul di list
- [ ] Verifikasi token 32 karakter
- [ ] Verifikasi status "Aktif"

### Copy Link
- [ ] Klik icon copy pada token
- [ ] Verifikasi muncul checkmark hijau
- [ ] Paste link di browser baru
- [ ] Verifikasi format: `/perizinan/kepulangan/form/[token]`

### Toggle Status
- [ ] Klik badge "Aktif" untuk nonaktifkan
- [ ] Verifikasi berubah jadi "Nonaktif"
- [ ] Akses link dengan token nonaktif
- [ ] Verifikasi muncul error "Token Tidak Valid"
- [ ] Aktifkan kembali token
- [ ] Verifikasi link bisa diakses lagi

### Hapus Token
- [ ] Klik icon trash pada token
- [ ] Verifikasi muncul konfirmasi
- [ ] Klik OK
- [ ] Verifikasi token terhapus dari list

## 📝 Form Wali Santri

### Akses Form
- [ ] Buka link token yang aktif
- [ ] Verifikasi halaman form terbuka
- [ ] Verifikasi tampilan responsive di mobile
- [ ] Verifikasi semua field muncul

### Input Data
- [ ] Input NIS yang valid
- [ ] Tab/blur dari field NIS
- [ ] Verifikasi nama siswa auto-fill
- [ ] Verifikasi kelas auto-fill
- [ ] Verifikasi asrama auto-fill
- [ ] Verifikasi cabang auto-fill

### Input NIS Invalid
- [ ] Input NIS yang tidak terdaftar
- [ ] Tab/blur dari field NIS
- [ ] Verifikasi muncul alert "NIS tidak ditemukan"

### Validasi Form
- [ ] Kosongkan NIS, coba submit
- [ ] Verifikasi muncul error "Mohon isi NIS"
- [ ] Isi tanggal selesai < tanggal mulai
- [ ] Verifikasi muncul error validasi tanggal
- [ ] Kosongkan field required lainnya
- [ ] Verifikasi tidak bisa submit

### Submit Form
- [ ] Isi semua field dengan benar
- [ ] Klik **"Kirim Permohonan Izin"**
- [ ] Verifikasi loading state muncul
- [ ] Verifikasi redirect ke halaman konfirmasi
- [ ] Verifikasi detail permohonan ditampilkan
- [ ] Verifikasi status "Menunggu Persetujuan"
- [ ] Verifikasi durasi hari ter-calculate otomatis

### Halaman Konfirmasi
- [ ] Verifikasi icon checkmark hijau muncul
- [ ] Verifikasi detail lengkap ditampilkan
- [ ] Verifikasi proses selanjutnya dijelaskan
- [ ] Klik **"Ajukan Izin Lagi"**
- [ ] Verifikasi kembali ke form kosong

## ✅ Approval - Kepala Asrama

### Login & Akses
- [ ] Login sebagai Kepala Asrama
- [ ] Buka menu **Perizinan → Approval Perizinan**
- [ ] Verifikasi halaman approval terbuka

### Filter & List
- [ ] Klik filter "Menunggu Kepas"
- [ ] Verifikasi hanya tampil status pending
- [ ] Verifikasi data perizinan muncul di tabel
- [ ] Verifikasi badge status kuning "Menunggu Kepas"

### View Detail
- [ ] Klik icon detail (FileText)
- [ ] Verifikasi modal detail terbuka
- [ ] Verifikasi semua data lengkap ditampilkan
- [ ] Klik **Tutup**
- [ ] Verifikasi modal tertutup

### Approve Perizinan
- [ ] Klik icon checkmark hijau
- [ ] Verifikasi modal terbuka
- [ ] Tambahkan catatan: "Disetujui"
- [ ] Klik **Setujui**
- [ ] Verifikasi muncul alert "berhasil disetujui"
- [ ] Verifikasi status berubah jadi "Menunggu Kepsek"
- [ ] Verifikasi badge biru muncul

### Reject Perizinan
- [ ] Buat perizinan baru via form
- [ ] Klik icon X merah
- [ ] Verifikasi modal terbuka
- [ ] Tambahkan catatan: "Alasan tidak jelas"
- [ ] Klik **Tolak**
- [ ] Verifikasi muncul alert "berhasil ditolak"
- [ ] Verifikasi status berubah jadi "Ditolak"
- [ ] Verifikasi badge merah muncul

## ✅ Approval - Kepala Sekolah

### Login & Akses
- [ ] Login sebagai Admin (Kepsek)
- [ ] Buka menu **Perizinan → Approval Perizinan**
- [ ] Verifikasi halaman approval terbuka

### Filter & List
- [ ] Klik filter "Menunggu Kepsek"
- [ ] Verifikasi hanya tampil status approved_kepas
- [ ] Verifikasi data yang sudah disetujui Kepas muncul

### Approve Perizinan
- [ ] Klik icon checkmark hijau
- [ ] Tambahkan catatan: "Disetujui Kepsek"
- [ ] Klik **Setujui**
- [ ] Verifikasi status berubah jadi "Disetujui"
- [ ] Verifikasi badge hijau muncul

### Reject Perizinan
- [ ] Buat perizinan baru & approve di level Kepas
- [ ] Login sebagai Kepsek
- [ ] Klik icon X merah
- [ ] Tambahkan catatan: "Tidak disetujui"
- [ ] Klik **Tolak**
- [ ] Verifikasi status berubah jadi "Ditolak"

## 📊 Rekap & Monitoring

### Akses Rekap
- [ ] Login sebagai Admin/Kepala Asrama
- [ ] Buka menu **Perizinan → Rekap Perizinan**
- [ ] Verifikasi halaman rekap terbuka

### Stats Cards
- [ ] Verifikasi card "Total Izin" menampilkan jumlah benar
- [ ] Verifikasi card "Aktif" menampilkan izin yang belum selesai
- [ ] Verifikasi card "Terlambat" menampilkan izin overdue
- [ ] Verifikasi card "Menunggu" menampilkan pending approval

### Filter
- [ ] Test filter "Semua Cabang"
- [ ] Test filter cabang spesifik
- [ ] Verifikasi data ter-filter dengan benar
- [ ] Test filter status
- [ ] Verifikasi kombinasi filter cabang + status

### Countdown Dinamis
- [ ] Buat perizinan dengan tanggal selesai besok
- [ ] Verifikasi badge kuning "1 hari lagi"
- [ ] Buat perizinan dengan tanggal selesai hari ini
- [ ] Verifikasi badge orange "Hari ini"
- [ ] Buat perizinan dengan tanggal selesai kemarin
- [ ] Verifikasi badge merah "Terlambat 1 hari"
- [ ] Buat perizinan dengan tanggal selesai 5 hari lagi
- [ ] Verifikasi badge biru "5 hari lagi"

### Export CSV
- [ ] Klik **"Export CSV"**
- [ ] Verifikasi file CSV ter-download
- [ ] Buka file CSV
- [ ] Verifikasi semua kolom ada
- [ ] Verifikasi data sesuai dengan tabel
- [ ] Verifikasi format tanggal benar
- [ ] Verifikasi sisa hari ter-calculate

### Table Display
- [ ] Verifikasi semua kolom ditampilkan
- [ ] Verifikasi sorting by tanggal mulai
- [ ] Verifikasi hover effect pada row
- [ ] Verifikasi responsive di mobile
- [ ] Verifikasi scroll horizontal jika perlu

## 🔐 Role & Permission

### Admin (Kepsek)
- [ ] Bisa akses Kelola Link
- [ ] Bisa approve level 2 (Kepsek)
- [ ] Tidak bisa approve level 1 (Kepas)
- [ ] Bisa akses Rekap

### Kepala Asrama
- [ ] Bisa akses Kelola Link
- [ ] Bisa approve level 1 (Kepas)
- [ ] Tidak bisa approve level 2 (Kepsek)
- [ ] Bisa akses Rekap

### Guru/Musyrif
- [ ] Tidak bisa akses menu Perizinan
- [ ] Redirect ke home jika akses langsung

### Wali Santri (Public)
- [ ] Bisa akses form via token
- [ ] Tidak bisa akses menu internal
- [ ] Tidak perlu login

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Test di desktop (1920x1080)
- [ ] Test di tablet (768x1024)
- [ ] Test di mobile (375x667)
- [ ] Verifikasi semua element responsive
- [ ] Verifikasi tidak ada horizontal scroll

### Loading States
- [ ] Verifikasi loading spinner saat fetch data
- [ ] Verifikasi loading text saat submit form
- [ ] Verifikasi disabled state saat loading

### Error Handling
- [ ] Test dengan internet mati
- [ ] Verifikasi error message muncul
- [ ] Test dengan token invalid
- [ ] Verifikasi error page muncul

### Accessibility
- [ ] Test keyboard navigation
- [ ] Test screen reader (jika ada)
- [ ] Verifikasi contrast ratio
- [ ] Verifikasi focus states

## 🔄 Integration Testing

### Database Trigger
- [ ] Insert perizinan manual via SQL
- [ ] Verifikasi durasi_hari ter-calculate otomatis
```sql
INSERT INTO perizinan_kepulangan_keasramaan 
(nis, nama_siswa, tanggal_mulai, tanggal_selesai, alasan, keperluan, alamat_tujuan, no_hp_wali)
VALUES ('12345', 'Test Santri', '2025-01-01', '2025-01-05', 'Test', 'Test', 'Test', '08123456789');

SELECT durasi_hari FROM perizinan_kepulangan_keasramaan WHERE nis = '12345';
-- Expected: 5
```

### Middleware
- [ ] Akses form tanpa login
- [ ] Verifikasi bisa akses (public route)
- [ ] Akses approval tanpa login
- [ ] Verifikasi redirect ke login

### Auto-fill Data
- [ ] Test dengan NIS yang ada
- [ ] Verifikasi semua field terisi
- [ ] Test dengan NIS yang tidak ada
- [ ] Verifikasi alert muncul

## 📊 Performance Testing

### Load Time
- [ ] Measure page load time < 3 detik
- [ ] Measure form submit time < 2 detik
- [ ] Measure approval action time < 1 detik

### Data Volume
- [ ] Test dengan 100+ perizinan
- [ ] Verifikasi table masih smooth
- [ ] Test filter dengan banyak data
- [ ] Verifikasi export CSV dengan banyak data

## 🐛 Bug Testing

### Edge Cases
- [ ] Input tanggal mulai = tanggal selesai
- [ ] Verifikasi durasi = 1 hari
- [ ] Input tanggal di masa lalu
- [ ] Input NIS dengan spasi
- [ ] Input karakter special di form
- [ ] Submit form multiple kali (double click)

### Concurrent Actions
- [ ] Dua user approve perizinan yang sama
- [ ] Verifikasi tidak ada conflict
- [ ] Edit token saat sedang digunakan
- [ ] Verifikasi form masih bisa diakses

## ✅ Final Checklist

- [ ] Semua fitur berfungsi dengan baik
- [ ] Tidak ada error di console
- [ ] Tidak ada warning critical
- [ ] Database schema sesuai
- [ ] Role & permission benar
- [ ] UI/UX responsive
- [ ] Performance acceptable
- [ ] Dokumentasi lengkap
- [ ] Ready for production

## 📝 Test Report Template

```
Tanggal Testing: ___________
Tester: ___________
Environment: Development / Staging / Production

Hasil Testing:
✅ Passed: ___ / ___
❌ Failed: ___ / ___
⚠️  Warning: ___ / ___

Critical Issues:
1. ___________
2. ___________

Minor Issues:
1. ___________
2. ___________

Notes:
___________
___________

Status: PASS / FAIL / NEED REVISION
```

---

**Happy Testing! 🚀**
