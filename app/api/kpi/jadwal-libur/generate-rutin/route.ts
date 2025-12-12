import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/kpi/jadwal-libur/generate-rutin
// Generate jadwal libur rutin untuk 1 bulan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { cabang, bulan, tahun } = body;

    console.log('Generate jadwal libur request:', { cabang, bulan, tahun });

    // Validation
    if (!cabang || !bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: cabang, bulan, tahun' },
        { status: 400 }
      );
    }

    // Get all active musyrif di cabang (include kelas)
    const { data: musyrifList, error: musyrifError } = await supabase
      .from('musyrif_keasramaan')
      .select('nama_musyrif, asrama, kelas')
      .eq('cabang', cabang)
      .eq('status', 'aktif')
      .order('kelas', { ascending: true });

    if (musyrifError) {
      console.error('Error fetching musyrif:', musyrifError);
      return NextResponse.json(
        { success: false, error: musyrifError.message },
        { status: 500 }
      );
    }

    if (!musyrifList || musyrifList.length === 0) {
      console.log('No active musyrif found for cabang:', cabang);
      return NextResponse.json(
        { success: false, error: 'Tidak ada musyrif aktif di cabang ini' },
        { status: 400 }
      );
    }

    console.log(`Found ${musyrifList.length} active musyrif in ${cabang}`);

    // Group musyrif by kelas
    const musyrifByKelas: Record<string, any[]> = {};
    musyrifList.forEach((musyrif) => {
      const kelas = musyrif.kelas || 'Umum'; // Default 'Umum' jika kelas null
      if (!musyrifByKelas[kelas]) {
        musyrifByKelas[kelas] = [];
      }
      musyrifByKelas[kelas].push(musyrif);
    });

    console.log('Musyrif grouped by kelas:', Object.keys(musyrifByKelas).map(k => `${k}: ${musyrifByKelas[k].length}`).join(', '));

    // Bagi setiap kelas jadi 2 grup (bergantian)
    const grupByKelas: Record<string, { grup1: any[], grup2: any[] }> = {};
    
    Object.keys(musyrifByKelas).forEach((kelas) => {
      const musyrifKelas = musyrifByKelas[kelas];
      
      // Shuffle untuk random distribution
      const shuffled = [...musyrifKelas].sort(() => Math.random() - 0.5);
      
      // Bagi jadi 2 grup
      const grup1 = shuffled.filter((_, i) => i % 2 === 0);
      const grup2 = shuffled.filter((_, i) => i % 2 === 1);
      
      grupByKelas[kelas] = { grup1, grup2 };
      
      console.log(`Kelas ${kelas}: Grup1=${grup1.length}, Grup2=${grup2.length}`);
    });

    // Helper function: Get Sabtu & Ahad
    const getSaturday = (year: number, month: number, week: number) => {
      const firstDay = new Date(year, month - 1, 1);
      const firstSaturday = new Date(firstDay);
      
      // Find first Saturday of the month
      const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      firstSaturday.setDate(1 + daysUntilSaturday);
      
      // Add weeks
      firstSaturday.setDate(firstSaturday.getDate() + (week * 7));
      
      return firstSaturday.toISOString().split('T')[0];
    };

    const getSunday = (saturdayDate: string) => {
      const saturday = new Date(saturdayDate + 'T00:00:00');
      saturday.setDate(saturday.getDate() + 1);
      return saturday.toISOString().split('T')[0];
    };

    // Generate jadwal libur per kelas
    const jadwalLibur: any[] = [];
    const totalWeeks = 4; // 4 minggu per bulan

    for (let week = 0; week < totalWeeks; week++) {
      const sabtu = getSaturday(tahun, bulan, week);
      const ahad = getSunday(sabtu);

      // Check if date is still in the same month
      const satuDate = new Date(sabtu);
      if (satuDate.getMonth() + 1 !== bulan) continue;

      // Generate untuk setiap kelas
      Object.keys(grupByKelas).forEach((kelas) => {
        const { grup1, grup2 } = grupByKelas[kelas];

        // Grup 1 libur di minggu ganjil (0, 2)
        if (week % 2 === 0) {
          grup1.forEach((musyrif, index) => {
            const pengganti = grup2[index % grup2.length];
            jadwalLibur.push({
              nama_musyrif: musyrif.nama_musyrif,
              cabang,
              asrama: musyrif.asrama,
              tanggal_mulai: sabtu,
              tanggal_selesai: ahad,
              jenis_libur: 'rutin',
              keterangan: `Libur rutin minggu ke-${week + 1} (Kelas ${kelas})`,
              musyrif_pengganti: pengganti?.nama_musyrif || null,
              asrama_pengganti: pengganti?.asrama || null,
              status: 'approved_kepala_sekolah'
            });
          });
        }

        // Grup 2 libur di minggu genap (1, 3)
        if (week % 2 === 1) {
          grup2.forEach((musyrif, index) => {
            const pengganti = grup1[index % grup1.length];
            jadwalLibur.push({
              nama_musyrif: musyrif.nama_musyrif,
              cabang,
              asrama: musyrif.asrama,
              tanggal_mulai: sabtu,
              tanggal_selesai: ahad,
              jenis_libur: 'rutin',
              keterangan: `Libur rutin minggu ke-${week + 1} (Kelas ${kelas})`,
              musyrif_pengganti: pengganti?.nama_musyrif || null,
              asrama_pengganti: pengganti?.asrama || null,
              status: 'approved_kepala_sekolah'
            });
          });
        }
      });
    }

    console.log(`Generated ${jadwalLibur.length} jadwal libur entries`);

    // Check if there are any entries to insert
    if (jadwalLibur.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada jadwal libur yang di-generate untuk periode ini' },
        { status: 400 }
      );
    }

    // Insert jadwal libur
    const { data, error } = await supabase
      .from('jadwal_libur_musyrif_keasramaan')
      .insert(jadwalLibur)
      .select();

    if (error) {
      console.error('Error inserting jadwal libur:', error);
      return NextResponse.json(
        { success: false, error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        total_generated: data?.length || 0,
        jadwal: data
      },
      message: `Berhasil generate ${data?.length || 0} jadwal libur rutin`
    });
  } catch (error: any) {
    console.error('Unexpected error in generate-rutin:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
