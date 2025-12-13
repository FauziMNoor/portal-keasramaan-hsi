# 📋 Dokumentasi Sistem Manajemen Rapor

## Overview

Sistem Manajemen Rapor adalah fitur untuk generate rapor santri secara otomatis berdasarkan data habit tracker yang sudah diinput. Rapor akan di-generate dalam format PDF menggunakan template Google Slides.

---

## 🗂️ Struktur Database

### 1. **rapor_kegiatan_keasramaan**
Menyimpan data 6 kegiatan utama untuk rapor per kelas/asrama.

**Kolom:**
- `id`: UUID primary key
- `cabang`: Cabang sekolah
- `tahun_ajaran`: Tahun ajaran (misal: 2024/2025)
- `semester`: Semester (Ganjil/Genap)
- `kelas`: Kelas santri
- `asrama`: Asrama santri
- `nama_kegiatan`: Nama kegiatan
- `keterangan_kegiatan`: Deskripsi kegiatan
- `foto_1`: URL foto pertama
- `foto_2`: URL foto kedua
- `urutan`: Urutan kegiatan (1-6)

**Constraint:**
- Kombinasi `cabang + tahun_ajaran + semester + kelas + asrama + urutan` harus unique

---

### 2. **rapor_dokumentasi_lainnya_keasramaan**
Menyimpan foto dokumentasi program lainnya (unlimited).

**Kolom:**
- `id`: UUID primary key
- `cabang`: Cabang sekolah
- `tahun_ajaran`: Tahun ajaran
- `semester`: Semester
- `kelas`: Kelas santri
- `asrama`: Asrama santri
- `foto`: URL foto
- `keterangan`: Keterangan foto (opsional)
- `urutan`: Urutan tampilan (opsional)

---

### 3. **rapor_rekap_habit_keasramaan**
Cache hasil rekap habit tracker per santri per semester untuk performa.

**Kolom:**
- `id`: UUID primary key
- `nis`: NIS santri
- `nama_siswa`: Nama santri
- `cabang`, `tahun_ajaran`, `semester`, `kelas`, `asrama`: Filter data
- **Untuk setiap habit** (21 habit total):
  - `[nama_habit]_nilai`: Nilai rata-rata (NUMERIC 3,2)
  - `[nama_habit]_deskripsi`: Deskripsi dari indikator penilaian
- `total_entry`: Jumlah entry yang direkap
- `periode_mulai`, `periode_selesai`: Range tanggal rekap

**Constraint:**
- Kombinasi `nis + tahun_ajaran + semester` harus unique

---

### 4. **rapor_generate_log_keasramaan**
History log generate rapor untuk tracking.

**Kolom:**
- `id`: UUID primary key
- `batch_id`: UUID untuk batch generate (kelas/asrama)
- `nis`, `nama_siswa`: Data santri
- `mode_generate`: 'single', 'kelas', 'asrama'
- `status`: 'processing', 'success', 'failed'
- `presentation_id`: Google Slides ID
- `pdf_url`: URL PDF hasil
- `error_message`: Pesan error jika gagal
- `generated_at`: Timestamp generate
- `generated_by`: User yang generate

---

### 5. **rapor_catatan_keasramaan**
Catatan musyrif dan pengesahan rapor.

**Kolom:**
- `id`: UUID primary key
- `nis`: NIS santri
- `tahun_ajaran`, `semester`: Periode rapor
- `catatan_musyrif`: Catatan dari musyrif
- `nama_ketua_asrama`: Nama ketua asrama (pengesahan)
- `nama_musyrif`: Nama musyrif (pengesahan)
- `tanggal_pengesahan`: Tanggal pengesahan

**Constraint:**
- Kombinasi `nis + tahun_ajaran + semester` harus unique

---

## 🎯 Fitur Utama

### 1. **Setup Rapor** (`/rapor/setup`)
Halaman untuk setup kegiatan dan dokumentasi rapor.

**Filter:**
- Cabang
- Tahun Ajaran
- Semester
- Kelas
- Asrama

**Fitur:**
- Input 6 kegiatan utama (nama, keterangan, 2 foto per kegiatan)
- Upload dokumentasi program lainnya (multiple foto)
- Edit/hapus kegiatan
- Preview kegiatan dalam bentuk card

---

### 2. **Generate Rapor** (`/rapor/generate`)
Halaman untuk generate rapor santri.

**Filter:**
- Cabang
- Tahun Ajaran
- Semester
- Kelas
- Asrama
- Santri (opsional untuk mode single)

**Mode Generate:**
1. **Single**: Generate rapor 1 santri
2. **Per Kelas**: Generate rapor semua santri di kelas tertentu
3. **Per Asrama**: Generate rapor semua santri di asrama tertentu

**Output:**
- Single: Download PDF langsung
- Batch (Kelas/Asrama): Download ZIP berisi multiple PDF

---

### 3. **History Generate** (`/rapor/history`)
Halaman untuk melihat history generate rapor.

**Fitur:**
- List semua generate yang pernah dilakukan
- Filter berdasarkan tanggal, status, mode
- Re-download PDF yang sudah di-generate
- Lihat detail error jika gagal

---

## 🔄 Flow Generate Rapor

