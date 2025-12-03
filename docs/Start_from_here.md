# 📚 RINGKASAN APLIKASI PORTAL KEASRAMAAN HSI BOARDING SCHOOL

**Terakhir Diperbarui:** 1 Desember 2025  
**Versi:** 2.0  
**Status:** Production Ready ✅

---

## 🎯 OVERVIEW APLIKASI

**Portal Keasramaan** adalah sistem manajemen komprehensif untuk boarding school yang mencakup manajemen data siswa, habit tracker, catatan perilaku, perizinan kepulangan, dan pelaporan kepada wali santri. Aplikasi ini dibangun dengan teknologi modern dan terintegrasi penuh dengan Supabase sebagai backend.

### Teknologi Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** Zustand
- **Authentication:** JWT (Jose)
- **Testing:** Jest

---

## 🏗️ STRUKTUR APLIKASI

### Modul Utama

#### 1. **MANAJEMEN DATA MASTER**
Pengelolaan data dasar sekolah dan keasramaan.

**Sub-modul:**
- **Identitas Sekolah** - Logo, nama, kepala sekolah, kontak
- **Tahun Ajaran** - Periode tahun ajaran
- **Semester** - Semester ganjil/genap dengan status aktif
- **Cabang** - Multi-cabang sekolah
- **Lokasi** - Gedung/lokasi asrama
- **Kelas** - Data kelas (7-12)
- **Rombel** - Rombongan belajar per kelas
- **Asrama** - Data asrama dengan relasi ke lokasi & kelas
- **Kepala Asrama** - Data kepala asrama per lokasi
- **Musyrif** - Data pembina asrama dengan cascading filter

**Fitur:**
- ✅ CRUD lengkap semua tabel
- ✅ Cascading dropdown (Cabang → Lokasi → Kelas → Asrama)
- ✅ Real-time sync dengan Supabase
- ✅ Validasi data terintegrasi

---

#### 2. **DATA SISWA**
Manajemen data santri/siswa keasramaan.

**Fitur:**
- ✅ Upload foto siswa (bulat, optimized)
- ✅ Cascading dropdown lengkap
- ✅ Import/Export Excel
- ✅ Filter & search advanced
- ✅ Status aktif/non-aktif
- ✅ Relasi lengkap: Cabang, Kelas, Rombel, Asrama, Musyrif, Kepala Asrama

**Data Fields:**
- NIS, Nama, Jenis Kelamin, Tempat/Tanggal Lahir
- Cabang, Kelas, Rombel, Asrama
- Musyrif, Kepala Asrama
- Foto, Status

---

#### 3. **HABIT TRACKER** 🕌
Sistem penilaian harian kebiasaan santri dengan 4 kategori utama.

**Kategori Penilaian:**

**A. Ubudiyah (Target: 28 poin)**
- Shalat Fardhu Berjamaah (0-3)
- Tata Cara Shalat (0-3)
- Qiyamul Lail (0-3)
- Shalat Sunnah (0-3)
- Puasa Sunnah (0-5)
- Tata Cara Wudhu (0-3)
- Sedekah (0-4)
- Dzikir Pagi Petang (0-4)

**B. Akhlaq (Target: 12 poin)**
- Etika Tutur Kata (0-3)
- Etika Bergaul (0-3)
- Etika Berpakaian (0-3)
- Adab Sehari-hari (0-3)

**C. Kedisiplinan (Target: 21 poin)**
- Waktu Tidur (0-4)
- Piket Kamar (0-3)
- Halaqah Tahfidz (0-3)
- Perizinan (0-3)
- Belajar Malam (0-4)
- Berangkat ke Masjid (0-4)

**D. Kebersihan & Kerapian (Target: 9 poin)**
- Kebersihan Tubuh & Pakaian (0-3)
- Kamar (0-3)
- Ranjang & Almari (0-3)

**Total Maksimal: 70 poin**

**Sub-modul:**

