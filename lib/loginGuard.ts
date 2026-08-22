import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * 관리자 로그인 보호.
 *
 * 설계 원칙: **올바른 비밀번호는 언제나 즉시 통과한다.**
 * 같은 와이파이를 쓰는 다른 사람 때문에 관리자가 못 들어가는 일이 없어야 하므로
 * IP가 아니라 "기기(브라우저)"를 기준으로 잠급니다.
 *
 * 1) 기기별 잠금 : 한 브라우저에서 5번 틀리면 그 브라우저만 5분간 잠김
 * 2) 전체 감속   : 짧은 시간에 실패가 몰리면 '틀린 답'에 대한 응답만 점점 느려짐
 *                 (자동 프로그램의 무작위 대입을 사실상 불가능하게 만듦)
 *                 정답은 지연 없이 통과하므로 관리자는 영향을 받지 않음
 */

export const LOCK_MINUTES = 5;
export const MAX_FAILS = 5; // 5번 틀리면 잠금

const TABLE = 'admin_login_attempts';
const GLOBAL_ID = '__global__';
const GLOBAL_WINDOW_MS = 5 * 60 * 1000;

/* ── 표가 없을 때 쓰는 임시 저장소 (서버 메모리) ───────────────────── */
const memory = new Map<string, { failCount: number; lockedUntil: number; at: number }>();

function memGet(key: string) {
  return memory.get(key) ?? { failCount: 0, lockedUntil: 0, at: 0 };
}

/* ── 기기 식별 ─────────────────────────────────────────────────────── */

function secret(): string {
  return process.env.SESSION_SECRET || 'class-suggestion-fallback-secret';
}

function sign(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex').slice(0, 16);
}

/** 새 기기 ID 발급 (쿠키에 저장할 서명된 값) */
export function newDeviceToken(): string {
  const id = crypto.randomBytes(12).toString('hex');
  return `${id}.${sign(id)}`;
}

/** 쿠키에서 읽은 값이 우리가 발급한 것인지 확인하고 기기 ID를 돌려줌 */
export function parseDeviceToken(token: string | undefined): string | null {
  if (!token) return null;
  const [id, sig] = token.split('.');
  if (!id || !sig) return null;
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}

function deviceKey(deviceId: string): string {
  return `dev:${deviceId}`;
}

/* ── 잠금 상태 ─────────────────────────────────────────────────────── */

export interface LockState {
  locked: boolean;
  retryAfterSeconds: number;
  /** 잠금 표가 준비돼 있는지 (false면 임시 저장소로 동작 중) */
  ready: boolean;
}

async function readRow(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('fail_count, locked_until, updated_at')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

async function writeRow(
  id: string,
  fields: { fail_count: number; locked_until: string | null }
) {
  return supabaseAdmin.from(TABLE).upsert(
    { id, ...fields, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );
}

/** 이 기기가 지금 잠겨 있는지 */
export async function getLockState(deviceId: string | null): Promise<LockState> {
  if (!deviceId) return { locked: false, retryAfterSeconds: 0, ready: true };

  const { data, error } = await readRow(deviceKey(deviceId));

  if (error) {
    const rec = memGet(deviceKey(deviceId));
    const remain = rec.lockedUntil - Date.now();
    return remain > 0
      ? { locked: true, retryAfterSeconds: Math.ceil(remain / 1000), ready: false }
      : { locked: false, retryAfterSeconds: 0, ready: false };
  }

  if (!data?.locked_until) return { locked: false, retryAfterSeconds: 0, ready: true };

  const remainMs = new Date(data.locked_until).getTime() - Date.now();
  if (remainMs <= 0) return { locked: false, retryAfterSeconds: 0, ready: true };

  return { locked: true, retryAfterSeconds: Math.ceil(remainMs / 1000), ready: true };
}

/** 로그인 실패 기록 → 5회째면 이 기기를 잠금 */
export async function recordFailure(
  deviceId: string
): Promise<LockState & { failCount: number }> {
  const key = deviceKey(deviceId);
  const { data, error } = await readRow(key);

  if (error) {
    // 임시 저장소로 대체
    const rec = memGet(key);
    const fails = rec.failCount + 1;
    if (fails >= MAX_FAILS) {
      memory.set(key, { failCount: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60_000, at: Date.now() });
      return { locked: true, retryAfterSeconds: LOCK_MINUTES * 60, ready: false, failCount: fails };
    }
    memory.set(key, { failCount: fails, lockedUntil: 0, at: Date.now() });
    return { locked: false, retryAfterSeconds: 0, ready: false, failCount: fails };
  }

  const fails = (data?.fail_count ?? 0) + 1;
  const shouldLock = fails >= MAX_FAILS;

  await writeRow(key, {
    fail_count: shouldLock ? 0 : fails, // 잠근 뒤에는 카운트 초기화
    locked_until: shouldLock
      ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
      : null,
  });

  return shouldLock
    ? { locked: true, retryAfterSeconds: LOCK_MINUTES * 60, ready: true, failCount: fails }
    : { locked: false, retryAfterSeconds: 0, ready: true, failCount: fails };
}

/** 로그인 성공 → 이 기기의 실패 기록 초기화 */
export async function clearFailures(deviceId: string): Promise<void> {
  const key = deviceKey(deviceId);
  memory.delete(key);
  await writeRow(key, { fail_count: 0, locked_until: null }).catch(() => {});
}

/* ── 전체 감속 (자동 대입 방지) ────────────────────────────────────── */

/**
 * 최근 5분간 전체 실패 횟수를 세고, 그에 따른 '틀린 답' 응답 지연 시간을 돌려줍니다.
 * 정답에는 적용하지 않으므로 관리자는 항상 즉시 로그인됩니다.
 */
export async function bumpGlobalAndGetDelayMs(): Promise<number> {
  const now = Date.now();

  const { data, error } = await readRow(GLOBAL_ID);

  let count: number;
  if (error) {
    const rec = memGet(GLOBAL_ID);
    count = now - rec.at > GLOBAL_WINDOW_MS ? 1 : rec.failCount + 1;
    memory.set(GLOBAL_ID, { failCount: count, lockedUntil: 0, at: now });
  } else {
    const last = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
    count = now - last > GLOBAL_WINDOW_MS ? 1 : (data?.fail_count ?? 0) + 1;
    await writeRow(GLOBAL_ID, { fail_count: count, locked_until: null });
  }

  if (count >= 20) return 5000;
  if (count >= 10) return 2000;
  return 0;
}

export function sleep(ms: number): Promise<void> {
  return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}
