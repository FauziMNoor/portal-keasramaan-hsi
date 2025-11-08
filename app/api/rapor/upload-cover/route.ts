import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateFileUpload } from '@/lib/rapor/validation';
import { uploadFileWithRetry } from '@/lib/rapor/upload-helpers';

// POST - Upload cover image to rapor-covers bucket
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'rapor-covers';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validate file
    const validationResult = validateFileUpload(file);
    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // Check file size (max 10MB for covers)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const uploadResult = await uploadFileWithRetry(file, bucket, fileName);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload gagal');
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: 'Cover image berhasil diupload',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload cover error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

