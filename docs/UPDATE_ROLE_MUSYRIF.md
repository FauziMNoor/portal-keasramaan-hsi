# Update: Role Musyrif - Limited Access

## 📋 Overview

Role **Musyrif** telah diupdate untuk memiliki akses terbatas, sama seperti role Guru. Sebelumnya Musyrif bisa mengakses semua menu, sekarang hanya bisa mengakses menu tertentu.

## 🎯 Tujuan Update

Membatasi akses role Musyrif agar hanya bisa mengakses menu yang relevan dengan tugas mereka, yaitu input dan monitoring habit tracker serta catatan perilaku.

## ✅ Akses Role Musyrif (Setelah Update)

### Dashboard (3 Dashboard)
- ✅ **Dashboard Data** (`/`)
- ✅ **Dashboard Habit Tracker** (`/overview/habit-tracker`)
- ✅ **Dashboard Catatan Perilaku** (`/catatan-perilaku/dashboard`)

### Habit Tracker (2 Menu)
- ✅ **Input Formulir** (`/habit-tracker`)
- ✅ **Rekap Habit Tracker** (`/habit-tracker/rekap`)

### Catatan Perilaku (2 Menu)
- ✅ **Input Catatan** (`/catatan-perilaku/input`)
- ✅ **Riwayat Catatan** (`/catatan-perilaku/riwayat`)

### ❌ Tidak Dapat Diakses

**Manajemen Data:**
- ❌ Semua menu di bawah Manajemen Data
- ❌ Sekolah, Tempat, Pengurus, Siswa, Users

**Habit Tracker (Restricted):**
- ❌ Kelola Link Musyrif/ah
- ❌ Laporan Wali Santri
- ❌ Indikator Penilaian

**Catatan Perilaku (Restricted):**
- ❌ Kelola Link Token
- ❌ Kelola Kategori

## 🔄 Perubahan Detail

### 1. File: `components/Sidebar.tsx`

#### Before:
```typescript
if (userRole === 'guru') {
  // Hanya guru yang dibatasi
  return filteredMenuForGuru;
}
// Musyrif bisa akses semua menu
return menuItems;
```

#### After:
```typescript
if (userRole === 'guru' || userRole === 'musyrif') {
  // Guru dan Musyrif dibatasi
  return filteredMenuForGuruAndMusyrif;
}
// Hanya admin dan kepala_asrama yang bisa akses semua
return menuItems;
```

#### Perubahan Spesifik:

**Filter Menu:**
```typescript
// BEFORE
if (userRole === 'guru') {
  // Filter untuk guru saja
}
return menuItems; // Musyrif dapat semua

// AFTER
if (userRole === 'guru' || userRole === 'musyrif') {
  // Filter untuk guru DAN musyrif
  return menuItems
    .filter(menu => 
      menu.title === 'Habit Tracker' || 
      menu.title === 'Catatan Perilaku'
    )
    .map(menu => {
      if (menu.title === 'Habit Tracker') {
        return {
          ...menu,
          submenu: menu.submenu?.filter(item => 
            item.href === '/habit-tracker' ||        // Input Formulir
            item.href === '/habit-tracker/rekap'     // Rekap
          )
        };
      }
      if (menu.title === 'Catatan Perilaku') {
        return {
          ...menu,
          submenu: menu.submenu?.filter(item => 
            item.href === '/catatan-perilaku/input' ||    // Input Catatan
            item.href === '/catatan-perilaku/riwayat'     // Riwayat
          )
        };
      }
      return menu;
    });
}
return menuItems; // Hanya admin dan kepala_asrama
```

**Section Header:**
```typescript
// BEFORE
{!isCollapsed && userRole !== 'guru' && (
  <div>Manajemen Data</div>
)}

// AFTER
{!isCollapsed && userRole !== 'guru' && userRole !== 'musyrif' && (
  <div>Manajemen Data</div>
)}
```

### 2. File: `lib/roleAccess.ts`

#### Before:
```typescript
musyrif: {
  dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
  menus: ['manajemen-data', 'habit-tracker', 'catatan-perilaku'],
  canAccessAll: true,  // ← Full access
},
```

#### After:
```typescript
musyrif: {
  dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
  menus: ['habit-tracker', 'catatan-perilaku'],  // ← No manajemen-data
  habitTracker: {
    allowedPages: ['/habit-tracker', '/habit-tracker/rekap'],
  },
  catatanPerilaku: {
    allowedPages: ['/catatan-perilaku/input', '/catatan-perilaku/riwayat'],
  },
  canAccessAll: false,  // ← Limited access
},
```

#### Path Access Check:
```typescript
// BEFORE
if (role === 'guru' && path.startsWith('/manajemen-data')) {
  return false;
}

// AFTER
if ((role === 'guru' || role === 'musyrif') && path.startsWith('/manajemen-data')) {
  return false;
}
```

## 📊 Comparison Table

