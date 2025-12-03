# Fix: Dropdown Kategori Kebaikan Tidak Muncul

## Masalah
Pada form input kebaikan (`/catatan-perilaku/form/[token]`), dropdown "Pilih Kategori" tidak muncul/kosong, padahal pada form pelanggaran dropdown muncul dengan normal.

## Root Cause
Setelah update database ke V2 (`UPDATE_CATATAN_PERILAKU_V2.sql`), struktur database berubah:

**Sebelum (V1):**
- `kategori_pelanggaran_keasramaan` - untuk pelanggaran
- `kategori_kebaikan_keasramaan` - untuk kebaikan

**Sesudah (V2):**
- `kategori_perilaku_keasramaan` - untuk pelanggaran DAN kebaikan (umum)
- `level_dampak_keasramaan` - untuk level dampak pelanggaran

Kode form masih mencoba fetch dari tabel `kategori_kebaikan_keasramaan` yang sudah tidak ada.

## Solusi

### 1. Hapus Interface KategoriKebaikan
```typescript
// BEFORE
interface KategoriKebaikan {
  id: string;
  nama_kategori: string;
  poin: number;
  deskripsi: string;
}

// AFTER
// Tidak perlu interface KategoriKebaikan lagi karena sekarang menggunakan KategoriPerilaku untuk semua
```

### 2. Hapus State kategoriKebaikanList
```typescript
// BEFORE
const [kategoriPerilakuList, setKategoriPerilakuList] = useState<KategoriPerilaku[]>([]);
const [levelDampakList, setLevelDampakList] = useState<LevelDampak[]>([]);
const [kategoriKebaikanList, setKategoriKebaikanList] = useState<KategoriKebaikan[]>([]);

// AFTER
const [kategoriPerilakuList, setKategoriPerilakuList] = useState<KategoriPerilaku[]>([]);
const [levelDampakList, setLevelDampakList] = useState<LevelDampak[]>([]);
```

### 3. Update Fungsi fetchKategori
```typescript
// BEFORE
const fetchKategori = async () => {
  const [kategoriPerilaku, levelDampak, kebaikan] = await Promise.all([
    supabase.from('kategori_perilaku_keasramaan').select('*').eq('status', 'aktif').order('nama_kategori'),
    supabase.from('level_dampak_keasramaan').select('*').eq('status', 'aktif').order('urutan'),
    supabase.from('kategori_kebaikan_keasramaan').select('*').eq('status', 'aktif').order('nama_kategori'), // ❌ Tabel tidak ada
  ]);

  setKategoriPerilakuList(kategoriPerilaku.data || []);
  setLevelDampakList(levelDampak.data || []);
  setKategoriKebaikanList(kebaikan.data || []); // ❌ Tidak perlu
};

// AFTER
const fetchKategori = async () => {
  // Fetch kategori perilaku (umum untuk pelanggaran & kebaikan) dan level dampak
  const [kategoriPerilaku, levelDampak] = await Promise.all([
    supabase.from('kategori_perilaku_keasramaan').select('*').eq('status', 'aktif').order('nama_kategori'),
    supabase.from('level_dampak_keasramaan').select('*').eq('status', 'aktif').order('urutan'),
  ]);

  setKategoriPerilakuList(kategoriPerilaku.data || []);
  setLevelDampakList(levelDampak.data || []);
};
```

### 4. Update currentKategoriList
```typescript
// BEFORE
const currentKategoriList = tipe === 'pelanggaran' ? kategoriPerilakuList : kategoriKebaikanList;

// AFTER
// Sekarang kategori perilaku digunakan untuk pelanggaran dan kebaikan
const currentKategoriList = kategoriPerilakuList;
```

## Hasil

Setelah fix:
- ✅ Dropdown kategori muncul di form pelanggaran
- ✅ Dropdown kategori muncul di form kebaikan
- ✅ Menggunakan kategori umum yang sama (Kedisiplinan, Ibadah, Adab & Akhlak, dll)
- ✅ Build production berhasil tanpa error

## Kategori yang Tersedia (Umum)

Setelah fix, kategori yang muncul di dropdown (untuk pelanggaran dan kebaikan):

1. Kedisiplinan
2. Kebersihan
3. Adab & Akhlak
4. Ibadah
5. Tanggung Jawab
6. Akademik
7. Sosial
8. Kesehatan
9. Kreativitas
10. Kepemimpinan

## Testing

### Test Case 1: Form Pelanggaran
1. Buka `/catatan-perilaku/form/[token]`
2. Pilih tab "Pelanggaran"
3. Klik dropdown "Kategori"
4. ✅ Dropdown muncul dengan 10 kategori

### Test Case 2: Form Kebaikan
1. Buka `/catatan-perilaku/form/[token]`
2. Pilih tab "Kebaikan"
3. Klik dropdown "Kategori"
4. ✅ Dropdown muncul dengan 10 kategori (sama dengan pelanggaran)

### Test Case 3: Submit Form
1. Isi semua field
2. Submit form
3. ✅ Data tersimpan dengan benar
4. ✅ Field `kategori_perilaku_id` dan `nama_kategori` terisi

## File yang Dimodifikasi
- `portal-keasramaan/app/catatan-perilaku/form/[token]/page.tsx`

## Migration Note

Jika ada data lama di tabel `kategori_kebaikan_keasramaan`, pastikan sudah di-migrate ke `kategori_perilaku_keasramaan` sebelum menjalankan `UPDATE_CATATAN_PERILAKU_V2.sql`.

## Related Files
- `portal-keasramaan/supabase/UPDATE_CATATAN_PERILAKU_V2.sql` - Script update database V2
- `portal-keasramaan/supabase/SETUP_CATATAN_PERILAKU.sql` - Setup awal (V1, deprecated)

## Kesimpulan

Masalah dropdown kategori kebaikan tidak muncul disebabkan oleh perubahan struktur database dari V1 ke V2. Setelah menyesuaikan kode form dengan struktur database baru, dropdown kategori sudah berfungsi normal untuk pelanggaran dan kebaikan.
