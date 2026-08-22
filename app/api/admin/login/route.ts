import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, expectedToken, ADMIN_COOKIE } from '@/lib/auth';
import {
  clientKey,
  getLockState,
  recordFailure,
  clearFailures,
  LOCK_MINUTES,
} from '@/lib/loginGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 현재 잠금 상태 확인 (페이지를 새로고침해도 남은 시간을 이어서 보여주기 위함)
export async function GET(req: NextRequest) {
  const state = await getLockState(clientKey(req));
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const key = clientKey(req);

  // 1) 이미 잠겨 있으면 비밀번호를 보지도 않고 거절
  const lock = await getLockState(key);
  if (lock.locked) {
    return NextResponse.json(
      {
        error: '비밀번호를 틀려서 잠겨 있습니다.',
        locked: true,
        retryAfterSeconds: lock.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  const { password } = await req.json().catch(() => ({ password: '' }));

  // 2) 비밀번호 확인
  if (!verifyPassword(typeof password === 'string' ? password : '')) {
    const next = await recordFailure(key);
    return NextResponse.json(
      {
        error: next.locked
          ? `비밀번호가 올바르지 않습니다. ${LOCK_MINUTES}분 동안 로그인할 수 없습니다.`
          : '비밀번호가 올바르지 않습니다.',
        locked: next.locked,
        retryAfterSeconds: next.retryAfterSeconds,
      },
      { status: next.locked ? 429 : 401 }
    );
  }

  // 3) 성공 → 실패 기록 초기화 후 세션 쿠키 발급
  await clearFailures(key);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });
  return res;
}
