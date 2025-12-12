# 🚀 KPI SYSTEM - DEPLOYMENT GUIDE

## 📋 Overview

Panduan lengkap untuk deployment Sistem KPI Musyrif & Kepala Asrama ke production environment.

---

## 🎯 Pre-Deployment Checklist

### Code Readiness
- [x] All features implemented
- [x] All tests passed
- [x] No critical bugs
- [x] Code reviewed
- [x] Documentation complete

### Environment Setup
- [ ] Production server ready
- [ ] Database configured
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured

### Data Preparation
- [ ] Database migration ready
- [ ] Sample data prepared (optional)
- [ ] Backup strategy defined
- [ ] Rollback plan ready

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### Step 2: Run Migration

**File:** `portal-keasramaan/supabase/migrations/20241210_kpi_system.sql`

**Method 1: Supabase Dashboard**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire migration file
4. Execute
5. Verify: 6 tables created

**Method 2: Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Step 3: Verify Tables

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%keasramaan%'
ORDER BY table_name;
```

Expected tables:
- `jadwal_libur_musyrif_keasramaan`
- `rapat_koordinasi_keasramaan`
- `kehadiran_rapat_keasramaan`
- `log_kolaborasi_keasramaan`
- `kpi_summary_keasramaan`
- `cuti_tahunan_musyrif_keasramaan`

### Step 4: Verify Indexes

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE '%keasramaan%'
ORDER BY tablename, indexname;
```

Expected: 15+ indexes

### Step 5: Test RLS Policies

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE '%keasramaan%';
```

Expected: Policies for each table

---

## ⚙️ Environment Configuration

### Step 1: Create .env.local

**File:** `portal-keasramaan/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Step 2: Verify Environment Variables

```bash
# Check if variables are loaded
npm run build

# Should not show any missing variable errors
```

---

## 📦 Build & Deploy

### Option 1: Vercel Deployment (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# Navigate to project directory
cd portal-keasramaan

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? portal-keasramaan
# - Directory? ./
# - Override settings? No
```

**Step 4: Add Environment Variables**
```bash
# Add via Vercel Dashboard
# Settings > Environment Variables
# Or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Step 5: Deploy to Production**
```bash
vercel --prod
```

---

### Option 2: Manual Deployment (VPS/Server)

**Step 1: Install Dependencies**
```bash
# On server
cd /var/www/portal-keasramaan
npm install --production
```

**Step 2: Build**
```bash
npm run build
```

**Step 3: Start with PM2**
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "portal-keasramaan" -- start

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
```

**Step 4: Configure Nginx**

**File:** `/etc/nginx/sites-available/portal-keasramaan`

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/portal-keasramaan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 5: Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: Docker Deployment

**Step 1: Create Dockerfile**

**File:** `portal-keasramaan/Dockerfile`

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

**Step 3: Deploy**
```bash
docker-compose up -d
```

---

## 🔧 Post-Deployment Configuration

### Step 1: Verify Deployment

**Check 1: Homepage loads**
```bash
curl https://your-domain.com
# Should return HTML
```

**Check 2: API endpoints work**
```bash
curl https://your-domain.com/api/kpi/summary
# Should return JSON
```

**Check 3: Database connection**
```bash
# Try to fetch data from any page
# Should not show connection errors
```

### Step 2: Initial Data Setup

**2.1: Verify Musyrif Data**
```sql
SELECT COUNT(*) FROM musyrif_keasramaan WHERE status = 'aktif';
```

If no data, insert sample musyrif:
```sql
INSERT INTO musyrif_keasramaan (nama_musyrif, cabang, asrama, status)
VALUES 
  ('Ahmad', 'Pusat', 'Asrama A', 'aktif'),
  ('Budi', 'Pusat', 'Asrama B', 'aktif'),
  ('Citra', 'Sukabumi', 'Asrama C', 'aktif');
