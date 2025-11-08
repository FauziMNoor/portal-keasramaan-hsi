# Manual Testing Checklist - Sistem Manajemen Rapor Keasramaan

## Overview

Checklist ini digunakan untuk melakukan manual testing secara menyeluruh pada Sistem Manajemen Rapor Keasramaan. Setiap item harus ditest dan dicentang sebelum sistem dianggap production-ready.

**Testing Environment:**
- [ ] Development
- [ ] Staging
- [ ] Production

**Tested By:** ___________________
**Date:** ___________________
**Browser:** ___________________
**Device:** ___________________

---

## 1. Authentication & Authorization

### Login & Access Control
- [ ] Admin dapat login dengan credentials yang benar
- [ ] Login gagal dengan credentials yang salah
- [ ] Session tetap aktif setelah refresh page
- [ ] Logout berhasil menghapus session
- [ ] Non-admin tidak bisa akses menu Manajemen Rapor
- [ ] User hanya bisa akses data dari cabang mereka

---

## 2. Galeri Kegiatan Module

### 2.1 List Kegiatan
- [ ] Halaman list kegiatan dapat diakses
- [ ] Daftar kegiatan ditampilkan dengan benar
- [ ] Filter by tahun ajaran berfungsi
- [ ] Filter by semester berfungsi
- [ ] Filter by scope berfungsi
- [ ] Search by nama kegiatan berfungsi
- [ ] Pagination berfungsi (jika ada banyak data)
- [ ] Loading state ditampilkan saat fetch data

### 2.2 Create Kegiatan
- [ ] Form create kegiatan dapat diakses
- [ ] Semua field form ditampilkan dengan benar
- [ ] Dropdown scope menampilkan semua pilihan
- [ ] Validation: Nama kegiatan wajib diisi
- [ ] Validation: Tanggal mulai wajib diisi
- [ ] Validation: Tanggal selesai wajib diisi
- [ ] Validation: Tanggal selesai harus setelah tanggal mulai
- [ ] Validation: Tahun ajaran wajib diisi
- [ ] Validation: Semester wajib diisi
- [ ] Validation: Scope wajib diisi
- [ ] Kegiatan berhasil dibuat dengan data yang valid
- [ ] Toast notification muncul setelah berhasil create
- [ ] Redirect ke halaman detail setelah create
- [ ] Data kegiatan tersimpan di database

### 2.3 Edit Kegiatan
- [ ] Form edit kegiatan dapat diakses
- [ ] Form terisi dengan data kegiatan yang ada
- [ ] Semua field dapat diubah
- [ ] Validation sama seperti create
- [ ] Kegiatan berhasil diupdate
- [ ] Toast notification muncul setelah berhasil update
- [ ] Data kegiatan terupdate di database

### 2.4 Delete Kegiatan
- [ ] Tombol delete dapat diklik
- [ ] Confirmation dialog muncul
- [ ] Kegiatan berhasil dihapus setelah konfirmasi
- [ ] Semua foto terkait ikut terhapus
- [ ] Toast notification muncul setelah berhasil delete
- [ ] Kegiatan hilang dari list
- [ ] Data kegiatan terhapus dari database

### 2.5 Detail Kegiatan & Foto Management
- [ ] Halaman detail kegiatan dapat diakses
- [ ] Informasi kegiatan ditampilkan dengan benar
- [ ] Galeri foto ditampilkan (jika ada foto)
- [ ] Empty state ditampilkan jika belum ada foto

### 2.6 Upload Foto Single
- [ ] Tombol upload foto dapat diklik
- [ ] File picker muncul
- [ ] Dapat memilih file JPG
- [ ] Dapat memilih file PNG
- [ ] Dapat memilih file WEBP
- [ ] Validation: File PDF ditolak
- [ ] Validation: File > 5MB ditolak
- [ ] Progress bar ditampilkan saat upload
- [ ] Foto berhasil diupload
- [ ] Foto muncul di galeri
- [ ] Caption dapat ditambahkan
- [ ] Toast notification muncul setelah berhasil upload

### 2.7 Upload Foto Bulk
- [ ] Tombol upload multiple dapat diklik
- [ ] Dapat memilih multiple files sekaligus
- [ ] Progress ditampilkan untuk setiap file
- [ ] Semua foto berhasil diupload
- [ ] Foto muncul di galeri dengan urutan yang benar
- [ ] Error handling untuk file yang gagal upload

