# Role Comparison: All Roles

## 📊 Complete Access Matrix

| Feature | Admin | Kepala Asrama | Musyrif | Guru |
|---------|-------|---------------|---------|------|
| **DASHBOARD** | | | | |
| Dashboard Data | ✅ | ✅ | ✅ | ✅ |
| Dashboard Habit Tracker | ✅ | ✅ | ✅ | ✅ |
| Dashboard Catatan Perilaku | ✅ | ✅ | ✅ | ✅ |
| **MANAJEMEN DATA** | | | | |
| Sekolah | ✅ | ✅ | ❌ | ❌ |
| Tempat | ✅ | ✅ | ❌ | ❌ |
| Pengurus | ✅ | ✅ | ❌ | ❌ |
| Siswa | ✅ | ✅ | ❌ | ❌ |
| Users | ✅ | ✅ | ❌ | ❌ |
| **HABIT TRACKER** | | | | |
| Input Formulir | ✅ | ✅ | ✅ | ❌ |
| Kelola Link Musyrif/ah | ✅ | ✅ | ❌ | ❌ |
| Laporan Wali Santri | ✅ | ✅ | ❌ | ❌ |
| Indikator Penilaian | ✅ | ✅ | ❌ | ❌ |
| Rekap Habit Tracker | ✅ | ✅ | ✅ | ✅ |
| **CATATAN PERILAKU** | | | | |
| Input Catatan | ✅ | ✅ | ✅ | ✅ |
| Kelola Link Token | ✅ | ✅ | ❌ | ❌ |
| Riwayat Catatan | ✅ | ✅ | ✅ | ✅ |
| Kelola Kategori | ✅ | ✅ | ❌ | ❌ |

## 🎯 Role Descriptions

### 1. Admin
**Full Access** - Dapat mengakses semua fitur

**Responsibilities:**
- Mengelola semua data master
- Mengelola user dan role
- Konfigurasi sistem
- Monitoring seluruh aktivitas

**Menu Count:** 20+ menu (100%)

---

### 2. Kepala Asrama
**Full Access** - Dapat mengakses semua fitur

**Responsibilities:**
- Mengelola data asrama
- Monitoring santri
- Mengelola musyrif
- Laporan dan analisis

**Menu Count:** 20+ menu (100%)

---

### 3. Musyrif
**Limited Access** - Fokus pada input dan monitoring

**Responsibilities:**
- Input habit tracker harian santri
- Input catatan perilaku santri
- Monitoring rekap habit tracker
- Melihat riwayat catatan perilaku

**Menu Count:** 7 menu (35%)

**Akses:**
- ✅ 3 Dashboard
- ✅ 2 Habit Tracker (Input + Rekap)
- ✅ 2 Catatan Perilaku (Input + Riwayat)

---

### 4. Guru
**Limited Access** - Fokus pada monitoring dan input catatan

**Responsibilities:**
- Monitoring rekap habit tracker santri
- Input catatan perilaku santri
- Melihat riwayat catatan perilaku

**Menu Count:** 6 menu (30%)

**Akses:**
- ✅ 3 Dashboard
- ✅ 1 Habit Tracker (Rekap only)
- ✅ 2 Catatan Perilaku (Input + Riwayat)

---

## 🔍 Key Differences

### Musyrif vs Guru

| Feature | Musyrif | Guru | Difference |
|---------|---------|------|------------|
| Dashboard | ✅ (3) | ✅ (3) | Same |
| Habit Tracker - Input | ✅ | ❌ | **Musyrif only** |
| Habit Tracker - Rekap | ✅ | ✅ | Same |
| Catatan Perilaku - Input | ✅ | ✅ | Same |
| Catatan Perilaku - Riwayat | ✅ | ✅ | Same |
| Manajemen Data | ❌ | ❌ | Same |
| Total Menu | 7 | 6 | Musyrif +1 |

**Summary:**
- Musyrif memiliki 1 menu lebih: **Input Formulir Habit Tracker**
- Guru hanya bisa melihat rekap, tidak bisa input habit tracker
- Keduanya sama-sama tidak bisa akses Manajemen Data

---

### Admin/Kepala Asrama vs Musyrif/Guru

| Aspect | Admin/Kepala Asrama | Musyrif/Guru |
|--------|---------------------|--------------|
| Access Level | Full | Limited |
| Manajemen Data | ✅ | ❌ |
| Kelola Link/Token | ✅ | ❌ |
| Kelola Kategori | ✅ | ❌ |
| Indikator Penilaian | ✅ | ❌ |
| Input & Monitoring | ✅ | ✅ |
| Dashboard | ✅ | ✅ |

---

## 📱 Visual Menu Structure

### Admin / Kepala Asrama (Full Access)

```
┌─────────────────────────────────────────┐
│  PORTAL KEASRAMAAN                      │
│  Role: Admin / Kepala Asrama            │
└─────────────────────────────────────────┘

📊 OVERVIEW
├── Dashboard Data
├── Dashboard Habit Tracker
└── Dashboard Catatan Perilaku

📁 MANAJEMEN DATA
├── Sekolah
├── Tempat
├── Pengurus
├── Siswa
└── Users

📚 HABIT TRACKER
├── Input Formulir
├── Kelola Link Musyrif/ah
├── Laporan Wali Santri
├── Indikator Penilaian
└── Rekap Habit Tracker

📝 CATATAN PERILAKU
├── Input Catatan
├── Kelola Link Token
├── Riwayat Catatan
└── Kelola Kategori
```

### Musyrif (Limited Access)

