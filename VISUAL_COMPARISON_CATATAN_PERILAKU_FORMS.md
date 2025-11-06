# Visual Comparison: Form Catatan Perilaku

## 📊 Overview

Dokumen ini menunjukkan perbandingan visual antara form catatan perilaku sebelum dan sesudah update.

---

## 🔄 Before vs After

### BEFORE UPDATE ❌

```
┌─────────────────────────────────────────────────────────┐
│  INPUT CATATAN PERILAKU - Dashboard                     │
└─────────────────────────────────────────────────────────┘

Form Input Pelanggaran:

1. Pilih Santri: [Dropdown ▼]
2. Kategori: [Dropdown ▼]
3. Nama Pelanggaran: [Text Input]
4. Level Dampak: [Dropdown ▼]
   - Ringan (-5 poin)
   - Sedang (-10 poin)
   - Berat (-15 poin)
   - Sangat Berat (-20 poin)
5. Deskripsi Tambahan: [Textarea]

[Simpan Catatan]

❌ MASALAH:
- Tidak bisa input poin custom
- Terbatas pada level dampak yang sudah ada
- Tidak fleksibel untuk kasus khusus
```

### AFTER UPDATE ✅

```
┌─────────────────────────────────────────────────────────┐
│  INPUT CATATAN PERILAKU - Dashboard                     │
└─────────────────────────────────────────────────────────┘

Form Input Pelanggaran:

1. Pilih Santri: [Dropdown ▼]
2. Kategori: [Dropdown ▼]
3. Nama Pelanggaran: [Text Input]
4. Level Dampak:
   
   ┌─────────────────────────────────────────────────────┐
   │ ☑️ Gunakan Poin Custom                              │
   │ (Jika memiliki pertimbangan nilai lain)            │
   └─────────────────────────────────────────────────────┘
   
   IF UNCHECKED:
   [Dropdown ▼]
   - Ringan (-5 poin)
   - Sedang (-10 poin)
   - Berat (-15 poin)
   - Sangat Berat (-20 poin)
   
   IF CHECKED:
   [Input Number: 12]
   
   ┌─────────────────────────────────────────────────────┐
   │ Poin Custom                                   -12   │
   │ Poin yang akan diberikan berdasarkan               │
   │ pertimbangan Anda                                   │
   └─────────────────────────────────────────────────────┘

5. Deskripsi Tambahan: [Textarea]

[Simpan Catatan]

✅ KEUNTUNGAN:
- Bisa input poin custom sesuai kebutuhan
- Fleksibel untuk kasus khusus
- Preview poin yang akan diberikan
- Tetap bisa pakai level dampak standard
```

---

## 🎯 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Level Dampak Standard | ✅ | ✅ |
| Custom Poin | ❌ | ✅ |
| Checkbox Toggle | ❌ | ✅ |
| Preview Poin | ✅ (Level saja) | ✅ (Level + Custom) |
| Validasi | ✅ | ✅ (Enhanced) |
| Fleksibilitas | ⚠️ Terbatas | ✅ Tinggi |

---

## 📱 UI Flow Comparison

### Flow 1: Standard Level Dampak (Sama di Before & After)

```
START
  ↓
Pilih Tipe: Pelanggaran
  ↓
Pilih Santri
  ↓
Pilih Kategori
  ↓
Isi Nama Pelanggaran
  ↓
Pilih Level Dampak dari Dropdown
  ↓
Preview Poin Muncul
  ↓
Submit
  ↓
Data Tersimpan dengan Level Dampak
  ↓
END
```

### Flow 2: Custom Poin (NEW - After Update Only)

```
START
  ↓
Pilih Tipe: Pelanggaran
  ↓
Pilih Santri
  ↓
Pilih Kategori
  ↓
Isi Nama Pelanggaran
  ↓
☑️ Centang "Gunakan Poin Custom"
  ↓
Dropdown Level Dampak HILANG
  ↓
Input Poin Custom (misal: 12)
  ↓
Preview Poin Muncul: -12
  ↓
Submit
  ↓
Data Tersimpan dengan "Custom Poin"
  ↓
END
```

---

## 🎨 Detailed UI Mockup

