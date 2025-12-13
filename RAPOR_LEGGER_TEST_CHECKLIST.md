# ✅ Test Checklist - Legger Rapor

## Pre-requisites

### Data Setup
- [ ] Ada data santri di `data_siswa_keasramaan`
- [ ] Ada data habit tracker di `formulir_habit_tracker_keasramaan`
- [ ] Ada setup kegiatan di `rapor_kegiatan_keasramaan` (minimal 6)
- [ ] Ada catatan musyrif di `rapor_catatan_keasramaan`
- [ ] Google Slides template sudah di-setup
- [ ] Google OAuth credentials sudah di-configure

### Environment
- [ ] `.env.local` sudah di-setup dengan Google credentials
- [ ] Supabase connection working
- [ ] Development server running (`npm run dev`)

## Test Cases

### 1. Filter & Navigation

#### 1.1 Akses Halaman
- [ ] Buka `http://localhost:3000/rapor/legger`
- [ ] Halaman load tanpa error
- [ ] Header "Legger Rapor" muncul
- [ ] Google OAuth button muncul di kanan atas

#### 1.2 Filter Cascading
- [ ] Dropdown "Cabang" menampilkan list cabang
- [ ] Pilih cabang → Dropdown "Kelas" aktif
- [ ] Pilih kelas → Dropdown "Asrama" aktif
- [ ] Pilih asrama → Tabel legger muncul
- [ ] Ganti cabang → Kelas & Asrama reset

#### 1.3 Filter Validation
- [ ] Sebelum pilih semua filter → Warning "Silakan pilih semua filter"
- [ ] Setelah pilih semua → Tabel legger muncul
- [ ] Loading indicator muncul saat fetch data

### 2. Legger Table

#### 2.1 Display Data
- [ ] Tabel menampilkan semua santri di kelas/asrama
- [ ] Foto santri muncul (atau placeholder jika kosong)
- [ ] Nama & NIS muncul
- [ ] Kelas & Asrama muncul
- [ ] Status badge muncul (Siap/Kurang/Error)

#### 2.2 Status Logic
- [ ] Santri dengan data lengkap → Status ✅ Siap
- [ ] Santri tanpa habit tracker → Status ⚠️ Kurang
- [ ] Santri dengan kegiatan < 6 → Status ⚠️ Kurang
- [ ] Santri tanpa catatan → Status ⚠️ Kurang
- [ ] Santri tanpa data → Status ❌ Error

#### 2.3 Action Buttons
- [ ] Tombol 👁️ (Preview) bisa diklik
- [ ] Tombol 📄 (Generate) bisa diklik
- [ ] Tombol Generate disabled untuk status Error
- [ ] Loading indicator muncul saat generate

#### 2.4 Checkbox Selection
- [ ] Checkbox per row bisa dicentang
- [ ] Checkbox header (select all) berfungsi
- [ ] Counter "X dipilih" update sesuai selection

#### 2.5 Action Bar
- [ ] Counter santri total muncul
- [ ] Badge status (Siap/Kurang/Error) dengan count
- [ ] Tombol "Generate Semua Rapor" muncul
- [ ] Tombol disabled jika tidak ada santri Siap

### 3. Preview Modal

#### 3.1 Open Modal
- [ ] Klik tombol 👁️ → Modal terbuka
- [ ] Loading indicator muncul
- [ ] Data santri ter-load

#### 3.2 Display Data
- [ ] Foto santri muncul (ukuran medium)
- [ ] Nama & NIS muncul
- [ ] Semester & Tahun Ajaran muncul
- [ ] Checklist kelengkapan data:
  - [ ] Data Pribadi (selalu ✅)
  - [ ] Habit Tracker (✅ jika > 0, ❌ jika 0)
  - [ ] Kegiatan (✅ jika 6, ⚠️ jika < 6)
  - [ ] Catatan Musyrif (✅ jika ada, ⚠️ jika kosong)

