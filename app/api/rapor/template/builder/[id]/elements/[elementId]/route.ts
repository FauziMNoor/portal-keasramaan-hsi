import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { TemplateElementSchema } from '@/types/rapor-builder';

// PUT - Update element properties
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; elementId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId, elementId } = await params;
    const body = await request.json();
    const { element } = body;

    if (!element) {
      return NextResponse.json(
        { error: 'Element data is required' },
        { status: 400 }
      );
    }

    // Validate element structure (partial validation for updates)
    try {
      TemplateElementSchema.partial().parse(element);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Invalid element structure', details: validationError.errors },
        { status: 400 }
      );
    }

    // Check if element exists
    const { data: existingElement, error: checkError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('id, template_id')
      .eq('id', elementId)
      .eq('template_id', templateId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Element tidak ditemukan' },
          { status: 404 }
        );
      }
      throw checkError;
    }

    // Build update object
    const updateData: any = {};

    if (element.type !== undefined) {
      updateData.element_type = element.type;
    }

    if (element.position !== undefined) {
      updateData.position = element.position;
    }

    if (element.size !== undefined) {
      updateData.size = element.size;
    }

    if ((element as any).content !== undefined) {
      updateData.content = (element as any).content;
    }

    if ((element as any).style !== undefined) {
      updateData.style = (element as any).style;
    }

    if ((element as any).dataBinding !== undefined) {
      updateData.data_binding = (element as any).dataBinding;
    }

    if (element.zIndex !== undefined) {
      updateData.z_index = element.zIndex;
    }

    if (element.isVisible !== undefined) {
      updateData.is_visible = element.isVisible;
    }

    if (element.isLocked !== undefined) {
      updateData.is_locked = element.isLocked;
    }

    // Update element
    const { data, error } = await supabase
      .from('rapor_template_elements_keasramaan')
      .update(updateData)
      .eq('id', elementId)
      .eq('template_id', templateId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update element error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete element
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; elementId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId, elementId } = await params;

    // Check if element exists
    const { data: existingElement, error: checkError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('id')
      .eq('id', elementId)
      .eq('template_id', templateId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Element tidak ditemukan' },
          { status: 404 }
        );
      }
      throw checkError;
    }

    // Delete element
    const { error } = await supabase
      .from('rapor_template_elements_keasramaan')
      .delete()
      .eq('id', elementId)
      .eq('template_id', templateId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Element berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete element error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
