import { NextResponse } from 'next/server';
import { testGoogleSlidesConnection } from '@/lib/googleSlides';

export async function GET() {
  try {
    console.log('Testing Google Slides connection...');
    const result = await testGoogleSlidesConnection();
    
    return NextResponse.json({
      ...result,
      env: {
        hasTemplateId: !!process.env.GOOGLE_SLIDES_TEMPLATE_ID,
        hasServiceEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        templateId: process.env.GOOGLE_SLIDES_TEMPLATE_ID?.substring(0, 20) + '...',
      }
    });
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
