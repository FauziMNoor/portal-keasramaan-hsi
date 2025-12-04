# 🔐 Jurnal Musyrif - Role Access Control

## Update Date: December 4, 2024

---

## 🎯 Role Access Matrix

### Menu "Jurnal Musyrif" di Sidebar

| Role | Access Menu | Setup | Manage Link | Rekap | Form Input (via link) |
|------|-------------|-------|-------------|-------|----------------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Kepala Sekolah** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Kepala Asrama** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Musyrif** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes (via link only) |
| **Guru** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |

---

## 📋 Access Details

### 1. **Admin** ✅
**Full Access**
- ✅ Lihat menu "Jurnal Musyrif" di sidebar
- ✅ Akses halaman landing `/jurnal-musyrif`
- ✅ Setup sesi, jadwal, kegiatan
- ✅ Generate & manage link
- ✅ Lihat rekap semua musyrif
- ✅ Input jurnal via link (jika perlu)

**Use Case**: Manage seluruh sistem jurnal musyrif

---

### 2. **Kepala Sekolah** ✅
**Full Access**
- ✅ Lihat menu "Jurnal Musyrif" di sidebar
- ✅ Akses halaman landing `/jurnal-musyrif`
- ✅ Setup sesi, jadwal, kegiatan
- ✅ Generate & manage link
- ✅ Lihat rekap semua musyrif
- ✅ Input jurnal via link (jika perlu)

**Use Case**: Monitor dan manage jurnal musyrif di seluruh sekolah

---

### 3. **Kepala Asrama** ✅
**Full Access**
- ✅ Lihat menu "Jurnal Musyrif" di sidebar
- ✅ Akses halaman landing `/jurnal-musyrif`
- ✅ Setup sesi, jadwal, kegiatan
- ✅ Generate & manage link
- ✅ Lihat rekap musyrif di cabang mereka
- ✅ Input jurnal via link (jika perlu)

**Use Case**: Monitor dan manage jurnal musyrif di cabang/asrama mereka

---

### 4. **Musyrif** ⚠️
**Limited Access - Input Only**
- ❌ TIDAK lihat menu "Jurnal Musyrif" di sidebar
- ❌ TIDAK bisa akses halaman landing
- ❌ TIDAK bisa setup
- ❌ TIDAK bisa manage link
- ❌ TIDAK bisa lihat rekap
- ✅ **HANYA bisa input jurnal via link** yang diberikan admin

**Use Case**: Input jurnal harian mereka sendiri saja

**How to Access**:
1. Admin generate link untuk cabang
2. Admin share link via WhatsApp
3. Musyrif buka link
4. Musyrif pilih nama mereka
5. Musyrif input jurnal

---

### 5. **Guru** ❌
**No Access**
- ❌ TIDAK lihat menu "Jurnal Musyrif" di sidebar
- ❌ TIDAK bisa akses apapun terkait jurnal musyrif

**Use Case**: Tidak terlibat dalam jurnal musyrif

---

## 🔒 Implementation

### Sidebar Filter Logic:
```typescript
const getFilteredMenuItems = () => {
  if (userRole === 'guru' || userRole === 'musyrif') {
    // Filter OUT "Jurnal Musyrif" menu
    return menuItems.filter(menu => 
      menu.title !== 'Jurnal Musyrif' &&
      menu.title !== 'Manajemen Data'
    );
  }
  
  // Admin, Kepala Sekolah, Kepala Asrama: Full access
  return menuItems;
};
```

### Route Protection:
**Frontend**: Menu tidak muncul di sidebar untuk guru & musyrif

**Backend** (Recommended): Add middleware protection
```typescript
// middleware.ts or API routes
if (route.startsWith('/jurnal-musyrif')) {
  if (!['admin', 'kepala_sekolah', 'kepala_asrama'].includes(userRole)) {
    // Allow only form access via valid token
    if (!route.includes('/form/')) {
      return redirect('/unauthorized');
    }
  }
}
```

---

## 🎯 User Journey

### Admin/Kepala Sekolah/Kepala Asrama:
```
1. Login
2. Lihat menu "Jurnal Musyrif" di sidebar
3. Klik menu → Buka landing page
4. Pilih: Setup / Manage Link / Rekap
5. Manage sistem
```

