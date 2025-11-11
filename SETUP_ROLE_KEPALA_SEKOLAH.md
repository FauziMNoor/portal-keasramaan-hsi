# 🎓 Setup Role Kepala Sekolah

## Overview

Role **"kepala_sekolah"** adalah role baru yang memiliki akses penuh seperti Admin, khususnya untuk approval perizinan kepulangan di level 2.

## 🔐 Karakteristik Role

### Kepala Sekolah
- **Role**: `kepala_sekolah`
- **Access Level**: Full (seperti Admin)
- **Khusus untuk**: Approval perizinan level 2

### Perbedaan dengan Admin
- **Admin**: Mengelola sistem secara keseluruhan
- **Kepala Sekolah**: Fokus pada approval dan monitoring akademik/keasramaan

## 📋 Akses Menu

Role Kepala Sekolah memiliki akses ke:

✅ **Dashboard Data** - Overview sistem  
✅ **Dashboard Habit Tracker** - Monitoring habit tracker  
✅ **Dashboard Catatan Perilaku** - Monitoring catatan perilaku  
✅ **Manajemen Data** - Full access  
✅ **Habit Tracker** - Full access  
✅ **Catatan Perilaku** - Full access  
✅ **Manajemen Rapor** - Full access  
✅ **Perizinan** - Full access (khususnya approval level 2)  

## 🚀 Cara Membuat User Kepala Sekolah

### Option 1: Via UI (Recommended)

1. Login sebagai Admin
2. Buka menu **Users**
3. Klik **"Tambah User"**
4. Isi data:
   - Nama: `[Nama Kepala Sekolah]`
   - Username: `kepsek` atau sesuai keinginan
   - Password: `[Password Aman]`
   - **Role**: Pilih **"kepala_sekolah"**
5. Klik **Simpan**

### Option 2: Via SQL

```sql
-- Insert user kepala sekolah
INSERT INTO users_keasramaan (nama, username, password, role, status)
VALUES (
  'Dr. Ahmad Kepala Sekolah',
  'kepsek',
  '$2a$10$[hashed_password]', -- Hash password dengan bcrypt
  'kepala_sekolah',
  'aktif'
);
```

**Note**: Password harus di-hash menggunakan bcrypt. Gunakan Option 1 (via UI) untuk kemudahan.

## 🔄 Update User Existing ke Kepala Sekolah

Jika sudah ada user yang ingin dijadikan Kepala Sekolah:

### Via UI
1. Login sebagai Admin
2. Buka menu **Users**
3. Cari user yang ingin diubah
4. Klik **Edit**
5. Ubah **Role** menjadi **"kepala_sekolah"**
6. Klik **Simpan**

### Via SQL
```sql
-- Update role user menjadi kepala_sekolah
UPDATE users_keasramaan
SET role = 'kepala_sekolah'
WHERE username = 'username_user';

-- Verifikasi
SELECT id, nama, username, role FROM users_keasramaan WHERE role = 'kepala_sekolah';
```

## 📊 Fitur Khusus untuk Kepala Sekolah

### 1. Approval Perizinan Kepulangan (Level 2)

**Alur**:
```
Wali Santri Submit
  ↓
Kepala Asrama Approve (Level 1)
  ↓
Kepala Sekolah Approve (Level 2) ← Role ini
  ↓
Selesai (Disetujui)
```

**Cara Approve**:
1. Login sebagai Kepala Sekolah
2. Menu: **Perizinan → Approval Perizinan**
3. Filter: **"Menunggu Kepsek"**
4. Review perizinan yang sudah disetujui Kepala Asrama
5. Klik icon ✓ untuk **Approve** atau ✗ untuk **Reject**
6. Tambahkan catatan jika diperlukan
7. Klik **Simpan**

### 2. Monitoring & Reporting

Kepala Sekolah dapat:
- Melihat rekap perizinan semua cabang
- Export data untuk laporan
- Monitor santri yang terlambat kembali
- Lihat statistik perizinan

### 3. Dashboard Analytics

Akses ke:
- Dashboard Habit Tracker (overview semua santri)
- Dashboard Catatan Perilaku (overview semua santri)
- Dashboard Data (statistik keseluruhan)

## 🔐 Permission Matrix

| Fitur | Admin | Kepala Sekolah | Kepala Asrama | Guru/Musyrif |
|-------|-------|----------------|---------------|--------------|
| Manajemen Data | ✅ | ✅ | ✅ | ❌ |
| Habit Tracker | ✅ | ✅ | ✅ | ✅ (terbatas) |
| Catatan Perilaku | ✅ | ✅ | ✅ | ✅ (terbatas) |
| Manajemen Rapor | ✅ | ✅ | ✅ | ❌ |
| Perizinan - Kelola Link | ✅ | ✅ | ✅ | ❌ |
| Perizinan - Approval L1 | ❌ | ❌ | ✅ | ❌ |
| Perizinan - Approval L2 | ✅ | ✅ | ❌ | ❌ |
| Perizinan - Rekap | ✅ | ✅ | ✅ | ❌ |
| Users Management | ✅ | ✅ | ❌ | ❌ |

## 🎯 Best Practices

### 1. Keamanan
- Gunakan password yang kuat
- Jangan share kredensial
- Logout setelah selesai menggunakan

### 2. Approval
- Review dengan teliti setiap permohonan
- Berikan catatan yang jelas jika reject
- Koordinasi dengan Kepala Asrama jika ada keraguan

### 3. Monitoring
- Cek dashboard secara berkala
- Review laporan perizinan mingguan
- Follow up santri yang bermasalah

## 📝 Checklist Setup

- [ ] Buat user dengan role "kepala_sekolah"
- [ ] Test login dengan user tersebut
- [ ] Verifikasi akses ke semua menu
- [ ] Test approval perizinan level 2
- [ ] Test monitoring & reporting
- [ ] Training kepada Kepala Sekolah

## 🐛 Troubleshooting

### User tidak bisa approve perizinan
**Solusi**:
1. Cek role user: `SELECT role FROM users_keasramaan WHERE username = 'username'`
2. Pastikan role = 'kepala_sekolah' atau 'admin'
3. Logout dan login kembali

### Menu tidak muncul
**Solusi**:
1. Clear browser cache
2. Logout dan login kembali
3. Cek role di database

### Tidak bisa akses fitur tertentu
**Solusi**:
1. Verifikasi role di database
2. Cek permission di kode
3. Hubungi IT Support

## 📞 Support

Jika ada pertanyaan atau masalah:
- IT Support
- Email: support@hsi-boarding.com
- WhatsApp: [nomor support]

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Dibuat untuk**: HSI Boarding School
