import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/kolaborasi
// Query params: musyrif, cabang, bulan, tahun
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const musyrif = searchParams.get('musyrif');
    const cabang = searchParams.get('cabang');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    let query = supabase
      .from('log_kolaborasi_keasramaan')
      .select('*')
      .order('tanggal', { ascending: false });

    // Filter by musyrif
    if (musyrif) {
      query = query.eq('nama_musyrif', musyrif);
    }

    // Filter by cabang
    if (cabang) {
      query = query.eq('cabang', cabang);
    }

    // Filter by bulan & tahun
    if (bulan && tahun) {
      const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0).toISOString().split('T')[0];
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/kpi/kolaborasi
// Create new log kolaborasi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tanggal,
      nama_musyrif,
      cabang,
      asrama,
      jenis,
      deskripsi,
      kolaborator
    } = body;

    // Validation
    if (!tanggal || !nama_musyrif || !cabang || !asrama || !jenis || !deskripsi) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert log kolaborasi
    const { data, error } = await supabase
      .from('log_kolaborasi_keasramaan')
      .insert([{
        tanggal,
        nama_musyrif,
        cabang,
        asrama,
        jenis,
        deskripsi,
        kolaborator: kolaborator || []
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Log kolaborasi berhasil dibuat'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/kpi/kolaborasi?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('log_kolaborasi_keasramaan')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Log kolaborasi berhasil dihapus'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
