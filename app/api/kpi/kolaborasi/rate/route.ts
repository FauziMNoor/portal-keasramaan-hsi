import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/kpi/kolaborasi/rate
// Rate kolaborasi (by Kepala Asrama)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, rating, catatan_penilaian } = body;

    // Validation
    if (!id || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update rating
    const { data, error } = await supabase
      .from('log_kolaborasi_keasramaan')
      .update({
        rating,
        catatan_penilaian: catatan_penilaian || null
      })
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
      message: 'Rating berhasil disimpan'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
