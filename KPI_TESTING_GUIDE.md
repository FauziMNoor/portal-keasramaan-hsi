# 🧪 KPI SYSTEM - TESTING GUIDE

## 📋 Overview

Panduan lengkap untuk testing Sistem KPI Musyrif & Kepala Asrama.

**Testing Levels:**
1. Unit Testing (Functions & Components)
2. Integration Testing (API & Database)
3. End-to-End Testing (User Flows)
4. User Acceptance Testing (UAT)

---

## 🎯 Test Objectives

- ✅ Verify all features work as expected
- ✅ Ensure calculation accuracy (100%)
- ✅ Validate data integrity
- ✅ Test edge cases and error handling
- ✅ Confirm responsive design
- ✅ Check performance and load times

---

## 🧪 Unit Testing

### Calculation Functions

**Test: getHariKerjaEfektif()**
```typescript
// Test Case 1: Normal month with libur
Input: nama_musyrif="Ahmad", cabang="Pusat", bulan=12, tahun=2024
Expected: total_hari=31, hari_libur=4, hari_kerja_efektif=27

// Test Case 2: No libur
Input: nama_musyrif="Budi", cabang="Pusat", bulan=12, tahun=2024
Expected: total_hari=31, hari_libur=0, hari_kerja_efektif=31

// Test Case 3: Full libur
Input: nama_musyrif="Citra", cabang="Pusat", bulan=12, tahun=2024
Expected: total_hari=31, hari_libur=31, hari_kerja_efektif=0
```

**Test: calculateTier1Output()**
```typescript
// Test Case 1: Perfect scores
Input: All habit tracker = 100%
Expected: tier1_total = 50.00

// Test Case 2: Target scores
Input: Ubudiyah=98%, Akhlaq=95%, Kedisiplinan=95%, Kebersihan=95%
Expected: tier1_total = 50.00

// Test Case 3: Low scores
Input: All habit tracker = 50%
Expected: tier1_total < 30.00

// Test Case 4: No data
Input: No habit tracker data
Expected: tier1_total = 0.00
```

**Test: calculateTier2Administrasi()**
```typescript
// Test Case 1: Perfect completion
Input: Jurnal=30/30, Habit=30/30, Rapat=4/4, Kolaborasi=5★, Catatan=10
Expected: tier2_total = 30.00

// Test Case 2: Partial completion
Input: Jurnal=25/30, Habit=28/30, Rapat=3/4, Kolaborasi=4★, Catatan=8
Expected: tier2_total ≈ 26.00

// Test Case 3: No data
Input: All = 0
Expected: tier2_total = 0.00
```

**Test: calculateTier3Proses()**
```typescript
// Test Case 1: Perfect
Input: Completion=100%, Kehadiran=100%, Engagement=15
Expected: tier3_total = 20.00

// Test Case 2: Partial
Input: Completion=80%, Kehadiran=100%, Engagement=10
Expected: tier3_total ≈ 18.00

// Test Case 3: Low
Input: Completion=50%, Kehadiran=100%, Engagement=5
Expected: tier3_total ≈ 13.00
```

---

## 🔗 Integration Testing

### API Endpoints Testing

**Test: POST /api/kpi/jadwal-libur/generate-rutin**
```bash
# Test Case 1: Generate for Pusat, December 2024
curl -X POST http://localhost:3000/api/kpi/jadwal-libur/generate-rutin \
  -H "Content-Type: application/json" \
  -d '{"cabang":"Pusat","bulan":12,"tahun":2024}'

Expected Response:
{
  "success": true,
  "data": {
    "total_generated": 16,
    "jadwal": [...]
  }
}

# Verify:
- 2 groups created
- Alternating weekends
- Pengganti assigned
- Status = approved_kepala_sekolah
```

