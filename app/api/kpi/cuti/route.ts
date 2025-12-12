import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/cuti
// Get sisa cuti musyrif
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const musyrif = searchParams.get('musyrif');
    const tahun = searchParams.get('tahun') || new Date().getFullYear().toString();

    if (!musyrif) {
      return NextResponse.json(
        { success: false, error: 'Parameter musyrif required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cuti_tahunan_musyrif_keasramaan')
      .select('*')
      .eq('nama_musyrif', musyrif)
      .eq('tahun', parseInt(tahun))
      .single();

    if (error) {
      // If not found, create new record with default 12 days
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('cuti_tahunan_musyrif_keasramaan')
          .insert([{
            nama_musyrif: musyrif,
            tahun: parseInt(tahun),
            jatah_cuti: 12,
            cuti_terpakai: 0,
            sisa_cuti: 12
          }])
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { success: false, error: insertError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: newData
        });
      }

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