| Feature | Admin | Kepala Asrama | Musyrif (Before) | Musyrif (After) | Guru |
|---------|-------|---------------|------------------|-----------------|------|
| Dashboard (3) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manajemen Data | ✅ | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Input | ✅ | ✅ | ✅ | ✅ | ❌ |
| Habit Tracker - Rekap | ✅ | ✅ | ✅ | ✅ | ✅ |
| Habit Tracker - Kelola Link | ✅ | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Laporan | ✅ | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Indikator | ✅ | ✅ | ✅ | ❌ | ❌ |
| Catatan Perilaku - Input | ✅ | ✅ | ✅ | ✅ | ✅ |
| Catatan Perilaku - Riwayat | ✅ | ✅ | ✅ | ✅ | ✅ |
| Catatan Perilaku - Kelola Link | ✅ | ✅ | ✅ | ❌ | ❌ |
| Catatan Perilaku - Kategori | ✅ | ✅ | ✅ | ❌ | ❌ |

## 🎯 Perbedaan Musyrif vs Guru

| Feature | Musyrif | Guru |
|---------|---------|------|
| Dashboard Data | ✅ | ✅ |
| Dashboard Habit Tracker | ✅ | ✅ |
| Dashboard Catatan Perilaku | ✅ | ✅ |
| Habit Tracker - Input Formulir | ✅ | ❌ |
| Habit Tracker - Rekap | ✅ | ✅ |
| Catatan Perilaku - Input | ✅ | ✅ |
| Catatan Perilaku - Riwayat | ✅ | ✅ |
| Manajemen Data | ❌ | ❌ |

**Key Difference:**
- ✅ **Musyrif bisa Input Formulir Habit Tracker**
- ❌ **Guru tidak bisa Input Formulir Habit Tracker**

## 📱 Visual Menu Structure

### Musyrif Menu (After Update)

```
┌─────────────────────────────────────────┐
│  PORTAL KEASRAMAAN - Role: Musyrif      │
└─────────────────────────────────────────┘

📊 OVERVIEW
├── ✅ Dashboard Data (/)
├── ✅ Dashboard Habit Tracker (/overview/habit-tracker)
└── ✅ Dashboard Catatan Perilaku (/catatan-perilaku/dashboard)

📚 HABIT TRACKER
├── ✅ Input Formulir (/habit-tracker)
└── ✅ Rekap Habit Tracker (/habit-tracker/rekap)

📝 CATATAN PERILAKU
├── ✅ Input Catatan (/catatan-perilaku/input)
└── ✅ Riwayat Catatan (/catatan-perilaku/riwayat)

👤 USER PROFILE
└── 🚪 Logout
```

### Guru Menu (For Comparison)

```
┌─────────────────────────────────────────┐
│  PORTAL KEASRAMAAN - Role: Guru         │
└─────────────────────────────────────────┘

📊 OVERVIEW
├── ✅ Dashboard Data (/)
├── ✅ Dashboard Habit Tracker (/overview/habit-tracker)
└── ✅ Dashboard Catatan Perilaku (/catatan-perilaku/dashboard)

📚 HABIT TRACKER
└── ✅ Rekap Habit Tracker (/habit-tracker/rekap)

📝 CATATAN PERILAKU
├── ✅ Input Catatan (/catatan-perilaku/input)
└── ✅ Riwayat Catatan (/catatan-perilaku/riwayat)

👤 USER PROFILE
└── 🚪 Logout
```

## 🧪 Testing Checklist

### Test 1: Login sebagai Musyrif
- [ ] Login dengan user role Musyrif
- [ ] Verifikasi redirect ke Dashboard Data
- [ ] Verifikasi menu sidebar sesuai

### Test 2: Verifikasi Menu Sidebar
- [ ] ✅ Dashboard Data tampil
- [ ] ✅ Dashboard Habit Tracker tampil
- [ ] ✅ Dashboard Catatan Perilaku tampil
- [ ] ✅ Habit Tracker > Input Formulir tampil
- [ ] ✅ Habit Tracker > Rekap Habit Tracker tampil
- [ ] ✅ Catatan Perilaku > Input Catatan tampil
- [ ] ✅ Catatan Perilaku > Riwayat Catatan tampil
- [ ] ❌ Section "Manajemen Data" tidak tampil
- [ ] ❌ Habit Tracker > Kelola Link tidak tampil
- [ ] ❌ Habit Tracker > Laporan tidak tampil
- [ ] ❌ Habit Tracker > Indikator tidak tampil
- [ ] ❌ Catatan Perilaku > Kelola Link tidak tampil
- [ ] ❌ Catatan Perilaku > Kategori tidak tampil

### Test 3: Akses Dashboard
- [ ] Klik Dashboard Data - Should work
- [ ] Klik Dashboard Habit Tracker - Should work
- [ ] Klik Dashboard Catatan Perilaku - Should work

### Test 4: Akses Habit Tracker
- [ ] Klik Input Formulir - Should work
- [ ] Klik Rekap Habit Tracker - Should work
- [ ] Coba akses `/habit-tracker/manage-link` via URL - Should be blocked

### Test 5: Akses Catatan Perilaku
- [ ] Klik Input Catatan - Should work
- [ ] Klik Riwayat Catatan - Should work
- [ ] Coba akses `/catatan-perilaku/manage-link` via URL - Should be blocked
- [ ] Coba akses `/catatan-perilaku/kategori` via URL - Should be blocked

