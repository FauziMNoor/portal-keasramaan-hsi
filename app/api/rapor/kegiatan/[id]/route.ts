import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateKegiatanForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - Get kegiatan detail
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
      .from('kegiatan_asrama_keasramaan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get kegiatan detail error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update kegiatan
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
      nama_kegiatan,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
      tahun_ajaran,
      semester,
      scope,
      kelas_id,
      asrama_id,
    } = body;

    // Validate using validation utility
    const validationErrors = validateKegiatanForm({
      nama_kegiatan,
      tanggal_mulai,
      tanggal_selesai,
      tahun_ajaran,
      semester,
      scope,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .update({
        nama_kegiatan,
        deskripsi: deskripsi || null,
        tanggal_mulai,
        tanggal_selesai,
        tahun_ajaran,
        semester,
        scope,
        kelas_id: kelas_id || null,
        asrama_id: asrama_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update kegiatan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete kegiatan
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

    const { error } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete kegiatan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