### Musyrif:
```
1. Terima link dari admin via WhatsApp
2. Buka link (misal: /jurnal-musyrif/form/abc123)
3. Pilih nama dari dropdown
4. Input jurnal harian
5. Submit
6. Selesai (tidak bisa akses menu lain)
```

### Guru:
```
1. Login
2. Tidak lihat menu "Jurnal Musyrif"
3. Fokus ke Habit Tracker & Catatan Perilaku saja
```

---

## 🧪 Testing Checklist

### Test as Admin:
- [ ] Menu "Jurnal Musyrif" muncul di sidebar
- [ ] Bisa klik menu → buka landing page
- [ ] Bisa akses Setup
- [ ] Bisa akses Manage Link
- [ ] Bisa akses Rekap
- [ ] Bisa generate link
- [ ] Bisa input via link

### Test as Kepala Sekolah:
- [ ] Menu "Jurnal Musyrif" muncul di sidebar
- [ ] Bisa klik menu → buka landing page
- [ ] Bisa akses Setup
- [ ] Bisa akses Manage Link
- [ ] Bisa akses Rekap
- [ ] Bisa generate link

### Test as Kepala Asrama:
- [ ] Menu "Jurnal Musyrif" muncul di sidebar
- [ ] Bisa klik menu → buka landing page
- [ ] Bisa akses Setup
- [ ] Bisa akses Manage Link
- [ ] Bisa akses Rekap (filter by cabang mereka)
- [ ] Bisa generate link

### Test as Musyrif:
- [ ] Menu "Jurnal Musyrif" TIDAK muncul di sidebar
- [ ] TIDAK bisa akses `/jurnal-musyrif` (redirect/unauthorized)
- [ ] TIDAK bisa akses `/jurnal-musyrif/setup`
- [ ] TIDAK bisa akses `/jurnal-musyrif/manage-link`
- [ ] TIDAK bisa akses `/jurnal-musyrif/rekap`
- [ ] BISA akses `/jurnal-musyrif/form/[token]` (via link)
- [ ] Bisa input jurnal via link

### Test as Guru:
- [ ] Menu "Jurnal Musyrif" TIDAK muncul di sidebar
- [ ] TIDAK bisa akses apapun terkait jurnal musyrif

---

## 📊 Summary

### Who Can See Menu:
- ✅ Admin
- ✅ Kepala Sekolah
- ✅ Kepala Asrama
- ❌ Musyrif (input via link only)
- ❌ Guru

### Who Can Setup:
- ✅ Admin
- ✅ Kepala Sekolah
- ✅ Kepala Asrama

### Who Can Manage Link:
- ✅ Admin
- ✅ Kepala Sekolah
- ✅ Kepala Asrama

### Who Can View Rekap:
- ✅ Admin (all)
- ✅ Kepala Sekolah (all)
- ✅ Kepala Asrama (their cabang)

### Who Can Input Jurnal:
- ✅ Admin (via link)
- ✅ Kepala Sekolah (via link)
- ✅ Kepala Asrama (via link)
- ✅ **Musyrif (via link only)** ⭐

---

## 🔮 Future Enhancements

### Possible Additions:
- [ ] Middleware protection for routes
- [ ] API-level role checking
- [ ] Audit log (who accessed what)
- [ ] Role-based data filtering (Kepala Asrama only see their cabang)
- [ ] Permission management UI

---

## ✅ Status

**Implementation**: ✅ COMPLETE  
**Frontend Protection**: ✅ Menu filtered by role  
**Backend Protection**: ⏳ Recommended (add middleware)  
**Testing**: Ready to test  

---

## 📝 Notes

### Security Layers:
1. **Frontend**: Menu tidak muncul (user experience)
2. **Backend** (Recommended): Route protection (security)

### Current Implementation:
- ✅ Layer 1: Frontend menu filter (DONE)
- ⏳ Layer 2: Backend route protection (RECOMMENDED)

### Why Backend Protection Needed:
- User bisa langsung akses URL (bypass frontend)
- Example: Musyrif bisa ketik `/jurnal-musyrif/setup` di browser
- Backend harus validate role sebelum serve page

---

**Update Version**: Role Access v1.0  
**Date**: December 4, 2024  
**Status**: ✅ Frontend Protection Complete

---

**Terima kasih! Role access control sudah diimplementasikan!** 🔐
