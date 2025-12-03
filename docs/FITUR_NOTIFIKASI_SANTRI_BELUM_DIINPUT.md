# Fitur Notifikasi: Santri Belum Diinput

## Overview
Fitur ini menambahkan sistem notifikasi dan validasi untuk mengingatkan musyrif/ah jika ada santri yang belum diinput pada tanggal tertentu, sehingga mengurangi data NULL/kosong yang tidak disengaja.

## Masalah yang Diselesaikan
- **Data NULL**: Banyak data santri yang NULL karena terlewat oleh musyrif/ah
- **Tidak Ada Peringatan**: Musyrif/ah tidak tahu jika ada santri yang belum diinput
- **Validasi Lemah**: Tidak ada validasi sebelum submit jika data belum lengkap

## Fitur yang Ditambahkan

### 1. Auto-Check Data Hari Ini
Sistem otomatis mengecek data yang sudah diinput untuk tanggal yang dipilih saat halaman dimuat.

```typescript
const checkTodayInput = async () => {
  const { data } = await supabase
    .from('formulir_habit_tracker_keasramaan')
    .select('nis')
    .eq('tanggal', tanggal)
    .eq('musyrif', tokenData?.nama_musyrif)
    .in('nis', siswaList.map(s => s.nis));

  const inputtedNIS = data?.map(d => d.nis) || [];
  setAlreadyInputToday(inputtedNIS);

  const notInputted = siswaList.filter(s => !inputtedNIS.includes(s.nis));
  setShowWarning(notInputted.length > 0);
};
```

### 2. Warning Banner (Jika Ada yang Belum Diinput)

**Tampilan:**
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Peringatan: Ada Santri yang Belum Diinput!  │
│                                                 │
│ Tanggal 10 November 2024                       │
│                                                 │
│ ✅ 15 Sudah diinput    ❌ 5 Belum diinput      │
│                                                 │
│ 💡 Pastikan semua santri sudah diinput untuk   │
│    menghindari data yang NULL/kosong           │
└─────────────────────────────────────────────────┘
```

**Fitur:**
- Background kuning/orange dengan animasi pulse
- Menampilkan jumlah santri yang sudah dan belum diinput
- Muncul otomatis jika ada santri yang belum diinput
- Update real-time saat tanggal diubah

### 3. Success Banner (Jika Semua Sudah Diinput)

**Tampilan:**
```
┌─────────────────────────────────────────────────┐
│ ✅ Semua Santri Sudah Diinput!                  │
│                                                 │
│ Tanggal 10 November 2024 - 20 santri sudah     │
│ lengkap                                         │
└─────────────────────────────────────────────────┘
```

**Fitur:**
- Background hijau
- Konfirmasi bahwa semua santri sudah diinput
- Memberikan rasa aman kepada musyrif/ah

### 4. Validasi Sebelum Submit

**Proses:**
1. Sistem mengecek semua field wajib untuk setiap santri
2. Jika ada field yang kosong, tampilkan dialog konfirmasi
3. Musyrif/ah bisa memilih:
   - **OK**: Tetap simpan dengan data yang belum lengkap
   - **Cancel**: Kembali untuk melengkapi data

**Dialog Konfirmasi:**
```
⚠️ PERINGATAN!

Ada 5 santri yang datanya belum lengkap:

Ahmad Fauzi
Budi Santoso
Citra Dewi
Dina Amalia
Eko Prasetyo

Apakah Anda yakin ingin menyimpan dengan data yang belum lengkap?