### 2.8 Edit Caption Foto
- [ ] Icon edit pada foto dapat diklik
- [ ] Modal/form edit caption muncul
- [ ] Caption dapat diubah
- [ ] Caption berhasil tersimpan
- [ ] Caption terupdate di galeri
- [ ] Toast notification muncul setelah berhasil update

### 2.9 Reorder Foto
- [ ] Mode reorder dapat diaktifkan
- [ ] Foto dapat di-drag & drop
- [ ] Urutan foto berubah sesuai drag & drop
- [ ] Urutan tersimpan otomatis
- [ ] Urutan tetap sama setelah refresh page

### 2.10 Delete Foto
- [ ] Icon delete pada foto dapat diklik
- [ ] Confirmation dialog muncul
- [ ] Foto berhasil dihapus setelah konfirmasi
- [ ] Foto hilang dari galeri
- [ ] Foto terhapus dari storage
- [ ] Toast notification muncul setelah berhasil delete

---

## 3. Indikator & Capaian Module

### 3.1 Kategori Indikator
- [ ] Halaman indikator & capaian dapat diakses
- [ ] Daftar kategori ditampilkan
- [ ] Tombol tambah kategori dapat diklik
- [ ] Form create kategori muncul
- [ ] Validation: Nama kategori wajib diisi
- [ ] Kategori berhasil dibuat
- [ ] Kategori muncul di list
- [ ] Kategori dapat diedit
- [ ] Kategori dapat dihapus (dengan konfirmasi)

### 3.2 Indikator
- [ ] Daftar indikator ditampilkan per kategori
- [ ] Kategori dapat di-expand/collapse
- [ ] Tombol tambah indikator dapat diklik
- [ ] Form create indikator muncul
- [ ] Dropdown kategori menampilkan semua kategori
- [ ] Validation: Nama indikator wajib diisi
- [ ] Validation: Kategori wajib dipilih
- [ ] Indikator berhasil dibuat
- [ ] Indikator muncul di kategori yang sesuai
- [ ] Indikator dapat diedit inline
- [ ] Indikator dapat dihapus (dengan konfirmasi)

### 3.3 Reorder Indikator
- [ ] Mode reorder dapat diaktifkan
- [ ] Indikator dapat di-drag & drop dalam kategori
- [ ] Urutan indikator berubah sesuai drag & drop
- [ ] Urutan tersimpan otomatis
- [ ] Urutan tetap sama setelah refresh page

### 3.4 Input Capaian Siswa
- [ ] Tab input capaian dapat diakses
- [ ] Dropdown siswa menampilkan semua siswa
- [ ] Dropdown tahun ajaran berfungsi
- [ ] Dropdown semester berfungsi
- [ ] Setelah pilih siswa & periode, indikator ditampilkan
- [ ] Indikator dikelompokkan per kategori
- [ ] Field nilai dapat diisi
- [ ] Field deskripsi dapat diisi
- [ ] Tombol simpan per indikator berfungsi
- [ ] Tombol simpan semua berfungsi
- [ ] Capaian berhasil tersimpan
- [ ] Toast notification muncul setelah berhasil simpan
- [ ] Data capaian tersimpan di database

### 3.5 Edit Capaian Siswa
- [ ] Capaian yang sudah ada dapat diedit
- [ ] Form terisi dengan data capaian yang ada
- [ ] Nilai dapat diubah
- [ ] Deskripsi dapat diubah
- [ ] Capaian berhasil diupdate
- [ ] Data capaian terupdate di database

### 3.6 History Capaian
- [ ] Tab history capaian dapat diakses
- [ ] Dropdown siswa berfungsi
- [ ] Setelah pilih siswa, history ditampilkan
- [ ] History dikelompokkan per semester
- [ ] Data capaian ditampilkan dengan benar
- [ ] Comparison view berfungsi (jika ada)

---

## 4. Template Rapor Module

### 4.1 List Template
- [ ] Halaman list template dapat diakses
- [ ] Daftar template ditampilkan
- [ ] Filter by jenis rapor berfungsi
- [ ] Tombol buat template dapat diklik
- [ ] Tombol edit template dapat diklik
- [ ] Tombol delete template dapat diklik
- [ ] Tombol preview template dapat diklik

