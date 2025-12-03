# 🔄 Update Perizinan Kepulangan v1.1

## 📋 Changelog

### Version 1.1 - November 2025

#### ✨ New Features

1. **Filter Approval Berdasarkan Cabang**
   - Kepala Asrama hanya bisa approve perizinan dari cabang mereka sendiri
   - Otomatis filter berdasarkan cabang user yang login
   - Meningkatkan keamanan dan relevansi data

2. **Role Kepala Sekolah**
   - Role baru: `kepala_sekolah`
   - Akses penuh seperti Admin
   - Khusus untuk approval perizinan level 2

3. **Tombol WhatsApp Kepala Asrama**
   - Setelah submit form, wali santri dapat langsung konfirmasi via WhatsApp
   - Otomatis ambil nomor WhatsApp Kepala Asrama sesuai cabang
   - Template pesan otomatis dengan detail perizinan

#### 🔧 Technical Changes

**Database**:
- Tambah kolom `cabang` di tabel `kepala_asrama_keasramaan`
- Tambah kolom `no_whatsapp` di tabel `kepala_asrama_keasramaan`

**Backend**:
- Update approval logic untuk filter berdasarkan cabang
- Update role check untuk include `kepala_sekolah`

**Frontend**:
- Update form success page dengan tombol WhatsApp
- Update approval page dengan filter cabang
- Update sidebar untuk role `kepala_sekolah`

## 🚀 Migration Guide

### Step 1: Update Database

Jalankan SQL script:

```sql
-- File: UPDATE_KEPALA_ASRAMA_WHATSAPP.sql

-- Tambah kolom cabang
ALTER TABLE kepala_asrama_keasramaan 
ADD COLUMN IF NOT EXISTS cabang TEXT;

-- Tambah kolom no_whatsapp
ALTER TABLE kepala_asrama_keasramaan 
ADD COLUMN IF NOT EXISTS no_whatsapp TEXT;
```

### Step 2: Update Data Kepala Asrama

Update data existing dengan cabang dan nomor WhatsApp:

```sql
-- Contoh update
UPDATE kepala_asrama_keasramaan 
SET cabang = 'HSI Boarding School Sukabumi', 
    no_whatsapp = '6281234567890'
WHERE nama = 'Nama Kepala Asrama Sukabumi';

UPDATE kepala_asrama_keasramaan 
SET cabang = 'HSI Boarding School Bogor', 
    no_whatsapp = '6281234567891'
WHERE nama = 'Nama Kepala Asrama Bogor';

-- Verifikasi
SELECT id, nama, cabang, no_whatsapp FROM kepala_asrama_keasramaan;
```

**Format Nomor WhatsApp**:
- Gunakan format internasional: `62` + nomor (tanpa 0 di depan)
- Contoh: `6281234567890` (bukan `081234567890`)

### Step 3: Buat User Kepala Sekolah

Via UI:
1. Login sebagai Admin
2. Menu: Users → Tambah User
3. Isi data dengan role: `kepala_sekolah`

Via SQL:
```sql
-- Jika belum ada role kepala_sekolah di enum, tambahkan dulu
-- (Sesuaikan dengan struktur tabel users Anda)

-- Insert user kepala sekolah
INSERT INTO users_keasramaan (nama, username, password, role, status)
VALUES (
  'Dr. Ahmad Kepala Sekolah',
  'kepsek',
  '[hashed_password]',
  'kepala_sekolah',
  'aktif'
);
```

### Step 4: Test Fitur Baru

**Test 1: Filter Cabang Kepala Asrama**
1. Login sebagai Kepala Asrama
2. Menu: Perizinan → Approval
3. Verifikasi hanya muncul perizinan dari cabang sendiri

**Test 2: Role Kepala Sekolah**
1. Login sebagai Kepala Sekolah
2. Verifikasi akses ke semua menu
3. Test approval perizinan level 2

**Test 3: Tombol WhatsApp**
1. Submit form perizinan via link token
2. Verifikasi tombol WhatsApp muncul
3. Klik tombol, verifikasi WhatsApp terbuka dengan template pesan

## 📊 Impact Analysis

### Positive Impact

