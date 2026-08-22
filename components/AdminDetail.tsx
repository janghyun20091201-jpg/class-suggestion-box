'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  EyeOff,
  PenLine,
  MessageSquare,
  CornerDownRight,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { STATUS_LIST, type Suggestion, type SuggestionStatus } from '@/lib/types';

export default function AdminDetail({ suggestion }: { suggestion: Suggestion }) {
  const router = useRouter();
  const [status, setStatus] = useState<SuggestionStatus>(
    STATUS_LIST.includes(suggestion.status) ? suggestion.status : '접수됨'
  );
  const [reply, setReply] = useState(suggestion.admin_reply ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = status !== suggestion.status || reply !== (suggestion.admin_reply ?? '');

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suggestions/${suggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_reply: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suggestions/${suggestion.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '삭제에 실패했습니다.');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> 목록으로
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
              </>
            )}
            <span className="font-mono text-xs tracking-widest text-ink-muted">
              {suggestion.ticket_code}
            </span>
          </div>
          <StatusBadge status={suggestion.status} />
        </div>

        <div className="space-y-6 px-6 py-6">
          <p className="text-xs text-ink-muted">{formatDate(suggestion.created_at)}</p>

          {suggestion.type === 'NAMED' && (
            <div>
              <p className="text-xs font-medium text-ink-muted">작성자</p>
              <p className="mt-0.5 text-[15px] font-medium text-ink">
                {suggestion.author_name || '(이름 없음)'}
              </p>
            </div>
          )}

          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MessageSquare className="h-4 w-4 text-ink-soft" /> 건의 내용
            </h2>
            <p className="whitespace-pre-wrap rounded-2xl bg-surface-gray px-4 py-3.5 text-[15px] leading-relaxed text-ink">
              {suggestion.content}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">처리 상태</h2>
            <div className="flex flex-wrap gap-2">
              {STATUS_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    status === s
                      ? 'bg-accent text-white'
                      : 'border border-black/[0.1] text-ink-soft hover:bg-surface-gray'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <CornerDownRight className="h-4 w-4 text-ink-soft" /> 관리자 답변
            </h2>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              placeholder="학생에게 전달할 답변을 입력하세요."
              className="focus-ring w-full resize-y rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted"
              disabled={saving}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold transition-all ${
              saved ? 'border border-ink bg-white text-ink' : 'bg-accent text-white hover:bg-accent-hover'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> 저장 중...
              </>
            ) : saved ? (
              <>
                <Check className="h-4.5 w-4.5" /> 저장되었습니다
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" /> 변경사항 저장
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={saving || deleting}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-[15px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4.5 w-4.5" /> 이 건의 삭제하기
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="이 건의를 삭제할까요?"
          description={`접수코드 ${suggestion.ticket_code}\n삭제하면 되돌릴 수 없고, 학생도 더 이상 조회할 수 없습니다.`}
          working={deleting}
          onConfirm={remove}
          onCancel={() => !deleting && setConfirming(false)}
        />
      )}
    </>
  );
}
