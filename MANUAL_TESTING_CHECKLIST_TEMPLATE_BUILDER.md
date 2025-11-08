# Manual Testing Checklist - Template Builder Rapor

## Overview
This document provides a comprehensive manual testing checklist for the Template Builder Rapor feature. Follow this checklist to ensure all functionality works correctly before deployment.

**Testing Environment:**
- Browser: Chrome, Firefox, Safari, Edge
- Devices: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- Test Data: Minimum 100 students, multiple classes, asrama, and cabang

---

## 1. Complete Workflow Testing

### 1.1 Create Template → Add Elements → Preview → Generate

#### Test Case 1.1.1: Create New Builder Template
- [ ] Navigate to `/manajemen-rapor/template-rapor`
- [ ] Click "Create New Template" button
- [ ] Select "Builder" as template type
- [ ] Enter template name: "Test Rapor Semester 1"
- [ ] Select jenis_rapor: "semester"
- [ ] Verify redirect to builder page
- [ ] Verify blank A4 canvas is displayed
- [ ] Verify three-column layout: Components Sidebar | Canvas | Properties Panel

**Expected Result:** New template created successfully, builder interface loads with empty canvas.

#### Test Case 1.1.2: Add Header Element
- [ ] Drag "Header" element from Components Sidebar to canvas
- [ ] Drop at position (50, 50)
- [ ] Verify element appears on canvas
- [ ] Click on header element to select
- [ ] Verify Properties Panel shows header properties
- [ ] Set title text: "{{school.nama}}"
- [ ] Set subtitle: "Laporan Habit Tracker Semester {{periode.semester}}"
- [ ] Upload logo or set logo URL
- [ ] Set background color: #4F46E5
- [ ] Set title color: #FFFFFF
- [ ] Verify changes appear in real-time on canvas

**Expected Result:** Header element added and configured successfully with live preview.

#### Test Case 1.1.3: Add Text Elements
- [ ] Add Text element for student info section
- [ ] Set text: "Nama: {{siswa.nama}}\nNIS: {{siswa.nis}}\nKelas: {{siswa.kelas}}"
- [ ] Set font size: 14
- [ ] Set font weight: normal
- [ ] Position at (50, 150)
- [ ] Resize to appropriate size
- [ ] Verify placeholder text displays correctly

**Expected Result:** Text element with data bindings displays placeholders.

#### Test Case 1.1.4: Add Data Table Element
- [ ] Add Data Table element to canvas
- [ ] Position at (50, 250)
- [ ] Set data source: "habit_tracker.ubudiyah"
- [ ] Configure columns:
  - Column 1: "Indikator" → field: "indikator"
  - Column 2: "Nilai" → field: "nilai"
  - Column 3: "Persentase" → field: "persentase"
- [ ] Set header background: #E0E7FF
- [ ] Set header text color: #312E81
- [ ] Enable alternate row colors
- [ ] Set row alternate color: #F5F5F5
- [ ] Verify table preview shows sample data

**Expected Result:** Data table configured with proper styling and sample data.

#### Test Case 1.1.5: Add Image Gallery Element
- [ ] Add Image Gallery element
- [ ] Position at (50, 500)
- [ ] Set data binding: "galeri_kegiatan"
- [ ] Set max images: 6
- [ ] Set layout: "grid"
- [ ] Set grid columns: 3
- [ ] Set gap: 10
- [ ] Set image size: 150x150
- [ ] Enable show captions
- [ ] Verify gallery shows placeholder images

**Expected Result:** Image gallery configured with grid layout and placeholders.

#### Test Case 1.1.6: Add Signature Element
- [ ] Add Signature element
- [ ] Position at (400, 700)
- [ ] Set label: "Pembina Asrama"
- [ ] Set name binding: "{{pembina.nama}}"
- [ ] Enable show line
- [ ] Enable show date
- [ ] Set text alignment: center
- [ ] Verify signature block displays correctly

**Expected Result:** Signature element configured with proper layout.

#### Test Case 1.1.7: Save Template
- [ ] Click "Save" button or press Ctrl+S
- [ ] Verify success toast appears
- [ ] Verify template saved to database
- [ ] Refresh page
- [ ] Verify all elements load correctly

**Expected Result:** Template saved and persists after refresh.

#### Test Case 1.1.8: Preview with Sample Data
- [ ] Click "Preview" button
- [ ] Verify preview modal opens
- [ ] Verify PDF preview loads within 2 seconds
- [ ] Verify all placeholders replaced with sample data
- [ ] Verify layout matches canvas design
- [ ] Verify images load correctly
- [ ] Close preview modal

