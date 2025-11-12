import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cabang = searchParams.get('cabang');

    if (!cabang) {
      return NextResponse.json(
        { error: 'Parameter cabang diperlukan' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('info_sekolah_keasramaan')
      .select('*')
      .eq('cabang', cabang)
      .single();

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data info sekolah: ' + error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Data info sekolah tidak ditemukan untuk cabang: ' + cabang },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}
