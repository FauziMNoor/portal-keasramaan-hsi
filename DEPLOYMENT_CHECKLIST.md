# ✅ Deployment Checklist

Gunakan checklist ini untuk memastikan deployment berjalan lancar.

## 📋 Pre-Deployment

### Server Preparation
- [ ] Server sudah siap (Ubuntu/CentOS/Debian)
- [ ] SSH access sudah tersedia
- [ ] Root atau sudo access tersedia
- [ ] Domain sudah pointing ke server IP (optional)

### Software Installation
- [ ] Node.js v18+ sudah terinstall
  ```bash
  node --version  # Should be v18.17.0+
  ```
- [ ] npm sudah terinstall
  ```bash
  npm --version
  ```
- [ ] PM2 sudah terinstall global
  ```bash
  npm install -g pm2
  pm2 --version
  ```
- [ ] Nginx sudah terinstall (optional)
  ```bash
  nginx -v
  ```

### Database & API
- [ ] Supabase project sudah dibuat
- [ ] Database tables sudah dibuat (jalankan SETUP_DATABASE.sql)
- [ ] Supabase URL tersedia
- [ ] Supabase Anon Key tersedia
- [ ] Storage buckets sudah dibuat (logos, foto-siswa)

---

## 📦 Deployment Process

### 1. Upload Files
- [ ] Files sudah di-upload ke server
  - Via Git: `git clone <repo-url>`
  - Via FTP/SFTP: Upload folder
  - Via SCP: `scp -r portal-keasramaan user@server:/var/www/`

### 2. Install Dependencies
- [ ] Navigate ke folder project
  ```bash
  cd /var/www/portal-keasramaan
  ```
- [ ] Install dependencies
  ```bash
  npm install --production
  ```
- [ ] Verify installation
  ```bash
  ls node_modules  # Should have many folders
  ```

### 3. Environment Configuration
- [ ] Copy .env.local.example
  ```bash
  cp .env.local.example .env.local
  ```
- [ ] Edit .env.local
  ```bash
  nano .env.local
  ```
- [ ] Fill in Supabase credentials
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://sirriyah.smaithsi.sch.id
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
  ```
- [ ] Save and exit (Ctrl+X, Y, Enter)

### 4. Build Production
- [ ] Run build command
  ```bash
  npm run build
  ```
- [ ] Verify build success
  ```bash
  ls .next  # Should have build files
  ```
- [ ] Check for errors in build output

### 5. Start Application
- [ ] Start with PM2
  ```bash
  pm2 start npm --name "portal-keasramaan" -- start
  ```
- [ ] Verify running
  ```bash
  pm2 status
  ```
- [ ] Check logs
  ```bash
  pm2 logs portal-keasramaan --lines 50
  ```

### 6. Auto-Start Configuration
- [ ] Setup PM2 startup
  ```bash
  pm2 startup
  ```
- [ ] Run the command shown by PM2
- [ ] Save PM2 config
  ```bash
  pm2 save
  ```
- [ ] Test reboot (optional)
  ```bash
  sudo reboot
  # Wait for server to restart
  pm2 status  # Should show app running
  ```

---

## 🌐 Nginx Setup (Optional)

### 1. Install Nginx
- [ ] Install Nginx
  ```bash
  sudo apt install nginx  # Ubuntu/Debian
  sudo yum install nginx  # CentOS
  ```
- [ ] Verify installation
  ```bash
  nginx -v
  ```

### 2. Configure Nginx
- [ ] Copy config template
  ```bash
  sudo cp nginx.conf.example /etc/nginx/sites-available/portal-keasramaan
  ```
- [ ] Edit config
  ```bash
  sudo nano /etc/nginx/sites-available/portal-keasramaan
  ```
- [ ] Update server_name with your domain
  ```nginx
  server_name portal.smaithsi.sch.id;
  ```

### 3. Enable Site
- [ ] Create symlink
  ```bash
  sudo ln -s /etc/nginx/sites-available/portal-keasramaan /etc/nginx/sites-enabled/
  ```
- [ ] Test config
  ```bash
  sudo nginx -t
  ```
- [ ] Reload Nginx
  ```bash
  sudo systemctl reload nginx
  ```

### 4. SSL Certificate (Optional)
- [ ] Install Certbot
  ```bash
  sudo apt install certbot python3-certbot-nginx
  ```
- [ ] Get certificate
  ```bash
  sudo certbot --nginx -d portal.smaithsi.sch.id
  ```
- [ ] Verify SSL
  - Visit https://portal.smaithsi.sch.id
  - Check for green padlock

---

## 🔒 Security Configuration

### 1. Firewall
- [ ] Configure UFW (Ubuntu)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Or Firewalld (CentOS)
  ```bash
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
  ```

### 2. File Permissions
- [ ] Set ownership
  ```bash
  sudo chown -R www-data:www-data /var/www/portal-keasramaan
  ```
- [ ] Set permissions
  ```bash
  sudo chmod -R 755 /var/www/portal-keasramaan
  sudo chmod 600 /var/www/portal-keasramaan/.env.local
  ```

### 3. Secure Environment
- [ ] .env.local tidak ter-commit ke Git
- [ ] .env.local hanya readable by owner
- [ ] API keys aman dan tidak di-share

---

## 🧪 Testing

### 1. Application Access
- [ ] Access via IP
  - Open browser: `http://server-ip:3000`
  - Should show dashboard
