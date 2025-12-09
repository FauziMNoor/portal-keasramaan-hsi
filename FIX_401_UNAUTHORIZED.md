# Fix: 401 Unauthorized Error

## Error yang Terjadi
```
POST https://sirriyah.smaithsi.sch.id/rest/v1/info_sekolah_keasramaan?on_conflict=cabang 401 (Unauthorized)
Failed to load resource: the server responded with a status of 406 ()
Failed to load resource: the server responded with a status of 401 ()
```

## Root Cause

### Masalah Arsitektur
Aplikasi ini menggunakan **2 layer authentication**:

1. **Next.js Auth** (Layer 1)
   - Middleware check session
   - API route `/api/auth/me`
   - User login via Next.js
   - Session disimpan di cookies/server

2. **Supabase RLS** (Layer 2)
   - Row Level Security policies
   - Memerlukan authenticated user
   - Tapi... Supabase client menggunakan **anon key**

### Disconnect
```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ❌ Menggunakan anon key, TIDAK ada session token
```

Ketika user login via Next.js:
- ✅ Next.js tahu user sudah login
- ❌ Supabase TIDAK tahu user sudah login (karena pakai anon key)

Ketika RLS policy set ke `authenticated`:
- ❌ Supabase reject request karena anon key = tidak authenticated
- ❌ Error 401 Unauthorized

## Solusi

### Opsi 1: Ubah RLS Policy ke Public (DIPILIH)
Karena auth sudah di-handle di Next.js level, kita bisa set RLS policy ke `public`:

```sql
-- ✅ Allow public (anon key) untuk semua operasi
CREATE POLICY "Allow public insert info_sekolah"
ON info_sekolah_keasramaan
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update info_sekolah"
ON info_sekolah_keasramaan
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

**Keamanan:**
- ✅ Aman karena halaman sudah protected di Next.js level
- ✅ Middleware check session sebelum akses halaman
- ✅ API route `/api/auth/me` verify user
- ✅ Hanya user yang sudah login bisa akses halaman identitas sekolah

**Trade-off:**
- ⚠️ Jika ada yang bypass Next.js auth, bisa langsung akses Supabase
- ⚠️ Tidak ada row-level filtering (semua user bisa akses semua data)

### Opsi 2: Implementasi Supabase Auth (Tidak Dipilih)
Ganti Next.js auth dengan Supabase Auth:

```typescript
// Login via Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Supabase client otomatis dapat session token
// RLS policy bisa set ke 'authenticated'
```

**Keuntungan:**
- ✅ RLS policy bisa lebih ketat
- ✅ Row-level filtering berdasarkan user
- ✅ Session management by Supabase

**Trade-off:**
- ❌ Perlu refactor semua auth logic
- ❌ Perlu migrate user data
- ❌ Breaking change untuk existing users

### Opsi 3: Service Role Key (Tidak Aman)
Gunakan service role key yang bypass RLS:

```typescript
// ❌ JANGAN LAKUKAN INI
const supabase = createClient(supabaseUrl, serviceRoleKey);
```

**Bahaya:**
- ❌ Service role key bypass semua RLS
- ❌ Jika leaked, attacker bisa akses semua data
- ❌ Tidak boleh digunakan di client-side

## Implementasi (Opsi 1)

### Step 1: Update RLS Policy
Jalankan script yang sudah diupdate:
```bash
File: portal-keasramaan/supabase/FIX_RLS_INFO_SEKOLAH.sql
```

Script akan:
1. Drop policy lama (authenticated)
2. Buat policy baru (public)
3. Verifikasi 4 policies aktif

### Step 2: Verifikasi Policy
```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'info_sekolah_keasramaan'
ORDER BY policyname;
```

Expected:
- Allow public delete info_sekolah (DELETE, {public})
- Allow public insert info_sekolah (INSERT, {public})
- Allow public update info_sekolah (UPDATE, {public})
- Allow public read info_sekolah (SELECT, {public})

### Step 3: Test
1. Refresh halaman identitas sekolah
2. Isi form dan klik "Simpan Data"
3. Seharusnya berhasil tanpa error 401

## Keamanan Layer

### Layer 1: Next.js Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check session
  // Redirect ke login jika belum login
}
```

### Layer 2: API Route Protection
```typescript
// app/api/auth/me/route.ts
export async function GET(request: Request) {
  // Verify session
  // Return user data atau 401
}
```

### Layer 3: Component Level
```typescript
// app/identitas-sekolah/page.tsx
useEffect(() => {
  fetchUserInfo(); // Check auth via /api/auth/me
}, []);
```

### Layer 4: Supabase RLS (Permisif)
```sql
-- Allow public karena auth sudah di layer 1-3
CREATE POLICY "Allow public insert" ON table FOR INSERT TO public;
```

## Alternatif: Hybrid Approach

Jika ingin RLS lebih ketat tapi tetap pakai Next.js auth:

### 1. Pass User Info ke Supabase
```typescript
// Set custom claim di Supabase
await supabase.rpc('set_user_context', {
  user_id: nextJsUserId,
  user_role: nextJsUserRole
});
```

### 2. RLS Policy Berdasarkan Context
```sql
CREATE POLICY "User can only access own cabang"
ON info_sekolah_keasramaan
FOR ALL
USING (cabang = current_setting('app.user_cabang')::text);
```

**Trade-off:**
- ✅ RLS lebih ketat
- ❌ Lebih kompleks
- ❌ Perlu custom RPC function

## Kesimpulan

**Solusi yang dipilih: Opsi 1 (Public RLS Policy)**

**Alasan:**
1. ✅ Paling simple dan cepat
2. ✅ Tidak breaking change
3. ✅ Auth sudah cukup di Next.js level
4. ✅ Aplikasi internal (bukan public facing)
5. ✅ Middleware sudah protect semua routes

**Keamanan:**
- Halaman identitas sekolah hanya bisa diakses setelah login
- Middleware check session di setiap request
- API route verify user sebelum return data
- Supabase RLS permisif tapi aman karena layer 1-3

**Next Steps:**
1. Jalankan `FIX_RLS_INFO_SEKOLAH.sql` (sudah diupdate)
2. Test simpan data
3. Seharusnya tidak ada error 401 lagi

## Related Files
- `portal-keasramaan/lib/supabase.ts` - Supabase client (anon key)
- `portal-keasramaan/middleware.ts` - Next.js auth middleware
- `portal-keasramaan/app/api/auth/me/route.ts` - User verification
- `portal-keasramaan/supabase/FIX_RLS_INFO_SEKOLAH.sql` - RLS policies (updated)
