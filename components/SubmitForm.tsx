'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EyeOff, PenLine, Send, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import TicketModal from '@/components/TicketModal';
import type { SuggestionType } from '@/lib/types';

export default function SubmitForm({ type }: { type: SuggestionType }) {
  const isNamed = type === 'NAMED';

  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; order: number | null } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNamed && !authorName.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setError('건의 내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          author_name: isNamed ? authorName.trim() : null,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '접수에 실패했습니다.');

      setResult({ code: data.ticket_code, order: data.order ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link
        href="/submit"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> 유형 다시 고르기
      </Link>

      <div className="mb-8">
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            isNamed ? 'bg-violet-500/10 text-violet-600' : 'bg-appleblue/10 text-appleblue'
          }`}
        >
          {isNamed ? (
            <PenLine className="h-6 w-6" strokeWidth={1.8} />
          ) : (
            <EyeOff className="h-6 w-6" strokeWidth={1.8} />
          )}
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-3xl">
          {isNamed ? '일반 건의하기' : '익명 건의하기'}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {isNamed
            ? '이름과 함께 건의를 남깁니다. 관리자가 누가 남겼는지 확인할 수 있어요.'
            : '이름 없이 건의를 남깁니다. 누가 작성했는지 저장되지 않아요.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-black/[0.08] bg-white p-6 shadow-card sm:p-8"
      >
        {isNamed && (
          <div className="mb-6">
            <label htmlFor="authorName" className="mb-2 block text-sm font-medium text-ink">
              이름 <span className="text-appleblue">*</span>
            </label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={50}
              placeholder="예) 김철수"
              className="focus-ring w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted"
              disabled={submitting}
            />
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="content" className="mb-2 block text-sm font-medium text-ink">
            건의 내용 <span className="text-appleblue">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            maxLength={5000}
            placeholder="우리 반을 위한 솔직한 의견을 자유롭게 남겨주세요."
            className="focus-ring w-full resize-y rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted"
            disabled={submitting}
          />
          <p className="mt-1.5 text-right text-xs text-ink-muted">{content.length} / 5000</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-appleblue py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-appleblue-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" /> 접수 중...
            </>
          ) : (
            <>
              <Send className="h-4.5 w-4.5" /> 건의 제출하기
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
          제출 후 발급되는 <span className="font-medium text-ink">6자리 접수코드</span>로만
          답변을 확인할 수 있어요. 제출 후에는 수정·삭제가 불가능합니다.
        </p>
      </form>

      {result && (
        <TicketModal code={result.code} order={result.order} onClose={() => setResult(null)} />
      )}
    </>
  );
}
