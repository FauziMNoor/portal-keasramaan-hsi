import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/debug-musyrif?cabang=Pusat
// Debug endpoint to check musyrif data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cabang = searchParams.get('cabang');

    if (!cabang) {
      return NextResponse.json(
        { success: false, error: 'Missing cabang parameter' },
        { status: 400 }
      );
    }

    // Get all musyrif in cabang
    const { data: allMusyrif, error: allError } = await supabase
      .from('musyrif_keasramaan')
      .select('*')
      .eq('cabang', cabang);

    // Get active musyrif
    const { data: activeMusyrif, error: activeError } = await supabase
      .from('musyrif_keasramaan')
      .select('*')
      .eq('cabang', cabang)
      .eq('status', 'aktif');

    // Get all cabang
    const { data: cabangList, error: cabangError } = await supabase
      .from('cabang_keasramaan')
      .select('nama_cabang');

    return NextResponse.json({
      success: true,
      data: {
        cabang_requested: cabang,
        all_cabang: cabangList?.map(c => c.nama_cabang) || [],
        total_musyrif: allMusyrif?.length || 0,
        total_active_musyrif: activeMusyrif?.length || 0,
        all_musyrif: allMusyrif || [],
        active_musyrif: activeMusyrif || [],
        errors: {
          all: allError,
          active: activeError,
          cabang: cabangError
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