**Expected Result:** Preview generates successfully with sample data.

#### Test Case 1.1.9: Preview with Real Student Data
- [ ] Click "Preview" button
- [ ] Select a student from dropdown
- [ ] Select periode: 2024/2025, Semester 1
- [ ] Click "Generate Preview"
- [ ] Verify preview loads with real student data
- [ ] Verify habit tracker data shows actual scores
- [ ] Verify galeri kegiatan shows student's photos
- [ ] Verify all bindings resolved correctly

**Expected Result:** Preview shows real student data accurately.

#### Test Case 1.1.10: Generate Single PDF
- [ ] Navigate to `/manajemen-rapor/generate-rapor`
- [ ] Select the test template
- [ ] Select single student
- [ ] Select periode: 2024/2025, Semester 1
- [ ] Click "Generate Rapor"
- [ ] Verify progress indicator appears
- [ ] Verify PDF generates within 5 seconds
- [ ] Click "Download" button
- [ ] Verify PDF downloads successfully
- [ ] Open PDF and verify:
  - All data populated correctly
  - Layout matches template design
  - Images display properly
  - No missing or broken elements

**Expected Result:** Single PDF generated and downloaded successfully with correct data.

---

## 2. Various Data Scenarios Testing

### 2.1 Complete Data Scenario
- [ ] Select student with complete data (all habit tracker entries, multiple photos)
- [ ] Generate rapor
- [ ] Verify all sections populated
- [ ] Verify all calculations correct
- [ ] Verify all images display

**Expected Result:** Rapor fully populated with all data.

### 2.2 Partial Data Scenario
- [ ] Select student with partial habit tracker data (only 2 of 4 indicators)
- [ ] Generate rapor
- [ ] Verify available data displays correctly
- [ ] Verify missing indicators show 0 or N/A
- [ ] Verify no errors or crashes

**Expected Result:** Rapor handles partial data gracefully.

### 2.3 No Habit Tracker Data
- [ ] Select student with no habit tracker entries
- [ ] Generate rapor
- [ ] Verify habit tracker sections show empty or default values
- [ ] Verify other sections (student info) still populate
- [ ] Verify no errors

**Expected Result:** Rapor generates with empty habit tracker data.

### 2.4 No Gallery Photos
- [ ] Select student with no galeri kegiatan photos
- [ ] Generate rapor
- [ ] Verify image gallery section shows no images or placeholder
- [ ] Verify other sections populate correctly
- [ ] Verify no broken image icons

**Expected Result:** Rapor handles missing photos gracefully.

### 2.5 Maximum Data Scenario
- [ ] Select student with maximum data (100+ habit tracker entries, 50+ photos)
- [ ] Generate rapor
- [ ] Verify only configured max images display (e.g., 6 photos)
- [ ] Verify table shows all habit tracker data or configured max rows
- [ ] Verify PDF size is reasonable (<5MB)
- [ ] Verify generation completes within 10 seconds

**Expected Result:** Rapor handles large datasets efficiently.

### 2.6 Special Characters in Data
- [ ] Select student with special characters in name (e.g., "Ahmad Al-Farisi", "Siti Nur'aini")
- [ ] Generate rapor
- [ ] Verify special characters display correctly
- [ ] Verify no encoding issues
- [ ] Test with Arabic characters if applicable

**Expected Result:** Special characters render correctly in PDF.

### 2.7 Long Text Data
- [ ] Create template with text element bound to long text field
- [ ] Generate rapor with student having long notes/comments
- [ ] Verify text wraps correctly
- [ ] Verify no text overflow outside element bounds
- [ ] Verify readability maintained

**Expected Result:** Long text handled with proper wrapping.

---

## 3. Error Cases Testing

### 3.1 Missing Data Bindings
- [ ] Create template with invalid binding: "{{siswa.invalid_field}}"
- [ ] Generate rapor
- [ ] Verify error handling (show placeholder or empty string)
- [ ] Verify PDF still generates
- [ ] Verify error logged to console/database

**Expected Result:** Invalid bindings handled gracefully without crash.

### 3.2 Invalid Template Configuration
- [ ] Create template with element positioned outside canvas bounds
- [ ] Try to save template
- [ ] Verify validation error appears
- [ ] Verify template not saved until fixed
- [ ] Fix position and save successfully

**Expected Result:** Validation prevents invalid configurations.

### 3.3 Network Failure During Generation
- [ ] Start PDF generation
- [ ] Simulate network disconnection (disable network in DevTools)
- [ ] Verify error message appears
- [ ] Verify retry option available
- [ ] Reconnect network and retry
- [ ] Verify generation completes

