# 📊 Spesifikasi Dashboard Habit Tracker

## 🎯 Tujuan
Membuat dashboard interaktif untuk monitoring dan analisis habit tracker santri dengan visualisasi data yang informatif dan insight otomatis.

## 📋 Struktur Dashboard

### 1. 🧭 Bagian Filter (Top Section)
**Komponen:**
- Dropdown Tahun Ajaran (required)
- Dropdown Semester (required)
- Dropdown Lokasi/Asrama (optional)
- Dropdown Musyrif (optional)
- Search Nama Santri (optional)
- Button "Tampilkan Dashboard"

**Fungsi:**
- Filter data berdasarkan kriteria yang dipilih
- Validasi: Tahun Ajaran dan Semester wajib dipilih
- Auto-refresh saat filter berubah

### 2. 📊 Bagian Statistik Umum (Cards)
**4 Cards dengan icon dan warna berbeda:**

#### Card 1: Total Santri Disiplin 🎯
- Judul: "Santri Disiplin"
- Nilai: Jumlah santri dengan rata-rata > 2.5
- Persentase dari total santri
- Warna: Hijau
- Icon: CheckCircle

#### Card 2: Rata-rata Nilai Habit 📈
- Judul: "Rata-rata Habit"
- Nilai: Rata-rata nilai seluruh santri
- Skala: 0 - 70
- Warna: Biru
- Icon: TrendingUp

#### Card 3: Asrama Terbaik 🏆
- Judul: "Asrama Terbaik"
- Nilai: Nama asrama dengan rata-rata tertinggi
- Nilai rata-rata asrama
- Warna: Kuning
- Icon: Award

#### Card 4: Musyrif Terbaik 👨‍🏫
- Judul: "Musyrif Terbaik"
- Nilai: Nama musyrif dengan santri paling stabil
- Jumlah santri
- Warna: Ungu
- Icon: Users

### 3. 📈 Bagian Grafik (3 Charts)

#### Chart 1: Top 10 Santri (Bar Chart)
**Tipe:** Horizontal Bar Chart
**Data:**
- X-axis: Nilai total (0-70)
- Y-axis: Nama santri
- Warna: Gradient hijau
- Tooltip: Nama, NIS, Kelas, Nilai

**Fitur:**
- Sortir dari tertinggi ke terendah
- Highlight bar saat hover
- Click bar untuk lihat detail

#### Chart 2: Trend Perkembangan (Line Chart)
**Tipe:** Multi-line Chart
**Data:**
- X-axis: Minggu/Bulan
- Y-axis: Rata-rata nilai
- Lines: 
  - Ubudiyah (biru)
  - Akhlaq (hijau)
  - Kedisiplinan (orange)
  - Kebersihan (ungu)

**Fitur:**
- Toggle show/hide line per kategori
- Zoom in/out
- Tooltip dengan detail nilai

#### Chart 3: Profil Habit Santri (Radar Chart)
**Tipe:** Radar/Spider Chart
**Data:**
- 21 indikator habit
- Nilai 0-5 per indikator
- Warna: Gradient biru-hijau

**Fitur:**
- Select santri dari dropdown
- Compare 2 santri (overlay 2 radar)
- Highlight aspek lemah (merah) dan kuat (hijau)

### 4. 👤 Bagian Detail Santri (Table + Detail Panel)

