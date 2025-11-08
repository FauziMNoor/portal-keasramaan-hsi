/**
 * Image Handler for PDF Generation
 * 
 * This utility handles image downloading, conversion to base64, and optimization for PDF embedding.
 * Includes error handling, retry logic, caching, and fallback mechanisms for failed image loads.
 */

import { imageCache } from './image-cache';

/**
 * Download image from URL and convert to base64 with retry logic
 * 
 * @param imageUrl - URL of the image to download
 * @param options - Options for image processing
 * @returns Base64 encoded image string or null if failed
 */
export async function downloadImageAsBase64(
  imageUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    timeout?: number;
    retries?: number;
    useCache?: boolean;
  } = {}
): Promise<{ success: boolean; data?: string; error?: string; mimeType?: string }> {
  const { 
    maxWidth = 2000, 
    maxHeight = 2000, 
    quality = 0.85, 
    timeout = 10000,
    retries = 3,
    useCache = true,
  } = options;

  // Check cache first
  if (useCache) {
    const cached = imageCache.get(imageUrl);
    if (cached) {
      return {
        success: true,
        data: cached,
        mimeType: 'image/jpeg', // Cached images are always JPEG
      };
    }
  }

  // Retry logic
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Validate URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        return { success: false, error: 'Invalid image URL' };
      }

      // Handle relative URLs (Supabase storage)
      let fullUrl = imageUrl;
      if (imageUrl.startsWith('/')) {
        fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${imageUrl}`;
      }

      // Fetch image with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get blob and validate it's an image
      const blob = await response.blob();
      
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid content type: ${blob.type}`);
      }

      // Optimize image if needed
      const optimizedBlob = await optimizeImage(blob, { maxWidth, maxHeight, quality });

      // Convert to base64
      const base64 = await blobToBase64(optimizedBlob);

      // Cache the result
      if (useCache) {
        imageCache.set(imageUrl, base64);
      }

      return {
        success: true,
        data: base64,
        mimeType: optimizedBlob.type,
      };
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || error.message.includes('404')) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // All retries failed
  console.error('Error downloading image after retries:', lastError);
  
  if (lastError?.name === 'AbortError') {
    return { success: false, error: 'Image download timeout' };
  }
  
  return {
    success: false,
    error: lastError?.message || 'Unknown error',
  };
}

/**
 * Optimize image by resizing and compressing
 * 
 * @param blob - Image blob to optimize
 * @param options - Optimization options
 * @returns Optimized image blob
 */
async function optimizeImage(
  blob: Blob,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  }
): Promise<Blob> {
  const { maxWidth, maxHeight, quality } = options;

  // Check if optimization is needed
  if (blob.size < 500000) {
    // Image is already small enough (< 500KB)
    return blob;
  }

  try {
    // Create image element
    const img = await createImageFromBlob(blob);

    // Check if resizing is needed
    if (img.width <= maxWidth && img.height <= maxHeight) {
      return blob; // No resizing needed
    }

    // Calculate new dimensions maintaining aspect ratio
    let newWidth = img.width;
    let newHeight = img.height;

    if (img.width > maxWidth) {
      newWidth = maxWidth;
      newHeight = (img.height * maxWidth) / img.width;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (img.width * maxHeight) / img.height;
    }

    // Create canvas and resize
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return blob; // Fallback to original if canvas fails
    }

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert to blob with compression
    return new Promise((resolve) => {
      canvas.toBlob(
        (optimizedBlob) => {
          if (optimizedBlob && optimizedBlob.size < blob.size) {
            resolve(optimizedBlob);
          } else {
            resolve(blob); // Use original if optimization didn't help
          }
        },
        'image/jpeg',
        quality
      );
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    return blob; // Return original on error
  }
}

/**
 * Create an Image element from a blob
 */
function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Download multiple images in parallel with concurrency limit and retry logic
 * 
 * @param imageUrls - Array of image URLs to download
 * @param options - Options for image processing
 * @returns Array of results (success/failure for each image)
 */
export async function downloadMultipleImages(
  imageUrls: string[],
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    timeout?: number;
    concurrency?: number;
    retries?: number;
    useCache?: boolean;
  } = {}
): Promise<Array<{ url: string; success: boolean; data?: string; error?: string; mimeType?: string }>> {
  const { concurrency = 5, ...imageOptions } = options;

  const results: Array<{
    url: string;
    success: boolean;
    data?: string;
    error?: string;
    mimeType?: string;
  }> = [];

  // Process images in batches to limit concurrency
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await downloadImageAsBase64(url, imageOptions);
        return { url, ...result };
      })
    );

    results.push(...batchResults);
  }

  return results;
}

/**
 * Get fallback image as base64 (placeholder for failed images)
 * 
 * @param width - Width of placeholder
 * @param height - Height of placeholder
 * @param text - Text to display on placeholder
 * @returns Base64 encoded placeholder image
 */
export function getFallbackImageBase64(
  width: number = 200,
  height: number = 200,
  text: string = 'Gambar tidak tersedia'
): string {
  // Create canvas for placeholder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return ''; // Return empty if canvas fails
  }

  // Draw background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Draw border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);

  // Draw text
  ctx.fillStyle = '#999999';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Convert to base64
  return canvas.toDataURL('image/png');
}

/**
 * Validate if a URL is a valid image URL
 * 
 * @param url - URL to validate
 * @returns True if URL appears to be a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
  if (imageExtensions.test(url)) {
    return true;
  }

  // Check if it's a Supabase storage URL
  if (url.includes('supabase') && url.includes('storage')) {
    return true;
  }

  // Check if it's a data URL
  if (url.startsWith('data:image/')) {
    return true;
  }

  return false;
}

/**
 * Extract image format from URL or data URL
 * 
 * @param url - Image URL or data URL
 * @returns Image format (jpeg, png, etc.) or null
 */
export function getImageFormat(url: string): string | null {
  if (!url) return null;

  // Check data URL
  if (url.startsWith('data:image/')) {
    const match = url.match(/data:image\/([^;]+)/);
    return match ? match[1] : null;
  }

  // Check file extension
  const match = url.match(/\.([a-z]+)(?:\?|$)/i);
  if (match) {
    const ext = match[1].toLowerCase();
    // Normalize format names
    if (ext === 'jpg') return 'jpeg';
    return ext;
  }

  return null;
}

/**
 * Resize image to fit within bounds while maintaining aspect ratio
 * 
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns New dimensions {width, height}
 */
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too wide
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  // Scale down if too tall
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Check if image needs optimization based on size
 * 
 * @param blob - Image blob
 * @param maxSize - Maximum size in bytes (default 1MB)
 * @returns True if optimization is recommended
 */
export function needsOptimization(blob: Blob, maxSize: number = 1048576): boolean {
  return blob.size > maxSize;
}

/**
 * Get image dimensions from blob
 * 
 * @param blob - Image blob
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  try {
    const img = await createImageFromBlob(blob);
    return {
      width: img.width,
      height: img.height,
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
}
