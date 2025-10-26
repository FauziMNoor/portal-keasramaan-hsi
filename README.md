# Portal Keasramaan HSI Boarding School

Dashboard manajemen data keasramaan yang terhubung dengan Supabase secara real-time.

## Fitur

- ✅ CRUD lengkap untuk semua tabel
- ✅ Real-time connection dengan Supabase
- ✅ UI modern dengan Tailwind CSS
- ✅ Responsive design
- ✅ Icon informatif dari Lucide React

## Modul yang Tersedia

### Data Sekolah
- Identitas Sekolah (Logo, Nama, Kepala Sekolah, Kontak)
- Tahun Ajaran
- Semester

### Data Tempat
- Lokasi
- Asrama
- Kelas
- Rombel (dengan relasi ke Kelas)

### Data Pengurus
- Kepala Asrama (dengan relasi ke Lokasi)
- Musyrif (dengan cascading dropdown: Lokasi → Kelas → Asrama)

### Data Siswa
- Input Data Siswa (dengan upload foto bulat dan cascading dropdown lengkap)

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Pastikan file `.env.local` sudah ada dengan konfigurasi Supabase yang benar

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser di `http://localhost:3000`

## Teknologi

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React (Icons)

## Struktur Database

Aplikasi ini menggunakan 10 tabel di Supabase:
- `identitas_sekolah_keasramaan` - Data identitas sekolah (single record)
- `tahun_ajaran_keasramaan` - Data tahun ajaran
- `semester_keasramaan` - Data semester
- `lokasi_keasramaan` - Data lokasi/gedung
- `kelas_keasramaan` - Data kelas
- `rombel_keasramaan` - Data rombel (berelasi dengan kelas)
- `asrama_keasramaan` - Data asrama (berelasi dengan lokasi & kelas)
- `kepala_asrama_keasramaan` - Data kepala asrama (berelasi dengan lokasi)
- `musyrif_keasramaan` - Data musyrif (berelasi dengan lokasi, kelas, asrama)
- `data_siswa_keasramaan` - Data siswa (berelasi dengan lokasi, kelas, rombel, asrama, musyrif)

## Desain UI

- Tema warna biru modern dengan gradasi
- Layout sidebar + konten utama
- Tombol dan container dengan rounded corners
- Tabel dengan zebra-striping
- Modal form yang elegan
- Transisi smooth pada semua interaksi
