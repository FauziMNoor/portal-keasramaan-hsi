import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/debug
// Debug endpoint to check KPI data
export async function GET(request: NextRequest) {
  try {
    // 1. Check if kpi_summary table has data
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_summary_keasramaan')
      .select('*')
      .limit(10);

    // 2. Check cabang list
    const { data: cabangData, error: cabangError } = await supabase
      .from('cabang_keasramaan')
      .select('nama_cabang');

    // 3. Check musyrif list
    const { data: musyrifData, error: musyrifError } = await supabase
      .from('musyrif_keasramaan')
      .select('nama_musyrif, cabang, status')
      .eq('status', 'aktif')
      .limit(10);

    // 4. Check jurnal count
    const { count: jurnalCount } = await supabase
      .from('formulir_jurnal_musyrif_keasramaan')
      .select('*', { count: 'exact', head: true });

    // 5. Check habit tracker count
    const { count: habitCount } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      debug: {
        kpi_summary: {
          count: kpiData?.length || 0,
          data: kpiData,
          error: kpiError?.message,
        },
        cabang: {
          count: cabangData?.length || 0,
          data: cabangData,
          error: cabangError?.message,
        },
        musyrif: {
          count: musyrifData?.length || 0,
          data: musyrifData,
          error: musyrifError?.message,
        },
        jurnal_count: jurnalCount || 0,
        habit_tracker_count: habitCount || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
