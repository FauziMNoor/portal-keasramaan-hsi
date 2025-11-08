import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// POST - Duplicate template with all elements
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

    // Fetch original template
    const { data: originalTemplate, error: templateError } = await supabase
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

    // Fetch all elements from original template
    const { data: originalElements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });

    if (elementsError) throw elementsError;

    // Create new template with " (Copy)" appended to name
    const newTemplateName = `${originalTemplate.nama_template} (Copy)`;
    const now = new Date().toISOString();

    // Prepare new template data
    const newTemplateData = {
      nama_template: newTemplateName,
      jenis_rapor: originalTemplate.jenis_rapor,
      template_type: 'builder',
      canvas_config: originalTemplate.canvas_config
        ? {
            ...originalTemplate.canvas_config,
            metadata: {
              ...originalTemplate.canvas_config.metadata,
              createdAt: now,
              updatedAt: now,
              createdBy: session.userId,
              lastEditedBy: session.userId,
            },
          }
        : null,
      is_active: false, // Duplicated templates are not active by default
      created_by: session.userId,
    };

    // Insert new template
    const { data: newTemplate, error: insertTemplateError } = await supabase
      .from('rapor_template_keasramaan')
      .insert(newTemplateData)
      .select()
      .single();

    if (insertTemplateError) throw insertTemplateError;

    // Duplicate all elements with new IDs and template_id
    if (originalElements && originalElements.length > 0) {
      const newElements = originalElements.map((element) => ({
        template_id: newTemplate.id,
        element_type: element.element_type,
        position: element.position,
        size: element.size,
        content: element.content,
        style: element.style,
        data_binding: element.data_binding,
        z_index: element.z_index,
        is_visible: element.is_visible,
        is_locked: element.is_locked,
      }));

      const { error: insertElementsError } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(newElements);

      if (insertElementsError) throw insertElementsError;
    }

    // Fetch the complete duplicated template with elements
    const { data: elements } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', newTemplate.id)
      .order('z_index', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Template berhasil diduplikasi',
      data: {
        template: newTemplate,
        elements: elements || [],
      },
    });
  } catch (error: any) {
    console.error('Duplicate builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
