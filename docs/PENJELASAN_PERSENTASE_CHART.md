# 📊 Penjelasan Perhitungan Persentase Chart

## Radial Bar Chart - "Perkembangan Nilai Habit"

### 🎯 Pertanyaan: Dari mana angka persentase didapat?

Contoh hasil yang ditampilkan:

- **Akhlaq (100%)**
- **Kebersihan (100%)**
- **Kedisiplinan (86%)**
- **Ubudiyah (82%)**

---

## 📐 Cara Perhitungan (Step by Step)

### **Step 1: Hitung Rata-rata Nilai per Kategori**

Data habit tracker dikumpulkan per minggu. Misalnya dalam 1 bulan ada 4 minggu:

**Contoh Data Ubudiyah:**

- Minggu 1: 23 poin
- Minggu 2: 24 poin
- Minggu 3: 22 poin
- Minggu 4: 24 poin

**Rata-rata Ubudiyah** = (23 + 24 + 22 + 24) ÷ 4 = **23 poin**

Begitu juga untuk kategori lainnya:

- Rata-rata Akhlaq = 12 poin
- Rata-rata Kedisiplinan = 18 poin
- Rata-rata Kebersihan = 9 poin

---

### **Step 2: Tentukan Nilai Maksimal per Kategori**

Setiap kategori punya nilai maksimal berbeda berdasarkan jumlah indikator:

| Kategori         | Jumlah Indikator | Nilai Maksimal |
| ---------------- | ---------------- | -------------- |
| **Ubudiyah**     | 8 indikator      | **28 poin**    |
| **Akhlaq**       | 4 indikator      | **12 poin**    |
| **Kedisiplinan** | 6 indikator      | **21 poin**    |
| **Kebersihan**   | 3 indikator      | **9 poin**     |

**Detail Indikator:**

**Ubudiyah (8 indikator):**

1. Shalat Fardhu Berjamaah (max 3)
2. Tata Cara Shalat (max 3)
3. Qiyamul Lail (max 3)
4. Shalat Sunnah (max 3)
5. Puasa Sunnah (max 5)
6. Tata Cara Wudhu (max 3)
7. Sedekah (max 4)
8. Dzikir Pagi Petang (max 4)
   **Total: 28 poin**

**Akhlaq (4 indikator):**

1. Etika Tutur Kata (max 3)
2. Etika Bergaul (max 3)
3. Etika Berpakaian (max 3)
4. Adab Sehari-hari (max 3)
   **Total: 12 poin**

**Kedisiplinan (6 indikator):**

1. Waktu Tidur (max 4)
2. Piket Kamar (max 3)
3. Halaqah Tahfidz (max 3)
4. Perizinan (max 3)
5. Belajar Malam (max 4)
6. Berangkat Masjid (max 4)
   **Total: 21 poin**

**Kebersihan (3 indikator):**

1. Kebersihan Tubuh (max 3)
2. Kamar (max 3)
3. Ranjang & Almari (max 3)
   **Total: 9 poin**

---

### **Step 3: Hitung Persentase**

**Rumus:**

```
Persentase = (Nilai Rata-rata ÷ Nilai Maksimal) × 100%
```

**Contoh Perhitungan:**

1. **Ubudiyah:**

   - Nilai rata-rata: 23 poin
   - Nilai maksimal: 28 poin
   - Persentase = (23 ÷ 28) × 100% = 82.14% ≈ **82%**

2. **Akhlaq:**

   - Nilai rata-rata: 12 poin
   - Nilai maksimal: 12 poin
   - Persentase = (12 ÷ 12) × 100% = **100%**

3. **Kedisiplinan:**

   - Nilai rata-rata: 18 poin
   - Nilai maksimal: 21 poin
   - Persentase = (18 ÷ 21) × 100% = 85.71% ≈ **86%**

4. **Kebersihan:**
   - Nilai rata-rata: 9 poin
   - Nilai maksimal: 9 poin
   - Persentase = (9 ÷ 9) × 100% = **100%**

---

## 🎨 Visualisasi di Chart

Persentase ini kemudian ditampilkan sebagai **Radial Bar (Progress Ring)**:

- **100%** = Ring penuh (360°)
- **82%** = Ring 82% dari lingkaran penuh
- **86%** = Ring 86% dari lingkaran penuh

**Warna:**

- 🟢 Hijau = Ubudiyah (82%)
- 🟡 Kuning = Akhlaq (100%)
- 🔵 Biru = Kedisiplinan (86%)
- 🔴 Pink = Kebersihan (100%)

---

## 💡 Interpretasi

- **100%** = Sempurna! Santri mencapai nilai maksimal di kategori ini
- **82-86%** = Sangat Baik! Mendekati nilai maksimal
- **< 70%** = Perlu perhatian dan peningkatan

**Total di Tengah Chart:**

- Menampilkan jumlah total dari semua kategori
- Contoh: 23 + 12 + 18 + 9 = **62 dari 70**

---

## 🔍 Keuntungan Menggunakan Persentase

1. **Fair Comparison** - Setiap kategori punya bobot berbeda, persentase membuat perbandingan adil
2. **Easy to Understand** - Orang lebih mudah memahami "82%" daripada "23 dari 28"
3. **Visual Impact** - Progress ring lebih menarik secara visual
4. **Quick Insight** - Langsung terlihat kategori mana yang kuat/lemah

---

## 📝 Catatan Teknis

**Kode di TrendChart.tsx:**

```typescript
// Hitung rata-rata
const avgUbudiyah = Math.round(
  data.reduce((sum, d) => sum + d.ubudiyah, 0) / data.length
);

// Konversi ke persentase
const persentaseUbudiyah = Math.round((avgUbudiyah / 28) * 100);
```

**Data Flow:**

1. Data mentah dari database (per minggu)
2. Agregasi menjadi rata-rata
3. Konversi ke persentase
4. Render sebagai Radial Bar Chart

---

**Status**: ✅ Implemented & Working
**Accuracy**: ✅ Mathematically Correct
**User Friendly**: ✅ Easy to Understand
