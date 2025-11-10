# Fitur Validasi Field Kosong - Habit Tracker

## Overview
Fitur validasi yang mendeteksi field kosong saat submit dan memberikan visual feedback dengan highlight border merah pada field yang belum diisi, sehingga musyrif/ah mudah menemukan dan melengkapi data yang terlewat.

## Masalah yang Diselesaikan
- **Data NULL**: Banyak data santri yang NULL karena field terlewat
- **Sulit Menemukan Field Kosong**: Musyrif/ah tidak tahu field mana yang belum diisi
- **Tidak Ada Validasi**: Sistem menerima data yang tidak lengkap

## Fitur yang Ditambahkan

### 1. Validasi Saat Submit
Sistem mengecek semua field wajib untuk setiap santri sebelum menyimpan data.

**Field yang Divalidasi (21 field):**
- **Ubudiyah** (8): Shalat Fardhu Berjamaah, Tata Cara Shalat, Qiyamul Lail, Shalat Sunnah, Puasa Sunnah, Tata Cara Wudhu, Sedekah, Dzikir Pagi Petang
- **Akhlaq** (4): Etika Tutur Kata, Etika Bergaul, Etika Berpakaian, Adab Sehari-hari
- **Kedisiplinan** (6): Waktu Tidur, Piket Kamar, Halaqah Tahfidz, Perizinan, Belajar Malam, Berangkat Masjid
- **Kebersihan** (3): Kebersihan Tubuh & Pakaian, Kamar, Ranjang & Almari

### 2. Alert Dialog
Jika ada field kosong, muncul alert dengan informasi lengkap:

```
⚠️ PERINGATAN: ADA FIELD YANG KOSONG!

Ada 3 santri yang datanya belum lengkap:

Ahmad Fauzi
Budi Santoso
Citra Dewi

Field yang kosong ditandai dengan BORDER MERAH.
Mohon lengkapi data terlebih dahulu sebelum menyimpan.
```

### 3. Visual Highlight - Border Merah

**Card Santri dengan Field Kosong:**
- Border card berubah dari abu-abu menjadi **MERAH**
- Background card berubah menjadi **merah muda** (red-50)
- Mudah terlihat dari jauh

**Dropdown Field Kosong:**
- Border dropdown berubah menjadi **MERAH**
- Animasi **pulse** untuk menarik perhatian
- Focus ring juga merah

### 4. Auto-Scroll ke Santri Pertama
Setelah alert muncul, halaman otomatis scroll ke santri pertama yang memiliki field kosong.

### 5. Auto-Clear Highlight
Saat musyrif/ah mengisi field yang kosong, highlight merah otomatis hilang untuk field tersebut.

## Implementasi Teknis

### State Management
```typescript
const [emptyFieldsMap, setEmptyFieldsMap] = useState<{ [nis: string]: string[] }>({});
```

**Struktur Data:**
```typescript
{
  "202410020": ["shalat_fardhu_berjamaah", "tata_cara_shalat"],
  "202410021": ["waktu_tidur", "kamar"],
  "202410022": ["etika_dalam_tutur_kata"]
}
```

### Validasi Submit
```typescript
const handleSubmit = async () => {
  // ... validasi tanggal, tahun ajaran, semester

  const emptyStudents: string[] = [];
  const emptyFieldsMapping: { [nis: string]: string[] } = {};
  
  const requiredFields = [/* 21 field wajib */];

  siswaList.forEach((siswa) => {
    const data = habitData[siswa.nis] || {};
    const emptyFields = requiredFields.filter(field => !data[field]);
    
    if (emptyFields.length > 0) {
      emptyStudents.push(siswa.nama_siswa);
      emptyFieldsMapping[siswa.nis] = emptyFields;
    }
  });

  setEmptyFieldsMap(emptyFieldsMapping);

  if (emptyStudents.length > 0) {
    // Scroll ke santri pertama yang ada field kosong
    const firstEmptyNIS = Object.keys(emptyFieldsMapping)[0];
    const element = document.getElementById(`santri-${firstEmptyNIS}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    alert(/* pesan peringatan */);
    return;
  }

  // ... proses submit
};
```

### Highlight Card Santri
```typescript
<div 
  id={`santri-${siswa.nis}`}
  className={`bg-white rounded-2xl shadow-lg p-5 mb-4 border-2 ${
    emptyFieldsMap[siswa.nis] && emptyFieldsMap[siswa.nis].length > 0
      ? 'border-red-500 bg-red-50'  // ❌ Ada field kosong
      : 'border-gray-100'             // ✅ Semua lengkap
  }`}
