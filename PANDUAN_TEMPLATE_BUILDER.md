# Panduan Template Builder Rapor

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Membuat Template Baru](#membuat-template-baru)
3. [Menambah dan Mengatur Elemen](#menambah-dan-mengatur-elemen)
4. [Menggunakan Data Binding](#menggunakan-data-binding)
5. [Preview dan Menyimpan](#preview-dan-menyimpan)
6. [Tips dan Trik](#tips-dan-trik)

---

## Pengenalan

Template Builder adalah fitur yang memungkinkan Anda membuat desain rapor custom dengan cara drag-and-drop, mirip seperti Google Slides. Anda dapat menempatkan elemen-elemen (teks, tabel, gambar, dll) di mana saja pada halaman dan menghubungkannya dengan data siswa secara otomatis.

### Keuntungan Template Builder:
- **Fleksibel**: Desain rapor sesuai keinginan tanpa batasan layout
- **Visual**: Lihat hasil desain secara real-time
- **Otomatis**: Data siswa, habit tracker, dan galeri kegiatan terisi otomatis
- **Reusable**: Buat sekali, gunakan untuk semua siswa

---

## Membuat Template Baru

### Langkah 1: Akses Halaman Template
1. Login ke Portal Keasramaan
2. Buka menu **Manajemen Rapor** → **Template Rapor**
3. Klik tombol **"Buat Template Baru"**

### Langkah 2: Pilih Tipe Template
1. Pada modal yang muncul, pilih **"Template Builder"** (bukan Legacy)
2. Isi informasi template:
   - **Nama Template**: Contoh "Rapor Semester Ganjil 2024"
   - **Jenis Rapor**: Pilih Semester, Bulanan, atau Tahunan
3. Klik **"Buat Template"**

### Langkah 3: Pengaturan Canvas
Setelah template dibuat, Anda akan masuk ke halaman Template Builder dengan pengaturan default:
- **Ukuran Halaman**: A4 Portrait (210mm x 297mm)
- **Margin**: 20mm di semua sisi
- **Background**: Putih

Anda dapat mengubah pengaturan ini di panel Properties (kanan) saat tidak ada elemen yang dipilih.

---

## Menambah dan Mengatur Elemen

### Jenis-Jenis Elemen

Template Builder menyediakan 7 jenis elemen:

#### 1. **Header**
Untuk judul rapor, logo sekolah, dan informasi header.
- Logo (upload atau URL)
- Judul dan subtitle
- Background color
- Text styling

#### 2. **Text Block**
Untuk teks bebas, paragraf, atau label.
- Rich text formatting (bold, italic)
- Font family, size, color
- Text alignment
- Line height

#### 3. **Data Table**
Untuk menampilkan data dalam bentuk tabel.
- Konfigurasi kolom
- Data binding ke habit tracker
- Header dan row styling
- Alternate row colors

#### 4. **Image**
Untuk gambar statis (logo, background, dekorasi).
- Upload file atau URL
- Fit options (cover, contain, fill)
- Border dan border radius

#### 5. **Image Gallery**
Untuk menampilkan foto dari galeri kegiatan.
- Auto-fetch dari database
- Layout grid/row/column
- Jumlah foto maksimal
- Caption styling

#### 6. **Signature**
Untuk tanda tangan pembina/kepala sekolah.
- Label dan nama
- Garis tanda tangan
- Tanggal (opsional)

#### 7. **Line/Divider**
Untuk garis pemisah.
- Horizontal atau vertical
- Solid, dashed, atau dotted
- Warna dan ketebalan

### Cara Menambah Elemen

#### Metode 1: Drag and Drop
1. Lihat panel **Components** di sebelah kiri
2. Klik dan drag elemen yang diinginkan
3. Drop ke posisi yang diinginkan di canvas
4. Elemen akan muncul di posisi tersebut

#### Metode 2: Click to Add
1. Klik elemen di panel Components
2. Elemen akan ditambahkan di tengah canvas
3. Drag untuk memindahkan ke posisi yang diinginkan

### Mengatur Posisi dan Ukuran

#### Memindahkan Elemen
- **Drag**: Klik dan drag elemen untuk memindahkan
- **Arrow Keys**: Gunakan ↑↓←→ untuk geser 1px (hold Shift untuk 10px)
- **Properties Panel**: Input koordinat X dan Y secara manual

#### Mengubah Ukuran
- **Resize Handles**: Drag handle di sudut/sisi elemen
- **Maintain Aspect Ratio**: Hold Shift saat resize
- **Properties Panel**: Input width dan height secara manual

#### Snap to Grid
Aktifkan "Snap to Grid" di toolbar untuk memudahkan alignment:
- Grid 10px membantu elemen sejajar rapi
- Garis bantu muncul saat elemen sejajar dengan elemen lain

### Mengatur Layer (Z-Index)

Untuk mengatur elemen mana yang di depan/belakang:
1. Klik kanan pada elemen
2. Pilih:
   - **Bring to Front**: Pindah ke paling depan
   - **Send to Back**: Pindah ke paling belakang
   - **Bring Forward**: Maju satu layer
   - **Send Backward**: Mundur satu layer

### Menghapus Elemen

- **Delete Key**: Pilih elemen, tekan Delete atau Backspace
- **Context Menu**: Klik kanan → Delete
- **Properties Panel**: Klik tombol Delete di bagian bawah

---

## Menggunakan Data Binding

Data binding memungkinkan template Anda terisi otomatis dengan data siswa saat generate rapor.

### Konsep Placeholder

Placeholder menggunakan format `{{source.field}}`, contoh:
- `{{siswa.nama}}` → Nama siswa
- `{{siswa.kelas}}` → Kelas siswa
- `{{habit.ubudiyah.average}}` → Rata-rata nilai ubudiyah

### Sumber Data yang Tersedia

#### 1. Data Siswa (`siswa`)
```
{{siswa.nama}}           → Nama lengkap
{{siswa.nis}}            → NIS
{{siswa.kelas}}          → Kelas
{{siswa.asrama}}         → Nama asrama
{{siswa.cabang}}         → Cabang sekolah
{{siswa.foto_url}}       → URL foto siswa
```

#### 2. Habit Tracker (`habit`)
```
{{habit.overall_average}}              → Rata-rata keseluruhan
{{habit.overall_percentage}}           → Persentase keseluruhan

{{habit.ubudiyah.average}}             → Rata-rata ubudiyah
{{habit.ubudiyah.percentage}}          → Persentase ubudiyah

{{habit.akhlaq.average}}               → Rata-rata akhlaq
{{habit.kedisiplinan.average}}         → Rata-rata kedisiplinan
{{habit.kebersihan.average}}           → Rata-rata kebersihan
```

#### 3. Periode (`periode`)
```
{{periode.tahun_ajaran}}   → Contoh: "2024/2025"
{{periode.semester}}       → 1 atau 2
{{periode.bulan}}          → Nama bulan (jika rapor bulanan)
```

#### 4. Sekolah (`school`)
```
{{school.nama}}            → Nama sekolah
{{school.logo_url}}        → URL logo sekolah
{{school.alamat}}          → Alamat sekolah
{{school.telepon}}         → Nomor telepon
{{school.website}}         → Website sekolah
```

#### 5. Pembina (`pembina`)
```
{{pembina.nama}}           → Nama pembina
{{pembina.nip}}            → NIP pembina
```

### Cara Menggunakan Placeholder

#### Pada Text Element
1. Pilih atau tambahkan Text element
2. Di Properties Panel, ketik teks dengan placeholder:
   ```
   Nama: {{siswa.nama}}
   Kelas: {{siswa.kelas}}
   Asrama: {{siswa.asrama}}
   ```
3. Saat preview/generate, placeholder akan diganti dengan data real

#### Pada Header Element
1. Pilih Header element
2. Di field Title, masukkan:
   ```
   RAPOR HABIT TRACKER
   {{school.nama}}
   ```
3. Di field Subtitle:
   ```
   Tahun Ajaran {{periode.tahun_ajaran}} - Semester {{periode.semester}}
   ```

#### Pada Data Table Element
1. Pilih Data Table element
2. Di Properties Panel, pilih **Data Source**: `habit_tracker.ubudiyah`
3. Konfigurasi kolom:
   - Kolom 1: Header "Indikator", Field "indikator"
   - Kolom 2: Header "Nilai", Field "nilai"
   - Kolom 3: Header "Persentase", Field "persentase"
4. Tabel akan otomatis terisi dengan data habit tracker

#### Pada Image Gallery Element
1. Pilih Image Gallery element
2. Di Properties Panel:
   - **Data Source**: `galeri_kegiatan`
   - **Max Images**: 6
   - **Layout**: Grid (2 kolom)
3. Foto akan otomatis diambil dari galeri kegiatan siswa

### Panel Data Fields

Panel Data Fields di sidebar kiri menampilkan semua field yang tersedia:
- **Klik field** untuk copy placeholder ke clipboard
- **Drag field** ke Text element untuk insert otomatis
- **Hover field** untuk lihat deskripsi dan contoh nilai

---

## Preview dan Menyimpan

### Preview Template

#### Preview dengan Sample Data
1. Klik tombol **"Preview"** di toolbar atas
2. Modal akan muncul menampilkan PDF preview
3. Data yang ditampilkan adalah sample data (contoh)
4. Gunakan untuk cek layout dan styling

#### Preview dengan Data Real
1. Klik tombol **"Preview with Student"**
2. Pilih siswa dari dropdown
3. Pilih periode (tahun ajaran, semester)
4. Klik **"Generate Preview"**
5. PDF akan menampilkan data real siswa tersebut

### Zoom Controls

Untuk melihat detail atau overview:
- **Zoom In**: Ctrl/Cmd + Plus atau klik tombol +
- **Zoom Out**: Ctrl/Cmd + Minus atau klik tombol -
- **Fit to Screen**: Klik tombol "Fit" untuk auto-adjust
- **Preset Zoom**: 50%, 75%, 100%, 125%, 150%, 200%

### Menyimpan Template

#### Auto-Save
Template otomatis tersimpan setiap 30 detik jika ada perubahan.

#### Manual Save
- **Ctrl/Cmd + S**: Shortcut keyboard
- **Tombol Save**: Klik tombol "Save" di toolbar
- **Indikator**: Lihat status "Saved" atau "Saving..." di toolbar

### Version History

Template Builder menyimpan history perubahan:

#### Melihat History
1. Klik tombol **"Version History"** di toolbar
2. Lihat list versi dengan tanggal dan user
3. Klik versi untuk preview

#### Restore Versi Lama
1. Buka Version History
2. Pilih versi yang ingin di-restore
3. Klik **"Restore This Version"**
4. Konfirmasi restore
5. Template akan kembali ke versi tersebut (dan membuat versi baru)

### Duplicate Template

Untuk membuat variasi template:
1. Klik tombol **"Duplicate"** di toolbar
2. Template baru akan dibuat dengan nama "[Nama Template] (Copy)"
3. Edit template baru tanpa mengubah yang asli

### Export/Import Template

#### Export Template
1. Klik **"Export"** di toolbar
2. File JSON akan di-download
3. Simpan file sebagai backup atau untuk sharing

#### Import Template
1. Di halaman Template List, klik **"Import Template"**
2. Upload file JSON yang sudah di-export
3. Template baru akan dibuat dari file tersebut

---

## Tips dan Trik

### Layout Tips

#### 1. Gunakan Grid untuk Alignment
- Aktifkan "Snap to Grid" untuk elemen sejajar rapi
- Grid 10px cocok untuk kebanyakan layout

#### 2. Gunakan Guides
- Drag dari ruler untuk membuat guide lines
- Guides membantu alignment antar elemen

#### 3. Group Related Elements
- Letakkan elemen yang berhubungan berdekatan
- Gunakan background color untuk grouping visual

### Styling Tips

#### 1. Konsisten dengan Branding
- Gunakan warna sekolah untuk header dan accent
- Gunakan font yang sama untuk semua teks
- Simpan color palette di notes

#### 2. Hierarchy Visual
- Header: Font besar (24-32px), bold
- Subheader: Font sedang (16-20px), semi-bold
- Body text: Font normal (10-12px), regular

#### 3. White Space
- Jangan terlalu padat, beri ruang bernafas
- Margin minimal 20mm dari tepi kertas
- Spacing antar section minimal 10-15px

### Data Binding Tips

#### 1. Test dengan Data Real
- Selalu preview dengan data siswa real
- Cek apakah semua placeholder terisi
- Cek apakah format angka sudah benar

#### 2. Handle Missing Data
- Beberapa siswa mungkin tidak punya foto
- Beberapa periode mungkin tidak ada data habit tracker
- Gunakan fallback text atau hide element

#### 3. Format Numbers
- Untuk persentase: `{{habit.ubudiyah.percentage}}%`
- Untuk nilai: `{{habit.ubudiyah.average}}/100`

### Performance Tips

#### 1. Optimize Images
- Compress images sebelum upload
- Gunakan format WebP atau JPEG
- Ukuran file maksimal 500KB per image

#### 2. Limit Gallery Images
- Jangan terlalu banyak foto dalam satu rapor
- 6-12 foto sudah cukup
- Gunakan thumbnail size, bukan full resolution

#### 3. Simplify Complex Tables
- Jangan terlalu banyak kolom (max 6-8)
- Jangan terlalu banyak rows (max 20-30)
- Gunakan pagination jika data banyak

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save template |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + D | Duplicate element |
| Delete / Backspace | Delete element |
| Ctrl/Cmd + Plus | Zoom in |
| Ctrl/Cmd + Minus | Zoom out |
| Arrow Keys | Move element 1px |
| Shift + Arrow | Move element 10px |
| Ctrl/Cmd + A | Select all |
| Escape | Deselect |

### Troubleshooting

#### Preview tidak muncul
- Cek koneksi internet
- Refresh halaman
- Cek apakah ada error di console browser

#### Placeholder tidak terisi
- Cek spelling placeholder (case-sensitive)
- Cek apakah field tersedia di data schema
- Preview dengan siswa yang punya data lengkap

#### Element tidak bisa di-drag
- Cek apakah element di-lock
- Refresh halaman
- Clear browser cache

#### PDF generation lambat
- Reduce jumlah images
- Compress images
- Simplify table data
- Gunakan bulk generation untuk banyak siswa

---

## Contoh Template

### Template Sederhana

**Layout:**
```
┌─────────────────────────────────────┐
│  [Logo]  RAPOR HABIT TRACKER        │
│          Semester 1 - 2024/2025     │
├─────────────────────────────────────┤
│                                     │
│  Nama: {{siswa.nama}}               │
│  Kelas: {{siswa.kelas}}             │
│  Asrama: {{siswa.asrama}}           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Indikator  │ Nilai │ %      │   │
│  ├────────────┼───────┼────────┤   │
│  │ Ubudiyah   │ 85    │ 85%    │   │
│  │ Akhlaq     │ 90    │ 90%    │   │
│  │ Kedisiplin │ 88    │ 88%    │   │
│  │ Kebersihan │ 92    │ 92%    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Galeri Kegiatan - 6 foto]         │
│                                     │
│  Pembina: {{pembina.nama}}          │
│  _________________________          │
│                                     │
└─────────────────────────────────────┘
```

### Template Lengkap

Lihat contoh template lengkap di folder `examples/template-rapor-lengkap.json`

---

## Bantuan Lebih Lanjut

Jika mengalami kesulitan:
1. Baca FAQ di dokumentasi
2. Tonton video tutorial
3. Hubungi admin sistem
4. Buka issue di GitHub (untuk developer)

---

**Selamat membuat template rapor! 🎨**