**Test: POST /api/kpi/jadwal-libur (Ajukan Cuti)**
```bash
# Test Case 1: Valid cuti request
curl -X POST http://localhost:3000/api/kpi/jadwal-libur \
  -H "Content-Type: application/json" \
  -d '{
    "nama_musyrif":"Ahmad",
    "cabang":"Pusat",
    "asrama":"Asrama A",
    "tanggal_mulai":"2024-12-15",
    "tanggal_selesai":"2024-12-17",
    "jenis_libur":"cuti",
    "keterangan":"Keperluan keluarga",
    "musyrif_pengganti":"Budi"
  }'

Expected Response:
{
  "success": true,
  "message": "Pengajuan cuti/izin berhasil dibuat, menunggu approval"
}

# Verify:
- Status = pending
- Sisa cuti checked
- Record created in database
```

**Test: PATCH /api/kpi/jadwal-libur/approve**
```bash
# Test Case 1: Approve by Kepala Asrama
curl -X PATCH http://localhost:3000/api/kpi/jadwal-libur/approve \
  -H "Content-Type: application/json" \
  -d '{
    "id":"xxx",
    "action":"approve",
    "level":"kepala_asrama",
    "approved_by":"Kepala Asrama A"
  }'

Expected Response:
{
  "success": true,
  "message": "Pengajuan berhasil disetujui oleh Kepala Asrama"
}

# Verify:
- Status = approved_kepala_asrama
- approved_by_kepala_asrama updated
- approved_at_kepala_asrama updated
```

**Test: POST /api/kpi/calculate/batch**
```bash
# Test Case 1: Calculate for November 2024
curl -X POST http://localhost:3000/api/kpi/calculate/batch \
  -H "Content-Type: application/json" \
  -d '{"bulan":11,"tahun":2024}'

Expected Response:
{
  "success": true,
  "data": {
    "total": 8,
    "saved": 8,
    "failed": 0,
    "results": [...]
  }
}

# Verify:
- All musyrif calculated
- Ranking assigned
- Scores saved to database
- Formula accuracy
```

---

## 🔄 End-to-End Testing

### User Flow 1: Generate Jadwal Libur → Calculate KPI

**Steps:**
1. Login as Admin
2. Navigate to `/manajemen-data/jadwal-libur-musyrif`
3. Click "Generate Jadwal Rutin"
4. Select: Cabang=Pusat, Bulan=12, Tahun=2024
5. Click "Generate"
6. Verify: Success message, jadwal created
7. Navigate to `/admin/kpi-calculation`
8. Select: Bulan=12, Tahun=2024
9. Click "Hitung KPI (Batch)"
10. Verify: Calculation complete, results displayed
11. Navigate to `/kpi/musyrif/Ahmad`
12. Verify: KPI displayed, hari libur excluded

**Expected Result:**
- Jadwal generated successfully
- KPI calculated accurately
- Hari libur excluded from calculation
- Dashboard shows correct data

---

### User Flow 2: Ajukan Cuti → Approval → KPI Update

**Steps:**
1. Login as Musyrif (Ahmad)
2. Navigate to `/manajemen-data/jadwal-libur-musyrif`
3. Click "Ajukan Cuti/Izin"
4. Fill form:
   - Jenis: Cuti
   - Tanggal: 15-17 Dec 2024
   - Keterangan: "Keperluan keluarga"
   - Pengganti: Budi
5. Submit
6. Verify: Success message, status=pending
7. Logout, Login as Kepala Asrama
8. Navigate to `/approval/cuti-musyrif`
9. Find Ahmad's request
10. Click "Approve (Kepala Asrama)"
11. Verify: Status=approved_kepala_asrama
12. Logout, Login as Kepala Sekolah
13. Navigate to `/approval/cuti-musyrif`
14. Find Ahmad's request
15. Click "Approve (Kepala Sekolah)"
16. Verify: Status=approved_kepala_sekolah
17. Check cuti terpakai updated

**Expected Result:**
- Cuti request created
- 2-level approval works
- Cuti terpakai updated
- Jadwal libur approved

---

### User Flow 3: Create Rapat → Input Kehadiran → KPI Reflects