### 4.2 Create Template
- [ ] Form create template dapat diakses
- [ ] Validation: Nama template wajib diisi
- [ ] Validation: Jenis rapor wajib dipilih
- [ ] Dropdown ukuran kertas menampilkan A4, Letter, F4
- [ ] Dropdown orientasi menampilkan Portrait, Landscape
- [ ] Template berhasil dibuat
- [ ] Redirect ke template builder setelah create
- [ ] Data template tersimpan di database

### 4.3 Template Builder - Add Page
- [ ] Halaman template builder dapat diakses
- [ ] Tombol tambah halaman dapat diklik
- [ ] Modal pilih tipe halaman muncul
- [ ] 4 tipe halaman ditampilkan: Static Cover, Dynamic Data, Galeri Kegiatan, QR Code

### 4.4 Add Static Cover Page
- [ ] Tipe Static Cover dapat dipilih
- [ ] Form config static cover muncul
- [ ] Upload cover image berfungsi
- [ ] Preview cover image ditampilkan
- [ ] Checkbox overlay data berfungsi
- [ ] Field posisi X, Y dapat diisi
- [ ] Halaman berhasil ditambahkan
- [ ] Halaman muncul di list pages
- [ ] Config tersimpan di database

### 4.5 Add Dynamic Data Page
- [ ] Tipe Dynamic Data dapat dipilih
- [ ] Form config dynamic data muncul
- [ ] Multi-select kategori indikator berfungsi
- [ ] Checkbox show deskripsi berfungsi
- [ ] Dropdown layout menampilkan List, Table
- [ ] Halaman berhasil ditambahkan
- [ ] Halaman muncul di list pages
- [ ] Config tersimpan di database

### 4.6 Add Galeri Kegiatan Page
- [ ] Tipe Galeri Kegiatan dapat dipilih
- [ ] Form config galeri muncul
- [ ] Multi-select kegiatan berfungsi
- [ ] Checkbox auto select by scope berfungsi
- [ ] Dropdown layout menampilkan Grid-2, Grid-4, Grid-6, Collage
- [ ] Checkbox auto paginate berfungsi
- [ ] Field max foto per page dapat diisi
- [ ] Halaman berhasil ditambahkan
- [ ] Halaman muncul di list pages
- [ ] Config tersimpan di database

### 4.7 Add QR Code Page
- [ ] Tipe QR Code dapat dipilih
- [ ] Form config QR code muncul
- [ ] Field base URL dapat diisi
- [ ] Field QR size dapat diisi
- [ ] Dropdown posisi menampilkan Center, Bottom Right, Bottom Center
- [ ] Checkbox show text berfungsi
- [ ] Field text dapat diisi
- [ ] Halaman berhasil ditambahkan
- [ ] Halaman muncul di list pages
- [ ] Config tersimpan di database

### 4.8 Edit Page
- [ ] Icon edit pada page dapat diklik
- [ ] Form edit page muncul dengan data yang ada
- [ ] Config dapat diubah
- [ ] Page berhasil diupdate
- [ ] Config terupdate di database

### 4.9 Delete Page
- [ ] Icon delete pada page dapat diklik
- [ ] Confirmation dialog muncul
- [ ] Page berhasil dihapus setelah konfirmasi
- [ ] Page hilang dari list
- [ ] Urutan page lain menyesuaikan

### 4.10 Reorder Pages
- [ ] Mode reorder dapat diaktifkan
- [ ] Page dapat di-drag & drop
- [ ] Urutan page berubah sesuai drag & drop
- [ ] Urutan tersimpan otomatis
- [ ] Urutan tetap sama setelah refresh page

### 4.11 Preview Template
- [ ] Tombol preview dapat diklik
- [ ] Halaman preview muncul
- [ ] Dropdown pilih siswa berfungsi
- [ ] Setelah pilih siswa, preview ditampilkan dengan data real
- [ ] Tombol previous page berfungsi
- [ ] Tombol next page berfungsi
- [ ] Semua page ditampilkan dengan benar
- [ ] Cover page menampilkan cover image dan overlay
- [ ] Dynamic data page menampilkan capaian siswa
- [ ] Galeri page menampilkan foto kegiatan
- [ ] QR code page menampilkan QR code

