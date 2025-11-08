import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { TemplateConfigSchema, TemplateElementSchema } from '@/types/rapor-builder';

// GET - Fetch template with all elements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch template - first check if it exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }
      console.error('Template fetch error:', templateError);
      throw templateError;
    }

    // Check if template_type column exists and is 'builder'
    if (template.template_type && template.template_type !== 'builder') {
      return NextResponse.json(
        { 
          error: 'Template ini bukan tipe builder',
          details: `Template type: ${template.template_type}. Silakan gunakan template dengan tipe 'builder'.`
        },
        { status: 400 }
      );
    }

    // If template_type doesn't exist, update it to 'builder'
    if (!template.template_type) {
      const { error: updateError } = await supabase
        .from('rapor_template_keasramaan')
        .update({ template_type: 'builder' })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update template_type:', updateError);
      } else {
        template.template_type = 'builder';
      }
    }

    // Fetch all elements for this template
    const { data: elements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });

    if (elementsError) throw elementsError;

    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: template.id,
          nama_template: template.nama_template,
          jenis_rapor: template.jenis_rapor,
          template_type: template.template_type,
          canvas_config: template.canvas_config,
          is_active: template.is_active,
          created_at: template.created_at,
          updated_at: template.updated_at,
          created_by: template.created_by,
        },
        elements: elements || [],
      },
    });
  } catch (error: any) {
    console.error('Get builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update template config and metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { canvas_config, nama_template, jenis_rapor, is_active } = body;

    // Check if template exists
    const { data: existingTemplate, error: checkError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id, canvas_config, template_type')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }
      throw checkError;
    }

    // Build update object
    const updateData: any = {};

    // Auto-update template_type if not set
    if (!existingTemplate.template_type) {
      updateData.template_type = 'builder';
    }

    if (nama_template !== undefined) {
      updateData.nama_template = nama_template;
    }

    if (jenis_rapor !== undefined) {
      updateData.jenis_rapor = jenis_rapor;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    if (canvas_config !== undefined) {
      // Validate canvas config structure
      try {
        TemplateConfigSchema.partial().parse(canvas_config);
      } catch (validationError: any) {
        return NextResponse.json(
          { error: 'Invalid canvas_config structure', details: validationError.errors },
          { status: 400 }
        );
      }

      // Merge with existing config and update metadata
      const updatedConfig = {
        ...existingTemplate.canvas_config,
        ...canvas_config,
        metadata: {
          ...existingTemplate.canvas_config?.metadata,
          ...canvas_config.metadata,
          updatedAt: new Date().toISOString(),
          lastEditedBy: session.userId,
        },
      };

      updateData.canvas_config = updatedConfig;
    }

    // Update template
    const { data, error } = await supabase
      .from('rapor_template_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template and all elements
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if template exists
    const { data: existingTemplate, error: checkError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }
      throw checkError;
    }

    // Delete related history first (foreign key constraint)
    const { error: historyError } = await supabase
      .from('rapor_generate_history_keasramaan')
      .delete()
      .eq('template_id', id);

    if (historyError) {
      console.error('Delete history error:', historyError);
      // Continue anyway, might not have history
    }

    // Delete template (elements will be cascade deleted due to ON DELETE CASCADE)
    const { error } = await supabase
      .from('rapor_template_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Template berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