**Expected Result:** Network errors handled with retry mechanism.

### 3.4 Image Load Failure
- [ ] Create template with image element using invalid URL
- [ ] Generate rapor
- [ ] Verify fallback image or placeholder displays
- [ ] Verify PDF still generates
- [ ] Verify no broken image icons

**Expected Result:** Failed images replaced with fallback.

### 3.5 Database Connection Error
- [ ] Simulate database unavailability
- [ ] Try to load template builder
- [ ] Verify error message displays
- [ ] Verify user-friendly error text
- [ ] Restore database
- [ ] Verify recovery without page refresh

**Expected Result:** Database errors communicated clearly to user.

### 3.6 Storage Upload Failure
- [ ] Generate rapor with storage service unavailable
- [ ] Verify error message appears
- [ ] Verify retry mechanism activates
- [ ] Verify generation marked as failed after max retries
- [ ] Verify user can retry manually

**Expected Result:** Storage failures handled with retries and clear feedback.

---

## 4. Cross-Browser and Device Testing

### 4.1 Desktop Browsers

#### Chrome (Latest)
- [ ] Test complete workflow
- [ ] Test drag and drop functionality
- [ ] Test preview modal
- [ ] Test PDF generation
- [ ] Verify all UI elements render correctly
- [ ] Test keyboard shortcuts (Ctrl+Z, Ctrl+S, Delete)

#### Firefox (Latest)
- [ ] Test complete workflow
- [ ] Test drag and drop functionality
- [ ] Test preview modal
- [ ] Test PDF generation
- [ ] Verify all UI elements render correctly
- [ ] Test keyboard shortcuts

#### Safari (Latest)
- [ ] Test complete workflow
- [ ] Test drag and drop functionality
- [ ] Test preview modal
- [ ] Test PDF generation
- [ ] Verify all UI elements render correctly
- [ ] Test keyboard shortcuts (Cmd+Z, Cmd+S)

#### Edge (Latest)
- [ ] Test complete workflow
- [ ] Test drag and drop functionality
- [ ] Test preview modal
- [ ] Test PDF generation
- [ ] Verify all UI elements render correctly

**Expected Result:** Consistent functionality across all browsers.

### 4.2 Tablet Testing (iPad/Android Tablet)

- [ ] Navigate to template builder on tablet
- [ ] Verify responsive layout (collapsible sidebar)
- [ ] Test touch drag and drop
- [ ] Test element selection with touch
- [ ] Test properties panel on tablet screen
- [ ] Test preview on tablet
- [ ] Verify zoom controls work with touch
- [ ] Test PDF generation and download

**Expected Result:** Template builder usable on tablet with touch controls.

### 4.3 Mobile Testing (iPhone/Android Phone)

- [ ] Navigate to template builder on mobile
- [ ] Verify responsive layout (stacked panels)
- [ ] Test if builder is usable or shows "desktop recommended" message
- [ ] Navigate to generate rapor page
- [ ] Verify responsive filters
- [ ] Test PDF generation on mobile
- [ ] Test PDF download on mobile
- [ ] Verify archive page responsive

**Expected Result:** Generate rapor and archive pages fully functional on mobile.

---

## 5. Performance Testing

### 5.1 Large Template (50+ Elements)

#### Setup
- [ ] Create template with 50+ elements:
  - 10 text elements
  - 10 data table elements
  - 10 image elements
  - 10 image gallery elements
  - 10 signature elements
  - 5 header elements
  - 5 line elements

#### Performance Tests
- [ ] Load template in builder
- [ ] Measure load time (should be <3 seconds)
- [ ] Test drag and drop performance
- [ ] Verify no lag when moving elements
- [ ] Test zoom in/out performance
- [ ] Test save operation (should be <2 seconds)
- [ ] Generate preview
- [ ] Measure preview generation time (should be <5 seconds)
- [ ] Generate PDF
- [ ] Measure PDF generation time (should be <10 seconds)
- [ ] Verify PDF file size (<10MB)
- [ ] Open PDF and verify all elements render

**Expected Result:** Large templates perform acceptably without significant lag.

### 5.2 Rapid Element Manipulation
- [ ] Add 10 elements rapidly (drag and drop quickly)
- [ ] Verify all elements added correctly
- [ ] Move multiple elements rapidly
- [ ] Verify positions update correctly
- [ ] Resize multiple elements rapidly
- [ ] Verify sizes update correctly
- [ ] Delete multiple elements rapidly
- [ ] Verify deletions process correctly
- [ ] Test undo/redo 20 times rapidly
- [ ] Verify state management handles rapid changes

