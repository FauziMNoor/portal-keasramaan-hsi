# Fitur Catatan Perilaku di Laporan Wali Santri

## Overview
Fitur ini menambahkan ringkasan catatan perilaku (pelanggaran dan kebaikan) pada halaman Laporan Wali Santri, ditampilkan di bawah dashboard "Periode Pertumbuhan".

## URL
`/habit-tracker/laporan/[token]/[nis]`

Contoh: `https://asrama.smaithsi.sch.id/habit-tracker/laporan/8d5cc68df2c512741c864879727f7e71/202410020`

## Fitur yang Ditambahkan

### 1. Ringkasan Poin
Menampilkan 3 kartu ringkasan:
- **Total Kebaikan**: Jumlah poin positif dan jumlah catatan kebaikan
- **Total Pelanggaran**: Jumlah poin negatif dan jumlah catatan pelanggaran
- **Total Poin Akhir**: Hasil penjumlahan kebaikan + pelanggaran (dengan warna dinamis)

### 2. Detail Catatan
Menampilkan daftar detail untuk:
- **Kebaikan**: Maksimal 5 catatan terbaru dengan badge hijau
- **Pelanggaran**: Maksimal 5 catatan terbaru dengan badge merah

Setiap catatan menampilkan:
- Nama kategori
- Deskripsi tambahan (jika ada)
- Tanggal kejadian
- Poin yang diperoleh

### 3. Filter Periode
Data catatan perilaku mengikuti periode yang dipilih:
- **30 Hari**: Menampilkan catatan 30 hari terakhir
- **Semester**: Menampilkan catatan semester aktif

## Implementasi Teknis

### Database Query
```typescript
// Fetch catatan perilaku berdasarkan NIS dan periode
const fetchCatatanPerilaku = async () => {
  let query = supabase
    .from('catatan_perilaku_keasramaan')
    .select('*')
    .eq('nis', nis);

  if (selectedPeriod === 'month') {
    // 30 hari terakhir
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const startDate = date.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    query = query.gte('tanggal', startDate).lte('tanggal', endDate);
  } else {
    // Semester aktif
    if (activeSemester) {
      const { data: tahunAjaranData } = await supabase
        .from('tahun_ajaran_keasramaan')
        .select('tahun_ajaran')
        .eq('status', 'aktif')
        .single();

      if (tahunAjaranData) {
        query = query
          .ilike('semester', activeSemester.semester)
          .ilike('tahun_ajaran', tahunAjaranData.tahun_ajaran);
      }
    }
  }

  const { data, error } = await query.order('tanggal', { ascending: false });
  // Process data...
};
```

### Data Structure
```typescript
interface CatatanPerilaku {
  id: string;
  tipe: 'pelanggaran' | 'kebaikan';
  tanggal: string;
  nama_kategori: string;
  poin: number;
  deskripsi_tambahan?: string;
}

interface RingkasanCatatanPerilaku {
  pelanggaran: CatatanPerilaku[];
  kebaikan: CatatanPerilaku[];
  totalPoinPelanggaran: number;
  totalPoinKebaikan: number;
  totalPoinAkhir: number;
}
```

### Perhitungan Poin
```typescript
const totalPoinPelanggaran = pelanggaran.reduce((sum, item) => sum + item.poin, 0);
const totalPoinKebaikan = kebaikan.reduce((sum, item) => sum + item.poin, 0);
const totalPoinAkhir = totalPoinKebaikan + totalPoinPelanggaran; // poin pelanggaran sudah negatif
```

## UI/UX Design

### Color Scheme
- **Kebaikan**: Hijau (green-500, green-50)
- **Pelanggaran**: Merah (red-500, red-50)
- **Total Positif**: Biru (blue-500, blue-50)
- **Total Negatif**: Orange (orange-500, orange-50)

### Responsive Design
- Mobile-first approach
- Grid 3 kolom untuk summary cards
- Responsive text sizes (text-xs sm:text-sm)
- Responsive padding (p-3 sm:p-4)

### Empty State
Jika tidak ada catatan perilaku, menampilkan:
```
📝
Belum ada catatan perilaku
pada periode ini
```

## Testing

### Test Cases
1. ✅ Tampilkan catatan perilaku periode 30 hari
2. ✅ Tampilkan catatan perilaku semester aktif
3. ✅ Hitung total poin dengan benar
4. ✅ Tampilkan maksimal 5 catatan per kategori
5. ✅ Tampilkan empty state jika tidak ada data
6. ✅ Responsive di mobile dan desktop
7. ✅ Warna dinamis berdasarkan total poin

### Manual Testing
1. Buka halaman laporan wali santri
2. Pilih periode "30 Hari"
3. Verifikasi data catatan perilaku muncul
4. Pilih periode "Semester"
5. Verifikasi data berubah sesuai semester aktif
6. Cek perhitungan total poin
7. Test di berbagai ukuran layar

## Files Modified
- `portal-keasramaan/app/habit-tracker/laporan/[token]/[nis]/page.tsx`

## Dependencies
- Supabase client
- React hooks (useState, useEffect)
- Lucide icons (Heart, Sparkles)
- Tailwind CSS

## Future Enhancements
1. Tambahkan filter berdasarkan tipe (kebaikan/pelanggaran)
2. Tambahkan pagination untuk catatan lebih dari 5
3. Tambahkan grafik trend poin perilaku
4. Export laporan catatan perilaku ke PDF
5. Notifikasi untuk wali santri jika ada catatan baru

## Notes
- Data catatan perilaku diambil dari tabel `catatan_perilaku_keasramaan`
- Poin pelanggaran disimpan sebagai nilai negatif di database
- Filter periode mengikuti logika yang sama dengan habit tracker
- Semester aktif diambil dari tabel `semester_keasramaan`
