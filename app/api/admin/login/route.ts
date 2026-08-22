import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, expectedToken } from '@/lib/auth';
import { ADMIN_COOKIE, DEVICE_COOKIE } from '@/lib/constants';
import {
  getLockState,
  recordFailure,
  clearFailures,
  bumpGlobalAndGetDelayMs,
  newDeviceToken,
  parseDeviceToken,
  sleep,
  LOCK_MINUTES,
  MAX_FAILS,
} from '@/lib/loginGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEVICE_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1년
};

/** 요청에서 기기 ID를 읽고, 없으면 새로 발급 */
function resolveDevice(req: NextRequest): { id: string; token: string; isNew: boolean } {
  const existing = parseDeviceToken(req.cookies.get(DEVICE_COOKIE)?.value);
  if (existing) return { id: existing, token: '', isNew: false };
  const token = newDeviceToken();
  return { id: parseDeviceToken(token)!, token, isNew: true };
}

// 현재 잠금 상태 확인 (새로고침해도 남은 시간을 이어서 보여주기 위함)
export async function GET(req: NextRequest) {
  const device = resolveDevice(req);
  const state = await getLockState(device.id);
  const res = NextResponse.json(state);
  if (device.isNew) res.cookies.set(DEVICE_COOKIE, device.token, DEVICE_COOKIE_OPTS);
  return res;
}

export async function POST(req: NextRequest) {
  const device = resolveDevice(req);

  const attach = (res: NextResponse) => {
    if (device.isNew) res.cookies.set(DEVICE_COOKIE, device.token, DEVICE_COOKIE_OPTS);
    return res;
  };

  // 1) 이 기기가 이미 잠겨 있으면 비밀번호를 보지도 않고 거절
  const lock = await getLockState(device.id);
  if (lock.locked) {
    return attach(
      NextResponse.json(
        {
          error: '비밀번호를 여러 번 틀려서 잠겨 있습니다.',
          locked: true,
          retryAfterSeconds: lock.retryAfterSeconds,
        },
        { status: 429 }
      )
    );
  }

  const { password } = await req.json().catch(() => ({ password: '' }));

  // 2) 비밀번호 확인 — 정답이면 지연 없이 즉시 통과
  if (verifyPassword(typeof password === 'string' ? password : '')) {
    await clearFailures(device.id);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, expectedToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8시간
    });
    return attach(res);
  }

  // 3) 틀렸을 때만: 전체 실패가 몰리면 응답을 점점 느리게 (자동 대입 방지)
  const delayMs = await bumpGlobalAndGetDelayMs();
  await sleep(delayMs);

  const next = await recordFailure(device.id);
  const left = Math.max(0, MAX_FAILS - next.failCount);

  return attach(
    NextResponse.json(
      {
        error: next.locked
          ? `비밀번호를 ${MAX_FAILS}번 틀렸습니다. ${LOCK_MINUTES}분 동안 로그인할 수 없습니다.`
          : `비밀번호가 올바르지 않습니다. (${left}번 더 틀리면 ${LOCK_MINUTES}분 잠금)`,
        locked: next.locked,
        retryAfterSeconds: next.retryAfterSeconds,
        attemptsLeft: left,
      },
      { status: next.locked ? 429 : 401 }
    )
  );
}