#### Tabel Ringkas
**Kolom:**
1. Ranking (#)
2. Foto (thumbnail bulat)
3. Nama Santri
4. NIS
5. Kelas
6. Asrama
7. Rata-rata Habit (dengan progress bar)
8. Trend (icon: ↑ ↓ →)
9. Status (badge: Mumtaz/Jayyid/dll)
10. Aksi (button "Lihat Detail")

**Fitur:**
- Pagination (10/20/50 per page)
- Sort by kolom
- Search nama
- Export to Excel/PDF

#### Detail Panel (Modal/Sidebar)
**Muncul saat klik "Lihat Detail"**

**Bagian 1: Header**
- Foto santri (besar)
- Nama, NIS, Kelas, Asrama
- Total nilai dan predikat
- Badge status

**Bagian 2: Radar Chart Individual**
- 21 indikator dengan nilai
- Highlight aspek kuat (hijau) dan lemah (merah)

**Bagian 3: Breakdown Per Kategori**
4 cards dengan detail:
- Ubudiyah (8 indikator)
- Akhlaq (4 indikator)
- Kedisiplinan (6 indikator)
- Kebersihan (3 indikator)

Setiap indikator menampilkan:
- Nama indikator
- Nilai (angka + progress bar)
- Badge status (🟢 Baik / 🟡 Cukup / 🔴 Perlu Perbaikan)
- Deskripsi rubrik

**Bagian 4: Narasi Otomatis**
Generate narasi berdasarkan data:

```
"Ananda [Nama] menunjukkan kedisiplinan yang baik dalam ibadah berjamaah 
dengan nilai 3/3 pada Shalat Fardhu Berjamaah. Namun masih perlu bimbingan 
dalam menjaga kebersihan kamar dengan nilai 1/3. 

Aspek yang perlu diperbaiki:
- Qiyamul Lail (1/3)
- Piket Kamar (1/3)
- Kebersihan Tubuh (2/3)

Aspek yang sudah baik:
- Shalat Fardhu Berjamaah (3/3)
- Etika Tutur Kata (3/3)
- Kebersihan Tubuh (3/3)"
```

**Bagian 5: Rekomendasi**
- 3 aspek prioritas untuk diperbaiki
- Action plan untuk musyrif
- Target nilai minggu depan

### 5. 🎯 Insight Otomatis

#### Badge System
**3 Level:**
- 🟢 Konsisten (nilai >= 2.5)
- 🟡 Perlu Ditingkatkan (nilai 1.5 - 2.4)
- 🔴 Masih Rendah (nilai < 1.5)

**Ditampilkan di:**
- Tabel santri (kolom badge per kategori)
- Detail santri (per indikator)
- Card statistik

#### Alert System
**Notifikasi otomatis untuk:**
- Santri dengan nilai menurun 2 minggu berturut-turut
- Santri dengan nilai < 1.5 di 3+ indikator
- Asrama dengan rata-rata menurun
- Musyrif dengan banyak santri bermasalah

#### Ranking System
**3 Jenis Ranking:**
1. Ranking Keseluruhan (total nilai)
2. Ranking Per Kategori (Ubudiyah, Akhlaq, dll)
3. Ranking Per Asrama

**Ditampilkan:**
- Badge ranking (#1, #2, #3 dengan icon medali)
- Perubahan ranking (naik/turun berapa posisi)

## 🎨 Design System

### Warna
- Primary: Hijau (#22C55E)
- Secondary: Biru (#3B82F6)
- Warning: Orange (#F97316)
- Danger: Merah (#EF4444)
- Success: Hijau Tua (#16A34A)

### Typography
- Heading: Bold, 24-32px
- Subheading: Semibold, 18-20px
- Body: Regular, 14-16px
- Caption: Regular, 12px

### Spacing
- Section gap: 24px
- Card padding: 20px
- Element gap: 12px

## 📱 Responsive Design
- Desktop: 3 kolom untuk cards, 2 kolom untuk charts
- Tablet: 2 kolom untuk cards, 1 kolom untuk charts
- Mobile: 1 kolom untuk semua, charts scrollable

## 🔄 Data Flow

### 1. Load Dashboard
```
User select filter → Click "Tampilkan" → 
Fetch data from Supabase → 
Calculate statistics → 
Generate charts → 
Render dashboard
```

### 2. View Detail
```
User click "Lihat Detail" → 
Fetch santri detail → 
Calculate radar data → 
Generate narasi → 
Show modal/sidebar
```

### 3. Export Data
```
User click "Export" → 
Prepare data → 
Generate Excel/PDF → 
Download file
```

## 🗄️ Database Queries

### Query 1: Statistics
```sql
-- Total santri disiplin
SELECT COUNT(*) 
FROM (
  SELECT nis, AVG(nilai_total) as avg_nilai
  FROM habit_tracker
  WHERE tahun_ajaran = ? AND semester = ?
  GROUP BY nis
  HAVING avg_nilai > 2.5
) as disiplin;

-- Rata-rata nilai
SELECT AVG(nilai_total) 
FROM habit_tracker
WHERE tahun_ajaran = ? AND semester = ?;

-- Asrama terbaik
SELECT asrama, AVG(nilai_total) as avg_nilai
FROM habit_tracker
WHERE tahun_ajaran = ? AND semester = ?
GROUP BY asrama
ORDER BY avg_nilai DESC
LIMIT 1;
```

### Query 2: Top Santri
```sql
SELECT 
  nama_siswa, 
  nis, 
  kelas, 
  asrama,
  AVG(nilai_total) as rata_rata
FROM habit_tracker
WHERE tahun_ajaran = ? AND semester = ?
GROUP BY nis
ORDER BY rata_rata DESC
LIMIT 10;
```

### Query 3: Trend Data
```sql
SELECT 
  DATE_TRUNC('week', tanggal) as minggu,
  AVG(ubudiyah) as avg_ubudiyah,
  AVG(akhlaq) as avg_akhlaq,
  AVG(kedisiplinan) as avg_kedisiplinan,
  AVG(kebersihan) as avg_kebersihan
FROM habit_tracker
WHERE tahun_ajaran = ? AND semester = ?
GROUP BY minggu
ORDER BY minggu;
```

## 🚀 Implementation Plan

### Phase 1: Basic Dashboard (Week 1)
- [x] Setup project structure
- [ ] Create filter section
- [ ] Fetch and display statistics cards
- [ ] Create basic table

### Phase 2: Charts (Week 2)
- [ ] Implement bar chart (Top 10)
- [ ] Implement line chart (Trend)
- [ ] Implement radar chart (Profile)

### Phase 3: Detail & Insights (Week 3)
- [ ] Create detail modal
- [ ] Generate narasi otomatis
- [ ] Implement badge system
- [ ] Add ranking system

### Phase 4: Polish & Export (Week 4)
- [ ] Responsive design
- [ ] Export functionality
- [ ] Performance optimization
- [ ] Testing & bug fixes

## 📝 Notes
- Gunakan Recharts untuk semua visualisasi
- Implement lazy loading untuk performa
- Cache data untuk mengurangi query
- Add loading skeleton untuk UX yang lebih baik
