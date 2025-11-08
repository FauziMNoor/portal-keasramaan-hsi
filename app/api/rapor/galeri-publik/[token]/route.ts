import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface KegiatanWithPhotos {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  scope: string;
  foto: {
    id: string;
    foto_url: string;
    caption: string;
    urutan: number;
  }[];
}

interface GaleriPublikResponse {
  siswa: {
    nis: string;
    nama_siswa: string;
    kelas: string;
    asrama: string;
    lokasi: string;
  };
  periode: {
    tahun_ajaran: string;
    semester: string;
  };
  kegiatan: KegiatanWithPhotos[];
}

// GET - Validate token and fetch galeri data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('rapor_galeri_token_keasramaan')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token sudah kadaluarsa' },
        { status: 410 }
      );
    }

    const { siswa_nis, tahun_ajaran, semester } = tokenData;

    // Fetch siswa info
    const { data: siswaData, error: siswaError } = await supabase
      .from('data_siswa_keasramaan')
      .select('nama_siswa, nis, kelas, asrama, lokasi')
      .eq('nis', siswa_nis)
      .single();

    if (siswaError || !siswaData) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Build scope filter based on siswa's kelas and asrama
    // Scope options: 'seluruh_sekolah', 'kelas_10', 'kelas_11', 'kelas_12', 'asrama_putra', 'asrama_putri'
    const scopeFilters: string[] = ['seluruh_sekolah'];

    // Add kelas-based scope
    if (siswaData.kelas) {
      const kelasLower = siswaData.kelas.toLowerCase();
      if (kelasLower.includes('10') || kelasLower.includes('x')) {
        scopeFilters.push('kelas_10');
      } else if (kelasLower.includes('11') || kelasLower.includes('xi')) {
        scopeFilters.push('kelas_11');
      } else if (kelasLower.includes('12') || kelasLower.includes('xii')) {
        scopeFilters.push('kelas_12');
      }
    }

    // Add asrama-based scope
    if (siswaData.asrama) {
      const asramaLower = siswaData.asrama.toLowerCase();
      if (asramaLower.includes('putra') || asramaLower.includes('ikhwan')) {
        scopeFilters.push('asrama_putra');
      } else if (asramaLower.includes('putri') || asramaLower.includes('akhwat')) {
        scopeFilters.push('asrama_putri');
      }
    }

    // Fetch kegiatan filtered by scope and periode
    const { data: kegiatanList, error: kegiatanError } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .select('id, nama_kegiatan, deskripsi, tanggal_mulai, tanggal_selesai, scope')
      .eq('tahun_ajaran', tahun_ajaran)
      .eq('semester', semester)
      .in('scope', scopeFilters)
      .order('tanggal_mulai', { ascending: false });

    if (kegiatanError) {
      console.error('Error fetching kegiatan:', kegiatanError);
      return NextResponse.json(
        { error: 'Gagal mengambil data kegiatan' },
        { status: 500 }
      );
    }

    // Fetch photos for each kegiatan
    const kegiatanWithPhotos: KegiatanWithPhotos[] = [];

    if (kegiatanList && kegiatanList.length > 0) {
      for (const kegiatan of kegiatanList) {
        const { data: photos, error: photosError } = await supabase
          .from('kegiatan_galeri_keasramaan')
          .select('id, foto_url, caption, urutan')
          .eq('kegiatan_id', kegiatan.id)
          .order('urutan', { ascending: true });

        // Only include kegiatan that have photos
        if (!photosError && photos && photos.length > 0) {
          kegiatanWithPhotos.push({
            id: kegiatan.id,
            nama_kegiatan: kegiatan.nama_kegiatan,
            deskripsi: kegiatan.deskripsi || '',
            tanggal_mulai: kegiatan.tanggal_mulai,
            tanggal_selesai: kegiatan.tanggal_selesai,
            scope: kegiatan.scope,
            foto: photos,
          });
        }
      }
    }

    const response: GaleriPublikResponse = {
      siswa: {
        nis: siswaData.nis,
        nama_siswa: siswaData.nama_siswa,
        kelas: siswaData.kelas || '',
        asrama: siswaData.asrama || '',
        lokasi: siswaData.lokasi || '',
      },
      periode: {
        tahun_ajaran,
        semester,
      },
      kegiatan: kegiatanWithPhotos,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Galeri publik API error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
