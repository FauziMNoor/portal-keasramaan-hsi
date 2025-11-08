import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateIndikatorForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - List indikator with optional kategori filter
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kategori_id = searchParams.get('kategori_id');

    let query = supabase
      .from('rapor_indikator_keasramaan')
      .select('*, rapor_kategori_indikator_keasramaan(id, nama_kategori)')
      .order('urutan', { ascending: true });

    if (kategori_id) {
      query = query.eq('kategori_id', kategori_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create new indikator
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kategori_id, nama_indikator, deskripsi, urutan } = body;

    // Validate using validation utility
    const validationErrors = validateIndikatorForm({
      kategori_id,
      nama_indikator,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

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

    // Get max urutan for this kategori if not provided
    let finalUrutan = urutan;
    if (finalUrutan === undefined || finalUrutan === null) {
      const { data: maxData } = await supabase
        .from('rapor_indikator_keasramaan')
        .select('urutan')
        .eq('kategori_id', kategori_id)
        .order('urutan', { ascending: false })
        .limit(1)
        .single();
      
      finalUrutan = maxData ? maxData.urutan + 1 : 0;
    }

    const { data, error } = await supabase
      .from('rapor_indikator_keasramaan')
      .insert({
        kategori_id,
        nama_indikator,
        deskripsi: deskripsi || null,
        urutan: finalUrutan,
      })
      .select('*, rapor_kategori_indikator_keasramaan(id, nama_kategori)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update indikator order (batch reorder)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reorder } = body;

    if (!reorder || !Array.isArray(reorder)) {
      return NextResponse.json(
        { error: 'Reorder data harus berupa array' },
        { status: 400 }
      );
    }

    // Update each indikator's urutan
    const updates = reorder.map(async (item: { id: string; urutan: number }) => {
      return supabase
        .from('rapor_indikator_keasramaan')
        .update({ urutan: item.urutan })
        .eq('id', item.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Urutan berhasil diperbarui' });
  } catch (error: any) {
    console.error('Reorder indikator error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
