import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants';
import { AuthSession } from '../types/backend';

export function generateTokens(payload: AuthSession['user']) {
  const token = jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN as any
  });

  const refreshToken = jwt.sign({ userId: payload.id, institute_id: payload.institute_id }, JWT_CONFIG.REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN as any
  });

  return { token, refreshToken };
}

export function verifyToken(token: string): AuthSession['user'] {
  return jwt.verify(token, JWT_CONFIG.SECRET) as AuthSession['user'];
}

export function verifyRefreshToken(token: string): { userId: string; institute_id: string } {
  return jwt.verify(token, JWT_CONFIG.REFRESH_SECRET) as { userId: string; institute_id: string };
}
