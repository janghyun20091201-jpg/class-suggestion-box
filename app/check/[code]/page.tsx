import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  CornerDownRight,
  EyeOff,
  PenLine,
  SearchX,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDate } from '@/lib/utils';
import type { Suggestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '건의 답변 확인 · 11-3 건의함',
};

export default async function CheckResultPage({
  params,
}: {
  params: { code: string };
}) {
  const digits = decodeURIComponent(params.code).replace(/\D/g, '');

  let suggestion: Suggestion | null = null;

  if (digits.length === 6) {
    const { data } = await supabaseAdmin
      .from('suggestions')
      .select('id, type, author_name, content, status, admin_reply, ticket_code, created_at')
      .eq('ticket_code', digits)
      .maybeSingle();

    suggestion = (data as Suggestion) ?? null;

    // 예전 SUG-###### 형식으로 저장된 건의도 찾을 수 있게 보조 조회
    if (!suggestion) {
      const { data: legacy } = await supabaseAdmin
        .from('suggestions')
        .select('id, type, author_name, content, status, admin_reply, ticket_code, created_at')
        .eq('ticket_code', `SUG-${digits}`)
        .maybeSingle();
      suggestion = (legacy as Suggestion) ?? null;
    }
  }

  if (!suggestion) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> 홈으로
        </Link>

        <div className="flex flex-col items-center rounded-3xl border border-black/[0.08] bg-white px-6 py-16 text-center shadow-card">
          <SearchX className="h-10 w-10 text-ink-muted/50" strokeWidth={1.5} />
          <h1 className="mt-4 text-lg font-semibold text-ink">건의를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            접수코드를 다시 확인해 주세요.
            <br />6자리 숫자를 정확히 입력해야 조회됩니다.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-appleblue px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-appleblue-hover"
          >
            다시 조회하기
          </Link>
        </div>
      </div>
    );
  }

  // 익명 건의는 이름을 절대 노출하지 않음
  const authorName = suggestion.type === 'ANONYMOUS' ? null : suggestion.author_name;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> 홈으로
      </Link>

      <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            {suggestion.type === 'ANONYMOUS' ? (
              <>
                <EyeOff className="h-4 w-4" /> 익명 건의
              </>
            ) : (
              <>
                <PenLine className="h-4 w-4" /> 일반 건의
                {authorName ? <span className="text-ink-muted">· {authorName}</span> : null}
              </>
            )}
          </div>
          <StatusBadge status={suggestion.status} />
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="font-mono font-medium tracking-widest text-ink">
              {suggestion.ticket_code}
            </span>
            <span>{formatDate(suggestion.created_at)}</span>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MessageSquare className="h-4 w-4 text-ink-soft" /> 건의 내용
            </h2>
            <p className="whitespace-pre-wrap rounded-2xl bg-surface-gray px-4 py-3.5 text-[15px] leading-relaxed text-ink">
              {suggestion.content}
            </p>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <CornerDownRight className="h-4 w-4 text-ink-soft" /> 관리자 답변
            </h2>
            {suggestion.admin_reply ? (
              <p className="whitespace-pre-wrap rounded-2xl border border-appleblue/15 bg-appleblue/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-ink">
                {suggestion.admin_reply}
              </p>
            ) : (
              <p className="rounded-2xl border border-dashed border-black/10 px-4 py-3.5 text-sm text-ink-muted">
                아직 답변이 등록되지 않았어요. 조금만 기다려 주세요.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
