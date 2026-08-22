'use client';

import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = '삭제하기',
  cancelLabel = '취소',
  working = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  working?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !working) onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel, working]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm"
        onClick={() => !working && onCancel()}
      />
      <div className="relative w-full max-w-sm animate-scale-in rounded-3xl bg-white p-7 shadow-modal">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.9} />
        </div>
        <h2 className="text-center text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 whitespace-pre-line text-center text-sm leading-relaxed text-ink-muted">
          {description}
        </p>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            disabled={working}
            className="flex-1 rounded-full border border-black/[0.12] py-3 text-[15px] font-medium text-ink transition-colors hover:bg-surface-gray disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={working}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
