import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rapor_generate_log_keasramaan')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      logs: data,
      summary: {
        total: data?.length || 0,
        failed: data?.filter(l => l.status === 'failed').length || 0,
        success: data?.filter(l => l.status === 'success').length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
