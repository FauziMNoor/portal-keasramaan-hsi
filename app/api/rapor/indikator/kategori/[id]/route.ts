import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateKategoriIndikatorForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - Get single kategori
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
      .from('rapor_kategori_indikator_keasramaan')
      .select('*, rapor_indikator_keasramaan(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update kategori
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
    const { nama_kategori, urutan } = body;

    // Validate using validation utility
    const validationErrors = validateKategoriIndikatorForm({ nama_kategori });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

    const updateData: any = { nama_kategori };
    if (urutan !== undefined && urutan !== null) {
      updateData.urutan = urutan;
    }

    const { data, error } = await supabase
      .from('rapor_kategori_indikator_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete kategori
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

    // Check if kategori has indikator
    const { data: indikatorData } = await supabase
      .from('rapor_indikator_keasramaan')
      .select('id')
      .eq('kategori_id', id)
      .limit(1);

    if (indikatorData && indikatorData.length > 0) {
      return NextResponse.json(
        { error: 'Kategori tidak dapat dihapus karena masih memiliki indikator' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('rapor_kategori_indikator_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
