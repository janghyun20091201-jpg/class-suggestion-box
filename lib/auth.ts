import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/constants';

/**
 * 아주 단순한 무상태(stateless) 관리자 세션.
 * - 로그인 시 ADMIN_PASSWORD 와 비교
 * - 성공하면 HMAC(SESSION_SECRET, ADMIN_PASSWORD) 값을 httpOnly 쿠키로 저장
 * - 보호된 라우트에서는 쿠키 값이 서버가 재계산한 토큰과 일치하는지 확인
 * 비밀번호를 바꾸면 기존 세션은 자동으로 무효화됩니다.
 */

export { ADMIN_COOKIE };

export function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.SESSION_SECRET || 'class-suggestion-fallback-secret';
  return crypto.createHmac('sha256', secret).update(pw).digest('hex');
}

/** 입력한 비밀번호가 맞는지 (타이밍 안전 비교) */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** 현재 요청이 관리자 인증 상태인지 */
export function isAuthenticated(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
