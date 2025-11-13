# ⚡ QUICK FIX: Server Build Error

## ❌ Error di Server
```
Module not found: Can't resolve 'docx'
```

## ✅ Solusi Cepat

### Step 1: Install Dependencies di Server

**SSH ke server dan jalankan:**
```bash
cd /home/smaithsi-asrama/htdocs/asrama.smaithsi.sch.id

# Install package yang hilang
npm install docx file-saver

# Build
npm run build

# Restart
pm2 restart 3
```

### Step 2: Jika Masih Error

**Full reinstall:**
```bash
cd /home/smaithsi-asrama/htdocs/asrama.smaithsi.sch.id

# Backup dulu (optional)
cp package.json package.json.backup

# Hapus dan reinstall
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Restart
pm2 restart 3
```

### Step 3: Verify

**Check apakah berhasil:**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs 3 --lines 50

# Check if docx installed
npm list docx
```

## 🔄 Deployment Proper (Untuk Kedepannya)

### Di Local (Windows):
```bash
# Commit changes
git add .
git commit -m "Add DOCX download feature"
git push origin main
```

### Di Server (Linux):
```bash
# Pull latest code
cd /home/smaithsi-asrama/htdocs/asrama.smaithsi.sch.id
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart
pm2 restart 3
```

### Atau gunakan script otomatis:
```bash
# Di server
chmod +x DEPLOY_TO_SERVER.sh
./DEPLOY_TO_SERVER.sh
```

## 📋 Checklist

- [ ] SSH ke server
- [ ] Navigate ke project directory
- [ ] Install `docx` dan `file-saver`
- [ ] Build berhasil
- [ ] PM2 restart
- [ ] Test aplikasi di browser
- [ ] Verify download PDF & Word work

## 🆘 Jika Masih Error

### Error: Permission Denied
```bash
# Fix permissions
sudo chown -R $USER:$USER /home/smaithsi-asrama/htdocs/asrama.smaithsi.sch.id
```

### Error: Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Error: Port Already in Use
```bash
# Kill process
pm2 delete 3
pm2 start npm --name "portal-keasramaan" -- start
```

## 📝 Notes

- Local build berhasil ≠ Server build berhasil
- Server perlu install dependencies dari `package.json`
- Pastikan `package.json` ter-commit ke git
- Pull code terbaru sebelum build

---
**Quick Fix Guide** | **Update:** 2024