---

## 5. Generate Rapor Module

### 5.1 Generate Single Rapor
- [ ] Halaman generate rapor dapat diakses
- [ ] Dropdown template menampilkan semua template
- [ ] Radio button mode Single dapat dipilih
- [ ] Dropdown siswa menampilkan semua siswa
- [ ] Dropdown tahun ajaran berfungsi
- [ ] Dropdown semester berfungsi
- [ ] Tombol preview berfungsi (opsional)
- [ ] Tombol generate rapor dapat diklik
- [ ] Loading indicator ditampilkan saat generate
- [ ] Progress bar ditampilkan
- [ ] Generate selesai dalam waktu wajar (< 15 detik)
- [ ] Toast notification muncul setelah selesai
- [ ] Tombol download PDF muncul
- [ ] PDF dapat didownload
- [ ] PDF tersimpan di storage
- [ ] History generate tersimpan di database

### 5.2 Generate Bulk Rapor
- [ ] Radio button mode Bulk dapat dipilih
- [ ] Multi-select siswa berfungsi
- [ ] Filter by kelas berfungsi
- [ ] Filter by asrama berfungsi
- [ ] Tombol generate bulk dapat diklik
- [ ] Confirmation dialog muncul
- [ ] Generate dimulai setelah konfirmasi
- [ ] Progress bar ditampilkan
- [ ] Status per siswa ditampilkan (Processing, Completed, Failed)
- [ ] Generate berjalan dalam batch (10 siswa per batch)
- [ ] Semua siswa berhasil digenerate (atau catat yang gagal)
- [ ] Tombol download all (ZIP) muncul setelah selesai
- [ ] Tombol download per siswa berfungsi
- [ ] Semua PDF dapat didownload
- [ ] Error message ditampilkan untuk siswa yang gagal

### 5.3 PDF Content Validation
- [ ] PDF dapat dibuka dengan PDF reader
- [ ] Jumlah halaman sesuai dengan template
- [ ] Cover page ditampilkan dengan benar
- [ ] Cover image tidak blur atau pecah
- [ ] Overlay data siswa (nama, tahun ajaran, semester) ditampilkan
- [ ] Posisi overlay sesuai konfigurasi
- [ ] Dynamic data page ditampilkan dengan benar
- [ ] Kategori indikator ditampilkan
- [ ] Indikator dikelompokkan per kategori
- [ ] Nilai capaian ditampilkan
- [ ] Deskripsi capaian ditampilkan
- [ ] Layout sesuai konfigurasi (list atau table)
- [ ] Galeri kegiatan page ditampilkan dengan benar
- [ ] Foto kegiatan ditampilkan
- [ ] Layout foto sesuai konfigurasi (grid-2, grid-4, dll)
- [ ] Caption foto ditampilkan
- [ ] Foto tidak blur atau pecah
- [ ] Auto pagination berfungsi jika foto banyak
- [ ] QR code page ditampilkan dengan benar
- [ ] QR code ditampilkan
- [ ] QR code tidak blur
- [ ] Text ditampilkan (jika diaktifkan)
- [ ] Posisi QR code sesuai konfigurasi

### 5.4 PDF with Missing Data
- [ ] Generate rapor untuk siswa tanpa capaian
- [ ] Placeholder ditampilkan untuk capaian yang kosong
- [ ] Generate rapor untuk siswa tanpa foto kegiatan
- [ ] Galeri page kosong atau skip jika tidak ada foto
- [ ] Generate tidak error meskipun data tidak lengkap

### 5.5 PDF with Different Configurations
- [ ] Generate dengan ukuran kertas A4
- [ ] Generate dengan ukuran kertas Letter
- [ ] Generate dengan ukuran kertas F4
- [ ] Generate dengan orientasi Portrait
- [ ] Generate dengan orientasi Landscape
- [ ] Semua konfigurasi menghasilkan PDF yang benar

---

## 6. Galeri Publik (QR Code Access)

### 6.1 Token Generation
- [ ] Token otomatis digenerate saat rapor dibuat
- [ ] Token tersimpan di database
- [ ] Token unik per siswa dan periode

