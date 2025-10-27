# ⚡ Quick Start Deployment

Panduan cepat untuk deploy Portal Keasramaan ke server sendiri.

## 🚀 Deploy dalam 5 Menit

### 1. Upload ke Server
```bash
# Di server
cd /var/www
git clone <repository-url> portal-keasramaan
cd portal-keasramaan
```

### 2. Install & Build
```bash
npm install --production
npm run build
```

### 3. Setup Environment
```bash
cp .env.local.example .env.local
nano .env.local
```

Isi dengan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sirriyah.smaithsi.sch.id
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 4. Start dengan PM2
```bash
# Install PM2 (jika belum)
npm install -g pm2

# Start aplikasi
pm2 start npm --name "portal-keasramaan" -- start

# Auto-start on boot
pm2 startup
pm2 save
```

### 5. Akses Aplikasi
```
http://server-ip:3000
```

## ✅ Done!

Aplikasi sudah berjalan! 🎉

---

## 🔧 Setup Nginx (Optional)

### 1. Install Nginx
```bash
sudo apt install nginx  # Ubuntu/Debian
```

### 2. Copy Config
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/portal-keasramaan
sudo nano /etc/nginx/sites-available/portal-keasramaan
# Edit server_name dengan domain Anda
```

### 3. Enable & Restart
```bash
sudo ln -s /etc/nginx/sites-available/portal-keasramaan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL (Optional)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d portal.smaithsi.sch.id
```

---

## 📊 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs portal-keasramaan

# Restart
pm2 restart portal-keasramaan
```

---

## 🔄 Update Aplikasi

```bash
cd /var/www/portal-keasramaan
git pull
npm install --production
npm run build
pm2 restart portal-keasramaan
```

Atau gunakan script:
```bash
chmod +x update.sh
./update.sh
```

---

## 🆘 Troubleshooting

### Port 3000 sudah digunakan
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### PM2 tidak jalan
```bash
pm2 delete portal-keasramaan
pm2 start npm --name "portal-keasramaan" -- start
```

### Build gagal
```bash
# Tambah swap memory
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📞 Need Help?

Lihat dokumentasi lengkap di `DEPLOYMENT_GUIDE.md`
