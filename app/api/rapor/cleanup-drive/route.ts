import { NextResponse } from 'next/server';
import { getGoogleSlidesClient } from '@/lib/googleSlides';

// DISABLED FOR SAFETY - Use GET to list files first
export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'DELETE endpoint disabled for safety. Use GET to list files first, then delete manually.',
  }, { status: 403 });
}

// GET endpoint to list files without deleting
export async function GET() {
  try {
    const { drive } = getGoogleSlidesClient();

    const response = await drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, size)',
      q: "trashed=false",
    });

    const files = response.data.files || [];
    const templateId = process.env.GOOGLE_SLIDES_TEMPLATE_ID;

    return NextResponse.json({
      success: true,
      total: files.length,
      templateId,
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.mimeType,
        created: f.createdTime,
        size: f.size,
        isTemplate: f.id === templateId,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
