# Cara Test Fitur Expand Detail Rekap Habit Tracker

## ✅ Konfirmasi Implementasi
Implementasi sudah **SELESAI** dan kode sudah ada di file:
- File: `portal-keasramaan/app/habit-tracker/rekap/page.tsx`
- State `expandedRows` sudah ditambahkan (line ~107)
- Import `ChevronDown` dan `ChevronRight` sudah ada (line 6)
- Fungsi `toggleExpandRow()` sudah ada (line ~515)
- Fungsi `getIndikatorDisplayName()` sudah ada (line ~523)
- Kolom expand di header tabel sudah ada (line ~1260)
- Tombol expand per row sudah ada (line ~1304)
- Detail expanded row sudah ada (line ~1344)

## 🔧 Langkah-langkah untuk Melihat Perubahan

### 1. Restart Development Server
```bash
# Stop server yang sedang berjalan (Ctrl+C)
# Kemudian jalankan ulang:
cd portal-keasramaan
npm run dev
```

### 2. Hard Refresh Browser
Setelah server running, buka browser dan lakukan **Hard Refresh**:
- **Windows/Linux**: `Ctrl + Shift + R` atau `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 3. Clear Browser Cache (jika masih belum muncul)
- Buka DevTools (F12)
- Klik kanan pada tombol refresh
- Pilih "Empty Cache and Hard Reload"

### 4. Cek Console untuk Error
- Buka DevTools (F12)
- Lihat tab Console
- Jika ada error, screenshot dan kirim ke saya

## 🎯 Yang Harus Terlihat

Setelah refresh, di halaman `/habit-tracker/rekap` tab "Ringkasan", Anda harus melihat:

1. **Kolom pertama di header** dengan icon chevron (▶/▼) untuk expand all
2. **Kolom pertama di setiap row** dengan icon chevron (▶) untuk expand per siswa
3. Ketika diklik, muncul **4 kotak detail kategori** di bawah row tersebut:
   - 📿 UBUDIYAH (biru)
   - 🤝 AKHLAQ (hijau)
   - ⏰ KEDISIPLINAN (orange)
   - 🧹 KEBERSIHAN & KERAPIAN (ungu)

## 🐛 Troubleshooting

### Jika masih tidak muncul:
1. Pastikan tidak ada error di console browser
2. Pastikan file `page.tsx` sudah ter-save
3. Coba restart VS Code / IDE
4. Coba hapus folder `.next` dan restart server:
   ```bash
   cd portal-keasramaan
   rm -rf .next
   npm run dev
   ```

### Jika ada error TypeScript:
```bash
cd portal-keasramaan
npm run build
```
Lihat error yang muncul dan kirim ke saya.

## 📸 Screenshot yang Diharapkan

Setelah implementasi berhasil, tabel akan terlihat seperti ini:

```
┌─────┬────┬──────────────┬─────┬───────┬────────┬─────────┬─────────┬──────────────┬──────────────┬────────────┬...
│ ▶/▼ │ No │ Nama Siswa   │ NIS │ Kelas │ Rombel │ Asrama  │ Cabang  │ Musyrif/ah   │ Kepala Asrama│ Total Ubud │...
├─────┼────┼──────────────┼─────┼───────┼────────┼─────────┼─────────┼──────────────┼──────────────┼────────────┼...
│  ▶  │ 1  │ Ahmad Fauzi  │12345│  X    │   A    │ Putra 1 │ Pusat   │ Dega M. L.   │ Dega M. L.   │  21 / 28   │...
└─────┴────┴──────────────┴─────┴───────┴────────┴─────────┴─────────┴──────────────┴──────────────┴────────────┴...
```

Ketika diklik icon ▶, akan berubah menjadi ▼ dan muncul detail di bawahnya.

## ✉️ Jika Masih Bermasalah

Kirim screenshot dari:
1. Browser console (F12 → Console tab)
2. Terminal tempat `npm run dev` berjalan
3. Halaman tabel yang tidak muncul perubahan

Saya akan bantu debug lebih lanjut.
