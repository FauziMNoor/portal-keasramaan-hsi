# 🚀 SETUP UPLOAD FOTO - Catatan Perilaku

## ✅ Langkah-Langkah Setup

### **Step 1: Database Migration** (2 menit)

1. Buka **Supabase Dashboard** → https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy semua isi file `supabase/MIGRATION_FOTO_CATATAN_PERILAKU.sql`
5. Paste di SQL Editor
6. Klik **Run** (atau tekan F5)
7. Tunggu sampai muncul "Success" ✅

**Hasil:**
- ✅ Kolom `foto_kegiatan` ditambahkan ke tabel `catatan_perilaku_keasramaan`
- ✅ Index untuk performa query dibuat
- ✅ Siap untuk menyimpan array foto paths

---

### **Step 2: Buat Storage Bucket** (2 menit)

1. Di Supabase Dashboard, klik **Storage** di sidebar
2. Klik tombol **"New bucket"**
3. Isi form:
   ```
   Name: catatan-perilaku-keasramaan
   Public bucket: ✅ CENTANG INI! (PENTING!)
   File size limit: 2 MB (optional)
   Allowed MIME types: image/* (optional)
   ```
4. Klik **"Create bucket"**
5. ✅ Bucket berhasil dibuat!

**⚠️ PENTING:**
- Nama bucket HARUS: `catatan-perilaku-keasramaan` (pakai tanda `-` bukan `_`)
- Bucket HARUS public agar foto bisa diakses via URL
- Jika lupa centang "Public bucket", foto tidak akan muncul!

---

### **Step 3: Setup RLS Policies** (1 menit)

1. Masih di **SQL Editor**
2. Copy bagian RLS Policies dari file `MIGRATION_FOTO_CATATAN_PERILAKU.sql`
3. Paste dan Run
4. Tunggu success ✅

**Hasil:**
- ✅ Public bisa view foto
- ✅ Authenticated users bisa upload
- ✅ Authenticated users bisa update/delete

---

### **Step 4: Verifikasi Setup** (1 menit)

1. Di **SQL Editor**, jalankan query verifikasi:
   ```sql
   -- Cek kolom foto_kegiatan
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'catatan_perilaku_keasramaan'
   AND column_name = 'foto_kegiatan';
   ```

2. Cek bucket di **Storage**:
   - Buka Storage → Lihat bucket `catatan-perilaku-keasramaan`
   - Pastikan badge "Public" muncul

3. ✅ Jika semua OK, setup selesai!

---

### **Step 5: Test Upload** (2 menit)

1. Refresh aplikasi Next.js
2. Buka form catatan perilaku via token
3. Lihat section **"📸 Upload Foto Kegiatan"**
4. Upload 1-3 foto
5. Submit form
6. Cek di Supabase Storage → bucket `catatan-perilaku-keasramaan`
7. Foto harus muncul di folder `YYYY/MM/tipe/`

---

## 📁 Struktur Folder di Storage

```
catatan-perilaku-keasramaan/
├── 2024/
│   ├── 11/
│   │   ├── pelanggaran/
│   │   │   ├── 1731484800000-abc123.jpg
│   │   │   └── 1731484900000-def456.png
│   │   └── kebaikan/
│   │       ├── 1731485000000-ghi789.jpg
│   │       └── 1731485100000-jkl012.png
│   └── 12/
│       └── ...
└── 2025/
    └── ...
```

**Format Path:**
```
{year}/{month}/{tipe}/{timestamp}-{random}.{ext}

Contoh:
2024/11/kebaikan/1731484800000-abc123.jpg
```

---

## 🎯 Fitur yang Sudah Berfungsi

### **Di Form Token** (`/catatan-perilaku/form/[token]`)
- ✅ Upload 1-3 foto per catatan
- ✅ Drag & drop atau click to browse
- ✅ Preview foto sebelum submit
- ✅ Validasi: image only, max 2MB per foto
- ✅ Remove foto sebelum submit
- ✅ Counter foto (0/3, 1/3, dst)
- ✅ Info & error messages
- ✅ Responsive mobile & desktop

### **Upload Flow**
1. User pilih/drag foto → Preview muncul
2. User bisa tambah sampai 3 foto
3. User bisa remove foto dengan tombol X
4. User submit form → Foto diupload ke storage
5. Path foto disimpan di database (array)
6. Success message dengan jumlah foto

---

## 🔐 Security & Validation

### **Client-Side Validation**
- ✅ File type: image only (jpg, png, gif, webp)
- ✅ File size: max 2MB per foto
- ✅ Max photos: 3 foto per catatan
- ✅ Preview before upload
- ✅ Error messages jelas

### **Server-Side Validation**
- ✅ Session check (authenticated or valid token)
- ✅ File type validation
- ✅ File size validation
- ✅ Path sanitization
- ✅ Unique filename (no collision)

