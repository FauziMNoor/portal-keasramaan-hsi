import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kpi/jadwal-libur
// Query params: cabang, bulan, tahun, musyrif
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const cabang = searchParams.get('cabang');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');
    const musyrif = searchParams.get('musyrif');

    if (!cabang) {
      return NextResponse.json(
        { success: false, error: 'Parameter cabang required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .select('*')
      .eq('cabang', cabang)
      .order('tanggal_mulai', { ascending: true });

    // Filter by musyrif
    if (musyrif) {
      query = query.eq('nama_musyrif', musyrif);
    }

    // Filter by bulan & tahun
    if (bulan && tahun) {
      const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0).toISOString().split('T')[0];
      query = query.gte('tanggal_mulai', startDate).lte('tanggal_selesai', endDate);
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

// POST /api/kpi/jadwal-libur
// Create new jadwal libur (cuti/izin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nama_musyrif,
      cabang,
      asrama,
      tanggal_mulai,
      tanggal_selesai,
      jenis_libur,
      keterangan,
      musyrif_pengganti
    } = body;

    // Validation
    if (!nama_musyrif || !cabang || !asrama || !tanggal_mulai || !tanggal_selesai || !jenis_libur) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check sisa cuti if jenis_libur = 'cuti'
    if (jenis_libur === 'cuti') {
      const tahun = new Date(tanggal_mulai).getFullYear();
      const { data: cutiData } = await supabase
        .from('cuti_tahunan_musyrif_keasramaan')
        .select('sisa_cuti')
        .eq('nama_musyrif', nama_musyrif)
        .eq('tahun', tahun)
        .single();

      if (!cutiData || cutiData.sisa_cuti <= 0) {
        return NextResponse.json(
          { success: false, error: 'Sisa cuti tidak mencukupi' },
          { status: 400 }
        );
      }

      // Calculate jumlah hari
      const start = new Date(tanggal_mulai);
      const end = new Date(tanggal_selesai);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > cutiData.sisa_cuti) {
        return NextResponse.json(
          { success: false, error: `Sisa cuti hanya ${cutiData.sisa_cuti} hari` },
          { status: 400 }
        );
      }
    }

    // Insert jadwal libur
    const { data, error } = await supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .insert([{
        nama_musyrif,
        cabang,
        asrama,
        tanggal_mulai,
        tanggal_selesai,
        jenis_libur,
        keterangan,
        musyrif_pengganti,
        status: jenis_libur === 'rutin' ? 'approved_kepala_sekolah' : 'pending'
      }])
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
      message: jenis_libur === 'rutin' 
        ? 'Jadwal libur rutin berhasil dibuat'
        : 'Pengajuan cuti/izin berhasil dibuat, menunggu approval'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/kpi/jadwal-libur?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Jadwal libur berhasil dihapus'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
