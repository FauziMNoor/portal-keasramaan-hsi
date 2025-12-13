import { google } from 'googleapis';
import { getAuthenticatedClients } from './googleOAuth';
import { insertImagesIntoSlides, prepareImagePlaceholders } from './slidesImageInserter';

// Initialize Google Slides API with OAuth tokens
export function getGoogleSlidesClientWithOAuth(accessToken: string, refreshToken?: string) {
  try {
    const { slides, drive, oauth2Client } = getAuthenticatedClients(accessToken, refreshToken);
    return { slides, drive, auth: oauth2Client };
  } catch (error) {
    console.error('Error initializing Google Slides client with OAuth:', error);
    throw error;
  }
}

// Legacy: Initialize Google Slides API with Service Account (deprecated)
export function getGoogleSlidesClient() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('Google credentials not found in environment variables');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    return { slides, drive, auth };
  } catch (error) {
    console.error('Error initializing Google Slides client:', error);
    throw error;
  }
}

// Test connection
export async function testGoogleSlidesConnection() {
  try {
    const { slides } = getGoogleSlidesClient();
    const templateId = process.env.GOOGLE_SLIDES_TEMPLATE_ID;

    if (!templateId) {
      throw new Error('Template ID not found');
    }

    const response = await slides.presentations.get({
      presentationId: templateId,
    });

    return {
      success: true,
      message: 'Connection successful!',
      presentationTitle: response.data.title,
      slideCount: response.data.slides?.length || 0,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
}

// Copy template and replace placeholders (with OAuth)
export async function generateRaporSlides(
  data: {
    santriData: any;
    habitData: any;
    kegiatanData: any;
    dokumentasiData?: any[];
    replacements: any;
  },
  accessToken?: string,
  refreshToken?: string,
  options?: {
    insertImages?: boolean;
  }
) {
  try {
    // Use OAuth if tokens provided, otherwise fallback to service account
    const { slides, drive } = accessToken 
      ? getGoogleSlidesClientWithOAuth(accessToken, refreshToken)
      : getGoogleSlidesClient();
    
    const templateId = process.env.GOOGLE_SLIDES_TEMPLATE_ID;

    if (!templateId) {
      throw new Error('Template ID not found');
    }

    // 1. Copy template to specified folder
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    console.log('📋 Copying template...');
    console.log('Template ID:', templateId);
    console.log('Target Folder ID:', folderId);
    
    let copyResponse;
    try {
      copyResponse = await drive.files.copy({
        fileId: templateId,
        supportsAllDrives: true,
        requestBody: {
          name: `Rapor - ${data.santriData.nama_siswa} - ${new Date().toISOString()}`,
          ...(folderId && { parents: [folderId] }), // Save to specified folder
        },
      });
      console.log('✅ Template copied successfully:', copyResponse.data.id);
    } catch (copyError: any) {
      console.error('❌ Copy failed:', copyError.message);
      console.error('Error code:', copyError.code);
      console.error('Error response:', copyError.response?.data);
      throw new Error(`Failed to copy template: ${copyError.message}`);
    }

    const newPresentationId = copyResponse.data.id;

    if (!newPresentationId) {
      throw new Error('Failed to copy template');
    }

    // 2. Prepare image placeholders FIRST (before text replacement)
    let imageInsertResult = null;
    const imagePlaceholders = options?.insertImages !== false
      ? prepareImagePlaceholders({
          santri: data.santriData,
          kegiatan: data.kegiatanData,
          dokumentasi: data.dokumentasiData || [],
        })
      : [];

    // List of image placeholder texts to EXCLUDE from text replacement
    const imagePlaceholderTexts = new Set(imagePlaceholders.map(p => p.placeholder));
    
    console.log('🖼️ Image placeholders to preserve:', Array.from(imagePlaceholderTexts));

    // 3. Prepare text replacement requests (EXCLUDING image placeholders)
    const requests: any[] = [];

    // Replace text placeholders (but NOT image placeholders)
    for (const [placeholder, value] of Object.entries(data.replacements)) {
      // Skip if this is an image placeholder
      if (imagePlaceholderTexts.has(placeholder)) {
        console.log(`⏭️ Skipping text replacement for image placeholder: ${placeholder}`);
        continue;
      }
      
      requests.push({
        replaceAllText: {
          containsText: {
            text: placeholder,
            matchCase: true,
          },
          replaceText: String(value),
        },
      });
    }

    // 4. Execute batch update for text replacements
    if (requests.length > 0) {
      console.log(`📝 Replacing ${requests.length} text placeholders (excluding ${imagePlaceholderTexts.size} image placeholders)...`);
      await slides.presentations.batchUpdate({
        presentationId: newPresentationId,
        requestBody: {
          requests,
        },
      });
      console.log('✅ Text placeholders replaced');
    }

    // 5. Insert images (AFTER text replacement, but placeholders still exist)
    if (imagePlaceholders.length > 0) {
      console.log(`🖼️ Starting image insertion for ${imagePlaceholders.length} images...`);
      
      imageInsertResult = await insertImagesIntoSlides(
        slides,
        drive,
        newPresentationId,
        imagePlaceholders,
        folderId
      );

      if (imageInsertResult.success) {
        console.log(`✅ Images inserted: ${imageInsertResult.insertedCount}/${imagePlaceholders.length}`);
        if (imageInsertResult.errors.length > 0) {
          console.warn('⚠️ Some images failed:', imageInsertResult.errors);
        }
      } else {
        console.error('❌ Image insertion failed:', imageInsertResult.errors);
      }
    } else {
      console.log('⚠️ No images to insert');
    }

    return {
      success: true,
      presentationId: newPresentationId,
      url: `https://docs.google.com/presentation/d/${newPresentationId}/edit`,
      imageInsertResult,
    };
  } catch (error: any) {
    console.error('Error generating rapor:', error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
}

// Export presentation to PDF (with OAuth)
export async function exportToPDF(presentationId: string, accessToken?: string, refreshToken?: string) {
  try {
    const { drive } = accessToken
      ? getGoogleSlidesClientWithOAuth(accessToken, refreshToken)
      : getGoogleSlidesClient();

    const response = await drive.files.export(
      {
        fileId: presentationId,
        mimeType: 'application/pdf',
      },
      { responseType: 'arraybuffer' }
    );

    return {
      success: true,
      pdfBuffer: Buffer.from(response.data as ArrayBuffer),
    };
  } catch (error: any) {
    console.error('Error exporting to PDF:', error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
}
