import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { generateBuilderPDF } from '@/lib/rapor/builder-pdf-generator';
import { fetchRaporData } from '@/lib/rapor/data-fetcher';
import type { TemplateConfig, TemplateElement, PeriodeData } from '@/types/rapor-builder';
import { getJob, setJob, getAllJobs, type BulkJobStatus } from '@/lib/rapor/bulk-job-storage';

/**
 * POST /api/rapor/generate/builder/bulk
 * Generate multiple PDFs in batch
 * 
 * Request body:
 * - templateId: UUID of the template
 * - siswaIds: Array of student UUIDs
 * - periode: { tahun_ajaran, semester, bulan? }
 * 
 * Response:
 * - success: boolean
 * - data: { jobId: string, totalStudents: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, siswaIds, periode } = body;

    // Validate required fields
    if (!templateId || !siswaIds || !Array.isArray(siswaIds) || siswaIds.length === 0) {
      return NextResponse.json(
        { error: 'templateId dan siswaIds (array) wajib diisi' },
        { status: 400 }
      );
    }

    if (!periode || !periode.tahun_ajaran || !periode.semester) {
      return NextResponse.json(
        { error: 'periode.tahun_ajaran dan periode.semester wajib diisi' },
        { status: 400 }
      );
    }

    // Create job ID
    const jobId = `bulk-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Initialize job status
    const jobStatus: BulkJobStatus = {
      jobId,
      status: 'processing',
      progress: {
        total: siswaIds.length,
        completed: 0,
        failed: 0,
      },
      results: siswaIds.map((id) => ({
        siswaId: id,
        siswaName: '',
        status: 'pending',
      })),
      createdAt: new Date(),
    };

    setJob(jobId, jobStatus);

    // Start background processing (don't await)
    processBulkGeneration(jobId, templateId, siswaIds, periode, session.userId).catch((error) => {
      console.error('Bulk generation error:', error);
      const job = getJob(jobId);
      if (job) {
        job.status = 'failed';
        setJob(jobId, job);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        totalStudents: siswaIds.length,
      },
    });
  } catch (error: any) {
    console.error('Bulk generation init error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memulai bulk generation' },
      { status: 500 }
    );
  }
}

/**
 * Process bulk PDF generation in background
 */
