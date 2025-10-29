# 🚀 Quick Start - Upload Foto User

## ⚡ Tinggal 1 Langkah!

Semua kode sudah siap. Tinggal buat storage bucket di Supabase:

---

## 📋 Langkah-Langkah:

### **1. Buka Supabase Dashboard**
```
https://supabase.com/dashboard
```

### **2. Pilih Project Anda**
Klik project portal-keasramaan

### **3. Buka Storage**
Sidebar kiri → **Storage**

### **4. Create New Bucket**
Klik tombol **"New bucket"**

### **5. Isi Form**
```
Name: user-photos
Public bucket: ✅ CENTANG!
```

### **6. Create Bucket**
Klik **"Create bucket"**

### **7. Setup RLS Policies (WAJIB!)**
1. Buka **SQL Editor** di sidebar
2. Copy isi file `supabase/CREATE_STORAGE_POLICIES.sql`
3. Paste di SQL Editor
4. Klik **Run**
5. Tunggu success ✅

### **8. ✅ SELESAI!**
Fitur upload foto langsung bisa digunakan!

---

## 🎯 Test Fitur:

1. **Buka halaman Users** → `/users`
2. **Klik "Tambah User"**
3. **Upload foto** di form
4. **Submit**
5. **Lihat foto muncul** di tabel!

---

## 📁 Files yang Sudah Dibuat:

```
✅ lib/upload.ts                          - Upload utilities
✅ components/PhotoUpload.tsx             - Upload component
✅ app/api/users/upload-photo/route.ts    - Upload API
✅ app/users/page.tsx                     - SUDAH TERINTEGRASI
✅ components/Sidebar.tsx                 - Tampil foto
```

---

## 🎉 Fitur yang Berfungsi:

- ✅ Upload foto saat create user
- ✅ Ganti foto saat edit user
- ✅ Preview foto sebelum submit
- ✅ Drag & drop upload
- ✅ Validasi file (image only, max 2MB)
- ✅ Foto muncul di tabel users
- ✅ Foto muncul di sidebar
- ✅ Fallback ke initial nama
- ✅ Responsive design

---

## ⚠️ PENTING:

**Bucket HARUS public** agar foto bisa diakses via URL!

Jika lupa centang "Public bucket", foto tidak akan muncul.

---

## 🆘 Troubleshooting:

### **Foto tidak muncul?**
1. Cek bucket `user-photos` sudah dibuat
2. Cek bucket setting → **Public** harus ✅
3. Refresh browser

### **Error saat upload?**
1. Cek file size < 2MB
2. Cek file type adalah image
3. Cek sudah login

---

**Ready to go!** 🚀
