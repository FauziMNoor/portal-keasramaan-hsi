# 📋 Fitur Legger Rapor

## Overview

Fitur Legger Rapor adalah sistem preview dan generate rapor yang memungkinkan user untuk:
- Melihat preview data rapor sebelum di-generate
- Mengecek kelengkapan data (santri, habit tracker, kegiatan, catatan)
- Generate rapor per santri atau batch (semua santri sekaligus)
- Download PDF rapor yang sudah di-generate

## URL

```
http://localhost:3000/rapor/legger
```

## Fitur Utama

### 1. Filter & Selection
- Filter berdasarkan: Cabang, Tahun Ajaran, Semester, Kelas, Asrama
- Cascading filter (kelas muncul setelah pilih cabang, dst)
- Auto-load data santri setelah semua filter dipilih

### 2. Tabel Legger (Compact View)

Menampilkan ringkasan data santri:
- ✅ Checkbox untuk select multiple
- 📷 Foto santri (thumbnail)
- 👤 Nama & NIS
- 🏫 Kelas & Asrama
- 📊 Status kelengkapan data:
  - ✅ **Siap** - Semua data lengkap
  - ⚠️ **Kurang** - Ada data yang kurang (habit/kegiatan/catatan)
  - ❌ **Error** - Data critical kosong (data santri tidak ada)
- 🎬 Action buttons:
  - 👁️ Preview - Lihat summary
  - 📄 Generate - Generate rapor
- ⬇️ Download link (jika sudah pernah di-generate)

### 3. Preview Modal (Summary)

Klik tombol 👁️ untuk melihat summary:
- Foto santri (ukuran sedang)
- Info semester & tahun ajaran
- Checklist kelengkapan data:
  - ✅ Data Pribadi
  - ✅/❌ Habit Tracker (jumlah entry)
  - ✅/⚠️ Kegiatan (jumlah kegiatan dari 6)
  - ✅/⚠️ Catatan Musyrif
- Tombol:
  - **Lihat Detail Lengkap** → Buka Detail Modal
  - **Generate** → Generate rapor

### 4. Detail Modal (Full Data)

Klik "Lihat Detail Lengkap" untuk melihat semua data:
- Foto santri (ukuran besar)
- Info dasar lengkap
- **Habit Tracker** (expandable):
  - 21 habit dengan nilai & deskripsi
  - Scrollable jika banyak
- **Kegiatan** (expandable):
  - 6 kegiatan dengan foto & keterangan
  - Foto ditampilkan dalam grid
- **Catatan Musyrif** (expandable):
  - Catatan lengkap dari musyrif
- **Pengesahan**:
  - Nama Ketua Asrama
  - Nama Musyrif
- Tombol:
  - **Tutup** → Kembali ke legger
  - **Generate Rapor** → Generate rapor

### 5. Generate Rapor

#### Generate Single
- Klik tombol 📄 di tabel atau tombol "Generate" di modal
- Proses:
  1. Validasi Google OAuth token
  2. Fetch & compile data dari database
  3. Copy Google Slides template
  4. Replace placeholders dengan data
  5. Insert images (foto santri, kegiatan)
  6. Export to PDF
  7. Upload PDF ke Google Drive
  8. Save link ke database
  9. Delete temporary Slides file
- Loading indicator ditampilkan di tombol
- Setelah selesai, link download muncul di kolom PDF

#### Generate Batch (Semua Rapor)
- Klik tombol "Generate Semua Rapor" di action bar
- Hanya generate santri dengan status ✅ Siap
- Proses sequential dengan delay 2 detik antar santri (avoid rate limit)
- Progress ditampilkan di UI (loading per santri)
- Alert setelah semua selesai

## Status Data

### ✅ Siap (Ready)
Semua data lengkap:
- ✅ Data santri ada
- ✅ Habit tracker ada (minimal 1 entry)
- ✅ Kegiatan lengkap (6 kegiatan)
- ✅ Catatan musyrif ada

### ⚠️ Kurang (Incomplete)
Ada data yang kurang:
- ✅ Data santri ada
- ❌ Habit tracker kosong ATAU
- ❌ Kegiatan kurang dari 6 ATAU
- ❌ Catatan musyrif kosong

### ❌ Error
Data critical kosong:
- ❌ Data santri tidak ditemukan

## Flow Penggunaan

### Scenario 1: Generate Per Santri
```
1. Pilih filter (Cabang, Tahun Ajaran, Semester, Kelas, Asrama)
2. Lihat tabel legger
3. Klik 👁️ untuk preview santri
4. Review data di modal
5. (Optional) Klik "Lihat Detail Lengkap" untuk cek semua data
6. Klik "Generate" di modal
7. Tunggu proses generate
8. Download PDF dari link di tabel
```

