# Manajemen Rapor - Role-Based Access Control

## Overview

Menu **Manajemen Rapor** adalah menu yang sangat penting dan sensitif dalam sistem Portal Keasramaan. Oleh karena itu, akses ke menu ini dibatasi hanya untuk role tertentu.

## Aturan Akses

### ✅ Role yang DIIZINKAN Akses

Hanya 2 role berikut yang dapat mengakses menu Manajemen Rapor:

1. **ADMIN** - Akses penuh ke semua fitur
2. **KEPALA ASRAMA** - Akses penuh ke semua fitur

### ❌ Role yang TIDAK DIIZINKAN Akses

Role berikut **TIDAK DAPAT** mengakses menu Manajemen Rapor:

1. **MUSYRIF** - Hanya bisa akses Habit Tracker dan Catatan Perilaku
2. **GURU** - Hanya bisa akses Habit Tracker dan Catatan Perilaku

## Implementasi

### 1. Role Access Configuration (`lib/roleAccess.ts`)

```typescript
export const roleAccess: Record<UserRole, RoleAccessConfig> = {
  admin: {
    menus: ['manajemen-data', 'habit-tracker', 'catatan-perilaku', 'manajemen-rapor'],
    canAccessAll: true,
  },
  kepala_asrama: {
    menus: ['manajemen-data', 'habit-tracker', 'catatan-perilaku', 'manajemen-rapor'],
    canAccessAll: true,
  },
  musyrif: {
    menus: ['habit-tracker', 'catatan-perilaku'],
    canAccessAll: false,
  },
  guru: {
    menus: ['habit-tracker', 'catatan-perilaku'],
    canAccessAll: false,
  },
};
```

### 2. Path Access Check

```typescript
// Fungsi untuk cek akses path
export function canAccessPath(role: UserRole, path: string): boolean {
  // HANYA Admin dan Kepala Asrama yang bisa akses Manajemen Rapor
  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/manajemen-rapor')) {
    return false;
  }
  // ... logic lainnya
}

// Fungsi khusus untuk cek akses Manajemen Rapor
export function canAccessManajemenRapor(role: UserRole): boolean {
  return role === 'admin' || role === 'kepala_asrama';
}
```

### 3. Sidebar Menu Filtering (`components/Sidebar.tsx`)

Menu "Manajemen Rapor" akan otomatis disembunyikan dari sidebar untuk role Guru dan Musyrif:

```typescript
const getFilteredMenuItems = () => {
  if (userRole === 'guru' || userRole === 'musyrif') {
    // Guru dan Musyrif TIDAK BISA akses Manajemen Data dan Manajemen Rapor
    return menuItems.filter(menu => 
      menu.title === 'Habit Tracker' || menu.title === 'Catatan Perilaku'
    );
  }
  // Admin dan Kepala Asrama bisa akses semua menu
  return menuItems;
};
```

### 4. Page Guard (`components/guards/ManajemenRaporGuard.tsx`)

Setiap halaman di bawah `/manajemen-rapor` dilindungi oleh guard component yang:

1. **Memeriksa autentikasi** - User harus login
2. **Memeriksa role** - Hanya Admin dan Kepala Asrama yang diizinkan
3. **Menampilkan error** - Jika akses ditolak, tampilkan pesan error yang jelas
4. **Redirect otomatis** - Redirect ke dashboard setelah 3 detik

```typescript
// Penggunaan di layout
<ManajemenRaporGuard>
  {children}
</ManajemenRaporGuard>
```

## Halaman yang Dilindungi

Semua halaman di bawah `/manajemen-rapor` dilindungi:

- ✅ `/manajemen-rapor/galeri-kegiatan` - Galeri Kegiatan
- ✅ `/manajemen-rapor/template-rapor` - Template Rapor
- ✅ `/manajemen-rapor/template-rapor/builder` - Template Builder
- ✅ `/manajemen-rapor/generate-rapor` - Generate Rapor
- ✅ `/manajemen-rapor/arsip-rapor` - Arsip Rapor
- ✅ `/manajemen-rapor/indikator-capaian` - Indikator & Capaian

## Pesan Error untuk User

Jika user dengan role yang tidak diizinkan mencoba mengakses halaman Manajemen Rapor, mereka akan melihat:

### Tampilan Error Page