```

**2.2: Initialize Cuti Tahunan**
```sql
-- Auto-created when first cuti request or can be pre-populated
INSERT INTO cuti_tahunan_musyrif_keasramaan (nama_musyrif, tahun, jatah_cuti, cuti_terpakai, sisa_cuti)
SELECT nama_musyrif, 2024, 12, 0, 12
FROM musyrif_keasramaan
WHERE status = 'aktif';
```

**2.3: Generate Initial Jadwal Libur**
- Navigate to `/manajemen-data/jadwal-libur-musyrif`
- Click "Generate Jadwal Rutin"
- Select current month
- Generate

### Step 3: Calculate Initial KPI

**Option 1: Via UI**
- Navigate to `/admin/kpi-calculation`
- Select previous month (if data exists)
- Click "Hitung KPI (Batch)"

**Option 2: Via API**
```bash
curl -X POST https://your-domain.com/api/kpi/calculate/batch \
  -H "Content-Type: application/json" \
  -d '{"bulan":11,"tahun":2024}'
```

### Step 4: Test All Features

Run through test scenarios from KPI_TESTING_GUIDE.md:
- [ ] Generate jadwal libur
- [ ] Ajukan cuti
- [ ] Approve cuti
- [ ] Create rapat
- [ ] Add log kolaborasi
- [ ] Calculate KPI
- [ ] View dashboards

---

## 👥 User Setup & Training

### Step 1: Create User Accounts

**Method depends on your auth system:**
- Supabase Auth
- Custom auth
- SSO integration

**User Roles:**
- Admin
- Kepala Sekolah
- Kepala Asrama
- Musyrif

### Step 2: Assign Permissions

Configure role-based access:
- Admin: Full access
- Kepala Sekolah: Global KPI, final approval
- Kepala Asrama: Team KPI, first approval
- Musyrif: Own KPI only

### Step 3: Conduct Training

**Training Sessions:**

**Session 1: Admin Training (2 hours)**
- System overview
- Generate jadwal libur
- Manage cuti requests
- Calculate KPI
- View all dashboards
- Troubleshooting

**Session 2: Kepala Asrama Training (1.5 hours)**
- View team KPI
- Approve cuti requests
- Create rapat
- Input kehadiran
- Rate kolaborasi
- Identify improvement areas

**Session 3: Musyrif Training (1 hour)**
- View own KPI
- Understand scoring
- Read recommendations
- Ajukan cuti/izin
- Add log kolaborasi

### Step 4: Provide Documentation

Distribute:
- KPI_USER_GUIDE.md
- KPI_USER_GUIDE_JADWAL_LIBUR.md
- Quick reference cards
- FAQ document

---

## 📊 Monitoring & Maintenance

### Daily Monitoring

**Check 1: System Health**
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs portal-keasramaan --lines 100
```

**Check 2: Database Performance**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Check 3: Error Logs**
- Check application logs
- Check Supabase logs
- Check Nginx logs (if applicable)

### Weekly Maintenance

**Task 1: Review Usage**
- Number of active users
- Number of KPI calculations
- Number of cuti requests
- System performance

**Task 2: Backup Database**
```bash
# Supabase auto-backups daily
# Additional manual backup:
pg_dump -h your-db-host -U postgres -d your-db > backup_$(date +%Y%m%d).sql
```

**Task 3: Update Dependencies**
```bash
npm outdated
npm update
npm audit fix
```

### Monthly Maintenance

**Task 1: Calculate KPI**
- Run batch calculation for previous month
- Verify results
- Notify users

**Task 2: Review System Performance**
- Page load times
- API response times
- Database query performance
- User feedback

**Task 3: Plan Improvements**
- Review feature requests
- Prioritize enhancements
- Schedule updates

---

## 🔄 Update & Rollback Procedures

### Update Procedure

**Step 1: Backup**
```bash
# Backup database
pg_dump > backup_before_update.sql

# Backup code
git tag v1.0.0-backup
```

**Step 2: Test in Staging**
- Deploy to staging environment
- Run all tests
- Verify functionality

