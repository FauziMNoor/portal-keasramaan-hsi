/**
 * Bulk Job Storage
 * 
 * In-memory storage for bulk PDF generation jobs.
 * In production, this should be replaced with Redis or database storage
 * to support multiple server instances and persistence.
 */

export interface BulkJobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
    current?: string;
  };
  results: Array<{
    siswaId: string;
    siswaName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    pdfUrl?: string;
    error?: string;
  }>;
  createdAt: Date;
}

// In-memory job storage
const bulkJobs = new Map<string, BulkJobStatus>();

/**
 * Get a job by ID
 */
export function getJob(jobId: string): BulkJobStatus | undefined {
  return bulkJobs.get(jobId);
}

/**
 * Set/update a job
 */
export function setJob(jobId: string, job: BulkJobStatus): void {
  bulkJobs.set(jobId, job);
}

/**
 * Delete a job
 */
export function deleteJob(jobId: string): boolean {
  return bulkJobs.delete(jobId);
}

/**
 * Get all jobs
 */
export function getAllJobs(): BulkJobStatus[] {
  return Array.from(bulkJobs.values());
}

/**
 * Clear all jobs (for testing/cleanup)
 */
export function clearAllJobs(): void {
  bulkJobs.clear();
}

/**
 * Clean up old jobs (older than 24 hours)
 */
export function cleanupOldJobs(): number {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  let deletedCount = 0;

  for (const [jobId, job] of bulkJobs.entries()) {
    const age = now.getTime() - job.createdAt.getTime();
    if (age > maxAge) {
      bulkJobs.delete(jobId);
      deletedCount++;
    }
  }

  return deletedCount;
}