- [ ] Access via domain (if Nginx configured)
  - Open browser: `http://portal.smaithsi.sch.id`
  - Should show dashboard
- [ ] Access via HTTPS (if SSL configured)
  - Open browser: `https://portal.smaithsi.sch.id`
  - Should show green padlock

### 2. Functionality Testing
- [ ] Dashboard loads correctly
- [ ] Logo sekolah muncul
- [ ] Statistik cards menampilkan data
- [ ] Menu navigasi berfungsi
- [ ] Sidebar collapsible berfungsi
- [ ] Form input berfungsi
- [ ] Data bisa disimpan ke database
- [ ] Upload file berfungsi

### 3. Performance Testing
- [ ] Page load < 3 detik
- [ ] No console errors
- [ ] Images load correctly
- [ ] Responsive di mobile
- [ ] Responsive di tablet
- [ ] Responsive di desktop

---

## 📊 Monitoring Setup

### 1. PM2 Monitoring
- [ ] Check PM2 status
  ```bash
  pm2 status
  ```
- [ ] Setup PM2 monitoring
  ```bash
  pm2 monit
  ```
- [ ] Check logs location
  ```bash
  pm2 info portal-keasramaan
  ```

### 2. Nginx Monitoring
- [ ] Check Nginx status
  ```bash
  sudo systemctl status nginx
  ```
- [ ] Check access logs
  ```bash
  sudo tail -f /var/log/nginx/access.log
  ```
- [ ] Check error logs
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```

---

## 🔄 Backup Setup

### 1. Create Backup Script
- [ ] Make backup script executable
  ```bash
  chmod +x backup.sh
  ```
- [ ] Test backup
  ```bash
  ./backup.sh
  ```
- [ ] Verify backup file created
  ```bash
  ls -lh /backup/portal-keasramaan/
  ```

### 2. Schedule Automatic Backup
- [ ] Edit crontab
  ```bash
  crontab -e
  ```
- [ ] Add daily backup at 2 AM
  ```cron
  0 2 * * * /var/www/portal-keasramaan/backup.sh
  ```

---

## 📝 Documentation

### 1. Document Server Info
- [ ] Server IP: _______________
- [ ] Domain: _______________
- [ ] SSH User: _______________
- [ ] SSH Port: _______________
- [ ] Application Port: _______________
- [ ] Nginx Port: _______________

### 2. Document Credentials
- [ ] Supabase URL: _______________
- [ ] Supabase Project: _______________
- [ ] SSL Certificate Expiry: _______________

### 3. Share Access
- [ ] Share server access dengan tim
- [ ] Share deployment guide
- [ ] Share monitoring dashboard

---

## ✅ Post-Deployment

### 1. Verify Everything Works
- [ ] Application accessible
- [ ] All features working
- [ ] No errors in logs
- [ ] Performance acceptable

### 2. Notify Team
- [ ] Inform team deployment complete
- [ ] Share application URL
- [ ] Share monitoring access

### 3. Monitor for 24 Hours
- [ ] Check logs regularly
- [ ] Monitor CPU/Memory usage
- [ ] Check for errors
- [ ] Verify auto-restart works

---

## 🎉 Deployment Complete!

Jika semua checklist sudah ✅, deployment berhasil! 🚀

**Next Steps:**
1. Monitor aplikasi selama 24-48 jam pertama
2. Setup backup otomatis
3. Setup monitoring alerts
4. Document any issues
5. Plan for updates

---

## 📞 Support

Jika ada masalah:
1. Check logs: `pm2 logs portal-keasramaan`
2. Check Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Restart app: `pm2 restart portal-keasramaan`
4. Restart Nginx: `sudo systemctl restart nginx`

Lihat dokumentasi lengkap di:
- `DEPLOYMENT_GUIDE.md` - Panduan lengkap
- `QUICK_START_DEPLOYMENT.md` - Quick start
- `README.md` - Project overview
