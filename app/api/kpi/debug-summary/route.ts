import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/debug-summary
// Debug endpoint to check KPI summary data
export async function GET(request: NextRequest) {
  try {
    // Check if table exists and has data
    const { data: allData, error: allError } = await supabase
      .from('kpi_summary_keasramaan')
      .select('*')
      .limit(10);

    // Count total records
    const { count, error: countError } = await supabase
      .from('kpi_summary_keasramaan')
      .select('*', { count: 'exact', head: true });

    // Get unique periodes
    const { data: periodes, error: periodeError } = await supabase
      .from('kpi_summary_keasramaan')
      .select('periode')
      .order('periode', { ascending: false });

    const uniquePeriodes = [...new Set(periodes?.map(p => p.periode) || [])];

    // Get unique cabang
    const { data: cabangs, error: cabangError } = await supabase
      .from('kpi_summary_keasramaan')
      .select('cabang')
      .order('cabang');

    const uniqueCabangs = [...new Set(cabangs?.map(c => c.cabang) || [])];

    return NextResponse.json({
      success: true,
      data: {
        total_records: count || 0,
        sample_data: allData || [],
        unique_periodes: uniquePeriodes,
        unique_cabangs: uniqueCabangs,
        errors: {
          all: allError,
          count: countError,
          periode: periodeError,
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
