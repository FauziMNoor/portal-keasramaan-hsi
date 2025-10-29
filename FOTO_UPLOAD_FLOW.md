# 📸 Upload Foto User - Flow Diagram

## 🔄 Upload Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. User pilih file di PhotoUpload component                │
│     - Drag & drop ATAU click to browse                      │
│     - Validasi: image only, max 2MB                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Preview foto di browser (client-side)                   │
│     - FileReader API                                        │
│     - Show preview image                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. User submit form                                        │
│     - handleSubmit() triggered                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Upload foto ke Supabase Storage                         │
│     - uploadPhoto(file, 'users')                            │
│     - Generate unique filename                              │
│     - Upload to: user-photos/users/[timestamp]-[random].jpg │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Simpan path foto ke database                            │
│     - users_keasramaan.foto = "users/[filename].jpg"        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Foto muncul di UI                                       │
│     - Tabel users: getPhotoUrl(user.foto)                   │
│     - Sidebar: getPhotoUrl(session.user.foto)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
portal-keasramaan/
│
├── lib/
│   └── upload.ts                    ← Upload utilities
│       ├── uploadPhoto()            → Upload file ke storage
│       ├── getPhotoUrl()            → Get public URL
│       └── deletePhoto()            → Delete file
│
├── components/
│   ├── PhotoUpload.tsx              ← Upload component
│   │   ├── Drag & drop
│   │   ├── Preview
│   │   ├── Validation
│   │   └── Remove button
│   │
│   └── Sidebar.tsx                  ← Show user photo
│       └── UserProfile component
│
├── app/
│   ├── users/
│   │   └── page.tsx                 ← Users management
│   │       ├── PhotoUpload integration ✅
│   │       ├── Upload on create ✅
│   │       ├── Upload on edit ✅
│   │       └── Show photo in table ✅
│   │
│   └── api/
│       ├── users/
│       │   ├── create/route.ts      ← Support foto field
│       │   ├── update/route.ts      ← Support foto field
│       │   └── upload-photo/route.ts ← Upload endpoint
│       │
│       └── auth/
│           └── me/route.ts          ← Return foto in session
│
└── supabase/
    └── Storage Bucket               ← user-photos (PUBLIC)
        └── users/                   ← Folder untuk foto users
            ├── 1730246400000-abc.jpg
            ├── 1730246500000-def.png
            └── 1730246600000-ghi.gif
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT-SIDE VALIDATION                                     │
├─────────────────────────────────────────────────────────────┤
│  ✅ File type check (image only)                            │
│  ✅ File size check (max 2MB)                               │
│  ✅ Preview before upload                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVER-SIDE VALIDATION                                     │
├─────────────────────────────────────────────────────────────┤
│  ✅ Session check (must be logged in)                       │
│  ✅ File type validation                                    │
│  ✅ File size validation                                    │
│  ✅ Path sanitization                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STORAGE SECURITY                                           │
├─────────────────────────────────────────────────────────────┤
│  ✅ Public bucket (read-only)                               │
│  ✅ Unique filename (no collision)                          │
│  ✅ Organized folders (users/)                              │
│  ✅ Cache control (1 hour)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────────┐
│  PhotoUpload Component                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │                                                   │     │
│  │              [Preview Image]                      │     │
│  │                                                   │     │
│  │              atau                                 │     │
│  │                                                   │     │
│  │              📷 Camera Icon                       │     │
│  │              Drag & drop atau click               │     │
│  │                                                   │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  [X Remove]  [📁 Browse]                                   │
│                                                             │
│  ℹ️ Max 2MB, JPG/PNG/GIF                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

```
CREATE USER:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Form    │ -> │  Upload  │ -> │ Database │ -> │   UI     │
│  Submit  │    │  Photo   │    │  Insert  │    │  Refresh │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │
                     ▼
              Supabase Storage
              user-photos/users/


UPDATE USER:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Form    │ -> │  Upload  │ -> │ Database │ -> │   UI     │
│  Submit  │    │  New     │    │  Update  │    │  Refresh │
└──────────┘    │  Photo   │    └──────────┘    └──────────┘
                └──────────┘
                     │
                     ▼
              Supabase Storage
              (old photo kept)


DISPLAY PHOTO:
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Database │ -> │  Get URL │ -> │  Show    │
│  Path    │    │  Helper  │    │  Image   │
└──────────┘    └──────────┘    └──────────┘
                     │
                     ▼
              Public URL:
              https://[project].supabase.co/
              storage/v1/object/public/
              user-photos/users/[file].jpg
```

---

## ✅ Integration Points

```
1. app/users/page.tsx
   ├── Import PhotoUpload ✅
   ├── Import upload utilities ✅
   ├── State management ✅
   ├── handleSubmit integration ✅
   ├── handleEdit integration ✅
   ├── resetForm integration ✅
   ├── Form modal integration ✅
   └── Table display integration ✅

2. components/Sidebar.tsx
   ├── Import getPhotoUrl ✅
   ├── Display user photo ✅
   └── Fallback to initial ✅

3. API Routes
   ├── /api/users/create ✅
   ├── /api/users/update ✅
   ├── /api/users/upload-photo ✅
   └── /api/auth/me ✅
```

---

## 🎯 Testing Checklist

```
□ Create user dengan foto
□ Create user tanpa foto
□ Edit user ganti foto
□ Edit user hapus foto
□ Upload JPG
□ Upload PNG
□ Upload GIF
□ Upload file > 2MB (should fail)
□ Upload non-image (should fail)
□ Drag & drop upload
□ Click to browse upload
□ Preview foto
□ Remove foto
□ Foto muncul di tabel
□ Foto muncul di sidebar
□ Fallback ke initial
□ Responsive mobile
□ Responsive tablet
□ Responsive desktop
```

---

## 🚀 Ready to Use!

Tinggal buat storage bucket `user-photos` di Supabase, lalu semua fitur langsung berfungsi!
