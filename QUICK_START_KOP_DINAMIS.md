# ⚡ QUICK START: KOP Surat Dinamis

## 🚀 Setup (5 Menit)

### 1. Database Migration
```sql
-- Jalankan di Supabase SQL Editor
-- File: MIGRATION_KOP_DINAMIS.sql

ALTER TABLE info_sekolah_keasramaan
ADD COLUMN IF NOT EXISTS kop_mode TEXT DEFAULT 'dynamic',
ADD COLUMN IF NOT EXISTS kop_template_url TEXT,
ADD COLUMN IF NOT EXISTS kop_content_margin_top INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS kop_content_margin_bottom INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS kop_content_margin_left INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS kop_content_margin_right INTEGER DEFAULT 20;
```

### 2. Create Storage Bucket
```
Supabase Dashboard → Storage → Create Bucket
Nama: kop-templates-keasramaan
Type: Private
```

### 3. Setup Policies
```sql
CREATE POLICY "Allow authenticated upload kop templates"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kop-templates-keasramaan');

CREATE POLICY "Allow authenticated read kop templates"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kop-templates-keasramaan');

CREATE POLICY "Allow authenticated delete kop templates"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kop-templates-keasramaan');
```

### 4. Deploy
```bash
npm run build
pm2 restart portal-keasramaan
```

---

## 📖 Cara Pakai

### Mode 1: KOP Dinamis (Text-Based)
```
1. Login → Identitas Sekolah
2. Pilih "Mode 1: KOP Dinamis"
3. Isi data (nama, alamat, kontak)
4. Upload logo (opsional)
5. Simpan
6. Generate surat → KOP otomatis
```

### Mode 2: KOP Template (Image-Based)
```
1. Login → Identitas Sekolah
2. Pilih "Mode 2: KOP Template"
3. Upload template A4 (PNG/JPG, max 10MB)
4. Atur margin (40, 30, 20, 20)
5. Simpan
6. Generate surat → Template sebagai background
```

---

## 📐 Ukuran Template

**A4:**
- 210mm x 297mm
- 2480px x 3508px @ 300dpi ⭐
- PNG atau JPG
- Max 10MB

**Margin:**
- Top: 40mm (header)
- Bottom: 30mm (footer)
- Left/Right: 20mm (side)

---

## ✅ Checklist

- [ ] Migration SQL run
- [ ] Bucket created
- [ ] Policies setup
- [ ] App deployed
- [ ] Test Mode Dinamis
- [ ] Test Mode Template
- [ ] Generate surat OK

---

## 🐛 Troubleshooting

**Upload Gagal?**
→ Cek bucket & policies

**Template Tidak Muncul?**
→ Cek URL & format file

**Konten Tertimpa?**
→ Atur margin lebih besar

---

## 📁 Files

- `MIGRATION_KOP_DINAMIS.sql` - Migration
- `FITUR_KOP_DINAMIS.md` - Dokumentasi lengkap
- `FINAL_SUMMARY_KOP_DINAMIS.md` - Summary
- `lib/pdf-generator.ts` - Source code

---

**Status:** ✅ READY
**Time:** ~5 menit
