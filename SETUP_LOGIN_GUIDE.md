# 🔐 Setup Login & Authentication - Portal Keasramaan

## 📋 Overview

Panduan lengkap untuk membuat sistem login dan autentikasi di Portal Keasramaan menggunakan Supabase.

---

## 🎯 Yang Akan Dibuat

1. ✅ Tabel `users_keasramaan` di Supabase
2. ✅ Halaman Login (`/login`)
3. ✅ Middleware untuk proteksi route
4. ✅ Session management
5. ✅ Logout functionality
6. ✅ User profile di Sidebar
7. ✅ Role-based access control (Admin, Kepala Asrama, Musyrif, User)

---

## 📊 Step 1: Buat Tabel Users di Supabase

### **1.1 Buka Supabase Dashboard**
1. Login ke https://supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### **1.2 Jalankan SQL Script**
1. Copy semua isi file `supabase/CREATE_USERS_TABLE.sql`
2. Paste di SQL Editor
3. Klik **Run** atau tekan `Ctrl + Enter`

### **1.3 Verifikasi Tabel Sudah Dibuat**
```sql
SELECT * FROM users_keasramaan;
```

Anda akan melihat 1 user admin default.

---

## 🔑 Step 2: Install Dependencies

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
npm install jose  # Untuk JWT handling
```

---

## 📝 Step 3: Buat Utility Functions

### **3.1 Password Hashing**
File: `lib/auth.ts`

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### **3.2 Session Management**
File: `lib/session.ts`

```typescript
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export interface SessionData {
  userId: string;
  email: string;
  nama: string;
  role: string;
}

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionData | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session');
}
```

---

## 🎨 Step 4: Buat Halaman Login

### **4.1 Login Page**
File: `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-xl mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Portal Keasramaan
          </h1>
          <p className="text-gray-600">
            HSI Boarding School Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Login
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@hsi.sch.id"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Default Admin:</p>
            <p className="font-mono text-xs mt-1">
              admin@hsi.sch.id / admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 HSI Boarding School. All rights reserved.
        </p>
      </div>
    </div>
  );
}
```

---

## 🔌 Step 5: Buat API Route untuk Login

### **5.1 Login API**
File: `app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cari user di database
    const { data: user, error } = await supabase
      .from('users_keasramaan')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Update last_login
    await supabase
      .from('users_keasramaan')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Buat session
    await createSession({
      userId: user.id,
      email: user.email,
      nama: user.nama_lengkap,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

### **5.2 Logout API**
File: `app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
```

---

## 🛡️ Step 6: Buat Middleware untuk Proteksi Route

File: `middleware.ts` (di root project)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu login
  const publicRoutes = ['/login', '/api/auth/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Jika belum login dan bukan public route, redirect ke login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan akses /login, redirect ke home
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 👤 Step 7: Update Sidebar dengan User Info

Tambahkan di `components/Sidebar.tsx`:

```typescript
// Di bagian atas sidebar, tambahkan user info
const [user, setUser] = useState<any>(null);

useEffect(() => {
  fetchUser();
}, []);

const fetchUser = async () => {
  const res = await fetch('/api/auth/me');
  if (res.ok) {
    const data = await res.json();
    setUser(data.user);
  }
};

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
};

// Tambahkan di bagian bawah sidebar:
{user && (
  <div className="p-4 border-t border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-bold">
          {user.nama.charAt(0)}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{user.nama}</p>
        <p className="text-xs text-gray-500">{user.role}</p>
      </div>
    </div>
    <button
      onClick={handleLogout}
      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Logout
    </button>
  </div>
)}
```

---

## 🔐 Step 8: Buat Hash Password untuk Admin

Jalankan script ini untuk generate password hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"
```

Copy hash yang dihasilkan dan update di Supabase:

```sql
UPDATE users_keasramaan 
SET password_hash = 'PASTE_HASH_DISINI'
WHERE email = 'admin@hsi.sch.id';
```

---

## ✅ Checklist Setup

- [ ] Jalankan SQL script di Supabase
- [ ] Install dependencies (bcryptjs, jose)
- [ ] Buat file `lib/auth.ts`
- [ ] Buat file `lib/session.ts`
- [ ] Buat halaman `/login`
- [ ] Buat API `/api/auth/login`
- [ ] Buat API `/api/auth/logout`
- [ ] Buat API `/api/auth/me`
- [ ] Buat `middleware.ts`
- [ ] Update Sidebar dengan user info
- [ ] Generate dan update password hash admin
- [ ] Test login dengan admin@hsi.sch.id / admin123
- [ ] Ganti password admin setelah login pertama

---

## 🎯 Testing

1. Jalankan `npm run dev`
2. Buka http://localhost:3000
3. Akan redirect ke `/login`
4. Login dengan: admin@hsi.sch.id / admin123
5. Setelah login, akan redirect ke dashboard
6. Test logout

---

## 🔒 Security Best Practices

1. ✅ Password di-hash dengan bcrypt
2. ✅ Session menggunakan JWT dengan expiry
3. ✅ HttpOnly cookies untuk prevent XSS
4. ✅ Row Level Security (RLS) di Supabase
5. ✅ Middleware untuk proteksi route
6. ✅ Role-based access control

---

## 📚 Next Steps

Setelah login berhasil, Anda bisa:
1. Tambah user management page
2. Implementasi forgot password
3. Tambah 2FA (Two-Factor Authentication)
4. Audit log untuk tracking aktivitas
5. Role-based menu di Sidebar

---

**Status**: 📝 Ready to Implement
**Estimated Time**: 2-3 hours
**Difficulty**: ⭐⭐⭐ (Medium)
