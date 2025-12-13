import { google } from 'googleapis';
import {
  downloadImage,
  uploadImageToDrive,
  getMimeTypeFromUrl,
  pointsToEMU,
  calculateScaledDimensions,
} from './imageHelper';

interface ImagePlaceholder {
  placeholder: string;
  imageUrl: string;
  pageObjectId?: string;
  elementId?: string;
}

interface PlaceholderPosition {
  pageObjectId: string;
  elementId: string;
  transform: {
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
    unit: string;
  };
  size: {
    width: { magnitude: number; unit: string };
    height: { magnitude: number; unit: string };
  };
}

/**
 * Find all text placeholders in the presentation and their positions
 */
export async function findPlaceholderPositions(
  slides: any,
  presentationId: string,
  placeholders: string[]
): Promise<Map<string, PlaceholderPosition>> {
  try {
    console.log('🔍 Finding placeholder positions...');
    
    const presentation = await slides.presentations.get({
      presentationId,
    });

    const placeholderMap = new Map<string, PlaceholderPosition>();

    // Iterate through all slides
    for (const slide of presentation.data.slides || []) {
      const pageObjectId = slide.objectId;

      // Iterate through all page elements
      for (const element of slide.pageElements || []) {
        // Check if element is a shape with text
        if (element.shape && element.shape.text) {
          const textElements = element.shape.text.textElements || [];
          
          // Check if any text element contains our placeholder
          for (const textElement of textElements) {
            const textContent = textElement.textRun?.content || '';
            
            // Check if this text matches any of our placeholders
            for (const placeholder of placeholders) {
              if (textContent.includes(placeholder)) {
                console.log(`✅ Found placeholder: ${placeholder} on slide ${pageObjectId}`);
                
                placeholderMap.set(placeholder, {
                  pageObjectId,
                  elementId: element.objectId!,
                  transform: element.transform || {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: 0,
                    translateY: 0,
                    unit: 'EMU',
                  },
                  size: element.size || {
                    width: { magnitude: 3000000, unit: 'EMU' },
                    height: { magnitude: 2000000, unit: 'EMU' },
                  },
                });
                break;
              }
            }
          }
        }
      }
    }

    console.log(`✅ Found ${placeholderMap.size} placeholder positions`);
    return placeholderMap;
  } catch (error: any) {
    console.error('❌ Error finding placeholder positions:', error.message);
    throw error;
  }
}

/**
 * Insert images into Google Slides by replacing text placeholders
 */
export async function insertImagesIntoSlides(
  slides: any,
  drive: any,
  presentationId: string,
  imagePlaceholders: ImagePlaceholder[],
  folderId?: string
): Promise<{ success: boolean; insertedCount: number; errors: string[] }> {
  try {
    console.log(`🖼️ Starting image insertion for ${imagePlaceholders.length} images...`);
    
    const errors: string[] = [];
    let insertedCount = 0;

    // Find positions of all placeholders
    const placeholderPositions = await findPlaceholderPositions(
      slides,
      presentationId,
      imagePlaceholders.map(p => p.placeholder)
    );

    // Prepare batch requests
    const requests: any[] = [];

    for (const imagePlaceholder of imagePlaceholders) {
      try {
        const { placeholder, imageUrl } = imagePlaceholder;

        if (!imageUrl || imageUrl === '' || imageUrl === '-') {
          console.log(`⚠️ Skipping empty image URL for ${placeholder}`);
          continue;
        }

        // Get placeholder position
        const position = placeholderPositions.get(placeholder);
        if (!position) {
          console.warn(`⚠️ Placeholder position not found for: ${placeholder}`);
          errors.push(`Position not found: ${placeholder}`);
          continue;
        }

        console.log(`📥 Processing image for ${placeholder}...`);
        console.log(`   Image URL: ${imageUrl}`);

        // Calculate image size and position
        const width = position.size.width.magnitude;
        const height = position.size.height.magnitude;
        const translateX = position.transform.translateX;
        const translateY = position.transform.translateY;

        console.log(`   Position: x=${translateX}, y=${translateY}`);
        console.log(`   Size: ${width} x ${height} EMU`);

        // Create unique object ID for the image
        const imageObjectId = `image_${placeholder.replace(/[<>]/g, '')}_${Date.now()}`;

        // Add request to create image using direct URL
        // Google Slides API can fetch from public URLs directly
        requests.push({
          createImage: {
            url: imageUrl, // Use direct Supabase public URL
            elementProperties: {
              pageObjectId: position.pageObjectId,
              size: {
                width: { magnitude: width, unit: 'EMU' },
                height: { magnitude: height, unit: 'EMU' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: translateX,
                translateY: translateY,
                unit: 'EMU',
              },
            },
          },
        });

        // Add request to delete the text placeholder AFTER creating image
        requests.push({
          deleteObject: {
            objectId: position.elementId,
          },
        });

        insertedCount++;
        console.log(`✅ Prepared image insertion for ${placeholder}`);
      } catch (error: any) {
        console.error(`❌ Error processing ${imagePlaceholder.placeholder}:`, error.message);
        errors.push(`${imagePlaceholder.placeholder}: ${error.message}`);
      }
    }

    // Execute batch update if there are requests
    if (requests.length > 0) {
      console.log(`🔄 Executing batch update with ${requests.length} requests...`);
      
      try {
        await slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests,
          },
        });
        console.log(`✅ Batch update completed successfully`);
      } catch (batchError: any) {
        console.error('❌ Batch update failed:', batchError.message);
        throw new Error(`Batch update failed: ${batchError.message}`);
      }
    } else {
      console.log('⚠️ No images to insert');
    }

    return {
      success: true,
      insertedCount,
      errors,
    };
  } catch (error: any) {
    console.error('❌ Error inserting images:', error.message);
    return {
      success: false,
      insertedCount: 0,
      errors: [error.message],
    };
  }
}

