# API Documentation - Rapor Builder PDF Generation

This document describes the API endpoints for generating PDF rapor from builder templates.

## Endpoints

### 1. Generate Single PDF

**Endpoint:** `POST /api/rapor/generate/builder/single`

**Description:** Generate a single PDF rapor for one student using a builder template.

**Request Body:**
```json
{
  "templateId": "uuid-of-template",
  "siswaId": "uuid-of-student",
  "periode": {
    "tahun_ajaran": "2024/2025",
    "semester": 1,
    "bulan": 9  // optional, for monthly reports
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://storage.supabase.co/...",
    "generatedId": "uuid-of-history-record"
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing required fields)
- `401` - Unauthorized
- `404` - Template not found
- `500` - Server error

**Process:**
1. Validates authentication and request data
2. Fetches template configuration and elements from database
3. Fetches student data (siswa, habit tracker, galeri kegiatan, etc.)
4. Generates PDF using React-PDF
5. Uploads PDF to Supabase Storage (`rapor-keasramaan` bucket)
6. Saves generation record to `rapor_generate_history_keasramaan`
7. Returns PDF URL

**Storage Path Format:**
```
rapor/{tahun_ajaran}/semester-{semester}/Rapor_{NamaSiswa}_{TahunAjaran}_Sem{Semester}.pdf
```

---

### 2. Generate Bulk PDFs

**Endpoint:** `POST /api/rapor/generate/builder/bulk`

**Description:** Generate multiple PDF rapor for multiple students in batch. Processing happens in background.

**Request Body:**
```json
{
  "templateId": "uuid-of-template",
  "siswaIds": [
    "uuid-student-1",
    "uuid-student-2",
    "uuid-student-3"
  ],
  "periode": {
    "tahun_ajaran": "2024/2025",
    "semester": 1,
    "bulan": 9  // optional
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "jobId": "bulk-1234567890-abc123",
    "totalStudents": 3
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Job created successfully
- `400` - Bad request (missing required fields or empty siswaIds)
- `401` - Unauthorized
- `500` - Server error

**Process:**
1. Validates authentication and request data
2. Creates a unique job ID
3. Initializes job status in memory
4. Returns job ID immediately
5. Processes students in background in batches of 10
6. Each student is processed in parallel within a batch
7. Updates job status as processing progresses

**Note:** Job status is stored in memory. In production, consider using Redis or database for persistence.

---

### 3. Get Bulk Job Status

**Endpoint:** `GET /api/rapor/generate/builder/bulk/[jobId]/status`

**Description:** Get the current status of a bulk PDF generation job.

**URL Parameters:**
- `jobId` - The job ID returned from the bulk generation endpoint

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "status": "processing",  // or "completed" or "failed"
    "progress": {
      "total": 10,
      "completed": 7,
      "failed": 1,
      "current": "Processing student 8 of 10"
    },
    "results": [
      {
        "siswaId": "uuid-1",
        "siswaName": "Ahmad Fauzi",
        "status": "completed",
        "pdfUrl": "https://storage.supabase.co/..."
      },
      {
        "siswaId": "uuid-2",
        "siswaName": "Fatimah Zahra",
        "status": "processing"
      },
      {
        "siswaId": "uuid-3",
        "siswaName": "Muhammad Ali",
        "status": "failed",
        "error": "Student data not found"
      },
      {
        "siswaId": "uuid-4",
        "siswaName": "",
        "status": "pending"
      }
    ],
    "createdAt": "2024-11-08T10:30:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Job tidak ditemukan"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing jobId)
- `401` - Unauthorized
- `404` - Job not found
- `500` - Server error

**Result Status Values:**
- `pending` - Not yet processed
- `processing` - Currently being processed
- `completed` - Successfully generated PDF
- `failed` - Failed to generate PDF (see error field)

**Polling Recommendation:**
Poll this endpoint every 2-3 seconds while `status === 'processing'` to get real-time updates.

---

### 4. Delete Bulk Job (Optional)

**Endpoint:** `DELETE /api/rapor/generate/builder/bulk/[jobId]/status`

**Description:** Delete a completed or failed job from memory to free up resources.

**URL Parameters:**
- `jobId` - The job ID to delete

**Response (Success):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Cannot delete job that is still processing"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (job still processing)
- `401` - Unauthorized
- `404` - Job not found
- `500` - Server error

**Note:** You cannot delete a job that is still processing.

---

## Database Tables Used

### rapor_template_keasramaan
- Stores template configurations
- `template_type` must be `'builder'`
- `canvas_config` contains the template configuration (JSON)

### rapor_template_elements_keasramaan
- Stores template elements (text, images, tables, etc.)
- Linked to template via `template_id`
- Ordered by `z_index` for layering

### rapor_generate_history_keasramaan
- Stores generation history for each PDF
- Fields: `template_id`, `siswa_nis`, `tahun_ajaran`, `semester`, `pdf_url`, `status`, `error_message`, `generated_by`
- Status values: `'processing'`, `'completed'`, `'failed'`

### data_siswa_keasramaan
- Student data source
- Used to fetch student information for PDF generation

### formulir_habit_tracker_keasramaan
- Habit tracker data source
- Used to calculate aggregates for each category

### kegiatan_galeri_keasramaan (or galeri_kegiatan_keasramaan)
- Gallery/activity photos
- Used for image gallery elements in templates

---

## Storage Bucket

**Bucket Name:** `rapor-keasramaan`

**Folder Structure:**
```
rapor/
  2024-2025/
    semester-1/
      Rapor_Ahmad_Fauzi_2024-2025_Sem1.pdf
      Rapor_Fatimah_Zahra_2024-2025_Sem1.pdf
    semester-2/
      Rapor_Ahmad_Fauzi_2024-2025_Sem2.pdf
```

**File Naming Convention:**
```
Rapor_{StudentName}_{TahunAjaran}_Sem{Semester}[_Bulan{Month}].pdf
```

Examples:
- `Rapor_Ahmad_Fauzi_2024-2025_Sem1.pdf`
- `Rapor_Ahmad_Fauzi_2024-2025_Sem1_Bulan9.pdf` (monthly report)

---

## Error Handling

### Common Errors

1. **Template not found**
   - Status: 404
   - Message: "Template tidak ditemukan atau bukan tipe builder"
   - Cause: Invalid templateId or template is not builder type

2. **Template has no elements**
   - Status: 400
   - Message: "Template tidak memiliki elemen"
   - Cause: Template exists but has no elements added

3. **Student not found**
   - Status: 500
   - Message: "Student with ID {id} not found"
   - Cause: Invalid siswaId

4. **Upload failed**
   - Status: 500
   - Message: "Failed to upload PDF: {error}"
   - Cause: Supabase Storage error

5. **PDF generation failed**
   - Status: 500
   - Message: "Failed to generate PDF: {error}"
   - Cause: Error in React-PDF rendering or data fetching

### Error Logging

All errors are:
1. Logged to console with full stack trace
2. Saved to `rapor_generate_history_keasramaan` with status `'failed'`
3. Returned to client with user-friendly message

---

## Performance Considerations

### Single PDF Generation
- **Target:** < 5 seconds per PDF
- **Factors:**
  - Template complexity (number of elements)
  - Number of images to download and embed
  - Database query performance
  - Network speed to Supabase Storage

### Bulk PDF Generation
- **Batch Size:** 10 students per batch
- **Parallel Processing:** All students in a batch are processed in parallel
- **Target:** ~5 minutes for 100 students
- **Memory:** Jobs are stored in memory (consider Redis for production)

### Optimization Tips
1. Pre-download and cache images before PDF generation
2. Use connection pooling for database queries
3. Implement retry logic for failed uploads
4. Consider using a job queue (Bull, BullMQ) for production
5. Store job status in Redis or database for persistence

---

## Testing

### Test Single Generation

```bash
curl -X POST http://localhost:3000/api/rapor/generate/builder/single \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "templateId": "your-template-uuid",
    "siswaId": "your-student-uuid",
    "periode": {
      "tahun_ajaran": "2024/2025",
      "semester": 1
    }
  }'
```

### Test Bulk Generation

```bash
# Start bulk job
curl -X POST http://localhost:3000/api/rapor/generate/builder/bulk \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "templateId": "your-template-uuid",
    "siswaIds": ["uuid-1", "uuid-2", "uuid-3"],
    "periode": {
      "tahun_ajaran": "2024/2025",
      "semester": 1
    }
  }'

# Check status (replace {jobId} with actual job ID)
curl -X GET http://localhost:3000/api/rapor/generate/builder/bulk/{jobId}/status \
  -H "Cookie: your-session-cookie"
```

---

## Future Enhancements

1. **Job Persistence:** Store jobs in Redis or database instead of memory
2. **Webhooks:** Notify when bulk job completes
3. **Email Notifications:** Send email with PDF links when generation completes
4. **ZIP Download:** Package all PDFs in a bulk job into a single ZIP file
5. **Progress Streaming:** Use Server-Sent Events (SSE) for real-time progress updates
6. **Retry Failed:** Endpoint to retry failed students in a bulk job
7. **Job Expiry:** Auto-delete old jobs after 24 hours
8. **Rate Limiting:** Prevent abuse of bulk generation endpoint
9. **Queue System:** Use Bull/BullMQ for better job management
10. **Caching:** Cache template and student data for faster generation

---

## Security Considerations

1. **Authentication:** All endpoints require valid session
2. **Authorization:** Consider adding role-based access (only admin/guru can generate)
3. **Rate Limiting:** Implement rate limiting to prevent abuse
4. **Input Validation:** All inputs are validated before processing
5. **File Access:** PDFs are stored in public bucket but with obscure paths
6. **Error Messages:** Don't expose sensitive information in error messages
7. **Job Access:** Consider adding user ownership check for job status endpoint

---

## Troubleshooting

### PDF Generation Fails

1. Check template has elements: `SELECT * FROM rapor_template_elements_keasramaan WHERE template_id = ?`
2. Check student exists: `SELECT * FROM data_siswa_keasramaan WHERE id = ?`
3. Check habit tracker data: `SELECT * FROM formulir_habit_tracker_keasramaan WHERE nis = ?`
4. Check storage bucket exists and is accessible
5. Check console logs for detailed error messages

### Bulk Job Stuck

1. Check job status: `GET /api/rapor/generate/builder/bulk/{jobId}/status`
2. Check server logs for errors
3. Restart server (jobs in memory will be lost)
4. Consider implementing job persistence

### Upload Fails

1. Check Supabase Storage bucket exists: `rapor-keasramaan`
2. Check bucket permissions (should allow authenticated uploads)
3. Check file size limits
4. Check network connectivity to Supabase

---

## Support

For issues or questions, contact the development team or check the main documentation.

