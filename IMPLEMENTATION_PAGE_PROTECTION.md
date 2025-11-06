# Implementasi Page Protection untuk Role Guru

## Overview

Dokumen ini menjelaskan cara mengimplementasikan proteksi halaman untuk mencegah role Guru mengakses halaman yang tidak diizinkan via direct URL.

## Current Status

✅ **Sudah Diimplementasi:**
- Role "User" diganti menjadi "Guru" di form users
- Sidebar menu filter berdasarkan role
- Helper function `roleAccess.ts` untuk cek akses
- Component `RoleGuard.tsx` untuk proteksi halaman

⚠️ **Belum Diimplementasi:**
- Proteksi di level page (halaman masih bisa diakses via direct URL)
- Proteksi di level API routes

## Cara Implementasi

### Opsi 1: Menggunakan RoleGuard Component (Recommended)

Tambahkan `RoleGuard` di halaman yang perlu diproteksi.

#### Contoh: Proteksi halaman Users

**File:** `app/users/page.tsx`

```typescript
import RoleGuard from '@/components/RoleGuard';

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        {/* Rest of the page content */}
      </div>
    </RoleGuard>
  );
}
```

#### Contoh: Proteksi halaman Manage Link Habit Tracker

**File:** `app/habit-tracker/manage-link/page.tsx`

```typescript
import RoleGuard from '@/components/RoleGuard';

export default function ManageLinkPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
      {/* Page content */}
    </RoleGuard>
  );
}
```

### Opsi 2: Menggunakan Middleware (Advanced)

Update `middleware.ts` untuk menambahkan role-based access control.

**File:** `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { canAccessPath, UserRole } from '@/lib/roleAccess';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu login
  const publicRoutes = [
    '/login',
    '/api/auth/login',
  ];
  
  // Dynamic routes yang tidak perlu login
  const publicDynamicRoutes = [
    /^\/habit-tracker\/form\/[^/]+$/,
    /^\/habit-tracker\/laporan\/[^/]+$/,
    /^\/habit-tracker\/laporan\/[^/]+\/[^/]+$/,
    /^\/catatan-perilaku\/form\/[^/]+$/,
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) ||
                        publicDynamicRoutes.some(pattern => pattern.test(pathname));

  // Jika belum login dan bukan public route, redirect ke login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan akses /login, redirect ke home
  if (session && pathname === '/login') {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || 
                       request.nextUrl.searchParams.get('from') || 
                       '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // ===== ROLE-BASED ACCESS CONTROL =====
  if (session && !isPublicRoute) {
    const userRole = session.role as UserRole;
    
    // Cek apakah user bisa akses path ini
    if (!canAccessPath(userRole, pathname)) {
      // Redirect ke dashboard dengan pesan error
      const dashboardUrl = new URL('/', request.url);
      dashboardUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Opsi 3: Server-Side Check di Page

Tambahkan check di server component.

**File:** `app/users/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { canAccessPath, UserRole } from '@/lib/roleAccess';

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const userRole = session.role as UserRole;
  
  if (!canAccessPath(userRole, '/users')) {
    redirect('/?error=access_denied');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Page content */}
    </div>
  );
}
```

## Daftar Halaman yang Perlu Diproteksi

### Priority 1: High (Manajemen Data)

```typescript
// Tidak boleh diakses oleh role Guru
const restrictedForGuru = [
  '/users',
  '/data-siswa',
  '/manajemen-data/sekolah',
  '/manajemen-data/tempat',
  '/manajemen-data/pengurus',
  '/cabang',
  '/asrama',
  '/kelas',
  '/rombel',
  '/semester',
  '/tahun-ajaran',
  '/identitas-sekolah',
  '/kepala-asrama',
  '/musyrif',
];
```

**Implementasi:**

```typescript
// app/users/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// app/data-siswa/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// app/manajemen-data/sekolah/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// ... dan seterusnya untuk semua halaman di atas
```

### Priority 2: Medium (Habit Tracker - Restricted)

```typescript
const habitTrackerRestricted = [
  '/habit-tracker', // Input formulir
  '/habit-tracker/manage-link',
  '/habit-tracker/indikator',
  '/habit-tracker/laporan', // Laporan wali santri
];
```

**Implementasi:**

```typescript
// app/habit-tracker/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// app/habit-tracker/manage-link/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// ... dan seterusnya
```

### Priority 3: Medium (Catatan Perilaku - Restricted)

```typescript
const catatanPerilakuRestricted = [
  '/catatan-perilaku/manage-link',
  '/catatan-perilaku/kategori',
];
```

**Implementasi:**

```typescript
// app/catatan-perilaku/manage-link/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>

