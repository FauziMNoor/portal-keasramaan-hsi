# Update: Form Input Catatan Perilaku

## 📋 Overview

Form input catatan perilaku di dashboard (`/catatan-perilaku/input`) telah diupdate untuk menyesuaikan dengan form token publik (`/catatan-perilaku/form/[token]`).

## 🎯 Tujuan Update

Menyamakan fitur dan field antara form dashboard dengan form token publik agar konsisten dan memiliki fitur yang sama.

## ✨ Fitur Baru yang Ditambahkan

### 1. Custom Poin untuk Pelanggaran

**Sebelumnya:**
- Hanya bisa memilih level dampak yang sudah ditentukan (Ringan, Sedang, Berat, dll.)
- Tidak ada opsi untuk memberikan poin custom

**Sekarang:**
- ✅ Checkbox "Gunakan Poin Custom"
- ✅ Jika dicentang, bisa input poin custom (bebas)
- ✅ Jika tidak dicentang, tetap menggunakan level dampak default
- ✅ Validasi: poin custom harus negatif untuk pelanggaran

### 2. UI/UX Improvements

**Checkbox Custom Poin:**
```
☑️ Gunakan Poin Custom (Jika memiliki pertimbangan nilai lain)
```

**Input Custom Poin:**
- Input number untuk masukkan nilai poin
- Placeholder: "Masukkan nilai poin (misal: 7, 12, 25)"
- Otomatis dikonversi ke negatif untuk pelanggaran
- Preview poin yang akan diberikan

**Preview Box:**
```
┌─────────────────────────────────────┐
│ Poin Custom                         │
│ Poin yang akan diberikan            │
│ berdasarkan pertimbangan Anda       │
│                              -12    │
└─────────────────────────────────────┘
```

## 🔄 Perubahan Detail

### File Modified: `app/catatan-perilaku/input/page.tsx`

#### 1. State Management

**Ditambahkan:**
```typescript
const [useCustomPoin, setUseCustomPoin] = useState(false);

const [formData, setFormData] = useState({
  // ... existing fields
  poin_custom: 0, // ✨ NEW
});
```

#### 2. Validation Logic

**Sebelumnya:**
```typescript
if (tipe === 'pelanggaran' && !formData.level_dampak_id) {
  alert('Mohon pilih level dampak untuk pelanggaran!');
  return;
}
```

**Sekarang:**
```typescript
if (tipe === 'pelanggaran') {
  if (!useCustomPoin && !formData.level_dampak_id) {
    alert('Mohon pilih level dampak untuk pelanggaran!');
    return;
  }
  if (useCustomPoin && (!formData.poin_custom || formData.poin_custom >= 0)) {
    alert('Mohon masukkan poin custom yang valid (harus negatif untuk pelanggaran)!');
    return;
  }
}
```

#### 3. Poin Calculation Logic

**Sebelumnya:**
```typescript
if (tipe === 'pelanggaran') {
  const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
  if (!level) throw new Error('Level dampak tidak ditemukan');
  poin = level.poin;
  levelDampak = level.nama_level;
  levelDampakId = level.id;
}
```

**Sekarang:**
```typescript
if (tipe === 'pelanggaran') {
  if (useCustomPoin) {
    // Gunakan poin custom
    poin = formData.poin_custom;
    levelDampak = 'Custom Poin';
    levelDampakId = null;
  } else {
    // Gunakan level dampak default
    const level = levelDampakList.find(l => l.id === formData.level_dampak_id);
    if (!level) throw new Error('Level dampak tidak ditemukan');
    poin = level.poin;
    levelDampak = level.nama_level;
    levelDampakId = level.id;
  }
}
```

#### 4. UI Component

**Ditambahkan Checkbox:**
```tsx
<div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
  <input
    type="checkbox"
    id="useCustomPoin"
    checked={useCustomPoin}
    onChange={(e) => {
      setUseCustomPoin(e.target.checked);
      if (e.target.checked) {
        setFormData({ ...formData, level_dampak_id: '', poin_custom: 0 });
      } else {
        setFormData({ ...formData, poin_custom: 0 });
      }
    }}
    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
  <label htmlFor="useCustomPoin" className="text-sm text-blue-700 cursor-pointer">
    <span className="font-semibold">Gunakan Poin Custom</span>
    <span className="text-blue-600 ml-1">(Jika memiliki pertimbangan nilai lain)</span>
  </label>
</div>
```

