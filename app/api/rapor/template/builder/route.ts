import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { TemplateConfigSchema } from '@/types/rapor-builder';

// GET - List all builder templates with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jenis_rapor = searchParams.get('jenis_rapor');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('rapor_template_keasramaan')
      .select('id, nama_template, jenis_rapor, template_type, canvas_config, is_active, created_at, updated_at, created_by')
      .eq('template_type', 'builder')
      .order('created_at', { ascending: false });

    // Apply filters
    if (jenis_rapor) {
      query = query.eq('jenis_rapor', jenis_rapor);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    // Get element count for each template
    const templatesWithCount = await Promise.all(
      (templates || []).map(async (template) => {
        const { count } = await supabase
          .from('rapor_template_elements_keasramaan')
          .select('*', { count: 'exact', head: true })
          .eq('template_id', template.id);

        return {
          ...template,
          element_count: count || 0,
        };
      })
    );

    return NextResponse.json({ success: true, data: templatesWithCount });
  } catch (error: any) {
    console.error('Get builder templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create new builder template with default canvas config
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nama_template,
      jenis_rapor,
      canvas_config,
    } = body;

    // Validate required fields
    if (!nama_template || !jenis_rapor) {
      return NextResponse.json(
        { error: 'nama_template dan jenis_rapor wajib diisi' },
        { status: 400 }
      );
    }

    // Create default canvas config if not provided
    const defaultCanvasConfig: any = canvas_config || {
      name: nama_template,
      type: 'builder',
      version: '1.0.0',
      pageSize: 'A4',
      orientation: 'portrait',
      dimensions: {
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      },
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
      backgroundColor: '#ffffff',
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: session.userId,
        lastEditedBy: session.userId,
      },
    };

    // Validate canvas config structure (basic validation)
    try {
      if (canvas_config) {
        TemplateConfigSchema.partial().parse(canvas_config);
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Invalid canvas_config structure', details: validationError.errors },
        { status: 400 }
      );
    }

    // Insert template
    const { data, error } = await supabase
      .from('rapor_template_keasramaan')
      .insert({
        nama_template,
        jenis_rapor,
        template_type: 'builder',
        canvas_config: defaultCanvasConfig,
        is_active: true,
        created_by: session.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