async function processBulkGeneration(
  jobId: string,
  templateId: string,
  siswaIds: string[],
  periode: any,
  userId: string
) {
  const job = getJob(jobId);
  if (!job) return;

  try {
    // Fetch template and elements once
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .eq('id', templateId)
      .eq('template_type', 'builder')
      .single();

    if (templateError || !template) {
      throw new Error('Template tidak ditemukan atau bukan tipe builder');
    }

    const { data: elements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', templateId)
      .order('z_index', { ascending: true });

    if (elementsError || !elements || elements.length === 0) {
      throw new Error('Template tidak memiliki elemen');
    }

    const templateConfig: TemplateConfig = template.canvas_config as TemplateConfig;
    const templateElements: TemplateElement[] = elements.map((el) => ({
      id: el.id,
      type: el.element_type,
      position: el.position,
      size: el.size,
      zIndex: el.z_index,
      isVisible: el.is_visible,
      isLocked: el.is_locked || false,
      content: el.content,
      style: el.style,
      dataBinding: el.data_binding,
      columns: el.element_type === 'data-table' ? (el.content as any)?.columns : undefined,
      options: el.element_type === 'data-table' ? (el.content as any)?.options : undefined,
      layout: el.element_type === 'image-gallery' ? (el.content as any)?.layout : undefined,
      imageStyle: el.element_type === 'image-gallery' ? (el.content as any)?.imageStyle : undefined,
    })) as TemplateElement[];

    const periodeData: PeriodeData = {
      tahun_ajaran: periode.tahun_ajaran,
      semester: parseInt(periode.semester),
      bulan: periode.bulan ? parseInt(periode.bulan) : undefined,
    };

    // Process students in smaller batches for better performance
    // Smaller batches reduce memory pressure and allow for better error recovery
    const batchSize = 5; // Reduced from 10 to 5 for better stability
    for (let i = 0; i < siswaIds.length; i += batchSize) {
      const batch = siswaIds.slice(i, i + batchSize);
      
      // Process batch in parallel
      await Promise.all(
        batch.map((siswaId, batchIndex) =>
          processSingleStudent(
            jobId,
            i + batchIndex,
            siswaId,
            templateId,
            templateConfig,
            templateElements,
            periodeData,
            userId
          )
        )
      );
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < siswaIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Mark job as completed
    const finalJob = getJob(jobId);
    if (finalJob) {
      finalJob.status = 'completed';
      finalJob.progress.current = undefined;
      setJob(jobId, finalJob);
    }
  } catch (error: any) {
    console.error('Bulk processing error:', error);
    const finalJob = getJob(jobId);
    if (finalJob) {
      finalJob.status = 'failed';
      setJob(jobId, finalJob);
    }
  }
}

/**
 * Process single student PDF generation with retry logic
 */
async function processSingleStudent(
  jobId: string,
  index: number,
  siswaId: string,
  templateId: string,
  templateConfig: TemplateConfig,
  templateElements: TemplateElement[],
  periode: PeriodeData,
  userId: string
) {
  const job = getJob(jobId);
  if (!job) return;

  const maxRetries = 2; // Retry up to 2 times on failure
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Update status to processing
      job.results[index].status = 'processing';
      job.progress.current = `Processing student ${index + 1} of ${job.progress.total}${attempt > 0 ? ` (retry ${attempt})` : ''}`;
      setJob(jobId, job);

      // Fetch student data
      const raporData = await fetchRaporData(siswaId, periode);
      
      // Update student name
      job.results[index].siswaName = raporData.siswa.nama;
      setJob(jobId, job);

      // Generate PDF with error handling
      const { blob: pdfBlob, errors, warnings } = await generateBuilderPDF(
        templateConfig, 
        templateElements, 
        raporData,
        {
          onError: (error) => console.error(`PDF generation error for ${raporData.siswa.nama}:`, error),
          onWarning: (warning) => console.warn(`PDF generation warning for ${raporData.siswa.nama}:`, warning),
        }
      );

    // Upload PDF to Supabase Storage
    const fileName = `Rapor_${raporData.siswa.nama.replace(/\s+/g, '_')}_${periode.tahun_ajaran.replace('/', '-')}_Sem${periode.semester}${periode.bulan ? `_Bulan${periode.bulan}` : ''}.pdf`;
    const storagePath = `rapor/${periode.tahun_ajaran.replace('/', '-')}/semester-${periode.semester}/${fileName}`;

    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rapor-keasramaan')
      .upload(storagePath, pdfFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('rapor-keasramaan')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;

    // Save to history
    await supabase
      .from('rapor_generate_history_keasramaan')
      .insert({
        template_id: templateId,
        siswa_nis: raporData.siswa.nis,
        tahun_ajaran: periode.tahun_ajaran,
        semester: periode.semester.toString(),
        pdf_url: pdfUrl,
        status: 'completed',
        generated_by: userId,
      });

      // Update job status - success
      job.results[index].status = 'completed';
      job.results[index].pdfUrl = pdfUrl;
      job.progress.completed++;
      setJob(jobId, job);
      
      // Success - break retry loop
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`Error processing student ${siswaId} (attempt ${attempt + 1}):`, error);
      
      // If this was the last attempt, mark as failed
      if (attempt === maxRetries) {
        // Update job status - failed after all retries
        job.results[index].status = 'failed';
        job.results[index].error = error.message || 'Unknown error';
        job.progress.failed++;
        setJob(jobId, job);
      } else {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // If we get here, all retries failed - save error to history
  if (lastError) {

    // Try to save error to history
    try {
      const { data: siswaData } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis, nama_siswa')
        .eq('id', siswaId)
        .single();

      if (siswaData) {
        job.results[index].siswaName = siswaData.nama_siswa || '';
        
        await supabase
          .from('rapor_generate_history_keasramaan')
          .insert({
            template_id: templateId,
            siswa_nis: siswaData.nis,
            tahun_ajaran: periode.tahun_ajaran,
            semester: periode.semester.toString(),
            status: 'failed',
            error_message: error.message || 'Unknown error',
            generated_by: userId,
          });
      }
    } catch (historyError) {
      // Ignore history save errors
    }
  }
}

/**
 * GET /api/rapor/generate/builder/bulk
 * Get list of all bulk jobs (for debugging/admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = getAllJobs().map((job) => ({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
    }));

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error('Get bulk jobs error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