**Conditional Rendering:**
```tsx
{!useCustomPoin ? (
  // Dropdown Level Dampak Default
  <select>...</select>
) : (
  // Input Custom Poin
  <input type="number" ... />
)}
```

#### 5. Reset Form Logic

**Updated:**
```typescript
setFormData({
  nis: '',
  kategori_id: '',
  nama_pelanggaran_kebaikan: '',
  level_dampak_id: '',
  poin_kebaikan: 0,
  poin_custom: 0, // ✨ Reset custom poin
  deskripsi_tambahan: '',
});
setUseCustomPoin(false); // ✨ Reset checkbox
```

## 📊 Comparison: Before vs After

### Before Update

```
┌─────────────────────────────────────┐
│ Level Dampak *                      │
│ ┌─────────────────────────────────┐ │
│ │ Pilih Level Dampak            ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Options:                            │
│ - Ringan (-5 poin)                  │
│ - Sedang (-10 poin)                 │
│ - Berat (-15 poin)                  │
│ - Sangat Berat (-20 poin)           │
└─────────────────────────────────────┘
```

### After Update

```
┌─────────────────────────────────────┐
│ Level Dampak *                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☑️ Gunakan Poin Custom          │ │
│ │ (Jika memiliki pertimbangan     │ │
│ │  nilai lain)                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ IF NOT CHECKED:                     │
│ ┌─────────────────────────────────┐ │
│ │ Pilih Level Dampak            ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ IF CHECKED:                         │
│ ┌─────────────────────────────────┐ │
│ │ Masukkan nilai poin...          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Preview:                            │
│ ┌─────────────────────────────────┐ │
│ │ Poin Custom              -12    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🎯 Use Cases

### Use Case 1: Pelanggaran dengan Level Dampak Standard

**Scenario:** Santri terlambat shalat subuh (pelanggaran ringan)

**Steps:**
1. Pilih tipe "Pelanggaran"
2. Pilih santri
3. Pilih kategori "Keterlambatan Ibadah"
4. Isi nama pelanggaran: "Terlambat Shalat Subuh"
5. **Jangan centang** "Gunakan Poin Custom"
6. Pilih level dampak: "Ringan (-5 poin)"
7. Simpan

**Result:** Poin -5 tercatat dengan level dampak "Ringan"

---

### Use Case 2: Pelanggaran dengan Poin Custom

**Scenario:** Santri melakukan pelanggaran yang tidak pas dengan level dampak yang ada (misal: perlu -12 poin)

**Steps:**
1. Pilih tipe "Pelanggaran"
2. Pilih santri
3. Pilih kategori "Pelanggaran Lainnya"
4. Isi nama pelanggaran: "Tidak Mengikuti Kajian Wajib"
5. **Centang** "Gunakan Poin Custom"
6. Input poin: 12 (otomatis jadi -12)
7. Simpan

**Result:** Poin -12 tercatat dengan level dampak "Custom Poin"

---

### Use Case 3: Kebaikan (Tidak Berubah)

**Scenario:** Santri menjadi imam shalat maghrib

**Steps:**
1. Pilih tipe "Kebaikan"
2. Pilih santri
3. Pilih kategori "Kebaikan Ibadah"
4. Isi nama kebaikan: "Menjadi Imam Shalat Maghrib"
5. Input poin kebaikan: 10
6. Simpan

**Result:** Poin +10 tercatat

## 🔍 Testing Checklist

### Test 1: Pelanggaran - Level Dampak Default
- [ ] Pilih tipe "Pelanggaran"
- [ ] Jangan centang "Gunakan Poin Custom"
- [ ] Pilih level dampak dari dropdown
- [ ] Verifikasi preview poin muncul
- [ ] Submit form
- [ ] Verifikasi data tersimpan dengan level dampak yang dipilih

### Test 2: Pelanggaran - Custom Poin
- [ ] Pilih tipe "Pelanggaran"
- [ ] Centang "Gunakan Poin Custom"
- [ ] Verifikasi dropdown level dampak hilang
- [ ] Input poin custom (misal: 12)
- [ ] Verifikasi preview menampilkan -12
- [ ] Submit form
- [ ] Verifikasi data tersimpan dengan level dampak "Custom Poin"

### Test 3: Toggle Checkbox
- [ ] Centang "Gunakan Poin Custom"
- [ ] Input poin custom
- [ ] Uncheck checkbox
- [ ] Verifikasi poin custom ter-reset
- [ ] Verifikasi dropdown level dampak muncul kembali

### Test 4: Validation
- [ ] Centang "Gunakan Poin Custom"
- [ ] Jangan isi poin custom
- [ ] Submit form
- [ ] Verifikasi muncul alert validasi
- [ ] Isi poin custom dengan 0
- [ ] Submit form
- [ ] Verifikasi muncul alert validasi

### Test 5: Kebaikan (Tidak Terpengaruh)
- [ ] Pilih tipe "Kebaikan"
- [ ] Verifikasi tidak ada checkbox custom poin
- [ ] Input poin kebaikan normal
- [ ] Submit form
- [ ] Verifikasi data tersimpan dengan benar

### Test 6: Reset Form
- [ ] Isi form lengkap dengan custom poin
- [ ] Submit form
- [ ] Verifikasi form ter-reset
- [ ] Verifikasi checkbox custom poin ter-uncheck
- [ ] Verifikasi poin custom ter-reset ke 0

## 📝 Database Impact

### Table: `catatan_perilaku_keasramaan`

**Field yang Terpengaruh:**
- `level_dampak`: Akan berisi "Custom Poin" jika menggunakan custom poin
- `level_dampak_id`: Akan berisi `null` jika menggunakan custom poin
- `poin`: Akan berisi nilai custom yang diinput

**Example Data:**

**Standard Level Dampak:**
```json
{
  "level_dampak": "Ringan",
  "level_dampak_id": "uuid-level-ringan",
  "poin": -5
}
```

**Custom Poin:**
```json
{
  "level_dampak": "Custom Poin",
  "level_dampak_id": null,
  "poin": -12
}
```

## 🎨 UI Screenshots (Conceptual)

### Standard Mode (Checkbox Unchecked)
```
┌──────────────────────────────────────────────┐
│ Level Dampak *                               │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ☐ Gunakan Poin Custom                    │ │
│ │ (Jika memiliki pertimbangan nilai lain)  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Pilih Level Dampak                     ▼ │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Ringan                                   │ │
│ │ Poin yang akan diberikan untuk           │ │
│ │ pelanggaran ringan                 -5    │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Custom Mode (Checkbox Checked)
```
┌──────────────────────────────────────────────┐
│ Level Dampak *                               │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ☑️ Gunakan Poin Custom                    │ │
│ │ (Jika memiliki pertimbangan nilai lain)  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 12                                       │ │
│ │ Masukkan nilai poin (misal: 7, 12, 25)  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Poin Custom                              │ │
│ │ Poin yang akan diberikan berdasarkan     │ │
│ │ pertimbangan Anda                  -12   │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## ✅ Benefits

1. **Fleksibilitas:** User bisa memberikan poin sesuai pertimbangan khusus
2. **Konsistensi:** Form dashboard dan form token publik sekarang sama
3. **User Experience:** Lebih intuitif dengan checkbox dan preview poin
4. **Validasi:** Mencegah input poin yang tidak valid

## 🚀 Deployment Notes

1. **No Database Migration Required:** Tidak ada perubahan struktur database
2. **Backward Compatible:** Data lama tetap bisa dibaca dengan normal
3. **Testing Required:** Lakukan testing sesuai checklist di atas
4. **User Training:** Informasikan user tentang fitur baru custom poin

## 📞 Support

Jika ada pertanyaan atau issue terkait update ini:
1. Cek dokumentasi ini terlebih dahulu
2. Test di environment development
3. Hubungi tim development jika ada masalah

---

**Last Updated:** 6 November 2025  
**Version:** 1.1  
**Status:** ✅ Completed