**Steps:**
1. Login as Kepala Asrama
2. Navigate to `/koordinasi/rapat`
3. Click "Buat Rapat Baru"
4. Fill form:
   - Tanggal: 10 Dec 2024
   - Waktu: 14:00
   - Jenis: Evaluasi
   - Agenda: "Evaluasi Bulanan November"
   - Tempat: "Ruang Rapat"
5. Submit
6. Verify: Rapat created
7. Click "Kehadiran" on the rapat
8. Input kehadiran:
   - Ahmad: Hadir
   - Budi: Hadir
   - Citra: Izin
9. Verify: Kehadiran saved
10. Navigate to `/admin/kpi-calculation`
11. Calculate KPI for December
12. Navigate to `/kpi/musyrif/Ahmad`
13. Verify: Kehadiran Rapat score reflects attendance

**Expected Result:**
- Rapat created successfully
- Kehadiran recorded
- KPI calculation includes kehadiran data
- Score accurate

---

## 👥 User Acceptance Testing (UAT)

### UAT Scenario 1: Admin Monthly Workflow

**Objective:** Test complete monthly workflow from admin perspective

**Steps:**
1. Generate jadwal libur for next month
2. Monitor cuti requests throughout month
3. Approve/reject as needed
4. At end of month, calculate KPI
5. Review results in dashboards
6. Identify musyrif needing attention
7. Export reports (if available)

**Success Criteria:**
- All steps complete without errors
- Data accurate and consistent
- Dashboards informative
- Reports useful

---

### UAT Scenario 2: Musyrif Daily Workflow

**Objective:** Test musyrif daily activities

**Steps:**
1. View own KPI dashboard
2. Check improvement areas
3. Read recommendations
4. Input jurnal harian (existing feature)
5. Input habit tracker (existing feature)
6. Add log kolaborasi if applicable
7. Check jadwal libur

**Success Criteria:**
- Dashboard accessible
- Information clear
- Recommendations actionable
- Integration with existing features works

---

### UAT Scenario 3: Kepala Asrama Weekly Workflow

**Objective:** Test kepala asrama weekly activities

**Steps:**
1. Review team KPI dashboard
2. Identify top performers
3. Identify musyrif needing attention
4. Create weekly rapat
5. Input kehadiran after rapat
6. Review log kolaborasi
7. Rate kolaborasi
8. Approve/reject cuti requests

**Success Criteria:**
- Dashboard provides good overview
- Easy to identify issues
- Workflow smooth
- Actions clear

---

## 🐛 Edge Cases Testing

### Edge Case 1: No Data Scenarios

**Test 1.1: Musyrif with no jurnal**
- Expected: Tier 2 Jurnal = 0%, warning shown

**Test 1.2: Musyrif with no habit tracker**
- Expected: Tier 1 = 0%, Tier 2 Habit = 0%, warning shown

**Test 1.3: No rapat in month**
- Expected: Kehadiran Rapat = 0% or N/A

**Test 1.4: No kolaborasi**
- Expected: Inisiatif Kolaborasi = 0%

---

### Edge Case 2: Extreme Values

**Test 2.1: Perfect scores (100% everything)**
- Expected: Total score = 100.00, Rank = 1

**Test 2.2: Zero scores (0% everything)**
- Expected: Total score = 0.00, Rank = last

**Test 2.3: Very long names**
- Input: Musyrif name = 50 characters
- Expected: Text truncated or wrapped properly

**Test 2.4: Special characters in names**
- Input: Musyrif name = "Ahmad (Asrama A)"
- Expected: Handled correctly, no errors

---

### Edge Case 3: Boundary Conditions

**Test 3.1: Cuti exactly = sisa cuti**
- Input: Ajukan cuti 10 hari, sisa cuti = 10
- Expected: Approved, sisa cuti = 0

**Test 3.2: Cuti > sisa cuti**
- Input: Ajukan cuti 15 hari, sisa cuti = 10
- Expected: Rejected with error message