```
1. User pilih filter (cabang, tahun ajaran, semester, kelas, asrama)
   ↓
2. User pilih mode generate (single/kelas/asrama)
   ↓
3. System fetch data:
   - Data santri dari data_siswa_keasramaan
   - Rekap habit tracker dari rapor_rekap_habit_keasramaan
   - Data kegiatan dari rapor_kegiatan_keasramaan
   - Dokumentasi dari rapor_dokumentasi_lainnya_keasramaan
   - Catatan dari rapor_catatan_keasramaan
   ↓
4. System generate Google Slides:
   - Copy template
   - Replace placeholder dengan data
   - Insert foto kegiatan & dokumentasi
   ↓
5. System export to PDF
   ↓
6. System save log ke rapor_generate_log_keasramaan
   ↓
7. User download PDF (single) atau ZIP (batch)
```

---

## 📊 Mapping Habit Tracker ke Rapor

### Cara Hitung Nilai:

1. **Ambil semua entry habit tracker** untuk santri di semester tertentu
2. **Hitung rata-rata nilai** per habit
3. **Bulatkan ke nilai terdekat** (misal: 2.7 → 3)
4. **Mapping ke indikator** dari tabel `indikator_keasramaan`
5. **Ambil deskripsi** sesuai nilai

### Contoh:

**Santri: Hamam**
- **Semester**: Ganjil 2024/2025
- **Habit**: Shalat Fardhu Berjamaah
- **Entry**: 30 hari dengan nilai [3,3,2,3,3,3,2,3,3,3,...]
- **Rata-rata**: 2.8
- **Dibulatkan**: 3
- **Mapping ke indikator**: 
  - Kategori: Ubudiyah
  - Nama: Shalat Fardhu Berjamaah
  - Nilai: 3
  - Deskripsi: "Selalu melaksanakan shalat berjamaah dengan tertib"
- **Output ke rapor**: "Selalu melaksanakan shalat berjamaah dengan tertib"

---

## 🔧 Google Slides Integration

### Setup:

1. **Template Google Slides** dengan placeholder:
   ```
   <<Foto Santri>>
   <<Nama Santri>>
   <<Semester>>
   <<Tahun Ajaran>>
   <<Shalat Fardhu Berjamaah>>
   ... (21 habit lainnya)
   <<Catatan Musyrif>>
   <<Ketua Asrama>>
   <<Musyrif>>
   <<Nama Kegiatan 1>>
   <<Foto Kegiatan 1a>>
   <<Foto Kegiatan 1b>>
   ... (kegiatan 2-6)
   <<Dokumentasi Program Lainnya>>
   ```

2. **Environment Variables** (`.env.local`):
   ```env
   GOOGLE_SLIDES_TEMPLATE_ID=your_template_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=your_project_id
   ```

3. **Share Template** ke service account email dengan role Editor/Viewer

---

## 🚀 API Endpoints

### 1. **POST /api/rapor/generate**
Generate rapor santri.

**Request Body:**
```json
{
  "mode": "single|kelas|asrama",
  "cabang": "string",
  "tahun_ajaran": "string",
  "semester": "string",
  "kelas": "string",
  "asrama": "string",
  "nis": "string" // untuk mode single
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": "uuid",
    "total": 1,
    "pdf_url": "url" // untuk single
    "zip_url": "url" // untuk batch
  }
}
```

---

### 2. **POST /api/rapor/rekap-habit**
Generate rekap habit tracker untuk cache.

**Request Body:**
```json
{
  "nis": "string",
  "tahun_ajaran": "string",
  "semester": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nis": "string",
    "nama_siswa": "string",
    "shalat_fardhu_berjamaah_nilai": 3,
    "shalat_fardhu_berjamaah_deskripsi": "Selalu...",
    // ... 20 habit lainnya
  }
}
```

---

### 3. **GET /api/rapor/history**
Get history generate rapor.

**Query Params:**
- `batch_id`: UUID (opsional)
- `nis`: string (opsional)
- `status`: string (opsional)
- `limit`: number (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "batch_id": "uuid",
      "nis": "string",
      "nama_siswa": "string",
      "mode_generate": "single",
      "status": "success",
      "pdf_url": "url",
      "generated_at": "timestamp"
    }
  ]
}
```

---

## 📝 TODO Implementation

- [ ] Migration database (SQL sudah ready)
- [ ] Setup Google Slides API (credentials sudah ready)
- [ ] Halaman Setup Rapor
- [ ] Halaman Generate Rapor
- [ ] API endpoint generate
- [ ] API endpoint rekap habit
- [ ] Logic mapping habit ke indikator
- [ ] Export to PDF
- [ ] Batch generate (kelas/asrama)
- [ ] Halaman History
- [ ] Upload & manage foto kegiatan
- [ ] Form catatan musyrif

---

## 🎨 UI/UX Design

### Setup Rapor:
- Filter di atas (dropdown cabang, tahun ajaran, semester, kelas, asrama)
- 6 Card untuk 6 kegiatan (grid 2 kolom di desktop, 1 kolom di mobile)
- Section dokumentasi lainnya dengan drag & drop upload
- Preview foto dalam modal

### Generate Rapor:
- Filter di atas
- Radio button untuk pilih mode (single/kelas/asrama)
- Dropdown santri (jika mode single)
- Preview data sebelum generate
- Progress bar saat generate (untuk batch)
- Download button setelah selesai

### History:
- Table dengan kolom: Tanggal, Santri, Mode, Status, Action
- Filter tanggal & status
- Button download PDF
- Badge untuk status (success/failed/processing)

---

## 🔐 Security & Permission

- Role **Admin**: Full access (setup, generate, history)
- Role **Musyrif**: Generate rapor untuk asrama sendiri, view history
- Role **Kepala Asrama**: Generate rapor untuk semua asrama, view history
- Role **Wali Santri**: View & download rapor anak sendiri (future feature)

---

## 📞 Support

Jika ada pertanyaan atau issue, hubungi tim development.
