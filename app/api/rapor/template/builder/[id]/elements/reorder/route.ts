import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// POST - Update z-index of multiple elements
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
    const { elementIds } = body;

    // Validate input
    if (!elementIds || !Array.isArray(elementIds) || elementIds.length === 0) {
      return NextResponse.json(
        { error: 'elementIds array is required and must not be empty' },
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

    // Verify all elements exist and belong to this template
    const { data: existingElements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('id')
      .eq('template_id', templateId)
      .in('id', elementIds);

    if (elementsError) throw elementsError;

    if (!existingElements || existingElements.length !== elementIds.length) {
      return NextResponse.json(
        { error: 'Beberapa element tidak ditemukan atau tidak termasuk dalam template ini' },
        { status: 400 }
      );
    }

    // Update z-index for each element based on array order
    // Lower index in array = lower z-index (bottom layer)
    // Higher index in array = higher z-index (top layer)
    const updatePromises = elementIds.map((elementId, index) => {
      return supabase
        .from('rapor_template_elements_keasramaan')
        .update({ z_index: index })
        .eq('id', elementId)
        .eq('template_id', templateId);
    });

    const results = await Promise.all(updatePromises);

    // Check if any update failed
    const failedUpdates = results.filter((result) => result.error);
    if (failedUpdates.length > 0) {
      console.error('Some updates failed:', failedUpdates);
      throw new Error('Gagal mengupdate beberapa element');
    }

    // Fetch updated elements
    const { data: updatedElements, error: fetchError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', templateId)
      .in('id', elementIds)
      .order('z_index', { ascending: true });

    if (fetchError) throw fetchError;

    return NextResponse.json({
      success: true,
      data: updatedElements,
      message: 'Element berhasil diurutkan',
    });
  } catch (error: any) {
    console.error('Reorder elements error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
