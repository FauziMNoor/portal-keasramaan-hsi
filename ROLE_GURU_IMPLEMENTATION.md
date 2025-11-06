# Implementasi Role Guru

## Overview
Dokumen ini menjelaskan implementasi role "Guru" yang menggantikan role "User" dengan akses terbatas ke fitur-fitur tertentu dalam aplikasi Portal Keasramaan.

## Perubahan yang Dilakukan

### 1. User Management (`/users`)
- ✅ Role "User" diganti menjadi "Guru" di dropdown form tambah/edit user
- ✅ Default role saat membuat user baru adalah "guru"
- ✅ Badge role "Guru" ditampilkan dengan warna purple (bg-purple-100 text-purple-700)

### 2. Akses Menu untuk Role Guru

Role Guru memiliki akses terbatas ke menu berikut:

#### Dashboard (Dapat Diakses)
1. **Dashboard Data** (`/`)
2. **Dashboard Habit Tracker** (`/overview/habit-tracker`)
3. **Dashboard Catatan Perilaku** (`/catatan-perilaku/dashboard`)

#### Habit Tracker (Akses Terbatas)
- ✅ **Rekap Habit Tracker** (`/habit-tracker/rekap`)
- ❌ Input Formulir
- ❌ Kelola Link Musyrif/ah
- ❌ Laporan Wali Santri
- ❌ Indikator Penilaian

#### Catatan Perilaku (Akses Terbatas)
- ✅ **Input Catatan** (`/catatan-perilaku/input`)
- ✅ **Riwayat Catatan** (`/catatan-perilaku/riwayat`)
- ❌ Kelola Link Token
- ❌ Kelola Kategori

#### Manajemen Data (Tidak Dapat Diakses)
- ❌ Semua menu di bawah Manajemen Data
- ❌ Sekolah
- ❌ Tempat
- ❌ Pengurus
- ❌ Siswa
- ❌ Users

### 3. File yang Dimodifikasi

#### `app/users/page.tsx`
```typescript
// Default role diubah dari 'user' menjadi 'guru'
role: 'guru'

// Dropdown role options
<option value="guru">Guru</option>
<option value="musyrif">Musyrif/ah</option>
<option value="kepala_asrama">Kepala Asrama</option>
<option value="admin">Admin</option>

// Badge styling untuk role guru
user.role === 'guru' ? 'bg-purple-100 text-purple-700' : ...
```

#### `components/Sidebar.tsx`
```typescript
// Fetch user role
const [userRole, setUserRole] = useState<string>('');

// Filter menu berdasarkan role
const getFilteredMenuItems = () => {
  if (userRole === 'guru') {
    // Return filtered menu untuk guru
  }
  return menuItems; // Full menu untuk role lain
}

// Hide "Manajemen Data" section untuk guru
{!isCollapsed && userRole !== 'guru' && (
  <div className="mt-6 mb-4">
    <p>Manajemen Data</p>
  </div>
)}
```

### 4. File Baru yang Dibuat

#### `lib/roleAccess.ts`
Helper untuk role-based access control:
```typescript
export type UserRole = 'admin' | 'kepala_asrama' | 'musyrif' | 'guru';

export const roleAccess = {
  guru: {
    dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
    menus: ['habit-tracker', 'catatan-perilaku'],
    habitTracker: {
      allowedPages: ['/habit-tracker/rekap'],
    },
    catatanPerilaku: {
      allowedPages: ['/catatan-perilaku/input', '/catatan-perilaku/riwayat'],
    },
    canAccessAll: false,
  },
  // ... role lain
};

// Function untuk cek akses
export function canAccessPath(role: UserRole, path: string): boolean
export function getAllowedMenus(role: UserRole)
```

#### `components/RoleGuard.tsx`
Component untuk proteksi halaman:
```typescript
<RoleGuard allowedRoles={['admin', 'kepala_asrama']}>
  {/* Content yang hanya bisa diakses admin dan kepala asrama */}
</RoleGuard>
```

## Cara Menggunakan

