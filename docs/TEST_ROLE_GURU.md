# Testing Checklist: Role Guru

## 📋 Pre-requisites
- [ ] Aplikasi sudah running di `http://localhost:3000`
- [ ] Database sudah setup dengan benar
- [ ] Ada user dengan role Admin untuk testing

## 🧪 Test Scenarios

### Test 1: Membuat User dengan Role Guru

**Steps:**
1. Login sebagai Admin
2. Buka `/users`
3. Klik "Tambah User"
4. Verifikasi dropdown role:
   - [ ] Opsi pertama adalah "Guru" (bukan "User")
   - [ ] Ada opsi: Guru, Musyrif/ah, Kepala Asrama, Admin
5. Isi form:
   ```
   Email: guru.test@example.com
   Password: password123
   Nama Lengkap: Guru Test
   Role: Guru
   Cabang: (pilih salah satu)
   Status: Aktif
   ```
6. Klik "Simpan"
7. Verifikasi:
   - [ ] User berhasil dibuat
   - [ ] Badge role "Guru" tampil dengan warna purple
   - [ ] Data muncul di tabel users

**Expected Result:** ✅ User dengan role Guru berhasil dibuat

---

### Test 2: Login sebagai Guru

**Steps:**
1. Logout dari akun Admin
2. Login dengan kredensial Guru:
   ```
   Email: guru.test@example.com
   Password: password123
   ```
3. Verifikasi redirect ke Dashboard Data

**Expected Result:** ✅ Login berhasil dan redirect ke `/`

---

### Test 3: Verifikasi Menu Sidebar untuk Guru

**Steps:**
1. Login sebagai Guru
2. Periksa menu sidebar yang tampil

**Expected Menu:**
- [ ] ✅ Dashboard Data (/)
- [ ] ✅ Dashboard Habit Tracker (/overview/habit-tracker)
- [ ] ✅ Dashboard Catatan Perilaku (/catatan-perilaku/dashboard)
- [ ] ✅ Habit Tracker (expandable)
  - [ ] ✅ Rekap Habit Tracker (/habit-tracker/rekap)
- [ ] ✅ Catatan Perilaku (expandable)
  - [ ] ✅ Input Catatan (/catatan-perilaku/input)
  - [ ] ✅ Riwayat Catatan (/catatan-perilaku/riwayat)

**Menu yang TIDAK boleh tampil:**
- [ ] ❌ Section "Manajemen Data"
- [ ] ❌ Manajemen Data > Sekolah
- [ ] ❌ Manajemen Data > Tempat
- [ ] ❌ Manajemen Data > Pengurus
- [ ] ❌ Manajemen Data > Siswa
- [ ] ❌ Manajemen Data > Users
- [ ] ❌ Habit Tracker > Input Formulir
- [ ] ❌ Habit Tracker > Kelola Link Musyrif/ah
- [ ] ❌ Habit Tracker > Laporan Wali Santri
- [ ] ❌ Habit Tracker > Indikator Penilaian
- [ ] ❌ Catatan Perilaku > Kelola Link Token
- [ ] ❌ Catatan Perilaku > Kelola Kategori

**Expected Result:** ✅ Menu sesuai dengan akses role Guru

---

### Test 4: Akses Dashboard (Allowed)

**Steps:**
1. Login sebagai Guru
2. Klik "Dashboard Data"
   - [ ] Halaman terbuka tanpa error
3. Klik "Dashboard Habit Tracker"
   - [ ] Halaman terbuka tanpa error
4. Klik "Dashboard Catatan Perilaku"
   - [ ] Halaman terbuka tanpa error

**Expected Result:** ✅ Semua dashboard bisa diakses

---

### Test 5: Akses Habit Tracker - Rekap (Allowed)

**Steps:**
1. Login sebagai Guru
2. Expand menu "Habit Tracker"
3. Klik "Rekap Habit Tracker"
   - [ ] Halaman terbuka tanpa error
   - [ ] Data rekap tampil (jika ada)
   - [ ] Filter berfungsi dengan baik

**Expected Result:** ✅ Halaman rekap bisa diakses

---

### Test 6: Akses Catatan Perilaku - Input & Riwayat (Allowed)

**Steps:**
1. Login sebagai Guru
2. Expand menu "Catatan Perilaku"
3. Klik "Input Catatan"
   - [ ] Halaman terbuka tanpa error
   - [ ] Form input tampil
   - [ ] Bisa input catatan baru
4. Klik "Riwayat Catatan"
   - [ ] Halaman terbuka tanpa error
   - [ ] Data riwayat tampil (jika ada)
   - [ ] Filter berfungsi dengan baik

**Expected Result:** ✅ Halaman input dan riwayat bisa diakses

---

### Test 7: Direct URL Access - Restricted Pages

**Steps:**
1. Login sebagai Guru
2. Coba akses URL berikut secara langsung:

