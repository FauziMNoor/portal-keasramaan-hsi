# 📦 Panduan Membuat Storage Bucket di Supabase

## 🎯 Tujuan
Membuat bucket `user-photos` untuk menyimpan foto profil user.

---

## 📋 Langkah Demi Langkah

### **Step 1: Login ke Supabase**
1. Buka browser
2. Pergi ke: https://supabase.com/dashboard
3. Login dengan akun Anda

### **Step 2: Pilih Project**
1. Di dashboard, Anda akan melihat list project
2. Klik project **portal-keasramaan** (atau nama project Anda)

### **Step 3: Buka Storage**
1. Di sidebar kiri, cari menu **"Storage"**
2. Klik **"Storage"**
3. Anda akan melihat halaman Storage dengan list buckets

### **Step 4: Create New Bucket**
1. Klik tombol **"New bucket"** (biasanya di kanan atas)
2. Form akan muncul

### **Step 5: Isi Form Bucket**

**Field yang WAJIB diisi:**

```
┌─────────────────────────────────────────────┐
│  Name: user-photos                          │
│  (Harus persis seperti ini!)                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ☑️ Public bucket                            │
│  (WAJIB DICENTANG!)                         │
└─────────────────────────────────────────────┘
```

**Field OPTIONAL (boleh dikosongkan):**

```
File size limit: 2 MB
Allowed MIME types: image/*
```

### **Step 6: Create Bucket**
1. Pastikan:
   - Name = `user-photos` ✅
   - Public bucket = ✅ DICENTANG
2. Klik tombol **"Create bucket"**
3. Tunggu beberapa detik

### **Step 7: Verifikasi**
1. Bucket `user-photos` akan muncul di list
2. Status: **Public** (ada badge hijau)
3. ✅ **SELESAI!**

---

## ⚠️ PENTING!

### **Kenapa Harus Public?**
- Foto user perlu diakses via URL publik
- Jika private, foto tidak akan muncul di UI
- Public = read-only untuk semua orang
- Upload tetap butuh authentication

### **Kenapa Nama Harus `user-photos`?**
- Kode sudah hardcoded dengan nama ini
- Jika beda nama, foto tidak akan terupload
- Lokasi di kode: `lib/upload.ts`

---

## 🔍 Troubleshooting

### **Bucket tidak muncul?**
- Refresh halaman browser
- Cek koneksi internet
- Logout dan login lagi

### **Error saat create bucket?**
- Cek nama bucket belum dipakai
- Cek quota storage project
- Cek permission akun Anda

### **Bucket sudah dibuat tapi foto tidak muncul?**
1. Cek bucket setting:
   - Klik bucket `user-photos`
   - Klik **"Settings"** atau **"Configuration"**
   - Pastikan **"Public"** = ✅
2. Jika masih private:
   - Toggle ke Public
   - Save changes

---

## 📸 Screenshot Referensi

### **1. Storage Menu**
```
Sidebar:
├── Home
├── Table Editor
├── Authentication
├── Storage          ← KLIK INI
├── Edge Functions
└── ...
```

### **2. New Bucket Button**
```
┌─────────────────────────────────────────────┐
│  Storage > Buckets                          │
│                                             │
│  [+ New bucket]  ← KLIK INI                 │
└─────────────────────────────────────────────┘
```

### **3. Form Create Bucket**
```
┌─────────────────────────────────────────────┐
│  Create a new bucket                        │
├─────────────────────────────────────────────┤
│                                             │
│  Name *                                     │
│  [user-photos]                              │
│                                             │
│  ☑️ Public bucket                            │
│  Allow public access to all files          │
│                                             │
│  File size limit (optional)                 │
│  [2] MB                                     │
│                                             │
│  Allowed MIME types (optional)              │
│  [image/*]                                  │
│                                             │
│  [Cancel]  [Create bucket]                  │
└─────────────────────────────────────────────┘
```

### **4. Bucket Created**
```
┌─────────────────────────────────────────────┐
│  Buckets                                    │
├─────────────────────────────────────────────┤
│  Name          | Status  | Size | Files    │
│  user-photos   | Public  | 0 B  | 0        │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist

Sebelum lanjut, pastikan:

- [ ] Bucket `user-photos` sudah dibuat
- [ ] Status bucket = **Public**
- [ ] Nama bucket persis `user-photos` (lowercase, dengan dash)
- [ ] Bucket muncul di list Storage

---

## 🚀 Setelah Bucket Dibuat

Langsung test fitur upload:

1. Buka aplikasi: http://localhost:3000/users
2. Klik **"Tambah User"**
3. Upload foto di form
4. Submit
5. Foto akan muncul di tabel! 🎉

---

## 📞 Butuh Bantuan?

Jika ada masalah:
1. Cek dokumentasi Supabase: https://supabase.com/docs/guides/storage
2. Cek console browser untuk error
3. Cek network tab untuk failed requests

---

**Estimasi Waktu**: 2-3 menit
**Difficulty**: ⭐ Very Easy
**Required**: ✅ Wajib untuk fitur upload foto
