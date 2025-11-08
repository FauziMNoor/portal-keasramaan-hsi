import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateCapaianForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - Get capaian with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswa_nis = searchParams.get('siswa_nis');
    const tahun_ajaran = searchParams.get('tahun_ajaran');
    const semester = searchParams.get('semester');
    const indikator_id = searchParams.get('indikator_id');

    let query = supabase
      .from('rapor_capaian_siswa_keasramaan')
      .select(`
        *,
        rapor_indikator_keasramaan(
          id,
          nama_indikator,
          deskripsi,
          kategori_id,
          rapor_kategori_indikator_keasramaan(id, nama_kategori)
        )
      `);

    if (siswa_nis) {
      query = query.eq('siswa_nis', siswa_nis);
    }
    if (tahun_ajaran) {
      query = query.eq('tahun_ajaran', tahun_ajaran);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }
    if (indikator_id) {
      query = query.eq('indikator_id', indikator_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get capaian error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create or update capaian (single or batch)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { batch, siswa_nis, indikator_id, tahun_ajaran, semester, nilai, deskripsi } = body;

    // Batch save
    if (batch && Array.isArray(batch)) {
      const results = [];
      const errors = [];

      for (const item of batch) {
        try {
          const { siswa_nis, indikator_id, tahun_ajaran, semester, nilai, deskripsi } = item;

          // Validate each item
          const validationErrors = validateCapaianForm({
            siswa_nis,
            indikator_id,
            tahun_ajaran,
            semester,
          });

          if (validationErrors.length > 0) {
            errors.push({
              item,
              error: formatValidationErrors(validationErrors),
            });
            continue;
          }

          // Upsert (insert or update if exists)
          const { data, error } = await supabase
            .from('rapor_capaian_siswa_keasramaan')
            .upsert(
              {
                siswa_nis,
                indikator_id,
                tahun_ajaran,
                semester,
                nilai: nilai || null,
                deskripsi: deskripsi || null,
                created_by: session.userId,
              },
              {
                onConflict: 'siswa_nis,indikator_id,tahun_ajaran,semester',
              }
            )
            .select()
            .single();

          if (error) {
            errors.push({ item, error: error.message });
          } else {
            results.push(data);
          }
        } catch (err: any) {
          errors.push({ item, error: err.message });
        }
      }

      return NextResponse.json({
        success: true,
        data: results,
        errors: errors.length > 0 ? errors : undefined,
        message: `Berhasil menyimpan ${results.length} dari ${batch.length} data`,
      });
    }

    // Single save - validate using validation utility
    const validationErrors = validateCapaianForm({
      siswa_nis,
      indikator_id,
      tahun_ajaran,
      semester,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

    // Verify indikator exists
    const { data: indikatorData, error: indikatorError } = await supabase
      .from('rapor_indikator_keasramaan')
      .select('id')
      .eq('id', indikator_id)
      .single();

    if (indikatorError || !indikatorData) {
      return NextResponse.json(
        { error: 'Indikator tidak ditemukan' },
        { status: 404 }
      );
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('rapor_capaian_siswa_keasramaan')
      .upsert(
        {
          siswa_nis,
          indikator_id,
          tahun_ajaran,
          semester,
          nilai: nilai || null,
          deskripsi: deskripsi || null,
          created_by: session.userId,
        },
        {
          onConflict: 'siswa_nis,indikator_id,tahun_ajaran,semester',
        }
      )
      .select(`
        *,
        rapor_indikator_keasramaan(
          id,
          nama_indikator,
          deskripsi,
          kategori_id,
          rapor_kategori_indikator_keasramaan(id, nama_kategori)
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create/update capaian error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete capaian
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID capaian harus diisi' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('rapor_capaian_siswa_keasramaan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Capaian berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete capaian error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
