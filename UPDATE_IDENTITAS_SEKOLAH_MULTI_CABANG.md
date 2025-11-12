# 🏫 UPDATE: Identitas Sekolah Multi-Cabang

## 📋 Ringkasan Update

### Masalah Sebelumnya:
1. ❌ Ada 2 halaman untuk input identitas sekolah:
   - `/identitas-sekolah` (halaman lama)
   - `/settings/info-sekolah` (halaman baru - duplikat)
2. ❌ Data tidak mengikuti cabang
3. ❌ Kepala asrama harus input manual padahal sudah ada di master data
4. ❌ Surat izin tidak otomatis menggunakan data sesuai cabang santri

### Solusi:
1. ✅ Merge menjadi 1 halaman: `/identitas-sekolah`
2. ✅ Data otomatis mengikuti cabang user yang login
3. ✅ Kepala asrama auto-populate dari master data
4. ✅ Surat izin otomatis menggunakan data sesuai cabang santri

---

## 🎯 Fitur Baru

### 1. Multi-Cabang Support
- Setiap cabang punya data identitas sekolah sendiri
- Data otomatis ter-filter berdasarkan cabang user yang login
- Jika santri dari Sukabumi, data yang digunakan adalah data cabang Sukabumi
- Jika santri dari Purworejo, data yang digunakan adalah data cabang Purworejo

### 2. Auto-Populate Kepala Asrama
- Dropdown kepala asrama otomatis menampilkan data dari master kepala asrama
- Data ter-filter sesuai cabang
- Jika tidak ada data di master, bisa input manual

### 3. Field Lengkap
- Nama Sekolah Lengkap
- Nama Singkat
- Nama Kepala Sekolah + NIP
- Nama Kepala Asrama + NIP (auto-populate)
- Alamat Lengkap
- Kota
- Kode Pos
- No. Telepon
- Email
- Website
- Logo

### 4. Integrasi dengan Surat Izin
- Generate PDF surat izin otomatis menggunakan data sesuai cabang santri
- Kop surat otomatis sesuai cabang
- Nama pejabat otomatis sesuai cabang

---

## 📁 File yang Diubah

### Updated:
1. ✅ `app/identitas-sekolah/page.tsx` - Integrasi multi-cabang
2. ✅ `app/api/perizinan/generate-surat/route.ts` - Filter by cabang

### Deleted:
1. ❌ `app/settings/info-sekolah/page.tsx` - Duplikat, tidak diperlukan

### New:
1. ✅ `MIGRATION_MERGE_IDENTITAS_SEKOLAH.sql` - Migration data
2. ✅ `UPDATE_IDENTITAS_SEKOLAH_MULTI_CABANG.md` - Dokumentasi (file ini)

---

## 🗄️ Database Changes

### Tabel yang Digunakan:
- `info_sekolah_keasramaan` - Tabel utama (per cabang)
- `identitas_sekolah_keasramaan` - Tabel lama (global, akan di-migrate)
- `kepala_asrama_keasramaan` - Master data kepala asrama

### Migration:
- Data dari `identitas_sekolah_keasramaan` di-migrate ke `info_sekolah_keasramaan`
- Setiap cabang punya entry sendiri
- Nama kepala asrama auto-populate dari master data

---

## 🚀 Cara Deploy

### 1. Run Migration
```sql
-- Jalankan di Supabase SQL Editor
-- File: MIGRATION_MERGE_IDENTITAS_SEKOLAH.sql

-- Step 1: Cek data yang ada
SELECT * FROM identitas_sekolah_keasramaan;
SELECT * FROM info_sekolah_keasramaan;

-- Step 2: Migrate data
-- (Copy paste dari MIGRATION_MERGE_IDENTITAS_SEKOLAH.sql)

-- Step 3: Verifikasi
SELECT * FROM info_sekolah_keasramaan ORDER BY cabang;
```

### 2. Deploy Aplikasi
```bash
npm run build
pm2 restart portal-keasramaan
```

### 3. Isi Data per Cabang
```
1. Login sebagai user cabang Purworejo
2. Buka /identitas-sekolah
3. Isi data lengkap untuk cabang Purworejo
4. Simpan

5. Login sebagai user cabang Sukabumi
6. Buka /identitas-sekolah
7. Isi data lengkap untuk cabang Sukabumi
8. Simpan

(Ulangi untuk cabang lainnya)
```

---

## 🎨 UI Changes

### Halaman Identitas Sekolah

**Sebelum:**
- Form global untuk semua cabang
- Input manual kepala asrama
- Field terbatas

**Sesudah:**
- Info cabang ditampilkan di atas form
- Dropdown kepala asrama (auto-populate)
- Field lengkap sesuai kebutuhan surat izin
- Data ter-filter per cabang

**Contoh:**
```
┌─────────────────────────────────────────┐
│ Identitas Sekolah                       │
├─────────────────────────────────────────┤
│ ℹ️ Cabang: Purworejo                    │
│ Data ini untuk surat izin cabang ini    │
├─────────────────────────────────────────┤
│ Informasi Dasar                         │
│ • Nama Sekolah Lengkap                  │
│ • Nama Singkat                          │
├─────────────────────────────────────────┤
│ Pejabat                                 │
│ • Nama Kepala Sekolah + NIP             │
│ • Nama Kepala Asrama (dropdown) + NIP   │
│   └─ Data dari Master Kepala Asrama     │
├─────────────────────────────────────────┤
│ Kontak & Alamat                         │
│ • Alamat Lengkap                        │
│ • Kota, Kode Pos, Telepon               │
│ • Email, Website                        │
├─────────────────────────────────────────┤
│ Logo Sekolah                            │
│ • Upload logo                           │
└─────────────────────────────────────────┘
```

