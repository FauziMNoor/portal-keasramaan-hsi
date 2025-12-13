import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleOAuth';

// Initiate OAuth flow
export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ success: true, authUrl });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
