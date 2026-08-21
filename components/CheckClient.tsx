'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Loader2,
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Paperclip,
  CornerDownRight,
  EyeOff,
  PenLine,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import AttachmentList from '@/components/AttachmentList';
import { formatDate } from '@/lib/utils';
import type { Suggestion } from '@/lib/types';

export default function CheckClient({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Suggestion | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('접수코드를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '조회에 실패했습니다.');
      setResult(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // 링크로 코드가 전달되면 자동 조회
  useEffect(() => {
    if (initialCode.trim()) {
      search(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> 홈으로
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
          <Search className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-3xl">
          내 건의 답변 확인하기
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          접수할 때 받은 6자리 코드를 입력하면 처리 상태와 답변을 볼 수 있어요.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(code);
        }}
        className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-card sm:p-6"
      >
        <label htmlFor="code" className="mb-2 block text-sm font-medium text-ink">
          접수코드
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예) SUG-482913"
            autoComplete="off"
            className="focus-ring w-full flex-1 rounded-xl border border-black/[0.12] bg-white px-4 py-3 font-mono text-[15px] uppercase tracking-wide text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-muted"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-appleblue px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-appleblue-hover disabled:opacity-60 sm:rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Search className="h-4.5 w-4.5" />
            )}
            조회
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 animate-slide-up overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              {result.type === 'ANONYMOUS' ? (
                <>
                  <EyeOff className="h-4 w-4" /> 익명 건의
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" /> 일반 건의
                  {result.author_name ? (
                    <span className="text-ink-muted">· {result.author_name}</span>
                  ) : null}
                </>
              )}
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span className="font-mono font-medium text-ink">{result.ticket_code}</span>
              <span>{formatDate(result.created_at)}</span>
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <MessageSquare className="h-4 w-4 text-ink-soft" /> 건의 내용
              </h3>
              <p className="whitespace-pre-wrap rounded-2xl bg-surface-gray px-4 py-3.5 text-[15px] leading-relaxed text-ink">
                {result.content}
              </p>
            </div>

            {result.file_urls && result.file_urls.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Paperclip className="h-4 w-4 text-ink-soft" /> 첨부파일
                </h3>
                <AttachmentList urls={result.file_urls} />
              </div>
            )}

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <CornerDownRight className="h-4 w-4 text-ink-soft" /> 관리자 답변
              </h3>
              {result.admin_reply ? (
                <p className="whitespace-pre-wrap rounded-2xl border border-appleblue/15 bg-appleblue/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-ink">
                  {result.admin_reply}
                </p>
              ) : (
                <p className="rounded-2xl border border-dashed border-black/10 px-4 py-3.5 text-sm text-ink-muted">
                  아직 답변이 등록되지 않았어요. 조금만 기다려 주세요.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty (searched, no result but no error handled above already) */}
      {!result && searched && !error && !loading && (
        <p className="mt-6 text-center text-sm text-ink-muted">조회 결과가 없습니다.</p>
      )}
    </>
  );
}
