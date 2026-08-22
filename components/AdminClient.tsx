'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  Inbox,
  EyeOff,
  PenLine,
  CornerDownRight,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import type { Suggestion, SuggestionStatus, SuggestionType } from '@/lib/types';

type AuthState = 'unknown' | 'authed' | 'guest';
type StatusFilter = 'ALL' | SuggestionStatus;
type TypeFilter = 'ALL' | SuggestionType;

export default function AdminClient() {
  const [auth, setAuth] = useState<AuthState>('unknown');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const [target, setTarget] = useState<Suggestion | null>(null); // 삭제 대상
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suggestions', { cache: 'no-store' });
      if (res.status === 401) {
        setAuth('guest');
        return;
      }
      const data = await res.json();
      setItems(data.suggestions || []);
      setAuth('authed');
    } catch {
      setAuth('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuth('guest');
    setItems([]);
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/suggestions/${target.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '삭제에 실패했습니다.');
      setItems((prev) => prev.filter((it) => it.id !== target.id));
      setTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: items.length, '접수됨': 0, '완료': 0 };
    for (const it of items) c[it.status] = (c[it.status] || 0) + 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(
      (it) =>
        (statusFilter === 'ALL' || it.status === statusFilter) &&
        (typeFilter === 'ALL' || it.type === typeFilter)
    );
  }, [items, statusFilter, typeFilter]);

  if (auth === 'unknown') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (auth === 'guest') {
    return <AdminLogin onSuccess={loadList} />;
  }

  return (
    <div className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-accent">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
            <span className="text-sm font-medium">관리자</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-3xl">
            건의 관리 대시보드
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            학급 임원·담임 선생님 전용 · 모든 건의를 확인하고 답변할 수 있어요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadList}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full border border-black/[0.1] px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-gray disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 새로고침
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-black/[0.1] px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-gray"
          >
            <LogOut className="h-4 w-4" /> 로그아웃
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="전체" value={counts.total} active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
        <StatCard label="접수됨" value={counts['접수됨']} active={statusFilter === '접수됨'} onClick={() => setStatusFilter('접수됨')} />
        <StatCard label="완료" value={counts['완료']} active={statusFilter === '완료'} onClick={() => setStatusFilter('완료')} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-muted">유형</span>
        <FilterPill label="전체" active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')} />
        <FilterPill label="익명" active={typeFilter === 'ANONYMOUS'} onClick={() => setTypeFilter('ANONYMOUS')} />
        <FilterPill label="일반" active={typeFilter === 'NAMED'} onClick={() => setTypeFilter('NAMED')} />
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 py-20 text-center">
          <Inbox className="h-10 w-10 text-ink-muted/50" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-muted">
            {items.length === 0 ? '아직 접수된 건의가 없습니다.' : '조건에 맞는 건의가 없습니다.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((it) => (
            <li
              key={it.id}
              className="group relative rounded-2xl border border-black/[0.08] bg-white shadow-card transition-all hover:border-black/[0.14] hover:shadow-card-hover"
            >
              <Link href={`/admin/${it.id}`} className="flex items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 pr-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                      {it.type === 'ANONYMOUS' ? (
                        <span className="inline-flex items-center gap-1">
                          <EyeOff className="h-4 w-4" /> 익명
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <PenLine className="h-4 w-4" /> {it.author_name || '일반'}
                        </span>
                      )}
                      <span className="font-mono text-xs tracking-widest text-ink-muted">
                        {it.ticket_code}
                      </span>
                    </div>
                    <StatusBadge status={it.status} size="sm" />
                  </div>

                  <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-ink">
                    {it.content}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
                    <span>{formatDate(it.created_at)}</span>
                    {it.admin_reply && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <CornerDownRight className="h-3.5 w-3.5" /> 답변 완료
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* 삭제 버튼 (링크 위에 겹쳐 배치) */}
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setTarget(it);
                }}
                aria-label="이 건의 삭제"
                title="삭제"
                className="absolute right-12 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {target && (
        <ConfirmDialog
          title="이 건의를 삭제할까요?"
          description={`접수코드 ${target.ticket_code} · ${
            target.type === 'ANONYMOUS' ? '익명' : target.author_name || '일반'
          }\n삭제하면 되돌릴 수 없고, 학생도 더 이상 조회할 수 없습니다.${
            deleteError ? `\n\n${deleteError}` : ''
          }`}
          working={deleting}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (!deleting) {
              setTarget(null);
              setDeleteError(null);
            }
          }}
        />
      )}
    </div>
  );
}

