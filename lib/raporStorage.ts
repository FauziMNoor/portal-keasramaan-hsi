import { supabase } from './supabase';

// =====================================================
// UPLOAD FOTO KEGIATAN
// =====================================================
export async function uploadFotoKegiatan(
  file: File,
  metadata: {
    cabang: string;
    tahun_ajaran: string;
    semester: string;
    kelas: string;
    asrama: string;
    urutan: number; // 1-6
    foto_ke: 1 | 2; // foto 1 atau 2
  }
) {
  try {
    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `kegiatan-${metadata.urutan}-foto-${metadata.foto_ke}.${fileExt}`;
    const filePath = `kegiatan/${metadata.cabang}/${metadata.tahun_ajaran}/${metadata.semester}/${metadata.kelas}/${metadata.asrama}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('rapor-kegiatan')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('rapor-kegiatan')
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Error uploading foto kegiatan:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// UPLOAD FOTO DOKUMENTASI
// =====================================================
export async function uploadFotoDokumentasi(
  file: File,
  metadata: {
    cabang: string;
    tahun_ajaran: string;
    semester: string;
    kelas: string;
    asrama: string;
  }
) {
  try {
    // Generate unique file name with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `dok-${timestamp}.${fileExt}`;
    const filePath = `dokumentasi/${metadata.cabang}/${metadata.tahun_ajaran}/${metadata.semester}/${metadata.kelas}/${metadata.asrama}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('rapor-kegiatan')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't replace, create new
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('rapor-kegiatan')
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Error uploading foto dokumentasi:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// DELETE FOTO
// =====================================================
export async function deleteFoto(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from('rapor-kegiatan')
      .remove([filePath]);

    if (error) throw error;

    return {
      success: true,
      message: 'Foto berhasil dihapus',
    };
  } catch (error: any) {
    console.error('Error deleting foto:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// UPLOAD PDF RAPOR
// =====================================================
export async function uploadPDFRapor(
  pdfBuffer: Buffer,
  metadata: {
    cabang: string;
    tahun_ajaran: string;
    semester: string;
    nis: string;
    nama_siswa: string;
  }
) {
  try {
    // Generate file path
    const fileName = `${metadata.nis}-${metadata.nama_siswa.replace(/\s+/g, '-')}.pdf`;
    const filePath = `${metadata.cabang}/${metadata.tahun_ajaran}/${metadata.semester}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('rapor-pdf')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true, // Replace if exists
      });

    if (error) throw error;

    // Get signed URL (private bucket, need signed URL)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('rapor-pdf')
      .createSignedUrl(filePath, 3600); // Valid for 1 hour

    if (urlError) throw urlError;

    return {
      success: true,
      path: data.path,
      url: urlData.signedUrl,
    };
  } catch (error: any) {
    console.error('Error uploading PDF rapor:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// GET SIGNED URL FOR PDF (untuk re-download)
// =====================================================
export async function getPDFSignedUrl(filePath: string, expiresIn: number = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from('rapor-pdf')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// LIST FILES IN FOLDER
// =====================================================
export async function listFotosInFolder(folderPath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('rapor-kegiatan')
      .list(folderPath);

    if (error) throw error;

    return {
      success: true,
      files: data,
    };
  } catch (error: any) {
    console.error('Error listing files:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// VALIDATE FILE
// =====================================================
export function validateImageFile(file: File) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Ukuran file maksimal 10MB',
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file harus JPEG, PNG, atau WebP',
    };
  }

  return {
    valid: true,
  };
}

// =====================================================
// HELPER: Extract path from URL
// =====================================================
export function extractPathFromUrl(url: string): string {
  // Extract path from Supabase public URL
  // Example: https://xxx.supabase.co/storage/v1/object/public/rapor-kegiatan/path/to/file.jpg
  // Returns: path/to/file.jpg
  const match = url.match(/\/rapor-kegiatan\/(.+)$/);
  return match ? match[1] : '';
}