✅ **Keamanan**: Kepala Asrama hanya bisa approve cabang sendiri  
✅ **Efisiensi**: Wali santri bisa langsung konfirmasi via WhatsApp  
✅ **Clarity**: Role Kepala Sekolah lebih jelas  
✅ **User Experience**: Proses lebih cepat dan mudah  

### Breaking Changes

⚠️ **Database Schema**: Perlu update tabel `kepala_asrama_keasramaan`  
⚠️ **Data Migration**: Perlu update data existing dengan cabang & WhatsApp  
⚠️ **Role**: Perlu buat user baru dengan role `kepala_sekolah`  

### Backward Compatibility

✅ Data perizinan existing tetap berfungsi  
✅ Token existing tetap valid  
✅ User existing tidak terpengaruh  

## 🔍 Testing Checklist

### Database
- [ ] Kolom `cabang` berhasil ditambahkan
- [ ] Kolom `no_whatsapp` berhasil ditambahkan
- [ ] Data kepala asrama ter-update dengan benar
- [ ] Format nomor WhatsApp benar (62xxx)

### Filter Cabang
- [ ] Kepala Asrama hanya lihat perizinan cabang sendiri
- [ ] Admin/Kepala Sekolah lihat semua perizinan
- [ ] Filter berfungsi dengan benar

### Role Kepala Sekolah
- [ ] User dengan role `kepala_sekolah` bisa login
- [ ] Akses ke semua menu
- [ ] Bisa approve perizinan level 2
- [ ] Tidak bisa approve perizinan level 1

### Tombol WhatsApp
- [ ] Tombol muncul setelah submit form
- [ ] Nomor WhatsApp ter-fetch dengan benar
- [ ] Template pesan benar
- [ ] WhatsApp terbuka dengan benar
- [ ] Handling jika nomor tidak ada

## 📝 Documentation Updates

Updated files:
- ✅ `UPDATE_KEPALA_ASRAMA_WHATSAPP.sql` - Database migration
- ✅ `SETUP_ROLE_KEPALA_SEKOLAH.md` - Role setup guide
- ✅ `UPDATE_PERIZINAN_V1.1.md` - This file
- ✅ `app/perizinan/kepulangan/approval/page.tsx` - Filter cabang
- ✅ `app/perizinan/kepulangan/form/[token]/page.tsx` - WhatsApp button
- ✅ `components/Sidebar.tsx` - Role kepala_sekolah

## 🎯 Next Steps

### Immediate (Sekarang)
1. ✅ Jalankan database migration
2. ✅ Update data kepala asrama
3. ✅ Buat user kepala sekolah
4. ✅ Test semua fitur baru

### Short Term (1-2 minggu)
1. Training untuk Kepala Asrama tentang filter cabang
2. Training untuk Kepala Sekolah tentang role baru
3. Sosialisasi tombol WhatsApp ke wali santri
4. Monitor usage & feedback

### Long Term (1-3 bulan)
1. Collect feedback dari user
2. Optimize performance
3. Add analytics untuk WhatsApp click rate
4. Consider notification otomatis

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Nomor WhatsApp Manual**
   - Perlu input manual di database
   - Belum ada UI untuk update nomor WhatsApp
   - **Workaround**: Update via SQL atau tambahkan di form kepala asrama

2. **Single Kepala Asrama per Cabang**
   - Sistem assume 1 kepala asrama per cabang
   - Jika ada multiple, akan ambil yang pertama
   - **Workaround**: Pastikan data kepala asrama konsisten

3. **WhatsApp Web vs App**
   - Behavior berbeda di desktop vs mobile
   - Desktop buka WhatsApp Web, mobile buka app
   - **Expected**: Ini adalah behavior normal WhatsApp

## 📞 Support

Jika ada pertanyaan atau masalah terkait update ini:

1. **Cek dokumentasi**:
   - `SETUP_ROLE_KEPALA_SEKOLAH.md`
   - `UPDATE_KEPALA_ASRAMA_WHATSAPP.sql`

2. **Troubleshooting**:
   - Verifikasi database migration berhasil
   - Cek data kepala asrama
   - Test dengan data dummy

3. **Contact**:
   - IT Support
   - Email: support@hsi-boarding.com

---

**Version**: 1.1.0  
**Release Date**: November 2025  
**Compatibility**: Requires v1.0.0 or higher  
**Dibuat untuk**: HSI Boarding School
