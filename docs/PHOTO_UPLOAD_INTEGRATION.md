# 📸 Integrasi Upload Foto - Panduan

## ✅ Yang Sudah Dibuat:

1. **lib/upload.ts** - Utility functions untuk upload
2. **components/PhotoUpload.tsx** - Komponen upload foto
3. **app/api/users/upload-photo/route.ts** - API upload foto
4. **Updated APIs** - create & update sudah support foto

## 🚀 Cara Integrasi ke Halaman Users:

### 1. Import PhotoUpload Component

Tambahkan di bagian atas `app/users/page.tsx`:

```typescript
import PhotoUpload from '@/components/PhotoUpload';
import { uploadPhoto, getPhotoUrl } from '@/lib/upload';
```

### 2. Tambahkan State untuk Foto (SUDAH DITAMBAHKAN)

```typescript
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string>('');
```

### 3. Update handleSubmit Function

Ganti fungsi `handleSubmit` dengan yang ini:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);

  try {
    let fotoPath = editingUser?.foto || '';

    // Upload foto jika ada file baru
    if (photoFile) {
      fotoPath = await uploadPhoto(photoFile, 'users');
    }

    if (editingUser) {
      // Update user
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingUser.id, 
          ...formData,
          foto: fotoPath 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal update user');
      }
    } else {
      // Create new user
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          foto: fotoPath 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal membuat user');
      }
    }

    alert(editingUser ? 'User berhasil diupdate!' : 'User berhasil dibuat!');
    setShowModal(false);
    resetForm();
    fetchUsers();
  } catch (error: any) {
    alert(error.message);
  } finally {
    setFormLoading(false);
  }
};
```

### 4. Update handleEdit Function

Tambahkan set preview foto:

```typescript
const handleEdit = (user: User) => {
  setEditingUser(user);
  setFormData({
    email: user.email,
    password: '',
    nama_lengkap: user.nama_lengkap,
    role: user.role,
    lokasi: user.lokasi || '',
    asrama: user.asrama || '',
    no_telepon: user.no_telepon || '',
    is_active: user.is_active,
  });
  // Set preview foto jika ada
  if (user.foto) {
    setPhotoPreview(getPhotoUrl(user.foto) || '');
  }
  setShowModal(true);
};
```

### 5. Update resetForm Function

Tambahkan reset foto:

```typescript
const resetForm = () => {
  setFormData({
    email: '',
    password: '',
    nama_lengkap: '',
    role: 'user',
    lokasi: '',
    asrama: '',
    no_telepon: '',
    is_active: true,
  });
  setEditingUser(null);
  setShowPassword(false);
  setPhotoFile(null);
  setPhotoPreview('');
};
```

### 6. Tambahkan PhotoUpload di Modal Form

Di dalam modal form, setelah field Email, tambahkan:

```typescript
{/* Photo Upload */}
<div className="md:col-span-2">
  <PhotoUpload
    currentPhoto={editingUser?.foto}
    onPhotoChange={setPhotoFile}
    preview={photoPreview}
    onPreviewChange={setPhotoPreview}
  />
</div>
```

### 7. Update Tampilan Foto di Tabel

Ganti avatar di tabel dengan:

```typescript
<div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
  {user.foto ? (
    <img
      src={getPhotoUrl(user.foto) || ''}
      alt={user.nama_lengkap}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white font-bold text-sm">
      {user.nama_lengkap.charAt(0).toUpperCase()}
    </span>
  )}
</div>
```

---

## 📦 Jangan Lupa!

### Buat Storage Bucket di Supabase:

1. Buka Supabase Dashboard
2. Storage → New bucket
3. Name: `user-photos`
4. Public: ✅ CENTANG
5. Create

---

## ✅ Setelah Integrasi:

- ✅ User bisa upload foto saat create
- ✅ User bisa ganti foto saat edit
- ✅ Foto ditampilkan di tabel
- ✅ Foto ditampilkan di sidebar (UserProfile component)
- ✅ Validasi: hanya image, max 2MB
- ✅ Preview sebelum upload

---

**Status**: ⚠️ Perlu integrasi manual ke app/users/page.tsx
**Reason**: File terlalu panjang untuk di-replace otomatis
