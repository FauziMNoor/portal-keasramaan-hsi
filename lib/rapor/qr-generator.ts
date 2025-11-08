import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export interface QRTokenData {
  token: string;
  siswa_nis: string;
  tahun_ajaran: string;
  semester: string;
  expires_at?: Date;
}

/**
 * Generate a cryptographically secure token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(
  url: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  const qrOptions = { ...defaultOptions, ...options };

  try {
    const dataUrl = await QRCode.toDataURL(url, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for server-side use)
 */
export async function generateQRCodeBuffer(
  url: string,
  options?: {
    width?: number;
    margin?: number;
  }
): Promise<Buffer> {
  const defaultOptions = {
    width: 300,
    margin: 2,
  };

  const qrOptions = { ...defaultOptions, ...options };

  try {
    const buffer = await QRCode.toBuffer(url, qrOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Create or get existing token for siswa
 */
export async function getOrCreateToken(
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  expiresInDays?: number
): Promise<string> {
  // Check if token already exists for this siswa and periode
  const { data: existingToken, error: fetchError } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .select('token, expires_at')
    .eq('siswa_nis', siswa_nis)
    .eq('tahun_ajaran', tahun_ajaran)
    .eq('semester', semester)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected
    console.error('Error fetching token:', fetchError);
    throw new Error('Failed to fetch token');
  }

  // If token exists and is not expired, return it
  if (existingToken) {
    if (!existingToken.expires_at || new Date(existingToken.expires_at) > new Date()) {
      return existingToken.token;
    }
    // Token expired, delete it
    await supabase
      .from('rapor_galeri_token_keasramaan')
      .delete()
      .eq('siswa_nis', siswa_nis)
      .eq('tahun_ajaran', tahun_ajaran)
      .eq('semester', semester);
  }

  // Generate new token
  const token = generateSecureToken();
  const expires_at = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const { error: insertError } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .insert({
      token,
      siswa_nis,
      tahun_ajaran,
      semester,
      expires_at,
    });

  if (insertError) {
    console.error('Error creating token:', insertError);
    throw new Error('Failed to create token');
  }

  return token;
}

/**
 * Validate token and get associated data
 */
export async function validateToken(token: string): Promise<QRTokenData | null> {
  const { data, error } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if token is expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  return {
    token: data.token,
    siswa_nis: data.siswa_nis,
    tahun_ajaran: data.tahun_ajaran,
    semester: data.semester,
    expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
  };
}

/**
 * Generate QR code for siswa galeri
 */
export async function generateGaleriQRCode(
  baseUrl: string,
  siswa_nis: string,
  tahun_ajaran: string,
  semester: string,
  options?: {
    expiresInDays?: number;
    qrWidth?: number;
    qrMargin?: number;
  }
): Promise<{ token: string; qrCodeDataUrl: string; fullUrl: string }> {
  // Get or create token
  const token = await getOrCreateToken(
    siswa_nis,
    tahun_ajaran,
    semester,
    options?.expiresInDays
  );

  // Generate full URL
  const fullUrl = `${baseUrl}${token}`;

  // Generate QR code
  const qrCodeDataUrl = await generateQRCode(fullUrl, {
    width: options?.qrWidth || 300,
    margin: options?.qrMargin || 2,
  });

  return {
    token,
    qrCodeDataUrl,
    fullUrl,
  };
}

/**
 * Revoke token (delete from database)
 */
export async function revokeToken(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('Error revoking token:', error);
    return false;
  }

  return true;
}

/**
 * Revoke all tokens for a siswa
 */
export async function revokeAllTokensForSiswa(siswa_nis: string): Promise<boolean> {
  const { error } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .delete()
    .eq('siswa_nis', siswa_nis);

  if (error) {
    console.error('Error revoking tokens:', error);
    return false;
  }

  return true;
}

/**
 * Clean up expired tokens (can be run as a cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const { data, error } = await supabase
    .from('rapor_galeri_token_keasramaan')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select();

  if (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }

  return data?.length || 0;
}