**Expected Result:** System handles rapid operations without errors or state corruption.

### 5.3 Memory Usage
- [ ] Open template builder
- [ ] Monitor browser memory usage (DevTools Performance)
- [ ] Add 50 elements
- [ ] Monitor memory increase
- [ ] Generate 10 previews
- [ ] Verify no memory leaks
- [ ] Close and reopen builder
- [ ] Verify memory released

**Expected Result:** No significant memory leaks during extended use.

---

## 6. Bulk Generation Testing (100+ Students)

### 6.1 Bulk Generation Setup
- [ ] Navigate to generate rapor page
- [ ] Select template
- [ ] Select periode
- [ ] Choose "Bulk Generation"
- [ ] Select filter: "All Students" (100+ students)
- [ ] Verify student count displays correctly
- [ ] Click "Generate All"

### 6.2 Progress Monitoring
- [ ] Verify progress bar appears
- [ ] Verify percentage updates in real-time
- [ ] Verify student list shows status icons:
  - ⏳ Pending
  - ⚙️ Processing
  - ✅ Completed
  - ❌ Failed
- [ ] Verify current student name displays
- [ ] Verify progress updates every 1-2 seconds
- [ ] Monitor for 5 minutes
- [ ] Verify no UI freezing or crashes

**Expected Result:** Progress tracking works smoothly for large batch.

### 6.3 Completion and Download
- [ ] Wait for all 100+ PDFs to generate
- [ ] Verify completion message appears
- [ ] Verify success/failure summary displays
- [ ] Click "Download All as ZIP"
- [ ] Verify ZIP file downloads
- [ ] Extract ZIP file
- [ ] Verify all PDFs present (100+ files)
- [ ] Verify file naming convention: Rapor_{NamaSiswa}_{Periode}.pdf
- [ ] Open random 10 PDFs
- [ ] Verify each PDF has correct student data
- [ ] Verify no duplicate or mixed-up data

**Expected Result:** All 100+ PDFs generated correctly and packaged in ZIP.

### 6.4 Error Handling in Bulk
- [ ] Start bulk generation with 100 students
- [ ] Simulate error for 10 students (e.g., missing data)
- [ ] Verify generation continues for remaining students
- [ ] Verify error summary shows 10 failed, 90 succeeded
- [ ] Verify failed students listed with error messages
- [ ] Click "Retry Failed"
- [ ] Verify only failed students re-processed
- [ ] Verify retry completes successfully

**Expected Result:** Bulk generation handles partial failures gracefully.

### 6.5 Performance Metrics
- [ ] Generate 100 PDFs
- [ ] Measure total time (should be <10 minutes)
- [ ] Calculate average time per PDF (should be <6 seconds)
- [ ] Monitor server CPU and memory usage
- [ ] Verify no server crashes or timeouts
- [ ] Verify database connections managed properly
- [ ] Verify storage uploads complete successfully

**Expected Result:** Bulk generation completes within acceptable time with stable performance.

---

## 7. Additional Feature Testing

### 7.1 Template Versioning
- [ ] Create template and save (Version 1)
- [ ] Modify template (add 5 elements)
- [ ] Save as new version (Version 2)
- [ ] Modify again (remove 2 elements)
- [ ] Save as new version (Version 3)
- [ ] Open version history
- [ ] Verify 3 versions listed
- [ ] Preview Version 1
- [ ] Verify shows original state
- [ ] Restore Version 2
- [ ] Verify template reverted to Version 2 state
- [ ] Verify new version created (Version 4 = copy of Version 2)

**Expected Result:** Version history and restore work correctly.

### 7.2 Template Duplication
- [ ] Open existing template
- [ ] Click "Duplicate" button
- [ ] Verify new template created with " (Copy)" suffix
- [ ] Open duplicated template
- [ ] Verify all elements copied correctly
- [ ] Modify duplicated template
- [ ] Verify original template unchanged

**Expected Result:** Template duplication creates independent copy.

### 7.3 Template Export/Import
- [ ] Open template
- [ ] Click "Export Template"
- [ ] Verify JSON file downloads
- [ ] Open JSON file and verify structure
- [ ] Navigate to template list
- [ ] Click "Import Template"
- [ ] Upload exported JSON file
- [ ] Verify import success message
- [ ] Open imported template
- [ ] Verify all elements match original

**Expected Result:** Export/import preserves template completely.