**Test 3.3: Month with 28 days (February)**
- Input: Calculate KPI for February
- Expected: Correct hari kerja efektif

**Test 3.4: Month with 31 days**
- Input: Calculate KPI for December
- Expected: Correct hari kerja efektif

---

### Edge Case 4: Concurrent Operations

**Test 4.1: Multiple users approve same cuti**
- Scenario: Kepala Asrama and Kepala Sekolah approve simultaneously
- Expected: Only one approval recorded, no duplicate

**Test 4.2: Calculate KPI while data being updated**
- Scenario: Calculate KPI while jurnal being added
- Expected: Use snapshot of data at calculation time

**Test 4.3: Generate jadwal for same month twice**
- Scenario: Generate jadwal rutin twice for same month
- Expected: Duplicate records or error message

---

## 📊 Performance Testing

### Load Testing

**Test 1: Batch Calculation Performance**
- Input: 100 musyrif across 2 cabang
- Expected: Complete in < 30 seconds
- Measure: Time per musyrif, total time

**Test 2: Dashboard Load Time**
- Input: Navigate to dashboard with 3 months trend
- Expected: Load in < 3 seconds
- Measure: Time to first paint, time to interactive

**Test 3: API Response Time**
- Input: GET /api/kpi/summary with 100 records
- Expected: Response in < 1 second
- Measure: Response time, payload size

---

## ✅ Test Checklist

### Pre-Testing
- [ ] Database migrated successfully
- [ ] Sample data loaded
- [ ] Environment variables configured
- [ ] All dependencies installed

### Core Features Testing
- [ ] Generate jadwal libur rutin
- [ ] Ajukan cuti/izin
- [ ] Approve cuti (2-level)
- [ ] Reject cuti with reason
- [ ] Create rapat
- [ ] Input kehadiran
- [ ] Add log kolaborasi
- [ ] Rate kolaborasi
- [ ] Calculate KPI (individual)
- [ ] Calculate KPI (batch)

### Dashboard Testing
- [ ] Dashboard Musyrif loads
- [ ] Dashboard Kepala Asrama loads
- [ ] Dashboard Kepala Sekolah loads
- [ ] Filters work correctly
- [ ] Links navigate correctly
- [ ] Data displays accurately

### Calculation Testing
- [ ] Tier 1 calculation accurate
- [ ] Tier 2 calculation accurate
- [ ] Tier 3 calculation accurate
- [ ] Total score correct
- [ ] Ranking correct
- [ ] Hari libur excluded

### Edge Cases Testing
- [ ] No data scenarios
- [ ] Extreme values
- [ ] Boundary conditions
- [ ] Concurrent operations
- [ ] Special characters
- [ ] Long names

### Responsive Design Testing
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] All pages responsive
- [ ] Tables scrollable on mobile

### Browser Compatibility Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📝 Test Report Template

### Test Execution Report

**Date:** [Date]  
**Tester:** [Name]  
**Environment:** [Dev/Staging/Production]

**Summary:**
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]

**Failed Tests:**
1. [Test Name] - [Reason] - [Priority]
2. [Test Name] - [Reason] - [Priority]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

**Sign-off:**
- Tester: ________________
- Date: ________________

---

## 🎯 Acceptance Criteria

### Must Have (Critical)
- ✅ All core features working
- ✅ Calculation 100% accurate
- ✅ No data loss
- ✅ No critical bugs
- ✅ Responsive design working

### Should Have (Important)
- ✅ All edge cases handled
- ✅ Error messages helpful
- ✅ Loading states implemented
- ✅ Performance acceptable
- ✅ Browser compatible

### Nice to Have (Optional)
- ⏳ Charts/visualizations
- ⏳ Export reports
- ⏳ Notifications
- ⏳ Advanced analytics

---

**Version:** 1.0.0  
**Date:** December 10, 2024  
**Status:** ✅ Ready for Testing
