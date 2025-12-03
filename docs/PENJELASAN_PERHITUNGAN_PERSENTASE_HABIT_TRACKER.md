# Penjelasan Perhitungan Persentase Habit Tracker

## Overview
Dokumen ini menjelaskan cara menghitung persentase untuk 4 kategori di Laporan Wali Santri:
- **Ubudiyah**: 75%
- **Akhlaq**: 93%
- **Kedisiplinan**: 78%
- **Kebersihan**: 99%

## Konsep Dasar

Setiap kategori memiliki beberapa indikator dengan nilai maksimal tertentu. Persentase dihitung berdasarkan:

```
Persentase = (Total Rata-rata / Total Maksimal) × 100%
```

## 1. Kategori UBUDIYAH (75%)

### Indikator dan Nilai Maksimal:
| No | Indikator | Nilai Max |
|----|-----------|-----------|
| 1 | Shalat Fardhu Berjamaah | 3 |
| 2 | Tata Cara Shalat | 3 |
| 3 | Qiyamul Lail | 3 |
| 4 | Shalat Sunnah | 3 |
| 5 | Puasa Sunnah | 5 |
| 6 | Tata Cara Wudhu | 3 |
| 7 | Sedekah | 4 |
| 8 | Dzikir Pagi Petang | 4 |
| **TOTAL** | | **28** |

### Cara Perhitungan:

**Step 1: Hitung Rata-rata Setiap Indikator**
```javascript
// Contoh data periode (misal 30 hari):
// Hari 1: shalat_fardhu_berjamaah = 3
// Hari 2: shalat_fardhu_berjamaah = 2
// Hari 3: shalat_fardhu_berjamaah = 3
// ... dst

const avg = (records, field) => {
  const values = records.map(r => parseFloat(r[field]) || 0).filter(v => v > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

// Rata-rata setiap indikator:
avgUbudiyah = {
  shalat_fardhu_berjamaah: 2.8,  // rata-rata dari semua hari
  tata_cara_shalat: 2.5,
  qiyamul_lail: 2.0,
  shalat_sunnah: 2.3,
  puasa_sunnah: 3.5,
  tata_cara_wudhu: 2.7,
  sedekah: 3.0,
  dzikir_pagi_petang: 2.2,
}
```

**Step 2: Jumlahkan Semua Rata-rata**
```javascript
total_ubudiyah = 2.8 + 2.5 + 2.0 + 2.3 + 3.5 + 2.7 + 3.0 + 2.2
total_ubudiyah = 21.0
```

**Step 3: Hitung Persentase**
```javascript
persentase_ubudiyah = (total_ubudiyah / 28) × 100
persentase_ubudiyah = (21.0 / 28) × 100
persentase_ubudiyah = 0.75 × 100
persentase_ubudiyah = 75%
```

## 2. Kategori AKHLAQ (93%)

### Indikator dan Nilai Maksimal:
| No | Indikator | Nilai Max |
|----|-----------|-----------|
| 1 | Etika Tutur Kata | 3 |
| 2 | Etika Bergaul | 3 |
| 3 | Etika Berpakaian | 3 |
| 4 | Adab Sehari-hari | 3 |
| **TOTAL** | | **12** |

### Cara Perhitungan:

**Step 1: Hitung Rata-rata**
```javascript
avgAkhlaq = {
  etika_dalam_tutur_kata: 2.8,
  etika_dalam_bergaul: 2.9,
  etika_dalam_berpakaian: 2.7,
  adab_sehari_hari: 2.8,
}
```

**Step 2: Jumlahkan**
```javascript
total_akhlaq = 2.8 + 2.9 + 2.7 + 2.8
total_akhlaq = 11.2
```

**Step 3: Hitung Persentase**
```javascript
persentase_akhlaq = (11.2 / 12) × 100
persentase_akhlaq = 0.933 × 100
persentase_akhlaq = 93%
```

## 3. Kategori KEDISIPLINAN (78%)

### Indikator dan Nilai Maksimal:
| No | Indikator | Nilai Max |
|----|-----------|-----------|
| 1 | Waktu Tidur | 4 |
| 2 | Piket Kamar | 3 |
| 3 | Halaqah Tahfidz | 3 |
| 4 | Perizinan | 3 |
| 5 | Belajar Malam | 4 |
| 6 | Berangkat Masjid | 4 |
| **TOTAL** | | **21** |

### Cara Perhitungan:

**Step 1: Hitung Rata-rata**
```javascript
avgKedisiplinan = {
  waktu_tidur: 3.0,
  pelaksanaan_piket_kamar: 2.5,
  disiplin_halaqah_tahfidz: 2.3,
  perizinan: 2.8,
  belajar_malam: 3.2,
  disiplin_berangkat_ke_masjid: 2.6,
}
```

