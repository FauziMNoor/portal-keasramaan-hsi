# 🚀 Quick Reference - Update Perizinan v1.1

## ⚡ 3 Perbaikan dalam 1 Menit

### 1. Filter Cabang Kepala Asrama
```
Kepala Asrama HSI Sukabumi → Hanya lihat perizinan HSI Sukabumi
Kepala Asrama HSI Bogor → Hanya lihat perizinan HSI Bogor
Data diambil dari: users_keasramaan.cabang
```

### 2. Role Kepala Sekolah
```
Role: kepala_sekolah (sudah tersedia di sistem)
Akses: Full (seperti Admin)
Fungsi: Approval perizinan level 2
```

### 3. Tombol WhatsApp
```
Setelah submit form → Tombol WhatsApp muncul
Klik → WhatsApp terbuka dengan template pesan
Target: Kepala Asrama sesuai cabang
Nomor dari: users_keasramaan.no_telepon
```

---

## 📋 Setup Checklist (10 menit)

```bash
✅ TIDAK PERLU DATABASE MIGRATION!

☐ 1. Verifikasi Data User (5 menit)
   → Cek: users_keasramaan
   → Field: cabang, no_telepon
   → Role: kepala_asrama
   
☐ 2. Update Data Jika Perlu (3 menit)
   → Via UI: Menu Users → Edit
   → Atau via SQL (lihat di bawah)
   
☐ 3. Verifikasi Role Kepala Sekolah (1 menit)
   → Cek apakah sudah ada user dengan role kepala_sekolah
   → Buat jika belum ada
   
☐ 4. Test (1 menit)
   → Test filter cabang
   → Test role kepala sekolah
   → Test tombol WhatsApp
```

---

## 💻 SQL Quick Commands

### Verifikasi Data User
```sql
-- Cek data kepala asrama
SELECT 
  nama_lengkap, 
  role, 
  cabang, 
  no_telepon, 
  is_active 
FROM users_keasramaan 
WHERE role = 'kepala_asrama';
```

### Update Data User (Jika Perlu)
```sql
-- Template
UPDATE users_keasramaan 
SET cabang = '[Nama Cabang]', 
    no_telepon = '62[Nomor]'
WHERE email = '[Email Kepala Asrama]';

-- Contoh
UPDATE users_keasramaan 
SET cabang = 'HSI Boarding School Sukabumi', 
    no_telepon = '6281234567890'
WHERE email = 'kepas.sukabumi@hsi.sch.id';
```

### Verifikasi Role Kepala Sekolah
```sql
-- Cek user kepala sekolah
SELECT 
  nama_lengkap, 
  email, 
  role, 
  is_active 
FROM users_keasramaan 
WHERE role = 'kepala_sekolah';
```

---

## 🔍 Quick Test

### Test 1: Filter Cabang (2 menit)
```
1. Login sebagai Kepala Asrama
2. Menu: Perizinan → Approval
3. ✅ Hanya muncul perizinan cabang sendiri
```

### Test 2: Role Kepala Sekolah (2 menit)
```
1. Login sebagai Kepala Sekolah
2. Menu: Perizinan → Approval
3. Filter: "Menunggu Kepsek"
4. ✅ Bisa approve perizinan
```

### Test 3: Tombol WhatsApp (2 menit)
```
1. Submit form perizinan
2. ✅ Tombol WhatsApp muncul
3. Klik tombol
4. ✅ WhatsApp terbuka dengan template
```

---

## ⚠️ Common Issues

### Issue: Kepala Asrama tidak lihat perizinan
```sql
-- Fix: Pastikan cabang match
UPDATE kepala_asrama_keasramaan 
SET cabang = 'HSI Boarding School Sukabumi'
WHERE nama = '[Nama]';
```

### Issue: Tombol WhatsApp tidak muncul
```sql
-- Fix: Tambah nomor WhatsApp
UPDATE kepala_asrama_keasramaan 
SET no_whatsapp = '6281234567890'
WHERE cabang = '[Cabang]';
```

### Issue: Role kepala_sekolah tidak bisa approve
```sql
-- Fix: Update role
UPDATE users_keasramaan 
SET role = 'kepala_sekolah'
WHERE username = '[username]';
```

---

## 📱 Format Nomor WhatsApp

### ✅ Benar
```
6281234567890  (62 + nomor tanpa 0)
6285678901234
6287654321098
```

### ❌ Salah
```
081234567890   (dengan 0 di depan)
+6281234567890 (dengan +)
62-812-3456-7890 (dengan strip)
```

---

## 🎯 Role Comparison

| Fitur | Admin | Kepala Sekolah | Kepala Asrama |
|-------|-------|----------------|---------------|
| Approval L1 | ❌ | ❌ | ✅ (cabang sendiri) |
| Approval L2 | ✅ | ✅ | ❌ |
| Lihat Semua | ✅ | ✅ | ❌ (cabang sendiri) |
| Kelola Link | ✅ | ✅ | ✅ |

---

## 📞 Quick Support

**Database Issue**: Cek `UPDATE_KEPALA_ASRAMA_WHATSAPP.sql`  
**Role Issue**: Cek `SETUP_ROLE_KEPALA_SEKOLAH.md`  
**Full Guide**: Cek `UPDATE_PERIZINAN_V1.1.md`  

---

**Version**: 1.1.0 | **Status**: READY 🚀
