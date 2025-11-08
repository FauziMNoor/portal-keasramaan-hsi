import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getJob } from '@/lib/rapor/bulk-job-storage';

/**
 * GET /api/rapor/generate/builder/bulk/[jobId]/status
 * Get current status of bulk generation job
 * 
 * Response:
 * - success: boolean
 * - data: {
 *     status: 'processing' | 'completed' | 'failed'
 *     progress: { total, completed, failed, current? }
 *     results: Array of per-student status with PDF URLs
 *   }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Get job status from storage
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found. Job may have expired or does not exist.' },
        { status: 404 }
      );
    }

    // Return job status with all details
    return NextResponse.json({
      success: true,
      data: {
        jobId: job.jobId,
        status: job.status,
        progress: {
          total: job.progress.total,
          completed: job.progress.completed,
          failed: job.progress.failed,
          current: job.progress.current,
        },
        results: job.results.map((result) => ({
          siswaId: result.siswaId,
          siswaName: result.siswaName,
          status: result.status,
          pdfUrl: result.pdfUrl,
          error: result.error,
        })),
        createdAt: job.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get job status error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengambil status job' },
      { status: 500 }
    );
  }
}
