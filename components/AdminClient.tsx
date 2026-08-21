'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Lock,
  LogOut,
  RefreshCw,
  Loader2,
  Inbox,
  EyeOff,
  PenLine,
  Paperclip,
  CornerDownRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import AdminDetailDrawer from '@/components/AdminDetailDrawer';
import { formatDate } from '@/lib/utils';
import type { Suggestion, SuggestionStatus, SuggestionType } from '@/lib/types';

type AuthState = 'unknown' | 'authed' | 'guest';
type StatusFilter = 'ALL' | SuggestionStatus;
type TypeFilter = 'ALL' | SuggestionType;

export default function AdminClient() {
  const [auth, setAuth] = useState<AuthState>('unknown');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

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
    setSelected(null);
  };

  const onUpdated = (updated: Suggestion) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    setSelected(updated);
  };

  const counts = useMemo(() => {
    const c = { total: items.length, '접수됨': 0, '검토 중': 0, '완료': 0 } as Record<string, number>;
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
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-appleblue">
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="전체" value={counts.total} active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
        <StatCard label="접수됨" value={counts['접수됨']} active={statusFilter === '접수됨'} onClick={() => setStatusFilter('접수됨')} tone="slate" />
        <StatCard label="검토 중" value={counts['검토 중']} active={statusFilter === '검토 중'} onClick={() => setStatusFilter('검토 중')} tone="amber" />
        <StatCard label="완료" value={counts['완료']} active={statusFilter === '완료'} onClick={() => setStatusFilter('완료')} tone="emerald" />
      </div>

      {/* Type filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-muted">유형</span>
        <FilterPill label="전체" active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')} />
        <FilterPill label="익명" active={typeFilter === 'ANONYMOUS'} onClick={() => setTypeFilter('ANONYMOUS')} />
        <FilterPill label="일반" active={typeFilter === 'NAMED'} onClick={() => setTypeFilter('NAMED')} />
      </div>

      {/* List */}
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
            <li key={it.id}>
              <button
                onClick={() => setSelected(it)}
                className="group flex w-full flex-col gap-3 rounded-2xl border border-black/[0.08] bg-white p-5 text-left shadow-card transition-all hover:border-black/[0.14] hover:shadow-card-hover"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <span className="font-mono text-xs text-ink-muted">{it.ticket_code}</span>
                  </div>
                  <StatusBadge status={it.status} size="sm" />
                </div>

                <p className="line-clamp-2 text-[15px] leading-relaxed text-ink">{it.content}</p>

                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span>{formatDate(it.created_at)}</span>
                  {it.file_urls?.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" /> {it.file_urls.length}
                    </span>
                  )}
                  {it.admin_reply && (
                    <span className="inline-flex items-center gap-1 text-appleblue">
                      <CornerDownRight className="h-3.5 w-3.5" /> 답변 완료
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <AdminDetailDrawer
          suggestion={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Login ───────────────────────── */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인에 실패했습니다.');
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
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-appleblue/10 text-appleblue">
          <Lock className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="text-center text-xl font-semibold tracking-tight text-ink">관리자 로그인</h1>
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
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-appleblue py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-appleblue-hover disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Lock className="h-4.5 w-4.5" />}
          로그인
        </button>
      </form>
    </div>
  );
}

/* ───────────────────────── UI bits ───────────────────────── */
function StatCard({
  label,
  value,
  active,
  onClick,
  tone = 'blue',
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  tone?: 'blue' | 'slate' | 'amber' | 'emerald';
}) {
  const dot = {
    blue: 'bg-appleblue',
    slate: 'bg-slate-400',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-white p-4 text-left transition-all ${
        active ? 'border-appleblue ring-1 ring-appleblue/30' : 'border-black/[0.08] hover:border-black/[0.14]'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-xs font-medium text-ink-muted">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
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
