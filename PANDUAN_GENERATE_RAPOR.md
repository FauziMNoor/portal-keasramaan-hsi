# Panduan Generate Rapor

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Memilih Template dan Siswa](#memilih-template-dan-siswa)
3. [Generate Rapor Satuan](#generate-rapor-satuan)
4. [Generate Rapor Massal](#generate-rapor-massal)
5. [Monitoring Progress](#monitoring-progress)
6. [Download PDF](#download-pdf)
7. [Arsip Rapor](#arsip-rapor)
8. [Troubleshooting](#troubleshooting)

---

## Pengenalan

Fitur Generate Rapor memungkinkan Anda membuat PDF rapor secara otomatis menggunakan template yang sudah dibuat. Anda dapat generate rapor untuk satu siswa atau banyak siswa sekaligus (bulk generation).

### Kapan Menggunakan Generate Rapor?

- **Akhir semester**: Generate rapor untuk semua siswa
- **Akhir bulan**: Generate rapor bulanan
- **Request khusus**: Generate rapor untuk siswa tertentu
- **Re-generate**: Generate ulang jika ada perubahan data

### Prasyarat

Sebelum generate rapor, pastikan:
- ✅ Template rapor sudah dibuat dan ditest
- ✅ Data habit tracker sudah lengkap untuk periode yang dipilih
- ✅ Foto galeri kegiatan sudah di-upload (jika template menggunakan gallery)
- ✅ Data siswa (nama, kelas, asrama) sudah benar

---

## Memilih Template dan Siswa

### Langkah 1: Akses Halaman Generate Rapor

1. Login ke Portal Keasramaan
2. Buka menu **Manajemen Rapor** → **Generate Rapor**
3. Halaman Generate Rapor akan terbuka

### Langkah 2: Pilih Template

1. Di bagian **"Pilih Template"**, klik dropdown
2. Lihat list template yang tersedia
3. Template ditampilkan dengan informasi:
   - Nama template
   - Jenis rapor (Semester/Bulanan/Tahunan)
   - Tipe (Builder/Legacy)
   - Terakhir diupdate
4. Pilih template yang sesuai

**Tips:**
- Gunakan template "Builder" untuk hasil terbaik
- Pastikan template sudah ditest dengan preview
- Pilih template sesuai jenis rapor yang ingin dibuat

### Langkah 3: Pilih Periode

1. Di bagian **"Periode"**, isi:
   - **Tahun Ajaran**: Contoh "2024/2025"
   - **Semester**: Pilih 1 atau 2
   - **Bulan** (opsional): Untuk rapor bulanan

2. Klik **"Load Data"** untuk memuat data siswa

**Penting:**
- Periode harus sesuai dengan data habit tracker yang ada
- Jika data periode tidak ada, rapor akan kosong atau error

### Langkah 4: Pilih Siswa

Ada beberapa cara memilih siswa:

#### A. Pilih Satu Siswa (Single)
1. Pilih tab **"Single Student"**
2. Ketik nama siswa di search box
3. Pilih siswa dari dropdown
4. Klik **"Generate Rapor"**

#### B. Pilih Berdasarkan Filter (Bulk)
1. Pilih tab **"Bulk Generation"**
2. Pilih filter:
   - **Semua Siswa**: Generate untuk semua siswa
   - **Per Kelas**: Pilih kelas tertentu
   - **Per Asrama**: Pilih asrama tertentu
   - **Per Cabang**: Pilih cabang tertentu
3. Siswa yang sesuai filter akan ditampilkan
4. Klik **"Generate Rapor"**

#### C. Pilih Manual (Custom Selection)
1. Pilih tab **"Custom Selection"**
2. Centang checkbox siswa yang diinginkan
3. Gunakan "Select All" untuk pilih semua
4. Gunakan "Deselect All" untuk batal pilih semua
5. Klik **"Generate Rapor"**

**Tips:**
- Untuk generate akhir semester, gunakan filter "Semua Siswa"
- Untuk generate per kelas, gunakan filter "Per Kelas"
- Untuk generate siswa tertentu, gunakan "Custom Selection"

---

## Generate Rapor Satuan

Generate rapor untuk satu siswa saja.

### Langkah-Langkah

1. **Pilih Template**: Pilih template yang akan digunakan
2. **Pilih Periode**: Isi tahun ajaran dan semester
3. **Pilih Siswa**: Pilih satu siswa dari dropdown
4. **Klik Generate**: Klik tombol **"Generate Rapor"**
5. **Tunggu Proses**: Loading indicator akan muncul (biasanya 3-5 detik)
6. **Download**: Setelah selesai, tombol **"Download PDF"** akan muncul
7. **Selesai**: PDF akan terdownload otomatis

### Keuntungan Generate Satuan

- ✅ Cepat (3-5 detik)
- ✅ Langsung download
- ✅ Cocok untuk request khusus
- ✅ Mudah untuk testing

### Kapan Menggunakan Generate Satuan?

- Testing template baru
- Request rapor dari orang tua
- Re-generate rapor yang error
- Generate rapor siswa pindahan

---

## Generate Rapor Massal

Generate rapor untuk banyak siswa sekaligus (bulk generation).

### Langkah-Langkah

1. **Pilih Template**: Pilih template yang akan digunakan
2. **Pilih Periode**: Isi tahun ajaran dan semester
3. **Pilih Siswa**: Gunakan filter atau custom selection
4. **Review Jumlah**: Cek jumlah siswa yang akan di-generate
5. **Klik Generate**: Klik tombol **"Generate Rapor Massal"**
6. **Konfirmasi**: Konfirmasi jumlah siswa dan estimasi waktu
7. **Proses Dimulai**: Progress tracker akan muncul
8. **Tunggu Selesai**: Proses berjalan di background
9. **Download**: Download individual atau download all as ZIP

### Estimasi Waktu

| Jumlah Siswa | Estimasi Waktu |
|--------------|----------------|
| 1-10 siswa   | 30 detik - 1 menit |
| 11-50 siswa  | 2-5 menit |
| 51-100 siswa | 5-10 menit |
| 100+ siswa   | 10-20 menit |

**Catatan:**
- Waktu tergantung kompleksitas template
- Template dengan banyak foto lebih lama
- Server load juga mempengaruhi kecepatan

### Keuntungan Generate Massal

- ✅ Efisien untuk banyak siswa
- ✅ Proses di background (bisa ditinggal)
- ✅ Download all as ZIP
- ✅ Tracking per siswa

### Kapan Menggunakan Generate Massal?

- Generate rapor akhir semester
- Generate rapor per kelas
- Generate rapor per asrama
- Generate rapor untuk semua siswa

---

## Monitoring Progress

Saat generate rapor massal, Anda dapat memonitor progress secara real-time.

### Progress Tracker

Progress tracker menampilkan:

#### 1. Overall Progress
- **Progress Bar**: Persentase completion (0-100%)
- **Status Text**: "Processing 15 of 50 students..."
- **Estimated Time**: Estimasi waktu tersisa

#### 2. Student List
Tabel dengan kolom:
- **No**: Nomor urut
- **Nama Siswa**: Nama lengkap siswa
- **Kelas**: Kelas siswa
- **Status**: Status generation
- **Action**: Tombol download (jika selesai)

#### 3. Status Icons

| Icon | Status | Keterangan |
|------|--------|------------|
| ⏳ | Pending | Menunggu proses |
| ⚙️ | Processing | Sedang di-generate |
| ✅ | Completed | Berhasil di-generate |
| ❌ | Failed | Gagal di-generate |

### Real-Time Updates

Progress tracker update otomatis setiap 2 detik:
- Status siswa berubah real-time
- Progress bar bergerak otomatis
- Tidak perlu refresh halaman

### Notifikasi

Anda akan mendapat notifikasi saat:
- ✅ Generation dimulai
- ✅ Generation selesai
- ❌ Ada error/failure
- ⚠️ Warning (data tidak lengkap)

### Meninggalkan Halaman

Anda bisa meninggalkan halaman saat generation berjalan:
- Proses tetap berjalan di background
- Kembali ke halaman untuk cek progress
- Hasil tersimpan di Arsip Rapor

---

## Download PDF

Setelah rapor selesai di-generate, Anda dapat download PDF.

### Download Individual

Untuk download satu rapor:
1. Klik tombol **"Download"** di baris siswa
2. PDF akan terdownload dengan nama: `Rapor_[NamaSiswa]_[Periode].pdf`
3. Contoh: `Rapor_Ahmad_Fauzi_2024-2025_Sem1.pdf`

### Download All as ZIP

Untuk download semua rapor sekaligus:
1. Klik tombol **"Download All as ZIP"** di bagian atas
2. File ZIP akan di-generate (mungkin butuh waktu untuk banyak file)
3. ZIP akan terdownload dengan nama: `Rapor_Bulk_[Periode]_[Timestamp].zip`
4. Extract ZIP untuk akses semua PDF

**Tips:**
- Download ZIP lebih efisien untuk banyak siswa
- Struktur folder dalam ZIP: organized by kelas
- Nama file sudah terstruktur untuk mudah dicari

### Re-Download

Jika perlu download ulang:
1. Buka **Arsip Rapor** (lihat section berikutnya)
2. Cari rapor yang diinginkan
3. Klik tombol **"Download"**
4. PDF akan terdownload lagi

---

## Arsip Rapor

Semua rapor yang pernah di-generate tersimpan di Arsip Rapor.

### Akses Arsip Rapor

1. Buka menu **Manajemen Rapor** → **Arsip Rapor**
2. Halaman Arsip Rapor akan terbuka
3. Lihat tabel dengan semua rapor yang pernah di-generate

### Informasi di Arsip

Tabel arsip menampilkan:
- **Nama Siswa**: Nama lengkap siswa
- **Kelas**: Kelas siswa saat rapor di-generate
- **Periode**: Tahun ajaran dan semester
- **Template**: Nama template yang digunakan
- **Tanggal Generate**: Kapan rapor di-generate
- **Generated By**: Siapa yang generate
- **Action**: Tombol download dan delete

### Filter Arsip

Gunakan filter untuk mencari rapor:

#### 1. Filter by Student Name
- Ketik nama siswa di search box
- Hasil akan filter otomatis

#### 2. Filter by Periode
- Pilih tahun ajaran dari dropdown
- Pilih semester
- Klik **"Filter"**

#### 3. Filter by Date Range
- Pilih tanggal mulai
- Pilih tanggal akhir
- Klik **"Filter"**

#### 4. Filter by Template
- Pilih template dari dropdown
- Klik **"Filter"**

#### 5. Combine Filters
- Gunakan multiple filter sekaligus
- Contoh: Filter by periode + student name

### Download dari Arsip

1. Cari rapor yang diinginkan menggunakan filter
2. Klik tombol **"Download"** di baris rapor
3. PDF akan terdownload

**Keuntungan Arsip:**
- Tidak perlu re-generate
- Download lebih cepat
- History lengkap
- Bisa compare versi lama vs baru

### Delete dari Arsip

Jika ingin hapus rapor dari arsip:
1. Klik tombol **"Delete"** di baris rapor
2. Konfirmasi delete
3. Rapor akan dihapus dari arsip dan storage

**Peringatan:**
- Delete bersifat permanen
- Tidak bisa undo
- Harus re-generate jika ingin rapor lagi

### Retention Policy

Rapor di arsip akan disimpan:
- **Minimum**: 2 tahun
- **Maximum**: Unlimited (tergantung storage)
- **Auto-delete**: Rapor lebih dari 2 tahun akan dihapus otomatis

---

## Troubleshooting

### Problem: Generate Gagal

**Gejala:**
- Error message muncul
- Status "Failed" di progress tracker
- PDF tidak ter-generate

**Solusi:**
1. **Cek Data Siswa**
   - Pastikan data siswa lengkap (nama, kelas, asrama)
   - Cek di menu Data Siswa

2. **Cek Data Habit Tracker**
   - Pastikan ada data untuk periode yang dipilih
   - Cek di menu Habit Tracker Dashboard

3. **Cek Template**
   - Preview template dengan siswa tersebut
   - Cek apakah ada error di template

4. **Re-try Generation**
   - Klik tombol "Retry" di baris siswa
   - Atau generate ulang dari awal

### Problem: PDF Kosong atau Data Tidak Muncul

**Gejala:**
- PDF ter-generate tapi kosong
- Placeholder tidak terisi
- Tabel kosong

**Solusi:**
1. **Cek Periode**
   - Pastikan periode sesuai dengan data yang ada
   - Coba periode lain

2. **Cek Data Binding**
   - Buka template di Template Builder
   - Cek apakah placeholder sudah benar
   - Preview dengan siswa yang sama

3. **Cek Data di Database**
   - Pastikan data habit tracker ada
   - Pastikan data galeri kegiatan ada (jika template pakai gallery)

### Problem: Generate Sangat Lambat

**Gejala:**
- Progress sangat lambat
- Stuck di satu siswa
- Timeout error

**Solusi:**
1. **Reduce Batch Size**
   - Jangan generate terlalu banyak sekaligus
   - Generate per kelas (20-30 siswa) lebih baik

2. **Optimize Template**
   - Reduce jumlah foto di gallery
   - Compress images
   - Simplify table data

3. **Cek Server Load**
   - Generate di waktu yang tidak peak
   - Hindari generate saat banyak user online

4. **Cek Internet Connection**
   - Pastikan koneksi stabil
   - Jangan close browser saat generation

### Problem: Download Gagal

**Gejala:**
- Tombol download tidak berfungsi
- File corrupt
- Download interrupted

**Solusi:**
1. **Re-download**
   - Klik tombol download lagi
   - Atau download dari Arsip Rapor

2. **Cek Browser**
   - Clear browser cache
   - Try different browser
   - Disable ad-blocker

3. **Cek Storage**
   - Pastikan storage device tidak penuh
   - Pastikan ada permission untuk download

### Problem: Foto Tidak Muncul di PDF

**Gejala:**
- Placeholder foto kosong
- Foto dari gallery tidak muncul
- Logo tidak muncul

**Solusi:**
1. **Cek Upload Foto**
   - Pastikan foto sudah di-upload di Galeri Kegiatan
   - Pastikan foto untuk periode yang benar

2. **Cek URL Foto**
   - Pastikan URL foto valid
   - Pastikan foto accessible (tidak private)

3. **Cek Template**
   - Pastikan Image Gallery element configured dengan benar
   - Pastikan data binding sudah benar

4. **Re-upload Foto**
   - Upload ulang foto yang bermasalah
   - Generate ulang rapor

### Problem: Format Tidak Sesuai

**Gejala:**
- Layout berantakan
- Text terpotong
- Element overlap

**Solusi:**
1. **Cek Template di Builder**
   - Buka template di Template Builder
   - Preview dengan data real
   - Fix layout issues

2. **Cek Page Size**
   - Pastikan page size A4
   - Pastikan margin cukup (min 20mm)

3. **Cek Element Size**
   - Pastikan element tidak terlalu besar
   - Pastikan text tidak overflow

4. **Re-design Template**
   - Simplify layout
   - Reduce element count
   - Test dengan berbagai data

---

## Best Practices

### Sebelum Generate

✅ **Test Template**
- Preview dengan beberapa siswa berbeda
- Cek dengan data lengkap dan data minimal
- Cek dengan nama panjang dan nama pendek

✅ **Verify Data**
- Cek data habit tracker lengkap
- Cek foto galeri sudah di-upload
- Cek data siswa up-to-date

✅ **Choose Right Time**
- Generate di waktu tidak peak
- Pastikan koneksi internet stabil
- Alokasikan waktu cukup

### Saat Generate

✅ **Monitor Progress**
- Jangan close browser
- Cek progress secara berkala
- Note siswa yang failed

✅ **Handle Errors**
- Retry failed students
- Fix data issues
- Re-generate if needed

### Setelah Generate

✅ **Verify Results**
- Download dan cek beberapa PDF
- Pastikan data benar
- Pastikan format OK

✅ **Backup**
- Download all as ZIP
- Simpan di storage aman
- Keep copy di cloud

✅ **Distribute**
- Share ke orang tua via WhatsApp/Email
- Upload ke portal orang tua
- Print jika diperlukan

---

## FAQ

### Q: Berapa lama waktu generate rapor?
**A:** Tergantung jumlah siswa dan kompleksitas template:
- 1 siswa: 3-5 detik
- 10 siswa: 30 detik - 1 menit
- 50 siswa: 2-5 menit
- 100 siswa: 5-10 menit

### Q: Apakah bisa generate rapor untuk periode lalu?
**A:** Ya, bisa. Pilih periode yang diinginkan saat generate. Data akan diambil dari database sesuai periode tersebut.

### Q: Apakah rapor yang sudah di-generate bisa di-edit?
**A:** Tidak. PDF yang sudah di-generate tidak bisa di-edit. Jika ada perubahan data, harus re-generate rapor baru.

### Q: Bagaimana jika ada siswa yang datanya tidak lengkap?
**A:** Rapor tetap akan di-generate, tapi field yang tidak ada datanya akan kosong atau menampilkan placeholder.

### Q: Apakah bisa generate rapor untuk siswa yang sudah lulus?
**A:** Ya, selama data siswa masih ada di database. Pilih siswa dari custom selection.

### Q: Berapa lama rapor disimpan di arsip?
**A:** Minimum 2 tahun. Setelah itu akan dihapus otomatis untuk menghemat storage.

### Q: Apakah bisa download rapor yang sudah dihapus dari arsip?
**A:** Tidak. Harus re-generate rapor baru.

### Q: Apakah bisa generate rapor dengan template yang berbeda untuk siswa yang sama?
**A:** Ya, bisa. Generate dengan template A, lalu generate lagi dengan template B. Keduanya akan tersimpan di arsip.

---

## Bantuan Lebih Lanjut

Jika masih mengalami kesulitan:
1. Hubungi admin sistem
2. Buka ticket support
3. Lihat video tutorial
4. Baca dokumentasi lengkap

---

**Selamat menggunakan fitur Generate Rapor! 📄**
