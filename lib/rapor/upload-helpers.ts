/**
 * Upload helpers with retry mechanism for Rapor module
 */

import { supabase } from '@/lib/supabase';

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Upload file to Supabase Storage with retry mechanism
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param path - File path in storage
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 */
export async function uploadFileWithRetry(
  file: File,
  bucket: string,
  path: string,
  maxRetries: number = 2
): Promise<UploadResult> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        lastError = uploadError;
        
        // If file already exists, try with a different name
        if (uploadError.message?.includes('already exists')) {
          const fileExt = file.name.split('.').pop();
          const newPath = `${path.split('.')[0]}-${Date.now()}.${fileExt}`;
          return uploadFileWithRetry(file, bucket, newPath, maxRetries - attempt);
        }
        
        // Retry on network or server errors
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Upload gagal setelah beberapa percobaan',
  };
}

/**
 * Delete file from Supabase Storage with retry
 */
export async function deleteFileWithRetry(
  bucket: string,
  path: string,
  maxRetries: number = 2
): Promise<{ success: boolean; error?: string }> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Delete gagal setelah beberapa percobaan',
  };
}
