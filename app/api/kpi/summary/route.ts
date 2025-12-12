import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/summary
// Get KPI summary from database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const cabang = searchParams.get('cabang');
    const periode = searchParams.get('periode');
    const musyrif = searchParams.get('musyrif');

    let query = supabase
      .from('kpi_summary_keasramaan')
      .select('*')
      .order('ranking', { ascending: true });

    // Filters
    if (cabang) {
      query = query.eq('cabang', cabang);
    }

    if (periode) {
      // Convert YYYY-MM to YYYY-MM-01 for exact match
      // Or use LIKE for partial match
      const periodeDate = `${periode}-01`;
      query = query.eq('periode', periodeDate);
    }

    if (musyrif) {
      query = query.eq('nama_musyrif', musyrif);
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
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
