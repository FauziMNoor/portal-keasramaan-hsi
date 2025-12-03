# 🔄 Update: Manage Link Perizinan (Metode Baru)

## 📋 Perubahan

Sistem manage link perizinan telah diupdate menggunakan **metode yang sama** dengan Catatan Perilaku dan Habit Tracker yang sudah terbukti lebih baik.

## ✨ Fitur Baru

### 1. UI/UX yang Lebih Baik
- ✅ Modal form yang lebih modern
- ✅ Table dengan gradient header
- ✅ Icon yang lebih lengkap (Edit, Delete, Toggle Status)
- ✅ Copy link dengan fallback untuk browser lama
- ✅ Buka link di tab baru

### 2. Filter Berdasarkan Cabang
- ✅ Bisa membatasi token untuk cabang tertentu
- ✅ Atau biarkan kosong untuk semua cabang
- ✅ Tampil badge cabang di table

### 3. Fitur Edit Token
- ✅ Bisa edit nama token
- ✅ Bisa edit deskripsi
- ✅ Bisa ubah cabang
- ✅ Token tetap sama (tidak berubah)

### 4. Better Copy Mechanism
- ✅ Modern clipboard API
- ✅ Fallback untuk browser lama
- ✅ Alert konfirmasi berhasil/gagal

### 5. Deskripsi Token
- ✅ Field deskripsi untuk keterangan tambahan
- ✅ Tampil di table sebagai subtitle

## 🗄️ Database Changes

### Migration Required

Jika tabel `token_perizinan_keasramaan` sudah ada, jalankan:

**File**: `MIGRATION_TOKEN_PERIZINAN.sql`

```sql
-- Tambah kolom cabang
ALTER TABLE token_perizinan_keasramaan 
ADD COLUMN IF NOT EXISTS cabang TEXT;

-- Rename keterangan ke deskripsi
ALTER TABLE token_perizinan_keasramaan 
RENAME COLUMN keterangan TO deskripsi;
```

### Fresh Install

Jika fresh install, gunakan:

**File**: `SETUP_PERIZINAN_KEPULANGAN.sql` (sudah diupdate)

Struktur tabel baru:
```sql
CREATE TABLE token_perizinan_keasramaan (
    id UUID PRIMARY KEY,
    nama_token TEXT NOT NULL,
    deskripsi TEXT,           -- ← Baru (dulu: keterangan)
    token TEXT NOT NULL UNIQUE,
    cabang TEXT,              -- ← Baru
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎨 UI Comparison

### Before (Versi Lama)
```
❌ Form inline di halaman
❌ Hanya bisa tambah, tidak bisa edit
❌ Copy link sederhana
❌ Tidak ada filter cabang
❌ UI kurang menarik
```

### After (Versi Baru)
```
✅ Modal form yang modern
✅ Bisa tambah dan edit
✅ Copy link dengan fallback
✅ Filter berdasarkan cabang
✅ UI gradient dan icon lengkap
✅ Buka link di tab baru
✅ Toggle aktif/nonaktif
```

## 📱 Cara Menggunakan

### 1. Buat Token Baru

1. Klik **"Buat Token Baru"**
2. Isi form:
   - **Nama Token**: `Link Perizinan Semester Ganjil 2024/2025`
   - **Deskripsi**: `Link untuk wali santri mengajukan izin kepulangan` (opsional)
   - **Cabang**: Pilih cabang atau kosongkan untuk semua cabang
3. Klik **Simpan**
4. Token otomatis ter-generate (32 karakter)

### 2. Copy & Share Link

1. Klik icon **Copy** di kolom Link
2. Alert "✅ Link berhasil dicopy!" akan muncul
3. Paste dan share ke wali santri via:
   - WhatsApp Group
   - Broadcast WhatsApp
   - Email
   - Website sekolah

### 3. Edit Token

1. Klik icon **Edit** (pensil biru)
2. Modal form terbuka dengan data existing
3. Ubah nama, deskripsi, atau cabang
4. Klik **Simpan**
5. Token tetap sama, hanya metadata yang berubah

### 4. Toggle Status

1. Klik icon **Eye/EyeOff** untuk aktif/nonaktifkan
2. Token nonaktif tidak bisa digunakan
3. Berguna untuk menonaktifkan token lama tanpa menghapus

### 5. Hapus Token

1. Klik icon **Trash** (merah)
2. Konfirmasi hapus
3. Token dan semua data terkait terhapus

### 6. Buka Link

1. Klik icon **Link** (hijau)
2. Link terbuka di tab baru
3. Berguna untuk test link sebelum dishare

## 🔍 Fitur Detail

### Filter Cabang

**Use Case**:
- Token untuk HSI Sukabumi → Hanya santri HSI Sukabumi yang bisa pakai
- Token untuk HSI Bogor → Hanya santri HSI Bogor yang bisa pakai
- Token tanpa cabang → Semua santri bisa pakai

**Implementasi**:
- Saat wali santri input NIS, sistem cek cabang santri
- Jika token punya filter cabang, validasi cabang santri
- Jika tidak match, tampilkan error

### Copy Link Mechanism

**Modern Browser** (Chrome, Firefox, Edge):
```javascript
navigator.clipboard.writeText(link)
  .then(() => alert('✅ Link berhasil dicopy!'))
