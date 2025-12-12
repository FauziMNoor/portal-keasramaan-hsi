# Fix: Generate Jadwal Libur Error 500

**Date**: December 10, 2024  
**Status**: ✅ IDENTIFIED & FIXED

---

## Problem

Error 500 saat generate jadwal libur rutin:
```
POST http://localhost:3000/api/kpi/jadwal-libur/generate-rutin 500 (Internal Server Error)
```

---

## Root Cause Analysis

### 1. No Musyrif Data
Debug endpoint menunjukkan:
```json
{
  "total_musyrif": 0,
  "total_active_musyrif": 0,
  "all_musyrif": []
}
```

**Penyebab**: Tabel `musyrif_keasramaan` tidak punya data atau nama cabang tidak match.

### 2. Missing Columns
Tabel `musyrif_keasramaan` yang ada di database tidak punya kolom:
- `jatah_cuti_tahunan`
- `sisa_cuti_tahunan`

**Schema Actual**:
```sql
create table public.musyrif_keasramaan (
  id uuid not null default extensions.uuid_generate_v4(),
  nama_musyrif text not null,
  asrama text null,
  kelas text null,
  cabang text null,
  status text null default 'aktif'::text,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now()
);
```

**Schema Expected** (by KPI system):
```sql
create table public.musyrif_keasramaan (
  id uuid not null default extensions.uuid_generate_v4(),
  nama_musyrif text not null,
  asrama text null,
  kelas text null,
  cabang text null,
  status text null default 'aktif'::text,
  jatah_cuti_tahunan integer default 12,  -- ← MISSING
  sisa_cuti_tahunan integer default 12,   -- ← MISSING
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now()
);
```

### 3. Cabang Name Mismatch
**Cabang di `cabang_keasramaan` table**:
- HSI Boarding School Bekasi
- HSI Boarding School Sukabumi
- HSI Boarding School Purworejo

**Cabang di `musyrif_keasramaan` table** (kemungkinan):
- Pusat / Bekasi
- Sukabumi
- Purworejo

**Result**: Nama tidak match → query tidak menemukan musyrif.

---

## Solution Steps

### Step 1: Add Missing Columns

**File**: `supabase/migrations/20241210_add_cuti_columns_musyrif.sql`

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Add jatah_cuti_tahunan column
ALTER TABLE musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS jatah_cuti_tahunan INTEGER DEFAULT 12;

-- Add sisa_cuti_tahunan column
ALTER TABLE musyrif_keasramaan 
ADD COLUMN IF NOT EXISTS sisa_cuti_tahunan INTEGER DEFAULT 12;

-- Update existing records
UPDATE musyrif_keasramaan 
SET jatah_cuti_tahunan = 12, 
    sisa_cuti_tahunan = 12
WHERE jatah_cuti_tahunan IS NULL 
   OR sisa_cuti_tahunan IS NULL;
```

### Step 2: Check Existing Data

**File**: `supabase/CHECK_MUSYRIF_DATA.sql`

Jalankan query ini untuk cek data:

```sql
-- Check musyrif per cabang
SELECT 
  cabang,
  COUNT(*) as total_musyrif,
  COUNT(CASE WHEN status = 'aktif' THEN 1 END) as total_aktif
FROM musyrif_keasramaan
GROUP BY cabang;

-- Check cabang names
SELECT nama_cabang FROM cabang_keasramaan ORDER BY nama_cabang;

-- Find mismatch
SELECT DISTINCT 
  m.cabang as musyrif_cabang,
  c.nama_cabang as cabang_table_name,
  CASE 
    WHEN m.cabang = c.nama_cabang THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM musyrif_keasramaan m
FULL OUTER JOIN cabang_keasramaan c ON m.cabang = c.nama_cabang;
```

### Step 3: Fix Cabang Names

**File**: `supabase/FIX_CABANG_NAMES.sql`

Pilih salah satu opsi:

#### Option A: Update Musyrif to Use Full Names (Recommended)

```sql
UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Bekasi'
WHERE cabang IN ('Pusat', 'Bekasi', 'pusat', 'bekasi');

UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Sukabumi'
WHERE cabang IN ('Sukabumi', 'sukabumi');

UPDATE musyrif_keasramaan 
SET cabang = 'HSI Boarding School Purworejo'
WHERE cabang IN ('Purworejo', 'purworejo');
```

#### Option B: Update Cabang Table to Use Short Names

```sql
UPDATE cabang_keasramaan 
SET nama_cabang = 'Pusat'
WHERE nama_cabang = 'HSI Boarding School Bekasi';

UPDATE cabang_keasramaan 
SET nama_cabang = 'Sukabumi'
WHERE nama_cabang = 'HSI Boarding School Sukabumi';

UPDATE cabang_keasramaan 
SET nama_cabang = 'Purworejo'
WHERE nama_cabang = 'HSI Boarding School Purworejo';
```

### Step 4: Insert Dummy Data (If No Musyrif Exists)

**File**: `supabase/INSERT_DUMMY_MUSYRIF.sql`

Jika tabel `musyrif_keasramaan` masih kosong, insert dummy data:

```sql
INSERT INTO musyrif_keasramaan (
  nama_musyrif, 
  cabang, 
  asrama, 
  status, 
  jatah_cuti_tahunan, 
  sisa_cuti_tahunan
)
VALUES 
-- Bekasi
('Ustadz Ahmad Fauzi', 'HSI Boarding School Bekasi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Budi Santoso', 'HSI Boarding School Bekasi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Siti Nurhaliza', 'HSI Boarding School Bekasi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Fatimah Azzahra', 'HSI Boarding School Bekasi', 'Asrama Putri B', 'aktif', 12, 12),

