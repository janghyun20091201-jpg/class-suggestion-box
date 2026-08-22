import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * 관리자 로그인 잠금.
 * - 비밀번호를 MAX_FAILS 번 틀리면 LOCK_MINUTES 동안 로그인 시도를 막습니다.
 * - 잠금 상태는 DB에 저장하므로 새로고침·창을 닫았다 열어도 그대로 유지됩니다.
 * - 접속자는 IP를 해시한 값으로 구분합니다(원본 IP는 저장하지 않음).
 */

export const LOCK_MINUTES = 5;
export const MAX_FAILS = 1; // 1번만 틀려도 잠금

const TABLE = 'admin_login_attempts';

/**
 * DB 표가 아직 없을 때 쓰는 임시 저장소(서버 메모리).
 * 서버가 재시작되면 사라지므로 완전하지 않습니다 — 반드시 마이그레이션 SQL을 실행하세요.
 */
const memoryLocks = new Map<string, { failCount: number; lockedUntil: number }>();

function memGetLock(key: string): LockState {
  const rec = memoryLocks.get(key);
  if (!rec || rec.lockedUntil <= Date.now()) return { locked: false, retryAfterSeconds: 0, ready: false };
  return {
    locked: true,
    retryAfterSeconds: Math.ceil((rec.lockedUntil - Date.now()) / 1000),
    ready: false,
  };
}

function memRecordFailure(key: string): LockState {
  const rec = memoryLocks.get(key) ?? { failCount: 0, lockedUntil: 0 };
  const fails = rec.failCount + 1;
  if (fails >= MAX_FAILS) {
    memoryLocks.set(key, { failCount: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60 * 1000 });
    return { locked: true, retryAfterSeconds: LOCK_MINUTES * 60, ready: false };
  }
  memoryLocks.set(key, { failCount: fails, lockedUntil: 0 });
  return { locked: false, retryAfterSeconds: 0, ready: false };
}

/** 접속자 식별키 (IP 해시) */
export function clientKey(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  const ip =
    xff.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const secret = process.env.SESSION_SECRET || 'class-suggestion-fallback-secret';
  return crypto.createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
}

export interface LockState {
  locked: boolean;
  retryAfterSeconds: number;
  /** 잠금 표가 준비돼 있는지 (false면 보호가 동작하지 않음 — 마이그레이션 필요) */
  ready: boolean;
}

/** 현재 잠겨 있는지 확인 */
export async function getLockState(key: string): Promise<LockState> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('locked_until')
    .eq('id', key)
    .maybeSingle();

  // 표가 아직 없거나 조회 실패 → 잠그지 않음(관리자가 아예 못 들어가는 상황 방지)
  if (error) {
    console.warn('[loginGuard] 잠금 표 조회 실패 (마이그레이션 필요):', error.message);
    return memGetLock(key); // 표가 없으면 메모리 잠금으로 대체
  }
  if (!data?.locked_until) return { locked: false, retryAfterSeconds: 0, ready: true };

  const remainMs = new Date(data.locked_until).getTime() - Date.now();
  if (remainMs <= 0) return { locked: false, retryAfterSeconds: 0, ready: true };

  return { locked: true, retryAfterSeconds: Math.ceil(remainMs / 1000), ready: true };
}

/** 로그인 실패 기록 → 필요하면 잠금 */
export async function recordFailure(key: string): Promise<LockState> {
  const { data } = await supabaseAdmin
    .from(TABLE)
    .select('fail_count')
    .eq('id', key)
    .maybeSingle();

  const fails = (data?.fail_count ?? 0) + 1;
  const shouldLock = fails >= MAX_FAILS;
  const lockedUntil = shouldLock
    ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
    : null;

  const { error } = await supabaseAdmin.from(TABLE).upsert(
    {
      id: key,
      fail_count: shouldLock ? 0 : fails, // 잠근 뒤에는 카운트 초기화
      locked_until: lockedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.warn('[loginGuard] 잠금 기록 실패:', error.message);
    return memRecordFailure(key); // 표가 없으면 메모리 잠금으로 대체
  }

  return shouldLock
    ? { locked: true, retryAfterSeconds: LOCK_MINUTES * 60, ready: true }
    : { locked: false, retryAfterSeconds: 0, ready: true };
}

/** 로그인 성공 → 기록 초기화 */
export async function clearFailures(key: string): Promise<void> {
  memoryLocks.delete(key);
  await supabaseAdmin
    .from(TABLE)
    .upsert(
      { id: key, fail_count: 0, locked_until: null, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
}