### **Storage Security**
- ✅ Public bucket (read-only for public)
- ✅ Upload only for authenticated
- ✅ Organized folders by year/month/tipe
- ✅ Cache control (1 hour)

---

## 📊 Database Schema

### Tabel: `catatan_perilaku_keasramaan`

**Kolom Baru:**
```sql
foto_kegiatan TEXT[] DEFAULT '{}'
```

**Contoh Data:**
```json
{
  "id": "uuid-123",
  "tipe": "kebaikan",
  "nama_siswa": "Ahmad",
  "nama_kategori": "Imam Shalat",
  "poin": 10,
  "foto_kegiatan": [
    "2024/11/kebaikan/1731484800000-abc123.jpg",
    "2024/11/kebaikan/1731484900000-def456.jpg"
  ]
}
```

---

## 🧪 Testing Checklist

- [ ] Upload 1 foto → Success
- [ ] Upload 3 foto → Success
- [ ] Upload 4 foto → Error (max 3)
- [ ] Upload file > 2MB → Error
- [ ] Upload non-image → Error
- [ ] Drag & drop foto → Success
- [ ] Click to browse → Success
- [ ] Preview foto → Muncul
- [ ] Remove foto → Hilang dari preview
- [ ] Submit tanpa foto → Success (opsional)
- [ ] Submit dengan foto → Success + foto tersimpan
- [ ] Cek foto di Storage → Ada di folder yang benar
- [ ] Responsive mobile → OK
- [ ] Responsive desktop → OK

---

## 🎨 UI/UX Features

### **Photo Grid**
- Grid 3 kolom untuk preview
- Aspect ratio square (1:1)
- Hover effect untuk remove button
- Counter badge di setiap foto (1, 2, 3)

### **Add Photo Button**
- Dashed border
- Camera icon
- "Tambah Foto" text
- Drag & drop indicator saat dragging

### **Info Box**
- Counter: "Foto: 0/3"
- Remaining: "Bisa tambah 3 lagi"
- Max size: "Max 2MB per foto"
- Allowed types: "JPG, PNG, GIF, WebP"
- Instruction: "Drag & drop atau click untuk upload"

### **Error Messages**
- Red background
- Warning icon
- Clear error text
- Auto-clear on success

---

## 🚀 Next Steps (Optional)

Setelah setup selesai, Anda bisa:

1. **Update Halaman Riwayat** - Tampilkan foto di tabel riwayat
2. **Lightbox Gallery** - View foto full size dengan lightbox
3. **Dashboard Integration** - Gallery kegiatan santri
4. **Download Foto** - Download foto untuk laporan
5. **Image Compression** - Auto compress untuk hemat storage
6. **Watermark** - Auto watermark dengan logo sekolah

---

## 📝 Files yang Dibuat

```
✅ supabase/MIGRATION_FOTO_CATATAN_PERILAKU.sql  - Database migration
✅ lib/uploadCatatanPerilaku.ts                  - Upload utilities
✅ components/MultiPhotoUpload.tsx               - Upload component
✅ app/catatan-perilaku/form/[token]/page.tsx    - UPDATED (integrated)
✅ SETUP_FOTO_CATATAN_PERILAKU.md               - This file
✅ FITUR_UPLOAD_FOTO_CATATAN_PERILAKU.md        - Full documentation
```

---

## ⚠️ Troubleshooting

### **Foto tidak muncul di preview?**
- Cek file type (harus image)
- Cek file size (max 2MB)
- Cek console browser untuk error

### **Error saat upload?**
- Cek bucket `catatan-perilaku-keasramaan` sudah dibuat
- Cek bucket setting → Public harus ✅
- Cek RLS policies sudah dijalankan
- Cek user sudah login atau token valid

### **Foto tidak tersimpan di database?**
- Cek kolom `foto_kegiatan` sudah ada
- Cek migration sudah dijalankan
- Cek console untuk error message

### **Foto tidak muncul di Storage?**
- Cek upload berhasil (lihat success message)
- Refresh Storage page
- Cek folder structure: YYYY/MM/tipe/

---

## ✅ Checklist Setup

- [ ] ✅ Jalankan migration SQL
- [ ] ✅ Buat bucket `catatan-perilaku-keasramaan`
- [ ] ✅ Set bucket sebagai PUBLIC
- [ ] ✅ Jalankan RLS policies
- [ ] ✅ Verifikasi kolom `foto_kegiatan` ada
- [ ] ✅ Test upload 1 foto
- [ ] ✅ Test upload 3 foto
- [ ] ✅ Test validasi (file besar, non-image)
- [ ] ✅ Test responsive mobile
- [ ] ✅ Test responsive desktop

---

## 🎉 Selesai!

Fitur upload foto catatan perilaku sudah siap digunakan!

**Total waktu setup: 5-10 menit**

Selamat mencoba! 🚀

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 13 November 2024  
**Versi:** 1.0.0
