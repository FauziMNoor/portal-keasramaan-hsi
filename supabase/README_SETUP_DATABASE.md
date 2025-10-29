# 🗄️ Setup Database - Panduan Lengkap

## ⚠️ Tentang Warning "Destructive Operation"

### **Apa itu?**
Supabase menampilkan warning ini ketika SQL menggunakan:
- `DROP` (menghapus)
- `CREATE OR REPLACE` (mengganti)
- `ALTER` (mengubah struktur)

### **Apakah Aman?**
✅ **YA, AMAN!** Karena:
- Script hanya membuat tabel BARU (`users_keasramaan`)
- Tidak menyentuh tabel yang sudah ada
- Menggunakan `IF NOT EXISTS` untuk mencegah overwrite
- Hanya drop/replace yang kita buat sendiri

### **Kapan TIDAK Aman?**
❌ Jika script mengandung:
- `DROP TABLE existing_table` (tanpa IF EXISTS)
- `DELETE FROM existing_table`
- `TRUNCATE existing_table`
- `ALTER TABLE existing_table DROP COLUMN`

---

## 📋 Cara Setup (3 Langkah Mudah)

### **Langkah 1: Buat Tabel Users (WAJIB)**

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file: `CREATE_USERS_TABLE_SAFE.sql`
3. Paste di SQL Editor
4. Klik **"Run"**
5. ✅ Tidak ada warning! Tabel berhasil dibuat

**Hasil:**
- Tabel `users_keasramaan` dibuat
- 1 user admin default (email: admin@hsi.sch.id)
- Index untuk performa
- RLS enabled

---

### **Langkah 2: Tambah Functions & Triggers (OPTIONAL)**

**Fungsi:** Auto-update timestamp saat data diubah

1. Copy isi file: `CREATE_USERS_FUNCTIONS.sql`
2. Paste di SQL Editor
3. **Warning akan muncul** → Klik **"Run this query"**
4. ✅ Functions & triggers berhasil dibuat

**Aman karena:**
- Hanya membuat function baru
- Trigger hanya untuk tabel `users_keasramaan`
- Tidak mempengaruhi tabel lain

---

### **Langkah 3: Setup RLS Policies (OPTIONAL)**

**Fungsi:** Keamanan row-level untuk kontrol akses

1. Copy isi file: `CREATE_USERS_POLICIES.sql`
2. Paste di SQL Editor
3. **Warning akan muncul** → Klik **"Run this query"**
4. ✅ Policies berhasil dibuat

**Aman karena:**
- Policies hanya untuk tabel `users_keasramaan`
- Tidak mempengaruhi tabel lain
- Bisa di-drop dan re-create kapan saja

---

## 🔍 Verifikasi Setup Berhasil

Jalankan query ini untuk cek:

```sql
-- Cek tabel sudah dibuat
SELECT 
  table_name, 
  COUNT(*) as jumlah_kolom
FROM information_schema.columns 
WHERE table_name = 'users_keasramaan'
GROUP BY table_name;

-- Cek user admin sudah ada
SELECT 
  email, 
  nama_lengkap, 
  role, 
  is_active,
  created_at
FROM users_keasramaan;

-- Cek indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'users_keasramaan';
```

**Expected Result:**
- Tabel ada dengan 15 kolom
- 1 user admin
- 3 indexes (email, role, is_active)

---

## 🎯 Rekomendasi

### **Untuk Development/Testing:**
✅ Jalankan semua 3 script
- Langkah 1: Tabel (WAJIB)
- Langkah 2: Functions (RECOMMENDED)
- Langkah 3: Policies (RECOMMENDED)

### **Untuk Production:**
✅ Jalankan semua 3 script
✅ Backup database dulu
✅ Test di staging environment dulu

---

## 🔐 Next Steps Setelah Database Ready

1. ✅ Install dependencies
   ```bash
   npm install bcryptjs jose
   npm install --save-dev @types/bcryptjs
   ```

2. ✅ Generate password hash untuk admin
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"
   ```

3. ✅ Update password admin di Supabase
   ```sql
   UPDATE users_keasramaan 
   SET password_hash = 'PASTE_HASH_DISINI'
   WHERE email = 'admin@hsi.sch.id';
   ```

4. ✅ Buat halaman login & API routes
   (Lihat `SETUP_LOGIN_GUIDE.md`)

---

## ❓ FAQ

### **Q: Warning "destructive operation" muncul, aman?**
A: Ya aman! Klik "Run this query". Script tidak akan merusak data yang sudah ada.

### **Q: Bagaimana jika tabel sudah ada?**
A: Script menggunakan `IF NOT EXISTS`, jadi tidak akan overwrite.

### **Q: Bisa rollback jika ada masalah?**
A: Ya, tinggal drop tabel:
```sql
DROP TABLE IF EXISTS users_keasramaan CASCADE;
```

### **Q: Perlu backup database dulu?**
A: Untuk production: YA. Untuk development: tidak wajib.

### **Q: Script ini akan hapus tabel lain?**
A: TIDAK. Script hanya membuat tabel baru `users_keasramaan`.

---

## 📊 Struktur Tabel yang Dibuat

```
users_keasramaan
├── id (UUID, Primary Key)
├── email (VARCHAR, Unique)
├── password_hash (TEXT)
├── nama_lengkap (VARCHAR)
├── role (VARCHAR) - admin, kepala_asrama, musyrif, user
├── lokasi (VARCHAR)
├── asrama (VARCHAR)
├── no_telepon (VARCHAR)
├── foto (TEXT)
├── is_active (BOOLEAN)
├── last_login (TIMESTAMP)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── updated_by (UUID)
```

---

## ✅ Checklist

- [ ] Jalankan `CREATE_USERS_TABLE_SAFE.sql` ✅ No Warning
- [ ] Jalankan `CREATE_USERS_FUNCTIONS.sql` ⚠️ Warning OK
- [ ] Jalankan `CREATE_USERS_POLICIES.sql` ⚠️ Warning OK
- [ ] Verifikasi tabel & user admin ada
- [ ] Install npm dependencies
- [ ] Generate & update password hash
- [ ] Lanjut ke setup login page

---

**Status**: ✅ Safe to Execute
**Impact**: ✅ No Impact on Existing Tables
**Rollback**: ✅ Easy (just DROP TABLE)
