import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

/**
 * GET /api/siswa/list
 * Returns a simplified list of students for dropdowns
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('id, nama_siswa, nis, kelas, asrama, lokasi')
      .order('nama_siswa', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error: any) {
    console.error('Get siswa list error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
