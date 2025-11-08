import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// PUT - Update foto caption or reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fotoId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fotoId } = await params;
    const body = await request.json();
    const { caption, urutan } = body;

    const updateData: any = {};
    
    if (caption !== undefined) {
      updateData.caption = caption;
    }
    
    if (urutan !== undefined) {
      updateData.urutan = urutan;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diupdate' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .update(updateData)
      .eq('id', fotoId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update foto error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Delete foto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fotoId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fotoId } = await params;

    // Get foto data first to delete from storage
    const { data: foto, error: getFotoError } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .select('foto_url')
      .eq('id', fotoId)
      .single();

    if (getFotoError) {
      if (getFotoError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
      }
      throw getFotoError;
    }

    // Extract file path from URL
    const url = new URL(foto.foto_url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'kegiatan-galeri');
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('kegiatan-galeri')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .delete()
      .eq('id', fotoId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Foto berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete foto error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PATCH - Batch reorder photos
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { photos } = body; // Array of { id, urutan }

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Data photos harus berupa array' },
        { status: 400 }
      );
    }

    // Update each photo's urutan
    const updates = photos.map(async (photo) => {
      return supabase
        .from('kegiatan_galeri_keasramaan')
        .update({ urutan: photo.urutan })
        .eq('id', photo.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Urutan foto berhasil diupdate' });
  } catch (error: any) {
    console.error('Batch reorder error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
