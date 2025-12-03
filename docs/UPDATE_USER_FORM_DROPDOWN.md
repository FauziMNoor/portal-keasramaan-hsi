# ✅ Update Form User - Dropdown Lokasi & Asrama

## 🎯 Perubahan:
Mengubah field **Lokasi** dan **Asrama** dari text input menjadi dropdown yang mengambil data dari tabel master.

---

## 📊 Sebelum vs Sesudah:

### **Sebelum:**
```typescript
<input
  type="text"
  value={formData.lokasi}
  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
/>
```
❌ User harus ketik manual
❌ Bisa typo
❌ Tidak konsisten dengan data master

### **Sesudah:**
```typescript
<select
  value={formData.lokasi}
  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
>
  <option value="">Pilih Lokasi</option>
  {lokasiList.map((lok) => (
    <option key={lok.id} value={lok.lokasi}>
      {lok.lokasi}
    </option>
  ))}
</select>
```
✅ User pilih dari dropdown
✅ Tidak ada typo
✅ Konsisten dengan data master

---

## 🔧 Implementasi:

### **1. Tambah State untuk Master Data:**

```typescript
const [lokasiList, setLokasiList] = useState<any[]>([]);
const [asramaList, setAsramaList] = useState<any[]>([]);
```

### **2. Fetch Master Data:**

```typescript
const fetchMasterData = async () => {
  try {
    const [lokasi, asrama] = await Promise.all([
      supabase
        .from('lokasi_keasramaan')
        .select('*')
        .eq('status', 'aktif')
        .order('lokasi', { ascending: true }),
      supabase
        .from('asrama_keasramaan')
        .select('*')
        .eq('status', 'aktif')
        .order('asrama', { ascending: true }),
    ]);

    setLokasiList(lokasi.data || []);
    setAsramaList(asrama.data || []);
  } catch (error) {
    console.error('Error fetching master data:', error);
  }
};
```

### **3. Call di useEffect:**

```typescript
useEffect(() => {
  fetchUsers();
  fetchMasterData(); // ← Tambah ini
}, []);
```

### **4. Update Form Fields:**

**Lokasi Dropdown:**
```typescript
<select
  value={formData.lokasi}
  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
>
  <option value="">Pilih Lokasi</option>
  {lokasiList.map((lok) => (
    <option key={lok.id} value={lok.lokasi}>
      {lok.lokasi}
    </option>
  ))}
</select>
```

**Asrama Dropdown:**
```typescript
<select
  value={formData.asrama}
  onChange={(e) => setFormData({ ...formData, asrama: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
>
  <option value="">Pilih Asrama</option>
  {asramaList.map((asr) => (
    <option key={asr.id} value={asr.asrama}>
      {asr.asrama}
    </option>
  ))}
</select>
```

---

## ✅ Keuntungan:

### **1. Data Konsisten:**
- ✅ Lokasi & Asrama sesuai dengan data master
- ✅ Tidak ada typo atau kesalahan input
- ✅ Mudah untuk validasi

### **2. User Experience:**
- ✅ Lebih mudah (pilih vs ketik)
- ✅ Lebih cepat
- ✅ Tidak perlu hafal nama lokasi/asrama

### **3. Maintenance:**
- ✅ Update data di tabel master, otomatis update di dropdown
- ✅ Tidak perlu update code
- ✅ Centralized data management

---

## 🎨 UI/UX:

### **Dropdown Features:**
- ✅ Option "Pilih Lokasi" / "Pilih Asrama" sebagai placeholder
- ✅ Data sorted alphabetically (ascending)
- ✅ Hanya menampilkan data dengan status 'aktif'
- ✅ Styling konsisten dengan field lain

### **Behavior:**
- ✅ Load data saat halaman dibuka
- ✅ Dropdown auto-populate
- ✅ Value tersimpan saat edit user
- ✅ Bisa dikosongkan (optional field)

---

## 📋 Data Source:

### **Tabel Lokasi:**
```sql
SELECT * FROM lokasi_keasramaan
WHERE status = 'aktif'
ORDER BY lokasi ASC;
```

### **Tabel Asrama:**
```sql
SELECT * FROM asrama_keasramaan
WHERE status = 'aktif'
ORDER BY asrama ASC;
```

---

## 🧪 Testing:

### **Test Cases:**

```
□ Dropdown Lokasi menampilkan data dari tabel
□ Dropdown Asrama menampilkan data dari tabel
□ Data sorted alphabetically
□ Hanya data aktif yang muncul
□ Bisa pilih lokasi
□ Bisa pilih asrama
□ Bisa kosongkan (pilih option pertama)
□ Value tersimpan saat create user
□ Value tersimpan saat edit user
□ Tidak ada error saat fetch data
```

---

## 🔄 Relasi dengan Tabel Lain:

Form user sekarang konsisten dengan:
- ✅ **Data Siswa** - Juga menggunakan dropdown Lokasi & Asrama
- ✅ **Musyrif** - Juga menggunakan dropdown Lokasi & Asrama
- ✅ **Kepala Asrama** - Juga menggunakan dropdown Lokasi & Asrama

Semua form menggunakan data master yang sama!

---

## 💡 Future Enhancement:

### **Cascading Dropdown (Optional):**
Jika ingin Asrama terfilter berdasarkan Lokasi:

```typescript
const [filteredAsramaList, setFilteredAsramaList] = useState<any[]>([]);

useEffect(() => {
  if (formData.lokasi) {
    const filtered = asramaList.filter(
      (asr) => asr.lokasi === formData.lokasi
    );
    setFilteredAsramaList(filtered);
  } else {
    setFilteredAsramaList(asramaList);
  }
}, [formData.lokasi, asramaList]);
```

---

## 📝 Notes:

### **Jika Data Master Kosong:**
- Dropdown akan menampilkan hanya option "Pilih Lokasi/Asrama"
- User perlu input data master dulu di halaman Lokasi/Asrama

### **Jika Fetch Error:**
- Error di-log ke console
- Dropdown tetap muncul tapi kosong
- User bisa refresh halaman untuk retry

---

## ✅ Summary:

**Problem:** User harus ketik manual, bisa typo
**Solution:** Dropdown dari tabel master
**Result:** Data konsisten, UX lebih baik

**File Updated:** `app/users/page.tsx`
**Status:** ✅ Complete
**Date:** 2025-10-29
