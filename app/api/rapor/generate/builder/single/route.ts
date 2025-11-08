import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { generateBuilderPDF } from '@/lib/rapor/builder-pdf-generator';
import { fetchRaporData } from '@/lib/rapor/data-fetcher';
import type { TemplateConfig, TemplateElement, PeriodeData } from '@/types/rapor-builder';

/**
 * POST /api/rapor/generate/builder/single
 * Generate single PDF from builder template
 * 
 * Request body:
 * - templateId: UUID of the template
 * - siswaId: UUID of the student
 * - periode: { tahun_ajaran, semester, bulan? }
 * 
 * Response:
 * - success: boolean
 * - data: { pdfUrl: string, generatedId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, siswaId, periode } = body;

    // Validate required fields
    if (!templateId || !siswaId || !periode) {
      return NextResponse.json(
        { error: 'templateId, siswaId, dan periode wajib diisi' },
        { status: 400 }
      );
    }

    if (!periode.tahun_ajaran || !periode.semester) {
      return NextResponse.json(
        { error: 'periode.tahun_ajaran dan periode.semester wajib diisi' },
        { status: 400 }
      );
    }

    // Fetch template and elements
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .eq('id', templateId)
      .eq('template_type', 'builder')
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan atau bukan tipe builder' },
        { status: 404 }
      );
    }

    // Fetch template elements
    const { data: elements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', templateId)
      .order('z_index', { ascending: true });

    if (elementsError) {
      throw new Error(`Failed to fetch template elements: ${elementsError.message}`);
    }

    if (!elements || elements.length === 0) {
      return NextResponse.json(
        { error: 'Template tidak memiliki elemen' },
        { status: 400 }
      );
    }

    // Parse canvas config and elements
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

    // Fetch student data
    const periodeData: PeriodeData = {
      tahun_ajaran: periode.tahun_ajaran,
      semester: parseInt(periode.semester),
      bulan: periode.bulan ? parseInt(periode.bulan) : undefined,
    };

    console.log('Fetching rapor data for student:', siswaId);
    const raporData = await fetchRaporData(siswaId, periodeData);

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBlob = await generateBuilderPDF(templateConfig, templateElements, raporData);

    // Upload PDF to Supabase Storage
    const fileName = `Rapor_${raporData.siswa.nama.replace(/\s+/g, '_')}_${periode.tahun_ajaran.replace('/', '-')}_Sem${periode.semester}${periode.bulan ? `_Bulan${periode.bulan}` : ''}.pdf`;
    const storagePath = `rapor/${periode.tahun_ajaran.replace('/', '-')}/semester-${periode.semester}/${fileName}`;

    console.log('Uploading PDF to storage:', storagePath);
    
    // Convert blob to File for upload
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rapor-keasramaan')
      .upload(storagePath, pdfFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('rapor-keasramaan')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;

    // Save to rapor_generate_history_keasramaan
    const { data: historyData, error: historyError } = await supabase
      .from('rapor_generate_history_keasramaan')
      .insert({
        template_id: templateId,
        siswa_nis: raporData.siswa.nis,
        tahun_ajaran: periode.tahun_ajaran,
        semester: periode.semester.toString(),
        pdf_url: pdfUrl,
        status: 'completed',
        generated_by: session.userId,
      })
      .select()
      .single();

    if (historyError) {
      console.error('History save error:', historyError);
      // Don't fail the request if history save fails
    }

    console.log('PDF generated successfully:', pdfUrl);

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl,
        generatedId: historyData?.id || null,
      },
    });
  } catch (error: any) {
    console.error('Generate single PDF error:', error);
    
    // Try to save error to history if we have the required data
    try {
      const body = await request.json();
      if (body.templateId && body.siswaId && body.periode) {
        const { data: siswaData } = await supabase
          .from('data_siswa_keasramaan')
          .select('nis')
          .eq('id', body.siswaId)
          .single();

        if (siswaData) {
          await supabase
            .from('rapor_generate_history_keasramaan')
            .insert({
              template_id: body.templateId,
              siswa_nis: siswaData.nis,
              tahun_ajaran: body.periode.tahun_ajaran,
              semester: body.periode.semester.toString(),
              status: 'failed',
              error_message: error.message || 'Unknown error',
              generated_by: (await getSession())?.userId,
            });
        }
      }
    } catch (historyError) {
      // Ignore history save errors
    }

    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat generate PDF' },
      { status: 500 }
    );
  }
}
