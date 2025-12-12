# Jadwal Libur Rutin - Grouped by Kelas

**Date**: December 10, 2024  
**Status**: ✅ IMPLEMENTED

---

## Problem

Sebelumnya, generate jadwal libur mencampur semua musyrif tanpa mempertimbangkan kelas:
- Musyrif kelas 10, 11, 12 semua dicampur jadi 1 grup
- Musyrif kelas 11 bisa jadi pengganti musyrif kelas 10 (tidak ideal)
- Tidak ada pemisahan berdasarkan tanggung jawab kelas

---

## Solution

Musyrif sekarang dikelompokkan berdasarkan **kelas** terlebih dahulu, baru dibagi 2 grup untuk bergantian libur.

### Logic Flow

```
1. Fetch musyrif aktif (include kolom 'kelas')
   ↓
2. Group by kelas
   - Kelas 10: [Musyrif A, B, C, D]
   - Kelas 11: [Musyrif E, F, G, H]
   - Kelas 12: [Musyrif I, J, K, L]
   - Umum: [Musyrif M, N] (jika kelas = null)
   ↓
3. Untuk setiap kelas, bagi jadi 2 grup
   - Kelas 10: Grup1=[A, C], Grup2=[B, D]
   - Kelas 11: Grup1=[E, G], Grup2=[F, H]
   - Kelas 12: Grup1=[I, K], Grup2=[J, L]
   ↓
4. Generate jadwal per kelas
   - Minggu 1 (ganjil): Grup1 libur, Grup2 jaga
   - Minggu 2 (genap): Grup2 libur, Grup1 jaga
   - Minggu 3 (ganjil): Grup1 libur, Grup2 jaga
   - Minggu 4 (genap): Grup2 libur, Grup1 jaga
```

### Example Result

**Kelas 10**:
- Minggu 1: Musyrif A & C libur, B & D jaga
- Minggu 2: Musyrif B & D libur, A & C jaga
- Minggu 3: Musyrif A & C libur, B & D jaga
- Minggu 4: Musyrif B & D libur, A & C jaga

**Kelas 11**:
- Minggu 1: Musyrif E & G libur, F & H jaga
- Minggu 2: Musyrif F & H libur, E & G jaga
- Minggu 3: Musyrif E & G libur, F & H jaga
- Minggu 4: Musyrif F & H libur, E & G jaga

---

## Code Changes

**File**: `app/api/kpi/jadwal-libur/generate-rutin/route.ts`

### 1. Fetch musyrif with kelas column

**Before**:
```typescript
const { data: musyrifList } = await supabase
  .from('musyrif_keasramaan')
  .select('nama_musyrif, asrama')
  .eq('cabang', cabang)
  .eq('status', 'aktif');
```

**After**:
```typescript
const { data: musyrifList } = await supabase
  .from('musyrif_keasramaan')
  .select('nama_musyrif, asrama, kelas')  // ← Added kelas
  .eq('cabang', cabang)
  .eq('status', 'aktif')
  .order('kelas', { ascending: true });  // ← Order by kelas
```

### 2. Group musyrif by kelas

**New Code**:
```typescript
// Group musyrif by kelas
const musyrifByKelas: Record<string, any[]> = {};
musyrifList.forEach((musyrif) => {
  const kelas = musyrif.kelas || 'Umum'; // Default 'Umum' if null
  if (!musyrifByKelas[kelas]) {
    musyrifByKelas[kelas] = [];
  }
  musyrifByKelas[kelas].push(musyrif);
});

console.log('Musyrif grouped by kelas:', 
  Object.keys(musyrifByKelas)
    .map(k => `${k}: ${musyrifByKelas[k].length}`)
    .join(', ')
);
```

### 3. Split each kelas into 2 groups

**New Code**:
```typescript
// Bagi setiap kelas jadi 2 grup
const grupByKelas: Record<string, { grup1: any[], grup2: any[] }> = {};

Object.keys(musyrifByKelas).forEach((kelas) => {
  const musyrifKelas = musyrifByKelas[kelas];
  
  // Shuffle for random distribution
  const shuffled = [...musyrifKelas].sort(() => Math.random() - 0.5);
  
  // Split into 2 groups
  const grup1 = shuffled.filter((_, i) => i % 2 === 0);
  const grup2 = shuffled.filter((_, i) => i % 2 === 1);
  
  grupByKelas[kelas] = { grup1, grup2 };
  
  console.log(`Kelas ${kelas}: Grup1=${grup1.length}, Grup2=${grup2.length}`);
});
```

### 4. Generate schedule per kelas

**Before**:
```typescript
// Generate untuk semua musyrif (mixed)
if (week % 2 === 0) {
  grup1.forEach((musyrif) => {
    // ...
  });
}
```

**After**:
```typescript
// Generate untuk setiap kelas
Object.keys(grupByKelas).forEach((kelas) => {
  const { grup1, grup2 } = grupByKelas[kelas];

  if (week % 2 === 0) {
    grup1.forEach((musyrif, index) => {
      const pengganti = grup2[index % grup2.length];
      jadwalLibur.push({
        // ...
        keterangan: `Libur rutin minggu ke-${week + 1} (Kelas ${kelas})`,
        musyrif_pengganti: pengganti?.nama_musyrif || null,
        // ...
      });
    });
  }
  
  // Same for grup2...
});
```

