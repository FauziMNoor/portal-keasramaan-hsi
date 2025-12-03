# Quick Commands: Role Guru

## 🗄️ Database Commands

### Check Existing Users with Role 'user'
```sql
SELECT 
    id, 
    email, 
    nama_lengkap, 
    role, 
    cabang, 
    is_active 
FROM users_keasramaan 
WHERE role = 'user';
```

### Migrate Role 'user' to 'guru'
```sql
UPDATE users_keasramaan 
SET role = 'guru', updated_at = NOW() 
WHERE role = 'user';
```

### Verify Migration
```sql
SELECT 
    role, 
    COUNT(*) as total 
FROM users_keasramaan 
GROUP BY role 
ORDER BY role;
```

### Check All Guru Users
```sql
SELECT 
    id, 
    email, 
    nama_lengkap, 
    role, 
    cabang, 
    asrama,
    is_active,
    created_at 
FROM users_keasramaan 
WHERE role = 'guru' 
ORDER BY created_at DESC;
```

### Rollback (if needed)
```sql
UPDATE users_keasramaan 
SET role = 'user', updated_at = NOW() 
WHERE role = 'guru';
```

---

## 🔍 Testing Commands

### Test User Creation
```bash
# Via Browser
1. Open http://localhost:3000/users
2. Click "Tambah User"
3. Fill form with role "Guru"
4. Submit
```

### Test Login
```bash
# Via Browser
1. Open http://localhost:3000/login
2. Email: guru.test@example.com
3. Password: password123
4. Login
```

### Test Menu Access
```bash
# Via Browser - After login as Guru
1. Check sidebar menu
2. Should see only 6 menu items
3. Try accessing:
   - / (should work)
   - /overview/habit-tracker (should work)
   - /catatan-perilaku/dashboard (should work)
   - /habit-tracker/rekap (should work)
   - /catatan-perilaku/input (should work)
   - /catatan-perilaku/riwayat (should work)
   - /users (should not work - no menu)
```

---

## 🛠️ Development Commands

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Check ESLint
```bash
npm run lint
# or
yarn lint
```

### Build for Production
```bash
npm run build
# or
yarn build
```

---

## 📝 Git Commands

### Commit Changes
```bash
git add .
git commit -m "feat: implement role Guru with limited access"
```

### Create Feature Branch
```bash
git checkout -b feature/role-guru
```

### Push Changes
```bash
git push origin feature/role-guru
```

---

## 🔧 File Operations

### View Modified Files
```bash
# Windows PowerShell
Get-ChildItem -Path "portal-keasramaan" -Filter "*GURU*" -File

# Linux/Mac
ls -la portal-keasramaan/*GURU*
```

### Search for Role References
```bash
# Windows PowerShell
Select-String -Path "portal-keasramaan\app\**\*.tsx" -Pattern "role.*guru"

# Linux/Mac
grep -r "role.*guru" portal-keasramaan/app/
```

### Count Lines of Code Changed
```bash
# Windows PowerShell
(Get-Content "portal-keasramaan\app\users\page.tsx").Count

# Linux/Mac
wc -l portal-keasramaan/app/users/page.tsx
```

---

## 🧪 API Testing Commands

### Test Auth API
```bash
# Get Current User
curl http://localhost:3000/api/auth/me \
  -H "Cookie: session=YOUR_SESSION_TOKEN"
```

### Test User Creation API
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -d '{
    "email": "guru.test@example.com",
    "password": "password123",
    "nama_lengkap": "Guru Test",
    "role": "guru",
    "cabang": "Pusat",
    "is_active": true
  }'
```

---

## 📊 Database Queries for Analysis

### Count Users by Role
```sql
SELECT 
    role,
    COUNT(*) as total,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
FROM users_keasramaan 
GROUP BY role 
ORDER BY total DESC;
```

### Find Recently Created Guru Users
```sql
SELECT 
    email,
    nama_lengkap,
    cabang,
    asrama,
    created_at
FROM users_keasramaan 
WHERE role = 'guru' 
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Check User Login Activity
```sql
SELECT 
    email,
    nama_lengkap,
    role,
    last_login,
    CASE 
        WHEN last_login > NOW() - INTERVAL '1 day' THEN 'Active Today'
        WHEN last_login > NOW() - INTERVAL '7 days' THEN 'Active This Week'
        WHEN last_login > NOW() - INTERVAL '30 days' THEN 'Active This Month'
        ELSE 'Inactive'
    END as activity_status
FROM users_keasramaan 
WHERE role = 'guru'
ORDER BY last_login DESC;
```

