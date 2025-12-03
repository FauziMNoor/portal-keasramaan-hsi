# Quick Start: Catatan Perilaku di Laporan Wali Santri

## Cara Mengakses

1. Buka halaman Laporan Wali Santri:
   ```
   /habit-tracker/laporan/[token]/[nis]
   ```

2. Contoh URL:
   ```
   https://asrama.smaithsi.sch.id/habit-tracker/laporan/8d5cc68df2c512741c864879727f7e71/202410020
   ```

## Apa yang Ditampilkan?

### 1. Ringkasan Poin (3 Kartu)
```
┌─────────────┬─────────────┬─────────────┐
│  Kebaikan   │ Pelanggaran │ Total Poin  │
│    +50      │     -20     │    +30      │
│ 10 Kebaikan │ 4 Pelanggaran│            │
└─────────────┴─────────────┴─────────────┘
```

### 2. Detail Kebaikan (Maksimal 5)
```
┌────────────────────────────────────────┐
│ ❤️ Kebaikan (10)                       │
├────────────────────────────────────────┤
│ Imam Shalat Berjamaah          +10    │
│ Memimpin kegiatan pagi                │
│ 15 Nov 2024                           │
├────────────────────────────────────────┤
│ Hafalan Quran Bertambah        +10    │
│ Hafal 1 halaman baru                  │
│ 14 Nov 2024                           │
└────────────────────────────────────────┘
```

### 3. Detail Pelanggaran (Maksimal 5)
```
┌────────────────────────────────────────┐
│ ⚠️ Pelanggaran (4)                     │
├────────────────────────────────────────┤
│ Terlambat Shalat Berjamaah      -5    │
│ Terlambat 10 menit                    │
│ 13 Nov 2024                           │
├────────────────────────────────────────┤
│ Tidak Mengikuti Piket           -5    │
│ Tidak hadir piket pagi                │
│ 12 Nov 2024                           │
└────────────────────────────────────────┘
```

## Filter Periode

### 30 Hari
- Menampilkan catatan 30 hari terakhir
- Otomatis update setiap hari

### Semester
- Menampilkan catatan semester aktif
- Sesuai dengan tahun ajaran aktif

## Warna Indikator

| Kondisi | Warna | Arti |
|---------|-------|------|
| Total Poin ≥ 0 | Biru | Positif |
| Total Poin < 0 | Orange | Perlu Perhatian |
| Kebaikan | Hijau | Prestasi |
| Pelanggaran | Merah | Peringatan |

## Testing Checklist

- [ ] Buka halaman laporan wali santri
- [ ] Verifikasi 3 kartu ringkasan muncul
- [ ] Cek perhitungan total poin benar
- [ ] Pilih periode "30 Hari"
- [ ] Verifikasi data muncul
- [ ] Pilih periode "Semester"
- [ ] Verifikasi data berubah
- [ ] Cek detail kebaikan (max 5)
- [ ] Cek detail pelanggaran (max 5)
- [ ] Test di mobile
- [ ] Test di desktop

## Troubleshooting

### Data Tidak Muncul
1. Pastikan ada data catatan perilaku untuk NIS tersebut
2. Cek periode yang dipilih
3. Verifikasi semester aktif sudah diset

### Total Poin Salah
1. Cek data di tabel `catatan_perilaku_keasramaan`
2. Pastikan poin pelanggaran bernilai negatif
3. Verifikasi perhitungan: `totalKebaikan + totalPelanggaran`

### Empty State
Jika muncul "Belum ada catatan perilaku":
- Normal jika memang belum ada data
- Coba ganti periode
- Cek apakah NIS benar

## Tips

1. **Untuk Wali Santri**:
   - Cek laporan secara berkala
   - Perhatikan trend poin
   - Diskusikan dengan santri jika ada pelanggaran

2. **Untuk Musyrif**:
   - Input catatan secara konsisten
   - Berikan deskripsi yang jelas
   - Seimbangkan antara pelanggaran dan kebaikan

3. **Untuk Admin**:
   - Monitor data secara keseluruhan
   - Pastikan kategori poin sesuai
   - Update semester aktif tepat waktu

## Next Steps

Setelah fitur ini berjalan:
1. ✅ Test dengan data real
2. ✅ Kumpulkan feedback dari wali santri
3. ⏳ Tambahkan export PDF (future)
4. ⏳ Tambahkan notifikasi (future)
5. ⏳ Tambahkan grafik trend (future)
