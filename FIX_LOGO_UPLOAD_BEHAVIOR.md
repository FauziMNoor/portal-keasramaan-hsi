# Fix: Logo Upload Behavior

## Masalah Sebelumnya
Logo langsung terupload ke Supabase Storage dan database ketika user memilih file, **sebelum** klik tombol "Simpan Data".

**Dampak:**
- User tidak bisa preview dulu sebelum simpan
- Jika user cancel/tidak jadi simpan, logo sudah terlanjur terupload
- Tidak konsisten dengan UX pattern form pada umumnya

## Solusi yang Diterapkan

### 1. Preview Only (Tidak Upload)
Ketika user memilih file logo:
- ✅ File disimpan di state `selectedLogoFile`
- ✅ Preview dibuat menggunakan `FileReader.readAsDataURL()`
- ✅ **TIDAK** upload ke Supabase Storage
- ✅ **TIDAK** update database

### 2. Upload Saat Submit
Upload baru dilakukan ketika user klik tombol "Simpan Data":
- ✅ Check apakah ada `selectedLogoFile`
- ✅ Jika ada, upload ke Supabase Storage
- ✅ Hapus logo lama (jika ada)
- ✅ Simpan URL logo baru ke database
- ✅ Reset `selectedLogoFile` setelah berhasil

### 3. Visual Indicator
Menambahkan indikator bahwa logo belum tersimpan:
```
⏳ Logo baru dipilih: logo-sekolah.png
Klik "Simpan Data" untuk mengupload
```

## Perubahan Kode

### State Baru
```typescript
const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
```

### handleFileSelect (Sebelum)
```typescript
// ❌ LANGSUNG UPLOAD
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  // ... validasi
  
  // Upload ke storage
  await supabase.storage.from('logos').upload(filePath, file);
  
  // Update formData
  setFormData({ ...formData, logo_url: urlData.publicUrl });
  alert('✅ Logo berhasil diupload!'); // Prematur!
};
```

### handleFileSelect (Sesudah)
```typescript
// ✅ HANYA PREVIEW
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  // ... validasi
  
  // Simpan file untuk diupload nanti
  setSelectedLogoFile(file);
  
  // Buat preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setLogoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

### handleSubmit (Update)
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    let logoUrl = formData.logo_url;

    // Upload logo baru jika ada file yang dipilih
    if (selectedLogoFile) {
      // Hapus logo lama
      if (formData.logo_url && formData.logo_url.includes('supabase')) {
        const oldFileName = formData.logo_url.split('/').pop();
        await supabase.storage.from('logos').remove([oldFileName]);
      }

      // Upload file baru
      const fileExt = selectedLogoFile.name.split('.').pop();
      const fileName = `logo-${userCabang}-${Date.now()}.${fileExt}`;
      
      await supabase.storage.from('logos').upload(fileName, selectedLogoFile);
      
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);
      
      logoUrl = urlData.publicUrl;
    }

    // Simpan ke database
    const dataToSave = {
      ...formData,
      logo_url: logoUrl,
      cabang: userCabang,
    };

    // ... insert/update logic
    
    setSelectedLogoFile(null); // Reset
    await fetchData();
  } catch (error) {
    // ... error handling
  }
};
```

### handleRemoveLogo (Update)
```typescript
// ❌ SEBELUM: Langsung hapus dari storage
const handleRemoveLogo = async () => {
  await supabase.storage.from('logos').remove([fileName]);
  setFormData({ ...formData, logo_url: '' });
};

// ✅ SESUDAH: Tandai untuk dihapus saat submit
const handleRemoveLogo = () => {
  setFormData({ ...formData, logo_url: '' });
  setLogoPreview('');
  setSelectedLogoFile(null);
};
```

## Testing

### Test Case 1: Upload Logo Baru
1. Pilih file logo → ✅ Preview muncul, belum upload
2. Isi form lainnya
3. Klik "Simpan Data" → ✅ Logo terupload, data tersimpan
4. Refresh halaman → ✅ Logo muncul dari database

### Test Case 2: Cancel Upload
1. Pilih file logo → ✅ Preview muncul
2. Klik X untuk hapus preview
3. Refresh halaman → ✅ Logo lama masih ada (tidak berubah)

### Test Case 3: Ganti Logo
1. Pilih file logo baru → ✅ Preview muncul
2. Klik "Simpan Data" → ✅ Logo lama terhapus, logo baru tersimpan

### Test Case 4: Hapus Logo
1. Klik X pada logo yang ada
2. Klik "Simpan Data" → ✅ Logo terhapus dari storage dan database

## Benefits
- ✅ User experience lebih baik (preview dulu sebelum simpan)
- ✅ Tidak ada file orphan di storage (file yang terupload tapi tidak dipakai)
- ✅ Konsisten dengan pattern form pada umumnya
- ✅ User bisa cancel tanpa side effect
- ✅ Clear visual feedback (pending indicator)

## Related Files
- `portal-keasramaan/app/identitas-sekolah/page.tsx` - Main file yang diupdate
- `portal-keasramaan/supabase/FIX_RLS_INFO_SEKOLAH.sql` - RLS policies (sudah fix)