**3.1. Input Formulir**
- Form input harian per santri
- Validasi field kosong
- Auto-save dengan user login
- Filter cascading (Cabang → Kelas → Asrama → Musyrif)

**3.2. Rekap Habit Tracker**
- Perhitungan otomatis rata-rata per indikator
- Total & persentase per kategori
- Predikat otomatis (Mumtaz, Jayyid Jiddan, Jayyid, Dhaif, Maqbul)
- Filter: Semester, Tahun Ajaran, Cabang, Kelas, Asrama, Range Tanggal
- Export Excel (coming soon)

**Predikat:**
- **Mumtaz:** > 65 poin (Green)
- **Jayyid Jiddan:** > 60 poin (Blue)
- **Jayyid:** > 50 poin (Yellow)
- **Dhaif:** > 30 poin (Orange)
- **Maqbul:** > 0 poin (Red)

**3.3. Kelola Link Musyrif**
- Generate token unik untuk musyrif
- Filter otomatis per token (Cabang, Kelas, Asrama, Musyrif)
- Copy link untuk WhatsApp/Telegram
- Toggle aktif/nonaktif token
- Form mobile-optimized untuk input via HP

**3.4. Laporan Wali Santri**
- Generate token untuk wali santri
- Dashboard mobile-friendly
- 4 card statistik dengan progress bar
- Chart perkembangan
- **Periode Laporan:**
  - **Pekanan** - Data 7 hari terakhir (NEW! ✨)
  - **Bulanan** - Data 30 hari terakhir
  - **Semester** - Data semester aktif
- Foto santri & info lengkap
- Trend persentase vs periode sebelumnya

**3.5. Indikator Penilaian**
- Kelola deskripsi per nilai (0-5)
- Tampil di detail rekap
- Membantu pemahaman nilai

---

#### 4. **CATATAN PERILAKU** 📋
Sistem pencatatan pelanggaran dan kebaikan santri dengan poin.

**Sub-modul:**

**4.1. Input Catatan**
- Tab switching: Pelanggaran / Kebaikan
- Filter santri (Cabang, Kelas, Asrama, Musyrif)
- Pilih kategori (poin otomatis)
- **Fitur Custom Poin** untuk pelanggaran khusus
- Deskripsi tambahan (opsional)
- **Upload Foto Kegiatan** (multi-photo, max 5 foto)
- Auto-save dengan nama user

**4.2. Kelola Link Token**
- Generate token untuk musyrif/guru
- Filter otomatis per token
- Tipe akses: Semua / Hanya Pelanggaran / Hanya Kebaikan
- Form mobile-optimized
- **Upload foto** langsung dari HP

**4.3. Riwayat Catatan**
- Tabel lengkap semua catatan
- Filter: Search, Tipe, Range Tanggal
- Stats cards: Total catatan, pelanggaran, kebaikan, poin
- Badge warna (Merah: pelanggaran, Hijau: kebaikan)
- **Lightbox untuk view foto**
- Hapus catatan
- Export CSV

**4.4. Dashboard Rekap**
- Filter: Cabang, Kelas, Asrama
- Stats cards: Total santri, pelanggaran, kebaikan, total poin
- Top 5 Santri Terbaik (poin tertinggi)
- Top 5 Perlu Perhatian (poin terendah)
- Tabel rekap per santri dengan ranking
- Warna poin: Biru (positif), Orange (negatif)

**4.5. Kelola Kategori**
- Tab: Pelanggaran / Kebaikan
- CRUD kategori lengkap
- Set poin per kategori
- Deskripsi kategori
- Status aktif/nonaktif

**Kategori Default:**

**Pelanggaran (15 kategori):**
- Terlambat Shalat Berjamaah: -5
- Tidak Shalat Berjamaah: -10
- Keluar Asrama Tanpa Izin: -15
- Berkelahi: -20
- Merokok: -25
- dll.

**Kebaikan (15 kategori):**
- Imam Shalat: +10
- Adzan: +5
- Hafalan Quran Bertambah: +10
- Juara Lomba: +15
- Tahajud: +10
- dll.

