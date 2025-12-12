import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/kpi/rapat/kehadiran
// Input kehadiran musyrif di rapat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { rapat_id, kehadiran } = body;

    // Validation
    if (!rapat_id || !kehadiran || !Array.isArray(kehadiran)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: rapat_id, kehadiran (array)' },
        { status: 400 }
      );
    }

    // Prepare data for insert
    const kehadiranData = kehadiran.map((k: any) => ({
      rapat_id,
      nama_musyrif: k.nama_musyrif,
      status_kehadiran: k.status_kehadiran,
      keterangan: k.keterangan || null
    }));

    // Delete existing kehadiran for this rapat (if any)
    await supabase
      .from('kehadiran_rapat_keasramaan')
      .delete()
      .eq('rapat_id', rapat_id);

    // Insert new kehadiran
    const { data, error } = await supabase
      .from('kehadiran_rapat_keasramaan')
      .insert(kehadiranData)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Kehadiran berhasil disimpan'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/kpi/rapat/kehadiran?rapat_id=xxx
// Get kehadiran by rapat_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rapat_id = searchParams.get('rapat_id');

    if (!rapat_id) {
      return NextResponse.json(
        { success: false, error: 'Parameter rapat_id required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('kehadiran_rapat_keasramaan')
      .select('*')
      .eq('rapat_id', rapat_id);

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
