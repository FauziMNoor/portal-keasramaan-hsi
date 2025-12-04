# 🚀 Quick Reference - Portal Keasramaan

## 📍 Important Links

### Main Documentation
- 📄 **START HERE**: `START_FROM_HERE.md` - Complete overview
- ✅ **Checklist**: `IMPLEMENTATION_CHECKLIST.md` - 100+ items

### Jurnal Musyrif (NEW! ⭐)
- 📖 **Feature Docs**: `docs/JURNAL_MUSYRIF.md`
- 🔧 **API Reference**: `docs/JURNAL_MUSYRIF_API.md`
- 🚀 **Deployment**: `JURNAL_MUSYRIF_DEPLOYMENT.md`
- 📊 **Summary**: `JURNAL_MUSYRIF_SUMMARY.md`
- 🔧 **Fix Log**: `JURNAL_MUSYRIF_FIX_SUFFIX.md`

---

## 🗺️ Routes Map

### Public Routes
- `/login` - Login page

### Dashboard
- `/` - Main dashboard
- `/overview/habit-tracker` - Habit Tracker dashboard
- `/overview/jurnal-musyrif` - Jurnal Musyrif dashboard ⭐

### Manajemen Data
- `/manajemen-data/sekolah` - Identitas sekolah
- `/manajemen-data/tempat` - Cabang/lokasi
- `/manajemen-data/pengurus` - Kepala asrama & musyrif
- `/data-siswa` - Data siswa
- `/users` - User management

### Habit Tracker
- `/habit-tracker` - Input formulir
- `/habit-tracker/manage-link` - Manage link
- `/habit-tracker/indikator` - Setup indikator
- `/habit-tracker/rekap` - Rekap data
- `/habit-tracker/laporan` - Laporan wali santri
- `/habit-tracker/form/[token]` - Form via link

### Catatan Perilaku
- `/catatan-perilaku/input` - Input catatan
- `/catatan-perilaku/manage-link` - Manage link
- `/catatan-perilaku/riwayat` - Riwayat catatan
- `/catatan-perilaku/kategori` - Kelola kategori
- `/catatan-perilaku/dashboard` - Dashboard
- `/catatan-perilaku/form/[token]` - Form via link

### Perizinan
- `/perizinan/kepulangan` - Input perizinan
- `/perizinan/kepulangan/manage-link` - Manage link
- `/perizinan/kepulangan/approval` - Approval
- `/perizinan/kepulangan/rekap` - Rekap
- `/perizinan/kepulangan/dashboard` - Dashboard
- `/perizinan/kepulangan/form/[token]` - Form via link

### Jurnal Musyrif ⭐ NEW
- `/jurnal-musyrif` - Landing page
- `/jurnal-musyrif/setup` - Setup sesi/jadwal/kegiatan
- `/jurnal-musyrif/manage-link` - Manage link
- `/jurnal-musyrif/form/[token]` - Form input via link

### Manajemen Rapor
- `/manajemen-rapor` - Coming soon

---

## 🗄️ Database Tables

### Master Data
- `identitas_sekolah_keasramaan`
- `cabang_keasramaan`
- `kelas_keasramaan`
- `asrama_keasramaan`
- `kepala_asrama_keasramaan`
- `musyrif_keasramaan`
- `data_siswa_keasramaan`
- `users_keasramaan`

### Habit Tracker
- `indikator_keasramaan`
- `token_musyrif_keasramaan`
- `formulir_habit_tracker_keasramaan`

### Catatan Perilaku
- `kategori_perilaku_keasramaan`
- `token_catatan_perilaku_keasramaan`
- `catatan_perilaku_keasramaan`

### Perizinan
- `token_perizinan_keasramaan`
- `perizinan_kepulangan_keasramaan`

### Jurnal Musyrif ⭐ NEW
- `sesi_jurnal_musyrif_keasramaan`
- `jadwal_jurnal_musyrif_keasramaan`
- `kegiatan_jurnal_musyrif_keasramaan`
- `token_jurnal_musyrif_keasramaan`
- `formulir_jurnal_musyrif_keasramaan`

---

## 🔑 Key Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
```

### Database
```bash
# Run migration (via Supabase Dashboard SQL Editor)
# Copy-paste migration file content and run