### Scenario 2: Generate Batch
```
1. Pilih filter (Cabang, Tahun Ajaran, Semester, Kelas, Asrama)
2. Lihat tabel legger
3. Review status santri (pastikan ada yang ✅ Siap)
4. Klik "Generate Semua Rapor"
5. Konfirmasi
6. Tunggu proses batch generate
7. Download PDF dari link di tabel
```

### Scenario 3: Review Data Sebelum Generate
```
1. Pilih filter
2. Lihat tabel legger
3. Cek santri dengan status ⚠️ Kurang atau ❌ Error
4. Klik 👁️ untuk lihat detail
5. Klik "Lihat Detail Lengkap"
6. Review data yang kurang:
   - Habit tracker kosong? → Isi di menu Habit Tracker
   - Kegiatan kurang? → Setup di menu Rapor > Setup Kegiatan
   - Catatan kosong? → Isi di menu Rapor > Setup Catatan
7. Refresh halaman
8. Generate setelah data lengkap
```

## Technical Details

### Components

1. **`/app/rapor/legger/page.tsx`**
   - Main page component
   - Handle filters, data fetching, generate logic
   - State management untuk legger data

2. **`/components/rapor/LeggerTable.tsx`**
   - Tabel compact view
   - Checkbox selection
   - Action buttons
   - Status badges

3. **`/components/rapor/PreviewModal.tsx`**
   - Summary modal
   - Data completeness checklist
   - Quick actions

4. **`/components/rapor/DetailModal.tsx`**
   - Full detail modal
   - Expandable sections
   - Image display
   - Complete data view

### API Integration

Menggunakan API yang sudah ada:
- **`/api/rapor/generate`** (POST)
  - Mode: 'single'
  - Payload: cabang, tahunAjaran, semester, kelas, asrama, nis, googleTokens
  - Response: { success, data: { pdf_url, presentation_url } }

### Database Tables

1. **`data_siswa_keasramaan`** - Data santri
2. **`formulir_habit_tracker_keasramaan`** - Habit tracker entries
3. **`rapor_kegiatan_keasramaan`** - Kegiatan setup
4. **`rapor_catatan_keasramaan`** - Catatan musyrif
5. **`rapor_generate_log_keasramaan`** - Log generate & PDF URL

### Helper Functions

- **`compileRaporData()`** - Compile semua data untuk rapor
- **`checkDataCompleteness()`** - Cek kelengkapan data per santri
- **`fetchLeggerData()`** - Fetch data untuk tabel legger

## Google Integration

### OAuth Flow
1. User klik "Connect Google Account"
2. OAuth popup window
3. User authorize
4. Tokens saved to localStorage
5. Tokens digunakan untuk:
   - Copy Slides template
   - Export to PDF
   - Upload to Drive
   - Delete temporary files

### Google APIs Used
- **Google Slides API** - Copy template, replace text, insert images
- **Google Drive API** - Upload PDF, delete temp files
- **Google Docs API** - Export to PDF

## Performance Considerations

1. **Lazy Loading**: Data di-fetch hanya setelah filter lengkap
2. **Batch Delay**: 2 detik delay antar generate untuk avoid rate limit
3. **Image Optimization**: Thumbnail di tabel, full size di modal
4. **Expandable Sections**: Detail data di-collapse by default
5. **Pagination**: (Future) Jika santri > 100, perlu pagination

## Future Enhancements

1. **Filter Status**: Filter by status (Siap, Kurang, Error)
2. **Search**: Search by nama/NIS
3. **Bulk Actions**: Select multiple → Generate selected
4. **Progress Bar**: Real-time progress untuk batch generate
5. **Export Excel**: Export legger data ke Excel
6. **Print Preview**: Preview rapor sebelum generate
7. **Template Selection**: Pilih template rapor yang berbeda
8. **Notification**: Email notification setelah batch generate selesai

## Troubleshooting

### Data Tidak Muncul
- Pastikan filter sudah dipilih semua
- Cek apakah ada santri di kelas/asrama tersebut
- Refresh halaman

### Generate Gagal
- Pastikan Google account sudah terkoneksi
- Cek koneksi internet
- Cek log error di console
- Cek apakah template Slides masih ada

### PDF Tidak Bisa Download
- Cek apakah PDF URL valid
- Cek permission Google Drive
- Cek apakah file masih ada di Drive

### Status Selalu "Kurang"
- Cek data habit tracker (minimal 1 entry)
- Cek kegiatan (harus 6 kegiatan)
- Cek catatan musyrif (harus ada)
- Klik "Lihat Detail Lengkap" untuk detail

## Summary

Fitur Legger Rapor memberikan:
- ✅ Transparansi data sebelum generate
- ✅ QA/QC data rapor
- ✅ Batch processing yang efisien
- ✅ User-friendly interface
- ✅ Integration dengan Google Workspace
- ✅ Tracking PDF yang sudah di-generate

Dengan fitur ini, user bisa yakin bahwa data rapor yang di-generate sudah lengkap dan akurat! 🎉
