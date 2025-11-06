# ✨ Feature: Custom Poin untuk Pelanggaran

## 🎯 Overview

Fitur baru yang memungkinkan user untuk **menginput poin custom** pada catatan pelanggaran, selain menggunakan level dampak default yang sudah ada.

## 🔧 Implementation

### Before (Hanya Level Dampak Default):
```
User harus memilih dari dropdown level dampak:
- Ringan (5 poin)
- Sedang (10 poin)
- Berat (15 poin)
- Sangat Berat (20 poin)

❌ Tidak bisa input poin custom jika ada pertimbangan lain
```

### After (Dengan Custom Poin):
```
User bisa memilih:
1. ✅ Level Dampak Default (dropdown)
   - Ringan (5 poin)
   - Sedang (10 poin)
   - Berat (15 poin)
   - Sangat Berat (20 poin)

ATAU

2. ✅ Custom Poin (input manual)
   - User centang checkbox "Gunakan Poin Custom"
   - Input nilai positif (misal: 7, 12, 25)
   - Sistem otomatis mengubah menjadi negatif (misal: -7, -12, -25)
```

---

## 📋 Features

### 1. **Checkbox Toggle**
- Checkbox "Gunakan Poin Custom" dengan label informatif
- Background biru untuk highlight
- Tooltip: "(Jika memiliki pertimbangan nilai lain)"

### 2. **Conditional Display**
- **Jika checkbox TIDAK dicentang:**
  - Tampil dropdown level dampak default
  - Tampil info card dengan nama level & deskripsi
  - Poin otomatis dari level yang dipilih

- **Jika checkbox DICENTANG:**
  - Tampil input number untuk poin custom
  - Placeholder: "Masukkan nilai poin (misal: 7, 12, 25)"
  - Helper text: "(akan menjadi minus)"
  - Info: "💡 Masukkan nilai positif, sistem akan otomatis mengubahnya menjadi negatif"
  - Tampil info card dengan poin negatif yang akan disimpan
  - Min value: 1 (akan disimpan sebagai negatif)

### 3. **Smart Reset**
- Saat toggle checkbox:
  - Jika ke custom → Reset level_dampak_id
  - Jika ke default → Reset poin_custom
- Setelah submit berhasil → Reset semua termasuk checkbox

### 4. **Validation**
- Jika pakai default → Wajib pilih level dampak
- Jika pakai custom → Wajib input poin > 0
- Alert jelas jika validation gagal

### 5. **Database Storage**
- Jika custom poin:
  - `poin` = nilai custom
  - `level_dampak` = "Custom Poin"
  - `level_dampak_id` = null
- Jika level dampak default:
  - `poin` = dari level yang dipilih
  - `level_dampak` = nama level
  - `level_dampak_id` = ID level

---

## 🎨 UI/UX

### Checkbox Section:
```
┌─────────────────────────────────────────────────────────┐
│ ☑ Gunakan Poin Custom                                   │
│   (Jika memiliki pertimbangan nilai lain)               │
└─────────────────────────────────────────────────────────┘
```

### Default Mode (Dropdown):
```
┌─────────────────────────────────────────────────────────┐
│ Level Dampak *                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Pilih Level Dampak ▼                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Sedang                                          10  │ │
│ │ Pelanggaran dengan dampak sedang                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Custom Mode (Input):
```
┌─────────────────────────────────────────────────────────┐
│ Level Dampak *                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Masukkan nilai poin (misal: 7, 12, 25)             │ │
│ │                              (akan menjadi minus) → │ │
│ └─────────────────────────────────────────────────────┘ │
│ 💡 Masukkan nilai positif, sistem akan otomatis        │
│    mengubahnya menjadi negatif untuk pelanggaran       │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Poin Custom                                    -12  │ │
│ │ Poin yang akan diberikan berdasarkan pertimbangan  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Code Changes

### 1. **State Management**
```typescript
const [formData, setFormData] = useState({
  nis: '',
  kategori_id: '',
  nama_pelanggaran_kebaikan: '',
  level_dampak_id: '',
  poin_kebaikan: 0,
  poin_custom: 0, // ✅ NEW
  deskripsi_tambahan: '',
});

const [useCustomPoin, setUseCustomPoin] = useState(false); // ✅ NEW
```

### 2. **Validation Logic**
```typescript
if (tipe === 'pelanggaran') {
  if (!useCustomPoin && !formData.level_dampak_id) {
    alert('Mohon pilih level dampak untuk pelanggaran!');
    return;
  }
  if (useCustomPoin && (!formData.poin_custom || formData.poin_custom <= 0)) {
    alert('Mohon masukkan poin custom yang valid!');
    return;
  }
}
```

