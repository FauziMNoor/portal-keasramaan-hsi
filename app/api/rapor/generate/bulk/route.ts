import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

interface BulkGenerateRequest {
  template_id: string;
  siswa_nis_list: string[];
  tahun_ajaran: string;
  semester: string;
}

interface GenerateResult {
  siswa_nis: string;
  status: 'completed' | 'failed';
  pdf_url?: string;
  error_message?: string;
  history_id?: string;
}

// POST - Generate bulk PDFs
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkGenerateRequest = await request.json();
    const { template_id, siswa_nis_list, tahun_ajaran, semester } = body;

    // Validation
    if (!template_id || !siswa_nis_list || !Array.isArray(siswa_nis_list) || siswa_nis_list.length === 0) {
      return NextResponse.json(
        { error: 'Template ID dan daftar siswa NIS harus diisi' },
        { status: 400 }
      );
    }

    if (!tahun_ajaran || !semester) {
      return NextResponse.json(
        { error: 'Tahun ajaran dan semester harus diisi' },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id, nama_template')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      );
    }

    const results: GenerateResult[] = [];
    const batchSize = 10;
    const totalBatches = Math.ceil(siswa_nis_list.length / batchSize);

    // Process in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * batchSize;
      const endIdx = Math.min(startIdx + batchSize, siswa_nis_list.length);
      const batch = siswa_nis_list.slice(startIdx, endIdx);

      // Process each siswa in the batch
      const batchPromises = batch.map(async (siswa_nis) => {
        // Retry logic for failed generations
        const maxRetries = 1;
        let lastError: any = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Call single generate API internally
            const generateResponse = await fetch(
              `${request.nextUrl.origin}/api/rapor/generate/single`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Forward auth headers
                  ...(request.headers.get('cookie') && {
                    cookie: request.headers.get('cookie')!,
                  }),
                },
                body: JSON.stringify({
                  template_id,
                  siswa_nis,
                  tahun_ajaran,
                  semester,
                }),
              }
            );

            const result = await generateResponse.json();

            if (generateResponse.ok && result.success) {
              return {
                siswa_nis,
                status: 'completed' as const,
                pdf_url: result.data.pdf_url,
                history_id: result.data.history_id,
              };
            } else {
              lastError = result.error || 'Unknown error';
              
              // Retry on server errors (5xx) but not on client errors (4xx)
              if (generateResponse.status >= 500 && attempt < maxRetries) {
                console.log(`Retrying PDF generation for ${siswa_nis} (attempt ${attempt + 2})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                continue;
              }
              
              return {
                siswa_nis,
                status: 'failed' as const,
                error_message: lastError,
              };
            }
          } catch (error: any) {
            lastError = error;
            console.error(`Error generating PDF for ${siswa_nis} (attempt ${attempt + 1}):`, error);
            
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            }
          }
        }

        // All retries failed
        return {
          siswa_nis,
          status: 'failed' as const,
          error_message: lastError?.message || 'Failed to generate PDF after retries',
        };
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    // Calculate statistics
    const completed = results.filter((r) => r.status === 'completed').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      data: {
        total: siswa_nis_list.length,
        completed,
        failed,
        results,
      },
      message: `Bulk generate selesai: ${completed} berhasil, ${failed} gagal`,
    });
  } catch (error: any) {
    console.error('Bulk generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET - Get bulk generate progress (optional, for future streaming implementation)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const template_id = searchParams.get('template_id');
    const tahun_ajaran = searchParams.get('tahun_ajaran');
    const semester = searchParams.get('semester');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('rapor_generate_history_keasramaan')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (template_id) {
      query = query.eq('template_id', template_id);
    }
    if (tahun_ajaran) {
      query = query.eq('tahun_ajaran', tahun_ajaran);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by status
    const stats = {
      total: data.length,
      processing: data.filter((r) => r.status === 'processing').length,
      completed: data.filter((r) => r.status === 'completed').length,
      failed: data.filter((r) => r.status === 'failed').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        history: data,
      },
    });
  } catch (error: any) {
    console.error('Get bulk progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
