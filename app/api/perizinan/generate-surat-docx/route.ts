import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSuratIzinDocx } from '@/lib/docx-generator';
import { Packer } from 'docx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { perizinan_id } = await request.json();

    console.log('📄 Generate Surat DOCX Request:', { perizinan_id });

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

    // Ambil info sekolah (sama seperti PDF)
    let infoSekolah: any = null;

    // Ambil data dari tabel identitas_sekolah_keasramaan (1 row untuk semua cabang)
    console.log('🔍 Mengambil info sekolah...');
    const { data } = await supabase
      .from('identitas_sekolah_keasramaan')
      .select('*')
      .limit(1)
      .single();

    infoSekolah = data;

    if (infoSekolah) {
      console.log('✅ Info sekolah ditemukan');
    }

    if (!infoSekolah) {
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

    // Generate DOCX
    console.log('📝 Generating DOCX...');
    const doc = await generateSuratIzinDocx(perizinan, infoSekolah);
    
    // Convert to buffer
    const buffer = await Packer.toBuffer(doc);
    console.log('✅ DOCX generated successfully');
    
    // Return DOCX
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Surat_Izin_${perizinan.nama_siswa.replace(/\s/g, '_')}_${Date.now()}.docx"`,
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