// app/catatan-perilaku/kategori/page.tsx
<RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
  {/* Content */}
</RoleGuard>
```

## Step-by-Step Implementation

### Step 1: Proteksi Halaman Users (Contoh)

1. Buka file `app/users/page.tsx`
2. Import RoleGuard:
   ```typescript
   import RoleGuard from '@/components/RoleGuard';
   ```
3. Wrap return statement dengan RoleGuard:
   ```typescript
   export default function UsersPage() {
     // ... existing code ...
     
     return (
       <RoleGuard allowedRoles={['admin', 'kepala_asrama', 'musyrif']}>
         <div className="flex min-h-screen bg-slate-50">
           <Sidebar />
           {/* ... rest of content ... */}
         </div>
       </RoleGuard>
     );
   }
   ```

### Step 2: Test Proteksi

1. Login sebagai Guru
2. Coba akses `/users` via direct URL
3. Seharusnya redirect ke `/` (dashboard)

### Step 3: Ulangi untuk Halaman Lain

Ulangi Step 1 untuk semua halaman yang perlu diproteksi.

## API Protection

Untuk proteksi di level API, tambahkan check di setiap API route.

**Contoh:** `app/api/users/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { UserRole } from '@/lib/roleAccess';

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userRole = session.role as UserRole;
  
  // Hanya admin, kepala_asrama, dan musyrif yang bisa create user
  if (!['admin', 'kepala_asrama', 'musyrif'].includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    );
  }

  // ... rest of API logic ...
}
```

## Error Handling

### Tampilkan Pesan Error di Dashboard

**File:** `app/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        {showError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Akses Ditolak!</strong> Anda tidak memiliki izin untuk mengakses halaman tersebut.
          </div>
        )}
        
        {/* Rest of dashboard content */}
      </main>
    </div>
  );
}
```

## Testing Checklist

- [ ] Login sebagai Guru
- [ ] Coba akses `/users` via URL - Should redirect
- [ ] Coba akses `/data-siswa` via URL - Should redirect
- [ ] Coba akses `/habit-tracker/manage-link` via URL - Should redirect
- [ ] Coba akses `/catatan-perilaku/kategori` via URL - Should redirect
- [ ] Verifikasi halaman yang diizinkan masih bisa diakses:
  - [ ] `/` - Dashboard Data
  - [ ] `/overview/habit-tracker` - Dashboard Habit Tracker
  - [ ] `/catatan-perilaku/dashboard` - Dashboard Catatan Perilaku
  - [ ] `/habit-tracker/rekap` - Rekap Habit Tracker
  - [ ] `/catatan-perilaku/input` - Input Catatan
  - [ ] `/catatan-perilaku/riwayat` - Riwayat Catatan

## Recommendations

1. **Gunakan Opsi 1 (RoleGuard)** untuk implementasi cepat dan mudah maintain
2. **Gunakan Opsi 2 (Middleware)** untuk proteksi yang lebih comprehensive
3. **Kombinasi keduanya** untuk security berlapis
4. Selalu tambahkan proteksi di level API juga
5. Log semua access denied attempts untuk audit

## Notes

- RoleGuard component sudah dibuat dan siap digunakan
- Helper function `canAccessPath` sudah tersedia di `lib/roleAccess.ts`
- Implementasi bisa dilakukan secara bertahap (per halaman)
- Prioritaskan halaman yang paling sensitif terlebih dahulu

---

**Status:** Ready to Implement  
**Effort:** Medium (2-4 hours untuk semua halaman)  
**Priority:** High (untuk production deployment)
