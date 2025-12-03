# Panduan Mengganti "Lokasi" menjadi "Cabang"

## Ringkasan
Karena database sudah diubah dari `lokasi` ke `cabang`, frontend juga perlu disesuaikan.

## Cara Tercepat: Find & Replace di VS Code

### Langkah 1: Buka Find & Replace Global
1. Tekan `Ctrl + Shift + H` (Windows/Linux) atau `Cmd + Shift + H` (Mac)
2. Atau klik icon "Search" di sidebar kiri

### Langkah 2: Lakukan Replace Bertahap

**PENTING: Lakukan satu per satu dengan urutan ini!**

#### Replace 1: Table Name
- Find: `lokasi_keasramaan`
- Replace: `cabang_keasramaan`
- Klik "Replace All"

#### Replace 2: Variable Names
- Find: `lokasiList` (Match Case: ON, Match Whole Word: ON)
- Replace: `cabangList`
- Klik "Replace All"

#### Replace 3: Interface Name
- Find: `interface Lokasi` (Match Case: ON)
- Replace: `interface Cabang`
- Klik "Replace All"

#### Replace 4: Type Annotations
- Find: `<Lokasi>` (Match Case: ON)
- Replace: `<Cabang>`
- Klik "Replace All"

- Find: `Lokasi[]` (Match Case: ON)
- Replace: `Cabang[]`
- Klik "Replace All"

#### Replace 5: Component Name
- Find: `LokasiPage` (Match Case: ON, Match Whole Word: ON)
- Replace: `CabangPage`
- Klik "Replace All"

#### Replace 6: UI Text
- Find: `Pilih Lokasi` (Match Case: ON)
- Replace: `Pilih Cabang`
- Klik "Replace All"

- Find: `Kelola data lokasi` (Match Case: ON)
- Replace: `Kelola data cabang`
- Klik "Replace All"

- Find: `Tambah Lokasi` (Match Case: ON)
- Replace: `Tambah Cabang`
- Klik "Replace All"

- Find: `Edit Lokasi` (Match Case: ON)
- Replace: `Edit Cabang`
- Klik "Replace All"

- Find: `>Lokasi<` (Match Case: ON)
- Replace: `>Cabang<`
- Klik "Replace All"

- Find: `Lokasi Dulu` (Match Case: ON)
- Replace: `Cabang Dulu`
- Klik "Replace All"

#### Replace 7: Field Names (HATI-HATI!)
**Gunakan Regex Mode untuk ini:**

1. Aktifkan "Use Regular Expression" (icon `.*` di search box)

2. Find: `([^a-zA-Z])lokasi:` 
   Replace: `$1cabang:`
   Klik "Replace All"

3. Find: `([^a-zA-Z])lokasi\?`
   Replace: `$1cabang?`
   Klik "Replace All"

4. Find: `([^a-zA-Z])lokasi,`
   Replace: `$1cabang,`
   Klik "Replace All"

5. Find: `([^a-zA-Z])lokasi\)`
   Replace: `$1cabang)`
   Klik "Replace All"

6. Find: `([^a-zA-Z])lokasi\}`
   Replace: `$1cabang}`
   Klik "Replace All"

7. Find: `([^a-zA-Z])lokasi\|`
   Replace: `$1cabang|`
   Klik "Replace All"

8. Find: `([^a-zA-Z])lokasi `
   Replace: `$1cabang `
   Klik "Replace All"

9. Find: `\.lokasi\b`
   Replace: `.cabang`
   Klik "Replace All"

10. Find: `\{lokasi\}`
    Replace: `{cabang}`
    Klik "Replace All"

### Langkah 3: Rename Folder (Opsional)
Jika ingin URL juga berubah dari `/lokasi` ke `/cabang`:

1. Rename folder: `app/lokasi` → `app/cabang`
2. Update Sidebar.tsx jika ada link ke `/lokasi`

### Langkah 4: Verifikasi
1. Cek file-file berikut untuk memastikan tidak ada yang terlewat:
   - `app/users/page.tsx`
   - `app/data-siswa/page.tsx`
   - `app/asrama/page.tsx`
   - `app/kepala-asrama/page.tsx`
   - `app/musyrif/page.tsx`
   - `app/habit-tracker/*/page.tsx`
   - `app/overview/habit-tracker/page.tsx`
   - `components/HabitTrackerStats.tsx`

2. Jalankan aplikasi dan test semua fitur yang menggunakan filter cabang

## Files yang Terpengaruh
- ✅ app/lokasi/page.tsx
- ✅ app/users/page.tsx
- ✅ app/data-siswa/page.tsx
- ✅ app/asrama/page.tsx
- ✅ app/kepala-asrama/page.tsx
- ✅ app/musyrif/page.tsx
- ✅ app/habit-tracker/dashboard/page.tsx
- ✅ app/habit-tracker/form/[token]/page.tsx
- ✅ app/habit-tracker/manage-link/page.tsx
- ✅ app/habit-tracker/rekap/page.tsx
- ✅ app/habit-tracker/page.tsx
- ✅ app/overview/habit-tracker/components/FilterSection.tsx
- ✅ app/overview/habit-tracker/page.tsx
- ✅ app/manajemen-data/tempat/page.tsx
- ✅ app/page.tsx
- ✅ app/api/users/create/route.ts
- ✅ app/api/users/update/route.ts
- ✅ components/HabitTrackerStats.tsx

## Catatan Penting
- Jangan replace di folder `.next` atau `node_modules`
- Pastikan "Match Case" aktif untuk replace yang case-sensitive
- Gunakan "Match Whole Word" untuk menghindari replace yang tidak diinginkan
- Backup dulu jika perlu!

## Jika Ada Masalah
Jika ada error setelah replace, cek:
1. Apakah ada typo di nama field database?
2. Apakah semua table sudah diupdate di backend?
3. Apakah ada field `lokasi` yang terlewat?

Gunakan search global (`Ctrl+Shift+F`) untuk cari sisa kata "lokasi" yang mungkin terlewat.