```
┌─────────────────────────────────────────┐
│  PORTAL KEASRAMAAN                      │
│  Role: Musyrif                          │
└─────────────────────────────────────────┘

📊 OVERVIEW
├── Dashboard Data
├── Dashboard Habit Tracker
└── Dashboard Catatan Perilaku

📚 HABIT TRACKER
├── Input Formulir          ← Musyrif only
└── Rekap Habit Tracker

📝 CATATAN PERILAKU
├── Input Catatan
└── Riwayat Catatan
```

### Guru (Limited Access)

```
┌─────────────────────────────────────────┐
│  PORTAL KEASRAMAAN                      │
│  Role: Guru                             │
└─────────────────────────────────────────┘

📊 OVERVIEW
├── Dashboard Data
├── Dashboard Habit Tracker
└── Dashboard Catatan Perilaku

📚 HABIT TRACKER
└── Rekap Habit Tracker     ← Read only

📝 CATATAN PERILAKU
├── Input Catatan
└── Riwayat Catatan
```

---

## 🎯 Use Case Scenarios

### Scenario 1: Input Habit Tracker Harian

**Who can do it?**
- ✅ Admin
- ✅ Kepala Asrama
- ✅ **Musyrif** ← Primary user
- ❌ Guru

**Why?**
- Musyrif adalah yang bertanggung jawab langsung untuk input habit tracker santri setiap hari
- Guru hanya perlu melihat rekap untuk monitoring

---

### Scenario 2: Input Catatan Perilaku

**Who can do it?**
- ✅ Admin
- ✅ Kepala Asrama
- ✅ **Musyrif** ← Primary user
- ✅ **Guru** ← Primary user

**Why?**
- Baik Musyrif maupun Guru bisa mencatat pelanggaran/kebaikan santri
- Keduanya berinteraksi langsung dengan santri

---

### Scenario 3: Lihat Rekap Habit Tracker

**Who can do it?**
- ✅ Admin
- ✅ Kepala Asrama
- ✅ **Musyrif**
- ✅ **Guru**

**Why?**
- Semua role perlu monitoring progress santri
- Dashboard untuk evaluasi dan analisis

---

### Scenario 4: Kelola Data Master (Siswa, Kelas, dll)

**Who can do it?**
- ✅ **Admin** ← Primary user
- ✅ **Kepala Asrama**
- ❌ Musyrif
- ❌ Guru

**Why?**
- Data master hanya dikelola oleh admin/kepala asrama
- Musyrif dan Guru fokus pada operasional harian

---

### Scenario 5: Kelola Link Token/Musyrif

**Who can do it?**
- ✅ **Admin** ← Primary user
- ✅ **Kepala Asrama**
- ❌ Musyrif
- ❌ Guru

**Why?**
- Link token/musyrif adalah konfigurasi sistem
- Hanya admin/kepala asrama yang mengelola

---

## 📊 Access Statistics

### Menu Count by Role

```
Admin:           ████████████████████  20+ menus (100%)
Kepala Asrama:   ████████████████████  20+ menus (100%)
Musyrif:         ███████               7 menus (35%)
Guru:            ██████                6 menus (30%)
```

### Access Percentage by Category

**Dashboard:**
```
Admin:           100% ████████████
Kepala Asrama:   100% ████████████
Musyrif:         100% ████████████
Guru:            100% ████████████
```

**Manajemen Data:**
```
Admin:           100% ████████████
Kepala Asrama:   100% ████████████
Musyrif:           0% 
Guru:              0% 
```

**Habit Tracker:**
```
Admin:           100% ████████████
Kepala Asrama:   100% ████████████
Musyrif:          40% █████
Guru:             20% ██
```

**Catatan Perilaku:**
```
Admin:           100% ████████████
Kepala Asrama:   100% ████████████
Musyrif:          50% ██████
Guru:             50% ██████
```

---

## 🔐 Security Hierarchy

```
┌─────────────────────────────────────┐
│         ADMIN                       │  ← Full Control
│  (System Administrator)             │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    KEPALA ASRAMA                    │  ← Full Access
│  (Boarding School Head)             │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│   MUSYRIF      │  │     GURU       │  ← Limited Access
│  (Supervisor)  │  │   (Teacher)    │
└────────────────┘  └────────────────┘
```

**Hierarchy Rules:**
1. Admin > Kepala Asrama > Musyrif/Guru
2. Admin dan Kepala Asrama: Full access
3. Musyrif dan Guru: Limited access
4. Musyrif > Guru (1 menu lebih)

---

## 📝 Implementation Status

| Role | Status | Notes |
|------|--------|-------|
| Admin | ✅ Complete | Full access, no restrictions |
| Kepala Asrama | ✅ Complete | Full access, no restrictions |
| Musyrif | ✅ Complete | Limited access implemented |
| Guru | ✅ Complete | Limited access implemented |

**Security Layers:**
- ✅ UI-level protection (Sidebar filter)
- ⚠️ Page-level protection (Optional, not implemented)
- ⚠️ API-level protection (Recommended, not implemented)

---

## 🚀 Quick Reference

### For Admin/Kepala Asrama
- **Access:** Everything
- **Focus:** Management & Configuration
- **Menu:** All menus available

### For Musyrif
- **Access:** Limited (7 menus)
- **Focus:** Daily input & monitoring
- **Menu:** Dashboard + Input Habit Tracker + Input Catatan + Rekap
- **Key Feature:** Can input habit tracker

### For Guru
- **Access:** Limited (6 menus)
- **Focus:** Monitoring & input catatan
- **Menu:** Dashboard + Rekap Habit Tracker + Input Catatan
- **Key Feature:** Cannot input habit tracker

---

**Last Updated:** 6 November 2025  
**Version:** 1.0