**Fitur Foto Kegiatan:**
- ✅ Upload multi-foto (max 5)
- ✅ Preview thumbnail
- ✅ Lightbox full-screen view
- ✅ Navigation antar foto (keyboard & button)
- ✅ Download foto
- ✅ Optimized storage di Supabase
- ✅ Tampil di Riwayat & Laporan Wali Santri

---

#### 5. **PERIZINAN KEPULANGAN** 🏠
Sistem perizinan santri pulang dengan approval bertingkat.

**Alur Perizinan:**
1. Wali Santri → Isi form via link token (HP)
2. Kepala Asrama → Approve/Reject
3. Kepala Sekolah → Approve/Reject (Final)
4. Generate Surat Izin (DOCX/PDF)
5. Upload Bukti Cetak Surat
6. Konfirmasi Kepulangan
7. Perpanjangan Izin (jika perlu)

**Sub-modul:**

**5.1. Form Perizinan (Public)**
- URL: `/perizinan/kepulangan/form/[token]`
- Mobile-optimized
- Input: Tanggal pulang, tanggal kembali, alasan, alamat tujuan
- Upload foto santri (opsional)
- QR Code otomatis
- Validasi token aktif

**5.2. Kelola Link Token**
- Generate token untuk wali santri
- Input nama wali & nomor telepon
- Copy link untuk WhatsApp
- Toggle aktif/nonaktif
- Edit & hapus token

**5.3. Approval Perizinan**
- Tabel perizinan dengan status
- Filter: Status, Tanggal, Search
- Badge status (Pending, Approved, Rejected)
- **Countdown timer** untuk santri yang belum kembali
- **Alert merah** untuk santri terlambat
- Approve/Reject dengan catatan
- Generate surat otomatis setelah approved

**5.4. Rekap Perizinan**
- Stats cards: Total izin, pending, approved, rejected, terlambat
- Filter: Kategori, Status, Range Tanggal, Cabang, Kelas, Asrama
- **Kategori Izin:**
  - Sakit
  - Keperluan Keluarga
  - Acara Keluarga
  - Lainnya
- Tabel lengkap dengan countdown
- Export Excel

**5.5. Upload Bukti Cetak Surat**
- Upload foto/scan surat yang sudah dicetak
- Validasi file (image/PDF)
- Preview sebelum upload
- Status tracking

**Fitur Unggulan:**
- ✅ **Kop Surat Dinamis** - Logo & identitas sekolah otomatis
- ✅ **QR Code** - Verifikasi surat
- ✅ **Download DOCX & PDF** - Format profesional
- ✅ **Countdown Timer** - Real-time monitoring
- ✅ **Alert Terlambat** - Notifikasi visual
- ✅ **Konfirmasi Kepulangan** - Tracking santri sudah kembali
- ✅ **Perpanjangan Izin** - Request perpanjangan dengan approval
- ✅ **Multi-level Approval** - Kepala Asrama → Kepala Sekolah

---

#### 6. **DASHBOARD & OVERVIEW** 📊

**6.1. Dashboard Data**
- Stats cards: Total siswa, musyrif, asrama, kelas
- Chart distribusi siswa per kelas
- Chart distribusi siswa per asrama
- Quick links ke modul utama

**6.2. Dashboard Habit Tracker**
- Stats cards: Total formulir, rata-rata nilai, trend
- Chart perkembangan per kategori
- Top 5 santri terbaik
- Filter: Semester, Tahun Ajaran, Range Tanggal

**6.3. Dashboard Catatan Perilaku**
- Stats cards: Total catatan, pelanggaran, kebaikan, poin
- Chart distribusi per kategori
- Top 5 santri terbaik & perlu perhatian
- Filter: Range Tanggal, Cabang, Kelas

---

#### 7. **USER MANAGEMENT** 👥

**Role & Access Control:**

