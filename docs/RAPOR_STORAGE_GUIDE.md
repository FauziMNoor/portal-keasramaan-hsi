# 📦 Rapor Storage Guide

## Overview

Sistem Rapor menggunakan **Supabase Storage** untuk menyimpan foto kegiatan, dokumentasi, dan PDF hasil generate.

---

## 🗂️ Bucket Structure

### 1. **rapor-kegiatan** (Public Bucket)
Menyimpan foto kegiatan dan dokumentasi.

**Properties:**
- **Public**: ✅ Yes (foto bisa diakses langsung via URL)
- **Max File Size**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, WebP

**Folder Structure:**
```
rapor-kegiatan/
├── kegiatan/
│   └── {cabang}/
│       └── {tahun_ajaran}/
│           └── {semester}/
│               └── {kelas}/
│                   └── {asrama}/
│                       ├── kegiatan-1-foto-1.jpg
│                       ├── kegiatan-1-foto-2.jpg
│                       ├── kegiatan-2-foto-1.jpg
│                       └── ... (sampai kegiatan-6-foto-2.jpg)
└── dokumentasi/
    └── {cabang}/
        └── {tahun_ajaran}/
            └── {semester}/
                └── {kelas}/
                    └── {asrama}/
                        ├── dok-1702345678901.jpg
                        ├── dok-1702345678902.jpg
                        └── ... (unlimited)
```

**Example Path:**
```
kegiatan/Pusat/2024-2025/Ganjil/7/Asrama-A/kegiatan-1-foto-1.jpg
dokumentasi/Pusat/2024-2025/Ganjil/7/Asrama-A/dok-1702345678901.jpg
```

---

### 2. **rapor-pdf** (Private Bucket)
Menyimpan PDF hasil generate rapor.

**Properties:**
- **Public**: ❌ No (private, butuh signed URL)
- **Max File Size**: 50MB
- **Allowed Types**: PDF only

**Folder Structure:**
```
rapor-pdf/
└── {cabang}/
    └── {tahun_ajaran}/
        └── {semester}/
            ├── 12345-Ahmad-Santoso.pdf
            ├── 12346-Budi-Pratama.pdf
            └── ...
```

**Example Path:**
```
Pusat/2024-2025/Ganjil/12345-Ahmad-Santoso.pdf
```

---

## 🔐 Storage Policies

### rapor-kegiatan Bucket:

| Action | Who | Description |
|--------|-----|-------------|
| INSERT | Authenticated | Semua user yang login bisa upload |
| SELECT | Public | Semua orang bisa view/download |
| UPDATE | Authenticated | User bisa update foto yang sudah diupload |
| DELETE | Authenticated | User bisa delete foto |

### rapor-pdf Bucket:

| Action | Who | Description |
|--------|-----|-------------|
| INSERT | Authenticated | Semua user yang login bisa upload |
| SELECT | Authenticated | Hanya user yang login bisa view/download |
| DELETE | Authenticated | User bisa delete PDF |

---

## 📤 Upload Functions

### 1. Upload Foto Kegiatan

```typescript
import { uploadFotoKegiatan } from '@/lib/raporStorage';

const result = await uploadFotoKegiatan(file, {
  cabang: 'Pusat',
  tahun_ajaran: '2024/2025',
  semester: 'Ganjil',
  kelas: '7',
  asrama: 'Asrama A',
  urutan: 1, // 1-6
  foto_ke: 1, // 1 atau 2
});

if (result.success) {
  console.log('URL:', result.url);
  // Save URL to database
}
```

**Features:**
- Auto-generate file path berdasarkan metadata
- Upsert: Replace jika file sudah ada
- Return public URL langsung

---

### 2. Upload Foto Dokumentasi

```typescript
import { uploadFotoDokumentasi } from '@/lib/raporStorage';

const result = await uploadFotoDokumentasi(file, {
  cabang: 'Pusat',
  tahun_ajaran: '2024/2025',
  semester: 'Ganjil',
  kelas: '7',
  asrama: 'Asrama A',
});

if (result.success) {
  console.log('URL:', result.url);
  // Save URL to database
}
```

**Features:**
- Auto-generate unique filename dengan timestamp
- Create new file (tidak replace)
- Return public URL langsung

---

### 3. Upload PDF Rapor