Klik OK untuk tetap simpan, atau Cancel untuk melengkapi data terlebih dahulu.
```

**Field yang Divalidasi:**
- **Ubudiyah** (8 field): Shalat Fardhu, Tata Cara Shalat, Qiyamul Lail, dll
- **Akhlaq** (4 field): Etika Tutur Kata, Etika Bergaul, dll
- **Kedisiplinan** (6 field): Waktu Tidur, Piket Kamar, dll
- **Kebersihan** (3 field): Kebersihan Tubuh, Kamar, Ranjang & Almari

### 5. Auto-Refresh Setelah Submit

Setelah berhasil submit, sistem otomatis:
1. Refresh data yang sudah diinput hari ini
2. Update warning banner
3. Menampilkan success banner jika semua sudah lengkap

## Implementasi Teknis

### State Management
```typescript
const [alreadyInputToday, setAlreadyInputToday] = useState<string[]>([]);
const [showWarning, setShowWarning] = useState(false);
```

### useEffect Hooks
```typescript
// Check saat siswaList atau tanggal berubah
useEffect(() => {
  if (siswaList.length > 0 && tanggal) {
    checkTodayInput();
  }
}, [siswaList, tanggal]);
```

### Validasi Submit
```typescript
const handleSubmit = async () => {
  // ... validasi tanggal, tahun ajaran, semester

  // Validasi field kosong
  const emptyFields: string[] = [];
  siswaList.forEach((siswa) => {
    const data = habitData[siswa.nis] || {};
    const requiredFields = [/* 21 field wajib */];
    
    const hasEmptyField = requiredFields.some(field => !data[field]);
    if (hasEmptyField) {
      emptyFields.push(siswa.nama_siswa);
    }
  });

  // Tampilkan konfirmasi jika ada yang kosong
  if (emptyFields.length > 0) {
    const confirm = window.confirm(/* pesan peringatan */);
    if (!confirm) return;
  }

  // ... proses submit
  
  // Refresh check setelah submit
  await checkTodayInput();
};
```

## User Flow

### Skenario 1: Belum Ada yang Diinput
1. Musyrif/ah buka form
2. **Warning banner muncul**: "Ada 20 santri yang belum diinput"
3. Musyrif/ah mulai input data
4. Setelah submit, warning banner update: "Ada 15 santri yang belum diinput"

### Skenario 2: Sebagian Sudah Diinput
1. Musyrif/ah buka form
2. **Warning banner muncul**: "15 Sudah diinput, 5 Belum diinput"
3. Musyrif/ah input sisanya
4. Setelah submit, **success banner muncul**: "Semua santri sudah diinput!"

### Skenario 3: Semua Sudah Diinput
1. Musyrif/ah buka form
2. **Success banner muncul**: "Semua santri sudah diinput!"
3. Musyrif/ah bisa yakin tidak ada yang terlewat

### Skenario 4: Submit dengan Data Tidak Lengkap
1. Musyrif/ah isi form tapi ada yang terlewat
2. Klik tombol "Simpan"
3. **Dialog konfirmasi muncul**: "Ada 3 santri yang datanya belum lengkap"
4. Musyrif/ah bisa pilih:
   - **Cancel**: Kembali melengkapi data
   - **OK**: Tetap simpan (untuk kasus khusus)

## Keuntungan

### Untuk Musyrif/ah:
1. ✅ **Tidak Khawatir Terlewat**: Ada notifikasi jelas jika ada yang belum diinput
2. ✅ **Konfirmasi Visual**: Success banner memberikan rasa aman
3. ✅ **Validasi Otomatis**: Sistem mengingatkan sebelum submit
4. ✅ **Real-time Update**: Banner update otomatis saat tanggal diubah

### Untuk Admin/Sistem:
1. ✅ **Data Lebih Lengkap**: Mengurangi data NULL/kosong
2. ✅ **Kualitas Data Meningkat**: Validasi sebelum submit
3. ✅ **Tracking Lebih Baik**: Tahu berapa santri yang sudah/belum diinput
4. ✅ **User Experience Lebih Baik**: Musyrif/ah lebih percaya diri

### Untuk Wali Santri:
1. ✅ **Data Lebih Akurat**: Laporan lebih lengkap dan akurat
2. ✅ **Tidak Ada Data Kosong**: Semua indikator terisi
3. ✅ **Monitoring Lebih Baik**: Bisa melihat perkembangan santri dengan lengkap

## Testing

### Test Case 1: Warning Banner Muncul
1. Buka form habit tracker
2. Pilih tanggal yang belum ada data
3. ✅ Warning banner muncul dengan jumlah santri yang belum diinput

### Test Case 2: Success Banner Muncul
1. Buka form habit tracker
2. Pilih tanggal yang sudah lengkap semua santri
3. ✅ Success banner muncul

### Test Case 3: Validasi Submit
1. Isi form tapi ada beberapa field kosong
2. Klik "Simpan"
3. ✅ Dialog konfirmasi muncul dengan daftar santri yang belum lengkap

### Test Case 4: Auto-Refresh
1. Submit data untuk beberapa santri
2. ✅ Warning banner update otomatis
3. ✅ Jumlah "Sudah diinput" bertambah

### Test Case 5: Ganti Tanggal
1. Pilih tanggal A (ada warning)
2. Ganti ke tanggal B (sudah lengkap)
3. ✅ Banner berubah dari warning ke success

## File yang Dimodifikasi
- `portal-keasramaan/app/habit-tracker/form/[token]/page.tsx`

## Build Status
✅ Build production berhasil tanpa error

## Future Enhancements

1. **Notifikasi Push**: Kirim notifikasi ke musyrif/ah jika belum input sampai jam tertentu
2. **Reminder Email**: Email otomatis jika ada santri yang belum diinput
3. **Dashboard Progress**: Halaman khusus untuk melihat progress input per musyrif/ah
4. **Export Report**: Export daftar santri yang belum diinput
5. **Auto-Save**: Simpan draft otomatis untuk menghindari kehilangan data

## Kesimpulan

Fitur notifikasi ini sangat membantu musyrif/ah untuk memastikan semua santri sudah diinput dengan lengkap, mengurangi data NULL/kosong, dan meningkatkan kualitas data secara keseluruhan. Dengan validasi dan warning yang jelas, musyrif/ah bisa lebih percaya diri bahwa tidak ada santri yang terlewat.