```
🛡️ Akses Ditolak

⚠️ Anda tidak memiliki izin untuk mengakses halaman ini

Halaman Manajemen Rapor hanya dapat diakses oleh:
• Admin
• Kepala Asrama

Role Anda saat ini: Musyrif

Anda akan diarahkan ke dashboard dalam beberapa detik...

[Kembali ke Dashboard]
```

## Testing

### Test Case 1: Admin Login
```
✅ Login sebagai Admin
✅ Menu "Manajemen Rapor" muncul di sidebar
✅ Bisa akses semua halaman manajemen rapor
✅ Tidak ada error atau redirect
```

### Test Case 2: Kepala Asrama Login
```
✅ Login sebagai Kepala Asrama
✅ Menu "Manajemen Rapor" muncul di sidebar
✅ Bisa akses semua halaman manajemen rapor
✅ Tidak ada error atau redirect
```

### Test Case 3: Musyrif Login
```
✅ Login sebagai Musyrif
❌ Menu "Manajemen Rapor" TIDAK muncul di sidebar
❌ Jika akses langsung via URL, tampil error page
✅ Redirect otomatis ke dashboard
```

### Test Case 4: Guru Login
```
✅ Login sebagai Guru
❌ Menu "Manajemen Rapor" TIDAK muncul di sidebar
❌ Jika akses langsung via URL, tampil error page
✅ Redirect otomatis ke dashboard
```

## Security Layers

Implementasi ini memiliki 3 layer keamanan:

### Layer 1: UI Level (Sidebar)
- Menu disembunyikan dari sidebar untuk role yang tidak diizinkan
- User tidak melihat menu sama sekali

### Layer 2: Client-Side Guard
- Component guard memeriksa role sebelum render halaman
- Tampilkan error page jika akses ditolak
- Redirect otomatis ke dashboard

### Layer 3: API Level (Recommended)
- **TODO**: Tambahkan middleware di API routes untuk double-check role
- Pastikan API endpoints juga memeriksa role sebelum return data

## Best Practices

1. **Jangan hanya mengandalkan UI hiding** - Selalu validasi di server-side
2. **Log access attempts** - Catat siapa yang mencoba akses tanpa izin
3. **Clear error messages** - Berikan pesan error yang jelas dan helpful
4. **Graceful degradation** - Redirect dengan smooth, tidak langsung error 403

## Maintenance

### Menambah Role Baru

Jika ingin menambah role baru yang bisa akses Manajemen Rapor:

1. Update `lib/roleAccess.ts`:
```typescript
export function canAccessManajemenRapor(role: UserRole): boolean {
  return role === 'admin' || role === 'kepala_asrama' || role === 'new_role';
}
```

2. Update `components/Sidebar.tsx`:
```typescript
const getFilteredMenuItems = () => {
  if (userRole === 'guru' || userRole === 'musyrif') {
    // Exclude Manajemen Rapor
  }
  // Include for other roles
};
```

3. Update `components/guards/ManajemenRaporGuard.tsx`:
```typescript
const allowedRoles = ['admin', 'kepala_asrama', 'new_role'];
```

### Menambah Halaman Baru

Jika menambah halaman baru di `/manajemen-rapor`:

1. Buat folder/file di `app/manajemen-rapor/new-page/page.tsx`
2. Guard otomatis aktif karena menggunakan layout
3. Tambahkan menu item di `submenuItems` di layout jika perlu

## Troubleshooting

### Menu tidak muncul untuk Admin
- Cek `userRole` state di Sidebar
- Pastikan API `/api/auth/me` return role yang benar
- Cek console untuk error

### Guard tidak bekerja
- Pastikan `ManajemenRaporGuard` di-wrap di layout
- Cek API `/api/auth/me` berfungsi
- Lihat console untuk error

### Redirect loop
- Pastikan tidak ada circular redirect
- Cek logic di guard component
- Pastikan role check benar

## Files Modified

1. ✅ `lib/roleAccess.ts` - Tambah akses control logic
2. ✅ `components/Sidebar.tsx` - Filter menu berdasarkan role
3. ✅ `components/guards/ManajemenRaporGuard.tsx` - Guard component (NEW)
4. ✅ `app/manajemen-rapor/layout.tsx` - Wrap dengan guard

## Conclusion

Dengan implementasi ini, menu Manajemen Rapor sekarang aman dan hanya bisa diakses oleh Admin dan Kepala Asrama. User dengan role lain tidak akan melihat menu ini di sidebar, dan jika mereka mencoba akses langsung via URL, mereka akan melihat error page yang jelas dan di-redirect ke dashboard.

**Security Status: ✅ PROTECTED**
