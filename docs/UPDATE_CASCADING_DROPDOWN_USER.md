# ✅ Update Form User - Cascading Dropdown

## 🎯 Perubahan:
Menambahkan **cascading dropdown** dimana Asrama akan terfilter berdasarkan Lokasi yang dipilih.

---

## 📊 Sebelum vs Sesudah:

### **Sebelum:**
```
Lokasi: [Pilih Lokasi ▼]
        - HSI Boarding School Purworejo
        - HSI Boarding School Sukabumi

Asrama: [Pilih Asrama ▼]
        - Imam Bukhari (Purworejo)
        - Melati (Sukabumi)
        - Mawar (Sukabumi)
        - Al-Ghazali (Purworejo)
```
❌ Semua asrama muncul
❌ Bisa pilih asrama yang tidak sesuai lokasi

### **Sesudah:**
```
Lokasi: [HSI Boarding School Purworejo ▼]

Asrama: [Pilih Asrama ▼]
        - Imam Bukhari
        - Al-Ghazali
```
✅ Hanya asrama di Purworejo yang muncul
✅ Tidak bisa pilih asrama dari lokasi lain

---

## 🔧 Implementasi:

### **1. Tambah State untuk Filtered List:**

```typescript
const [filteredAsramaList, setFilteredAsramaList] = useState<any[]>([]);
```

### **2. Tambah useEffect untuk Filter:**

```typescript
useEffect(() => {
  if (formData.lokasi) {
    // Filter asrama berdasarkan lokasi
    const filtered = asramaList.filter(
      (asr) => asr.lokasi === formData.lokasi
    );
    setFilteredAsramaList(filtered);
    
    // Reset asrama jika tidak ada di filtered list
    if (formData.asrama && !filtered.find(a => a.asrama === formData.asrama)) {
      setFormData(prev => ({ ...prev, asrama: '' }));
    }
  } else {
    // Jika lokasi kosong, kosongkan filtered list dan asrama
    setFilteredAsramaList([]);
    setFormData(prev => ({ ...prev, asrama: '' }));
  }
}, [formData.lokasi, asramaList]);
```

### **3. Update Dropdown Asrama:**

```typescript
<select
  value={formData.asrama}
  onChange={(e) => setFormData({ ...formData, asrama: e.target.value })}
  className="... disabled:bg-gray-100 disabled:cursor-not-allowed"
  disabled={!formData.lokasi} // ← Disable jika lokasi belum dipilih
>
  <option value="">
    {!formData.lokasi ? 'Pilih Lokasi Dulu' : 'Pilih Asrama'}
  </option>
  {filteredAsramaList.map((asr) => ( // ← Gunakan filtered list
    <option key={asr.id} value={asr.asrama}>
      {asr.asrama}
    </option>
  ))}
</select>
```

---

## ✅ Fitur:

### **1. Cascading Filter:**
- ✅ Asrama terfilter berdasarkan Lokasi
- ✅ Hanya asrama yang sesuai lokasi yang muncul
- ✅ Auto-update saat lokasi berubah

### **2. Auto Reset:**
- ✅ Asrama di-reset saat lokasi berubah
- ✅ Asrama di-reset jika tidak ada di filtered list
- ✅ Mencegah data tidak konsisten

### **3. Disabled State:**
- ✅ Dropdown Asrama disabled jika Lokasi belum dipilih
- ✅ Visual feedback (background gray, cursor not-allowed)
- ✅ Placeholder berubah: "Pilih Lokasi Dulu"

---

## 🎯 Behavior:

### **Scenario 1: Pilih Lokasi Baru**
```
1. User pilih Lokasi: "Purworejo"
2. Asrama auto-filter → Hanya asrama Purworejo
3. Dropdown Asrama enabled
4. User bisa pilih asrama
```

### **Scenario 2: Ganti Lokasi**
```
1. User sudah pilih Lokasi: "Purworejo"
2. User sudah pilih Asrama: "Imam Bukhari"
3. User ganti Lokasi: "Sukabumi"
4. Asrama auto-reset → Kosong
5. Dropdown Asrama show asrama Sukabumi
6. User pilih asrama baru
```

### **Scenario 3: Kosongkan Lokasi**
```
1. User pilih Lokasi: "Purworejo"
2. User pilih Asrama: "Imam Bukhari"
3. User kosongkan Lokasi
4. Asrama auto-reset → Kosong
5. Dropdown Asrama disabled
```

---

## 📋 Data Structure:

### **Tabel Asrama:**
```sql
CREATE TABLE asrama_keasramaan (
  id UUID PRIMARY KEY,
  asrama TEXT NOT NULL,
  lokasi TEXT NOT NULL, -- ← Relasi dengan lokasi
  status TEXT DEFAULT 'aktif'
);
```

### **Contoh Data:**
```
| asrama         | lokasi                          |
|----------------|---------------------------------|
| Imam Bukhari   | HSI Boarding School Purworejo   |
| Al-Ghazali     | HSI Boarding School Purworejo   |
| Melati         | HSI Boarding School Sukabumi    |
| Mawar          | HSI Boarding School Sukabumi    |
```

---

## 🧪 Testing:

### **Test Cases:**

```
□ Pilih lokasi → Asrama terfilter
□ Ganti lokasi → Asrama reset & terfilter ulang
□ Kosongkan lokasi → Asrama reset & disabled
□ Pilih asrama dari filtered list → Tersimpan
□ Edit user dengan lokasi & asrama → Data load dengan benar
□ Dropdown disabled saat lokasi kosong
□ Placeholder berubah sesuai kondisi
□ Tidak ada asrama dari lokasi lain yang muncul
```

---

## 💡 Keuntungan:

### **1. Data Integrity:**
- ✅ Asrama selalu sesuai dengan Lokasi
- ✅ Tidak mungkin pilih asrama yang salah
- ✅ Data konsisten di database

### **2. User Experience:**
- ✅ Lebih mudah memilih (list lebih pendek)
- ✅ Tidak bingung dengan asrama dari lokasi lain
- ✅ Visual feedback yang jelas

### **3. Validation:**
- ✅ Built-in validation (tidak perlu validasi manual)
- ✅ Mencegah error input
- ✅ Reduce support tickets

---

## 🔄 Konsistensi:

Form user sekarang konsisten dengan form lain yang juga menggunakan cascading dropdown:
- ✅ **Data Siswa** - Lokasi → Kelas → Rombel → Asrama → Musyrif
- ✅ **Musyrif** - Lokasi → Kelas → Asrama
- ✅ **Kepala Asrama** - Lokasi → Asrama

Semua form menggunakan pattern yang sama!

---

## 📝 Notes:

### **Jika Tidak Ada Asrama di Lokasi:**
- Dropdown akan menampilkan hanya option "Pilih Asrama"
- User perlu input data asrama dulu untuk lokasi tersebut

### **Jika Edit User:**
- Lokasi & Asrama akan ter-load dengan benar
- Filtered list akan ter-populate otomatis
- User bisa ganti lokasi/asrama sesuai kebutuhan

---

## ✅ Summary:

**Problem:** Semua asrama muncul, bisa pilih yang tidak sesuai lokasi
**Solution:** Cascading dropdown dengan auto-filter
**Result:** Asrama terfilter berdasarkan lokasi, data konsisten

**File Updated:** `app/users/page.tsx`
**Status:** ✅ Complete
**Date:** 2025-10-29
