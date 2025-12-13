import { NextResponse } from 'next/server';
import { testGoogleSlidesConnection } from '@/lib/googleSlides';

export async function GET() {
  try {
    const result = await testGoogleSlidesConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Google Slides API berhasil terhubung!',
        data: {
          presentationTitle: result.presentationTitle,
          slideCount: result.slideCount,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Gagal terhubung ke Google Slides API',
        error: result.message,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ Error: ' + error.message,
      error: error.toString(),
    }, { status: 500 });
  }
}