### 1. Membuat User dengan Role Guru
1. Login sebagai Admin
2. Buka menu **Users** (`/users`)
3. Klik **Tambah User**
4. Pilih role **Guru** (default)
5. Isi data lengkap dan simpan

### 2. Login sebagai Guru
Setelah user guru dibuat, login dengan kredensial tersebut. Menu yang tampil akan otomatis disesuaikan dengan akses role Guru.

### 3. Proteksi Halaman (Opsional)
Jika ingin menambahkan proteksi tambahan di level halaman:

```typescript
import RoleGuard from '@/components/RoleGuard';

export default function SomePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
      {/* Content halaman */}
    </RoleGuard>
  );
}
```

## Testing

### Test Case 1: User Management
- [x] Buka `/users`
- [x] Klik "Tambah User"
- [x] Verifikasi dropdown role menampilkan "Guru" sebagai opsi pertama
- [x] Simpan user baru dengan role Guru
- [x] Verifikasi badge role "Guru" tampil dengan warna purple

### Test Case 2: Sidebar Menu (Login sebagai Guru)
- [x] Login dengan user role Guru
- [x] Verifikasi menu yang tampil:
  - ✅ Dashboard Data
  - ✅ Dashboard Habit Tracker
  - ✅ Dashboard Catatan Perilaku
  - ✅ Habit Tracker > Rekap Habit Tracker
  - ✅ Catatan Perilaku > Input Catatan
  - ✅ Catatan Perilaku > Riwayat Catatan
  - ❌ Manajemen Data (tidak tampil)

### Test Case 3: Direct URL Access
- [x] Login sebagai Guru
- [x] Coba akses URL yang tidak diizinkan:
  - `/users` - Should redirect atau show error
  - `/data-siswa` - Should redirect atau show error
  - `/habit-tracker/manage-link` - Should redirect atau show error

## Migration dari Role "User" ke "Guru"

Jika sudah ada user dengan role "user" di database, jalankan query berikut:

```sql
-- Update semua user dengan role 'user' menjadi 'guru'
UPDATE users_keasramaan 
SET role = 'guru' 
WHERE role = 'user';
```

## Catatan Penting

1. **Backward Compatibility**: Jika ada user lama dengan role "user", mereka masih bisa login tetapi tidak akan memiliki akses menu yang sesuai. Disarankan untuk melakukan migration.

2. **Security**: Proteksi akses saat ini dilakukan di level frontend (Sidebar). Untuk keamanan lebih baik, tambahkan proteksi di level API/backend juga.

3. **Future Enhancement**: 
   - Tambahkan middleware untuk proteksi route di `middleware.ts`
   - Tambahkan API-level access control
   - Implementasi permission-based access control yang lebih granular

## Role Comparison

| Fitur | Admin | Kepala Asrama | Musyrif | Guru |
|-------|-------|---------------|---------|------|
| Dashboard Data | ✅ | ✅ | ✅ | ✅ |
| Dashboard Habit Tracker | ✅ | ✅ | ✅ | ✅ |
| Dashboard Catatan Perilaku | ✅ | ✅ | ✅ | ✅ |
| Manajemen Data | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Input Formulir | ✅ | ✅ | ✅ | ❌ |
| Habit Tracker - Rekap | ✅ | ✅ | ✅ | ✅ |
| Habit Tracker - Kelola Link | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Laporan | ✅ | ✅ | ❌ | ❌ |
| Habit Tracker - Indikator | ✅ | ✅ | ❌ | ❌ |
| Catatan Perilaku - Input | ✅ | ✅ | ✅ | ✅ |
| Catatan Perilaku - Riwayat | ✅ | ✅ | ✅ | ✅ |
| Catatan Perilaku - Kelola Link | ✅ | ✅ | ❌ | ❌ |
| Catatan Perilaku - Kategori | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ |

**Key Difference between Musyrif and Guru:**
- ✅ Musyrif dapat Input Formulir Habit Tracker
- ❌ Guru tidak dapat Input Formulir Habit Tracker

## Support

Jika ada pertanyaan atau issue terkait implementasi role Guru, silakan hubungi tim development.
