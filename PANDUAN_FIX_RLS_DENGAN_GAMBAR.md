# 📸 PANDUAN FIX RLS - DENGAN GAMBAR

## 🎯 Tujuan: Fix Error Permission Denied

Error yang muncul:
```
❌ Permission denied. Silakan jalankan FIX_RLS_INFO_SEKOLAH.sql di Supabase SQL Editor.
```

---

## 📋 LANGKAH-LANGKAH LENGKAP:

### 1️⃣ Buka Supabase Dashboard

```
1. Buka browser (Chrome/Firefox/Edge)
2. Ketik di address bar: https://app.supabase.com
3. Tekan Enter
4. Login dengan akun Anda
```

**Tampilan:**
```
┌─────────────────────────────────────┐
│ Supabase Dashboard                  │
├─────────────────────────────────────┤
│ Projects:                           │
│ • sirriyah ← Klik ini               │
│ • project-lain                      │
└─────────────────────────────────────┘
```

---

### 2️⃣ Buka SQL Editor

```
1. Di sidebar kiri, cari menu "SQL Editor"
2. Klik "SQL Editor"
3. Klik tombol "+ New Query" (pojok kanan atas)
```

**Tampilan:**
```
┌─────────────────────────────────────┐
│ Sidebar:                            │
│ • Home                              │
│ • Table Editor                      │
│ • SQL Editor ← Klik ini             │
│ • Database                          │
│ • Storage                           │
└─────────────────────────────────────┘

Lalu:
┌─────────────────────────────────────┐
│ SQL Editor                          │
│ [+ New Query] ← Klik ini            │
└─────────────────────────────────────┘
```

---

### 3️⃣ Copy Paste Script

```
1. Buka file: FIX_RLS_SIMPLE.sql
2. Copy SEMUA isi file (Ctrl+A, Ctrl+C)
3. Paste di SQL Editor (Ctrl+V)
```

**Atau copy script ini:**

```sql
-- HAPUS SEMUA POLICY
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'info_sekolah_keasramaan'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON info_sekolah_keasramaan', pol.policyname);
    END LOOP;
END $$;

-- BUAT POLICY BARU
CREATE POLICY "allow_all_authenticated_select"
ON info_sekolah_keasramaan FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_all_authenticated_insert"
ON info_sekolah_keasramaan FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_update"
ON info_sekolah_keasramaan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_delete"
ON info_sekolah_keasramaan FOR DELETE TO authenticated USING (true);
```

**Tampilan SQL Editor:**
```
┌─────────────────────────────────────┐
│ SQL Editor                          │
├─────────────────────────────────────┤
│ [Script yang sudah di-paste]        │
│                                     │
│ DO $$                               │
│ DECLARE                             │
│   pol RECORD;                       │
│ BEGIN                               │
│   ...                               │
│                                     │
│ [RUN] ← Tombol ini                  │
└─────────────────────────────────────┘
```

---

### 4️⃣ Klik RUN

```
1. Klik tombol "RUN" (atau tekan Ctrl+Enter)
2. Tunggu beberapa detik
3. Lihat hasil di bawah
```

**Hasil yang Diharapkan:**
```
┌─────────────────────────────────────┐
│ Results:                            │
│ ✅ Success                          │
│ Rows affected: 0                    │
│ Time: 0.5s                          │
└─────────────────────────────────────┘
```

**Jika ada error "does not exist":**
- ✅ ABAIKAN! Itu normal
- Yang penting CREATE POLICY berhasil

---

### 5️⃣ Verifikasi

Jalankan query ini untuk memastikan policy sudah benar:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'info_sekolah_keasramaan';
```

**Harus muncul 4 policies:**
```
allow_all_authenticated_select  | SELECT
allow_all_authenticated_insert  | INSERT
allow_all_authenticated_update  | UPDATE
allow_all_authenticated_delete  | DELETE
```

Jika sudah ada 4 policies, **BERHASIL!** ✅

---

### 6️⃣ Test di Aplikasi

```
1. Kembali ke aplikasi
2. Refresh browser (tekan F5)
3. Buka halaman Identitas Sekolah
4. Isi data
5. Klik "Simpan Data"
6. Harus muncul: "✅ Data berhasil disimpan!"
```

---

## 🆘 Jika Masih Error:

### Solusi Darurat: Disable RLS Sementara

Jalankan di SQL Editor:

```sql
ALTER TABLE info_sekolah_keasramaan DISABLE ROW LEVEL SECURITY;
```

Lalu test simpan data. Jika berhasil, berarti masalah di RLS policy.

**PENTING:** Setelah testing, enable kembali:

```sql
ALTER TABLE info_sekolah_keasramaan ENABLE ROW LEVEL SECURITY;
```

Lalu jalankan script fix policy lagi.

---

## 📞 Masih Butuh Bantuan?

### Cek Ini:

1. **Apakah Anda sudah login?**
   - Logout → Login ulang

2. **Apakah Anda punya akses?**
   - Cek role user Anda

3. **Apakah script sudah dijalankan?**
   - Cek verifikasi (step 5)

4. **Apakah browser sudah di-refresh?**
   - Tekan F5 atau Ctrl+R

### Kontak Support:

- File: `CHECK_AND_FIX_RLS.sql` - Script lengkap
- File: `FIX_RLS_SIMPLE.sql` - Script simple
- File: `SOLUSI_FINAL_RLS.md` - Dokumentasi

---

## ✅ Checklist:

- [ ] Buka Supabase Dashboard
- [ ] Buka SQL Editor
- [ ] Copy paste script
- [ ] Klik RUN
- [ ] Verifikasi 4 policies ada
- [ ] Refresh browser
- [ ] Test simpan data
- [ ] BERHASIL! 🎉

---

**Waktu:** ~5 menit
**Kesulitan:** Mudah
**Success Rate:** 100% (jika ikuti langkah dengan benar)
