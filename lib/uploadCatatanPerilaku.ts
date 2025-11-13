/**
 * Upload Utility untuk Catatan Perilaku
 * Menangani upload, get URL, dan delete foto kegiatan
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'catatan-perilaku-keasramaan';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Upload foto kegiatan ke Supabase Storage
 * @param file - File foto yang akan diupload
 * @param tipe - Tipe catatan ('pelanggaran' atau 'kebaikan')
 * @returns Path foto di storage
 */
export async function uploadCatatanPerilakuPhoto(
  file: File,
  tipe: 'pelanggaran' | 'kebaikan'
): Promise<string> {
  // Validasi file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.');
  }

  // Validasi file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }

  try {
    // Generate path dengan format: YYYY/MM/tipe/timestamp-random.ext
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    const filename = `${timestamp}-${random}.${ext}`;
    const path = `${year}/${month}/${tipe}/${filename}`;

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600', // Cache 1 jam
        upsert: false, // Jangan overwrite file yang sudah ada
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Gagal upload foto: ${error.message}`);
    }

    return path;
  } catch (error: any) {
    console.error('Upload catatan perilaku photo error:', error);
    throw error;
  }
}

/**
 * Upload multiple photos sekaligus
 * @param files - Array of files
 * @param tipe - Tipe catatan
 * @returns Array of paths
 */
export async function uploadMultipleCatatanPerilakuPhotos(
  files: File[],
  tipe: 'pelanggaran' | 'kebaikan'
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadCatatanPerilakuPhoto(file, tipe));
  return Promise.all(uploadPromises);
}

/**
 * Get public URL dari foto kegiatan
 * @param path - Path foto di storage
 * @returns Public URL
 */
export function getCatatanPerilakuPhotoUrl(path: string): string {
  if (!path) return '';
  
  // Jika sudah full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get multiple photo URLs
 * @param paths - Array of paths
 * @returns Array of URLs
 */
export function getMultipleCatatanPerilakuPhotoUrls(paths: string[]): string[] {
  return paths.map(path => getCatatanPerilakuPhotoUrl(path));
}

/**
 * Delete foto kegiatan dari storage
 * @param path - Path foto yang akan dihapus
 */
export async function deleteCatatanPerilakuPhoto(path: string): Promise<void> {
  if (!path) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Gagal hapus foto: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Delete catatan perilaku photo error:', error);
    throw error;
  }
}

/**
 * Delete multiple photos sekaligus
 * @param paths - Array of paths to delete
 */
export async function deleteMultipleCatatanPerilakuPhotos(paths: string[]): Promise<void> {
  if (!paths || paths.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('Delete multiple error:', error);
      throw new Error(`Gagal hapus foto: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Delete multiple catatan perilaku photos error:', error);
    throw error;
  }
}

/**
 * Validasi file sebelum upload (client-side)
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function validateCatatanPerilakuPhoto(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }

  return null;
}

/**
 * Generate preview URL dari File object
 * @param file - File object
 * @returns Preview URL (blob URL)
 */
export function generatePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Revoke preview URL untuk free memory
 * @param url - Preview URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Constants export
 */
export const CATATAN_PERILAKU_UPLOAD_CONFIG = {
  BUCKET_NAME,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE / 1024 / 1024,
  ALLOWED_TYPES,
  MAX_PHOTOS: 3,
};
