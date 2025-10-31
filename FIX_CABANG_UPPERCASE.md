# Fix Cabang Uppercase Issues

## Summary
Masih ada banyak reference ke `.Cabang` (uppercase) yang harus diganti menjadi `.cabang` (lowercase) untuk konsistensi dengan database.

## Files yang sudah diperbaiki:
- ✅ portal-keasramaan/app/asrama/page.tsx
- ✅ portal-keasramaan/app/users/page.tsx

## Files yang masih perlu diperbaiki:
- ⚠️ portal-keasramaan/app/musyrif/page.tsx
- ⚠️ portal-keasramaan/app/kepala-asrama/page.tsx
- ⚠️ portal-keasramaan/app/data-siswa/page.tsx

## Pattern yang perlu diganti:

### 1. Di interface/type
```typescript
// SALAH
item.Cabang
user.Cabang
formData.Cabang
asr.Cabang

// BENAR
item.cabang
user.cabang
formData.cabang
asr.cabang
```

### 2. Di JSX
```tsx
// SALAH
{item.Cabang}
{user.Cabang}
value={formData.Cabang}

// BENAR
{item.cabang}
{user.cabang}
value={formData.cabang}
```

### 3. Di filter/map
```typescript
// SALAH
cabangList.map((lok) => lok.Cabang)
.filter(a => a.Cabang === formData.Cabang)

// BENAR
cabangList.map((lok) => lok.cabang)
.filter(a => a.cabang === formData.cabang)
```

## Cara cepat fix dengan Find & Replace di VS Code:

1. Buka Find & Replace (Ctrl+Shift+H)
2. Enable Regex (icon `.*`)
3. Find: `\.Cabang\b`
4. Replace: `.cabang`
5. Klik "Replace All" di folder `portal-keasramaan/app`

## Verification:
Setelah replace, cek dengan search:
```
\.Cabang
```
Seharusnya tidak ada hasil lagi.
