import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/googleOAuth';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/rapor/generate?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/rapor/generate?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const result = await getTokensFromCode(code);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/rapor/generate?error=${encodeURIComponent(result.error || 'token_exchange_failed')}`, request.url)
      );
    }

    // Get user ID from session cookie or state parameter
    // For now, we'll use a simple approach: store in session or use email
    const cookies = request.cookies;
    const sessionCookie = cookies.get('sb-access-token') || cookies.get('supabase-auth-token');
    
    console.log('Session cookie:', sessionCookie?.value?.substring(0, 20) + '...');
    
    // Try to get user from session
    let userId: string | null = null;
    
    // Option 1: Get from URL state parameter (we need to pass this)
    const state = searchParams.get('state');
    console.log('State parameter:', state);
    
    // Option 2: Get from session storage (need to implement)
    // For now, let's use a workaround: save with email as identifier
    
    // Temporary solution: Save tokens with a placeholder and let user claim it later
    // Or better: use session storage
    
    console.log('Tokens received:', {
      access_token: result.tokens.access_token?.substring(0, 20) + '...',
      refresh_token: result.tokens.refresh_token?.substring(0, 20) + '...',
      expiry: result.tokens.expiry_date
    });
    
    // Save to session storage temporarily
    const tokenData = {
      access_token: result.tokens.access_token,
      refresh_token: result.tokens.refresh_token,
      expiry_date: result.tokens.expiry_date,
    };
    
    // Encode tokens to pass via URL (not ideal but works for now)
    const encodedTokens = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Redirect back to generate page with tokens
    return NextResponse.redirect(
      new URL(`/rapor/generate?oauth=success&tokens=${encodedTokens}`, request.url)
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/rapor/generate?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
