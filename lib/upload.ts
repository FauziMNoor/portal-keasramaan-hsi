import { supabase } from './supabase';

/**
 * Upload foto ke Supabase Storage
 * @param file - File yang akan diupload
 * @param folder - Folder tujuan (default: 'users')
 * @returns Path file di storage atau null jika gagal
 */
export async function uploadPhoto(
  file: File,
  folder: string = 'users'
): Promise<string | null> {
  try {
    // Validasi file
    if (!file.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar');
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 2MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    return data.path;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Hapus foto dari Supabase Storage
 * @param path - Path file di storage
 */
export async function deletePhoto(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('user-photos')
      .remove([path]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Delete photo error:', error);
    throw error;
  }
}

/**
 * Get public URL untuk foto
 * @param path - Path file di storage
 * @returns Public URL atau null
 */
export function getPhotoUrl(path: string | null): string | null {
  if (!path) return null;

  // Jika sudah URL lengkap, return as is
  if (path.startsWith('http')) return path;

  // Get public URL dari Supabase
  const { data } = supabase.storage
    .from('user-photos')
    .getPublicUrl(path);

  return data.publicUrl;
}