/* ───────────────────────── 로그인 (잠금 기능 포함) ───────────────────────── */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remain, setRemain] = useState(0); // 잠금 남은 초
  const [guardReady, setGuardReady] = useState(true); // 잠금 표 준비 여부

  // 새로고침해도 남은 잠금 시간을 서버에서 다시 받아옴
  useEffect(() => {
    let alive = true;
    fetch('/api/admin/login', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.locked) setRemain(d.retryAfterSeconds ?? 0);
        if (d?.ready === false) setGuardReady(false);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // 1초마다 카운트다운
  useEffect(() => {
    if (remain <= 0) return;
    const t = setInterval(() => setRemain((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [remain]);

  const locked = remain > 0;
  const mm = String(Math.floor(remain / 60)).padStart(2, '0');
  const ss = String(remain % 60).padStart(2, '0');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.locked) setRemain(data.retryAfterSeconds ?? 300);
        setPassword('');
        throw new Error(data.error || '로그인에 실패했습니다.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5">
      <form
        onSubmit={submit}
        className="w-full rounded-3xl border border-black/[0.08] bg-white p-7 shadow-card sm:p-8"
      >
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
            locked ? 'bg-red-50 text-red-600' : 'bg-accent text-white'
          }`}
        >
          {locked ? (
            <ShieldAlert className="h-7 w-7" strokeWidth={1.8} />
          ) : (
            <Lock className="h-7 w-7" strokeWidth={1.8} />
          )}
        </div>

        <h1 className="text-center text-xl font-semibold tracking-tight text-ink">
          {locked ? '로그인이 잠겼습니다' : '관리자 로그인'}
        </h1>

        {locked ? (
          <>
            <p className="mt-2 text-center text-sm leading-relaxed text-ink-muted">
              비밀번호를 5번 틀려서 잠시 로그인할 수 없어요.
              <br />
              아래 시간이 지나면 다시 시도할 수 있습니다.
            </p>
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-surface-gray py-6">
              <p className="text-center text-xs font-medium uppercase tracking-wider text-ink-muted">
                남은 시간
              </p>
              <p className="mt-1 text-center font-mono text-4xl font-bold tabular-nums tracking-tight text-ink">
                {mm}:{ss}
              </p>
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
              새로고침하거나 창을 닫아도 시간은 그대로 유지됩니다.
              <br />
              잠금은 이 기기에만 적용되며, 다른 사람에게는 영향을 주지 않습니다.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-center text-sm leading-relaxed text-ink-muted">
              학급 임원과 담임 선생님만 접속할 수 있어요.
            </p>

            <div className="mt-6">
              <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">
                비밀번호
              </label>
              <input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoFocus
                className="focus-ring w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-ink-muted">
                5번 틀리면 이 기기에서 5분 동안 로그인할 수 없습니다.
              </p>
            </div>

            {!guardReady && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  <b>잠금 보호가 아직 꺼져 있습니다.</b> Supabase SQL Editor에서{' '}
                  <code className="rounded bg-amber-100 px-1">supabase-migration-lockout.sql</code>{' '}
                  을 실행해 주세요.
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Lock className="h-4.5 w-4.5" />}
              로그인
            </button>
          </>
        )}
      </form>
    </div>
  );
}

/* ───────────────────────── UI 조각 ───────────────────────── */
function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-black/[0.08] bg-white text-ink hover:border-black/[0.2]'
      }`}
    >
      <span className={`text-xs font-medium ${active ? 'text-white/70' : 'text-ink-muted'}`}>
        {label}
      </span>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink text-white'
          : 'border border-black/[0.1] text-ink-soft hover:bg-surface-gray'
      }`}
    >
      {label}
    </button>
  );
}
