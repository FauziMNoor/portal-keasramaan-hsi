# 🎯 Catatan Perilaku - README

## 📖 Apa itu Catatan Perilaku?

Sistem pencatatan **pelanggaran** dan **kebaikan** santri dengan sistem poin. Musyrif, kepala asrama, dan user lain bisa input catatan via HP tanpa login menggunakan link token.

---

## ⚡ Quick Start

### 1. Setup Database (2 menit)
```sql
-- Jalankan di Supabase SQL Editor
File: supabase/SETUP_CATATAN_PERILAKU.sql
```

### 2. Akses Fitur
Menu baru **"Catatan Perilaku"** sudah muncul di sidebar dengan 5 sub-menu:
- ✅ Input Catatan
- ✅ Kelola Link Token
- ✅ Riwayat Catatan
- ✅ Dashboard Rekap
- ✅ Kelola Kategori

### 3. Cara Pakai
1. **Admin:** Buat token di "Kelola Link Token"
2. **Kirim link** ke musyrif via WhatsApp
3. **Musyrif:** Buka link di HP, input catatan
4. **Admin:** Lihat rekap di Dashboard

---

## 📚 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| [QUICK_START_CATATAN_PERILAKU.md](QUICK_START_CATATAN_PERILAKU.md) | Setup 5 menit + cara pakai |
| [FITUR_CATATAN_PERILAKU.md](FITUR_CATATAN_PERILAKU.md) | Dokumentasi lengkap semua fitur |
| [TESTING_CATATAN_PERILAKU.md](TESTING_CATATAN_PERILAKU.md) | Checklist testing 150+ test cases |
| [IMPLEMENTASI_CATATAN_PERILAKU_SUMMARY.md](IMPLEMENTASI_CATATAN_PERILAKU_SUMMARY.md) | Summary implementasi |

---

## 🎯 Fitur Utama

### 1. Kelola Kategori
Atur kategori pelanggaran (poin negatif) dan kebaikan (poin positif).

**Default:**
- 15 kategori pelanggaran (misal: Terlambat Shalat -5, Berkelahi -20)
- 15 kategori kebaikan (misal: Imam Shalat +10, Juara Lomba +15)

### 2. Input Catatan
Input pelanggaran/kebaikan santri via dashboard atau link token.

**Via Dashboard:**
- Filter santri (cabang, kelas, asrama, musyrif)
- Pilih tipe & kategori
- Simpan

**Via Token Link:**
- Buka link di HP
- Pilih santri & kategori
- Simpan (tanpa login!)

### 3. Riwayat & Dashboard
Lihat semua catatan, filter, export CSV, dan dashboard ranking santri.

**Dashboard:**
- Top 5 santri terbaik
- Top 5 perlu perhatian
- Ranking semua santri

---

## 🚀 Technology Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Auth:** Existing auth system

---

## 📊 Database Schema

4 Tabel baru:
1. `kategori_pelanggaran_keasramaan` - Kategori pelanggaran
2. `kategori_kebaikan_keasramaan` - Kategori kebaikan
3. `catatan_perilaku_keasramaan` - Data catatan
4. `token_catatan_perilaku_keasramaan` - Token untuk input via link

---

## 🎨 Screenshots

### Dashboard Rekap
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Rekap+Poin+Santri)

### Form via Token (Mobile)
![Form Mobile](https://via.placeholder.com/400x800?text=Form+Input+via+HP)

### Kelola Kategori
![Kategori](https://via.placeholder.com/800x400?text=Kelola+Kategori)

---

## 💡 Use Case

### Scenario: Musyrif Input Pelanggaran
1. Admin buat token untuk Musyrif Ahmad (filter: Asrama A)
2. Admin kirim link via WhatsApp
3. Musyrif Ahmad buka link di HP
4. Pilih santri Budi
5. Pilih kategori: Terlambat Shalat Berjamaah (-5 poin)
6. Simpan ✅
7. Poin Budi berkurang 5

### Scenario: Lihat Ranking
1. Admin buka Dashboard Rekap
2. Filter: Cabang Pusat, Kelas 7
3. Lihat Top 5 Terbaik:
   - Andi: +85 poin (15 kebaikan, 2 pelanggaran)
   - Budi: +72 poin (12 kebaikan, 1 pelanggaran)
   - ...

---

## 🔐 Security

- ✅ RLS Policies di Supabase
- ✅ Token validation (aktif/nonaktif)
- ✅ User authentication
- ✅ SQL injection prevention

---

## 📱 Mobile Friendly

Form via token dioptimasi untuk HP:
- ✅ Responsive design
- ✅ Large buttons
- ✅ Easy dropdown
- ✅ Fast loading

---

## 🎯 Integrasi

Terintegrasi dengan sistem existing:
- ✅ Data siswa
- ✅ Master data (cabang, kelas, asrama, musyrif)
- ✅ User authentication
- ✅ Logo sekolah

---

## 🔮 Roadmap

### Phase 2
- [ ] Integrasi dengan Laporan Wali Santri
- [ ] Dashboard per santri
- [ ] Edit catatan
- [ ] Bulk input

### Phase 3
- [ ] Notifikasi WhatsApp
- [ ] Export PDF
- [ ] Grafik trend
- [ ] Sistem reward

---

## 📞 Support

**Butuh bantuan?**
1. Baca [QUICK_START_CATATAN_PERILAKU.md](QUICK_START_CATATAN_PERILAKU.md)
2. Baca [FITUR_CATATAN_PERILAKU.md](FITUR_CATATAN_PERILAKU.md)
3. Cek console browser untuk error
4. Hubungi developer

---

## ✅ Checklist Deployment

- [ ] Jalankan SQL setup
- [ ] Verifikasi 4 tabel + 30 data kategori
- [ ] Test input via dashboard
- [ ] Test buat token & input via link
- [ ] Test dashboard rekap
- [ ] Test export CSV
- [ ] Test responsive mobile

---

## 🎉 Ready to Use!

Fitur Catatan Perilaku siap digunakan. Selamat mencoba! 🚀

**Version:** 1.0.0  
**Last Updated:** 2 November 2025  
**Developed by:** Kiro AI Assistant
