import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// POST - Export template as JSON file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .eq('id', id)
      .eq('template_type', 'builder')
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }
      throw templateError;
    }

    // Fetch all elements for this template
    const { data: elements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });

    if (elementsError) throw elementsError;

    // Fetch template versions (optional, for reference)
    const { data: versions } = await supabase
      .from('rapor_template_versions_keasramaan')
      .select('version_number, notes, created_at, created_by')
      .eq('template_id', id)
      .order('version_number', { ascending: false })
      .limit(5);

    // Build export data structure
    const exportData = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: session.userId,
      metadata: {
        name: template.nama_template,
        jenis_rapor: template.jenis_rapor,
        version: template.canvas_config?.version || '1.0',
        created_at: template.created_at,
        updated_at: template.updated_at,
        created_by: template.created_by,
      },
      template: {
        canvas_config: template.canvas_config,
        elements: elements || [],
      },
      versionHistory: versions || [],
    };

    // Create filename
    const sanitizedName = template.nama_template
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `template_${sanitizedName}_${timestamp}.json`;

    // Return JSON file as download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
