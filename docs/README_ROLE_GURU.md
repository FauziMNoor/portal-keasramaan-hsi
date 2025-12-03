# Role Guru - Quick Reference

## 🎯 Apa yang Berubah?

Role **"User"** sekarang menjadi **"Guru"** dengan akses terbatas.

## ✅ Akses Guru

### Dashboard (3)
- Dashboard Data
- Dashboard Habit Tracker  
- Dashboard Catatan Perilaku

### Habit Tracker (1)
- Rekap Habit Tracker

### Catatan Perilaku (2)
- Input Catatan
- Riwayat Catatan

## ❌ Tidak Bisa Akses

- Semua menu Manajemen Data
- Habit Tracker: Input, Kelola Link, Laporan, Indikator
- Catatan Perilaku: Kelola Link, Kelola Kategori

## 📚 Dokumentasi Lengkap

Lihat: [INDEX_ROLE_GURU.md](./INDEX_ROLE_GURU.md)

## 🚀 Quick Start

### Untuk Admin - Membuat User Guru:
1. Login sebagai Admin
2. Buka `/users`
3. Klik "Tambah User"
4. Pilih role "Guru"
5. Simpan

### Untuk Guru - Login:
1. Buka `/login`
2. Masukkan email & password
3. Menu otomatis menyesuaikan

## 🔄 Migration User Lama

Jika ada user dengan role "user":

```sql
UPDATE users_keasramaan 
SET role = 'guru' 
WHERE role = 'user';
```

## 📖 Dokumentasi

| File | Untuk | Isi |
|------|-------|-----|
| [INDEX_ROLE_GURU.md](./INDEX_ROLE_GURU.md) | Semua | Index dokumentasi |
| [SUMMARY_ROLE_GURU.md](./SUMMARY_ROLE_GURU.md) | Developer | Ringkasan implementasi |
| [QUICK_GUIDE_ROLE_GURU.md](./QUICK_GUIDE_ROLE_GURU.md) | User/Admin | Panduan penggunaan |
| [TEST_ROLE_GURU.md](./TEST_ROLE_GURU.md) | QA | Testing checklist |

## ✨ Status

✅ **READY TO USE**

- User management ✅
- Sidebar filter ✅
- Helper functions ✅
- Documentation ✅

⚠️ **Optional (Recommended):**
- Page-level protection
- API-level protection

Lihat: [IMPLEMENTATION_PAGE_PROTECTION.md](./IMPLEMENTATION_PAGE_PROTECTION.md)

---

**Last Updated:** 6 November 2025
