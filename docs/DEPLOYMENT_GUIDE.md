# 🚀 Panduan Deployment ke Server Sendiri

## 📋 Persiapan

### 1. Requirement Server
- **OS:** Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Node.js:** v18.17.0 atau lebih tinggi
- **RAM:** Minimal 1GB (Rekomendasi 2GB+)
- **Storage:** Minimal 2GB free space
- **Port:** 3000 (atau custom port)

### 2. Software yang Dibutuhkan
```bash
# Node.js & npm
node --version  # v18.17.0+
npm --version   # v9.0.0+

# PM2 (Process Manager)
npm install -g pm2

# Nginx (Optional - untuk reverse proxy)
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS
```

---

## 📦 Cara Deploy

### Metode 1: Deploy Manual (Recommended)

#### Step 1: Upload File ke Server

**Option A: Menggunakan Git**
```bash
# Di server
cd /var/www/
git clone <repository-url> portal-keasramaan
cd portal-keasramaan
```

**Option B: Menggunakan FTP/SFTP**
- Upload folder `portal-keasramaan` ke server
- Lokasi: `/var/www/portal-keasramaan`

**Option C: Menggunakan SCP**
```bash
# Di komputer lokal
scp -r portal-keasramaan user@server-ip:/var/www/
```

#### Step 2: Install Dependencies
```bash
cd /var/www/portal-keasramaan
npm install --production
```

#### Step 3: Setup Environment Variables
```bash
# Copy .env.local
cp .env.local.example .env.local

# Edit dengan nano/vim
nano .env.local
```

Isi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sirriyah.smaithsi.sch.id
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 4: Build Production
```bash
npm run build
```

#### Step 5: Start dengan PM2
```bash
# Start aplikasi
pm2 start npm --name "portal-keasramaan" -- start

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup
```

#### Step 6: Verifikasi
```bash
# Cek status
pm2 status

# Cek logs
pm2 logs portal-keasramaan

# Akses di browser
http://server-ip:3000
```

---

### Metode 2: Deploy dengan PM2 Ecosystem File

#### Step 1: Buat File ecosystem.config.js
File sudah dibuat di root project.

#### Step 2: Deploy
```bash
cd /var/www/portal-keasramaan
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔧 Konfigurasi Nginx (Reverse Proxy)

### 1. Buat Nginx Config
```bash
sudo nano /etc/nginx/sites-available/portal-keasramaan
```

### 2. Isi Config
```nginx
server {
    listen 80;
    server_name portal.smaithsi.sch.id;  # Ganti dengan domain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/portal-keasramaan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL (Optional - Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL Certificate
sudo certbot --nginx -d portal.smaithsi.sch.id
```

---

## 🔄 Update Aplikasi

### Manual Update
```bash
cd /var/www/portal-keasramaan

# Pull latest code (jika pakai Git)
git pull origin main

# Install dependencies baru (jika ada)
npm install --production

# Build ulang
npm run build

# Restart aplikasi
pm2 restart portal-keasramaan
```

### Auto Update Script
Buat file `update.sh`:
```bash
#!/bin/bash
cd /var/www/portal-keasramaan
git pull origin main
npm install --production
npm run build
pm2 restart portal-keasramaan
echo "Update completed!"
```

Jalankan:
```bash
chmod +x update.sh
./update.sh
```

---

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# Status aplikasi
pm2 status

# Logs real-time
pm2 logs portal-keasramaan

# Logs dengan filter
pm2 logs portal-keasramaan --lines 100

# Restart
pm2 restart portal-keasramaan

# Stop
pm2 stop portal-keasramaan

# Delete
pm2 delete portal-keasramaan

# Monitor CPU & Memory
pm2 monit
```

### Nginx Commands
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Security Best Practices

### 1. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Environment Variables
- Jangan commit `.env.local` ke Git
- Gunakan environment variables yang aman
- Rotate API keys secara berkala

### 3. File Permissions
```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/portal-keasramaan

# Set permissions
sudo chmod -R 755 /var/www/portal-keasramaan
sudo chmod 600 /var/www/portal-keasramaan/.env.local
```

### 4. Backup
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/portal-keasramaan-$DATE.tar.gz /var/www/portal-keasramaan
```

---

## 🐛 Troubleshooting

### Port 3000 sudah digunakan
```bash
# Cari process yang pakai port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Atau ganti port di package.json
"start": "next start -p 3001"
```

### Build gagal - Out of Memory
```bash
# Tambah swap memory
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Atau build di local, upload hasil build
npm run build
# Upload folder .next ke server
```

### PM2 tidak auto-start setelah reboot
```bash
# Setup ulang
pm2 unstartup
pm2 startup
pm2 save
```

### Nginx 502 Bad Gateway
```bash
# Cek aplikasi berjalan
pm2 status

# Cek logs
pm2 logs portal-keasramaan

# Restart aplikasi
pm2 restart portal-keasramaan
```

---

## 📈 Performance Optimization

### 1. Enable Gzip di Nginx
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. Cache Static Files
```nginx
location /_next/static {
    alias /var/www/portal-keasramaan/.next/static;
    expires 365d;
    access_log off;
}
```

### 3. PM2 Cluster Mode
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'portal-keasramaan',
    script: 'npm',
    args: 'start',
    instances: 'max',  // Gunakan semua CPU cores
    exec_mode: 'cluster',
  }]
}
```

---

## 📞 Support

Jika ada masalah saat deployment:
1. Cek logs: `pm2 logs portal-keasramaan`
2. Cek Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Cek status: `pm2 status` dan `sudo systemctl status nginx`

---

## ✅ Checklist Deployment

- [ ] Server sudah terinstall Node.js v18+
- [ ] PM2 sudah terinstall global
- [ ] File aplikasi sudah di-upload ke server
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] File `.env.local` sudah dikonfigurasi
- [ ] Build production berhasil (`npm run build`)
- [ ] Aplikasi berjalan dengan PM2
- [ ] PM2 auto-start sudah di-setup
- [ ] Nginx sudah dikonfigurasi (optional)
- [ ] SSL certificate sudah di-install (optional)
- [ ] Firewall sudah dikonfigurasi
- [ ] Backup script sudah dibuat
- [ ] Aplikasi bisa diakses dari browser

---

## 🎉 Selamat!

Aplikasi Portal Keasramaan sudah berhasil di-deploy! 🚀

**Akses:**
- Tanpa Nginx: `http://server-ip:3000`
- Dengan Nginx: `http://domain-anda.com`
- Dengan SSL: `https://domain-anda.com`