```typescript
import { uploadPDFRapor } from '@/lib/raporStorage';

const result = await uploadPDFRapor(pdfBuffer, {
  cabang: 'Pusat',
  tahun_ajaran: '2024/2025',
  semester: 'Ganjil',
  nis: '12345',
  nama_siswa: 'Ahmad Santoso',
});

if (result.success) {
  console.log('Signed URL:', result.url);
  // Save path to database for re-download later
}
```

**Features:**
- Auto-generate file path berdasarkan metadata
- Upsert: Replace jika file sudah ada
- Return signed URL (valid 1 jam)

---

## 🗑️ Delete Functions

### Delete Foto

```typescript
import { deleteFoto } from '@/lib/raporStorage';

const result = await deleteFoto('kegiatan/Pusat/2024-2025/Ganjil/7/Asrama-A/kegiatan-1-foto-1.jpg');

if (result.success) {
  console.log('Foto berhasil dihapus');
}
```

---

## 🔗 Get URL Functions

### Get Signed URL for PDF (Re-download)

```typescript
import { getPDFSignedUrl } from '@/lib/raporStorage';

const result = await getPDFSignedUrl(
  'Pusat/2024-2025/Ganjil/12345-Ahmad-Santoso.pdf',
  3600 // Valid for 1 hour
);

if (result.success) {
  window.open(result.url, '_blank');
}
```

---

## ✅ Validation

### Validate Image File

```typescript
import { validateImageFile } from '@/lib/raporStorage';

const validation = validateImageFile(file);

if (!validation.valid) {
  alert(validation.error);
  return;
}

// Proceed with upload
```

**Validation Rules:**
- Max size: 10MB
- Allowed types: JPEG, JPG, PNG, WebP

---

## 🎨 UI Components

### Upload Button with Preview

```typescript
'use client';

import { useState } from 'react';
import { uploadFotoKegiatan, validateImageFile } from '@/lib/raporStorage';
import { Upload, X } from 'lucide-react';

export default function FotoUploader({ 
  metadata, 
  onUploadSuccess 
}: { 
  metadata: any; 
  onUploadSuccess: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const result = await uploadFotoKegiatan(file, metadata);
    setUploading(false);

    if (result.success) {
      onUploadSuccess(result.url);
      alert('✅ Foto berhasil diupload!');
    } else {
      alert('❌ Gagal upload: ' + result.error);
    }
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">
            {uploading ? 'Uploading...' : 'Click to upload'}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"
**Solusi:** Pastikan user sudah authenticated (login)

### Error: "Payload too large"
**Solusi:** File lebih dari 10MB, compress dulu

### Error: "Invalid mime type"
**Solusi:** Format file tidak didukung, gunakan JPEG/PNG/WebP

### Foto tidak muncul setelah upload
**Solusi:** Cek apakah bucket sudah public, atau gunakan signed URL

---

## 📊 Storage Quota

Supabase Free Tier:
- **Storage**: 1GB
- **Bandwidth**: 2GB/month

**Estimasi:**
- 1 foto (compressed): ~500KB
- 6 kegiatan × 2 foto = 12 foto = ~6MB per kelas/asrama
- Dokumentasi: ~10 foto × 500KB = ~5MB
- Total per kelas/asrama: ~11MB
- **Kapasitas**: ~90 kelas/asrama dalam 1GB

**Tips Hemat Storage:**
- Compress foto sebelum upload (gunakan library seperti `browser-image-compression`)
- Hapus foto lama yang tidak terpakai
- Gunakan WebP format (lebih kecil dari JPEG)

---

## 🚀 Best Practices

1. **Compress foto sebelum upload** (target: 500KB per foto)
2. **Gunakan loading state** saat upload
3. **Validate file** sebelum upload
4. **Show preview** sebelum upload
5. **Handle error** dengan user-friendly message
6. **Delete old files** saat update foto
7. **Use signed URL** untuk private files (PDF)
8. **Cache public URL** di database untuk performa

---

## 📝 Next Steps

- [ ] Implement compress foto sebelum upload
- [ ] Add progress bar untuk upload
- [ ] Implement batch upload untuk dokumentasi
- [ ] Add image cropper untuk foto kegiatan
- [ ] Implement lazy loading untuk preview foto
- [ ] Add storage usage monitoring