```

**Old Browser** (IE, Safari lama):
```javascript
// Fallback dengan document.execCommand('copy')
// Tetap berfungsi di browser lama
```

### Edit vs Delete

**Edit**:
- Token tetap sama
- Link tidak berubah
- Hanya metadata (nama, deskripsi, cabang) yang berubah
- Berguna untuk update keterangan tanpa ganti link

**Delete**:
- Token terhapus permanent
- Link tidak bisa digunakan lagi
- Hati-hati jika link sudah dishare

## 🧪 Testing

### Test 1: Buat Token
- [ ] Klik "Buat Token Baru"
- [ ] Isi nama token
- [ ] Pilih cabang (atau kosongkan)
- [ ] Simpan
- [ ] Verifikasi token muncul di table

### Test 2: Copy Link
- [ ] Klik icon copy
- [ ] Verifikasi alert "berhasil dicopy"
- [ ] Paste di notepad
- [ ] Verifikasi link lengkap

### Test 3: Edit Token
- [ ] Klik icon edit
- [ ] Ubah nama/deskripsi/cabang
- [ ] Simpan
- [ ] Verifikasi perubahan tersimpan
- [ ] Verifikasi token tidak berubah

### Test 4: Toggle Status
- [ ] Klik icon eye untuk nonaktifkan
- [ ] Verifikasi status jadi "Nonaktif"
- [ ] Akses link → error "Token tidak valid"
- [ ] Aktifkan kembali
- [ ] Akses link → bisa digunakan

### Test 5: Delete Token
- [ ] Klik icon trash
- [ ] Konfirmasi hapus
- [ ] Verifikasi token terhapus
- [ ] Akses link → error "Token tidak valid"

### Test 6: Buka Link
- [ ] Klik icon link (hijau)
- [ ] Verifikasi buka di tab baru
- [ ] Verifikasi form perizinan terbuka

### Test 7: Filter Cabang
- [ ] Buat token dengan cabang "HSI Sukabumi"
- [ ] Akses link
- [ ] Input NIS santri HSI Bogor
- [ ] Verifikasi error/tidak bisa submit
- [ ] Input NIS santri HSI Sukabumi
- [ ] Verifikasi bisa submit

## 📊 Comparison dengan Sistem Lama

| Fitur | Versi Lama | Versi Baru |
|-------|------------|------------|
| UI Form | Inline | Modal |
| Edit Token | ❌ | ✅ |
| Filter Cabang | ❌ | ✅ |
| Deskripsi | Keterangan | Deskripsi (lebih jelas) |
| Copy Link | Basic | Modern + Fallback |
| Buka Link | ❌ | ✅ |
| Toggle Status | ✅ | ✅ |
| Delete | ✅ | ✅ |
| Icon | Basic | Lengkap |
| Gradient | ❌ | ✅ |

## 🎯 Status

✅ **SELESAI** - Manage Link Perizinan sudah menggunakan metode yang sama dengan Catatan Perilaku

## 📝 Next Steps

1. Jalankan migration SQL (jika tabel sudah ada)
2. Test semua fitur
3. Share link ke wali santri
4. Monitor usage

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Cek dokumentasi ini
2. Test di browser berbeda
3. Cek console browser untuk error
4. Hubungi IT Support

---

**Version**: 1.2.0  
**Date**: November 2025  
**Type**: Major Update  
**Status**: READY ✅
