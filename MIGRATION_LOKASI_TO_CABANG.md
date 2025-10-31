# Migration: Lokasi → Cabang

## Summary

Mengganti semua reference "lokasi" menjadi "cabang" di seluruh frontend untuk konsistensi dengan perubahan database.

## Files to Update

### 1. Core Pages

- [ ] app/lokasi/page.tsx → Update all "lokasi" to "cabang"
- [ ] app/users/page.tsx
- [ ] app/data-siswa/page.tsx
- [ ] app/asrama/page.tsx
- [ ] app/kepala-asrama/page.tsx
- [ ] app/musyrif/page.tsx

### 2. Habit Tracker Pages

- [ ] app/habit-tracker/dashboard/page.tsx
- [ ] app/habit-tracker/form/[token]/page.tsx
- [ ] app/habit-tracker/manage-link/page.tsx
- [ ] app/habit-tracker/rekap/page.tsx
- [ ] app/habit-tracker/page.tsx

### 3. Overview Pages

- [ ] app/overview/habit-tracker/components/FilterSection.tsx
- [ ] app/overview/habit-tracker/page.tsx

### 4. Other Pages

- [ ] app/manajemen-data/tempat/page.tsx
- [ ] app/page.tsx

### 5. API Routes

- [ ] app/api/users/create/route.ts
- [ ] app/api/users/update/route.ts

### 6. Components

- [ ] components/HabitTrackerStats.tsx

## Changes Pattern

### Database Table Names

- `lokasi_keasramaan` → `cabang_keasramaan`

### Column Names

- `lokasi` → `cabang`

### Variable Names

- `lokasi` → `cabang`
- `lokasiList` → `cabangList`
- `Lokasi` (interface) → `Cabang`
- `LokasiPage` → `CabangPage`

### UI Text

- "Lokasi" → "Cabang"
- "Pilih Lokasi" → "Pilih Cabang"
- "Kelola data lokasi" → "Kelola data cabang"
- "Tambah Lokasi" → "Tambah Cabang"
- "Edit Lokasi" → "Edit Cabang"
- "Pilih Lokasi Dulu" → "Pilih Cabang Dulu"

## Note

Folder `app/lokasi` dapat tetap menggunakan nama "lokasi" di URL atau diganti manual menjadi `app/cabang` jika diperlukan.
