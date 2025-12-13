# 🗑️ Delete Rapor Feature

## Overview

Fitur untuk menghapus rapor yang sudah di-generate dari database, sehingga bisa di-generate ulang.

## UI Changes

### Before
```
┌────────────────────────────────┐
│ PDF Column                     │
├────────────────────────────────┤
│ [⬇️ Download]                  │
└────────────────────────────────┘
```

### After
```
┌────────────────────────────────┐
│ PDF Column                     │
├────────────────────────────────┤
│ [⬇️ Download] [🗑️]             │
└────────────────────────────────┘
```

## Features

### 1. Delete Button
- **Icon**: 🗑️ (Trash2)
- **Color**: Red
- **Position**: Next to Download link
- **Visibility**: Only shows if PDF exists

### 2. Confirmation Dialog
```
Hapus rapor untuk [Nama Santri]?

Rapor yang sudah di-generate akan dihapus dari database.
File PDF di Google Drive tidak akan dihapus.

[Cancel] [OK]
```

### 3. Delete Action
- Delete record from `rapor_generate_log_keasramaan`
- Filter by: `nis`, `tahun_ajaran`, `semester`
- Update UI: Remove `pdfUrl` from row
- Show success message

## Implementation

### LeggerTable Component

#### Added Delete Button
```typescript
{row.pdfUrl ? (
  <div className="flex items-center justify-center gap-2">
    <a href={row.pdfUrl} ...>
      <Download /> Download
    </a>
    <button onClick={() => onDelete(row.nis)} ...>
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
) : (
  <span>-</span>
)}
```

#### Added onDelete Prop
```typescript
interface LeggerTableProps {
  // ... other props
  onDelete: (nis: string) => void;
}
```

### Main Page (legger/page.tsx)

#### Delete Handler
```typescript
const handleDelete = async (nis: string) => {
  // 1. Confirm with user
  const confirmed = confirm(`Hapus rapor untuk ${santri.nama_siswa}?`);
  if (!confirmed) return;

  // 2. Delete from database
  await supabase
    .from('rapor_generate_log_keasramaan')
    .delete()
    .eq('nis', nis)
    .eq('tahun_ajaran', selectedTahunAjaran)
    .eq('semester', selectedSemester);

  // 3. Update UI
  setLeggerData(prev => prev.map(item => 
    item.nis === nis ? { ...item, pdfUrl: undefined } : item
  ));

  // 4. Show success message
  alert('✅ Rapor berhasil dihapus!');
};
```

## Use Cases

### 1. Re-generate Rapor
```
Scenario: Data santri berubah, perlu generate ulang

Steps:
1. Klik 🗑️ di kolom PDF
2. Confirm delete
3. Klik "Generate Rapor" lagi
4. PDF baru ter-generate
```

### 2. Fix Errors
```
Scenario: Rapor ter-generate dengan error

Steps:
1. Klik 🗑️ untuk hapus rapor lama
2. Fix data (habit tracker, kegiatan, dll)
3. Generate ulang
4. PDF baru dengan data correct
```

### 3. Test Generate
```
Scenario: Testing generate rapor

Steps:
1. Generate rapor test
2. Check PDF
3. Klik 🗑️ untuk hapus
4. Generate lagi dengan data berbeda
5. Compare results
```

## Important Notes

### ⚠️ What Gets Deleted
- ✅ Record in `rapor_generate_log_keasramaan`
- ✅ PDF URL from database
- ❌ **PDF file in Google Drive** (NOT deleted)

### 💡 Why PDF Not Deleted?
1. **Safety**: Prevent accidental data loss
2. **Backup**: Keep old versions
3. **Manual cleanup**: Admin can delete from Drive manually if needed

### 🔄 After Delete
- Row status remains same (Siap/Kurang/Error)
- Can generate again immediately
- New PDF will have different URL
- Old PDF still accessible via old URL

## Database Impact

### Before Delete
```sql
SELECT * FROM rapor_generate_log_keasramaan
WHERE nis = '202410016'
AND tahun_ajaran = '2024/2025'
AND semester = 'Ganjil';

-- Result:
-- id | nis | nama_siswa | pdf_url | status | generated_at
-- 1  | 202410016 | Kholid | https://... | success | 2024-12-13
```

### After Delete
```sql
SELECT * FROM rapor_generate_log_keasramaan
WHERE nis = '202410016'
AND tahun_ajaran = '2024/2025'
AND semester = 'Ganjil';

-- Result: (empty)
```

### UI Update
```typescript
// Before
pdfUrl: "https://sirriyah.smaithsi.sch.id/.../rapor.pdf"

// After
pdfUrl: undefined
```

## Error Handling

### Database Error
```typescript
try {
  await supabase.from('...').delete()...;
} catch (error) {
  alert('❌ Error: ' + error.message);
}
```

### User Cancels
```typescript
const confirmed = confirm('Hapus rapor?');
if (!confirmed) return;  // Do nothing
```

### No PDF to Delete
```typescript
// Delete button only shows if pdfUrl exists
{row.pdfUrl ? (
  <button onClick={onDelete}>Delete</button>
) : (
  <span>-</span>
)}
```

## Testing

### Test Cases

1. **Delete Single Rapor**
   - Generate rapor
   - Click delete
   - Confirm
   - Verify: PDF link disappears
   - Verify: Can generate again

2. **Cancel Delete**
   - Click delete
   - Click "Cancel"
   - Verify: Nothing happens
   - Verify: PDF link still there

3. **Delete Multiple Times**
   - Generate rapor
   - Delete
   - Generate again
   - Delete again
   - Verify: Works every time

4. **Delete with Error**
   - Disconnect internet
   - Try delete
   - Verify: Error message shows
   - Verify: PDF link still there

## Future Enhancements

### Phase 2
- [ ] Delete PDF file from Google Drive
- [ ] Bulk delete (delete multiple rapor)
- [ ] Soft delete (mark as deleted, not actually delete)
- [ ] Delete history/audit log
- [ ] Restore deleted rapor

### Phase 3
- [ ] Delete confirmation modal (instead of alert)
- [ ] Undo delete (within 5 seconds)
- [ ] Delete with reason (why deleting?)
- [ ] Admin-only delete (permission check)

## Summary

**Feature**: Delete rapor yang sudah di-generate

**Purpose**: Allow re-generate rapor dengan data baru

**UI**: 🗑️ icon next to Download link

**Action**: Delete from database, keep PDF in Drive

**Result**: ✅ Can generate rapor again!

---

**Added by**: Kiro AI Assistant
**Date**: December 13, 2024
**Version**: 2.0.3
