import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// GET - List all pages for a template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    // Get all pages for this template
    const { data, error } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('urutan', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get template pages error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Add new page to template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      tipe_halaman,
      ukuran_kertas,
      orientasi,
      config,
      urutan,
    } = body;

    // Validation
    if (!tipe_halaman) {
      return NextResponse.json(
        { error: 'Tipe halaman harus diisi' },
        { status: 400 }
      );
    }

    // Validate tipe_halaman
    const validTypes = ['static_cover', 'dynamic_data', 'galeri_kegiatan', 'qr_code'];
    if (!validTypes.includes(tipe_halaman)) {
      return NextResponse.json(
        { error: 'Tipe halaman tidak valid' },
        { status: 400 }
      );
    }

    // Validate ukuran_kertas if provided
    if (ukuran_kertas) {
      const validSizes = ['A5', 'A4', 'Letter', 'F4'];
      if (!validSizes.includes(ukuran_kertas)) {
        return NextResponse.json(
          { error: 'Ukuran kertas tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validate orientasi if provided
    if (orientasi) {
      const validOrientations = ['portrait', 'landscape'];
      if (!validOrientations.includes(orientasi)) {
        return NextResponse.json(
          { error: 'Orientasi tidak valid' },
          { status: 400 }
        );
      }
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    // Get current max urutan if urutan not provided
    let finalUrutan = urutan;
    if (finalUrutan === undefined) {
      const { data: maxPage } = await supabase
        .from('rapor_template_page_keasramaan')
        .select('urutan')
        .eq('template_id', id)
        .order('urutan', { ascending: false })
        .limit(1)
        .single();

      finalUrutan = maxPage ? maxPage.urutan + 1 : 1;
    }

    const { data, error } = await supabase
      .from('rapor_template_page_keasramaan')
      .insert({
        template_id: id,
        tipe_halaman,
        ukuran_kertas: ukuran_kertas || null,
        orientasi: orientasi || null,
        config: config || {},
        urutan: finalUrutan,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create template page error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
