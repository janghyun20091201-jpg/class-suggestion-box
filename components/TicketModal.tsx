'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, PartyPopper, X, ArrowRight } from 'lucide-react';

export default function TicketModal({
  code,
  order,
  onClose,
}: {
  code: string;
  order: number | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 시 조용히 무시
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl bg-white p-7 shadow-modal sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-gray hover:text-ink"
          aria-label="닫기"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
          <PartyPopper className="h-7 w-7" strokeWidth={1.8} />
        </div>

        <h2 className="text-center text-xl font-semibold tracking-tight text-ink">
          건의가 접수되었습니다
        </h2>

        {order !== null && (
          <p className="mt-2 text-center text-[15px] font-medium text-accent">
            우리 반의 {order}번째 건의예요
          </p>
        )}

        <p className="mt-2 text-center text-[15px] leading-relaxed text-ink-muted">
          아래 접수코드를 저장해 두시면 나중에
          <br />
          처리 상태와 답변을 확인할 수 있습니다.
        </p>

        <div className="mt-6 rounded-2xl border border-black/[0.08] bg-surface-gray p-5">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-ink-muted">
            나의 접수코드
          </p>
          <p className="mt-1.5 text-center font-mono text-4xl font-bold tracking-[0.2em] text-ink">
            {code}
          </p>
        </div>

        <button
          onClick={copy}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-medium transition-all ${
            copied
              ? 'border border-ink bg-white text-ink'
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4.5 w-4.5" /> 복사되었습니다
            </>
          ) : (
            <>
              <Copy className="h-4.5 w-4.5" /> 코드 복사하기
            </>
          )}
        </button>

        <div className="mt-3 flex gap-2">
          <Link
            href="/"
            className="flex-1 rounded-full border border-black/[0.1] py-3 text-center text-[15px] font-medium text-ink transition-colors hover:bg-surface-gray"
          >
            홈으로
          </Link>
          <Link
            href={`/check/${code}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-ink py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            답변 확인 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          ⚠️ 제출 후에는 학생이 직접 수정하거나 삭제할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
