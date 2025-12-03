# ⚡ QUICK START - Upload Foto Catatan Perilaku

## 🎯 Setup dalam 5 Menit!

### **1. Database Migration** (1 menit)
```
Supabase → SQL Editor → Copy MIGRATION_FOTO_CATATAN_PERILAKU.sql → Run
```

### **2. Buat Storage Bucket** (2 menit)
```
Supabase → Storage → New bucket
Name: catatan-perilaku-keasramaan
Public: ✅ CENTANG!
→ Create
```

### **3. RLS Policies** (1 menit)
```
SQL Editor → Copy RLS section dari migration → Run
```

### **4. Test!** (1 menit)
```
Buka form token → Upload foto → Submit → ✅ Success!
```

---

## 📸 Cara Pakai

### **Upload Foto di Form**
1. Buka form catatan perilaku (via token)
2. Scroll ke section **"📸 Upload Foto Kegiatan"**
3. Drag & drop foto ATAU click untuk browse
4. Preview muncul (max 3 foto)
5. Klik X untuk remove foto
6. Submit form → Foto tersimpan!

### **Validasi**
- ✅ Image only (JPG, PNG, GIF, WebP)
- ✅ Max 2MB per foto
- ✅ Max 3 foto per catatan
- ✅ Preview sebelum upload

---

## 🎨 UI Features

```
┌─────────────────────────────────────────┐
│  📸 Upload Foto Kegiatan (Opsional)     │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ IMG1 │  │ IMG2 │  │ +ADD │         │
│  │  [X] │  │  [X] │  │      │         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  ℹ️ Foto: 2/3 • Bisa tambah 1 lagi     │
│  📁 Max 2MB per foto • JPG, PNG, GIF   │
└─────────────────────────────────────────┘
```

---

## 🔥 Use Cases

### **Pelanggaran dengan Bukti Foto**
```
Musyrif melihat santri tidak rapi
→ Foto seragam tidak dimasukkan
→ Upload 1 foto
→ Submit
→ ✅ Catatan + foto tersimpan
```

### **Kebaikan dengan Dokumentasi**
```
Santri juara lomba
→ Foto podium, piala, sertifikat
→ Upload 3 foto
→ Submit
→ ✅ Catatan + 3 foto tersimpan
```

---

## ⚠️ Troubleshooting

**Foto tidak muncul?**
→ Cek bucket `catatan-perilaku-keasramaan` sudah dibuat & public

**Error saat upload?**
→ Cek file size < 2MB & tipe image

**Bucket name error?**
→ Nama HARUS: `catatan-perilaku-keasramaan` (pakai `-` bukan `_`)

---

## ✅ Checklist

- [ ] Migration SQL dijalankan
- [ ] Bucket dibuat & public
- [ ] RLS policies dijalankan
- [ ] Test upload berhasil

---

## 🎉 Done!

Fitur upload foto siap digunakan dalam 5 menit!

**Next:** Update halaman riwayat untuk tampilkan foto 📸

---

**Quick Reference:**
- Bucket: `catatan-perilaku-keasramaan`
- Max photos: 3
- Max size: 2MB per foto
- Types: JPG, PNG, GIF, WebP