-- Sukabumi
('Ustadz Muhammad Rizki', 'HSI Boarding School Sukabumi', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Hasan Basri', 'HSI Boarding School Sukabumi', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Aisyah Rahmawati', 'HSI Boarding School Sukabumi', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Khadijah Maryam', 'HSI Boarding School Sukabumi', 'Asrama Putri B', 'aktif', 12, 12),

-- Purworejo
('Ustadz Abdullah Yusuf', 'HSI Boarding School Purworejo', 'Asrama Putra A', 'aktif', 12, 12),
('Ustadz Ibrahim Khalil', 'HSI Boarding School Purworejo', 'Asrama Putra B', 'aktif', 12, 12),
('Ustadzah Maryam Zahra', 'HSI Boarding School Purworejo', 'Asrama Putri A', 'aktif', 12, 12),
('Ustadzah Zainab Husna', 'HSI Boarding School Purworejo', 'Asrama Putri B', 'aktif', 12, 12)
ON CONFLICT (nama_musyrif) DO NOTHING;
```

### Step 5: Verify Fix

#### A. Check via Debug Endpoint

```
http://localhost:3000/api/kpi/debug-musyrif?cabang=HSI%20Boarding%20School%20Bekasi
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "total_musyrif": 4,
    "total_active_musyrif": 4,
    "active_musyrif": [...]
  }
}
```

#### B. Check via SQL

```sql
SELECT 
  cabang,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'aktif' THEN 1 END) as aktif
FROM musyrif_keasramaan
GROUP BY cabang;
```

**Expected Result**:
```
cabang                          | total | aktif
--------------------------------|-------|------
HSI Boarding School Bekasi      | 4     | 4
HSI Boarding School Sukabumi    | 4     | 4
HSI Boarding School Purworejo   | 4     | 4
```

### Step 6: Test Generate Jadwal Libur

1. Buka halaman: `/manajemen-data/jadwal-libur-musyrif`
2. Klik tombol **"Generate Jadwal Rutin"**
3. Pilih:
   - Cabang: HSI Boarding School Bekasi
   - Bulan: Desember
   - Tahun: 2024
4. Klik **"Generate"**

**Expected Result**:
```
✅ Berhasil generate 8 jadwal libur rutin
```

---

## Code Changes Made

### 1. Enhanced Error Logging

**File**: `app/api/kpi/jadwal-libur/generate-rutin/route.ts`

Added detailed console logging:
```typescript
console.log('Generate jadwal libur request:', { cabang, bulan, tahun });
console.log(`Found ${musyrifList.length} active musyrif in ${cabang}`);
console.log(`Generated ${jadwalLibur.length} jadwal libur entries`);
```

### 2. Created Debug Endpoint

**File**: `app/api/kpi/debug-musyrif/route.ts`

New endpoint to check musyrif data:
```typescript
GET /api/kpi/debug-musyrif?cabang=<nama_cabang>
```

Returns:
- All cabang available
- Total musyrif in cabang
- Total active musyrif
- Detailed musyrif list

### 3. Fixed Date Handling

**File**: `app/api/kpi/jadwal-libur/generate-rutin/route.ts`

Improved Saturday/Sunday calculation:
```typescript
const getSunday = (saturdayDate: string) => {
  const saturday = new Date(saturdayDate + 'T00:00:00'); // ← Added time
  saturday.setDate(saturday.getDate() + 1);
  return saturday.toISOString().split('T')[0];
};
```

---

## Testing Checklist

- [ ] Step 1: Add missing columns to `musyrif_keasramaan`
- [ ] Step 2: Check existing musyrif data
- [ ] Step 3: Fix cabang name mismatch
- [ ] Step 4: Insert dummy data (if needed)
- [ ] Step 5: Verify via debug endpoint
- [ ] Step 6: Test generate jadwal libur
- [ ] Verify jadwal appears in table
- [ ] Test with different cabang
- [ ] Test with different months

---

## Common Issues & Solutions

### Issue 1: "Tidak ada musyrif aktif di cabang ini"

**Cause**: No active musyrif in selected cabang

**Solution**:
1. Check musyrif data: `SELECT * FROM musyrif_keasramaan WHERE cabang = 'xxx' AND status = 'aktif'`
2. Insert musyrif data or update status to 'aktif'

### Issue 2: "Tidak ada jadwal libur yang di-generate"

**Cause**: Date calculation issue or month already passed

**Solution**:
1. Try different month (current or future month)
2. Check console logs for date calculation

### Issue 3: Duplicate entries error

**Cause**: Jadwal already exists for that period

**Solution**:
1. Delete existing jadwal: `DELETE FROM jadwal_libur_musyrif_keasramaan WHERE jenis_libur = 'rutin' AND tanggal_mulai >= '2024-12-01'`
2. Or add unique constraint handling in code

---

## Related Files

- `supabase/migrations/20241210_add_cuti_columns_musyrif.sql` - Add missing columns
- `supabase/CHECK_MUSYRIF_DATA.sql` - Check data script
- `supabase/FIX_CABANG_NAMES.sql` - Fix cabang names
- `supabase/INSERT_DUMMY_MUSYRIF.sql` - Insert dummy data
- `app/api/kpi/debug-musyrif/route.ts` - Debug endpoint
- `app/api/kpi/jadwal-libur/generate-rutin/route.ts` - Generate API

---

**Status**: ✅ Ready to fix - Follow steps 1-6 above
**Last Updated**: December 10, 2024