---

## 🔄 Alur Data

### Skenario 1: Santri Purworejo Izin Pulang
```
1. Wali santri isi formulir perizinan
   └─ Data santri: NIS, Nama, Cabang: Purworejo

2. Kepala Asrama Purworejo approve + upload bukti
   └─ Login sebagai user cabang Purworejo

3. Kepala Sekolah approve
   └─ Verifikasi bukti

4. Generate PDF Surat Izin
   └─ Sistem ambil data dari info_sekolah_keasramaan
   └─ WHERE cabang = 'Purworejo'
   └─ Kop surat: Data Purworejo
   └─ TTD: Kepala Asrama Purworejo, Kepala Sekolah
```

### Skenario 2: Santri Sukabumi Izin Pulang
```
1. Wali santri isi formulir perizinan
   └─ Data santri: NIS, Nama, Cabang: Sukabumi

2. Kepala Asrama Sukabumi approve + upload bukti
   └─ Login sebagai user cabang Sukabumi

3. Kepala Sekolah approve
   └─ Verifikasi bukti

4. Generate PDF Surat Izin
   └─ Sistem ambil data dari info_sekolah_keasramaan
   └─ WHERE cabang = 'Sukabumi'
   └─ Kop surat: Data Sukabumi
   └─ TTD: Kepala Asrama Sukabumi, Kepala Sekolah
```

---

## ✅ Benefits

### 1. Efisiensi
- ✅ Tidak perlu input data berulang-ulang
- ✅ Kepala asrama auto-populate dari master data
- ✅ Satu halaman untuk semua kebutuhan

### 2. Akurasi
- ✅ Data sesuai dengan cabang santri
- ✅ Tidak ada kesalahan data antar cabang
- ✅ Surat izin otomatis menggunakan data yang benar

### 3. Maintainability
- ✅ Satu source of truth untuk data sekolah
- ✅ Update data di satu tempat
- ✅ Konsisten di semua fitur

---

## 🧪 Testing

### Test Case 1: Input Data Cabang Purworejo
```
1. Login sebagai user cabang Purworejo
2. Buka /identitas-sekolah
3. Verify: Info cabang menampilkan "Purworejo"
4. Verify: Dropdown kepala asrama menampilkan data cabang Purworejo
5. Isi semua field
6. Klik "Simpan Data"
7. Verify: Data tersimpan dengan cabang = 'Purworejo'
```

### Test Case 2: Generate Surat Izin Purworejo
```
1. Buat perizinan untuk santri cabang Purworejo
2. Approve oleh Kepala Asrama Purworejo
3. Approve oleh Kepala Sekolah
4. Download surat izin
5. Verify: Kop surat menggunakan data cabang Purworejo
6. Verify: Nama kepala asrama sesuai dengan data Purworejo
```

### Test Case 3: Multi-Cabang
```
1. Login sebagai user cabang Sukabumi
2. Buka /identitas-sekolah
3. Verify: Info cabang menampilkan "Sukabumi"
4. Verify: Data yang ditampilkan adalah data cabang Sukabumi
5. Verify: Tidak melihat data cabang lain
```

---

## 🐛 Troubleshooting

### Data Kepala Asrama Tidak Muncul
**Masalah:** Dropdown kepala asrama kosong

**Solusi:**
1. Cek master data kepala asrama:
```sql
SELECT * FROM kepala_asrama_keasramaan 
WHERE lokasi = 'Purworejo' 
AND status = 'aktif';
```

2. Jika kosong, tambahkan data:
```sql
INSERT INTO kepala_asrama_keasramaan (nama, lokasi, status)
VALUES ('Ustadz Ahmad, S.Pd.I.', 'Purworejo', 'aktif');
```

3. Refresh halaman identitas sekolah

### Surat Izin Tidak Generate
**Masalah:** Error "Data info sekolah tidak ditemukan"

**Solusi:**
1. Pastikan data identitas sekolah sudah diisi untuk cabang tersebut
2. Cek data:
```sql
SELECT * FROM info_sekolah_keasramaan 
WHERE cabang = 'Purworejo';
```

3. Jika kosong, isi data di halaman /identitas-sekolah

### Data Tidak Tersimpan
**Masalah:** Klik simpan tapi data tidak tersimpan

**Solusi:**
1. Cek browser console (F12) untuk error
2. Cek RLS policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'info_sekolah_keasramaan';
```

3. Pastikan user sudah login dan authenticated

---

## 📊 Migration Checklist

- [ ] Backup database
- [ ] Run `MIGRATION_MERGE_IDENTITAS_SEKOLAH.sql`
- [ ] Verify data di `info_sekolah_keasramaan`
- [ ] Deploy aplikasi
- [ ] Test halaman `/identitas-sekolah`
- [ ] Isi data untuk setiap cabang
- [ ] Test generate surat izin per cabang
- [ ] Verify data kepala asrama auto-populate
- [ ] Training user per cabang

---

## 🎉 Kesimpulan

Update ini membuat sistem lebih efisien dan akurat dengan:
- ✅ Satu halaman untuk identitas sekolah
- ✅ Data otomatis mengikuti cabang
- ✅ Auto-populate dari master data
- ✅ Integrasi sempurna dengan surat izin

**Status:** ✅ READY FOR DEPLOYMENT

---

**Version:** 1.1.0
**Last Updated:** 2025-11-12
**Developed By:** HSI Boarding School Development Team
