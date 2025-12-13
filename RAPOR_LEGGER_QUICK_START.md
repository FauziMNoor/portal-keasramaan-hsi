# 🚀 Quick Start - Legger Rapor

## Akses Halaman

```
http://localhost:3000/rapor/legger
```

## Langkah Penggunaan

### 1️⃣ Connect Google Account (Pertama Kali)
- Klik tombol "Connect Google Account" di kanan atas
- Login dengan Google Workspace account
- Authorize aplikasi
- Tokens akan tersimpan di localStorage

### 2️⃣ Pilih Filter
1. **Cabang** - Pilih cabang sekolah
2. **Tahun Ajaran** - Pilih tahun ajaran aktif
3. **Semester** - Pilih semester (Ganjil/Genap)
4. **Kelas** - Pilih kelas (muncul setelah pilih cabang)
5. **Asrama** - Pilih asrama (muncul setelah pilih kelas)

### 3️⃣ Lihat Legger
Setelah semua filter dipilih, tabel legger akan muncul dengan:
- Foto santri
- Nama & NIS
- Kelas & Asrama
- Status kelengkapan data:
  - ✅ **Siap** - Semua data lengkap, bisa di-generate
  - ⚠️ **Kurang** - Ada data yang kurang
  - ❌ **Error** - Data critical kosong

### 4️⃣ Preview Data (Optional)
- Klik tombol 👁️ (Eye) untuk lihat summary
- Review checklist kelengkapan data
- Klik "Lihat Detail Lengkap" untuk lihat semua data

### 5️⃣ Generate Rapor

#### Option A: Generate Per Santri
1. Klik tombol 📄 (FileText) di baris santri
2. Atau klik "Generate" di modal preview
3. Tunggu proses (±30-60 detik)
4. Link download akan muncul di kolom PDF

#### Option B: Generate Semua Rapor
1. Klik tombol "Generate Semua Rapor" di action bar
2. Konfirmasi
3. Tunggu proses batch (±2 menit per santri)
4. Link download akan muncul di kolom PDF

### 6️⃣ Download PDF
- Klik link "Download" di kolom PDF
- PDF akan terbuka di tab baru
- Bisa di-download atau di-print

## Status Data

### ✅ Siap (Ready)
Semua data lengkap:
- Data santri ✓
- Habit tracker ✓ (minimal 1 entry)
- Kegiatan ✓ (6 kegiatan)
- Catatan musyrif ✓

**Action**: Bisa langsung di-generate!

### ⚠️ Kurang (Incomplete)
Ada data yang kurang:
- Habit tracker kosong ATAU
- Kegiatan kurang dari 6 ATAU
- Catatan musyrif kosong

**Action**: 
1. Klik 👁️ untuk lihat detail
2. Lengkapi data yang kurang:
   - Habit tracker → Menu "Habit Tracker"
   - Kegiatan → Menu "Rapor > Setup Kegiatan"
   - Catatan → Menu "Rapor > Setup Catatan"
3. Refresh halaman
4. Generate setelah status ✅ Siap

### ❌ Error
Data santri tidak ditemukan

**Action**: Cek data santri di menu "Data Siswa"

## Tips

### 💡 Sebelum Generate
1. Pastikan Google account sudah terkoneksi
2. Cek status semua santri (minimal ada yang ✅ Siap)
3. Preview data untuk memastikan akurat
4. Lengkapi data yang kurang terlebih dahulu

### 💡 Saat Generate
1. Jangan close tab/browser saat generate
2. Tunggu sampai link download muncul
3. Untuk batch, tunggu sampai semua selesai
4. Jika error, cek console log untuk detail

### 💡 Setelah Generate
1. Download PDF segera (link valid 7 hari)
2. Simpan PDF di local/cloud storage
3. Bisa re-generate jika ada perubahan data
4. PDF lama akan ter-overwrite

## Troubleshooting

### ❌ "Google account not connected"
**Solusi**: Klik "Connect Google Account" dan authorize

### ❌ "Tidak ada santri di kelas/asrama ini"
**Solusi**: 
- Cek filter sudah benar
- Cek data santri di menu "Data Siswa"
- Pastikan santri ada di kelas/asrama yang dipilih

### ❌ Generate gagal
**Solusi**:
- Refresh halaman dan coba lagi
- Cek koneksi internet
- Cek Google OAuth token masih valid
- Cek console log untuk error detail

### ❌ Status selalu "Kurang"
**Solusi**:
- Klik 👁️ untuk lihat detail
- Klik "Lihat Detail Lengkap"
- Cek data mana yang kurang
- Lengkapi data tersebut
- Refresh halaman

### ❌ PDF tidak bisa download
**Solusi**:
- Cek link masih valid
- Cek permission Google Drive
- Re-generate jika perlu

## FAQ

### Q: Berapa lama proses generate?
**A**: 
- Single: ±30-60 detik
- Batch: ±2 menit per santri (dengan delay 2 detik)

### Q: Apakah bisa generate ulang?
**A**: Ya, bisa. PDF lama akan ter-overwrite.

### Q: Dimana PDF disimpan?
**A**: Di Google Drive kantor (folder sesuai cabang/tahun ajaran).

### Q: Apakah bisa generate tanpa Google account?
**A**: Tidak. Google account wajib untuk akses Slides & Drive.

### Q: Berapa maksimal santri untuk batch generate?
**A**: Tidak ada limit, tapi disarankan max 50 santri per batch untuk avoid timeout.

### Q: Apakah foto santri & kegiatan ter-insert?
**A**: 
- Text data: ✅ Sudah (Phase 1)
- Images: ⏳ Coming soon (Phase 2)

### Q: Bagaimana cara edit template rapor?
**A**: Edit Google Slides template di Drive, placeholder tetap sama.

### Q: Apakah bisa export ke format lain?
**A**: Saat ini hanya PDF. Format lain (Word, Excel) coming soon.

## Next Steps

Setelah berhasil generate rapor:
1. ✅ Download & simpan PDF
2. ✅ Review rapor untuk QA
3. ✅ Print atau kirim ke orang tua
4. ✅ Archive untuk dokumentasi

Selamat menggunakan Legger Rapor! 🎉

---

**Need Help?**
- Dokumentasi lengkap: `docs/RAPOR_LEGGER_FEATURE.md`
- Technical details: `RAPOR_LEGGER_IMPLEMENTATION.md`
- Contact: Admin sistem
