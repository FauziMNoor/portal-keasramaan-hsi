# 📋 Rapor System - Quick Reference

## 🚀 Quick Start

### 1. Access Legger
```
http://localhost:3000/rapor/legger
```

### 2. Connect Google Account
Click "Connect Google Account" → Authorize → Done

### 3. Generate Rapor
1. Select filters (Cabang, Tahun Ajaran, Semester, Kelas, Asrama)
2. Preview data (optional)
3. Click "Generate Rapor"
4. Download PDF

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER INTERFACE                    │
│  /rapor/legger - Legger Table with Preview         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                   API LAYER                         │
│  /api/rapor/generate - Generate rapor endpoint     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                   DATA LAYER                        │
│  • raporHelper.ts - Compile data                   │
│  • Supabase - Database queries                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 GOOGLE INTEGRATION                  │
│  • googleSlides.ts - Slides API                    │
│  • imageHelper.ts - Image processing               │
│  • slidesImageInserter.ts - Image insertion        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                   OUTPUT                            │
│  • PDF in Supabase Storage                         │
│  • Download link in database                       │
└─────────────────────────────────────────────────────┘
```

## 🗂️ File Structure

```
portal-keasramaan/
├── app/
│   ├── rapor/
│   │   ├── legger/
│   │   │   └── page.tsx          # Legger UI
│   │   └── generate/
│   │       └── page.tsx          # Old generate UI
│   └── api/
│       └── rapor/
│           └── generate/
│               └── route.ts      # Generate API
├── components/
│   └── rapor/
│       ├── LeggerTable.tsx       # Table component
│       ├── PreviewModal.tsx      # Preview modal
│       └── DetailModal.tsx       # Detail modal
├── lib/
│   ├── raporHelper.ts            # Data compilation
│   ├── googleSlides.ts           # Slides integration
│   ├── imageHelper.ts            # Image utilities
│   ├── slidesImageInserter.ts   # Image insertion
│   └── raporStorage.ts           # PDF storage
└── docs/
    ├── RAPOR_LEGGER_FEATURE.md
    ├── RAPOR_IMAGE_INSERTION.md
    └── RAPOR_IMAGE_INSERTION_TEST.md
```

## 🔑 Key Functions

### Data Compilation
```typescript
// lib/raporHelper.ts
compileRaporData(params) → {
  santri, habit, kegiatan, dokumentasi, catatan
}
```

### Generate Slides
```typescript
// lib/googleSlides.ts
generateRaporSlides(data, accessToken, refreshToken, options) → {
  success, presentationId, url, imageInsertResult
}
```

### Insert Images
```typescript
// lib/slidesImageInserter.ts
insertImagesIntoSlides(slides, drive, presentationId, imagePlaceholders) → {
  success, insertedCount, errors
}
```

### Export PDF
```typescript
// lib/googleSlides.ts
exportToPDF(presentationId, accessToken, refreshToken) → {
  success, pdfBuffer
}
```

## 📝 Data Flow

### Input Data
```typescript
{
  nis: string,
  cabang: string,
  tahunAjaran: string,
  semester: string,
  kelas: string,
  asrama: string,
  googleTokens: {
    access_token: string,
    refresh_token: string
  }
}
```

### Compiled Data
```typescript
{
  santri: {
    nis, nama_siswa, foto, kelas, asrama, ...
  },
  habit: {
    shalat_fardhu_berjamaah_deskripsi,
    tata_cara_shalat_deskripsi,
    ... (21 habits)
  },
  kegiatan: [
    { urutan: 1, nama_kegiatan, foto_1, foto_2, keterangan },
    ... (6 kegiatan)
  ],
  dokumentasi: [
    { foto_url, keterangan },
    ...
  ],
  catatan: {
    catatan_musyrif,
    nama_ketua_asrama,
    nama_musyrif
  }
}
```

### Output
```typescript
{
  success: true,
  data: {
    pdf_url: string,
    presentation_url: string
  }
}
```

## 🎯 Placeholders

### Text Placeholders (50+)
```
<<Nama Santri>>
<<Semester>>
<<Tahun Ajaran>>
<<Shalat Fardhu Berjamaah>>
... (21 habits)
<<Nama Kegiatan 1>>
... (6 kegiatan)
<<Catatan Musyrif>>
<<Ketua Asrama>>
<<Musyrif>>
```

### Image Placeholders (14+)
```
<<Foto Santri>>
<<Foto Kegiatan 1a>>
<<Foto Kegiatan 1b>>
... (12 kegiatan photos)
<<Dokumentasi Program Lainnya>>
```

## 🔄 Status Flow

```
Data Check → Status Assignment
    ↓
