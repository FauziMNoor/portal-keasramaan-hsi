# 🎨 Cara Mengganti Logo Sekolah

## 📋 Langkah-Langkah:

### **1. Siapkan File Logo**
- Format: PNG (rekomendasi), JPG, atau SVG
- Ukuran: 512x512px atau lebih besar
- Rasio: 1:1 (square/persegi)
- Background: Transparan (untuk PNG)

### **2. Copy Logo ke Folder Media**
```
portal-keasramaan/public/media/logo.png
```

### **3. Rename File**
Pastikan nama file adalah salah satu dari:
- `logo.png` (rekomendasi)
- `logo.jpg`
- `logo.svg`

### **4. Refresh Browser**
- Buka halaman login
- Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
- Logo sekolah akan muncul!

---

## 🎯 Lokasi Logo Digunakan:

### **Halaman Login** (`/login`)
- Logo muncul di atas judul "Portal Keasramaan"
- Ukuran: 80x80px (w-20 h-20)
- Style: Rounded dengan shadow

---

## 🔄 Fallback System:

Jika logo tidak ditemukan atau gagal load:
- Sistem akan otomatis menampilkan icon graduation cap
- Background: Gradient blue
- Tidak ada error yang muncul

---

## 📐 Rekomendasi Desain Logo:

### **Format Terbaik:**
```
Format: PNG
Background: Transparan
Ukuran: 1024x1024px
Rasio: 1:1
File size: < 500KB
```

### **Alternatif:**
```
Format: SVG (vector)
Keuntungan: Scalable, file kecil
Cocok untuk: Logo dengan bentuk sederhana
```

---

## 🎨 Contoh Struktur File:

```
portal-keasramaan/
└── public/
    └── media/
        ├── logo.png          ← Logo utama
        ├── logo-dark.png     ← Logo untuk dark mode (optional)
        ├── favicon.ico       ← Favicon browser (optional)
        └── README.md         ← Dokumentasi
```

---

## 🛠️ Troubleshooting:

### **Logo tidak muncul?**
1. Cek nama file = `logo.png` (lowercase)
2. Cek lokasi = `public/media/logo.png`
3. Hard refresh browser (Ctrl+Shift+R)
4. Cek console browser untuk error

### **Logo terpotong atau tidak proporsional?**
1. Pastikan rasio 1:1 (square)
2. Gunakan PNG dengan padding
3. Atau edit CSS: `object-fit: contain`

### **Logo terlalu besar/kecil?**
Logo akan otomatis di-scale ke 80x80px.
Siapkan file minimal 512x512px untuk kualitas terbaik.

---

## 📝 Update yang Sudah Dilakukan:

### **1. Warna Tombol Login** ✅
- **Sebelum**: `from-blue-600 to-green-600`
- **Sesudah**: `from-blue-600 to-blue-700`
- **Alasan**: Sesuai dengan warna header dashboard

### **2. Subtitle** ✅
- **Sebelum**: "HSI Boarding School Management System"
- **Sesudah**: "HSI Boarding School"
- **Alasan**: Lebih ringkas dan clean

### **3. Logo Sekolah** ✅
- **Sebelum**: Icon graduation cap (hardcoded)
- **Sesudah**: Logo sekolah dari `public/media/logo.png`
- **Fallback**: Icon graduation cap jika logo tidak ada

---

## 🎉 Hasil Akhir:

Setelah ganti logo:
- ✅ Logo sekolah muncul di halaman login
- ✅ Warna tombol login sesuai identitas sekolah
- ✅ Subtitle lebih ringkas
- ✅ Tampilan lebih profesional
- ✅ Fallback system jika logo tidak ada

---

**File yang Diupdate:**
- `app/login/page.tsx` - Halaman login
- `public/media/` - Folder untuk logo

**Status:** ✅ Ready to use
