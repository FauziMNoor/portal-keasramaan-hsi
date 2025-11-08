import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { TemplateElementSchema } from '@/types/rapor-builder';

// POST - Add new element to template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;
    const body = await request.json();
    const { element } = body;

    if (!element) {
      return NextResponse.json(
        { error: 'Element data is required' },
        { status: 400 }
      );
    }

    // Validate element structure
    try {
      TemplateElementSchema.parse(element);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Invalid element structure', details: validationError.errors },
        { status: 400 }
      );
    }

    // Check if template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id')
      .eq('id', templateId)
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

    // Check if element ID already exists
    const { data: existingElement } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('id')
      .eq('id', element.id)
      .single();

    if (existingElement) {
      return NextResponse.json(
        { error: 'Element dengan ID tersebut sudah ada' },
        { status: 400 }
      );
    }

    // Insert element
    const { data, error } = await supabase
      .from('rapor_template_elements_keasramaan')
      .insert({
        id: element.id,
        template_id: templateId,
        element_type: element.type,
        position: element.position,
        size: element.size,
        content: (element as any).content || null,
        style: (element as any).style || null,
        data_binding: (element as any).dataBinding || null,
        z_index: element.zIndex,
        is_visible: element.isVisible,
        is_locked: element.isLocked,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create element error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
