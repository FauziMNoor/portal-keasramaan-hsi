import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/rapat
// Query params: cabang, bulan, tahun
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const cabang = searchParams.get('cabang');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    if (!cabang) {
      return NextResponse.json(
        { success: false, error: 'Parameter cabang required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('rapat_koordinasi_keasramaan')
      .select(`
        *,
        kehadiran:kehadiran_rapat_keasramaan(*)
      `)
      .eq('cabang', cabang)
      .order('tanggal', { ascending: false });

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

// POST /api/kpi/rapat
// Create new rapat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tanggal,
      waktu,
      jenis_rapat,
      cabang,
      kepala_asrama,
      musyrif_list,
      agenda
    } = body;

    // Validation
    if (!tanggal || !waktu || !jenis_rapat || !cabang || !musyrif_list) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert rapat
    const { data, error } = await supabase
      .from('rapat_koordinasi_keasramaan')
      .insert([{
        tanggal,
        waktu,
        jenis_rapat,
        cabang,
        kepala_asrama,
        musyrif_list,
        agenda
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
      message: 'Rapat berhasil dibuat'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/kpi/rapat?id=xxx
// Update rapat
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rapat_koordinasi_keasramaan')
      .update(body)
      .eq('id', id)
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
      message: 'Rapat berhasil diupdate'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/kpi/rapat?id=xxx
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
      .from('rapat_koordinasi_keasramaan')
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
      message: 'Rapat berhasil dihapus'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
