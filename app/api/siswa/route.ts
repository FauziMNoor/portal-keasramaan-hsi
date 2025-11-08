import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// GET - List all siswa
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const kelas = searchParams.get('kelas');
    const asrama = searchParams.get('asrama');

    let query = supabase
      .from('data_siswa_keasramaan')
      .select('*')
      .order('nama_siswa', { ascending: true });

    // Apply filters
    if (search) {
      query = query.or(`nama_siswa.ilike.%${search}%,nis.ilike.%${search}%`);
    }
    if (kelas) {
      query = query.eq('kelas', kelas);
    }
    if (asrama) {
      query = query.eq('asrama', asrama);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get siswa error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
