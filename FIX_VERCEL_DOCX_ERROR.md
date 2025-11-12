# 🔧 FIX: Vercel Build Error - Module 'docx' Not Found

## ❌ Error

```
Module not found: Can't resolve 'docx'
./app/api/perizinan/generate-surat-docx/route.ts:4:1
./lib/docx-generator.ts:1:1
```

## 🎯 Penyebab

Error ini terjadi saat deploy ke Vercel/production karena:
1. Dependencies tidak ter-install dengan benar
2. Cache build yang lama
3. Package.json tidak ter-commit

## ✅ Solusi

### Solusi 1: Verify Package.json (PALING PENTING)

**Pastikan `docx` dan `file-saver` ada di dependencies:**

```json
{
  "dependencies": {
    "docx": "^9.5.1",
    "file-saver": "^2.0.5",
    ...
  }
}
```

**Jika belum ada, tambahkan:**
```bash
npm install docx file-saver --save
```

### Solusi 2: Commit & Push ke GitHub

```bash
# Add semua perubahan
git add .

# Commit
git commit -m "Add DOCX download feature with dependencies"

# Push ke GitHub
git push origin main
```

### Solusi 3: Clear Vercel Cache

**Di Vercel Dashboard:**
1. Buka project settings
2. Pilih "Deployments"
3. Klik "..." pada deployment terakhir
4. Pilih "Redeploy"
5. Centang "Clear Build Cache"
6. Klik "Redeploy"

### Solusi 4: Environment Variables (Jika Perlu)

Pastikan environment variables sudah di-set di Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Solusi 5: Vercel Build Settings

**Di Vercel Dashboard → Settings → General:**

**Build Command:**
```bash
npm run build
```

**Install Command:**
```bash
npm install
```

**Node Version:**
```
20.x (atau sesuai package.json)
```

## 🧪 Test Local Build

Sebelum deploy, test build local:

```bash
# Clear cache
rm -r .next

# Install dependencies
npm install

# Build
npm run build

# Jika berhasil, commit dan push
git add .
git commit -m "Fix build"
git push
```

## 📋 Checklist

- [ ] `docx` dan `file-saver` ada di package.json dependencies
- [ ] package.json sudah di-commit ke git
- [ ] package-lock.json sudah di-commit ke git
- [ ] Local build berhasil (`npm run build`)
- [ ] Push ke GitHub
- [ ] Clear Vercel cache
- [ ] Redeploy di Vercel

## 🔍 Verify Dependencies

**Check package.json:**
```bash
cat package.json | grep -A 5 "dependencies"
```

**Check installed packages:**
```bash
npm list docx file-saver
```

**Output yang benar:**
```
portal-keasramaan@0.1.0
├── docx@9.5.1
└── file-saver@2.0.5
```

## 🆘 Jika Masih Error

### Option 1: Reinstall Dependencies

```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install

# Build
npm run build

# Commit
git add .
git commit -m "Reinstall dependencies"
git push
```

### Option 2: Specify Exact Versions

Update package.json dengan exact versions:

```json
{
  "dependencies": {
    "docx": "9.5.1",
    "file-saver": "2.0.5"
  }
}
```

```bash
npm install
git add package.json package-lock.json
git commit -m "Lock dependency versions"
git push
```

### Option 3: Alternative - Disable DOCX Feature

Jika urgent dan perlu deploy cepat, temporary disable DOCX feature:

**1. Comment out import di approval page:**
```typescript
// Temporary disable DOCX download
// import { generateSuratIzinDocx } from '@/lib/docx-generator';
```

**2. Hide Word download button:**
```typescript
{/* Temporary disabled
<button onClick={() => handleDownloadSurat(item.id, 'docx')}>
  Download Word
</button>
*/}
```

**3. Deploy, lalu fix nanti**

## 📝 Notes

- Error ini HANYA terjadi di production/Vercel
- Local build berhasil karena node_modules sudah ada
- Vercel install dependencies dari package.json
- Pastikan package.json ter-commit dengan benar

## ✅ Success Indicators

Setelah fix, Vercel build log harus show:

```
Installing dependencies...
npm install
...
added 757 packages
...
Building...
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (54/54)
```

---
**Update:** 2024
**Status:** Troubleshooting Guide
