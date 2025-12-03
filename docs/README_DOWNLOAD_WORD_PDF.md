# 📄 DOWNLOAD SURAT: PDF & WORD

## ✨ Fitur Baru

Sekarang bisa download surat izin dalam **2 format**:
- 📄 **PDF** - Siap cetak, tidak bisa diedit
- 📝 **WORD** - Bisa diedit jika ada kesalahan

## 🚀 Cara Pakai

1. **Buka Approval Perizinan**
   ```
   http://localhost:3000/perizinan/kepulangan/approval
   ```

2. **Klik Tombol Download** (icon ungu)
   - Pilih perizinan yang sudah **approved_kepsek**

3. **Pilih Format:**
   - **Download PDF** → Format final
   - **Download Word** → Format editable

4. **Edit (Jika Perlu):**
   - Buka file .docx di Word
   - Isi nomor surat: `Nomor: ......................................`
   - Perbaiki jika ada kesalahan
   - Save dan cetak

## 🎯 Kapan Pakai Apa?

### Pakai PDF Jika:
- ✅ Data sudah benar semua
- ✅ Langsung mau cetak
- ✅ Tidak perlu edit

### Pakai Word Jika:
- ✅ Perlu isi nomor surat manual
- ✅ Ada typo atau kesalahan
- ✅ Perlu customisasi konten

## 📋 Perubahan Nomor Surat

**Sebelum:** `Nomor: 2025/01/F1768C44` (auto)
**Sekarang:** `Nomor: ......................................` (isi manual)

**Alasan:** Setiap sekolah punya sistem penomoran berbeda

## 🔧 Setup

```bash
# Install dependencies (sudah dilakukan)
npm install docx file-saver
```

## 📚 Dokumentasi Lengkap
- `FITUR_DOWNLOAD_WORD_PDF.md` - Dokumentasi detail

---
**Quick Guide** | **Update:** 2024
