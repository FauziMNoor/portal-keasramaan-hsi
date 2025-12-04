c# Jurnal Musyrif - API Reference

## Database Tables & Queries

### 1. Sesi Jurnal Musyrif

#### Get All Sesi (Active)
```typescript
const { data, error } = await supabase
  .from('sesi_jurnal_musyrif')
  .select('*')
  .eq('status', 'aktif')
  .order('urutan');
```

#### Create Sesi
```typescript
const { data, error } = await supabase
  .from('sesi_jurnal_musyrif')
  .insert([{
    nama_sesi: 'SESI 1',
    urutan: 1,
    status: 'aktif'
  }]);
```

#### Update Sesi
```typescript
const { data, error } = await supabase
  .from('sesi_jurnal_musyrif')
  .update({ nama_sesi: 'SESI 1 (Updated)' })
  .eq('id', sesiId);
```

#### Delete Sesi (Cascade)
```typescript
const { data, error } = await supabase
  .from('sesi_jurnal_musyrif')
  .delete()
  .eq('id', sesiId);
// Note: Akan menghapus semua jadwal dan kegiatan terkait (CASCADE)
```

---

### 2. Jadwal Jurnal Musyrif

#### Get Jadwal by Sesi
```typescript
const { data, error } = await supabase
  .from('jadwal_jurnal_musyrif')
  .select('*')
  .eq('sesi_id', sesiId)
  .order('urutan');
```

#### Create Jadwal
```typescript
const { data, error } = await supabase
  .from('jadwal_jurnal_musyrif')
  .insert([{
    sesi_id: 'uuid-sesi',
    jam_mulai: '03:30',
    jam_selesai: '03:45',
    urutan: 1
  }]);
```

---

### 3. Kegiatan Jurnal Musyrif

#### Get Kegiatan by Jadwal
```typescript
const { data, error } = await supabase
  .from('kegiatan_jurnal_musyrif')
  .select('*')
  .eq('jadwal_id', jadwalId)
  .order('urutan');
```

#### Get All Kegiatan with Sesi & Jadwal (JOIN)
```typescript
const { data, error } = await supabase
  .from('kegiatan_jurnal_musyrif')
  .select(`
    *,
    jadwal:jadwal_jurnal_musyrif(
      *,
      sesi:sesi_jurnal_musyrif(*)
    )
  `)
  .order('jadwal_id')
  .order('urutan');
```

---

### 4. Token Jurnal Musyrif

#### Get Active Token by Token String
```typescript
const { data, error } = await supabase
  .from('token_jurnal_musyrif')
  .select('*')
  .eq('token', tokenString)
  .eq('is_active', true)
  .single();
```

#### Create Token
```typescript
const token = Math.random().toString(36).substring(2, 15) + 
              Math.random().toString(36).substring(2, 15);

const { data, error } = await supabase
  .from('token_jurnal_musyrif')
  .insert([{
    token,
    nama_musyrif: 'Ustadz Ahmad',
    cabang: 'Pusat',
    kelas: 'Kelas 7',
    asrama: 'Asrama A',
    is_active: true
  }]);
```

#### Toggle Active Status
```typescript
const { data, error } = await supabase
  .from('token_jurnal_musyrif')
  .update({ is_active: !currentStatus })
  .eq('id', tokenId);
```

---

### 5. Formulir Jurnal Musyrif

#### Submit Jurnal (Bulk Insert)
```typescript
const dataToInsert = kegiatanList.map((kegiatan) => ({
  tanggal: '2024-12-04',
  nama_musyrif: 'Ustadz Ahmad',
  cabang: 'Pusat',
  kelas: 'Kelas 7',
  asrama: 'Asrama A',
  tahun_ajaran: '2024/2025',
  semester: 'Ganjil',
  sesi_id: kegiatan.sesi_id,
  jadwal_id: kegiatan.jadwal_id,
  kegiatan_id: kegiatan.id,
  status_terlaksana: true,
  catatan: 'Catatan opsional'
}));

const { data, error } = await supabase
  .from('formulir_jurnal_musyrif')
  .insert(dataToInsert);
```

#### Get Jurnal by Date Range
```typescript
const { data, error } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('*')
  .gte('tanggal', '2024-12-01')
  .lte('tanggal', '2024-12-31')
  .order('tanggal', { ascending: false });
```

#### Get Jurnal by Musyrif
```typescript
const { data, error } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('*')
  .eq('nama_musyrif', 'Ustadz Ahmad')
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);
```