### Standard Mode (Checkbox Unchecked)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Nama Pelanggaran *                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Terlambat Shalat Subuh                               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Level Dampak *                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☐ Gunakan Poin Custom                                │ │
│  │ (Jika memiliki pertimbangan nilai lain)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Ringan (-5 poin)                                   ▼ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🔴 Ringan                                            │ │
│  │ Poin yang akan diberikan untuk pelanggaran ringan    │ │
│  │                                                  -5  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Deskripsi Tambahan                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              💾 Simpan Catatan                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Custom Mode (Checkbox Checked)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Nama Pelanggaran *                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Tidak Mengikuti Kajian Wajib                         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Level Dampak *                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☑️ Gunakan Poin Custom                                │ │
│  │ (Jika memiliki pertimbangan nilai lain)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 12                                                   │ │
│  │ Masukkan nilai poin (misal: 7, 12, 25)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🔴 Poin Custom                                       │ │
│  │ Poin yang akan diberikan berdasarkan pertimbangan    │ │
│  │ Anda                                            -12  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Deskripsi Tambahan                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Sudah diperingatkan 2x sebelumnya                    │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              💾 Simpan Catatan                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔀 Toggle Behavior

### Action: Check Checkbox

```
BEFORE CHECK:
┌─────────────────────────────────┐
│ ☐ Gunakan Poin Custom           │
└─────────────────────────────────┘
│
│ [Dropdown Level Dampak]
│ - Ringan (-5)
│ - Sedang (-10)
│ - Berat (-15)
│
▼

AFTER CHECK:
┌─────────────────────────────────┐
│ ☑️ Gunakan Poin Custom           │
└─────────────────────────────────┘
│
│ [Input Number: ___]
│ Masukkan nilai poin...
│
│ [Preview Box]
│ Poin Custom: -__
│
```

### Action: Uncheck Checkbox

```
BEFORE UNCHECK:
┌─────────────────────────────────┐
│ ☑️ Gunakan Poin Custom           │
└─────────────────────────────────┘
│
│ [Input Number: 12]
│
│ [Preview Box]
│ Poin Custom: -12
│
▼

AFTER UNCHECK:
┌─────────────────────────────────┐
│ ☐ Gunakan Poin Custom           │
└─────────────────────────────────┘
│
│ [Dropdown Level Dampak]
│ - Ringan (-5)
│ - Sedang (-10)
│ - Berat (-15)
│
│ (Custom poin ter-reset)
│
```

---

## 📊 Data Flow Comparison

### Standard Level Dampak

```
User Input:
├─ Santri: Ahmad (NIS: 12345)
├─ Kategori: Keterlambatan Ibadah
├─ Nama: Terlambat Shalat Subuh
├─ Level Dampak: Ringan (ID: uuid-ringan)
└─ Deskripsi: -

Database Record:
{
  "nis": "12345",
  "nama_siswa": "Ahmad",
  "kategori_perilaku_id": "uuid-kategori",
  "nama_kategori": "Keterlambatan Ibadah",
  "nama_pelanggaran_kebaikan": "Terlambat Shalat Subuh",
  "level_dampak": "Ringan",           ← From level_dampak table
  "level_dampak_id": "uuid-ringan",   ← Reference to level_dampak
  "poin": -5,                         ← From level_dampak.poin
  "deskripsi_tambahan": null
}
```

### Custom Poin

```
User Input:
├─ Santri: Ahmad (NIS: 12345)
├─ Kategori: Pelanggaran Lainnya
├─ Nama: Tidak Mengikuti Kajian Wajib
├─ ☑️ Custom Poin: 12
└─ Deskripsi: Sudah diperingatkan 2x

Database Record:
{
  "nis": "12345",
  "nama_siswa": "Ahmad",
  "kategori_perilaku_id": "uuid-kategori",
  "nama_kategori": "Pelanggaran Lainnya",
  "nama_pelanggaran_kebaikan": "Tidak Mengikuti Kajian Wajib",
  "level_dampak": "Custom Poin",      ← Static text
  "level_dampak_id": null,            ← No reference
  "poin": -12,                        ← User input (negated)
  "deskripsi_tambahan": "Sudah diperingatkan 2x"
}
```

---