### 6.2 Access Gallery with Valid Token
- [ ] QR code dapat discan dengan smartphone
- [ ] Browser otomatis membuka URL galeri
- [ ] Halaman galeri dapat diakses
- [ ] Informasi siswa ditampilkan (nama, kelas, asrama)
- [ ] Daftar kegiatan ditampilkan
- [ ] Kegiatan difilter berdasarkan scope siswa
- [ ] Foto kegiatan ditampilkan
- [ ] Caption foto ditampilkan
- [ ] Foto dapat diklik untuk melihat ukuran penuh
- [ ] Lightbox berfungsi
- [ ] Navigasi antar foto berfungsi (swipe atau arrow)
- [ ] Galeri responsive di mobile
- [ ] Galeri responsive di tablet
- [ ] Galeri responsive di desktop

### 6.3 Access Gallery with Invalid Token
- [ ] Akses dengan token yang tidak ada
- [ ] Error message ditampilkan: "Token tidak valid"
- [ ] Halaman 404 atau error page ditampilkan

### 6.4 Access Gallery with Expired Token
- [ ] Akses dengan token yang sudah expired
- [ ] Error message ditampilkan: "Token sudah kadaluarsa"
- [ ] Halaman error ditampilkan

### 6.5 Scope Filtering
- [ ] Siswa kelas 10 hanya melihat kegiatan: seluruh_sekolah, kelas_10, asrama_putra/putri
- [ ] Siswa kelas 11 hanya melihat kegiatan: seluruh_sekolah, kelas_11, asrama_putra/putri
- [ ] Siswa kelas 12 hanya melihat kegiatan: seluruh_sekolah, kelas_12, asrama_putra/putri
- [ ] Siswa asrama putra tidak melihat kegiatan: asrama_putri
- [ ] Siswa asrama putri tidak melihat kegiatan: asrama_putra

---

## 7. Error Handling

### 7.1 Network Errors
- [ ] Error message ditampilkan saat koneksi terputus
- [ ] Retry mechanism berfungsi
- [ ] Loading state ditampilkan dengan benar

### 7.2 Validation Errors
- [ ] Error message ditampilkan untuk field yang kosong
- [ ] Error message ditampilkan untuk format yang salah
- [ ] Error message jelas dan informatif
- [ ] Form tidak bisa disubmit jika ada error

### 7.3 File Upload Errors
- [ ] Error message ditampilkan untuk file > 5MB
- [ ] Error message ditampilkan untuk format file yang salah
- [ ] Error message ditampilkan untuk file yang corrupt
- [ ] Retry upload berfungsi

### 7.4 PDF Generation Errors
- [ ] Error message ditampilkan jika template tidak ditemukan
- [ ] Error message ditampilkan jika siswa tidak ditemukan
- [ ] Error message ditampilkan jika template kosong
- [ ] Error log tersimpan di history table
- [ ] User dapat retry generate untuk siswa yang gagal

---

## 8. Performance Testing

### 8.1 Page Load Time
- [ ] List kegiatan load dalam < 2 detik
- [ ] Detail kegiatan load dalam < 2 detik
- [ ] Template builder load dalam < 2 detik
- [ ] Generate interface load dalam < 2 detik

### 8.2 Upload Performance
- [ ] Upload 1 foto (2MB) selesai dalam < 5 detik
- [ ] Upload 10 foto selesai dalam < 30 detik
- [ ] Upload tidak freeze browser

### 8.3 Generate Performance
- [ ] Generate 1 rapor selesai dalam < 15 detik
- [ ] Generate 10 rapor selesai dalam < 2 menit
- [ ] Generate 50 rapor selesai dalam < 10 menit
- [ ] Generate tidak freeze browser
- [ ] Progress update real-time

### 8.4 Gallery Performance
- [ ] Galeri publik load dalam < 3 detik
- [ ] Foto load dengan lazy loading
- [ ] Lightbox buka dalam < 1 detik

---

## 9. UI/UX Testing

### 9.1 Layout & Design
- [ ] Layout konsisten di semua halaman
- [ ] Warna dan typography sesuai design system
- [ ] Icon ditampilkan dengan benar
- [ ] Button style konsisten
- [ ] Form layout rapi dan mudah dibaca