### 3. **Auto-Negative Conversion**
```typescript
// Input handler - otomatis convert ke negatif
onChange={(e) => {
  const value = parseInt(e.target.value) || 0;
  // ✅ Simpan sebagai negatif untuk pelanggaran
  setFormData({ ...formData, poin_custom: -Math.abs(value) });
}}

// Display - tampilkan nilai absolut di input
value={Math.abs(formData.poin_custom)}
```

### 4. **Poin Calculation**
```typescript
if (tipe === 'pelanggaran') {
  if (useCustomPoin) {
    // ✅ Gunakan poin custom (sudah negatif)
    poin = formData.poin_custom; // misal: -12
    levelDampak = 'Custom Poin';
    levelDampakId = null;
  } else {
    // Gunakan level dampak default (sudah negatif)
    const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
    poin = level.poin; // misal: -15
    levelDampak = level.nama_level;
    levelDampakId = level.id;
  }
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Menggunakan Level Dampak Default
1. Buka form token pelanggaran
2. Pilih santri
3. Pilih kategori perilaku
4. Input nama pelanggaran
5. **JANGAN centang** "Gunakan Poin Custom"
6. Pilih level dampak dari dropdown (misal: Sedang - 10 poin)
7. Submit
8. **Expected:** ✅ Data tersimpan dengan poin 10, level_dampak = "Sedang"

### Scenario 2: Menggunakan Custom Poin
1. Buka form token pelanggaran
2. Pilih santri
3. Pilih kategori perilaku
4. Input nama pelanggaran
5. **CENTANG** "Gunakan Poin Custom"
6. Input nilai positif (misal: 12)
7. **Expected:** ✅ Preview menampilkan poin -12 (negatif)
8. Submit
9. **Expected:** ✅ Data tersimpan dengan poin -12, level_dampak = "Custom Poin"

### Scenario 3: Toggle Between Modes
1. Pilih level dampak "Berat (-30 poin)"
2. Centang "Gunakan Poin Custom"
3. **Expected:** ✅ Dropdown hilang, muncul input number, level dampak ter-reset
4. Input nilai 20 → Preview menampilkan -20
5. Uncheck "Gunakan Poin Custom"
6. **Expected:** ✅ Input hilang, muncul dropdown, poin custom ter-reset

### Scenario 4: Validation
1. Centang "Gunakan Poin Custom"
2. Kosongkan input atau isi 0
3. Submit
4. **Expected:** ✅ Alert "Mohon masukkan poin custom yang valid (harus negatif untuk pelanggaran)!"

### Scenario 5: Auto Negative Conversion
1. Centang "Gunakan Poin Custom"
2. Input nilai 15
3. **Expected:** ✅ Preview card menampilkan -15 (otomatis negatif)
4. Submit
5. **Expected:** ✅ Data tersimpan dengan poin -15

---

## 📊 Database Impact

### Table: `catatan_perilaku_keasramaan`

**Existing Columns (No Changes):**
- `poin` (integer) - Menyimpan nilai poin (dari level atau custom)
- `level_dampak` (text) - Nama level atau "Custom Poin"
- `level_dampak_id` (uuid) - ID level atau null jika custom

**Data Examples:**

| poin | level_dampak | level_dampak_id | Keterangan |
|------|--------------|-----------------|------------|
| -15  | Sedang       | uuid-123        | Level default (negatif) |
| -12  | Custom Poin  | null            | Custom poin (negatif) |
| -30  | Berat        | uuid-456        | Level default (negatif) |
| -25  | Custom Poin  | null            | Custom poin (negatif) |

**PENTING:** Semua poin pelanggaran disimpan sebagai **nilai negatif** untuk mengurangi total poin santri.

---

## ✅ Benefits

1. **Flexibility** - User bisa sesuaikan poin dengan kondisi spesifik
2. **User-Friendly** - Toggle mudah antara default dan custom
3. **Clear Indication** - Jelas terlihat mana yang custom dan mana yang default
4. **Data Integrity** - Validation memastikan data valid
5. **Backward Compatible** - Tidak mengubah struktur database existing

---

## 🚀 Status

**Implementation:** ✅ Complete  
**Testing:** Ready to test  
**Documentation:** ✅ Complete

---

**Created:** 2025-11-02  
**Feature Type:** Enhancement  
**Impact:** Medium (UI/UX improvement)
