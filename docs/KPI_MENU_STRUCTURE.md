# 📋 Struktur Menu KPI - Sidebar

## Menu KPI Musyrif (Satu Menu Terpadu)

Menu KPI telah digabung menjadi satu menu dengan submenu yang terstruktur berdasarkan role.

---

## 🎯 Struktur Menu Lengkap

```
📊 KPI Musyrif
   ├─ 📈 Dashboard KPI Saya       → /kpi/musyrif/dashboard
   ├─ 👥 Dashboard Tim            → /kpi/kepala-asrama
   ├─ 🌐 Dashboard Global         → /kpi/kepala-sekolah
   ├─ 📅 Jadwal Libur             → /manajemen-data/jadwal-libur-musyrif
   ├─ ✅ Approval Cuti            → /approval/cuti-musyrif
   ├─ 💬 Rapat Koordinasi         → /koordinasi/rapat
   ├─ 🤝 Log Kolaborasi           → /koordinasi/log-kolaborasi
   └─ 🧮 Hitung KPI               → /admin/kpi-calculation
```

---

## 🔐 Access Control by Role

### 1. **Musyrif / Guru**
Hanya bisa akses 4 submenu:
- ✅ Dashboard KPI Saya
- ✅ Jadwal Libur
- ✅ Rapat Koordinasi
- ✅ Log Kolaborasi

**Tidak bisa akses:**
- ❌ Dashboard Tim
- ❌ Dashboard Global
- ❌ Approval Cuti
- ❌ Hitung KPI

---

### 2. **Kepala Asrama**
Bisa akses 7 submenu (semua kecuali Dashboard Global & Hitung KPI):
- ✅ Dashboard KPI Saya
- ✅ Dashboard Tim
- ✅ Jadwal Libur
- ✅ Approval Cuti
- ✅ Rapat Koordinasi
- ✅ Log Kolaborasi

**Tidak bisa akses:**
- ❌ Dashboard Global (hanya untuk Kepala Sekolah)
- ❌ Hitung KPI (hanya untuk Admin)

---

### 3. **Kepala Sekolah**
Bisa akses 7 submenu (semua kecuali Hitung KPI):
- ✅ Dashboard KPI Saya
- ✅ Dashboard Tim
- ✅ Dashboard Global
- ✅ Jadwal Libur
- ✅ Approval Cuti
- ✅ Rapat Koordinasi
- ✅ Log Kolaborasi

**Tidak bisa akses:**
- ❌ Hitung KPI (hanya untuk Admin)

---

### 4. **Admin**
Full access ke semua submenu (8 submenu):
- ✅ Dashboard KPI Saya
- ✅ Dashboard Tim
- ✅ Dashboard Global
- ✅ Jadwal Libur
- ✅ Approval Cuti
- ✅ Rapat Koordinasi
- ✅ Log Kolaborasi
- ✅ Hitung KPI

---

## 📊 Kategori Submenu

### **Dashboard & Reporting**
1. **Dashboard KPI Saya** - Individual KPI view
2. **Dashboard Tim** - Team KPI view (Kepala Asrama)
3. **Dashboard Global** - Global KPI view (Kepala Sekolah)

### **Manajemen Jadwal & Cuti**
4. **Jadwal Libur** - Generate jadwal rutin & ajukan cuti
5. **Approval Cuti** - Approve/reject pengajuan cuti (2-level approval)

### **Koordinasi & Kolaborasi**
6. **Rapat Koordinasi** - Buat rapat & input kehadiran
7. **Log Kolaborasi** - Catat inisiatif kolaborasi & rating

### **Administration**
8. **Hitung KPI** - Manual trigger batch calculation (Admin only)

---

## 🎨 Visual Design

### Icon Mapping
- 📈 **TrendingUp** - Dashboard KPI Saya
- 👥 **Users** - Dashboard Tim
- 🌐 **BarChart3** - Dashboard Global
- 📅 **CalendarCheck** - Jadwal Libur
- ✅ **CheckCircle** - Approval Cuti
- 💬 **MessageSquare** - Rapat Koordinasi
- 🤝 **MessageSquare** - Log Kolaborasi
- 🧮 **Calculator** - Hitung KPI

### Color Scheme
- **Active Menu**: Blue gradient (from-blue-500 to-blue-600)
- **Hover**: Light blue (bg-blue-50)
- **Text**: Gray-700 (default), White (active)

---

## 🔄 Auto-Redirect Feature

**Dashboard KPI Saya** (`/kpi/musyrif/dashboard`):
- Auto-redirect ke `/kpi/musyrif/[nama]` berdasarkan user yang login
- Fetch user dari `/api/auth/me`
- Loading state dengan spinner
- Error handling dengan fallback

---

## 📱 Responsive Behavior

### Desktop (lg+)
- Sidebar fixed di kiri
- Menu expand/collapse dengan button
- Submenu slide down animation

### Mobile (<lg)
- Sidebar slide dari kiri
- Overlay backdrop
- Hamburger menu button (top-left)
- Auto-close setelah klik menu

---

## 🚀 Implementation Details

### File Location
- **Component**: `portal-keasramaan/components/Sidebar.tsx`
- **Auto-redirect**: `portal-keasramaan/app/kpi/musyrif/dashboard/page.tsx`

### Key Functions
```typescript
// Filter menu berdasarkan role
const getFilteredMenuItems = () => {
  if (userRole === 'guru' || userRole === 'musyrif') {
    // Filter untuk musyrif (4 submenu)
  }
  if (userRole === 'kepala_asrama') {
    // Filter untuk kepala asrama (7 submenu)
  }
  if (userRole === 'kepala_sekolah') {
    // Filter untuk kepala sekolah (7 submenu)
  }
  // Admin: full access (8 submenu)
}
```

---

## ✅ Benefits

1. **Satu Menu Terpadu** - Tidak ada duplikasi menu KPI
2. **Role-Based Access** - Otomatis filter berdasarkan role
3. **Terstruktur** - Submenu dikelompokkan berdasarkan kategori
4. **User-Friendly** - Mudah dinavigasi
5. **Scalable** - Mudah menambah submenu baru

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2024  
**Status**: ✅ Implemented