### Test 6: Direct URL Access (Restricted)
- [ ] `/users` - Should be blocked
- [ ] `/data-siswa` - Should be blocked
- [ ] `/manajemen-data/sekolah` - Should be blocked
- [ ] `/habit-tracker/manage-link` - Should be blocked
- [ ] `/habit-tracker/indikator` - Should be blocked
- [ ] `/catatan-perilaku/manage-link` - Should be blocked
- [ ] `/catatan-perilaku/kategori` - Should be blocked

### Test 7: Comparison with Guru
- [ ] Login sebagai Guru
- [ ] Verifikasi Guru TIDAK bisa akses Input Formulir Habit Tracker
- [ ] Login sebagai Musyrif
- [ ] Verifikasi Musyrif BISA akses Input Formulir Habit Tracker

## 🎯 Use Cases

### Use Case 1: Musyrif Input Habit Tracker Harian

**Scenario:** Musyrif perlu input habit tracker santri setiap hari

**Steps:**
1. Login sebagai Musyrif
2. Klik "Habit Tracker" > "Input Formulir"
3. Pilih tanggal, santri, dan isi form
4. Submit

**Result:** ✅ Berhasil input habit tracker

---

### Use Case 2: Musyrif Lihat Rekap Habit Tracker

**Scenario:** Musyrif ingin melihat rekap habit tracker santri

**Steps:**
1. Login sebagai Musyrif
2. Klik "Habit Tracker" > "Rekap Habit Tracker"
3. Filter data sesuai kebutuhan
4. Lihat rekap

**Result:** ✅ Berhasil melihat rekap

---

### Use Case 3: Musyrif Input Catatan Perilaku

**Scenario:** Musyrif perlu mencatat pelanggaran/kebaikan santri

**Steps:**
1. Login sebagai Musyrif
2. Klik "Catatan Perilaku" > "Input Catatan"
3. Pilih tipe, santri, dan isi form
4. Submit

**Result:** ✅ Berhasil input catatan

---

### Use Case 4: Musyrif Coba Akses Manajemen Data

**Scenario:** Musyrif mencoba akses menu yang tidak diizinkan

**Steps:**
1. Login sebagai Musyrif
2. Coba akses `/users` via URL

**Result:** ❌ Blocked atau redirect (tergantung implementasi proteksi)

## 📝 Migration Notes

### Untuk User yang Sudah Ada

**Tidak ada migration database yang diperlukan.**

User dengan role "musyrif" yang sudah ada akan otomatis mendapat akses terbatas setelah update ini di-deploy.

### Komunikasi ke User

**Penting untuk menginformasikan ke Musyrif:**

1. **Akses menu telah diubah** untuk fokus pada tugas utama
2. **Menu yang masih bisa diakses:**
   - Dashboard (3)
   - Input Formulir Habit Tracker
   - Rekap Habit Tracker
   - Input Catatan Perilaku
   - Riwayat Catatan Perilaku
3. **Menu yang tidak bisa diakses lagi:**
   - Manajemen Data (Sekolah, Tempat, Pengurus, Siswa, Users)
   - Kelola Link
   - Indikator Penilaian
   - Kelola Kategori

## 🔒 Security Notes

### Current Implementation

✅ **UI-level protection:** Menu tidak tampil di sidebar  
⚠️ **Page-level protection:** Belum diimplementasi (optional)  
⚠️ **API-level protection:** Belum diimplementasi (recommended)

### Recommended Next Steps

1. **Implementasi RoleGuard di halaman restricted**
   ```typescript
   <RoleGuard allowedRoles={['admin', 'kepala_asrama']}>
     {/* Content */}
   </RoleGuard>
   ```

2. **Implementasi API protection**
   ```typescript
   if (!['admin', 'kepala_asrama'].includes(userRole)) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

## 📊 Impact Analysis

### Positive Impacts ✅

1. **Fokus Tugas:** Musyrif fokus pada input dan monitoring
2. **Keamanan:** Mengurangi risiko perubahan data master
3. **Konsistensi:** Role hierarchy yang lebih jelas
4. **User Experience:** Menu lebih sederhana dan relevan

### Potential Concerns ⚠️

1. **Workflow Change:** Musyrif yang terbiasa akses semua menu perlu adaptasi
2. **Dependency:** Jika Musyrif perlu data dari menu restricted, harus minta ke admin
3. **Training:** Perlu sosialisasi perubahan akses

### Mitigation

1. **Komunikasi:** Informasikan perubahan sebelum deploy
2. **Training:** Berikan panduan penggunaan menu baru
3. **Support:** Siapkan channel untuk pertanyaan dan bantuan

## 📞 Support

Jika ada pertanyaan atau issue terkait update ini:
1. Cek dokumentasi ini terlebih dahulu
2. Test di environment development
3. Hubungi tim development jika ada masalah

---

**Last Updated:** 6 November 2025  
**Version:** 1.0  
**Status:** ✅ Completed
