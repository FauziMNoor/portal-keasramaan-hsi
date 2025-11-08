import { NextResponse } from 'next/server';

/**
 * GET /api/rapor/data/schema
 * Returns the complete data binding schema with field descriptions
 * This schema describes all available data sources and fields that can be used in template placeholders
 */
export async function GET() {
  try {
    const schema = {
      siswa: {
        description: 'Data siswa/santri',
        fields: {
          id: { type: 'string', description: 'ID unik siswa' },
          nama: { type: 'string', description: 'Nama lengkap siswa', example: '{{siswa.nama}}' },
          nis: { type: 'string', description: 'Nomor Induk Siswa', example: '{{siswa.nis}}' },
          kelas: { type: 'string', description: 'Kelas siswa', example: '{{siswa.kelas}}' },
          asrama: { type: 'string', description: 'Nama asrama', example: '{{siswa.asrama}}' },
          cabang: { type: 'string', description: 'Cabang/lokasi sekolah', example: '{{siswa.cabang}}' },
          foto_url: { type: 'string', description: 'URL foto siswa (optional)', example: '{{siswa.foto_url}}' },
        },
      },
      habit_tracker: {
        description: 'Data habit tracker dengan agregasi per kategori',
        fields: {
          periode: {
            description: 'Informasi periode rapor',
            fields: {
              tahun_ajaran: { type: 'string', description: 'Tahun ajaran', example: '{{habit_tracker.periode.tahun_ajaran}}' },
              semester: { type: 'number', description: 'Semester (1 atau 2)', example: '{{habit_tracker.periode.semester}}' },
              bulan: { type: 'number', description: 'Bulan (1-12, optional)', example: '{{habit_tracker.periode.bulan}}' },
            },
          },
          ubudiyah: {
            description: 'Kategori Ubudiyah',
            fields: {
              average: { type: 'number', description: 'Rata-rata nilai kategori', example: '{{habit_tracker.ubudiyah.average}}' },
              percentage: { type: 'number', description: 'Persentase capaian', example: '{{habit_tracker.ubudiyah.percentage}}' },
              details: {
                type: 'array',
                description: 'Detail per indikator',
                itemFields: {
                  indikator: { type: 'string', description: 'Nama indikator' },
                  nilai: { type: 'number', description: 'Nilai indikator' },
                  persentase: { type: 'number', description: 'Persentase capaian' },
                },
              },
            },
          },
          akhlaq: {
            description: 'Kategori Akhlaq',
            fields: {
              average: { type: 'number', description: 'Rata-rata nilai kategori', example: '{{habit_tracker.akhlaq.average}}' },
              percentage: { type: 'number', description: 'Persentase capaian', example: '{{habit_tracker.akhlaq.percentage}}' },
              details: {
                type: 'array',
                description: 'Detail per indikator',
                itemFields: {
                  indikator: { type: 'string', description: 'Nama indikator' },
                  nilai: { type: 'number', description: 'Nilai indikator' },
                  persentase: { type: 'number', description: 'Persentase capaian' },
                },
              },
            },
          },
          kedisiplinan: {
            description: 'Kategori Kedisiplinan',
            fields: {
              average: { type: 'number', description: 'Rata-rata nilai kategori', example: '{{habit_tracker.kedisiplinan.average}}' },
              percentage: { type: 'number', description: 'Persentase capaian', example: '{{habit_tracker.kedisiplinan.percentage}}' },
              details: {
                type: 'array',
                description: 'Detail per indikator',
                itemFields: {
                  indikator: { type: 'string', description: 'Nama indikator' },
                  nilai: { type: 'number', description: 'Nilai indikator' },
                  persentase: { type: 'number', description: 'Persentase capaian' },
                },
              },
            },
          },
          kebersihan: {
            description: 'Kategori Kebersihan & Kerapian',
            fields: {
              average: { type: 'number', description: 'Rata-rata nilai kategori', example: '{{habit_tracker.kebersihan.average}}' },
              percentage: { type: 'number', description: 'Persentase capaian', example: '{{habit_tracker.kebersihan.percentage}}' },
              details: {
                type: 'array',
                description: 'Detail per indikator',
                itemFields: {
                  indikator: { type: 'string', description: 'Nama indikator' },
                  nilai: { type: 'number', description: 'Nilai indikator' },
                  persentase: { type: 'number', description: 'Persentase capaian' },
                },
              },
            },
          },
          overall_average: { type: 'number', description: 'Rata-rata keseluruhan semua kategori', example: '{{habit_tracker.overall_average}}' },
          overall_percentage: { type: 'number', description: 'Persentase keseluruhan', example: '{{habit_tracker.overall_percentage}}' },
        },
      },
      galeri_kegiatan: {
        description: 'Galeri foto kegiatan asrama',
        type: 'array',
        itemFields: {
          id: { type: 'string', description: 'ID foto' },
          nama_kegiatan: { type: 'string', description: 'Nama kegiatan' },
          tanggal: { type: 'string', description: 'Tanggal kegiatan (ISO format)' },
          foto_url: { type: 'string', description: 'URL foto' },
          caption: { type: 'string', description: 'Caption foto (optional)' },
        },
      },
      school: {
        description: 'Data identitas sekolah',
        fields: {
          nama: { type: 'string', description: 'Nama sekolah', example: '{{school.nama}}' },
          logo_url: { type: 'string', description: 'URL logo sekolah', example: '{{school.logo_url}}' },
          alamat: { type: 'string', description: 'Alamat sekolah', example: '{{school.alamat}}' },
          telepon: { type: 'string', description: 'Nomor telepon', example: '{{school.telepon}}' },
          website: { type: 'string', description: 'Website sekolah', example: '{{school.website}}' },
        },
      },
      pembina: {
        description: 'Data pembina asrama',
        fields: {
          nama: { type: 'string', description: 'Nama pembina', example: '{{pembina.nama}}' },
          nip: { type: 'string', description: 'NIP pembina', example: '{{pembina.nip}}' },
        },
      },
      kepala_sekolah: {
        description: 'Data kepala sekolah',
        fields: {
          nama: { type: 'string', description: 'Nama kepala sekolah', example: '{{kepala_sekolah.nama}}' },
          nip: { type: 'string', description: 'NIP kepala sekolah', example: '{{kepala_sekolah.nip}}' },
        },
      },
    };

    return NextResponse.json({
      success: true,
      schema,
    });
  } catch (error: any) {
    console.error('Get data schema error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
