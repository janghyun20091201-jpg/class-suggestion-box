'use client';

import { useEffect, useState } from 'react';
import {
  X,
  EyeOff,
  PenLine,
  Paperclip,
  MessageSquare,
  CornerDownRight,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import AttachmentList from '@/components/AttachmentList';
import { formatDate } from '@/lib/utils';
import { STATUS_LIST, type Suggestion, type SuggestionStatus } from '@/lib/types';

export default function AdminDetailDrawer({
  suggestion,
  onClose,
  onUpdated,
}: {
  suggestion: Suggestion;
  onClose: () => void;
  onUpdated: (s: Suggestion) => void;
}) {
  const [status, setStatus] = useState<SuggestionStatus>(suggestion.status);
  const [reply, setReply] = useState(suggestion.admin_reply ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 다른 항목을 열면 로컬 상태 동기화
  useEffect(() => {
    setStatus(suggestion.status);
    setReply(suggestion.admin_reply ?? '');
    setSaved(false);
    setError(null);
  }, [suggestion.id, suggestion.status, suggestion.admin_reply]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
      onUpdated(data.suggestion);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
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
            <span className="font-mono text-xs text-ink-muted">{suggestion.ticket_code}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-gray hover:text-ink"
            aria-label="닫기"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusBadge status={suggestion.status} />
            <span className="text-xs text-ink-muted">{formatDate(suggestion.created_at)}</span>
          </div>

          {suggestion.type === 'NAMED' && (
            <div>
              <p className="text-xs font-medium text-ink-muted">작성자</p>
              <p className="mt-0.5 text-[15px] font-medium text-ink">
                {suggestion.author_name || '(이름 없음)'}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MessageSquare className="h-4 w-4 text-ink-soft" /> 건의 내용
            </h3>
            <p className="whitespace-pre-wrap rounded-2xl bg-surface-gray px-4 py-3.5 text-[15px] leading-relaxed text-ink">
              {suggestion.content}
            </p>
          </div>

          {suggestion.file_urls?.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Paperclip className="h-4 w-4 text-ink-soft" /> 첨부파일 ({suggestion.file_urls.length})
              </h3>
              <AttachmentList urls={suggestion.file_urls} />
            </div>
          )}

          {/* Status control */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">처리 상태</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_LIST.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    status === s
                      ? 'bg-appleblue text-white'
                      : 'border border-black/[0.1] text-ink-soft hover:bg-surface-gray'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Reply */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <CornerDownRight className="h-4 w-4 text-ink-soft" /> 관리자 답변
            </h3>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
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
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] px-6 py-4">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-appleblue text-white hover:bg-appleblue-hover'
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
        </div>
      </div>
    </div>
  );
}