**Step 3: Deploy to Production**
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart
pm2 restart portal-keasramaan
```

**Step 4: Verify**
- Check homepage
- Test critical features
- Monitor logs

### Rollback Procedure

**If issues occur:**

**Step 1: Rollback Code**
```bash
# Revert to previous version
git checkout v1.0.0-backup

# Rebuild
npm install
npm run build

# Restart
pm2 restart portal-keasramaan
```

**Step 2: Rollback Database (if needed)**
```bash
# Restore from backup
psql -h your-db-host -U postgres -d your-db < backup_before_update.sql
```

**Step 3: Verify**
- Check system functionality
- Notify users of rollback

---

## 🐛 Troubleshooting

### Issue 1: App Won't Start

**Symptoms:**
- PM2 shows "errored" status
- Port already in use

**Solutions:**
```bash
# Check if port is in use
lsof -i :3000

# Kill process
kill -9 <PID>

# Restart app
pm2 restart portal-keasramaan

# Check logs
pm2 logs portal-keasramaan
```

### Issue 2: Database Connection Failed

**Symptoms:**
- "Connection refused" errors
- Timeout errors

**Solutions:**
1. Check environment variables
2. Verify Supabase project is active
3. Check network connectivity
4. Verify database credentials

### Issue 3: Calculation Errors

**Symptoms:**
- KPI calculation fails
- Incorrect scores

**Solutions:**
1. Check data integrity
2. Verify hari kerja efektif calculation
3. Check for missing data
4. Review calculation logs

### Issue 4: Slow Performance

**Symptoms:**
- Pages load slowly
- API timeouts

**Solutions:**
1. Check database indexes
2. Optimize queries
3. Enable caching
4. Scale server resources

---

## 📞 Support Contacts

### Technical Support
- **Email:** [tech-support@example.com]
- **Phone:** [+62-xxx-xxxx-xxxx]
- **Hours:** Mon-Fri, 9AM-5PM

### Emergency Contact
- **On-call:** [+62-xxx-xxxx-xxxx]
- **Available:** 24/7 for critical issues

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Backup strategy defined
- [ ] Rollback plan ready

### Database Setup
- [ ] Supabase project created
- [ ] Migration executed
- [ ] Tables verified
- [ ] Indexes verified
- [ ] RLS policies verified

### Environment Configuration
- [ ] .env.local created
- [ ] Environment variables set
- [ ] Secrets secured
- [ ] Domain configured
- [ ] SSL certificate installed

### Deployment
- [ ] Code deployed
- [ ] Build successful
- [ ] App started
- [ ] Health check passed
- [ ] API endpoints working

### Post-Deployment
- [ ] Initial data loaded
- [ ] Jadwal libur generated
- [ ] KPI calculated (if applicable)
- [ ] All features tested
- [ ] Users notified

### Training & Documentation
- [ ] Admin trained
- [ ] Kepala Asrama trained
- [ ] Musyrif trained
- [ ] Documentation distributed
- [ ] Support channels established

### Monitoring
- [ ] Monitoring tools configured
- [ ] Alerts set up
- [ ] Backup scheduled
- [ ] Maintenance plan defined

---

## 🎉 Go-Live Checklist

### Day Before Go-Live
- [ ] Final testing complete
- [ ] Backup created
- [ ] Team briefed
- [ ] Users notified
- [ ] Support ready

### Go-Live Day
- [ ] Deploy to production
- [ ] Verify all features
- [ ] Monitor closely
- [ ] Be available for support
- [ ] Document any issues

### Day After Go-Live
- [ ] Review logs
- [ ] Check user feedback
- [ ] Fix critical issues
- [ ] Monitor performance
- [ ] Plan improvements

---

**Version:** 1.0.0  
**Date:** December 10, 2024  
**Status:** ✅ Ready for Deployment

🚀 **GOOD LUCK WITH YOUR DEPLOYMENT!** 🚀
