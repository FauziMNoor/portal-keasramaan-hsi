# 🔧 Troubleshooting - Upload Foto User

## 🚨 Error: "new row violates row-level security policy"

### **Penyebab:**
Bucket sudah dibuat tapi belum ada RLS policies

### **Solusi:**
Jalankan SQL policies di `supabase/CREATE_STORAGE_POLICIES.sql`

**Panduan lengkap**: `FIX_RLS_ERROR.md`

---

## 🚨 Error: "Foto tidak muncul di UI"

### **Kemungkinan 1: Bucket tidak Public**
✅ **Fix:**
1. Buka Storage → user-photos
2. Klik Settings/Configuration
3. Pastikan "Public" = ✅
4. Save changes

### **Kemungkinan 2: URL foto salah**
✅ **Fix:**
1. Cek console browser (F12)
2. Lihat URL foto yang di-load
3. Pastikan format: `https://[project].supabase.co/storage/v1/object/public/user-photos/users/[file].jpg`

### **Kemungkinan 3: Cache browser**
✅ **Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Clear cache browser
3. Reload aplikasi

---

## 🚨 Error: "Failed to upload"

### **Kemungkinan 1: File terlalu besar**
✅ **Fix:**
- Maksimal 2MB
- Compress foto dulu sebelum upload

### **Kemungkinan 2: File bukan image**
✅ **Fix:**
- Hanya accept: JPG, PNG, GIF, WEBP
- Cek file type

### **Kemungkinan 3: User belum login**
✅ **Fix:**
- Logout dan login lagi
- Cek session di console

---

## 🚨 Error: "Bucket not found"

### **Penyebab:**
Bucket `user-photos` belum dibuat

### **Solusi:**
1. Buka Storage di Supabase
2. Create bucket `user-photos`
3. Set sebagai Public
4. Run RLS policies

**Panduan**: `CREATE_BUCKET_GUIDE.md`

---

## 🚨 Foto lama tidak terhapus

### **Catatan:**
Ini by design. Foto lama tetap di storage untuk backup.

### **Jika ingin auto-delete:**
Update code di `lib/upload.ts`:
```typescript
// Tambahkan di handleSubmit sebelum upload foto baru:
if (editingUser?.foto && photoFile) {
  await deletePhoto(editingUser.foto);
}
```

---

## 🚨 Error: "Invalid session"

### **Penyebab:**
Session expired atau tidak valid

### **Solusi:**
1. Logout
2. Login lagi
3. Test upload

---

## 🚨 Preview foto tidak muncul

### **Kemungkinan 1: File reader error**
✅ **Fix:**
- Cek console browser
- Pastikan file valid

### **Kemungkinan 2: Component state**
✅ **Fix:**
- Close dan buka modal lagi
- Refresh halaman

---

## 🚨 Drag & drop tidak berfungsi

### **Kemungkinan 1: Browser tidak support**
✅ **Fix:**
- Update browser ke versi terbaru
- Gunakan Chrome/Firefox/Edge

### **Kemungkinan 2: File type tidak valid**
✅ **Fix:**
- Pastikan drag image file
- Tidak bisa drag non-image

---

## ✅ Checklist Debugging:

```
□ Bucket user-photos sudah dibuat
□ Bucket setting = Public
□ RLS policies sudah dijalankan
□ User sudah login
□ File size < 2MB
□ File type = image
□ Browser up to date
□ Console tidak ada error
□ Network tab tidak ada failed request
```

---

## 🔍 Debug Tools:

### **1. Console Browser (F12)**
Lihat error messages

### **2. Network Tab**
Cek failed requests ke Supabase

### **3. Application Tab → Storage**
Cek session token

### **4. Supabase Dashboard → Storage**
Cek file berhasil terupload

### **5. SQL Editor**
Cek policies aktif:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects';
```

---

## 📞 Masih Bermasalah?

1. Cek dokumentasi Supabase Storage
2. Cek console untuk error detail
3. Cek network tab untuk failed requests
4. Verify bucket settings
5. Verify RLS policies

---

## 📚 Dokumentasi Terkait:

- `FIX_RLS_ERROR.md` - Fix RLS policy error
- `CREATE_BUCKET_GUIDE.md` - Panduan buat bucket
- `QUICK_START_FOTO.md` - Quick start guide
- `FOTO_UPLOAD_FLOW.md` - Flow diagram
