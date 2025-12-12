# 📋 Struktur Menu KPI di Sidebar

## Menu KPI yang Ditambahkan

Sistem KPI sudah terintegrasi ke sidebar dengan 2 menu utama:

### 1. **KPI Musyrif** 🎯
Menu untuk musyrif dan kepala asrama mengelola KPI harian

**Submenu:**
- **Dashboard KPI Saya** (`/kpi/musyrif/dashboard`)
  - Auto-redirect ke `/kpi/musyrif/[nama]` berdasarkan user login
  - Menampilkan KPI individual musyrif
  - Tier breakdown, trend, improvement areas
  
- **Jadwal Libur** (`/manajemen-data/jadwal-libur-musyrif`)
  - Generate jadwal rutin
  - Ajukan cuti/izin
  - Lihat jadwal libur
  
- **Rapat Koordinasi** (`/koordinasi/rapat`)
  - Buat rapat baru
  - Input kehadiran
  - Lihat history rapat
  
- **Log Kolaborasi** (`/koordinasi/log-kolaborasi`)
  - Tambah log kolaborasi
  - Rating kolaborasi
  - Lihat history kolaborasi

**Access:**
- ✅ Musyrif: Full access
- ✅ Kepala Asrama: Full access
- ✅ Kepala Sekolah: Full access
- ✅ Admin: Full access
- ❌ Guru: No access

---

### 2. **KPI Management** 📊
Menu untuk kepala asrama, kepala sekolah, dan admin mengelola KPI tim

**Submenu:**
- **Dashboard Tim** (`/kpi/kepala-asrama`)
  - Overview KPI tim per cabang
  - Top performers
  - Musyrif perlu perhatian
  - Ranking musyrif
  
- **Dashboard Global** (`/kpi/kepala-sekolah`)
  - Overview KPI semua cabang
  - Top 5 musyrif global
  - Comparison antar cabang
  - Statistics global
  
- **Approval Cuti** (`/approval/cuti-musyrif`)
  - Approve/reject pengajuan cuti
  - 2-level approval workflow
  - History approval
  
- **Hitung KPI** (`/admin/kpi-calculation`)
  - Manual trigger calculation
  - Batch calculation
  - View results

**Access:**
- ❌ Musyrif: No access
- ✅ Kepala Asrama: Dashboard Tim + Approval Cuti only
- ✅ Kepala Sekolah: Full access
- ✅ Admin: Full access
- ❌ Guru: No access

---

## Role-Based Access Control

### Musyrif / Guru
**Dapat Akses:**
- ✅ KPI Musyrif (semua submenu)
- ✅ Dashboard KPI Saya (hanya KPI sendiri)
- ✅ Jadwal Libur (lihat & ajukan cuti)
- ✅ Rapat Koordinasi (lihat & input kehadiran)
- ✅ Log Kolaborasi (tambah & lihat)

**Tidak Dapat Akses:**
- ❌ KPI Management
- ❌ Dashboard Tim
- ❌ Dashboard Global
- ❌ Approval Cuti (hanya bisa ajukan)
- ❌ Hitung KPI

---

### Kepala Asrama
**Dapat Akses:**
- ✅ KPI Musyrif (semua submenu)
- ✅ Dashboard KPI Saya
- ✅ Jadwal Libur (full access)
- ✅ Rapat Koordinasi (full access)
- ✅ Log Kolaborasi (full access + rating)
- ✅ Dashboard Tim (KPI tim di cabangnya)
- ✅ Approval Cuti (level 1 approval)

**Tidak Dapat Akses:**
- ❌ Dashboard Global (hanya kepala sekolah)
- ❌ Hitung KPI (hanya admin)

---

### Kepala Sekolah
**Dapat Akses:**
- ✅ KPI Musyrif (semua submenu)
- ✅ KPI Management (semua submenu)
- ✅ Dashboard KPI Saya
- ✅ Dashboard Tim (semua cabang)
- ✅ Dashboard Global
- ✅ Approval Cuti (level 2 approval)
- ✅ Jadwal Libur (view all)
- ✅ Rapat Koordinasi (view all)
- ✅ Log Kolaborasi (view all)

