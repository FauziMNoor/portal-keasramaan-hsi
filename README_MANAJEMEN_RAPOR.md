# Sistem Manajemen Rapor Keasramaan

## Overview

Sistem Manajemen Rapor Keasramaan adalah modul komprehensif untuk mengotomasi pembuatan rapor semesteran siswa asrama. Sistem ini memungkinkan admin untuk membuat template rapor yang fleksibel, mengelola galeri kegiatan, dan menghasilkan rapor PDF secara otomatis dengan data yang diambil dari database.

## Features

### 1. 📸 Galeri Kegiatan
- Manajemen foto dan dokumentasi kegiatan asrama
- Upload single atau bulk photos
- Drag & drop untuk reorder foto
- Caption dan metadata untuk setiap foto
- Filtering berdasarkan scope (kelas, asrama, seluruh sekolah)

### 2. 📊 Indikator & Capaian
- Manajemen kategori indikator (UBUDIYAH, AKHLAK, KEDISIPLINAN)
- CRUD indikator penilaian
- Input capaian siswa per semester
- History capaian siswa
- Batch input untuk efisiensi

### 3. 📄 Template Rapor
- Template builder dengan drag & drop
- 4 tipe halaman:
  - **Static Cover**: Cover dengan overlay data siswa
  - **Dynamic Data**: Data capaian indikator
  - **Galeri Kegiatan**: Foto-foto kegiatan
  - **QR Code**: QR code untuk akses galeri online
- Konfigurasi fleksibel per halaman
- Preview template dengan data real

### 4. 🖨️ Generate Rapor PDF
- Generate single rapor (1 siswa)
- Generate bulk rapor (multiple siswa)
- Batch processing untuk performa optimal
- Progress tracking real-time
- Error handling dan retry mechanism
- Auto-upload ke Supabase Storage

### 5. 📱 Galeri Publik
- Akses galeri online via QR code
- Filtering otomatis berdasarkan scope siswa
- Responsive design untuk mobile
- Token-based authentication
- Expiration control untuk keamanan

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **PDF Generation**: jsPDF + jspdf-autotable
- **QR Code**: qrcode library
- **Authentication**: JWT with jose

## Documentation

### For Users
- **[Panduan Pengguna](./PANDUAN_PENGGUNA_MANAJEMEN_RAPOR.md)** - Panduan lengkap untuk menggunakan sistem
  - Cara mengelola galeri kegiatan
  - Cara membuat template rapor
  - Cara generate rapor PDF
  - Cara akses galeri publik

### For Developers
- **[Testing Guide](./TESTING_GUIDE_MANAJEMEN_RAPOR.md)** - Panduan testing API dan sistem
  - API endpoint testing
  - PDF generation testing
  - Token validation testing
  - Integration testing
  - Error handling testing

### For QA
- **[Manual Testing Checklist](./MANUAL_TESTING_CHECKLIST_RAPOR.md)** - Checklist lengkap untuk manual testing
  - Authentication & authorization
  - Galeri kegiatan module
  - Indikator & capaian module
  - Template rapor module
  - Generate rapor module
  - Galeri publik
  - Performance testing
  - Security testing

### For Project Managers
- **[Requirements](../.kiro/specs/manajemen-rapor/requirements.md)** - Dokumen requirements lengkap
- **[Design](../.kiro/specs/manajemen-rapor/design.md)** - Dokumen design dan architecture
- **[Tasks](../.kiro/specs/manajemen-rapor/tasks.md)** - Implementation plan dan task list

## Database Setup

Jalankan SQL script untuk setup database:

```bash
# Setup semua tabel dan RLS policies
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f supabase/SETUP_MANAJEMEN_RAPOR.sql
```

Script ini akan membuat:
- 9 tabel untuk sistem rapor
- Indexes untuk performa optimal
- RLS policies untuk keamanan
- Sample data untuk kategori indikator

## Storage Setup

**PENTING:** Sistem membutuhkan 3 storage buckets di Supabase untuk upload foto dan PDF.

### Quick Setup via Supabase Dashboard:

1. Buka Supabase Dashboard → Storage
2. Buat 3 buckets berikut (semua **Public**):
   - `kegiatan-galeri` (5MB limit, image types)
   - `rapor-covers` (10MB limit, image types)
   - `rapor-pdf` (50MB limit, PDF only)

### Atau via SQL:

```bash
# Setup storage buckets dan policies
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f supabase/SETUP_STORAGE_RAPOR.sql
```

📖 **Panduan lengkap**: Lihat [SETUP_STORAGE_RAPOR_GUIDE.md](./SETUP_STORAGE_RAPOR_GUIDE.md)

## Quick Start

### 1. Setup Database
```bash
# Jalankan SQL setup script
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f supabase/SETUP_MANAJEMEN_RAPOR.sql
```

