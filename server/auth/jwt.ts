import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ersa_jwt_secret_default_key_fallback_2026';
const TOKEN_COOKIE_NAME = 'ersa_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string | null;
  role: string;
  companyId?: string | null;
  companyName?: string | null;
  customerGroupId?: string | null;
  customerGroupCode?: string | null;
  memberRole?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getTokenFromRequest(req?: NextRequest): string | null {
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const cookieToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (cookieToken) return cookieToken;
  }

  try {
    const cookieStore = cookies();
    return cookieStore.get(TOKEN_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export function getSessionUser(req?: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