### Find Guru Users by Cabang
```sql
SELECT 
    cabang,
    COUNT(*) as total_guru,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_guru
FROM users_keasramaan 
WHERE role = 'guru'
GROUP BY cabang
ORDER BY total_guru DESC;
```

---

## 🔐 Security Audit Commands

### Check Users Without Cabang
```sql
SELECT 
    id,
    email,
    nama_lengkap,
    role,
    cabang,
    asrama
FROM users_keasramaan 
WHERE role = 'guru' 
AND (cabang IS NULL OR cabang = '');
```

### Check Inactive Guru Users
```sql
SELECT 
    email,
    nama_lengkap,
    cabang,
    last_login,
    created_at
FROM users_keasramaan 
WHERE role = 'guru' 
AND is_active = false
ORDER BY created_at DESC;
```

---

## 📦 Backup Commands

### Backup Users Table
```sql
-- Create backup table
CREATE TABLE users_keasramaan_backup_20251106 AS 
SELECT * FROM users_keasramaan;

-- Verify backup
SELECT COUNT(*) FROM users_keasramaan_backup_20251106;
```

### Export Guru Users to CSV
```sql
COPY (
    SELECT 
        email,
        nama_lengkap,
        role,
        cabang,
        asrama,
        no_telepon,
        is_active,
        created_at
    FROM users_keasramaan 
    WHERE role = 'guru'
) TO '/tmp/guru_users.csv' WITH CSV HEADER;
```

---

## 🚀 Deployment Commands

### Build and Deploy
```bash
# Build
npm run build

# Start production server
npm start

# Or with PM2
pm2 start ecosystem.config.js
pm2 save
```

### Check Application Status
```bash
# With PM2
pm2 status
pm2 logs portal-keasramaan

# Check port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

---

## 📋 Checklist Commands

### Pre-Deployment Checklist
```bash
# 1. Run tests
npm test

# 2. Check build
npm run build

# 3. Check TypeScript
npx tsc --noEmit

# 4. Check linting
npm run lint

# 5. Verify database connection
# (Run in database client)
SELECT 1;
```

### Post-Deployment Verification
```bash
# 1. Check application is running
curl http://localhost:3000

# 2. Check API health
curl http://localhost:3000/api/auth/me

# 3. Verify database migration
# (Run in database client)
SELECT role, COUNT(*) FROM users_keasramaan GROUP BY role;
```

---

## 🔍 Debugging Commands

### Check Application Logs
```bash
# With PM2
pm2 logs portal-keasramaan --lines 100

# Or check log files
tail -f logs/application.log  # Linux/Mac
Get-Content logs\application.log -Tail 100  # Windows
```

### Check Database Connections
```sql
-- PostgreSQL
SELECT * FROM pg_stat_activity 
WHERE datname = 'your_database_name';

-- Check active queries
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE state = 'active';
```

### Clear Browser Cache
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📚 Documentation Commands

### Generate Documentation
```bash
# If using JSDoc or similar
npm run docs

# Or manually open documentation
start INDEX_ROLE_GURU.md  # Windows
open INDEX_ROLE_GURU.md   # Mac
xdg-open INDEX_ROLE_GURU.md  # Linux
```

### Search Documentation
```bash
# Windows PowerShell
Select-String -Path "portal-keasramaan\*GURU*.md" -Pattern "access"

# Linux/Mac
grep -r "access" portal-keasramaan/*GURU*.md
```

---

## 🎯 Quick Reference

### Most Used Commands

```bash
# Development
npm run dev

# Database Migration
UPDATE users_keasramaan SET role = 'guru' WHERE role = 'user';

# Check Users
SELECT role, COUNT(*) FROM users_keasramaan GROUP BY role;

# Build
npm run build

# Deploy
pm2 restart portal-keasramaan
```

---

## 📞 Emergency Commands

### Rollback Role Changes
```sql
-- Rollback all guru to user
UPDATE users_keasramaan 
SET role = 'user' 
WHERE role = 'guru';

-- Restore from backup
INSERT INTO users_keasramaan 
SELECT * FROM users_keasramaan_backup_20251106
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();
```

### Reset User Password
```sql
-- Note: Password should be hashed in production
UPDATE users_keasramaan 
SET password = 'NEW_HASHED_PASSWORD',
    updated_at = NOW()
WHERE email = 'guru.test@example.com';
```

### Disable User
```sql
UPDATE users_keasramaan 
SET is_active = false,
    updated_at = NOW()
WHERE email = 'guru.test@example.com';
```

---

**Last Updated:** 6 November 2025  
**Version:** 1.0