**Tidak Dapat Akses:**
- ❌ Hitung KPI (hanya admin)

---

### Admin
**Dapat Akses:**
- ✅ **FULL ACCESS** ke semua menu KPI
- ✅ KPI Musyrif (semua submenu)
- ✅ KPI Management (semua submenu)
- ✅ Hitung KPI (manual trigger)
- ✅ Semua dashboard
- ✅ Semua approval

---

## Implementasi di Sidebar

### File: `components/Sidebar.tsx`

**Perubahan:**
1. ✅ Import icon baru: `Target`, `TrendingUp`, `CalendarCheck`, `MessageSquare`, `Calculator`
2. ✅ Tambah 2 menu baru di `menuItems[]`:
   - `KPI Musyrif`
   - `KPI Management`
3. ✅ Update fungsi `getFilteredMenuItems()` untuk filter by role
4. ✅ Logic filtering:
   - Musyrif/Guru: Hanya `KPI Musyrif`
   - Kepala Asrama: `KPI Musyrif` + `KPI Management` (terbatas)
   - Kepala Sekolah: Full access
   - Admin: Full access

### File: `app/kpi/musyrif/dashboard/page.tsx`

**Fungsi:**
- Auto-redirect dari `/kpi/musyrif/dashboard` ke `/kpi/musyrif/[nama]`
- Fetch user dari `/api/auth/me`
- Redirect berdasarkan `user.nama`
- Loading state & error handling

---

## Testing Checklist

### Test Menu Visibility
- [ ] Login sebagai **Musyrif** → Hanya lihat menu "KPI Musyrif"
- [ ] Login sebagai **Kepala Asrama** → Lihat "KPI Musyrif" + "KPI Management" (terbatas)
- [ ] Login sebagai **Kepala Sekolah** → Lihat semua menu KPI
- [ ] Login sebagai **Admin** → Lihat semua menu KPI

### Test Navigation
- [ ] Klik "Dashboard KPI Saya" → Redirect ke `/kpi/musyrif/[nama]`
- [ ] Klik "Jadwal Libur" → Buka halaman jadwal libur
- [ ] Klik "Rapat Koordinasi" → Buka halaman rapat
- [ ] Klik "Log Kolaborasi" → Buka halaman log kolaborasi
- [ ] Klik "Dashboard Tim" → Buka dashboard kepala asrama
- [ ] Klik "Dashboard Global" → Buka dashboard kepala sekolah
- [ ] Klik "Approval Cuti" → Buka halaman approval
- [ ] Klik "Hitung KPI" → Buka halaman calculation

### Test Access Control
- [ ] Musyrif tidak bisa akses `/kpi/kepala-asrama`
- [ ] Musyrif tidak bisa akses `/kpi/kepala-sekolah`
- [ ] Musyrif tidak bisa akses `/admin/kpi-calculation`
- [ ] Kepala Asrama tidak bisa akses `/kpi/kepala-sekolah`
- [ ] Kepala Asrama tidak bisa akses `/admin/kpi-calculation`
- [ ] Kepala Sekolah bisa akses semua (kecuali calculation)
- [ ] Admin bisa akses semua

---

## Screenshots (Optional)

### Menu KPI Musyrif
```
🎯 KPI Musyrif
   📈 Dashboard KPI Saya
   📅 Jadwal Libur
   👥 Rapat Koordinasi
   💬 Log Kolaborasi
```

### Menu KPI Management
```
🎯 KPI Management
   📈 Dashboard Tim
   📊 Dashboard Global
   ✅ Approval Cuti
   🧮 Hitung KPI
```

---

## Next Steps

1. ✅ Menu KPI sudah ditambahkan ke sidebar
2. ✅ Role-based access control implemented
3. ✅ Auto-redirect dashboard musyrif
4. ⏳ Test semua menu dengan berbagai role
5. ⏳ Deploy ke production
6. ⏳ Training user tentang menu baru

---

**Created:** December 10, 2024  
**Status:** ✅ Complete  
**Version:** 1.0.0
