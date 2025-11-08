import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateFileUpload } from '@/lib/rapor/validation';
import { uploadFileWithRetry } from '@/lib/rapor/upload-helpers';

// GET - List all photos for a kegiatan
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

    const { data, error } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .select('*')
      .eq('kegiatan_id', id)
      .order('urutan', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get foto error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Upload photo(s) to kegiatan
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

    // Verify kegiatan exists
    const { data: kegiatan, error: kegiatanError } = await supabase
      .from('kegiatan_asrama_keasramaan')
      .select('id')
      .eq('id', id)
      .single();

    if (kegiatanError || !kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const captions = formData.getAll('captions') as string[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    // Get current max urutan
    const { data: maxUrutanData } = await supabase
      .from('kegiatan_galeri_keasramaan')
      .select('urutan')
      .eq('kegiatan_id', id)
      .order('urutan', { ascending: false })
      .limit(1)
      .single();

    let currentUrutan = maxUrutanData?.urutan || 0;

    const uploadedPhotos = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || '';

      try {
        // Validate file using validation utility
        const validationResult = validateFileUpload(file);
        if (!validationResult.valid) {
          errors.push({ file: file.name, error: validationResult.error || 'File tidak valid' });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage with retry mechanism
        const uploadResult = await uploadFileWithRetry(file, 'kegiatan-galeri', fileName);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload gagal');
        }

        // Save to database
        currentUrutan++;
        const { data: fotoData, error: fotoError } = await supabase
          .from('kegiatan_galeri_keasramaan')
          .insert({
            kegiatan_id: id,
            foto_url: uploadResult.url,
            caption: caption || null,
            urutan: currentUrutan,
            uploaded_by: session.userId,
          })
          .select()
          .single();

        if (fotoError) throw fotoError;

        uploadedPhotos.push(fotoData);
      } catch (error: any) {
        console.error(`Upload error for ${file.name}:`, error);
        errors.push({ file: file.name, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload foto error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
