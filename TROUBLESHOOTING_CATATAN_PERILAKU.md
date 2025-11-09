# Troubleshooting: Catatan Perilaku Tidak Muncul

## Masalah
Fitur "Catatan Perilaku" tidak muncul di bawah "Periode Pertumbuhan" pada halaman Laporan Wali Santri.

## Solusi

### 1. Restart Development Server
```bash
# Stop server (Ctrl+C)
# Kemudian jalankan lagi
npm run dev
# atau
yarn dev
```

### 2. Clear Browser Cache
**Chrome/Edge:**
- Tekan `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac)
- Atau buka DevTools (F12) → klik kanan pada tombol refresh → pilih "Empty Cache and Hard Reload"

**Firefox:**
- Tekan `Ctrl + F5` (Windows) atau `Cmd + Shift + R` (Mac)

### 3. Cek Console Browser
Buka DevTools (F12) → tab Console, cek apakah ada error:

**Error yang mungkin muncul:**
```
Error fetching catatan perilaku: ...
```

**Solusi:**
- Pastikan tabel `catatan_perilaku_keasramaan` sudah dibuat
- Cek RLS policies sudah diaktifkan
- Verifikasi koneksi Supabase

### 4. Cek Data di Database

**Query untuk cek data:**
```sql
-- Cek apakah ada data catatan perilaku untuk NIS tertentu
SELECT * FROM catatan_perilaku_keasramaan 
WHERE nis = '202410020' 
ORDER BY tanggal DESC;

-- Cek jumlah data per tipe
SELECT tipe, COUNT(*) as jumlah 
FROM catatan_perilaku_keasramaan 
WHERE nis = '202410020' 
GROUP BY tipe;
```

**Jika tidak ada data:**
- Fitur akan menampilkan empty state: "Belum ada catatan perilaku"
- Ini normal jika memang belum ada data
- Tambahkan data dummy untuk testing

### 5. Tambah Data Dummy untuk Testing

```sql
-- Insert data kebaikan
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'kebaikan',
  CURRENT_DATE,
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_kebaikan_keasramaan WHERE nama_kategori = 'Imam Shalat Berjamaah' LIMIT 1),
  'Imam Shalat Berjamaah',
  10,
  'Admin',
  '2024/2025',
  'Semester 1'
);

-- Insert data pelanggaran
INSERT INTO catatan_perilaku_keasramaan (
  tipe, tanggal, nis, nama_siswa, cabang, kelas, asrama,
  kategori_id, nama_kategori, poin, dicatat_oleh,
  tahun_ajaran, semester
) VALUES (
  'pelanggaran',
  CURRENT_DATE - INTERVAL '1 day',
  '202410020',
  'M. Sovra Aludjava Pasopati',
  'Pusat',
  '11 - Ibnu Hajar',
  'Mumtaz',
  (SELECT id FROM kategori_pelanggaran_keasramaan WHERE nama_kategori = 'Terlambat Shalat Berjamaah' LIMIT 1),
  'Terlambat Shalat Berjamaah',
  -5,
  'Admin',
  '2024/2025',
  'Semester 1'
);
```

### 6. Verifikasi Kode

**Cek apakah fungsi dipanggil:**
Tambahkan console.log di fungsi `fetchCatatanPerilaku`:

```typescript
const fetchCatatanPerilaku = async () => {
  console.log('🔍 Fetching catatan perilaku for NIS:', nis);
  console.log('📅 Selected period:', selectedPeriod);
  
  try {
    // ... rest of code
    
    console.log('✅ Catatan perilaku fetched:', data?.length, 'records');
  } catch (error) {
    console.error('❌ Error fetching catatan perilaku:', error);
  }
};
```

### 7. Cek Network Tab

Buka DevTools (F12) → tab Network:
- Filter: `catatan_perilaku`
- Cek apakah ada request ke Supabase
- Cek response data

**Response yang diharapkan:**
```json
[
  {
    "id": "...",
    "tipe": "kebaikan",
    "tanggal": "2024-11-09",
    "nama_kategori": "Imam Shalat Berjamaah",
    "poin": 10,
    ...
  }
]
```

### 8. Cek Periode Filter

**Masalah:** Data ada tapi tidak muncul karena filter periode

**Solusi:**
- Coba ganti periode dari "30 Hari" ke "Semester" atau sebaliknya
- Pastikan data tanggal sesuai dengan periode yang dipilih
- Cek semester aktif sudah diset dengan benar

**Query cek semester aktif:**
```sql
SELECT * FROM semester_keasramaan WHERE status = 'aktif';
SELECT * FROM tahun_ajaran_keasramaan WHERE status = 'aktif';
```

### 9. Build Production

Jika masih tidak muncul di production:

```bash
# Clean build
rm -rf .next
npm run build
npm run start
```

### 10. Cek File Sudah Tersimpan

Pastikan perubahan sudah tersimpan:
```bash
git status
git diff portal-keasramaan/app/habit-tracker/laporan/[token]/[nis]/page.tsx
```

## Checklist Debugging

- [ ] Restart development server
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Cek console browser untuk error
- [ ] Cek data di database (minimal 1 record)
- [ ] Cek network tab untuk request API
- [ ] Cek periode filter (30 Hari vs Semester)
- [ ] Cek semester aktif sudah diset
- [ ] Tambah console.log untuk debugging
- [ ] Verifikasi NIS yang digunakan benar
- [ ] Test dengan data dummy

## Kontak

Jika masih bermasalah setelah semua langkah di atas:
1. Screenshot console error
2. Screenshot network tab
3. Screenshot query database
4. Kirim ke developer untuk investigasi lebih lanjut

## Expected Result

Setelah troubleshooting berhasil, Anda akan melihat:

```
┌─────────────────────────────────────────┐
│ Periode Pertumbuhan                     │
│ [Chart Area]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Catatan Perilaku                        │
│ Ringkasan pelanggaran dan kebaikan      │
│                                         │
│ ┌──────┬──────────┬──────────┐        │
│ │ +50  │   -20    │   +30    │        │
│ │Kebaikan│Pelanggaran│Total   │        │
│ └──────┴──────────┴──────────┘        │
│                                         │
│ ❤️ Kebaikan (10)                       │
│ [List of kebaikan...]                  │
│                                         │
│ ⚠️ Pelanggaran (4)                     │
│ [List of pelanggaran...]               │
└─────────────────────────────────────────┘
```