#### 3.3 Actions
- [ ] Tombol "Lihat Detail Lengkap" berfungsi
- [ ] Tombol "Generate" berfungsi
- [ ] Tombol X (close) berfungsi
- [ ] Klik di luar modal → Modal close

### 4. Detail Modal

#### 4.1 Open Modal
- [ ] Dari Preview Modal → Klik "Lihat Detail Lengkap"
- [ ] Loading indicator muncul
- [ ] Data lengkap ter-load

#### 4.2 Display Data
- [ ] Foto santri muncul (ukuran large)
- [ ] Info dasar lengkap
- [ ] Section Habit Tracker (collapsed by default)
- [ ] Section Kegiatan (collapsed by default)
- [ ] Section Catatan (collapsed by default)
- [ ] Section Pengesahan

#### 4.3 Expandable Sections
- [ ] Klik Habit Tracker → Expand/collapse
- [ ] Klik Kegiatan → Expand/collapse
- [ ] Klik Catatan → Expand/collapse
- [ ] Icon chevron berubah (up/down)

#### 4.4 Habit Tracker Section
- [ ] Menampilkan 21 habit items
- [ ] Setiap item menampilkan label & deskripsi
- [ ] Scrollable jika banyak
- [ ] Deskripsi sesuai dengan nilai

#### 4.5 Kegiatan Section
- [ ] Menampilkan semua kegiatan (max 6)
- [ ] Setiap kegiatan menampilkan:
  - [ ] Nama kegiatan
  - [ ] Foto 1 (jika ada)
  - [ ] Foto 2 (jika ada)
  - [ ] Keterangan
- [ ] Foto ditampilkan dalam grid
- [ ] Jika tidak ada kegiatan → "Belum ada kegiatan"

#### 4.6 Catatan Section
- [ ] Menampilkan catatan musyrif
- [ ] Jika kosong → "-"

#### 4.7 Pengesahan Section
- [ ] Nama Ketua Asrama muncul
- [ ] Nama Musyrif muncul
- [ ] Jika kosong → "-"

#### 4.8 Actions
- [ ] Tombol "Tutup" berfungsi
- [ ] Tombol "Generate Rapor" berfungsi
- [ ] Tombol X (close) berfungsi

### 5. Generate Single Rapor

#### 5.1 Pre-generate
- [ ] Google OAuth token ada di localStorage
- [ ] Jika tidak ada → Alert "Google account not connected"

#### 5.2 Generate Process
- [ ] Klik tombol Generate
- [ ] Loading indicator muncul di tombol
- [ ] Row di tabel menampilkan loading
- [ ] Tidak bisa klik tombol lain saat generating

#### 5.3 API Call
- [ ] Request ke `/api/rapor/generate` dengan payload correct
- [ ] Mode: 'single'
- [ ] Google tokens included
- [ ] Response success

#### 5.4 Post-generate
- [ ] Loading indicator hilang
- [ ] Link download muncul di kolom PDF
- [ ] Alert "Rapor berhasil di-generate"
- [ ] Klik link → PDF terbuka di tab baru

#### 5.5 Error Handling
- [ ] Jika error → Alert dengan error message
- [ ] Loading indicator hilang
- [ ] Bisa retry generate

### 6. Generate Batch (Semua Rapor)

#### 6.1 Pre-generate
- [ ] Ada santri dengan status ✅ Siap
- [ ] Tombol "Generate Semua Rapor" enabled
- [ ] Google OAuth token ada

#### 6.2 Confirmation
- [ ] Klik tombol → Confirmation dialog
- [ ] Dialog menampilkan jumlah santri
- [ ] Bisa cancel

#### 6.3 Batch Process
- [ ] Generate sequential (satu per satu)
- [ ] Loading indicator per row
- [ ] Delay 2 detik antar santri
- [ ] Progress visible di UI

#### 6.4 Post-generate
- [ ] Semua santri Siap ter-generate
- [ ] Link download muncul untuk semua
- [ ] Alert "Batch generate selesai"
- [ ] Bisa download semua PDF