### 7.4 Keyboard Shortcuts
- [ ] Open template builder
- [ ] Add element
- [ ] Press Delete key
- [ ] Verify element deleted
- [ ] Press Ctrl+Z (Undo)
- [ ] Verify element restored
- [ ] Press Ctrl+Shift+Z (Redo)
- [ ] Verify element deleted again
- [ ] Press Ctrl+S (Save)
- [ ] Verify template saved
- [ ] Press Ctrl+D (Duplicate element)
- [ ] Verify element duplicated
- [ ] Press Ctrl+Plus (Zoom in)
- [ ] Verify canvas zoomed in
- [ ] Press Ctrl+Minus (Zoom out)
- [ ] Verify canvas zoomed out

**Expected Result:** All keyboard shortcuts work as expected.

### 7.5 Rapor Archive
- [ ] Navigate to `/manajemen-rapor/arsip-rapor`
- [ ] Verify list of generated rapor displays
- [ ] Verify columns: Student Name, Periode, Template, Date, Generated By, Download
- [ ] Test search by student name
- [ ] Test filter by periode
- [ ] Test filter by date range
- [ ] Test filter by template
- [ ] Click download on archived rapor
- [ ] Verify PDF downloads within 2 seconds
- [ ] Verify pagination works (if >50 records)

**Expected Result:** Archive provides easy access to historical rapor.

---

## 8. Edge Cases and Stress Testing

### 8.1 Concurrent Users
- [ ] Open template builder in 5 different browser tabs (simulate 5 users)
- [ ] Edit same template in all tabs
- [ ] Save from different tabs
- [ ] Verify last save wins or conflict resolution
- [ ] Verify no data corruption

**Expected Result:** Concurrent edits handled safely.

### 8.2 Very Long Template Names
- [ ] Create template with 200+ character name
- [ ] Verify name truncated in UI
- [ ] Verify full name stored in database
- [ ] Verify tooltip shows full name on hover

**Expected Result:** Long names handled gracefully.

### 8.3 Extreme Zoom Levels
- [ ] Zoom in to 200%
- [ ] Verify elements still draggable
- [ ] Verify properties editable
- [ ] Zoom out to 50%
- [ ] Verify canvas still usable
- [ ] Verify no rendering issues

**Expected Result:** Extreme zoom levels don't break functionality.

### 8.4 Rapid Save Operations
- [ ] Make change and save
- [ ] Immediately make another change and save
- [ ] Repeat 10 times rapidly
- [ ] Verify all saves processed
- [ ] Verify no save conflicts or data loss

**Expected Result:** Rapid saves handled correctly.

### 8.5 Browser Refresh During Generation
- [ ] Start bulk PDF generation
- [ ] Refresh browser mid-generation
- [ ] Verify generation continues in background
- [ ] Verify progress restored after refresh
- [ ] Verify completed PDFs accessible

**Expected Result:** Generation resilient to browser refresh.

---

## 9. Accessibility Testing

### 9.1 Keyboard Navigation
- [ ] Navigate template builder using only keyboard (Tab, Enter, Arrow keys)
- [ ] Verify all interactive elements accessible
- [ ] Verify focus indicators visible
- [ ] Verify modal dialogs keyboard-accessible

**Expected Result:** Full keyboard accessibility.

### 9.2 Screen Reader Compatibility
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify element labels announced correctly
- [ ] Verify button purposes clear
- [ ] Verify form fields properly labeled

**Expected Result:** Screen reader users can navigate and use features.

### 9.3 Color Contrast
- [ ] Verify all text meets WCAG AA contrast ratio (4.5:1)
- [ ] Test with color blindness simulator
- [ ] Verify status indicators distinguishable without color alone

**Expected Result:** Sufficient color contrast for readability.

---

## 10. Final Checklist

### Pre-Deployment Verification
- [ ] All critical bugs fixed
- [ ] All test cases passed
- [ ] Performance metrics acceptable
- [ ] Security review completed
- [ ] Documentation updated
- [ ] User training materials prepared
- [ ] Rollback plan documented
- [ ] Monitoring and alerts configured

### Sign-Off
- [ ] QA Team Lead approval
- [ ] Product Owner approval
- [ ] Technical Lead approval
- [ ] Stakeholder demo completed

---

## Test Results Summary

**Date Tested:** _______________  
**Tested By:** _______________  
**Environment:** _______________

**Results:**
- Total Test Cases: _____
- Passed: _____
- Failed: _____
- Blocked: _____
- Not Tested: _____

**Critical Issues Found:**
1. 
2. 
3. 

**Recommendations:**
- [ ] Ready for production deployment
- [ ] Requires minor fixes before deployment
- [ ] Requires major fixes before deployment
- [ ] Not ready for deployment

**Notes:**
_______________________________________
_______________________________________
_______________________________________

