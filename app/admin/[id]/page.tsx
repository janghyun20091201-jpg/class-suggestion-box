import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import AdminDetail from '@/components/AdminDetail';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAuthenticated } from '@/lib/auth';
import type { Suggestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '건의 상세 · 관리자',
};

export default async function AdminDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAuthenticated()) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-5">
        <div className="w-full rounded-3xl border border-black/[0.08] bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
            <Lock className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="text-lg font-semibold text-ink">관리자 로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-ink-muted">
            로그인 후 다시 시도해 주세요.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  const { data } = await supabaseAdmin
    .from('suggestions')
    .select('id, type, author_name, content, status, admin_reply, ticket_code, created_at')
    .eq('id', params.id)
    .maybeSingle();

  const suggestion = (data as Suggestion) ?? null;

  if (!suggestion) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> 목록으로
        </Link>
        <div className="rounded-3xl border border-black/[0.08] bg-white px-6 py-16 text-center shadow-card">
          <p className="text-sm text-ink-muted">해당 건의를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <AdminDetail suggestion={suggestion} />
    </div>
  );
}
