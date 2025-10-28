# 🎨 Dashboard Style Guide - Clean & Elegant

## 📋 Design Principles

Semua chart dan komponen dashboard mengikuti prinsip **Clean & Elegant**:
- ❌ **NO ICONS/EMOJI** di header chart
- ✅ **Simple text headers** dengan hierarchy yang jelas
- ✅ **Minimal design** - hanya elemen yang penting
- ✅ **Consistent spacing** dan typography
- ✅ **Subtle colors** - tidak terlalu mencolok

---

## 🎯 Header Style (Standard untuk Semua Chart)

### ✅ **CORRECT - Clean Style:**
```tsx
<div className="mb-6">
  <h3 className="text-lg font-bold text-gray-700">Judul Chart</h3>
  <p className="text-xs text-gray-500 mt-1">Deskripsi singkat</p>
</div>
```

### ❌ **INCORRECT - Old Style:**
```tsx
<div className="flex items-center gap-2 mb-6">
  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
    <span className="text-2xl">📊</span>  {/* NO EMOJI! */}
  </div>
  <div>
    <h3>Judul Chart</h3>
    <p>Deskripsi</p>
  </div>
</div>
```

---

## 📊 Chart Components Style

### 1. **Top 10 Santri Terbaik** ✅
**Style:** Custom HTML Progress Bars

**Features:**
- Clean horizontal bars
- Label di kiri, nilai di kanan
- Persentase dalam kurung
- Hover effects
- No grid, no axis
- Warna berbeda per item

**Code Pattern:**
```tsx
<div className="space-y-4">
  {data.map((item, index) => (
    <div key={index} className="group">
      {/* Label & Value */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {item.nama}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {item.nilai}
          </span>
          <span className="text-xs text-gray-500">
            ({percentage}%)
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: COLORS[index],
          }}
        />
      </div>
    </div>
  ))}
</div>
```

---

### 2. **Perkembangan Nilai Habit** ✅
**Style:** Radial Bar Chart (Donut)

**Features:**
- Multiple circular progress rings
- Center text: Persentase total (simple, no label)
- Legend di bawah
- No icon di header
- Warna berbeda per kategori

**Center Text:**
```tsx
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
  <p className="text-5xl font-bold text-gray-800">
    {totalPersentase}%
  </p>
</div>
```

---

### 3. **Profil Habit Santri** ✅
**Style:** Radar Chart

**Features:**
- Dual radar (Santri Terbaik vs Rata-rata)
- No icon di header
- Clean legend
- Subtle colors

---

### 4. **Stats Cards** ✅
**Style:** Gradient Cards with Icons

**Exception:** Stats cards BOLEH pakai icon karena:
- Icon terintegrasi dengan design card
- Gradient background yang colorful
- Icon memberikan visual identity

**Features:**
- Gradient backgrounds
- Icon di dalam card (bukan di header)
- Bold numbers
- Descriptive labels

---

## 🎨 Color Palette

### **Chart Colors:**
```
Primary: #10B981 (Green)
Secondary: #3B82F6 (Blue)
Accent 1: #F59E0B (Yellow)
Accent 2: #8B5CF6 (Purple)
Accent 3: #EC4899 (Pink)
```

### **Text Colors:**
```
Heading: text-gray-700 (#374151)
Body: text-gray-800 (#1F2937)
Subtitle: text-gray-500 (#6B7280)
Muted: text-gray-400 (#9CA3AF)
```

### **Background Colors:**
```
Card: bg-white
Border: border-gray-100
Progress BG: bg-gray-100
Hover: bg-gray-50
```

---

## 📏 Spacing & Typography

### **Spacing:**
```
Card Padding: p-6
Header Margin: mb-6
Item Spacing: space-y-4
Gap: gap-2, gap-4
```

### **Typography:**
```
Chart Title: text-lg font-bold text-gray-700
Subtitle: text-xs text-gray-500 mt-1
Value: text-sm font-bold text-gray-800
Label: text-sm font-medium text-gray-700
Percentage: text-xs text-gray-500
```

---

## ✅ Checklist untuk Chart Baru

Saat membuat chart baru, pastikan:

- [ ] ❌ **NO ICON/EMOJI** di header
- [ ] ✅ Header menggunakan pattern standard
- [ ] ✅ Warna dari palette yang sudah ditentukan
- [ ] ✅ Typography konsisten
- [ ] ✅ Spacing konsisten
- [ ] ✅ Hover effects untuk interaktivity
- [ ] ✅ Responsive design
- [ ] ✅ Clean & minimal - no unnecessary elements

---

## 🚫 Don'ts

1. ❌ Jangan pakai emoji/icon di header chart
2. ❌ Jangan pakai warna yang terlalu mencolok
3. ❌ Jangan pakai grid/axis jika tidak perlu
4. ❌ Jangan pakai gradient text (kecuali special case)
5. ❌ Jangan pakai shadow yang terlalu berat
6. ❌ Jangan pakai animation yang berlebihan

---

## ✅ Do's

1. ✅ Gunakan text header yang simple
2. ✅ Gunakan warna yang subtle dan professional
3. ✅ Gunakan whitespace dengan baik
4. ✅ Gunakan hover effects yang smooth
5. ✅ Gunakan typography hierarchy yang jelas
6. ✅ Gunakan consistent spacing

---

## 📱 Responsive Design

Semua chart harus responsive:
```tsx
// Grid layout
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  {/* Charts */}
</div>

// Full width untuk impact
<div className="mb-6">
  {/* Radar Chart */}
</div>
```

---

## 🎯 Summary

**Philosophy:** Less is More

Dashboard yang baik adalah dashboard yang:
- **Clean** - Tidak berantakan
- **Elegant** - Terlihat profesional
- **Functional** - Mudah dipahami
- **Consistent** - Pattern yang sama di semua komponen

**Remember:** Setiap elemen harus punya tujuan. Jika tidak perlu, hapus!

---

**Status**: ✅ Implemented & Documented
**Last Updated**: October 28, 2025
**Applies To**: All Dashboard Components