## 🎯 Use Case Scenarios

### Scenario 1: Pelanggaran Standar

**Situation:** Santri terlambat shalat subuh (kasus umum)

**Before Update:**
```
✅ Bisa handle dengan baik
- Pilih level dampak "Ringan"
- Poin -5 otomatis
```

**After Update:**
```
✅ Tetap bisa handle dengan baik (tidak berubah)
- Pilih level dampak "Ringan"
- Poin -5 otomatis
```

**Verdict:** ✅ No regression, works as before

---

### Scenario 2: Pelanggaran Khusus

**Situation:** Santri melakukan pelanggaran yang perlu poin -12 (tidak ada di level dampak)

**Before Update:**
```
❌ Tidak bisa handle dengan tepat
- Harus pilih "Sedang" (-10) atau "Berat" (-15)
- Tidak akurat
```

**After Update:**
```
✅ Bisa handle dengan tepat
- Centang "Gunakan Poin Custom"
- Input 12
- Poin -12 tercatat akurat
```

**Verdict:** ✅ New capability, solves problem

---

### Scenario 3: Pelanggaran Berulang

**Situation:** Santri melakukan pelanggaran yang sama untuk ke-3 kalinya, perlu poin lebih besar

**Before Update:**
```
⚠️ Terbatas
- Hanya bisa pilih level dampak yang ada
- Misal: Ringan (-5) → Sedang (-10) → Berat (-15)
- Tidak bisa custom misal -18
```

**After Update:**
```
✅ Fleksibel
- Bisa custom poin sesuai kebutuhan
- Misal: -5 → -10 → -18 (custom)
- Lebih adil dan proporsional
```

**Verdict:** ✅ Better handling of progressive discipline

---

## 📈 Impact Analysis

### Positive Impacts ✅

1. **Fleksibilitas Tinggi**
   - User bisa memberikan poin sesuai pertimbangan
   - Tidak terbatas pada level dampak yang ada

2. **Konsistensi Sistem**
   - Form dashboard = Form token publik
   - Pengalaman user yang sama

3. **Keadilan**
   - Poin bisa disesuaikan dengan konteks
   - Pelanggaran berulang bisa diberi poin lebih besar

4. **User Experience**
   - Checkbox intuitif
   - Preview poin jelas
   - Validasi yang baik

### Potential Concerns ⚠️

1. **Penyalahgunaan**
   - User bisa memberikan poin terlalu besar/kecil
   - **Mitigation:** Training dan SOP yang jelas

2. **Inkonsistensi**
   - Poin custom bisa berbeda-beda untuk kasus serupa
   - **Mitigation:** Guideline penggunaan custom poin

3. **Reporting**
   - Data dengan "Custom Poin" perlu handling khusus di laporan
   - **Mitigation:** Filter dan grouping yang tepat

---

## 🔍 Technical Comparison

### Code Complexity

**Before:**
```typescript
// Simple validation
if (tipe === 'pelanggaran' && !formData.level_dampak_id) {
  alert('Mohon pilih level dampak!');
  return;
}

// Simple poin calculation
const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
poin = level.poin;
```

**After:**
```typescript
// Enhanced validation
if (tipe === 'pelanggaran') {
  if (!useCustomPoin && !formData.level_dampak_id) {
    alert('Mohon pilih level dampak!');
    return;
  }
  if (useCustomPoin && (!formData.poin_custom || formData.poin_custom >= 0)) {
    alert('Mohon masukkan poin custom yang valid!');
    return;
  }
}

// Conditional poin calculation
if (useCustomPoin) {
  poin = formData.poin_custom;
  levelDampak = 'Custom Poin';
  levelDampakId = null;
} else {
  const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
  poin = level.poin;
  levelDampak = level.nama_level;
  levelDampakId = level.id;
}
```

**Verdict:** ⚠️ Slightly more complex, but manageable

---

## 📝 Summary

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| Flexibility | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |
| Consistency | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | +67% |
| Complexity | ⭐⭐ | ⭐⭐⭐ | +50% |
| User Control | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |
| Validation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | +25% |

**Overall:** ✅ **Significant Improvement**

---

**Last Updated:** 6 November 2025  
**Version:** 1.0
