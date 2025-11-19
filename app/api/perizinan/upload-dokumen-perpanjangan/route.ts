import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const perizinan_id = formData.get('perizinan_id') as string;
    const uploaded_by = formData.get('uploaded_by') as string;
    const tipe_dokumen = formData.get('tipe_dokumen') as string;
    const nama_dokumen = formData.get('nama_dokumen') as string;
    const deskripsi = formData.get('deskripsi') as string;

    if (!file || !perizinan_id || !uploaded_by) {
      return NextResponse.json(
        { error: 'File, perizinan_id, dan uploaded_by harus diisi' },
        { status: 400 }
      );
    }

    // Upload file ke storage
    const fileName = `dokumen-perpanjangan-${perizinan_id}-${Date.now()}.${file.name.split('.').pop()}`;
    const buffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dokumen-perpanjangan')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('dokumen-perpanjangan')
      .getPublicUrl(fileName);

    // Insert ke tabel dokumen_perpanjangan_keasramaan
    const { data: dokumenData, error: dokumenError } = await supabase
      .from('dokumen_perpanjangan_keasramaan')
      .insert({
        perizinan_id,
        nama_dokumen: nama_dokumen || file.name,
        tipe_dokumen,
        deskripsi,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_by,
      })
      .select()
      .single();

    if (dokumenError) {
      throw new Error(`Database error: ${dokumenError.message}`);
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      dokumen: dokumenData,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal upload dokumen' },
      { status: 500 }
    );
  }
}