/**
 * Convert relative path to full public URL
 */
function getFullImageUrl(path: string | null, bucket: string): string | null {
  if (!path) return null;
  
  // If already full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Manually construct public URL (more reliable for server-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sirriyah.smaithsi.sch.id';
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  
  console.log(`🔄 Converting: ${path} → ${publicUrl}`);
  return publicUrl;
}

/**
 * Helper function to prepare image placeholders from rapor data
 */
export function prepareImagePlaceholders(data: {
  santri: any;
  kegiatan: any[];
  dokumentasi: any[];
}): ImagePlaceholder[] {
  const placeholders: ImagePlaceholder[] = [];

  // Foto Santri - Convert to full URL
  if (data.santri?.foto) {
    console.log('📸 Processing foto santri:', data.santri.foto);
    const fotoUrl = getFullImageUrl(data.santri.foto, 'foto-siswa');
    console.log('🔄 Converted to:', fotoUrl);
    
    if (fotoUrl) {
      placeholders.push({
        placeholder: '<<Foto Santri>>',
        imageUrl: fotoUrl,
      });
      console.log('✅ Added foto santri to placeholders');
    } else {
      console.warn('⚠️ Foto URL is null after conversion');
    }
  } else {
    console.warn('⚠️ No foto found for santri');
  }

  // Kegiatan (6 kegiatan x 2 foto) - Convert to full URLs
  for (let i = 1; i <= 6; i++) {
    const kegiatan = data.kegiatan.find((k: any) => k.urutan === i);
    
    if (kegiatan?.foto_1) {
      const foto1Url = getFullImageUrl(kegiatan.foto_1, 'kegiatan-rapor');
      if (foto1Url) {
        placeholders.push({
          placeholder: `<<Foto Kegiatan ${i}a>>`,
          imageUrl: foto1Url,
        });
      }
    }
    
    if (kegiatan?.foto_2) {
      const foto2Url = getFullImageUrl(kegiatan.foto_2, 'kegiatan-rapor');
      if (foto2Url) {
        placeholders.push({
          placeholder: `<<Foto Kegiatan ${i}b>>`,
          imageUrl: foto2Url,
        });
      }
    }
  }

  // Dokumentasi Program Lainnya - Convert to full URL
  if (data.dokumentasi && data.dokumentasi.length > 0) {
    // For now, we'll use the first dokumentasi image
    // You might want to handle multiple images differently
    const firstDok = data.dokumentasi[0];
    if (firstDok?.foto || firstDok?.foto_url) {
      const fotoPath = firstDok.foto || firstDok.foto_url;
      const dokumentasiUrl = getFullImageUrl(fotoPath, 'dokumentasi-rapor');
      if (dokumentasiUrl) {
        placeholders.push({
          placeholder: '<<Dokumentasi Program Lainnya>>',
          imageUrl: dokumentasiUrl,
        });
      }
    }
  }

  console.log(`📋 Prepared ${placeholders.length} image placeholders`);
  return placeholders;
}