### 2. Configure Environment
```bash
# Copy .env.local.example ke .env.local
cp .env.local.example .env.local

# Edit .env.local dan isi:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access the System
- Open http://localhost:3000
- Login dengan akun admin
- Klik menu "Manajemen Rapor"

## Workflow

### Complete Workflow: Create Template → Generate Rapor → Access via QR

1. **Persiapan Data**
   - Buat kategori indikator (UBUDIYAH, AKHLAK, KEDISIPLINAN)
   - Buat indikator untuk setiap kategori
   - Buat kegiatan dengan scope yang sesuai
   - Upload foto ke kegiatan
   - Input capaian siswa

2. **Buat Template**
   - Buat template baru
   - Tambah halaman cover
   - Tambah halaman dynamic data
   - Tambah halaman galeri kegiatan
   - Tambah halaman QR code
   - Preview template

3. **Generate Rapor**
   - Pilih template
   - Pilih siswa (single atau bulk)
   - Pilih periode (tahun ajaran & semester)
   - Generate rapor
   - Download PDF

4. **Distribusi**
   - Print rapor atau kirim PDF ke orang tua
   - Orang tua scan QR code di rapor
   - Akses galeri online

## API Endpoints

### Kegiatan
- `GET /api/rapor/kegiatan` - List kegiatan
- `POST /api/rapor/kegiatan` - Create kegiatan
- `PUT /api/rapor/kegiatan/[id]` - Update kegiatan
- `DELETE /api/rapor/kegiatan/[id]` - Delete kegiatan

### Foto Kegiatan
- `POST /api/rapor/kegiatan/[id]/foto` - Upload foto
- `PUT /api/rapor/kegiatan/foto/[fotoId]` - Update foto
- `DELETE /api/rapor/kegiatan/foto/[fotoId]` - Delete foto

### Template
- `GET /api/rapor/template` - List template
- `POST /api/rapor/template` - Create template
- `POST /api/rapor/template/[id]/pages` - Add page to template

### Indikator
- `GET /api/rapor/indikator/kategori` - List kategori
- `POST /api/rapor/indikator/kategori` - Create kategori
- `GET /api/rapor/indikator` - List indikator
- `POST /api/rapor/indikator` - Create indikator

### Capaian
- `POST /api/rapor/indikator/capaian` - Save capaian
- `GET /api/rapor/indikator/capaian` - Get capaian history

### Generate
- `POST /api/rapor/generate/single` - Generate single PDF
- `POST /api/rapor/generate/bulk` - Generate bulk PDF

### Galeri Publik
- `GET /api/rapor/galeri-publik/[token]` - Access public gallery

## File Structure

```
portal-keasramaan/
├── app/
│   ├── manajemen-rapor/
│   │   ├── layout.tsx                    # Layout dengan submenu
│   │   ├── galeri-kegiatan/              # Galeri kegiatan module
│   │   ├── template-rapor/               # Template rapor module
│   │   ├── generate-rapor/               # Generate rapor module
│   │   └── indikator-capaian/            # Indikator & capaian module
│   ├── galeri-publik/
│   │   └── [token]/page.tsx              # Public gallery
│   └── api/
│       └── rapor/                        # API routes
├── components/
│   └── rapor/                            # Rapor components
├── lib/
│   └── rapor/                            # Rapor utilities
│       ├── pdf-generator.ts              # PDF generation
│       ├── qr-generator.ts               # QR code generation
│       └── renderers/                    # Page renderers
├── supabase/
│   └── SETUP_MANAJEMEN_RAPOR.sql         # Database setup
└── Documentation/
    ├── PANDUAN_PENGGUNA_MANAJEMEN_RAPOR.md
    ├── TESTING_GUIDE_MANAJEMEN_RAPOR.md
    └── MANUAL_TESTING_CHECKLIST_RAPOR.md
```

## Performance

### Benchmarks
- **Upload 1 foto (2MB)**: < 5 detik
- **Generate 1 rapor**: < 15 detik
- **Generate 10 rapor**: < 2 menit
- **Generate 50 rapor**: < 10 menit
- **Galeri publik load**: < 3 detik

### Optimization
- Image compression on upload
- Lazy loading untuk foto
- Batch processing untuk bulk generation
- Database indexes untuk query optimization
- CDN untuk static assets

## Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- RLS policies di Supabase
- Token-based access untuk galeri publik

### File Upload Security
- File type validation (JPG, PNG, WEBP only)
- File size limit (5MB max)
- Malicious file detection
- Signed URLs untuk Supabase Storage

### Data Security
- Parameterized queries untuk prevent SQL injection
- Input sanitization untuk prevent XSS
- HTTPS only
- Token expiration untuk galeri publik

## Troubleshooting

### Common Issues

**Problem: Upload foto gagal**
- Cek ukuran file (maksimal 5MB)
- Cek format file (harus JPG, PNG, atau WEBP)
- Cek koneksi internet

**Problem: Generate rapor lambat**
- Cek jumlah foto per kegiatan
- Cek ukuran foto (compress jika terlalu besar)
- Coba generate di waktu yang berbeda

**Problem: QR Code tidak bisa discan**
- Pastikan QR code tidak terlalu kecil (minimal 150px)
- Pastikan kualitas print PDF bagus
- Coba scan dengan aplikasi QR scanner yang berbeda

**Problem: Galeri publik tidak menampilkan foto**
- Cek apakah token masih valid
- Cek apakah kegiatan memiliki scope yang sesuai dengan siswa
- Cek apakah foto sudah diupload ke kegiatan

## Support

Untuk bantuan lebih lanjut:
1. Baca dokumentasi lengkap di folder Documentation
2. Cek troubleshooting guide
3. Hubungi admin sistem atau IT support

## License

Proprietary - Portal Keasramaan

## Contributors

- Development Team
- QA Team
- Product Team

---

**Version:** 1.0.0
**Last Updated:** November 2024
**Status:** Production Ready ✅