| Role | Access Level | Menu Count | Deskripsi |
|------|--------------|------------|-----------|
| **Admin** | Full Access | 20+ | Akses semua fitur |
| **Kepala Asrama** | Full Access | 20+ | Akses semua fitur |
| **Musyrif** | Limited | 7 | Dashboard + Input HT + Rekap HT + Input/Riwayat CP |
| **Guru** | Limited | 6 | Dashboard + Rekap HT + Input/Riwayat CP |

**Fitur User Management:**
- ✅ CRUD user lengkap
- ✅ Role-based access control
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Session management
- ✅ Cascading dropdown (Cabang → Kelas → Asrama → Musyrif)
- ✅ Badge warna per role

**Perbedaan Musyrif vs Guru:**
- ✅ Musyrif bisa **Input Formulir Habit Tracker**
- ❌ Guru tidak bisa Input Formulir Habit Tracker
- ✅ Keduanya bisa Rekap HT & Input/Riwayat CP

---

## 🎨 DESIGN SYSTEM

### Color Palette
- **Primary:** Blue (#3B82F6)
- **Secondary:** Purple (#8B5CF6)
- **Success:** Green (#10B981)
- **Warning:** Orange (#F59E0B)
- **Danger:** Red (#EF4444)
- **Info:** Cyan (#06B6D4)

### Component Library
- **Buttons:** Rounded, gradient, with icons
- **Cards:** Shadow, rounded corners, hover effects
- **Tables:** Zebra striping, sticky header, responsive
- **Forms:** Floating labels, validation, cascading dropdowns
- **Modals:** Backdrop blur, smooth animations
- **Badges:** Color-coded by status/role
- **Charts:** Recharts with gradient fills

### Responsive Design
- **Mobile:** 320px - 768px (optimized)
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+
- **Touch-friendly:** Min 44px tap targets

---

## 🗄️ DATABASE SCHEMA

### Tabel Utama (30+ tabel)

**Master Data:**
- `identitas_sekolah_keasramaan`
- `tahun_ajaran_keasramaan`
- `semester_keasramaan`
- `cabang_keasramaan`
- `lokasi_keasramaan`
- `kelas_keasramaan`
- `rombel_keasramaan`
- `asrama_keasramaan`
- `kepala_asrama_keasramaan`
- `musyrif_keasramaan`

**Data Siswa:**
- `data_siswa_keasramaan`

**Habit Tracker:**
- `formulir_habit_tracker_keasramaan`
- `token_musyrif_keasramaan`
- `token_wali_santri_keasramaan`
- `indikator_keasramaan`

**Catatan Perilaku:**
- `kategori_pelanggaran_keasramaan`
- `kategori_kebaikan_keasramaan`
- `catatan_perilaku_keasramaan`
- `token_catatan_perilaku_keasramaan`

**Perizinan:**
- `perizinan_kepulangan_keasramaan`
- `token_perizinan_keasramaan`
- `konfirmasi_kepulangan_keasramaan`
- `perpanjangan_izin_keasramaan`

**User & Auth:**
- `users_keasramaan`

**Storage Buckets:**
- `foto-siswa` - Foto profil siswa
- `kop-surat` - Logo sekolah untuk surat
- `foto-catatan-perilaku` - Foto kegiatan
- `bukti-cetak-surat` - Bukti upload surat

---

## 🔐 SECURITY & AUTHENTICATION

### Authentication
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Session management
- ✅ Token expiration
- ✅ Secure cookies

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Route protection (middleware)
- ✅ UI-level protection (conditional rendering)
- ✅ API-level protection (recommended)

### Row Level Security (RLS)
- ✅ Enabled di semua tabel Supabase
- ✅ Read: Public (untuk token-based access)
- ✅ Write: Authenticated users only
- ✅ Admin bypass untuk maintenance

---

## 📱 MOBILE OPTIMIZATION

### Features
- ✅ Mobile-first design
- ✅ Touch-friendly interface
- ✅ Responsive tables (horizontal scroll)
- ✅ Optimized forms untuk HP
- ✅ PWA-ready (Progressive Web App)
- ✅ Offline capability (coming soon)

### Token-Based Access
- ✅ Wali Santri - Laporan Habit Tracker
- ✅ Wali Santri - Form Perizinan
- ✅ Musyrif - Input Habit Tracker
- ✅ Musyrif/Guru - Input Catatan Perilaku

---

## 🚀 DEPLOYMENT

### Requirements
- Node.js 20+
- npm/yarn
- Supabase account
- Domain & hosting (VPS/Cloud)

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
```

### Build & Deploy
```bash
# Install dependencies
npm install

# Build production
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "portal-keasramaan" -- start
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 STATISTIK APLIKASI

### Code Statistics
- **Total Files:** 200+ files
- **Total Lines:** 50,000+ lines
- **Components:** 50+ components
- **Pages:** 30+ pages
- **API Routes:** 10+ routes

### Database
- **Tables:** 30+ tables
- **Storage Buckets:** 4 buckets
- **RLS Policies:** 100+ policies

### Documentation
- **MD Files:** 150+ documentation files
- **SQL Scripts:** 20+ migration scripts
- **Test Files:** 10+ test suites

---

## 🎯 FITUR UNGGULAN

### 1. **Multi-Cabang Support**
- Satu aplikasi untuk banyak cabang
- Filter otomatis per cabang
- Data terpisah tapi terintegrasi

### 2. **Token-Based Access**
- Akses tanpa login untuk wali santri
- Mobile-optimized forms
- Secure & trackable

### 3. **Real-Time Monitoring**
- Countdown timer perizinan
- Alert terlambat
- Live stats dashboard

### 4. **Comprehensive Reporting**
- Habit Tracker dengan predikat
- Catatan Perilaku dengan poin
- Perizinan dengan status tracking
- Export Excel/PDF

### 5. **Upload & Storage**
- Foto siswa optimized
- Multi-photo upload catatan perilaku
- Bukti cetak surat
- Supabase storage integration

### 6. **Document Generation**
- Surat izin DOCX/PDF
- Kop surat dinamis
- QR Code verification
- Professional templates

---

## 🔄 UPDATE TERAKHIR (1 Desember 2025)

### ✨ Fitur Baru
1. **Periode Pekanan di Laporan Wali Santri**
   - Tambah periode "Pekanan" (7 hari terakhir)
   - Sekarang ada 3 periode: Pekanan, Bulanan, Semester
   - Default periode: Pekanan

### 🐛 Bug Fixes
- Fix perhitungan rata-rata habit tracker
- Fix filter cascading dropdown
- Fix responsive table di mobile

### 📝 Documentation
- Update dokumentasi lengkap
- Tambah troubleshooting guide
- Update testing checklist

---

## 📚 DOKUMENTASI LENGKAP

### Quick Start Guides
- `QUICK_START_PERIZINAN.md`
- `QUICK_START_CATATAN_PERILAKU.md`
- `QUICK_START_FOTO.md`
- `QUICK_START_KOP_DINAMIS.md`

### Feature Documentation
- `FITUR_CATATAN_PERILAKU.md`
- `FITUR_LAPORAN_WALI_SANTRI.md`
- `FITUR_REKAP_HABIT_TRACKER.md`
- `FITUR_PERIZINAN_KEPULANGAN.md`

### Implementation Guides
- `IMPLEMENTASI_PERIZINAN_KEPULANGAN.md`
- `IMPLEMENTASI_CATATAN_PERILAKU_SUMMARY.md`
- `IMPLEMENTASI_FOTO_CATATAN_PERILAKU_SUMMARY.md`

### Index & References
- `INDEX_PERIZINAN_KEPULANGAN.md`
- `INDEX_ROLE_GURU.md`
- `INDEX_DOKUMENTASI_FOTO.md`

### Testing
- `TESTING_PERIZINAN_KEPULANGAN.md`
- `TESTING_CATATAN_PERILAKU.md`
- `TEST_ROLE_GURU.md`

### Troubleshooting
- `TROUBLESHOOTING_FOTO.md`
- `TROUBLESHOOTING_CATATAN_PERILAKU.md`
- `CARA_FIX_ERROR_RLS.md`

---

## 🎓 USE CASES

### Skenario 1: Musyrif Input Habit Tracker via HP
1. Admin generate token untuk Musyrif Ahmad
2. Copy link dan kirim via WhatsApp
3. Musyrif buka link di HP
4. Input nilai habit tracker santri asramanya
5. Data tersimpan otomatis

### Skenario 2: Wali Santri Lihat Laporan
1. Admin generate token untuk Wali Santri
2. Copy link dan kirim via WhatsApp
3. Wali buka link, input NIS anak
4. Lihat dashboard perkembangan (Pekanan/Bulanan/Semester)
5. Lihat chart & statistik lengkap

### Skenario 3: Perizinan Kepulangan
1. Admin generate token untuk Wali Santri
2. Wali isi form perizinan via HP
3. Kepala Asrama approve
4. Kepala Sekolah approve (final)
5. Generate surat DOCX/PDF
6. Upload bukti cetak surat
7. Konfirmasi kepulangan setelah santri kembali

### Skenario 4: Input Catatan Perilaku dengan Foto
1. Musyrif input kebaikan santri
2. Upload foto kegiatan (max 5 foto)
3. Data tersimpan dengan foto
4. Foto tampil di Riwayat & Laporan Wali Santri
5. Lightbox untuk view foto full-screen

---

## 🚧 ROADMAP

### Phase 1 (DONE ✅)
- ✅ Manajemen Data Master
- ✅ Data Siswa
- ✅ Habit Tracker
- ✅ Catatan Perilaku
- ✅ Perizinan Kepulangan
- ✅ User Management
- ✅ Dashboard & Reporting

### Phase 2 (IN PROGRESS 🔄)
- 🔄 Export Excel/PDF advanced
- 🔄 WhatsApp notification integration
- 🔄 Email notification
- 🔄 Advanced analytics & charts

### Phase 3 (PLANNED 📋)
- 📋 Mobile App (React Native)
- 📋 Offline mode
- 📋 Push notifications
- 📋 Parent portal (dedicated)
- 📋 Academic integration
- 📋 Financial integration

---

## 📞 SUPPORT & MAINTENANCE

### Contact
- **Developer:** HSI IT Team
- **Email:** it@hsi-boarding.com
- **WhatsApp:** [nomor support]

### Maintenance Schedule
- **Daily Backup:** 02:00 WIB
- **Weekly Update:** Minggu 00:00 WIB
- **Monthly Maintenance:** Minggu pertama setiap bulan

### SLA
- **Uptime:** 99.5%
- **Response Time:** < 24 jam
- **Bug Fix:** < 48 jam (critical), < 7 hari (non-critical)

---

## ✅ PRODUCTION CHECKLIST

- [x] Database setup complete
- [x] All features tested
- [x] Documentation complete
- [x] Security audit done
- [x] Performance optimization
- [x] Mobile optimization
- [x] Backup strategy
- [x] Monitoring setup
- [x] User training
- [x] Soft launch
- [x] Full rollout

---

## 🎉 KESIMPULAN

**Portal Keasramaan HSI Boarding School** adalah sistem manajemen keasramaan yang komprehensif, modern, dan user-friendly. Dengan fitur-fitur lengkap mulai dari manajemen data, habit tracker, catatan perilaku, perizinan, hingga pelaporan kepada wali santri, aplikasi ini siap mendukung operasional boarding school secara efektif dan efisien.

**Status:** ✅ **PRODUCTION READY**

---

**Dibuat dengan ❤️ untuk HSI Boarding School**  
**Last Updated:** 1 Desember 2025  
**Version:** 2.0
