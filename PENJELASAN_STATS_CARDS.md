# 📊 Penjelasan Stats Cards - Dashboard Habit Tracker

## 🎯 4 Cards Utama

### **1. Card Hijau - Santri Disiplin** 🎯

**Tampilan:**

```
36/36                    100%
Santri Disiplin
Rata-rata > 2.5
```

**Maksud:**

- **36/36** = 36 santri disiplin dari total 36 santri
- **100%** = Persentase santri disiplin
- **Rata-rata > 2.5** = Kriteria disiplin

**Cara Perhitungan:**

```typescript
// 1. Hitung rata-rata nilai per santri
const rataRataSantri = totalNilai / 70; // Max 70 poin

// 2. Santri dianggap disiplin jika rata-rata > 2.5
// Artinya: (totalNilai / 70) > 0.357
// Atau: totalNilai > 25 poin

// 3. Hitung jumlah santri yang memenuhi kriteria
const santriDisiplin = santriList.filter((s) => s.rata_rata / 70 > 0.357);

// 4. Hitung persentase
const persentase = (santriDisiplin / totalSantri) * 100;
```

**Contoh:**

- Total santri: 36
- Santri dengan nilai > 25: 36 orang
- Persentase: (36/36) × 100% = 100%

**Interpretasi:**

- ✅ **100%** = Semua santri disiplin (luar biasa!)
- 🟢 **80-99%** = Sangat baik
- 🟡 **60-79%** = Baik
- 🟠 **40-59%** = Cukup
- 🔴 **< 40%** = Perlu perhatian

---

### **2. Card Biru - Rata-rata Habit** 📈

**Tampilan:**

```
62.8/70
Rata-rata Habit
Seluruh santri
```

**Maksud:**

- **62.8** = Rata-rata nilai habit dari semua santri
- **/70** = Dari nilai maksimal 70 poin
- **Seluruh santri** = Dihitung dari semua santri

**Cara Perhitungan:**

```typescript
// 1. Jumlahkan total nilai semua santri
const totalSemuaSantri = santriList.reduce((sum, s) => sum + s.rata_rata, 0);

// 2. Bagi dengan jumlah santri
const rataRata = totalSemuaSantri / totalSantri;

// Contoh:
// Santri 1: 65 poin
// Santri 2: 60 poin
// Santri 3: 63 poin
// Total: 188 poin
// Rata-rata: 188 / 3 = 62.67 ≈ 62.8
```

**Interpretasi:**

- 🟢 **60-70** = Excellent (85-100%)
- 🔵 **50-59** = Very Good (71-84%)
- 🟡 **40-49** = Good (57-70%)
- 🟠 **30-39** = Fair (43-56%)
- 🔴 **< 30** = Needs Improvement

**Persentase:**

- 62.8 / 70 = 0.897 = **89.7%** (Excellent!)

---

### **3. Card Kuning - Asrama Terbaik** 🏆

**Tampilan:**

```
An-Nawawi
Asrama Terbaik
Nilai: 63.5
```

**Maksud:**

- **An-Nawawi** = Nama asrama dengan nilai tertinggi
- **Nilai: 63.5** = Rata-rata nilai santri di asrama tersebut

**Cara Perhitungan:**

```typescript
// 1. Kelompokkan santri per asrama
const asramaStats = {};
santriList.forEach((santri) => {
  if (!asramaStats[santri.asrama]) {
    asramaStats[santri.asrama] = { total: 0, count: 0 };
  }
  asramaStats[santri.asrama].total += santri.rata_rata;
  asramaStats[santri.asrama].count += 1;
});

// 2. Hitung rata-rata per asrama
// Asrama An-Nawawi:
// - Santri 1: 65 poin
// - Santri 2: 62 poin
// Total: 127 poin
// Rata-rata: 127 / 2 = 63.5

// 3. Cari asrama dengan rata-rata tertinggi
let asramaTerbaik = { nama: "", nilai: 0 };
Object.entries(asramaStats).forEach(([nama, stats]) => {
  const avg = stats.total / stats.count;
  if (avg > asramaTerbaik.nilai) {
    asramaTerbaik = { nama, nilai: avg };
  }
});
```

