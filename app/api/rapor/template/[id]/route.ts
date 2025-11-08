import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateTemplateForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - Get single template by ID
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

    const { data, error } = await supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update template
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
    const {
      nama_template,
      jenis_rapor,
      ukuran_kertas_default,
      orientasi_default,
      is_active,
    } = body;

    // Validate using validation utility (only validate provided fields)
    const validationErrors = validateTemplateForm({
      nama_template,
      jenis_rapor,
      ukuran_kertas_default,
      orientasi_default,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (nama_template !== undefined) updateData.nama_template = nama_template;
    if (jenis_rapor !== undefined) updateData.jenis_rapor = jenis_rapor;
    if (ukuran_kertas_default !== undefined) updateData.ukuran_kertas_default = ukuran_kertas_default;
    if (orientasi_default !== undefined) updateData.orientasi_default = orientasi_default;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('rapor_template_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
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

    if (checkError || !existingTemplate) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    // Delete related history first (foreign key constraint)
    const { error: historyError } = await supabase
      .from('rapor_generate_history_keasramaan')
      .delete()
      .eq('template_id', id);

    if (historyError) {
      console.error('Delete history error:', historyError);
      throw new Error('Gagal menghapus history rapor terkait');
    }

    // Delete template (cascade will delete pages)
    const { error } = await supabase
      .from('rapor_template_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Template berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