>
```

### Highlight Dropdown Field
```typescript
const renderDropdown = (nis: string, field: string, maxValue: number) => {
  const isEmpty = emptyFieldsMap[nis]?.includes(field);
  
  return (
    <select
      value={habitData[nis]?.[field] || ''}
      onChange={(e) => {
        updateHabitData(nis, field, e.target.value);
        // Clear error untuk field ini
        if (isEmpty) {
          setEmptyFieldsMap(prev => {
            const newMap = { ...prev };
            if (newMap[nis]) {
              newMap[nis] = newMap[nis].filter(f => f !== field);
              if (newMap[nis].length === 0) {
                delete newMap[nis];
              }
            }
            return newMap;
          });
        }
      }}
      className={`w-full px-3 py-2.5 text-base border-2 rounded-xl ${
        isEmpty 
          ? 'border-red-500 focus:ring-red-500 animate-pulse' 
          : 'border-gray-200 focus:ring-blue-500'
      }`}
    >
      {/* options */}
    </select>
  );
};
```

## User Flow

### Skenario 1: Submit dengan Field Kosong
1. Musyrif/ah mengisi form tapi ada beberapa field terlewat
2. Klik tombol "Simpan"
3. **Alert muncul**: "Ada 3 santri yang datanya belum lengkap"
4. **Halaman auto-scroll** ke santri pertama yang ada field kosong
5. **Card santri highlight merah** dengan background merah muda
6. **Dropdown kosong highlight merah** dengan animasi pulse
7. Musyrif/ah mudah menemukan dan mengisi field yang kosong

### Skenario 2: Mengisi Field Kosong
1. Musyrif/ah klik dropdown yang merah
2. Pilih nilai (1, 2, 3, dst)
3. **Highlight merah hilang otomatis** untuk field tersebut
4. Jika semua field santri sudah diisi, **border card kembali abu-abu**

### Skenario 3: Submit Setelah Lengkap
1. Semua field sudah diisi
2. Klik tombol "Simpan"
3. **Tidak ada alert**
4. **Data tersimpan** langsung
5. **Success message**: "✅ Berhasil menyimpan 20 data!"

## Visual Feedback

### Card Santri - Normal
```
┌─────────────────────────────────────┐
│ 👤 Ahmad Fauzi          #1          │
│ NIS: 202410020                      │
├─────────────────────────────────────┤
│ [Dropdown fields...]                │
└─────────────────────────────────────┘
Border: Abu-abu
Background: Putih
```

### Card Santri - Ada Field Kosong
```
┌═════════════════════════════════════┐ ← Border MERAH
║ 👤 Ahmad Fauzi          #1          ║
║ NIS: 202410020                      ║
╠═════════════════════════════════════╣
║ [Dropdown merah dengan pulse...]    ║
╚═════════════════════════════════════╝
Border: MERAH (border-red-500)
Background: Merah Muda (bg-red-50)
```

### Dropdown - Normal
```
┌─────────────────┐
│ Pilih nilai  ▼  │
└─────────────────┘
Border: Abu-abu
```

### Dropdown - Kosong (Setelah Submit)
```
┌═════════════════┐ ← Border MERAH + Pulse
║ -            ▼  ║
╚═════════════════╝
Border: MERAH (border-red-500)
Animasi: Pulse
```

## Keuntungan

### Untuk Musyrif/ah:
1. ✅ **Mudah Menemukan Field Kosong**: Highlight merah sangat jelas
2. ✅ **Auto-Scroll**: Langsung ke santri yang bermasalah
3. ✅ **Real-time Feedback**: Highlight hilang saat diisi
4. ✅ **Tidak Mengganggu**: Tidak ada banner yang menghalangi tampilan
5. ✅ **Fokus pada Masalah**: Hanya muncul saat submit dengan data tidak lengkap

### Untuk Sistem:
1. ✅ **Data Lebih Lengkap**: Validasi ketat sebelum simpan
2. ✅ **Mengurangi NULL**: Musyrif/ah dipaksa melengkapi data
3. ✅ **User Experience Baik**: Visual feedback yang jelas
4. ✅ **Tidak Invasif**: Tidak mengganggu flow normal

## Testing

### Test Case 1: Submit dengan Field Kosong
1. Isi form tapi skip beberapa field
2. Klik "Simpan"
3. ✅ Alert muncul dengan daftar santri
4. ✅ Halaman scroll ke santri pertama
5. ✅ Card santri highlight merah
6. ✅ Dropdown kosong highlight merah dengan pulse

### Test Case 2: Isi Field Kosong
1. Klik dropdown yang merah
2. Pilih nilai
3. ✅ Highlight merah hilang untuk field tersebut
4. ✅ Jika semua field santri lengkap, border card kembali abu-abu

### Test Case 3: Submit Setelah Lengkap
1. Lengkapi semua field yang merah
2. Klik "Simpan"
3. ✅ Tidak ada alert
4. ✅ Data tersimpan
5. ✅ Success message muncul
6. ✅ Form reset

### Test Case 4: Multiple Santri dengan Field Kosong
1. Ada 3 santri dengan field kosong
2. Klik "Simpan"
3. ✅ Alert menampilkan 3 nama santri
4. ✅ Scroll ke santri pertama
5. ✅ Semua 3 card highlight merah

## Perbedaan dengan Versi Sebelumnya

### Versi Lama (dengan Banner):
- ❌ Banner warning di header mengganggu tampilan
- ❌ Cek data saat halaman dimuat (overhead)
- ❌ Banner muncul terus menerus
- ❌ Tidak ada highlight field spesifik

### Versi Baru (Alert + Highlight):
- ✅ Tidak ada banner yang mengganggu
- ✅ Validasi hanya saat submit (efisien)
- ✅ Alert muncul hanya saat perlu
- ✅ Highlight field spesifik yang kosong
- ✅ Auto-scroll ke masalah
- ✅ Auto-clear saat diisi

## File yang Dimodifikasi
- `portal-keasramaan/app/habit-tracker/form/[token]/page.tsx`

## Build Status
✅ Build production berhasil tanpa error

## Future Enhancements

1. **Tooltip**: Hover pada field merah untuk melihat pesan error
2. **Counter**: Tampilkan jumlah field kosong per santri
3. **Progress Bar**: Tampilkan progress pengisian per santri
4. **Bulk Fill**: Isi nilai yang sama untuk semua santri sekaligus
5. **Save Draft**: Simpan draft otomatis untuk menghindari kehilangan data

## Kesimpulan

Fitur validasi ini memberikan feedback visual yang jelas dan tidak mengganggu. Musyrif/ah hanya mendapat peringatan saat submit dengan data tidak lengkap, dan langsung bisa melihat field mana yang perlu diisi dengan highlight border merah yang jelas. Sistem ini efektif mengurangi data NULL tanpa mengganggu user experience.