✅ Ready
  - All data complete
  - Can generate immediately
    ↓
⚠️ Incomplete
  - Missing habit/kegiatan/catatan
  - Can still generate (with warnings)
    ↓
❌ Error
  - Critical data missing (santri)
  - Cannot generate
```

## ⚡ Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Load Legger | 2-3s | For 50 santri |
| Generate (text only) | 20-30s | Single rapor |
| Generate (with images) | 40-60s | 15 images |
| Batch (10 santri) | 10-15min | With 2s delay |
| PDF Export | 5-10s | Per rapor |

## 🐛 Common Issues

### Issue: "Google account not connected"
**Fix**: Click "Connect Google Account"

### Issue: "Tidak ada santri"
**Fix**: Check filter selection, verify data exists

### Issue: Generate fails
**Fix**: Check console logs, verify OAuth token, retry

### Issue: Images not showing
**Fix**: Verify image URLs, check placeholders, check permissions

### Issue: Slow performance
**Fix**: Reduce image sizes, check network, optimize batch size

## 📞 Support

### Documentation
- Feature Guide: `docs/RAPOR_LEGGER_FEATURE.md`
- Image Insertion: `docs/RAPOR_IMAGE_INSERTION.md`
- Test Guide: `docs/RAPOR_IMAGE_INSERTION_TEST.md`
- Quick Start: `RAPOR_LEGGER_QUICK_START.md`

### Logs
- Browser Console: F12 → Console
- Server Logs: Terminal running `npm run dev`
- Database Logs: `rapor_generate_log_keasramaan` table

### Debugging
```typescript
// Enable verbose logging
console.log('🔍 Debug:', data);

// Check Slides before delete
// Comment out: await drive.files.delete(...)

// Test with single image
const imagePlaceholders = [
  { placeholder: '<<Foto Santri>>', imageUrl: santri.foto }
];
```

## 🎓 Learning Resources

### Google APIs
- [Slides API Docs](https://developers.google.com/slides/api)
- [Drive API Docs](https://developers.google.com/drive/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

### Next.js
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Supabase
- [Database](https://supabase.com/docs/guides/database)
- [Storage](https://supabase.com/docs/guides/storage)

## 🚀 Deployment Checklist

- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] Supabase connected
- [ ] Template uploaded to Drive
- [ ] Test with sample data
- [ ] Verify PDF output
- [ ] Check image insertion
- [ ] Monitor performance
- [ ] Train users
- [ ] Document issues

## 📊 Monitoring

### Metrics to Track
- Generate success rate
- Average processing time
- Image insertion success rate
- Error frequency
- User satisfaction

### Alerts
- High error rate (> 10%)
- Slow performance (> 2 minutes)
- API quota exceeded
- Storage quota exceeded

## 🎉 Success Criteria

- ✅ Generate success rate > 95%
- ✅ Processing time < 1 minute (with images)
- ✅ Image insertion success > 90%
- ✅ User satisfaction > 4/5
- ✅ Zero critical bugs

---

**Version**: 2.0.0
**Last Updated**: December 13, 2024
**Status**: ✅ Production Ready
