import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateIndikatorForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - Get single indikator
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
      .from('rapor_indikator_keasramaan')
      .select('*, rapor_kategori_indikator_keasramaan(id, nama_kategori)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Indikator tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update indikator
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
    const { nama_indikator, deskripsi, urutan, kategori_id } = body;

    // Validate using validation utility
    const validationErrors = validateIndikatorForm({
      kategori_id: kategori_id || '', // Will be validated if provided
      nama_indikator,
    });

    // Only check nama_indikator error, kategori_id is optional for updates
    const nameError = validationErrors.find(e => e.field === 'nama_indikator');
    if (nameError) {
      return NextResponse.json(
        { error: nameError.message, errors: [nameError] },
        { status: 400 }
      );
    }

    const updateData: any = { 
      nama_indikator,
      deskripsi: deskripsi || null,
    };
    
    if (urutan !== undefined && urutan !== null) {
      updateData.urutan = urutan;
    }
    
    if (kategori_id) {
      // Verify kategori exists
      const { data: kategoriData, error: kategoriError } = await supabase
        .from('rapor_kategori_indikator_keasramaan')
        .select('id')
        .eq('id', kategori_id)
        .single();

      if (kategoriError || !kategoriData) {
        return NextResponse.json(
          { error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
      updateData.kategori_id = kategori_id;
    }

    const { data, error } = await supabase
      .from('rapor_indikator_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select('*, rapor_kategori_indikator_keasramaan(id, nama_kategori)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete indikator
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

    // Check if indikator has capaian data
    const { data: capaianData } = await supabase
      .from('rapor_capaian_siswa_keasramaan')
      .select('id')
      .eq('indikator_id', id)
      .limit(1);

    if (capaianData && capaianData.length > 0) {
      return NextResponse.json(
        { error: 'Indikator tidak dapat dihapus karena sudah memiliki data capaian siswa' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('rapor_indikator_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Indikator berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
