import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const perizinanId = formData.get('perizinan_id') as string;
    const uploadedBy = formData.get('uploaded_by') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!perizinanId) {
      return NextResponse.json(
        { error: 'ID Perizinan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${perizinanId}_${Date.now()}.${fileExt}`;

    // Upload ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bukti-formulir-keasramaan')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Gagal upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bukti-formulir-keasramaan')
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Update perizinan dengan URL bukti
    const { error: updateError } = await supabase
      .from('perizinan_kepulangan_keasramaan')
      .update({
        bukti_formulir_url: fileUrl,
        bukti_formulir_uploaded_at: new Date().toISOString(),
        bukti_formulir_uploaded_by: uploadedBy,
      })
      .eq('id', perizinanId);

    if (updateError) {
      console.error('Update error:', updateError);
      // Hapus file yang sudah diupload jika update gagal
      await supabase.storage
        .from('bukti-formulir-keasramaan')
        .remove([fileName]);

      return NextResponse.json(
        { error: 'Gagal update data perizinan: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'Bukti formulir berhasil diupload',
    });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}
