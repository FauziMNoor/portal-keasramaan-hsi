import bcrypt from 'bcryptjs';

/**
 * Hash password menggunakan bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifikasi password dengan hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password dari database
 * @returns true jika match, false jika tidak
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
