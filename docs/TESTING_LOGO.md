# Testing Logo Sekolah

## ✅ Perubahan yang Sudah Diterapkan

### 1. Logo di Sidebar (Portal Keasramaan)
- Logo sekolah menggantikan icon topi toga (GraduationCap)
- Container 48x48px (w-12 h-12) dengan background putih
- Logo size 40x40px (w-10 h-10) dengan object-contain
- Fallback ke icon GraduationCap biru jika logo tidak ada

### 2. Logo di Form Musyrif (Habit Tracker)
- Logo ditampilkan dalam container 80x80px (w-20 h-20)
- Logo size 64x64px (w-16 h-16) dengan object-contain
- Background putih dengan border dan shadow
- Fallback ke emoji 🏫 jika logo tidak ada atau error

### 3. Fetch Logo dari Database
- Fungsi `fetchLogoSekolah()` sudah ditambahkan di kedua tempat
- Mengambil logo dari tabel `identitas_sekolah_keasramaan`
- Support URL langsung dan Supabase Storage path

### 3. Error Handling
- Try-catch untuk fetch logo
- onError handler untuk fallback otomatis
- Console.log untuk debugging

## 🧪 Cara Testing

### Step 1: Upload Logo di Identitas Sekolah
1. Buka menu **Identitas Sekolah**
2. Upload logo (JPG/PNG/SVG, max 2MB)
3. Klik **Simpan Data**

### Step 2: Verifikasi Logo di Sidebar
1. **Refresh halaman** atau buka halaman lain
2. Periksa **sidebar kiri** - logo sekolah harus muncul menggantikan icon topi toga
3. Logo muncul di atas tulisan "PORTAL KEASRAMAAN"

### Step 3: Verifikasi Logo di Form Musyrif
1. Buka link musyrif (dari menu Token Musyrif)
2. Periksa header - logo sekolah harus muncul di atas "Habit Tracker"
3. Buka Console Browser (F12) untuk melihat log

### Step 4: Verifikasi
**Jika logo muncul di kedua tempat:**
- ✅ Logo sekolah tampil di sidebar
- ✅ Logo sekolah tampil di form musyrif
- ✅ Size dan styling sesuai

**Jika logo tidak muncul:**
- Cek Console Browser untuk error
- Pastikan logo sudah diupload di Identitas Sekolah
- Pastikan bucket 'logos' sudah dibuat di Supabase Storage
- Refresh browser dengan Ctrl+F5 (hard refresh)

## 🔍 Debugging

### Console Logs yang Akan Muncul:
```
Logo data: { logo: "logo-1234567890.png" }
Public URL: https://xxx.supabase.co/storage/v1/object/public/logos/logo-1234567890.png
```

### Jika Logo Tidak Muncul:
1. **"No logo found in database"** → Belum upload logo di Identitas Sekolah
2. **Error fetching logo** → Masalah koneksi atau permission
3. **Public URL undefined** → Bucket 'logos' belum dibuat atau tidak public

## 📦 Supabase Storage Setup

Pastikan bucket 'logos' sudah dibuat:
1. Buka Supabase Dashboard
2. Storage → Create bucket 'logos'
3. Set bucket sebagai **Public**
4. Upload logo via menu Identitas Sekolah

## 🎨 Tampilan Logo

### Sidebar (Portal Keasramaan)
```
┌──────────────────┐
│ ┌────┐  PORTAL  │
│ │LOGO│ KEASRAMAAN│  ← Logo 40x40px
│ └────┘           │    Container 48x48px
│ HSI Boarding...  │    Background: white
└──────────────────┘
```

### Form Musyrif (Habit Tracker)
```
┌─────────────────────┐
│   ┌───────────┐     │
│   │           │     │  ← Container 80x80px
│   │   LOGO    │     │    Background: white
│   │  64x64px  │     │    Border: gray-100
│   │           │     │    Shadow: lg
│   └───────────┘     │
│                     │
│   Habit Tracker     │
│ HSI Boarding School │
└─────────────────────┘
```

## ✨ Fitur Logo

- ✅ Auto-fetch saat page load
- ✅ Support URL eksternal
- ✅ Support Supabase Storage
- ✅ Fallback ke emoji 🏫
- ✅ Error handling
- ✅ Responsive design
- ✅ Object-contain (tidak terdistorsi)
