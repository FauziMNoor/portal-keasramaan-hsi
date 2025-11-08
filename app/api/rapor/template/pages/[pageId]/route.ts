import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// GET - Get single page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = await params;

    const { data, error } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get page error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = await params;
    const body = await request.json();
    const {
      tipe_halaman,
      ukuran_kertas,
      orientasi,
      config,
      urutan,
    } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (tipe_halaman !== undefined) {
      const validTypes = ['static_cover', 'dynamic_data', 'galeri_kegiatan', 'qr_code'];
      if (!validTypes.includes(tipe_halaman)) {
        return NextResponse.json(
          { error: 'Tipe halaman tidak valid' },
          { status: 400 }
        );
      }
      updateData.tipe_halaman = tipe_halaman;
    }

    if (ukuran_kertas !== undefined) {
      if (ukuran_kertas !== null) {
        const validSizes = ['A5', 'A4', 'Letter', 'F4'];
        if (!validSizes.includes(ukuran_kertas)) {
          return NextResponse.json(
            { error: 'Ukuran kertas tidak valid' },
            { status: 400 }
          );
        }
      }
      updateData.ukuran_kertas = ukuran_kertas;
    }

    if (orientasi !== undefined) {
      if (orientasi !== null) {
        const validOrientations = ['portrait', 'landscape'];
        if (!validOrientations.includes(orientasi)) {
          return NextResponse.json(
            { error: 'Orientasi tidak valid' },
            { status: 400 }
          );
        }
      }
      updateData.orientasi = orientasi;
    }

    if (config !== undefined) updateData.config = config;
    if (urutan !== undefined) updateData.urutan = urutan;

    const { data, error } = await supabase
      .from('rapor_template_page_keasramaan')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update page error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = await params;

    // Get page info before deleting
    const { data: page, error: pageError } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('template_id, urutan')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    // Delete page
    const { error } = await supabase
      .from('rapor_template_page_keasramaan')
      .delete()
      .eq('id', pageId);

    if (error) throw error;

    // Reorder remaining pages
    const { data: remainingPages } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('id, urutan')
      .eq('template_id', page.template_id)
      .gt('urutan', page.urutan)
      .order('urutan', { ascending: true });

    if (remainingPages && remainingPages.length > 0) {
      for (const remainingPage of remainingPages) {
        await supabase
          .from('rapor_template_page_keasramaan')
          .update({ urutan: remainingPage.urutan - 1 })
          .eq('id', remainingPage.id);
      }
    }

    return NextResponse.json({ success: true, message: 'Halaman berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PATCH - Reorder pages
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = await params;
    const body = await request.json();
    const { new_urutan } = body;

    if (new_urutan === undefined || new_urutan < 1) {
      return NextResponse.json(
        { error: 'Urutan baru harus diisi dan minimal 1' },
        { status: 400 }
      );
    }

    // Get current page info
    const { data: currentPage, error: pageError } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('template_id, urutan')
      .eq('id', pageId)
      .single();

    if (pageError || !currentPage) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    const oldUrutan = currentPage.urutan;
    const newUrutan = new_urutan;

    if (oldUrutan === newUrutan) {
      return NextResponse.json({ success: true, message: 'Urutan tidak berubah' });
    }

    // Get all pages in template
    const { data: allPages } = await supabase
      .from('rapor_template_page_keasramaan')
      .select('id, urutan')
      .eq('template_id', currentPage.template_id)
      .order('urutan', { ascending: true });

    if (!allPages) {
      throw new Error('Gagal mengambil daftar halaman');
    }

    // Reorder logic
    if (newUrutan > oldUrutan) {
      // Moving down: shift pages between old and new position up
      for (const page of allPages) {
        if (page.urutan > oldUrutan && page.urutan <= newUrutan) {
          await supabase
            .from('rapor_template_page_keasramaan')
            .update({ urutan: page.urutan - 1 })
            .eq('id', page.id);
        }
      }
    } else {
      // Moving up: shift pages between new and old position down
      for (const page of allPages) {
        if (page.urutan >= newUrutan && page.urutan < oldUrutan) {
          await supabase
            .from('rapor_template_page_keasramaan')
            .update({ urutan: page.urutan + 1 })
            .eq('id', page.id);
        }
      }
    }

    // Update current page to new position
    const { data, error } = await supabase
      .from('rapor_template_page_keasramaan')
      .update({ urutan: newUrutan })
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Reorder page error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