### 9.2 Responsive Design
- [ ] Semua halaman responsive di mobile (320px - 480px)
- [ ] Semua halaman responsive di tablet (768px - 1024px)
- [ ] Semua halaman responsive di desktop (1280px+)
- [ ] Navigation menu berfungsi di mobile
- [ ] Touch interaction berfungsi di mobile

### 9.3 User Feedback
- [ ] Loading indicator ditampilkan saat fetch data
- [ ] Toast notification muncul setelah action berhasil
- [ ] Error message jelas dan informatif
- [ ] Confirmation dialog muncul untuk action destructive
- [ ] Progress bar ditampilkan untuk long-running process

### 9.4 Accessibility
- [ ] Semua button dapat diakses dengan keyboard
- [ ] Tab order logis
- [ ] Focus indicator jelas
- [ ] Alt text untuk gambar
- [ ] Label untuk form input

---

## 10. Integration Testing

### 10.1 Complete Workflow Test

**Scenario: Create Template → Generate Rapor → Access via QR**

- [ ] Step 1: Create kegiatan baru
- [ ] Step 2: Upload 5 foto ke kegiatan
- [ ] Step 3: Create kategori indikator (UBUDIYAH, AKHLAK, KEDISIPLINAN)
- [ ] Step 4: Create 3 indikator per kategori
- [ ] Step 5: Input capaian untuk 1 siswa
- [ ] Step 6: Create template baru
- [ ] Step 7: Add cover page ke template
- [ ] Step 8: Add dynamic data page ke template
- [ ] Step 9: Add galeri kegiatan page ke template
- [ ] Step 10: Add QR code page ke template
- [ ] Step 11: Preview template
- [ ] Step 12: Generate rapor untuk siswa tersebut
- [ ] Step 13: Download PDF
- [ ] Step 14: Buka PDF dan verifikasi semua halaman
- [ ] Step 15: Scan QR code di PDF
- [ ] Step 16: Akses galeri publik
- [ ] Step 17: Verifikasi foto kegiatan ditampilkan

**Expected Result:**
- ✅ Semua step berhasil tanpa error
- ✅ PDF berisi semua halaman yang dikonfigurasi
- ✅ QR code dapat discan dan link berfungsi
- ✅ Galeri menampilkan kegiatan yang sesuai

---

## 11. Security Testing

### 11.1 Authentication
- [ ] Non-authenticated user tidak bisa akses API
- [ ] Session expired setelah timeout
- [ ] Logout menghapus session dengan benar

### 11.2 Authorization
- [ ] Non-admin tidak bisa create/edit/delete
- [ ] User hanya bisa akses data dari cabang mereka
- [ ] Public gallery hanya accessible via valid token

### 11.3 Input Validation
- [ ] SQL injection dicegah
- [ ] XSS dicegah
- [ ] File upload validation berfungsi
- [ ] Malicious file ditolak

---

## 12. Cross-Browser Testing

### 12.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest) - if available

### 12.2 Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile (Android)

---

## 13. Data Scenarios Testing

### 13.1 Empty State
- [ ] List kegiatan kosong menampilkan empty state
- [ ] List template kosong menampilkan empty state
- [ ] Galeri foto kosong menampilkan empty state
- [ ] Capaian kosong menampilkan placeholder

### 13.2 Large Dataset
- [ ] List dengan 100+ kegiatan
- [ ] Kegiatan dengan 50+ foto
- [ ] Template dengan 10+ pages
- [ ] Bulk generate untuk 100+ siswa

### 13.3 Edge Cases
- [ ] Nama kegiatan sangat panjang (100+ karakter)
- [ ] Deskripsi sangat panjang (1000+ karakter)
- [ ] Foto dengan resolusi sangat tinggi (4K+)
- [ ] Siswa tanpa data capaian sama sekali
- [ ] Template tanpa halaman

---

## Summary

**Total Items:** _____ / _____
**Passed:** _____
**Failed:** _____
**Blocked:** _____

**Critical Issues Found:**
1. ___________________
2. ___________________
3. ___________________

**Notes:**
___________________
___________________
___________________

**Sign-off:**
- [ ] All critical issues resolved
- [ ] System ready for production
- [ ] Documentation complete

**Tester Signature:** ___________________
**Date:** ___________________

