# 🗄️ Database Schema - Sistem KPI

## 📋 Daftar Isi
- [Overview](#overview)
- [Tabel Baru](#tabel-baru)
- [Relasi Tabel](#relasi-tabel)
- [Indexes](#indexes)
- [Migration Script](#migration-script)

---

## Overview

Sistem KPI membutuhkan **5 tabel baru** untuk menyimpan data:
1. `jadwal_libur_musyrif_keasramaan` - Jadwal libur musyrif
2. `rapat_koordinasi_keasramaan` - Data rapat
3. `kehadiran_rapat_keasramaan` - Kehadiran musyrif di rapat
4. `log_kolaborasi_keasramaan` - Log inisiatif kolaborasi
5. `kpi_summary_keasramaan` - Summary KPI per bulan (cache)
6. `cuti_tahunan_musyrif_keasramaan` - Tracking jatah cuti

**Tabel yang sudah ada (digunakan):**
- `formulir_jurnal_musyrif_keasramaan`
- `formulir_habit_tracker_keasramaan`
- `catatan_perilaku_keasramaan`
- `musyrif_keasramaan`
- `data_siswa_keasramaan`

---

## Tabel Baru

### 1. jadwal_libur_musyrif_keasramaan

**Deskripsi:** Menyimpan jadwal libur musyrif (rutin, cuti, sakit, izin)

```sql
CREATE TABLE jadwal_libur_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  
  -- Tanggal libur
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  
  -- Jenis libur
  jenis_libur VARCHAR(50) NOT NULL, -- 'rutin', 'cuti', 'sakit', 'izin'
  keterangan TEXT,
  
  -- Musyrif pengganti (yang menitipkan asrama)
  musyrif_pengganti VARCHAR(255),
  asrama_pengganti VARCHAR(255),
  
  -- Jatah cuti (untuk tracking)
  sisa_cuti_tahunan INTEGER,
  
  -- Status approval (untuk cuti/izin, bukan rutin)
  status VARCHAR(20) DEFAULT 'pending', 
  -- 'pending', 'approved_kepala_asrama', 'approved_kepala_sekolah', 'rejected'
  approved_by_kepala_asrama VARCHAR(255),
  approved_at_kepala_asrama TIMESTAMP,
  approved_by_kepala_sekolah VARCHAR(255),
  approved_at_kepala_sekolah TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_libur_musyrif ON jadwal_libur_musyrif_keasramaan(nama_musyrif);
CREATE INDEX idx_libur_tanggal ON jadwal_libur_musyrif_keasramaan(tanggal_mulai, tanggal_selesai);
CREATE INDEX idx_libur_status ON jadwal_libur_musyrif_keasramaan(status);
CREATE INDEX idx_libur_jenis ON jadwal_libur_musyrif_keasramaan(jenis_libur);
```

---

### 2. rapat_koordinasi_keasramaan

**Deskripsi:** Menyimpan data rapat koordinasi

```sql
CREATE TABLE rapat_koordinasi_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  jenis_rapat VARCHAR(100) NOT NULL, -- 'mingguan', 'bulanan', 'evaluasi', 'darurat'
  cabang VARCHAR(255) NOT NULL,
  
  -- Peserta
  kepala_asrama VARCHAR(255),
  musyrif_list TEXT[], -- Array of musyrif names
  
  -- Agenda & Notulen
  agenda TEXT,
  notulen TEXT,
  
  -- Attachment (opsional)
  attachment_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_rapat_tanggal ON rapat_koordinasi_keasramaan(tanggal);
CREATE INDEX idx_rapat_cabang ON rapat_koordinasi_keasramaan(cabang);
```

---

### 3. kehadiran_rapat_keasramaan

**Deskripsi:** Menyimpan kehadiran musyrif di rapat

```sql
CREATE TABLE kehadiran_rapat_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rapat_id UUID NOT NULL REFERENCES rapat_koordinasi_keasramaan(id) ON DELETE CASCADE,
  nama_musyrif VARCHAR(255) NOT NULL,
  status_kehadiran VARCHAR(20) NOT NULL, -- 'hadir', 'izin', 'alpha'
  keterangan TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(rapat_id, nama_musyrif)
);
```

**Indexes:**
```sql
CREATE INDEX idx_kehadiran_musyrif ON kehadiran_rapat_keasramaan(nama_musyrif);
CREATE INDEX idx_kehadiran_rapat ON kehadiran_rapat_keasramaan(rapat_id);
```

---

### 4. log_kolaborasi_keasramaan

**Deskripsi:** Menyimpan log inisiatif kolaborasi musyrif

```sql
CREATE TABLE log_kolaborasi_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255) NOT NULL,
  
  -- Jenis Kolaborasi
  jenis VARCHAR(100) NOT NULL, 
  -- 'sharing_tips', 'bantuan_rekan', 'feedback', 'program_bersama', 'menitipkan_asrama'
  deskripsi TEXT NOT NULL,
  
  -- Pihak yang terlibat
  kolaborator TEXT[], -- Array of names (musyrif lain yang terlibat)
  
  -- Penilaian (dari kepala asrama)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  catatan_penilaian TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_kolaborasi_musyrif ON log_kolaborasi_keasramaan(nama_musyrif);
CREATE INDEX idx_kolaborasi_tanggal ON log_kolaborasi_keasramaan(tanggal);
CREATE INDEX idx_kolaborasi_jenis ON log_kolaborasi_keasramaan(jenis);
```

---

### 5. kpi_summary_keasramaan

**Deskripsi:** Menyimpan summary KPI per bulan (untuk caching & historical data)

```sql
CREATE TABLE kpi_summary_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode DATE NOT NULL, -- Tanggal akhir bulan (2024-11-30)
  role VARCHAR(50) NOT NULL, -- 'musyrif' atau 'kepala_asrama'
  nama VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  asrama VARCHAR(255), -- NULL untuk kepala asrama
  
  -- Hari kerja efektif (exclude libur)
  total_hari_bulan INTEGER NOT NULL,
  hari_libur INTEGER NOT NULL,
  hari_kerja_efektif INTEGER NOT NULL,
  
  -- Tier 1: Output (50%)
  score_ubudiyah DECIMAL(5,2),
  score_akhlaq DECIMAL(5,2),
  score_kedisiplinan DECIMAL(5,2),
  score_kebersihan DECIMAL(5,2),
  total_tier1 DECIMAL(5,2),
  
  -- Tier 2: Administrasi (30%)
  score_jurnal DECIMAL(5,2),
  hari_input_jurnal INTEGER, -- Actual days
  score_habit_tracker DECIMAL(5,2),
  score_koordinasi DECIMAL(5,2),
  score_catatan_perilaku DECIMAL(5,2),
  total_tier2 DECIMAL(5,2),
  
  -- Tier 3: Proses (20%)
  score_completion_rate DECIMAL(5,2),
  score_kehadiran DECIMAL(5,2),
  score_engagement DECIMAL(5,2),
  total_tier3 DECIMAL(5,2),
  
  -- Total & Ranking
  total_score DECIMAL(5,2),
  ranking INTEGER,
  total_musyrif INTEGER, -- Total musyrif di cabang (untuk context ranking)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint
  UNIQUE(periode, role, nama, cabang)
);
```

**Indexes:**
```sql
CREATE INDEX idx_kpi_periode ON kpi_summary_keasramaan(periode);
CREATE INDEX idx_kpi_ranking ON kpi_summary_keasramaan(periode, role, ranking);
CREATE INDEX idx_kpi_nama ON kpi_summary_keasramaan(nama, periode);
```

---

### 6. cuti_tahunan_musyrif_keasramaan

**Deskripsi:** Tracking jatah cuti tahunan musyrif

```sql
CREATE TABLE cuti_tahunan_musyrif_keasramaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_musyrif VARCHAR(255) NOT NULL,
  cabang VARCHAR(255) NOT NULL,
  tahun INTEGER NOT NULL, -- 2024, 2025, dst
  
  -- Jatah cuti
  jatah_cuti INTEGER DEFAULT 12, -- 12 hari per tahun
  cuti_terpakai INTEGER DEFAULT 0,
  sisa_cuti INTEGER DEFAULT 12,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint
  UNIQUE(nama_musyrif, tahun)
);
```

**Indexes:**
```sql
CREATE INDEX idx_cuti_musyrif ON cuti_tahunan_musyrif_keasramaan(nama_musyrif);
CREATE INDEX idx_cuti_tahun ON cuti_tahunan_musyrif_keasramaan(tahun);
```

---

## Relasi Tabel

```
┌─────────────────────────────────────────────────────┐
│  TABEL EXISTING (Digunakan untuk KPI)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  formulir_jurnal_musyrif_keasramaan                 │
│  ├─ nama_musyrif → KPI Tier 2 & 3                  │
│  ├─ status_terlaksana → Completion Rate            │
│  └─ catatan → Engagement                            │
│                                                     │
│  formulir_habit_tracker_keasramaan                  │
│  ├─ musyrif → KPI Tier 1                           │
│  ├─ ubudiyah fields → Score Ubudiyah               │
│  ├─ akhlaq fields → Score Akhlaq                   │
│  ├─ kedisiplinan fields → Score Kedisiplinan       │
│  └─ kebersihan fields → Score Kebersihan           │
│                                                     │
│  catatan_perilaku_keasramaan                        │
│  └─ musyrif → KPI Tier 2 (Catatan Perilaku)        │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABEL BARU (Untuk KPI)                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  jadwal_libur_musyrif_keasramaan                    │
│  └─ nama_musyrif → Exclude dari perhitungan KPI    │
│                                                     │
│  rapat_koordinasi_keasramaan                        │
│  └─ id → kehadiran_rapat_keasramaan.rapat_id       │
│                                                     │
│  kehadiran_rapat_keasramaan                         │
│  ├─ rapat_id → rapat_koordinasi_keasramaan.id      │
│  └─ nama_musyrif → KPI Tier 2 (Koordinasi)         │
│                                                     │
│  log_kolaborasi_keasramaan                          │
│  └─ nama_musyrif → KPI Tier 2 (Koordinasi)         │
│                                                     │
│  kpi_summary_keasramaan                             │
│  └─ nama → Musyrif/Kepala Asrama (Cache)           │
│                                                     │
│  cuti_tahunan_musyrif_keasramaan                    │
│  └─ nama_musyrif → Tracking jatah cuti             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Indexes

### Performance Optimization

**Indexes untuk Query Cepat:**

1. **Jadwal Libur:**
   - `idx_libur_musyrif` - Query by musyrif
   - `idx_libur_tanggal` - Query by date range
   - `idx_libur_status` - Filter by status
   - `idx_libur_jenis` - Filter by jenis libur

2. **Rapat & Kehadiran:**
   - `idx_rapat_tanggal` - Query by date
   - `idx_rapat_cabang` - Filter by cabang
   - `idx_kehadiran_musyrif` - Query by musyrif
   - `idx_kehadiran_rapat` - Query by rapat

3. **Kolaborasi:**
   - `idx_kolaborasi_musyrif` - Query by musyrif
   - `idx_kolaborasi_tanggal` - Query by date
   - `idx_kolaborasi_jenis` - Filter by jenis

4. **KPI Summary:**
   - `idx_kpi_periode` - Query by periode
   - `idx_kpi_ranking` - Sort by ranking
   - `idx_kpi_nama` - Query by nama

5. **Cuti Tahunan:**
   - `idx_cuti_musyrif` - Query by musyrif
   - `idx_cuti_tahun` - Query by tahun

---

## Migration Script

File: `supabase/migrations/20241210_kpi_system.sql`

**Catatan:**
- Run migration di Supabase SQL Editor
- Pastikan semua tabel existing sudah ada
- Enable RLS untuk semua tabel baru
- Set policy sesuai kebutuhan

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Ready for Implementation
