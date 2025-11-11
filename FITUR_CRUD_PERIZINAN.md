# ✅ Fitur CRUD Perizinan Kepulangan

## 📋 Overview

Sistem CRUD (Create, Read, Update, Delete) telah ditambahkan pada halaman Approval Perizinan untuk Kepala Asrama dan Kepala Sekolah. Fitur ini berguna jika wali santri salah dalam memberikan detail keterangan izin.

## 🎯 Fitur yang Ditambahkan

### 1. ✅ READ (View Detail)
**Siapa**: Semua role (Kepala Asrama, Kepala Sekolah, Admin)

**Fitur**:
- Lihat detail lengkap perizinan
- Icon: 📄 (FileText - biru)
- Modal detail dengan semua informasi

**Data yang Ditampilkan**:
- NIS, Nama, Kelas, Asrama, Cabang
- Tanggal Mulai & Selesai, Durasi
- Kategori Perizinan
- Alasan
- Alamat Tujuan
- No HP Wali

### 2. ✅ UPDATE (Edit)
**Siapa**: Kepala Asrama, Kepala Sekolah, Admin

**Fitur**:
- Edit data perizinan yang belum disetujui penuh
- Icon: ✏️ (Edit2 - kuning)
- Modal edit dengan form lengkap

**Field yang Bisa Diedit**:
- ✅ Tanggal Mulai
- ✅ Tanggal Selesai
- ✅ Kategori Perizinan (dropdown)
- ✅ Alasan
- ✅ Alamat Tujuan
- ✅ No HP Wali

**Batasan**:
- Tidak bisa edit jika status sudah `approved_kepsek`
- Durasi otomatis ter-calculate dari tanggal

### 3. ✅ DELETE (Hapus)
**Siapa**: Kepala Sekolah, Admin ONLY

**Fitur**:
- Hapus perizinan yang salah/tidak valid
- Icon: 🗑️ (Trash2 - merah)
- Konfirmasi sebelum hapus

**Batasan**:
- Hanya Kepala Sekolah/Admin yang bisa hapus
- Konfirmasi wajib
- Data tidak bisa dikembalikan

### 4. ✅ APPROVE/REJECT (Existing)
**Siapa**: 
- Kepala Asrama (Level 1)
- Kepala Sekolah/Admin (Level 2)

**Fitur**:
- Approve: ✅ (CheckCircle - hijau)
- Reject: ❌ (XCircle - merah)
- Tambah catatan (opsional)

## 🔐 Permission Matrix

| Aksi | Kepala Asrama | Kepala Sekolah | Admin |
|------|---------------|----------------|-------|
| **View Detail** | ✅ (cabang sendiri) | ✅ (semua) | ✅ (semua) |
| **Edit** | ✅ (belum approved penuh) | ✅ (belum approved penuh) | ✅ (belum approved penuh) |
| **Delete** | ❌ | ✅ | ✅ |
| **Approve L1** | ✅ (pending) | ❌ | ❌ |
| **Approve L2** | ❌ | ✅ (approved_kepas) | ✅ (approved_kepas) |

## 🎨 UI/UX

### Icon & Color Coding

```
📄 View Detail    → Biru   (FileText)
✏️ Edit           → Kuning (Edit2)
🗑️ Delete         → Merah  (Trash2)
✅ Approve        → Hijau  (CheckCircle)
❌ Reject         → Merah  (XCircle)
```

### Modal Edit

**Header**:
- Judul: "Edit Perizinan"
- Info box: Nama santri & NIS yang sedang diedit

**Form**:
- Grid 2 kolom untuk tanggal
- Dropdown kategori perizinan
- Textarea untuk alasan & alamat
- Input untuk no HP

**Button**:
- Simpan Perubahan (biru)
- Batal (abu-abu)

### Modal Detail

**Header**:
- Judul: "Detail Perizinan"

**Content**:
- Grid 2 kolom untuk data singkat
- Full width untuk data panjang
- Catatan (jika approve/reject)

**Button**:
- Setujui/Tolak (jika bisa approve)
- Tutup

## 📱 User Flow

### Flow 1: Edit Perizinan (Kepala Asrama)

```
1. Login sebagai Kepala Asrama
2. Menu: Perizinan → Approval
3. Lihat list perizinan (hanya cabang sendiri)
4. Klik icon Edit (✏️ kuning)
5. Modal edit terbuka
6. Ubah data yang salah:
   - Tanggal
   - Kategori
   - Alasan
   - Alamat
   - No HP
7. Klik "Simpan Perubahan"
8. Alert "✅ Data berhasil diupdate"
9. Modal tutup, data ter-refresh
```

### Flow 2: Delete Perizinan (Kepala Sekolah)

```
1. Login sebagai Kepala Sekolah
2. Menu: Perizinan → Approval
3. Lihat list perizinan (semua cabang)
4. Klik icon Delete (🗑️ merah)
5. Konfirmasi: "⚠️ Yakin ingin menghapus?"
6. Klik OK
7. Alert "✅ Perizinan berhasil dihapus"
8. Data ter-refresh
```

### Flow 3: View Detail

```
1. Login (role apapun)
2. Menu: Perizinan → Approval
3. Klik icon Detail (📄 biru)
4. Modal detail terbuka
5. Lihat semua informasi lengkap
6. Klik "Tutup"
```

