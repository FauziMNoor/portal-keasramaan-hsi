# Debug Filter Musyrif

## Langkah Debug:

### 1. Cek Data di Database
Jalankan query ini di Supabase SQL Editor:

```sql
-- Lihat semua data habit tracker dengan cabang, asrama, dan musyrif
SELECT DISTINCT cabang, asrama, musyrif 
FROM formulir_habit_tracker_keasramaan 
WHERE cabang = 'HSI Boarding School Sukabumi'
  AND asrama = 'Imam Bukhari'
ORDER BY musyrif;
```

**Expected Result:** Hanya musyrif yang mengajar di Imam Bukhari (Ammar dan Mu'tashim)

### 2. Cek Console Browser
1. Buka browser (F12)
2. Pilih tab **Console**
3. Pilih Cabang: "HSI Boarding School Sukabumi"
4. Pilih Asrama: "Imam Bukhari"
5. Lihat output console.log

**Yang harus muncul:**
```
=== FILTERING MUSYRIF ===
Current filters: { cabang: "HSI Boarding School Sukabumi", asrama: "Imam Bukhari" }
Total habit data: XXX
Filtered data count: YYY
Sample filtered data: [...]
Unique musyrif after filter: ["Muhammad Ammar", "M. Mu'tashim Abdulloh"]
```

### 3. Kemungkinan Masalah:

#### A. Data di database tidak konsisten
- Nama asrama di database berbeda dengan yang dipilih
- Contoh: "Imam Bukhari" vs "imam bukhari" vs "Imam Bukhari " (ada spasi)

**Solusi:** Cek dengan query:
```sql
SELECT DISTINCT asrama, LENGTH(asrama) as len
FROM formulir_habit_tracker_keasramaan 
WHERE cabang = 'HSI Boarding School Sukabumi';
```

#### B. Musyrif tidak ter-record dengan benar
- Ada musyrif yang tidak punya relasi dengan asrama
- Data musyrif kosong atau null

**Solusi:** Cek dengan query:
```sql
SELECT asrama, musyrif, COUNT(*) as count
FROM formulir_habit_tracker_keasramaan 
WHERE cabang = 'HSI Boarding School Sukabumi'
GROUP BY asrama, musyrif
ORDER BY asrama, musyrif;
```

#### C. Filter tidak ter-apply karena timing
- useMemo tidak ter-trigger
- State tidak update

**Solusi:** Lihat console.log apakah "=== FILTERING MUSYRIF ===" muncul setiap kali ganti asrama

### 4. Test Manual

Tambahkan button test di dashboard untuk debug:

```tsx
<button 
  onClick={() => {
    console.log('=== MANUAL TEST ===');
    console.log('filters:', filters);
    console.log('allHabitData length:', allHabitData.length);
    console.log('filteredMusyrifList:', filteredMusyrifList);
  }}
  className="px-4 py-2 bg-red-500 text-white rounded"
>
  DEBUG
</button>
```

### 5. Cek Network Tab
1. Buka Developer Tools → Network tab
2. Refresh halaman
3. Cari request ke Supabase
4. Lihat response data

Pastikan data yang di-fetch sudah benar.

## Action Items:

1. ☐ Jalankan query SQL di atas
2. ☐ Screenshot console.log
3. ☐ Cek apakah nama asrama exact match
4. ☐ Cek apakah ada trailing spaces
5. ☐ Share hasil query dan console.log
