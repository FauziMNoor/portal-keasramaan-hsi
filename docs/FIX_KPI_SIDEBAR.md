# Fix KPI Pages - Add Sidebar

## Problem
Semua halaman KPI tidak menampilkan Sidebar, sehingga navigasi hilang.

## Solution
Tambahkan Sidebar component ke semua halaman KPI dengan struktur:

```tsx
import Sidebar from '@/components/Sidebar';

// ... di dalam component

return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <main className="flex-1 overflow-auto p-6">
      {/* existing content */}
    </main>
  </div>
);
```

## Files yang Perlu Diperbaiki

### ✅ DONE:
1. ✅ `/app/kpi/musyrif/[nama]/page.tsx`
2. ✅ `/app/kpi/musyrif/dashboard/page.tsx`

### ⏳ TODO:
3. `/app/kpi/kepala-asrama/page.tsx`
4. `/app/kpi/kepala-sekolah/page.tsx`
5. `/app/koordinasi/rapat/page.tsx`
6. `/app/koordinasi/log-kolaborasi/page.tsx`
7. `/app/approval/cuti-musyrif/page.tsx`
8. `/app/admin/kpi-calculation/page.tsx`
9. `/app/manajemen-data/jadwal-libur-musyrif/page.tsx`

## Step-by-Step untuk Setiap File

### 1. Import Sidebar
Tambahkan di bagian atas file setelah import React:
```tsx
import Sidebar from '@/components/Sidebar';
```

### 2. Wrap Return Statement
Ubah struktur return dari:
```tsx
return (
  <div className="p-6">
    {/* content */}
  </div>
);
```

Menjadi:
```tsx
return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <main className="flex-1 overflow-auto p-6">
      {/* content */}
    </main>
  </div>
);
```

### 3. Handle Loading & Error States
Jika ada loading atau error state, wrap juga dengan Sidebar:
```tsx
if (loading) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div>Loading...</div>
      </main>
    </div>
  );
}
```

## Quick Fix Script (PowerShell)

Jalankan script ini untuk menambahkan Sidebar ke semua halaman sekaligus:

```powershell
# TODO: Create automated script
```

## Verification

Setelah fix, pastikan:
- ✅ Sidebar muncul di semua halaman KPI
- ✅ Navigasi berfungsi dengan baik
- ✅ Content tidak overlap dengan Sidebar
- ✅ Responsive di mobile (sidebar slide dari kiri)
- ✅ Loading state tetap menampilkan Sidebar

