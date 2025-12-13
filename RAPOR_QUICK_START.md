# 🚀 Quick Start - Sistem Manajemen Rapor

## 📋 Checklist Setup

### 1. ✅ Database Migration
```sql
-- Jalankan 2 file ini di Supabase SQL Editor (berurutan):

-- 1. Database tables
portal-keasramaan/supabase/migrations/20241212_rapor_system.sql

-- 2. Storage buckets & policies
portal-keasramaan/supabase/migrations/20241212_rapor_storage_bucket.sql
```

### 2. ✅ Google Slides API Setup

**Environment Variables sudah di-setup:**
- ✅ `GOOGLE_SLIDES_TEMPLATE_ID`
- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- ✅ `GOOGLE_PRIVATE_KEY`
- ✅ `GOOGLE_PROJECT_ID`

**Yang perlu dilakukan:**
1. Share template Google Slides ke service account:
   - Email: `raporasrama2526@rapor-asrama.iam.gserviceaccount.com`
   - Role: **Editor** atau **Viewer**
   - Template: https://docs.google.com/presentation/d/1DgO-zc-Q-Dspom8yIgHskYXnLtxgYRsE5nyx6C0uE-M/edit

2. Test koneksi:
   ```bash
   # Restart dev server
   npm run dev
   
   # Buka browser
   http://localhost:3000/test-google-slides
   ```

### 3. ✅ Install Dependencies
```bash
cd portal-keasramaan
npm install googleapis
```

---

## 🗂️ Struktur File

```
portal-keasramaan/
├── app/
│   ├── api/
│   │   ├── test-google-slides/
│   │   │   └── route.ts          # Test API
│   │   └── rapor/
│   │       ├── generate/
│   │       │   └── route.ts      # Generate rapor API (TODO)
│   │       ├── rekap-habit/
│   │       │   └── route.ts      # Rekap habit API (TODO)
│   │       └── history/
│   │           └── route.ts      # History API (TODO)
│   ├── rapor/
│   │   ├── setup/
│   │   │   └── page.tsx          # Setup kegiatan (TODO)
│   │   ├── generate/
│   │   │   └── page.tsx          # Generate rapor (TODO)
│   │   └── history/
│   │       └── page.tsx          # History (TODO)
│   └── test-google-slides/
│       └── page.tsx               # Test page ✅
├── lib/
│   └── googleSlides.ts            # Google Slides helper ✅
├── supabase/
│   └── migrations/
│       └── 20241212_rapor_system.sql  # Database schema ✅
└── docs/
    └── RAPOR_SYSTEM_DOCUMENTATION.md  # Full documentation ✅
```

---

## 🎯 Next Steps

### Phase 1: Setup & Test (SEKARANG)
- [x] Database migration
- [x] Google Slides API setup
- [x] Test koneksi
- [ ] **ACTION**: Share template ke service account
- [ ] **ACTION**: Test di http://localhost:3000/test-google-slides

### Phase 2: Setup Rapor Page
- [ ] Buat halaman `/rapor/setup`
- [ ] Form input 6 kegiatan
- [ ] Upload foto kegiatan (2 foto per kegiatan)
- [ ] Upload dokumentasi lainnya (multiple)
- [ ] CRUD kegiatan

### Phase 3: Generate Rapor Page
- [ ] Buat halaman `/rapor/generate`
- [ ] Filter & mode selection
- [ ] Preview data sebelum generate
- [ ] API endpoint generate
- [ ] Logic rekap habit tracker
- [ ] Mapping ke indikator
- [ ] Replace placeholder di Google Slides
- [ ] Export to PDF
- [ ] Download single PDF
- [ ] Batch generate (ZIP)

### Phase 4: History & Polish
- [ ] Buat halaman `/rapor/history`
- [ ] List history generate
- [ ] Re-download PDF
- [ ] Form catatan musyrif
- [ ] Permission & role access
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive

---

## 🧪 Testing

### Test Google Slides Connection
```bash
# 1. Pastikan dev server running
npm run dev

# 2. Buka browser
http://localhost:3000/test-google-slides

# 3. Klik "Test Connection"
# Expected: ✅ Success dengan info presentation
```

### Test Database
```sql
-- Test insert kegiatan
INSERT INTO rapor_kegiatan_keasramaan (
  cabang, tahun_ajaran, semester, kelas, asrama,
  nama_kegiatan, keterangan_kegiatan, urutan
) VALUES (
  'Pusat', '2024/2025', 'Ganjil', '7', 'Asrama A',
  'Kegiatan Test', 'Ini adalah test kegiatan', 1
);

-- Test query
SELECT * FROM rapor_kegiatan_keasramaan
WHERE cabang = 'Pusat' 
  AND tahun_ajaran = '2024/2025'
  AND semester = 'Ganjil';
```

---

## 📊 Data Flow

```
Setup Rapor:
User Input → rapor_kegiatan_keasramaan (6 kegiatan)
User Upload → rapor_dokumentasi_lainnya_keasramaan (multiple foto)

Generate Rapor:
1. Fetch data_siswa_keasramaan (data santri)
2. Fetch formulir_habit_tracker_keasramaan (habit tracker)
3. Calculate average per habit
4. Map to indikator_keasramaan (get deskripsi)
5. Save to rapor_rekap_habit_keasramaan (cache)
6. Fetch rapor_kegiatan_keasramaan (kegiatan)
7. Fetch rapor_dokumentasi_lainnya_keasramaan (dokumentasi)
8. Fetch rapor_catatan_keasramaan (catatan musyrif)
9. Copy Google Slides template
10. Replace all placeholders
11. Export to PDF
12. Save log to rapor_generate_log_keasramaan
13. Return PDF to user
```

---

## 🔧 Troubleshooting

### Error: "Permission denied" saat test Google Slides
**Solusi:** Share template ke service account email

### Error: "Invalid credentials"
**Solusi:** Cek format `GOOGLE_PRIVATE_KEY` di `.env.local` (harus ada `\n`)

### Error: "Template not found"
**Solusi:** Cek `GOOGLE_SLIDES_TEMPLATE_ID` sudah benar

### Database error saat insert
**Solusi:** Pastikan migration sudah dijalankan di Supabase

---

## 📞 Need Help?

Jika ada pertanyaan atau stuck di step tertentu, kasih tau saya! 😊

---

## 📝 Notes

- Template Google Slides harus sudah di-share ke service account
- Placeholder di template harus exact match (case-sensitive)
- Untuk batch generate, gunakan queue/background job (future improvement)
- PDF storage bisa menggunakan Supabase Storage atau Google Drive
