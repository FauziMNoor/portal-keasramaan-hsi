import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// GET - Get capaian history by siswa
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswa_nis = searchParams.get('siswa_nis');

    if (!siswa_nis) {
      return NextResponse.json(
        { error: 'Siswa NIS harus diisi' },
        { status: 400 }
      );
    }

    // Get all capaian for this siswa, grouped by periode
    const { data, error } = await supabase
      .from('rapor_capaian_siswa_keasramaan')
      .select(`
        *,
        rapor_indikator_keasramaan(
          id,
          nama_indikator,
          deskripsi,
          urutan,
          kategori_id,
          rapor_kategori_indikator_keasramaan(id, nama_kategori, urutan)
        )
      `)
      .eq('siswa_nis', siswa_nis)
      .order('tahun_ajaran', { ascending: false })
      .order('semester', { ascending: false });

    if (error) throw error;

    // Group by periode (tahun_ajaran + semester)
    const groupedData: Record<string, any[]> = {};
    
    data?.forEach((item) => {
      const key = `${item.tahun_ajaran}-${item.semester}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });

    // Sort each group by kategori and indikator urutan
    Object.keys(groupedData).forEach((key) => {
      groupedData[key].sort((a, b) => {
        const kategoriA = a.rapor_indikator_keasramaan?.rapor_kategori_indikator_keasramaan?.urutan || 0;
        const kategoriB = b.rapor_indikator_keasramaan?.rapor_kategori_indikator_keasramaan?.urutan || 0;
        
        if (kategoriA !== kategoriB) {
          return kategoriA - kategoriB;
        }
        
        const indikatorA = a.rapor_indikator_keasramaan?.urutan || 0;
        const indikatorB = b.rapor_indikator_keasramaan?.urutan || 0;
        return indikatorA - indikatorB;
      });
    });

    // Convert to array format
    const history = Object.entries(groupedData).map(([periode, capaian]) => {
      const [tahun_ajaran, semester] = periode.split('-');
      return {
        tahun_ajaran,
        semester,
        capaian,
      };
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Get capaian history error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
