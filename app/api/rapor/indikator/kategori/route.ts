import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateKategoriIndikatorForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - List all kategori with their indikator
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('rapor_kategori_indikator_keasramaan')
      .select('*, rapor_indikator_keasramaan(*)')
      .order('urutan', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create new kategori
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get max urutan if not provided
    let finalUrutan = urutan;
    if (finalUrutan === undefined || finalUrutan === null) {
      const { data: maxData } = await supabase
        .from('rapor_kategori_indikator_keasramaan')
        .select('urutan')
        .order('urutan', { ascending: false })
        .limit(1)
        .single();
      
      finalUrutan = maxData ? maxData.urutan + 1 : 0;
    }

    const { data, error } = await supabase
      .from('rapor_kategori_indikator_keasramaan')
      .insert({
        nama_kategori,
        urutan: finalUrutan,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update kategori order (batch reorder)
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

    // Update each kategori's urutan
    const updates = reorder.map(async (item: { id: string; urutan: number }) => {
      return supabase
        .from('rapor_kategori_indikator_keasramaan')
        .update({ urutan: item.urutan })
        .eq('id', item.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Urutan berhasil diperbarui' });
  } catch (error: any) {
    console.error('Reorder kategori error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
