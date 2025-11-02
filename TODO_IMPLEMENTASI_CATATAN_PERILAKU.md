# 📋 TODO: Implementasi Catatan Perilaku

## ✅ Yang Sudah Selesai

### Database
- [x] SQL setup awal (SETUP_CATATAN_PERILAKU.sql)
- [x] SQL update V2 (UPDATE_CATATAN_PERILAKU_V2.sql)

### Pages
- [x] Kelola Kategori & Level Dampak (kategori/page.tsx) - V2
- [x] Input Catatan (input/page.tsx) - V2
- [x] Riwayat Catatan (riwayat/page.tsx) - V1 (perlu update)
- [x] Dashboard Rekap (dashboard/page.tsx) - V3 (style baru)
- [x] Manage Link Token (manage-link/page.tsx) - V1 (perlu update)
- [ ] Form via Token ([token]/page.tsx) - V1 (perlu update ke V2)

### Components
- [x] Sidebar - Menu sudah dipindah ke Overview

### Dokumentasi
- [x] FITUR_CATATAN_PERILAKU.md
- [x] QUICK_START_CATATAN_PERILAKU.md
- [x] UPDATE_CATATAN_PERILAKU_V2.md
- [x] UPDATE_WARNA_RIWAYAT.md
- [x] UPDATE_DASHBOARD_CATATAN_PERILAKU.md
- [x] FIX_WARNA_VIOLET.md
- [x] TODO_IMPLEMENTASI_CATATAN_PERILAKU.md (file ini)

---

## ⏳ Yang Perlu Diselesaikan

### 1. **Jalankan SQL Update V2** (PENTING!)

**File:** `supabase/UPDATE_CATATAN_PERILAKU_V2.sql`

**Langkah:**
1. Buka Supabase Dashboard > SQL Editor
2. Copy isi file UPDATE_CATATAN_PERILAKU_V2.sql
3. Paste dan Run
4. Verifikasi:
   - Tabel `kategori_perilaku_keasramaan` ada (10 data)
   - Tabel `level_dampak_keasramaan` ada (3 data)
   - Tabel lama `kategori_pelanggaran_keasramaan` & `kategori_kebaikan_keasramaan` sudah dihapus
   - Kolom baru di `catatan_perilaku_keasramaan`:
     - `nama_pelanggaran_kebaikan`
     - `level_dampak`
     - `level_dampak_id`
     - `kategori_perilaku_id` (renamed from kategori_id)

**⚠️ PENTING:** Backup data dulu jika ada data penting!

---

### 2. **Update Form via Token** (Prioritas Tinggi)

**File:** `app/catatan-perilaku/form/[token]/page.tsx`

**Yang Perlu Diubah:**
- Fetch kategori dari `kategori_perilaku_keasramaan` (bukan kategori_pelanggaran/kebaikan)
- Fetch level dampak dari `level_dampak_keasramaan`
- Tambah field input:
  - Nama pelanggaran/kebaikan (text input)
  - Level dampak (dropdown, untuk pelanggaran)
  - Poin manual (number input, untuk kebaikan)
- Update submit logic sesuai struktur V2

**Referensi:** Lihat `app/catatan-perilaku/input/page.tsx` (sudah V2)

---

### 3. **Update Riwayat Catatan** (Prioritas Sedang)

**File:** `app/catatan-perilaku/riwayat/page.tsx`

**Yang Perlu Diubah:**
- Tambah kolom "Nama Pelanggaran/Kebaikan" di tabel
- Tampilkan `nama_pelanggaran_kebaikan` dari database
- Tampilkan `level_dampak` untuk pelanggaran
- Update interface `CatatanPerilaku` untuk include field baru

**Contoh Tampilan:**
```
| Tipe | Kategori | Nama | Level | Poin |
|------|----------|------|-------|------|
| Pelanggaran | Kedisiplinan | Terlambat Shalat Subuh | Ringan | -5 |
| Kebaikan | Ibadah | Menjadi Imam Shalat | - | +10 |
```

---

### 4. **Update Manage Link Token** (Prioritas Rendah)

**File:** `app/catatan-perilaku/manage-link/page.tsx`

**Yang Perlu Diubah:**
- Sudah OK, tidak perlu perubahan besar
- Hanya perlu test apakah token generation masih bekerja

---

### 5. **Testing Lengkap**

