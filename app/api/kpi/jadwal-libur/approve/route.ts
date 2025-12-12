import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/kpi/jadwal-libur/approve
// Approve or reject cuti/izin
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, action, role, approved_by, rejection_reason } = body;

    // Validation
    if (!id || !action || !role || !approved_by) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (!['kepala_asrama', 'kepala_sekolah'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be "kepala_asrama" or "kepala_sekolah"' },
        { status: 400 }
      );
    }

    // Get current jadwal libur
    const { data: jadwalLibur, error: fetchError } = await supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !jadwalLibur) {
      return NextResponse.json(
        { success: false, error: 'Jadwal libur not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    let updateData: any = {};

    if (action === 'reject') {
      updateData = {
        status: 'rejected',
        rejection_reason
      };

      if (role === 'kepala_asrama') {
        updateData.approved_by_kepala_asrama = approved_by;
        updateData.approved_at_kepala_asrama = new Date().toISOString();
      } else {
        updateData.approved_by_kepala_sekolah = approved_by;
        updateData.approved_at_kepala_sekolah = new Date().toISOString();
      }
    } else {
      // Approve
      if (role === 'kepala_asrama') {
        updateData = {
          status: 'approved_kepala_asrama',
          approved_by_kepala_asrama: approved_by,
          approved_at_kepala_asrama: new Date().toISOString()
        };
      } else {
        // Final approval by kepala sekolah
        updateData = {
          status: 'approved_kepala_sekolah',
          approved_by_kepala_sekolah: approved_by,
          approved_at_kepala_sekolah: new Date().toISOString()
        };

        // Update cuti terpakai if jenis_libur = 'cuti'
        if (jadwalLibur.jenis_libur === 'cuti') {
          const start = new Date(jadwalLibur.tanggal_mulai);
          const end = new Date(jadwalLibur.tanggal_selesai);
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const tahun = start.getFullYear();

          // Update cuti tahunan
          const { error: cutiError } = await supabase.rpc('update_cuti_terpakai', {
            p_nama_musyrif: jadwalLibur.nama_musyrif,
            p_tahun: tahun,
            p_jumlah_hari: diffDays
          });

          // If RPC not exists, use manual update
          if (cutiError) {
            const { data: cutiData } = await supabase
              .from('cuti_tahunan_musyrif_keasramaan')
              .select('cuti_terpakai, sisa_cuti')
              .eq('nama_musyrif', jadwalLibur.nama_musyrif)
              .eq('tahun', tahun)
              .single();

            if (cutiData) {
              await supabase
                .from('cuti_tahunan_musyrif_keasramaan')
                .update({
                  cuti_terpakai: cutiData.cuti_terpakai + diffDays,
                  sisa_cuti: cutiData.sisa_cuti - diffDays
                })
                .eq('nama_musyrif', jadwalLibur.nama_musyrif)
                .eq('tahun', tahun);
            }
          }
        }
      }
    }

    // Update jadwal libur
    const { data, error } = await supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const message = action === 'approve'
      ? `Cuti/izin berhasil di-approve oleh ${role}`
      : `Cuti/izin ditolak oleh ${role}`;

    return NextResponse.json({
      success: true,
      data,
      message
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