**Manajemen Data:**
- [ ] `/users` - Should show error atau redirect
- [ ] `/data-siswa` - Should show error atau redirect
- [ ] `/manajemen-data/sekolah` - Should show error atau redirect
- [ ] `/manajemen-data/tempat` - Should show error atau redirect
- [ ] `/manajemen-data/pengurus` - Should show error atau redirect

**Habit Tracker (Restricted):**
- [ ] `/habit-tracker` - Should show error atau redirect
- [ ] `/habit-tracker/manage-link` - Should show error atau redirect
- [ ] `/habit-tracker/indikator` - Should show error atau redirect

**Catatan Perilaku (Restricted):**
- [ ] `/catatan-perilaku/manage-link` - Should show error atau redirect
- [ ] `/catatan-perilaku/kategori` - Should show error atau redirect

**Expected Result:** ⚠️ Saat ini proteksi hanya di level UI (sidebar). Halaman masih bisa diakses via direct URL. Untuk proteksi penuh, perlu implementasi di middleware atau page level.

---

### Test 8: Edit User - Change Role

**Steps:**
1. Login sebagai Admin
2. Buka `/users`
3. Edit user "Guru Test"
4. Ubah role dari "Guru" ke "Admin"
5. Simpan
6. Logout dan login kembali sebagai user tersebut
7. Verifikasi menu sidebar berubah (sekarang full access)

**Expected Result:** ✅ Role berubah dan menu menyesuaikan

---

### Test 9: User Profile Display

**Steps:**
1. Login sebagai Guru
2. Scroll ke bawah sidebar
3. Periksa user profile section:
   - [ ] Nama tampil dengan benar
   - [ ] Role tampil "guru" (lowercase)
   - [ ] Foto tampil (jika ada)
   - [ ] Tombol Logout berfungsi

**Expected Result:** ✅ User profile tampil dengan benar

---

### Test 10: Mobile Responsive

**Steps:**
1. Login sebagai Guru
2. Resize browser ke mobile size (< 768px)
3. Verifikasi:
   - [ ] Hamburger menu tampil
   - [ ] Klik hamburger, sidebar slide in
   - [ ] Menu yang tampil sesuai role Guru
   - [ ] Klik menu, sidebar close otomatis
   - [ ] Overlay background tampil

**Expected Result:** ✅ Sidebar responsive di mobile

---

## 🔄 Migration Test (Jika ada user lama)

### Test 11: Migration dari Role "user" ke "guru"

**Pre-condition:** Ada user dengan role "user" di database

**Steps:**
1. Cek user dengan role "user":
   ```sql
   SELECT * FROM users_keasramaan WHERE role = 'user';
   ```
2. Jalankan migration:
   ```sql
   UPDATE users_keasramaan SET role = 'guru' WHERE role = 'user';
   ```
3. Verifikasi:
   ```sql
   SELECT * FROM users_keasramaan WHERE role = 'guru';
   ```
4. Login dengan user yang sudah dimigrate
5. Verifikasi menu sesuai role Guru

**Expected Result:** ✅ Migration berhasil dan menu menyesuaikan

---

## 📊 Test Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Membuat User Guru | ⬜ | |
| 2. Login sebagai Guru | ⬜ | |
| 3. Verifikasi Menu Sidebar | ⬜ | |
| 4. Akses Dashboard | ⬜ | |
| 5. Akses Rekap Habit Tracker | ⬜ | |
| 6. Akses Input & Riwayat Catatan | ⬜ | |
| 7. Direct URL Access | ⬜ | ⚠️ Perlu proteksi tambahan |
| 8. Edit User Role | ⬜ | |
| 9. User Profile Display | ⬜ | |
| 10. Mobile Responsive | ⬜ | |
| 11. Migration Test | ⬜ | Optional |

## 🐛 Known Issues

1. **Direct URL Access**: Saat ini proteksi hanya di level UI (sidebar). User masih bisa akses halaman restricted via direct URL. Solusi:
   - Implementasi `RoleGuard` component di setiap page
   - Atau tambahkan proteksi di middleware.ts

2. **API Level Protection**: Belum ada proteksi di level API. Solusi:
   - Tambahkan role check di setiap API route
   - Implementasi middleware untuk API routes

## 🔧 Recommendations

### High Priority
- [ ] Implementasi proteksi di level page menggunakan `RoleGuard`
- [ ] Tambahkan proteksi di level API routes

### Medium Priority
- [ ] Tambahkan audit log untuk tracking akses user
- [ ] Implementasi permission-based access control yang lebih granular

### Low Priority
- [ ] Tambahkan fitur ubah password sendiri
- [ ] Implementasi role hierarchy

## 📝 Notes

- Semua test harus dilakukan di environment development terlebih dahulu
- Backup database sebelum melakukan migration
- Dokumentasikan semua issue yang ditemukan
- Update checklist ini setelah selesai testing

---

**Tester:** _________________  
**Date:** _________________  
**Environment:** Development / Staging / Production  
**Status:** Pass / Fail / Partial