#### 6.5 Error Handling
- [ ] Jika 1 santri error → Lanjut ke santri berikutnya
- [ ] Error log di console
- [ ] Alert menampilkan summary (berhasil/gagal)

### 7. PDF Download

#### 7.1 Download Link
- [ ] Link muncul setelah generate success
- [ ] Link format: "Download"
- [ ] Icon download muncul

#### 7.2 Download Process
- [ ] Klik link → PDF terbuka di tab baru
- [ ] PDF bisa di-view
- [ ] PDF bisa di-download
- [ ] PDF bisa di-print

#### 7.3 PDF Content
- [ ] Data santri correct
- [ ] Semester & Tahun Ajaran correct
- [ ] Habit tracker values correct
- [ ] Kegiatan names correct
- [ ] Catatan musyrif correct
- [ ] Pengesahan correct
- [ ] **Note**: Foto belum ter-insert (Phase 2)

### 8. Edge Cases

#### 8.1 No Data
- [ ] Tidak ada santri → "Tidak ada santri di kelas/asrama ini"
- [ ] Tidak ada habit tracker → Status Kurang
- [ ] Tidak ada kegiatan → Status Kurang
- [ ] Tidak ada catatan → Status Kurang

#### 8.2 Partial Data
- [ ] Habit tracker < 5 entry → Tetap bisa generate
- [ ] Kegiatan < 6 → Status Kurang, tetap bisa generate
- [ ] Catatan kosong → Status Kurang, tetap bisa generate

#### 8.3 Network Issues
- [ ] Slow connection → Loading indicator tetap muncul
- [ ] Timeout → Error message
- [ ] Retry berfungsi

#### 8.4 Google OAuth
- [ ] Token expired → Refresh token otomatis
- [ ] Token invalid → Alert "Please reconnect Google account"
- [ ] Re-authorize berfungsi

### 9. Performance

#### 9.1 Load Time
- [ ] Halaman load < 2 detik
- [ ] Tabel legger load < 3 detik (untuk 50 santri)
- [ ] Modal load < 1 detik

#### 9.2 Generate Time
- [ ] Single generate: 30-60 detik
- [ ] Batch generate: ~2 menit per santri

#### 9.3 Memory
- [ ] Tidak ada memory leak
- [ ] Browser tidak freeze saat batch generate
- [ ] Bisa handle 100+ santri

### 10. UI/UX

#### 10.1 Responsive
- [ ] Desktop (1920x1080) → Layout correct
- [ ] Laptop (1366x768) → Layout correct
- [ ] Tablet (768x1024) → Layout correct
- [ ] Mobile (375x667) → Layout correct (horizontal scroll)

#### 10.2 Visual
- [ ] Colors consistent dengan design system
- [ ] Icons clear & meaningful
- [ ] Badges readable
- [ ] Loading indicators smooth

#### 10.3 Accessibility
- [ ] Keyboard navigation berfungsi
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Alt text untuk images

#### 10.4 Error Messages
- [ ] Error messages clear & actionable
- [ ] Success messages encouraging
- [ ] Warning messages informative

### 11. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 12. Integration

#### 12.1 Database
- [ ] Data fetch dari Supabase correct
- [ ] Data save ke log table correct
- [ ] PDF URL saved correct

#### 12.2 Google APIs
- [ ] Slides API working
- [ ] Drive API working
- [ ] OAuth flow working
- [ ] Token refresh working

#### 12.3 File Storage
- [ ] PDF upload ke Drive success
- [ ] PDF accessible via URL
- [ ] Temporary Slides deleted

## Test Results

### Summary
- Total Test Cases: ___
- Passed: ___
- Failed: ___
- Skipped: ___

### Issues Found
1. 
2. 
3. 

### Notes
- 
- 
- 

## Sign-off

- [ ] All critical tests passed
- [ ] All blockers resolved
- [ ] Ready for production

**Tested by**: _______________
**Date**: _______________
**Version**: _______________
