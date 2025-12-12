import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/musyrif
// Get list musyrif
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const cabang = searchParams.get('cabang');

    let query = supabase
      .from('musyrif_keasramaan')
      .select('*')
      .eq('status', 'aktif')
      .order('nama_musyrif', { ascending: true });

    if (cabang) {
      query = query.eq('cabang', cabang);
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
