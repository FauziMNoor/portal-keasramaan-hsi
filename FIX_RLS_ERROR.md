# 🔧 Fix: Row-Level Security Policy Error

## ❌ Error yang Muncul:
```
new row violates row-level security policy
```

## 🔍 Penyebab:
Bucket `user-photos` sudah dibuat, tapi belum ada RLS policies untuk upload.

---

## ✅ Solusi (2 Menit):

### **Step 1: Buka SQL Editor**
1. Buka Supabase Dashboard
2. Klik **SQL Editor** di sidebar kiri
3. Klik **"New query"**

### **Step 2: Copy & Run SQL**
1. Buka file: `supabase/CREATE_STORAGE_POLICIES.sql`
2. Copy **SEMUA** isi file
3. Paste di SQL Editor
4. Klik **Run** (atau Ctrl+Enter)
5. Tunggu sampai muncul notifikasi **Success** ✅

### **Step 3: Verifikasi**
1. Refresh aplikasi
2. Test upload foto lagi
3. Seharusnya berhasil tanpa error! 🎉

---

## 📋 Policies yang Dibuat:

```sql
1. Public Read
   → Semua orang bisa lihat foto via URL

2. Authenticated Upload
   → User yang login bisa upload foto

3. Authenticated Update
   → User yang login bisa update foto

4. Authenticated Delete
   → User yang login bisa delete foto
```

---

## 🔐 Keamanan:

- ✅ **Public Read**: Aman, hanya baca
- ✅ **Authenticated Write**: Hanya user login yang bisa upload
- ✅ **No Anonymous Upload**: User harus login dulu
- ✅ **Bucket Public**: Foto bisa diakses via URL

---

## 🆘 Masih Error?

### **Cek 1: Bucket Name**
Pastikan bucket name = `user-photos` (lowercase, dengan dash)

### **Cek 2: User Login**
Pastikan user sudah login sebelum upload

### **Cek 3: Policies Aktif**
Jalankan SQL ini untuk cek policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Harus ada 4 policies untuk bucket `user-photos`

### **Cek 4: Session Valid**
Logout dan login lagi, lalu test upload

---

## 📝 Quick Reference:

**File SQL**: `supabase/CREATE_STORAGE_POLICIES.sql`
**Bucket Name**: `user-photos`
**Bucket Type**: Public
**RLS**: Enabled dengan 4 policies

---

## ✅ Setelah Fix:

- ✅ Upload foto berhasil
- ✅ Foto muncul di tabel
- ✅ Foto muncul di sidebar
- ✅ No more RLS errors!

**Estimasi**: 2 menit
**Difficulty**: ⭐ Very Easy