## 🧪 Testing

### Test 1: Edit Perizinan
- [ ] Login sebagai Kepala Asrama
- [ ] Klik icon Edit pada perizinan pending
- [ ] Modal edit terbuka dengan data existing
- [ ] Ubah tanggal mulai
- [ ] Ubah kategori perizinan
- [ ] Ubah alasan
- [ ] Klik "Simpan Perubahan"
- [ ] Verifikasi alert sukses
- [ ] Verifikasi data ter-update di tabel
- [ ] Verifikasi durasi ter-calculate ulang

### Test 2: Edit - Batasan
- [ ] Login sebagai Kepala Asrama
- [ ] Cari perizinan dengan status `approved_kepsek`
- [ ] Verifikasi icon Edit TIDAK muncul
- [ ] Cari perizinan dengan status `pending`
- [ ] Verifikasi icon Edit muncul

### Test 3: Delete Perizinan
- [ ] Login sebagai Kepala Sekolah
- [ ] Klik icon Delete
- [ ] Verifikasi muncul konfirmasi
- [ ] Klik OK
- [ ] Verifikasi alert sukses
- [ ] Verifikasi data terhapus dari tabel

### Test 4: Delete - Permission
- [ ] Login sebagai Kepala Asrama
- [ ] Verifikasi icon Delete TIDAK muncul
- [ ] Login sebagai Kepala Sekolah
- [ ] Verifikasi icon Delete muncul

### Test 5: View Detail
- [ ] Klik icon Detail
- [ ] Verifikasi modal terbuka
- [ ] Verifikasi semua data ditampilkan
- [ ] Klik "Tutup"
- [ ] Verifikasi modal tertutup

### Test 6: Approve/Reject (Existing)
- [ ] Test approve masih berfungsi
- [ ] Test reject masih berfungsi
- [ ] Test catatan tersimpan

## 📊 Before vs After

### Before
```
❌ Tidak bisa edit perizinan yang salah
❌ Tidak bisa hapus perizinan
❌ Hanya bisa approve/reject
❌ Jika wali santri salah input, harus submit ulang
```

### After
```
✅ Bisa edit perizinan (tanggal, kategori, alasan, dll)
✅ Bisa hapus perizinan (Kepala Sekolah)
✅ Bisa view detail lengkap
✅ Approve/reject tetap berfungsi
✅ Jika wali santri salah, bisa dikoreksi langsung
```

## 🎯 Use Cases

### Use Case 1: Tanggal Salah
**Problem**: Wali santri input tanggal mulai 15 Nov, seharusnya 16 Nov

**Solution**:
1. Kepala Asrama buka approval
2. Klik Edit
3. Ubah tanggal mulai jadi 16 Nov
4. Simpan
5. ✅ Selesai, tidak perlu submit ulang

### Use Case 2: Kategori Salah
**Problem**: Wali santri pilih "Sakit", seharusnya "Keperluan Keluarga"

**Solution**:
1. Kepala Asrama buka approval
2. Klik Edit
3. Ubah kategori jadi "Keperluan Keluarga"
4. Simpan
5. ✅ Selesai

### Use Case 3: Perizinan Duplikat
**Problem**: Wali santri submit 2x untuk santri yang sama

**Solution**:
1. Kepala Sekolah buka approval
2. Klik Delete pada perizinan duplikat
3. Konfirmasi
4. ✅ Perizinan duplikat terhapus

### Use Case 4: Alasan Kurang Jelas
**Problem**: Alasan terlalu singkat, perlu detail lebih

**Solution**:
1. Kepala Asrama buka approval
2. Klik Edit
3. Tambahkan detail di field "Alasan"
4. Simpan
5. ✅ Alasan lebih jelas

## 🔒 Security

### Permission Check
- ✅ Edit: Cek role & status perizinan
- ✅ Delete: Hanya Kepala Sekolah/Admin
- ✅ Approve: Sesuai level (Kepas/Kepsek)
- ✅ Filter cabang: Kepala Asrama hanya lihat cabang sendiri

### Validation
- ✅ Tanggal selesai >= tanggal mulai
- ✅ Semua field required terisi
- ✅ Konfirmasi sebelum delete
- ✅ Alert sukses/error

## 📝 Notes

**Keuntungan**:
1. **Fleksibilitas**: Bisa koreksi kesalahan tanpa submit ulang
2. **Efisiensi**: Tidak perlu kontak wali santri untuk submit ulang
3. **Data Quality**: Data lebih akurat dan lengkap
4. **User Experience**: Proses lebih smooth

**Best Practices**:
1. **Edit**: Gunakan untuk koreksi kesalahan kecil
2. **Delete**: Gunakan untuk data duplikat/tidak valid
3. **Catatan**: Selalu tambahkan catatan saat approve/reject
4. **Komunikasi**: Informasikan ke wali santri jika ada perubahan

## 🎉 Status

✅ **SELESAI** - Fitur CRUD lengkap untuk Kepala Asrama dan Kepala Sekolah

## 📞 Support

Jika ada pertanyaan:
1. Cek dokumentasi ini
2. Test di environment development
3. Hubungi IT Support

---

**Version**: 1.3.0  
**Date**: November 2025  
**Type**: Feature Addition  
**Status**: READY ✅
