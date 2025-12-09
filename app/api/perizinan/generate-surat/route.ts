import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSuratIzin } from '@/lib/pdf-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { perizinan_id } = await request.json();

    console.log('📄 Generate Surat Request:', { perizinan_id });

    if (!perizinan_id) {
      return NextResponse.json(
        { error: 'ID Perizinan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Ambil data perizinan
    const { data: perizinan, error: perizinanError } = await supabase
      .from('perizinan_kepulangan_keasramaan')
      .select('*')
      .eq('id', perizinan_id)
      .single();

    if (perizinanError || !perizinan) {
      console.error('❌ Perizinan not found:', perizinanError);
      return NextResponse.json(
        { error: 'Data perizinan tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Perizinan found:', { 
      nama: perizinan.nama_siswa, 
      cabang: perizinan.cabang,
      status: perizinan.status 
    });

    // Cek apakah sudah disetujui penuh
    if (perizinan.status !== 'approved_kepsek') {
      return NextResponse.json(
        { error: 'Surat hanya bisa dicetak setelah disetujui Kepala Sekolah' },
        { status: 400 }
      );
    }

    // Ambil info sekolah
    // STRATEGI:
    // 1. Jika ada data dengan KOP template (mode=template), gunakan itu (universal untuk semua cabang)
    // 2. Jika tidak ada, cari berdasarkan cabang untuk KOP dinamis
    // 3. Fallback ke data pertama yang ada
    
    let infoSekolah: any = null;
    let infoError: any = null;

    // Ambil data dari tabel identitas_sekolah_keasramaan (1 row untuk semua cabang)
    console.log('🔍 Mengambil info sekolah...');
    const { data, error } = await supabase
      .from('identitas_sekolah_keasramaan')
      .select('*')
      .limit(1)
      .single();

    infoSekolah = data;
    infoError = error;

    if (infoSekolah) {
      console.log('✅ Info sekolah ditemukan');
    }

    if (infoError || !infoSekolah) {
      console.error('❌ Info sekolah not found:', { 
        cabang: perizinan.cabang,
        error: infoError 
      });
      return NextResponse.json(
        { error: `Data info sekolah tidak ditemukan. Silakan isi data di menu Identitas Sekolah terlebih dahulu.` },
        { status: 404 }
      );
    }

    console.log('✅ Info sekolah found:', { 
      cabang: infoSekolah.cabang,
      kop_mode: infoSekolah.kop_mode,
      has_template: !!infoSekolah.kop_template_url
    });

    // Generate PDF menggunakan library
    console.log('📝 Generating PDF...');
    const pdfBuffer = await generateSuratIzin(perizinan, infoSekolah);
    console.log('✅ PDF generated successfully');
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Surat_Izin_${perizinan.nama_siswa.replace(/\s/g, '_')}_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}
