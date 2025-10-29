import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hsi-keasramaan-secret-key-2025-change-this-in-production'
);

export interface SessionData {
  userId: string;
  email: string;
  nama: string;
  role: string;
  [key: string]: any; // Index signature untuk JWTPayload compatibility
}

/**
 * Buat session baru (login)
 */
export async function createSession(data: SessionData) {
  const token = await new SignJWT(data as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 hari
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Ambil session yang sedang aktif
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Hapus session (logout)
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
