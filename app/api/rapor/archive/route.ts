import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const tahunAjaran = searchParams.get('tahun_ajaran');
    const semester = searchParams.get('semester');
    const siswaName = searchParams.get('siswa_name');
    const templateId = searchParams.get('template_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('rapor_generate_history_keasramaan')
      .select(`
        id,
        siswa_nis,
        tahun_ajaran,
        semester,
        pdf_url,
        status,
        generated_by,
        created_at,
        template_id,
        rapor_template_keasramaan!inner (
          id,
          nama_template
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // Apply filters
    if (tahunAjaran) {
      query = query.eq('tahun_ajaran', tahunAjaran);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }
    if (templateId) {
      query = query.eq('template_id', templateId);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: historyData, error: historyError } = await query;

    if (historyError) {
      console.error('Error fetching archive:', historyError);
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil data arsip' },
        { status: 500 }
      );
    }

    // Get unique siswa NIS to fetch student names
    const siswaList = [...new Set(historyData?.map(h => h.siswa_nis) || [])];

    // Fetch student data
    const { data: siswaData, error: siswaError } = await supabase
      .from('siswa_keasramaan')
      .select('nis, nama')
      .in('nis', siswaList);

    if (siswaError) {
      console.error('Error fetching siswa data:', siswaError);
    }

    // Create a map of NIS to nama
    const siswaMap = new Map(siswaData?.map(s => [s.nis, s.nama]) || []);

    // Transform data
    const archives = historyData?.map(h => ({
      id: h.id,
      siswa_nis: h.siswa_nis,
      siswa_nama: siswaMap.get(h.siswa_nis) || h.siswa_nis,
      tahun_ajaran: h.tahun_ajaran,
      semester: h.semester,
      template_nama: (h.rapor_template_keasramaan as any)?.nama_template || 'Unknown',
      pdf_url: h.pdf_url,
      generated_by: h.generated_by,
      created_at: h.created_at,
    })) || [];

    // Apply siswa name filter if provided (client-side filter since we need to join with siswa table)
    let filteredArchives = archives;
    if (siswaName) {
      filteredArchives = archives.filter(a =>
        a.siswa_nama.toLowerCase().includes(siswaName.toLowerCase()) ||
        a.siswa_nis.toLowerCase().includes(siswaName.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredArchives,
    });
  } catch (error) {
    console.error('Error in archive API:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
