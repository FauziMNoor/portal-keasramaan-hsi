# Fix KPI System - Dynamic Cabang Data

## Problem
Sistem KPI menggunakan hardcoded cabang ('Pusat', 'Sukabumi') di semua halaman. Seharusnya mengambil data cabang secara dinamis dari tabel `cabang_keasramaan`.

## Solution
Fetch data cabang dari database dan populate dropdown secara dinamis.

## Pattern yang Benar

### 1. Fetch Cabang dari Database
```tsx
const [cabangList, setCabangList] = useState<string[]>([]);
const [selectedCabang, setSelectedCabang] = useState('');

useEffect(() => {
  fetchCabangList();
}, []);

const fetchCabangList = async () => {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase
      .from('cabang_keasramaan')
      .select('nama_cabang')
      .order('nama_cabang');
    
    if (data && data.length > 0) {
      const cabangNames = data.map(c => c.nama_cabang);
      setCabangList(cabangNames);
      if (!selectedCabang) {
        setSelectedCabang(cabangNames[0]); // Set default
      }
    }
  } catch (error) {
    console.error('Error fetching cabang:', error);
  }
};
```

### 2. Dynamic Dropdown
```tsx
<select
  value={selectedCabang}
  onChange={(e) => setSelectedCabang(e.target.value)}
  className="..."
>
  {cabangList.map((cabang) => (
    <option key={cabang} value={cabang}>{cabang}</option>
  ))}
</select>
```

## Files yang Sudah Diperbaiki

### ✅ DONE:
1. ✅ `/app/kpi/kepala-asrama/page.tsx` - Dynamic cabang dropdown
2. ✅ `/app/kpi/kepala-sekolah/page.tsx` - Get unique cabang from kpiList
3. ✅ `/app/koordinasi/rapat/page.tsx` - Dynamic cabang dropdown (main filter)

### ⏳ TODO:
4. `/app/koordinasi/rapat/page.tsx` - AddRapatModal dropdown
5. `/app/koordinasi/log-kolaborasi/page.tsx` - Main filter & AddLogModal
6. `/app/approval/cuti-musyrif/page.tsx` - Filter dropdown
7. `/app/manajemen-data/jadwal-libur-musyrif/page.tsx` - Filter & modals
8. `/lib/kpi-calculation.ts` - Remove hardcoded cabangList

## Specific Changes Needed

### 3. Log Kolaborasi Page
**File**: `app/koordinasi/log-kolaborasi/page.tsx`

**Changes:**
- Add `cabangList` state
- Add `fetchCabangList()` function
- Update filter dropdown (line ~168)
- Update AddLogModal dropdown (line ~403)

### 4. Approval Cuti Page
**File**: `app/approval/cuti-musyrif/page.tsx`

**Changes:**
- Add `cabangList` state
- Add `fetchCabangList()` function
- Update filter dropdown (line ~242)

### 5. Jadwal Libur Page
**File**: `app/manajemen-data/jadwal-libur-musyrif/page.tsx`

**Changes:**
- Add `cabangList` state
- Add `fetchCabangList()` function
- Update filter dropdown
- Update GenerateModal dropdown
- Update AddModal dropdown

### 6. KPI Calculation Library
**File**: `lib/kpi-calculation.ts`

**Function**: `calculateKPIBatch()`

**Current:**
```tsx
const cabangList = ['Pusat', 'Sukabumi'];
```

**Should be:**
```tsx
// Fetch from database
const { data } = await supabase
  .from('cabang_keasramaan')
  .select('nama_cabang');

const cabangList = data?.map(c => c.nama_cabang) || [];
```

## Testing Checklist

After implementing:
- [ ] Kepala Asrama dashboard shows correct cabang list
- [ ] Kepala Sekolah dashboard shows all cabang stats
- [ ] Rapat page filter works with dynamic cabang
- [ ] Log Kolaborasi filter works with dynamic cabang
- [ ] Approval Cuti filter works with dynamic cabang
- [ ] Jadwal Libur filter works with dynamic cabang
- [ ] KPI Calculation batch works for all cabang
- [ ] Adding new cabang in database reflects in all dropdowns

## Benefits

1. **Scalable**: Easy to add new cabang without code changes
2. **Consistent**: All pages use same data source
3. **Maintainable**: Single source of truth (database)
4. **User-friendly**: Dropdown always shows current cabang list

---

**Status**: Partially Complete (3/8 files done)
**Priority**: High
**Estimated Time**: 30 minutes to complete all files


---

## Update: December 10, 2024 - ALL FIXES COMPLETE ✅

### Summary of Changes

All 8 files have been successfully updated to fetch cabang data dynamically from the `cabang_keasramaan` table:

1. **Main Filter Dropdowns (6 files)**
   - Added `fetchCabangList()` function to fetch from database
   - Added `cabangList` state to store fetched data
   - Updated dropdown to map over `cabangList` instead of hardcoded values
   - Auto-select first cabang on load

2. **Modal Components (5 modals)**
   - Updated modal signatures to accept `cabangList` as prop
   - Passed `cabangList` from parent component to modals
   - Updated all cabang dropdowns in modals to use dynamic data

3. **KPI Calculation Engine**
   - Updated `calculateKPIBatch()` to fetch cabang list from database
   - Removed hardcoded `['Pusat', 'Sukabumi']` array

### Files Modified

**Pages:**
- `/app/kpi/kepala-asrama/page.tsx`
- `/app/kpi/kepala-sekolah/page.tsx`
- `/app/koordinasi/rapat/page.tsx`
- `/app/koordinasi/log-kolaborasi/page.tsx`
- `/app/approval/cuti-musyrif/page.tsx`
- `/app/manajemen-data/jadwal-libur-musyrif/page.tsx`

**Library:**
- `/lib/kpi-calculation.ts`

**Modals Updated:**
- `AddRapatModal` (rapat page)
- `AddLogModal` (log-kolaborasi page)
- `GenerateJadwalModal` (jadwal-libur page)
- `AjukanCutiModal` (jadwal-libur page)

### Testing Checklist

- [ ] Test all filter dropdowns show correct cabang from database
- [ ] Test modal dropdowns show correct cabang
- [ ] Test KPI calculation works with dynamic cabang
- [ ] Add new cabang to database and verify it appears in all dropdowns
- [ ] Test with empty cabang table (should handle gracefully)

### Benefits

1. **Scalability**: Easy to add new cabang without code changes
2. **Consistency**: All pages use same data source
3. **Maintainability**: Single source of truth (database)
4. **Flexibility**: Cabang can be managed through database admin panel