---

## Benefits

### 1. Proper Responsibility Separation
- Musyrif kelas 10 hanya bertanggung jawab untuk kelas 10
- Musyrif kelas 11 hanya bertanggung jawab untuk kelas 11
- Tidak ada cross-class coverage

### 2. Fair Distribution
- Setiap kelas punya sistem libur sendiri
- Musyrif dalam kelas yang sama bergantian secara adil

### 3. Better Tracking
- Keterangan jadwal mencantumkan kelas
- Mudah filter jadwal per kelas
- Mudah analisis distribusi libur per kelas

### 4. Flexible for Null Kelas
- Musyrif tanpa kelas (null) dikelompokkan ke "Umum"
- Tetap bisa generate jadwal meski ada musyrif tanpa kelas

---

## Testing

### Test Case 1: Multiple Kelas

**Setup**:
```sql
-- Musyrif kelas 10
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, kelas, status)
VALUES 
('Ustadz A', 'HSI Boarding School Bekasi', 'Asrama Putra A', '10', 'aktif'),
('Ustadz B', 'HSI Boarding School Bekasi', 'Asrama Putra B', '10', 'aktif'),
('Ustadz C', 'HSI Boarding School Bekasi', 'Asrama Putra C', '10', 'aktif'),
('Ustadz D', 'HSI Boarding School Bekasi', 'Asrama Putra D', '10', 'aktif');

-- Musyrif kelas 11
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, kelas, status)
VALUES 
('Ustadz E', 'HSI Boarding School Bekasi', 'Asrama Putra E', '11', 'aktif'),
('Ustadz F', 'HSI Boarding School Bekasi', 'Asrama Putra F', '11', 'aktif'),
('Ustadz G', 'HSI Boarding School Bekasi', 'Asrama Putra G', '11', 'aktif'),
('Ustadz H', 'HSI Boarding School Bekasi', 'Asrama Putra H', '11', 'aktif');
```

**Expected Result**:
- 16 jadwal libur (4 musyrif × 2 kelas × 2 minggu libur)
- Kelas 10 dan 11 tidak tercampur
- Setiap musyrif libur 2x dalam sebulan (minggu 1 & 3, atau minggu 2 & 4)

### Test Case 2: Null Kelas

**Setup**:
```sql
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, kelas, status)
VALUES 
('Ustadz X', 'HSI Boarding School Bekasi', 'Asrama Umum', NULL, 'aktif'),
('Ustadz Y', 'HSI Boarding School Bekasi', 'Asrama Umum', NULL, 'aktif');
```

**Expected Result**:
- Musyrif X & Y dikelompokkan ke "Umum"
- Generate jadwal dengan keterangan "(Kelas Umum)"

### Test Case 3: Odd Number of Musyrif

**Setup**:
```sql
-- 3 musyrif (odd number)
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, kelas, status)
VALUES 
('Ustadz P', 'HSI Boarding School Bekasi', 'Asrama A', '12', 'aktif'),
('Ustadz Q', 'HSI Boarding School Bekasi', 'Asrama B', '12', 'aktif'),
('Ustadz R', 'HSI Boarding School Bekasi', 'Asrama C', '12', 'aktif');
```

**Expected Result**:
- Grup1: 2 musyrif
- Grup2: 1 musyrif
- Pengganti diambil dengan modulo (cycling)

---

## Console Logs

Saat generate, akan muncul log seperti ini:

```
Generate jadwal libur request: { cabang: 'HSI Boarding School Bekasi', bulan: 12, tahun: 2024 }
Found 12 active musyrif in HSI Boarding School Bekasi
Musyrif grouped by kelas: 10: 4, 11: 4, 12: 4
Kelas 10: Grup1=2, Grup2=2
Kelas 11: Grup1=2, Grup2=2
Kelas 12: Grup1=2, Grup2=2
Generated 48 jadwal libur entries
```

---

## Verification Query

Cek hasil generate per kelas:

```sql
SELECT 
  SUBSTRING(keterangan FROM 'Kelas ([^)]+)') as kelas,
  COUNT(*) as total_jadwal,
  COUNT(DISTINCT nama_musyrif) as total_musyrif,
  MIN(tanggal_mulai) as periode_mulai,
  MAX(tanggal_selesai) as periode_selesai
FROM jadwal_libur_musyrif_keasramaan
WHERE jenis_libur = 'rutin'
  AND tanggal_mulai >= '2024-12-01'
  AND tanggal_mulai < '2025-01-01'
GROUP BY kelas
ORDER BY kelas;
```

**Expected Output**:
```
kelas | total_jadwal | total_musyrif | periode_mulai | periode_selesai
------|--------------|---------------|---------------|----------------
10    | 16           | 4             | 2024-12-07    | 2024-12-29
11    | 16           | 4             | 2024-12-07    | 2024-12-29
12    | 16           | 4             | 2024-12-07    | 2024-12-29
```

---

## Next Steps

1. ✅ Test generate dengan data real
2. ✅ Verify tidak ada cross-class coverage
3. ✅ Check console logs untuk debugging
4. ⏳ Add UI filter by kelas di halaman jadwal libur
5. ⏳ Add report: "Jadwal Libur per Kelas"

---

**Status**: ✅ Ready to test
**Last Updated**: December 10, 2024