**Step 2: Jumlahkan**
```javascript
total_kedisiplinan = 3.0 + 2.5 + 2.3 + 2.8 + 3.2 + 2.6
total_kedisiplinan = 16.4
```

**Step 3: Hitung Persentase**
```javascript
persentase_kedisiplinan = (16.4 / 21) × 100
persentase_kedisiplinan = 0.781 × 100
persentase_kedisiplinan = 78%
```

## 4. Kategori KEBERSIHAN (99%)

### Indikator dan Nilai Maksimal:
| No | Indikator | Nilai Max |
|----|-----------|-----------|
| 1 | Kebersihan Tubuh & Pakaian | 3 |
| 2 | Kamar | 3 |
| 3 | Ranjang & Almari | 3 |
| **TOTAL** | | **9** |

### Cara Perhitungan:

**Step 1: Hitung Rata-rata**
```javascript
avgKebersihan = {
  kebersihan_tubuh_berpakaian_berpenampilan: 3.0,
  kamar: 2.9,
  ranjang_dan_almari: 3.0,
}
```

**Step 2: Jumlahkan**
```javascript
total_kebersihan = 3.0 + 2.9 + 3.0
total_kebersihan = 8.9
```

**Step 3: Hitung Persentase**
```javascript
persentase_kebersihan = (8.9 / 9) × 100
persentase_kebersihan = 0.989 × 100
persentase_kebersihan = 99%
```

## Kode Implementasi

```typescript
const calculateStats = (data: any[]) => {
  // Helper function untuk menghitung rata-rata
  const avg = (records: any[], field: string): number => {
    const values = records.map(r => parseFloat(r[field]) || 0).filter(v => v > 0);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // Hitung rata-rata untuk setiap indikator
  const avgUbudiyah = {
    shalat_fardhu_berjamaah: avg(data, 'shalat_fardhu_berjamaah'),
    tata_cara_shalat: avg(data, 'tata_cara_shalat'),
    qiyamul_lail: avg(data, 'qiyamul_lail'),
    shalat_sunnah: avg(data, 'shalat_sunnah'),
    puasa_sunnah: avg(data, 'puasa_sunnah'),
    tata_cara_wudhu: avg(data, 'tata_cara_wudhu'),
    sedekah: avg(data, 'sedekah'),
    dzikir_pagi_petang: avg(data, 'dzikir_pagi_petang'),
  };

  // Calculate totals
  const total_ubudiyah = Object.values(avgUbudiyah).reduce((sum, val) => sum + val, 0);

  // Calculate percentages
  const persentase_ubudiyah = Math.min(100, (total_ubudiyah / 28) * 100);

  // ... dst untuk kategori lainnya
};
```

## Contoh Kasus Nyata

### Santri: M. Sovra Aludjava Pasopati
### Periode: Semester 1 (30 hari data)

**Data Input (contoh 3 hari):**

| Tanggal | Shalat Fardhu | Tata Cara Shalat | ... | Total Ubudiyah |
|---------|---------------|------------------|-----|----------------|
| 1 Nov   | 3 | 3 | ... | 25 |
| 2 Nov   | 2 | 3 | ... | 22 |
| 3 Nov   | 3 | 2 | ... | 21 |
| ... | ... | ... | ... | ... |
| **Rata-rata** | **2.8** | **2.7** | ... | **21.0** |

**Perhitungan:**
```
Persentase Ubudiyah = (21.0 / 28) × 100 = 75%
```

## Catatan Penting

1. **Rata-rata Periode**: Perhitungan menggunakan rata-rata dari semua data dalam periode (30 hari atau semester)
2. **Filter Nilai 0**: Nilai 0 tidak dihitung dalam rata-rata (dianggap tidak ada data)
3. **Pembulatan**: Hasil akhir dibulatkan ke bilangan bulat terdekat
4. **Maksimal 100%**: Jika perhitungan melebihi 100%, akan di-cap menjadi 100%
5. **Konsistensi**: Logika perhitungan sama persis dengan halaman Rekap Habit Tracker

## Formula Umum

```
Persentase Kategori = MIN(100, (Σ Rata-rata Indikator / Σ Nilai Maksimal) × 100)
```

Dimana:
- **Σ Rata-rata Indikator** = Jumlah rata-rata semua indikator dalam kategori
- **Σ Nilai Maksimal** = Jumlah nilai maksimal semua indikator dalam kategori
- **MIN(100, x)** = Ambil nilai minimum antara 100 dan x (untuk cap maksimal 100%)

## Referensi

- File: `portal-keasramaan/app/habit-tracker/laporan/[token]/[nis]/page.tsx`
- Fungsi: `calculateStats(data: any[])`
- Logika sama dengan: `portal-keasramaan/app/habit-tracker/rekap/page.tsx`
