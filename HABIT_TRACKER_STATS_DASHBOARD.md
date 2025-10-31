# ✅ Statistik Habit Tracker - Dashboard Data

## 🎯 Fitur Baru:
Menambahkan **statistik input habit tracker** dengan chart area yang menampilkan tren dan perbandingan periode.

---

## 📊 Tampilan:

```
┌─────────────────────────────────────────────────────────┐
│ Statistik Input Habit Tracker        [2024/2025 ▼]     │
│ ↗ (+15%) dari periode sebelumnya                        │
│                                                          │
│ ● Periode Ini: 1.2k    ● Periode Lalu: 1.0k            │
│                                                          │
│ [Area Chart - 2 Lines dengan Gradient Fill]            │
│ - Green: Periode Ini                                    │
│ - Orange: Periode Lalu                                  │
│ - X-Axis: Jan - Dec                                     │
│ - Y-Axis: Jumlah Input                                  │
│                                                          │
│ Filter: [Semua Lokasi ▼] [Semua Asrama ▼]             │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Fitur:

### **1. Chart Area dengan Gradient:**
- ✅ 2 area lines (periode ini vs periode lalu)
- ✅ Gradient fill (green & orange)
- ✅ Smooth curves (monotone)
- ✅ Grid background
- ✅ Responsive design

### **2. Metrics Display:**
- ✅ Total periode ini (formatted: 1.2k)
- ✅ Total periode lalu (formatted: 1.0k)
- ✅ Persentase perubahan (+15% atau -10%)
- ✅ Icon trending up/down

### **3. Filters:**
- ✅ Dropdown Tahun Ajaran (di header)
- ✅ Dropdown Lokasi (di footer)
- ✅ Dropdown Asrama (di footer, disabled jika lokasi kosong)
- ✅ Cascading filter (asrama terfilter by lokasi)

### **4. Data Processing:**
- ✅ Group by month (Jan - Dec)
- ✅ Compare current vs previous tahun ajaran
- ✅ Calculate percentage change
- ✅ Format numbers (1000 → 1k)

---

## 🎨 Style (Sesuai Referensi):

### **Colors:**
- **Periode Ini:** Green (#10b981) dengan gradient
- **Periode Lalu:** Orange (#f59e0b) dengan gradient
- **Background:** White dengan shadow
- **Grid:** Light gray (#f0f0f0)

### **Typography:**
- **Title:** 2xl, bold, gray-800
- **Subtitle:** sm, medium, green/red (based on trend)
- **Metrics:** 2xl, bold, gray-800
- **Labels:** sm, gray-600

### **Components:**
- **Card:** rounded-2xl, shadow-md, padding-6
- **Dropdowns:** rounded-lg, border-gray-300
- **Chart:** height 320px, responsive

---

## 📊 Data Source:

### **Query:**
```typescript
supabase
  .from('formulir_habit_tracker_keasramaan')
  .select('tanggal, tahun_ajaran, lokasi, asrama')
  .eq('lokasi', lokasi) // if filtered
  .eq('asrama', asrama) // if filtered
```

### **Processing:**
1. Filter by tahun ajaran (current & previous)
2. Group by month (0-11)
3. Count entries per month
4. Calculate totals
5. Calculate percentage change

---

## 🔄 Behavior:

### **Default State:**
- Tahun Ajaran: Latest (auto-selected)
- Lokasi: Semua
- Asrama: Semua (disabled)
- Chart: Show all data

### **Filter Lokasi:**
- User pilih lokasi
- Chart update dengan data lokasi tersebut
- Asrama dropdown enabled & filtered
- Percentage recalculated

### **Filter Asrama:**
- User pilih asrama (after lokasi)
- Chart update dengan data asrama tersebut
- Percentage recalculated

### **Change Tahun Ajaran:**
- User pilih tahun ajaran baru
- Chart update dengan periode baru
- Compare dengan tahun ajaran sebelumnya
- Percentage recalculated

---

## 📈 Chart Details:

### **Area Chart (Recharts):**
```typescript
<AreaChart data={chartData}>
  <defs>
    <linearGradient id="colorCurrent">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
    </linearGradient>
    <linearGradient id="colorPrevious">
      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Area 
    type="monotone" 
    dataKey="currentPeriod" 
    stroke="#10b981" 
    fill="url(#colorCurrent)" 
  />
  <Area 
    type="monotone" 
    dataKey="previousPeriod" 
    stroke="#f59e0b" 
    fill="url(#colorPrevious)" 
  />
</AreaChart>
```

---

## 🧪 Testing:

### **Test Cases:**

```
□ Chart menampilkan data dengan benar
□ Periode ini vs periode lalu terlihat jelas
□ Persentase perubahan calculated correctly
□ Trending icon (up/down) sesuai dengan persentase
□ Filter tahun ajaran works
□ Filter lokasi works
□ Filter asrama works (cascading)
□ Chart responsive di mobile
□ Tooltip shows correct data
□ Numbers formatted correctly (1k, 2.5k)
□ Loading state shows spinner
□ No data state handled gracefully
```

---

## 💡 Insights yang Bisa Dilihat:

### **1. Tren Input:**
- Bulan mana yang paling banyak input
- Bulan mana yang paling sedikit input
- Pattern seasonal (awal/akhir semester)

### **2. Perbandingan Periode:**
- Apakah input meningkat atau menurun
- Berapa persen perubahannya
- Periode mana yang lebih konsisten

### **3. Per Lokasi/Asrama:**
- Lokasi mana yang paling aktif
- Asrama mana yang paling konsisten
- Identifikasi yang perlu improvement

---

## 📦 Dependencies:

### **Recharts:**
```bash
npm install recharts
```

**Features Used:**
- AreaChart
- Area
- XAxis, YAxis
- CartesianGrid
- Tooltip
- ResponsiveContainer
- LinearGradient

---

## 🎯 Posisi di Dashboard:

```
1. Header Identitas Sekolah
2. Stats Cards (6 cards)
3. Distribusi Santri per Lokasi
4. Struktur Pengurus Asrama
5. ✨ Statistik Habit Tracker (NEW!) ← Paling bawah
```

---

## 📝 Files:

### **Created:**
- `components/HabitTrackerStats.tsx` - Component statistik

### **Updated:**
- `app/page.tsx` - Import & render component

---

## ✅ Summary:

**Feature:** Statistik input habit tracker dengan chart
**Style:** Sesuai referensi (area chart dengan gradient)
**Filters:** Tahun Ajaran, Lokasi, Asrama
**Insights:** Tren, perbandingan, persentase perubahan

**Status:** ✅ Complete
**Date:** 2025-10-29
