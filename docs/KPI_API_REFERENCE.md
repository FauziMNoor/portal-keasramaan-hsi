# 🔧 API Reference - Sistem KPI

## 📋 Daftar Isi
- [Overview](#overview)
- [Jadwal Libur API](#jadwal-libur-api)
- [Rapat Koordinasi API](#rapat-koordinasi-api)
- [Log Kolaborasi API](#log-kolaborasi-api)
- [KPI Calculation API](#kpi-calculation-api)
- [Dashboard API](#dashboard-api)

---

## Overview

Base URL: `/api/kpi`

**Authentication:** Required (session-based)

**Response Format:**
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

---

## Jadwal Libur API

### 1. Get Jadwal Libur

**Endpoint:** `GET /api/kpi/jadwal-libur`

**Query Parameters:**
- `cabang` (required): Nama cabang
- `bulan` (optional): Bulan (1-12)
- `tahun` (optional): Tahun (2024, 2025, dst)
- `musyrif` (optional): Nama musyrif

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: "uuid",
      nama_musyrif: "Ustadz Ahmad",
      cabang: "Pusat",
      asrama: "Asrama A",
      tanggal_mulai: "2024-11-02",
      tanggal_selesai: "2024-11-03",
      jenis_libur: "rutin",
      musyrif_pengganti: "Ustadz Budi",
      status: "approved"
    }
  ]
}
```

---

### 2. Generate Jadwal Libur Rutin

**Endpoint:** `POST /api/kpi/jadwal-libur/generate-rutin`

**Body:**
```typescript
{
  cabang: string;
  bulan: number; // 1-12
  tahun: number; // 2024, 2025
}
```

**Logic:**
1. Get semua musyrif aktif di cabang
2. Bagi musyrif jadi 2 grup (random)
3. Generate jadwal Sabtu-Ahad (2 pekan sekali)
4. Grup 1: Libur minggu 1 & 3
5. Grup 2: Libur minggu 2 & 4
6. Auto-assign musyrif pengganti

**Response:**
```typescript
{
  success: true,
  data: {
    total_generated: 20,
    jadwal: [...]
  },
  message: "Jadwal libur rutin berhasil di-generate"
}
```

---

### 3. Create Jadwal Libur (Cuti/Izin)

**Endpoint:** `POST /api/kpi/jadwal-libur`

**Body:**
```typescript
{
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  tanggal_mulai: string; // YYYY-MM-DD
  tanggal_selesai: string;
  jenis_libur: "cuti" | "sakit" | "izin";
  keterangan: string;
  musyrif_pengganti: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: { id: "uuid", ... },
  message: "Pengajuan cuti berhasil dibuat"
}
```

---

### 4. Approve/Reject Cuti

**Endpoint:** `PATCH /api/kpi/jadwal-libur/:id/approve`

**Body:**
```typescript
{
  action: "approve" | "reject";
  role: "kepala_asrama" | "kepala_sekolah";
  approved_by: string;
  rejection_reason?: string; // Required if action = "reject"
}
```

**Response:**
```typescript
{
  success: true,
  message: "Cuti berhasil di-approve"
}
```

---

## Rapat Koordinasi API

### 1. Get Rapat

**Endpoint:** `GET /api/kpi/rapat`

**Query Parameters:**
- `cabang` (required)
- `bulan` (optional)
- `tahun` (optional)

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: "uuid",
      tanggal: "2024-11-05",
      waktu: "14:00",
      jenis_rapat: "mingguan",
      cabang: "Pusat",
      agenda: "Evaluasi mingguan",
      kehadiran: [
        {
          nama_musyrif: "Ustadz Ahmad",
          status_kehadiran: "hadir"
        }
      ]
    }
  ]
}
```

---

### 2. Create Rapat

**Endpoint:** `POST /api/kpi/rapat`

**Body:**
```typescript
{
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:MM
  jenis_rapat: "mingguan" | "bulanan" | "evaluasi" | "darurat";
  cabang: string;
  kepala_asrama: string;
  musyrif_list: string[]; // Array of musyrif names
  agenda: string;
}
```

---

### 3. Input Kehadiran

**Endpoint:** `POST /api/kpi/rapat/:id/kehadiran`

**Body:**
```typescript
{
  kehadiran: [
    {
      nama_musyrif: string;
      status_kehadiran: "hadir" | "izin" | "alpha";
      keterangan?: string;
    }
  ]
}
```

---

## Log Kolaborasi API

### 1. Get Log Kolaborasi

**Endpoint:** `GET /api/kpi/kolaborasi`

**Query Parameters:**
- `musyrif` (optional)
- `cabang` (optional)
- `bulan` (optional)
- `tahun` (optional)

---

### 2. Create Log Kolaborasi

**Endpoint:** `POST /api/kpi/kolaborasi`

**Body:**
```typescript
{
  tanggal: string;
  nama_musyrif: string;
  cabang: string;
  asrama: string;
  jenis: "sharing_tips" | "bantuan_rekan" | "feedback" | "program_bersama" | "menitipkan_asrama";
  deskripsi: string;
  kolaborator: string[]; // Array of musyrif names
}
```

---

### 3. Rate Kolaborasi (Kepala Asrama)

**Endpoint:** `PATCH /api/kpi/kolaborasi/:id/rate`

**Body:**
```typescript
{
  rating: number; // 1-5
  catatan_penilaian: string;
}
```

---

## KPI Calculation API

### 1. Calculate KPI Musyrif

**Endpoint:** `POST /api/kpi/calculate/musyrif`

**Body:**
```typescript
{
  nama_musyrif: string;
  cabang: string;
  bulan: number; // 1-12
  tahun: number; // 2024, 2025
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    nama_musyrif: "Ustadz Ahmad",
    periode: "2024-11-30",
    hari_kerja_efektif: 26,
    tier1: {
      ubudiyah: 24.0,
      akhlaq: 8.8,
      kedisiplinan: 9.2,
      kebersihan: 4.7,
      total: 46.7
    },
    tier2: {
      jurnal: 10.0,
      habit_tracker: 10.0,
      koordinasi: 5.0,
      catatan_perilaku: 5.0,
      total: 30.0
    },
    tier3: {
      completion_rate: 9.5,
      kehadiran: 4.9,
      engagement: 3.0,
      total: 17.4
    },
    total_score: 94.1,
    ranking: 1,
    total_musyrif: 10
  }
}
```

---

### 2. Calculate KPI Kepala Asrama

**Endpoint:** `POST /api/kpi/calculate/kepala-asrama`

**Body:**
```typescript
{
  nama_kepala_asrama: string;
  cabang: string;
  bulan: number;
  tahun: number;
}
```

---

### 3. Batch Calculate (End of Month)

**Endpoint:** `POST /api/kpi/calculate/batch`

**Body:**
```typescript
{
  cabang: string; // "all" untuk semua cabang
  bulan: number;
  tahun: number;
}
```

**Logic:**
1. Get semua musyrif aktif
2. Calculate KPI masing-masing
3. Calculate ranking
4. Save ke `kpi_summary_keasramaan`
5. Send notifikasi

---

## Dashboard API

### 1. Get KPI Dashboard Musyrif

**Endpoint:** `GET /api/kpi/dashboard/musyrif/:nama`

**Query Parameters:**
- `periode` (optional): YYYY-MM (default: current month)

**Response:**
```typescript
{
  success: true,
  data: {
    current_month: { ... },
    trend_3_months: [ ... ],
    area_improvement: [ ... ],
    recommendations: [ ... ]
  }
}
```

---

### 2. Get KPI Dashboard Kepala Asrama

**Endpoint:** `GET /api/kpi/dashboard/kepala-asrama/:nama`

---

### 3. Get KPI Dashboard Global (Kepala Sekolah)

**Endpoint:** `GET /api/kpi/dashboard/global`

**Query Parameters:**
- `periode` (optional)

**Response:**
```typescript
{
  success: true,
  data: {
    per_cabang: [
      {
        cabang: "Pusat",
        avg_score: 90.5,
        total_musyrif: 10,
        top_musyrif: [ ... ],
        need_attention: [ ... ]
      }
    ],
    top_5_global: [ ... ],
    bottom_5_global: [ ... ]
  }
}
```

---

## Helper Functions

### Get Hari Kerja Efektif

```typescript
async function getHariKerjaEfektif(
  namaMusyrif: string,
  startDate: string,
  endDate: string
): Promise<number> {
  // 1. Get total hari dalam periode
  const totalHari = getDaysInMonth(startDate, endDate);
  
  // 2. Get hari libur musyrif
  const { data: jadwalLibur } = await supabase
    .from('jadwal_libur_musyrif_keasramaan')
    .select('tanggal_mulai, tanggal_selesai')
    .eq('nama_musyrif', namaMusyrif)
    .eq('status', 'approved_kepala_sekolah')
    .or(`and(tanggal_mulai.gte.${startDate},tanggal_mulai.lte.${endDate}),and(tanggal_selesai.gte.${startDate},tanggal_selesai.lte.${endDate})`);
  
  // 3. Hitung total hari libur
  let totalHariLibur = 0;
  jadwalLibur?.forEach(libur => {
    const start = new Date(libur.tanggal_mulai);
    const end = new Date(libur.tanggal_selesai);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    totalHariLibur += diffDays;
  });
  
  return totalHari - totalHariLibur;
}
```

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Ready for Implementation
