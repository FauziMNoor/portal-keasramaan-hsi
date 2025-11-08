import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateKegiatanForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - List kegiatan with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tahun_ajaran = searchParams.get('tahun_ajaran');
    const semester = searchParams.get('semester');
    const scope = searchParams.get('scope');
    const search = searchParams.get('search');

    let query = supabase
      .from('kegiatan_asrama_keasramaan')
      .select('*')
      .order('tanggal_mulai', { ascending: false });

    // Apply filters
    if (tahun_ajaran) {
      query = query.eq('tahun_ajaran', tahun_ajaran);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }
    if (scope) {
      query = query.eq('scope', scope);
    }
    if (search) {
      query = query.ilike('nama_kegiatan', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get kegiatan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create new kegiatan
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      .insert({
        nama_kegiatan,
        deskripsi: deskripsi || null,
        tanggal_mulai,
        tanggal_selesai,
        tahun_ajaran,
        semester,
        scope,
        kelas_id: kelas_id || null,
        asrama_id: asrama_id || null,
        created_by: session.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create kegiatan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