**Checklist Testing:**
- [ ] Test input catatan via dashboard (V2)
  - [ ] Input pelanggaran dengan level dampak
  - [ ] Input kebaikan dengan poin manual
- [ ] Test kelola kategori
  - [ ] CRUD kategori perilaku
  - [ ] CRUD level dampak
- [ ] Test generate token
  - [ ] Buat token baru
  - [ ] Copy link
  - [ ] Buka link di browser lain
- [ ] Test form via token (setelah update V2)
  - [ ] Input pelanggaran
  - [ ] Input kebaikan
- [ ] Test riwayat (setelah update)
  - [ ] Lihat data dengan nama pelanggaran/kebaikan
  - [ ] Filter bekerja
  - [ ] Export CSV
- [ ] Test dashboard
  - [ ] Stats cards benar
  - [ ] Top 5 benar
  - [ ] Table ranking benar

---

## 🎯 Prioritas Implementasi

### High Priority (Harus Segera)
1. ✅ Jalankan SQL Update V2
2. ⏳ Update Form via Token ke V2
3. ⏳ Testing input catatan

### Medium Priority (Penting)
4. ⏳ Update Riwayat untuk tampilkan nama pelanggaran/kebaikan
5. ⏳ Testing lengkap semua fitur

### Low Priority (Nice to Have)
6. ⏳ Integrasi dengan Laporan Wali Santri
7. ⏳ Notifikasi WhatsApp (future)
8. ⏳ Export PDF per santri (future)

---

## 📝 Catatan Penting

### Struktur Database V2

**Kategori Perilaku (Umum):**
```sql
kategori_perilaku_keasramaan
- id
- nama_kategori (Kedisiplinan, Kebersihan, dll)
- deskripsi
- status
```

**Level Dampak (Untuk Pelanggaran):**
```sql
level_dampak_keasramaan
- id
- nama_level (Ringan, Sedang, Berat)
- poin (-5, -15, -30)
- deskripsi
- urutan
- status
```

**Catatan Perilaku:**
```sql
catatan_perilaku_keasramaan
- ... (kolom existing)
- nama_pelanggaran_kebaikan (TEXT) ← BARU
- level_dampak (VARCHAR) ← BARU
- level_dampak_id (UUID) ← BARU
- kategori_perilaku_id (UUID) ← RENAMED
```

### Flow Input V2

**Pelanggaran:**
1. Pilih Kategori (Kedisiplinan, Kebersihan, dll)
2. Ketik Nama Pelanggaran (manual input)
3. Pilih Level Dampak (Ringan/Sedang/Berat)
4. Poin otomatis sesuai level

**Kebaikan:**
1. Pilih Kategori (Ibadah, Akademik, dll)
2. Ketik Nama Kebaikan (manual input)
3. Input Poin (manual)

---

## 🚀 Quick Start untuk Developer Lain

### Setup Awal
```bash
1. Clone repo
2. npm install
3. Setup .env.local (Supabase credentials)
4. Jalankan SQL: SETUP_CATATAN_PERILAKU.sql
5. Jalankan SQL: UPDATE_CATATAN_PERILAKU_V2.sql
6. npm run dev
```

### Test Fitur
```bash
1. Login ke dashboard
2. Buka "Kelola Kategori & Level" - cek 10 kategori + 3 level
3. Buka "Input Catatan" - test input pelanggaran & kebaikan
4. Buka "Dashboard Catatan Perilaku" - lihat rekap
5. Buka "Kelola Link Token" - generate token
6. Copy link token - buka di browser lain
7. Test input via token
```

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Cek dokumentasi di folder root
2. Cek TODO ini untuk status implementasi
3. Cek console browser untuk error
4. Hubungi developer

---

## ✅ Status Keseluruhan

**Progress:** 80% Complete

**Yang Sudah Jalan:**
- ✅ Database schema V2
- ✅ Kelola kategori & level dampak
- ✅ Input catatan (dashboard) V2
- ✅ Dashboard rekap dengan style baru
- ✅ Riwayat catatan (V1, masih bisa dipakai)
- ✅ Manage link token

**Yang Perlu Diselesaikan:**
- ⏳ Form via token (update ke V2)
- ⏳ Riwayat catatan (update tampilan)
- ⏳ Testing lengkap

**Estimasi Waktu:** 2-3 jam untuk menyelesaikan sisanya

---

**Last Updated:** 2 November 2025  
**Version:** 2.0.0  
**Status:** In Progress (80%)
