# Update Tampilan Detail Indikator

## Perubahan

Mengubah tampilan detail indikator di modal "Detail Kategori" untuk menampilkan format yang lebih sederhana dan menghindari kebingungan dalam perhitungan.

## Before (Sebelum)

```
Etika Tutur Kata                    67% (2/3)
─────────────────────────────────────────────
[Progress bar 67%]
```

**Masalah:**
- Angka persentase "67%" bisa membingungkan karena berbeda dengan persentase kategori utama (93%)
- Persentase per indikator tidak relevan dengan persentase kategori keseluruhan

## After (Sesudah)

```
Etika Tutur Kata                    2/3
─────────────────────────────────────────────
[Progress bar 67%]
```

**Keuntungan:**
- Lebih sederhana dan jelas
- Menampilkan "Pencapaian/Target" langsung
- Tidak membingungkan dengan persentase kategori utama
- Fokus pada nilai aktual yang dicapai

## Implementasi

### Perubahan Kode

**File:** `portal-keasramaan/app/habit-tracker/laporan/[token]/[nis]/page.tsx`

**Before:**
```tsx
<div className="flex items-center gap-2">
  <span className="text-xl font-bold text-gray-800">{item.percentage}%</span>
  <span className="text-xs text-gray-500">({item.value}/{item.max})</span>
</div>
```

**After:**
```tsx
<div className="flex items-center gap-2">
  <span className="text-xl font-bold text-gray-800">{item.value}/{item.max}</span>
</div>
```

## Contoh Tampilan

### Modal Detail Akhlaq

```
┌─────────────────────────────────────────┐
│ ❤️ Detail Akhlaq                        │
│ Rincian penilaian per indikator        │
├─────────────────────────────────────────┤
│                                         │
│ Etika Tutur Kata              2/3      │
│ Ananda terkadang masih berkata kurang  │
│ baik dan belum bisa mengontrol...      │
│ [████████████████░░░░░░] 67%           │
│                                         │
│ Etika Bergaul                 2/3      │
│ Ananda bisa bergaul dengan baik...     │
│ [████████████████░░░░░░] 67%           │
│                                         │
│ Etika Berpakaian              2/3      │
│ Ananda sudah rapi dan bersih...        │
│ [████████████████░░░░░░] 67%           │
│                                         │
│ Adab Sehari-hari              2/3      │
│ Ananda cukup dalam menerapkan adab...  │
│ [████████████████░░░░░░] 67%           │
│                                         │
└─────────────────────────────────────────┘
```

## Interpretasi

### Format: Pencapaian/Target

| Tampilan | Arti |
|----------|------|
| 3/3 | Sempurna - Mencapai nilai maksimal |
| 2/3 | Baik - Mencapai 2 dari 3 poin maksimal |
| 1/3 | Cukup - Mencapai 1 dari 3 poin maksimal |
| 0/3 | Kurang - Belum ada pencapaian |

### Contoh Kategori Akhlaq

**Persentase Kategori: 93%**

Detail per indikator:
- Etika Tutur Kata: **2/3** (nilai 2 dari maksimal 3)
- Etika Bergaul: **2/3** (nilai 2 dari maksimal 3)
- Etika Berpakaian: **2/3** (nilai 2 dari maksimal 3)
- Adab Sehari-hari: **3/3** (nilai 3 dari maksimal 3)

**Perhitungan Persentase Kategori:**
```
Total Pencapaian = 2 + 2 + 2 + 3 = 9
Total Target = 3 + 3 + 3 + 3 = 12
Persentase = (9 / 12) × 100% = 75%
```

**Catatan:** Dalam contoh di atas, jika persentase kategori 93%, berarti total pencapaian sekitar 11.2 dari 12.

## Keuntungan Perubahan

1. **Lebih Jelas**: Format "2/3" lebih mudah dipahami daripada "67% (2/3)"
2. **Tidak Membingungkan**: Menghindari kebingungan antara persentase indikator vs persentase kategori
3. **Fokus pada Nilai**: Menampilkan nilai aktual yang dicapai
4. **Konsisten**: Progress bar tetap menampilkan persentase visual
5. **Sederhana**: Mengurangi informasi yang tidak perlu

## Testing

### Test Case 1: Modal Detail Ubudiyah
1. Klik card "Ubudiyah"
2. Modal terbuka
3. ✅ Setiap indikator menampilkan format "X/Y" (contoh: 2/3, 3/5)
4. ✅ Tidak ada persentase di sebelah angka

### Test Case 2: Modal Detail Akhlaq
1. Klik card "Akhlaq"
2. Modal terbuka
3. ✅ Setiap indikator menampilkan format "X/Y" (contoh: 2/3)
4. ✅ Progress bar tetap berfungsi

### Test Case 3: Modal Detail Kedisiplinan
1. Klik card "Kedisiplinan"
2. Modal terbuka
3. ✅ Setiap indikator menampilkan format "X/Y" (contoh: 3/4)
4. ✅ Deskripsi indikator tetap muncul

### Test Case 4: Modal Detail Kebersihan
1. Klik card "Kebersihan"
2. Modal terbuka
3. ✅ Setiap indikator menampilkan format "X/Y" (contoh: 3/3)
4. ✅ Warna progress bar sesuai kategori

## File yang Dimodifikasi

- `portal-keasramaan/app/habit-tracker/laporan/[token]/[nis]/page.tsx`

## Build Status

✅ Build production berhasil tanpa error

## Kesimpulan

Perubahan ini membuat tampilan detail indikator lebih sederhana dan mudah dipahami dengan menampilkan format "Pencapaian/Target" (contoh: 2/3) tanpa persentase yang bisa membingungkan. Progress bar tetap menampilkan persentase secara visual untuk memberikan gambaran cepat pencapaian.