**Kegunaan:**

- Identifikasi asrama dengan performa terbaik
- Benchmark untuk asrama lain
- Apresiasi untuk musyrif dan santri di asrama tersebut

---

### **4. Card Ungu - Musyrif Terbaik** 👨‍🏫

**Tampilan:**

```
Arif R. Tanjung
Musyrif Terbaik
9 santri
```

**Maksud:**

- **Arif R. Tanjung** = Nama musyrif terbaik
- **9 santri** = Jumlah santri dengan nilai baik (> 50) yang dibimbing

**Cara Perhitungan:**

```typescript
// 1. Kelompokkan santri per musyrif
// 2. Hitung jumlah santri dengan nilai > 50 per musyrif
const musyrifStats = {};
santriList.forEach((santri) => {
  if (santri.rata_rata > 50) {
    // Hanya santri dengan nilai baik
    musyrifStats[santri.musyrif] = (musyrifStats[santri.musyrif] || 0) + 1;
  }
});

// 3. Cari musyrif dengan jumlah santri baik terbanyak
// Musyrif Arif R. Tanjung:
// - Santri dengan nilai > 50: 9 orang
// - Ini yang terbanyak dibanding musyrif lain

let musyrifTerbaik = { nama: "", jumlahSantri: 0 };
Object.entries(musyrifStats).forEach(([nama, jumlah]) => {
  if (jumlah > musyrifTerbaik.jumlahSantri) {
    musyrifTerbaik = { nama, jumlahSantri: jumlah };
  }
});
```

**Kriteria:**

- Bukan jumlah santri terbanyak
- Tapi jumlah santri **dengan nilai baik (> 50)** terbanyak
- Menunjukkan efektivitas pembimbingan

**Kegunaan:**

- Apresiasi untuk musyrif yang efektif
- Benchmark untuk musyrif lain
- Identifikasi best practices

---

## 🔢 Pembulatan Angka

### **Masalah Saat Ini:**

- Rata-rata Habit: **62.8** (1 desimal)
- Asrama Terbaik: **63.5** (1 desimal)

### **Solusi:**

Bulatkan semua angka menjadi bilangan bulat:

- 62.8 → **63**
- 63.5 → **64**

---

## 📊 Data Flow

```
1. Database (formulir_habit_tracker_keasramaan)
   ↓
2. Filter (Tahun Ajaran, Semester, Lokasi, dll)
   ↓
3. Group by NIS (per santri)
   ↓
4. Calculate Average per Kategori
   ↓
5. Calculate Total (Ubudiyah + Akhlaq + Kedisiplinan + Kebersihan)
   ↓
6. Calculate Stats:
   - Santri Disiplin (total > 25)
   - Rata-rata Habit (average of all)
   - Asrama Terbaik (highest average per asrama)
   - Musyrif Terbaik (most santri with nilai > 50)
   ↓
7. Display in Cards
```

---

## 💡 Tips Interpretasi

### **Santri Disiplin (Card 1):**

- Target: > 80%
- Jika < 60%: Perlu evaluasi sistem pembinaan

### **Rata-rata Habit (Card 2):**

- Target: > 55 (78%)
- Jika < 45: Perlu program intensif

### **Asrama Terbaik (Card 3):**

- Pelajari best practices dari asrama ini
- Terapkan di asrama lain

### **Musyrif Terbaik (Card 4):**

- Sharing session dengan musyrif lain
- Dokumentasi metode pembinaan

---

## ✅ Summary

**4 Cards ini memberikan:**

1. **Overview Disiplin** - Berapa persen santri yang disiplin
2. **Performance Average** - Rata-rata performa keseluruhan
3. **Best Asrama** - Asrama dengan performa terbaik
4. **Best Musyrif** - Musyrif paling efektif

**Semua data real-time** berdasarkan filter yang dipilih (Tahun Ajaran, Semester, dll)

---

**Status**: ✅ Documented
**Next**: Bulatkan angka desimal
