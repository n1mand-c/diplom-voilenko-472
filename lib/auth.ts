import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'red_bull_super_secret_key_for_extreme_sports'
);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('rb_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function setSession(userId: number, username: string, role: string, hotelId: number | null = null) {
  const token = await signToken({ userId, username, role, hotelId });
  const cookieStore = await cookies();
  cookieStore.set('rb_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('rb_session');
}
