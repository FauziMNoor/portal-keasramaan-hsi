/**
 * Download image from URL and return as Buffer
 */
export async function downloadImage(imageUrl: string): Promise<Buffer> {
  try {
    console.log('📥 Downloading image from:', imageUrl);
    
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('✅ Image downloaded, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error: any) {
    console.error('❌ Error downloading image:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Upload image to Google Drive and return file ID
 */
export async function uploadImageToDrive(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string,
  drive: any,
  folderId?: string
): Promise<string> {
  try {
    console.log('☁️ Uploading image to Drive:', fileName);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        ...(folderId && { parents: [folderId] }),
      },
      media: {
        mimeType: mimeType,
        body: imageBuffer,
      },
      fields: 'id',
    });

    const fileId = response.data.id;
    console.log('✅ Image uploaded to Drive, ID:', fileId);

    // Make file publicly readable (required for Slides to access)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('✅ Image permission set to public');
    return fileId;
  } catch (error: any) {
    console.error('❌ Error uploading image to Drive:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Get image dimensions from buffer
 */
export function getImageDimensions(imageBuffer: Buffer): { width: number; height: number } {
  // For simplicity, we'll use default dimensions
  // In production, you might want to use a library like 'sharp' or 'image-size'
  return {
    width: 1920,
    height: 1080,
  };
}

/**
 * Calculate scaled dimensions to fit within max bounds while maintaining aspect ratio
 */
export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  return { width, height };
}

/**
 * Convert EMU (English Metric Units) to points
 * 1 point = 12700 EMU
 */
export function pointsToEMU(points: number): number {
  return points * 12700;
}

/**
 * Get MIME type from URL or filename
 */
export function getMimeTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };

  return mimeTypes[extension || ''] || 'image/jpeg';
}
