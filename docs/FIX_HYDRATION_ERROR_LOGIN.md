# Fix: Hydration Error di Login Page

## 🐛 Problem

**Error Message:**
```
Uncaught Error: Hydration failed because the server rendered HTML 
didn't match the client. As a result this tree will be regenerated 
on the client.
```

**Root Cause:**
Menggunakan `window` object di client component yang menyebabkan mismatch antara server-side rendering (SSR) dan client-side rendering (CSR).

**Code yang Bermasalah:**
```typescript
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {  // ❌ Causes hydration error
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || params.get('from') || '/';
  }
  return '/';
};
```

**Why This Causes Hydration Error:**
1. **Server-side:** `window` tidak tersedia, function return `'/'`
2. **Client-side:** `window` tersedia, function return URL dari query params
3. **Result:** HTML yang di-render server berbeda dengan client → Hydration error

## ✅ Solution

Menggunakan `useSearchParams()` dari Next.js yang sudah di-handle dengan baik untuk SSR/CSR.

### Step 1: Import useSearchParams

```typescript
import { useSearchParams } from 'next/navigation';
```

### Step 2: Use useSearchParams Hook

```typescript
const searchParams = useSearchParams();

const getRedirectUrl = () => {
  return searchParams.get('redirect') || searchParams.get('from') || '/';
};
```

### Step 3: Wrap with Suspense

Karena `useSearchParams()` adalah dynamic API, kita perlu wrap component dengan Suspense:

```typescript
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  // ... rest of component
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
```

## 📊 Before vs After

### Before (Hydration Error):

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // ❌ Causes hydration error
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('from') || '/';
    }
    return '/';
  };

  // ... rest of component
}
```

**Problems:**
- ❌ Hydration error
- ❌ Server/client mismatch
- ❌ Console errors
- ❌ Component re-renders

### After (Fixed):

```typescript
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ No hydration error
  const getRedirectUrl = () => {
    return searchParams.get('from') || '/';
  };

  // ... rest of component
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
```

**Benefits:**
- ✅ No hydration error
- ✅ Server/client match
- ✅ No console errors
- ✅ Proper SSR/CSR handling

## 🔍 Understanding Hydration

### What is Hydration?

Hydration adalah proses dimana React "menghidupkan" HTML statis yang di-render di server dengan menambahkan event listeners dan state management di client.

### Hydration Flow:

```
1. Server Renders HTML
   └─> Static HTML sent to browser

2. Browser Displays HTML
   └─> User sees content immediately

3. React Hydrates
   └─> Attaches event listeners
   └─> Initializes state
   └─> Makes page interactive

4. Hydration Check
   └─> Compare server HTML with client render
   └─> If different → Hydration Error ❌
   └─> If same → Success ✅
```

### Common Causes of Hydration Errors:

1. **Using `window` or `document`**
   ```typescript
   // ❌ Bad
   if (typeof window !== 'undefined') {
     // ...
   }
   ```

2. **Using `Date.now()` or `Math.random()`**
   ```typescript
   // ❌ Bad
   const timestamp = Date.now();
   ```

3. **Browser-specific APIs**
   ```typescript
   // ❌ Bad
   const userAgent = navigator.userAgent;
   ```

4. **Invalid HTML nesting**
   ```html
   <!-- ❌ Bad -->
   <p><div>Content</div></p>
   ```

## 🛠️ Best Practices

### 1. Use Next.js Hooks for Dynamic Data

```typescript
// ✅ Good
import { useSearchParams, usePathname } from 'next/navigation';

const searchParams = useSearchParams();
const pathname = usePathname();
```

### 2. Use useEffect for Browser APIs

```typescript
// ✅ Good
import { useEffect, useState } from 'react';

const [userAgent, setUserAgent] = useState('');

useEffect(() => {
  setUserAgent(navigator.userAgent);
}, []);
```

### 3. Use Dynamic Import for Client-Only Components

```typescript
// ✅ Good
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

### 4. Wrap Dynamic Components with Suspense

```typescript
// ✅ Good
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <DynamicComponent />
</Suspense>
```

## 🧪 Testing

### Test 1: No Hydration Error
1. Open browser console
2. Navigate to login page
3. Check for hydration errors
4. **Expected:** No errors ✅

### Test 2: Redirect URL Works
1. Access protected page: `/users`
2. Redirected to: `/login?from=%2Fusers`
3. Login successfully
4. **Expected:** Redirected to `/users` ✅

### Test 3: Dynamic Message Works
1. Access different protected pages
2. Check redirect message on login page
3. **Expected:** Shows correct page name ✅

## 📝 Files Modified

- `app/login/page.tsx`
  - Changed from `window` to `useSearchParams()`
  - Added Suspense boundary
  - Split into `LoginForm` and `LoginPage` components

## 🎯 Impact

### Before:
- ❌ Hydration errors in console
- ❌ Component re-renders unnecessarily
- ❌ Poor user experience
- ❌ Potential performance issues

### After:
- ✅ No hydration errors
- ✅ Proper SSR/CSR handling
- ✅ Better user experience
- ✅ Optimized performance

## 📚 References

- [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

**Last Updated:** 6 November 2025  
**Version:** 1.0  
**Status:** ✅ Fixed