#### Calculate Completion Rate
```typescript
const { data } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('status_terlaksana')
  .eq('nama_musyrif', 'Ustadz Ahmad')
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

const total = data?.length || 0;
const terlaksana = data?.filter(d => d.status_terlaksana).length || 0;
const completionRate = total > 0 ? (terlaksana / total) * 100 : 0;
```

---

## Dashboard Queries

### Get Total Jurnal
```typescript
const { count } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('*', { count: 'exact' })
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);
```

### Get Unique Musyrif Count
```typescript
const { data } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('nama_musyrif')
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

const uniqueMusyrif = [...new Set(data?.map(m => m.nama_musyrif) || [])];
const totalMusyrif = uniqueMusyrif.length;
```

### Get Today's Jurnal Count
```typescript
const today = new Date().toISOString().split('T')[0];
const { count } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('*', { count: 'exact' })
  .eq('tanggal', today);
```

### Get Musyrif Performance Stats
```typescript
// For each musyrif
const { data } = await supabase
  .from('formulir_jurnal_musyrif')
  .select('status_terlaksana')
  .eq('nama_musyrif', musyrifName)
  .gte('tanggal', startDate)
  .lte('tanggal', endDate);

const stats = {
  nama_musyrif: musyrifName,
  total_kegiatan: data?.length || 0,
  kegiatan_terlaksana: data?.filter(d => d.status_terlaksana).length || 0,
  completion_rate: /* calculate percentage */
};
```

---

## Useful Aggregations

### Count Kegiatan per Sesi
```sql
SELECT 
  s.nama_sesi,
  COUNT(k.id) as total_kegiatan
FROM sesi_jurnal_musyrif s
LEFT JOIN jadwal_jurnal_musyrif j ON s.id = j.sesi_id
LEFT JOIN kegiatan_jurnal_musyrif k ON j.id = k.jadwal_id
GROUP BY s.id, s.nama_sesi
ORDER BY s.urutan;
```

### Get Most Incomplete Kegiatan
```sql
SELECT 
  k.deskripsi_kegiatan,
  COUNT(*) as total_input,
  SUM(CASE WHEN f.status_terlaksana THEN 1 ELSE 0 END) as terlaksana,
  ROUND(
    (SUM(CASE WHEN f.status_terlaksana THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 
    2
  ) as completion_rate
FROM formulir_jurnal_musyrif f
JOIN kegiatan_jurnal_musyrif k ON f.kegiatan_id = k.id
WHERE f.tanggal >= '2024-12-01' AND f.tanggal <= '2024-12-31'
GROUP BY k.id, k.deskripsi_kegiatan
ORDER BY completion_rate ASC
LIMIT 10;
```

---

## RLS Policies

All tables have basic RLS enabled with "Allow all" policy for now.

For production, consider implementing:
- Admin can do everything
- Musyrif can only insert their own jurnal
- Kepala Asrama can view jurnal in their cabang
- Read-only access for certain roles

Example policy:
```sql
-- Musyrif can only insert their own data
CREATE POLICY "Musyrif can insert own jurnal"
ON formulir_jurnal_musyrif
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'nama' = nama_musyrif
);
```

---

## Performance Tips

1. **Use indexes** (already created in migration):
   - `idx_jadwal_sesi` on `jadwal_jurnal_musyrif(sesi_id)`
   - `idx_kegiatan_jadwal` on `kegiatan_jurnal_musyrif(jadwal_id)`
   - `idx_formulir_tanggal` on `formulir_jurnal_musyrif(tanggal)`
   - `idx_formulir_musyrif` on `formulir_jurnal_musyrif(nama_musyrif)`

2. **Batch inserts** for form submission (already implemented)

3. **Use count: 'exact'** only when needed (can be slow on large tables)

4. **Cache master data** (sesi, jadwal, kegiatan) in frontend

---

## Error Handling

Common errors and solutions:

### Foreign Key Violation
```
Error: insert or update on table "jadwal_jurnal_musyrif" violates foreign key constraint
```
**Solution**: Ensure sesi_id exists before creating jadwal

### Unique Constraint Violation
```
Error: duplicate key value violates unique constraint "token_jurnal_musyrif_token_key"
```
**Solution**: Generate new unique token

### RLS Policy Violation
```
Error: new row violates row-level security policy
```
**Solution**: Check RLS policies or disable for testing

---

**Last Updated**: December 4, 2024