# Test Jurnal Musyrif migration
# Run: scripts/test-jurnal-musyrif-migration.sql
```

### Deployment
```bash
npm run build        # Build first
./DEPLOY_TO_SERVER.sh  # Deploy to server
pm2 start ecosystem.config.js  # Start with PM2
```

---

## 🎯 Quick Tasks

### Setup New Musyrif for Jurnal
1. Go to `/jurnal-musyrif/manage-link`
2. Click "Buat Link Baru"
3. Select musyrif from dropdown
4. Click "Buat Link"
5. Copy link and share via WhatsApp

### Input Jurnal Harian (Musyrif)
1. Open link from admin
2. Select tanggal, tahun ajaran, semester
3. Check kegiatan yang terlaksana
4. Use "Select All" for quick input
5. Add catatan if needed
6. Click "Simpan Jurnal Harian"

### Monitor Jurnal (Admin)
1. Go to `/overview/jurnal-musyrif`
2. Select date range
3. View stats and musyrif ranking
4. Export if needed (coming soon)

### Add New Kegiatan
1. Go to `/jurnal-musyrif/setup`
2. Click tab "Kegiatan"
3. Click "Tambah Kegiatan"
4. Select jadwal, fill deskripsi
5. Click "Simpan"

---

## 🐛 Troubleshooting Quick Fixes

### Issue: Link tidak valid
**Fix**: Check if token is active in manage-link page

### Issue: Data tidak muncul di dashboard
**Fix**: 
1. Check date range filter
2. Verify data has been submitted
3. Check browser console for errors

### Issue: Migration error
**Fix**:
1. Check if tables already exist
2. Drop existing tables if needed
3. Run migration again

### Issue: Form tidak bisa submit
**Fix**:
1. Check all required fields filled
2. Check browser console
3. Verify Supabase connection

---

## 📊 Default Data (Jurnal Musyrif)

### Sesi (5)
- SESI 1: 03:30 - 06:30 (Subuh & Tahfidz)
- SESI 2: 05:30 - 07:45 (KBM Pagi)
- SESI 3: 10:00 - 12:30 (Dzuhur & KBM)
- SESI 4: 15:00 - 18:00 (Ashar & Maghrib)
- SESI 5: 18:15 - 22:00 (Isya & Malam)

### Jadwal (29)
- Distributed across 5 sesi
- Time-based activities

### Kegiatan (78)
- Complete daily activities
- From waking up to sleeping
- Includes prayers, study, meals, etc.

---

## 👥 User Roles

### Admin
- Full access to all features
- Can setup master data
- Can generate links
- Can view all dashboards

### Kepala Sekolah
- Full access to all features
- View all reports

### Kepala Asrama
- Access to their cabang data
- Can generate links
- View dashboards

### Musyrif
- Input via links only
- Limited dashboard access

### Guru
- Input catatan perilaku
- Limited access

---

## 🔐 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
NODE_ENV=development|production
```

---

## 📱 Mobile Access

All features are mobile responsive:
- ✅ Dashboard
- ✅ Form input
- ✅ Manage links
- ✅ Setup pages
- ✅ Reports

---

## 🎨 UI Components

### Icons (Lucide React)
- Settings, Link, FileText, BarChart3
- CheckCircle, CheckSquare, Square
- Calendar, Users, Clock, etc.

### Colors
- Primary: Blue (500-600)
- Success: Green (500-600)
- Warning: Orange/Yellow (500-600)
- Danger: Red (500-600)
- Info: Purple/Indigo (500-600)

### Styling
- Tailwind CSS
- Gradient backgrounds
- Rounded corners (xl, 2xl)
- Shadow effects
- Hover transitions

---

## 📞 Support

### Documentation
1. Read `START_FROM_HERE.md`
2. Check feature-specific docs in `docs/`
3. Review migration files
4. Check API reference

### Common Questions

**Q: How to add new sesi?**
A: Go to `/jurnal-musyrif/setup`, tab "Sesi", click "Tambah Sesi"

**Q: How to deactivate a link?**
A: Go to manage-link page, click eye icon to toggle

**Q: How to export data?**
A: Coming soon (use Supabase dashboard for now)

**Q: How to reset password?**
A: Via Supabase Auth (implement forgot password feature)

---

## 🚀 Next Steps

### For New Developers
1. Read `START_FROM_HERE.md`
2. Setup local environment
3. Run migrations
4. Test all features
5. Read code structure

### For Deployment
1. Read `JURNAL_MUSYRIF_DEPLOYMENT.md`
2. Run production migrations
3. Test on staging first
4. Deploy to production
5. Monitor logs

### For Users
1. Login to system
2. Explore dashboard
3. Try Jurnal Musyrif feature
4. Generate test link
5. Submit test data

---

**Last Updated**: December 4, 2024  
**Quick Reference Version**: 1.0.0

---

**Need more help?** Check `START_FROM_HERE.md` for complete documentation!
