'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText, ImageIcon, Paperclip } from 'lucide-react';
import {
  ALLOWED_EXT,
  MAX_FILE_MB,
  MAX_FILES,
  isAllowedFile,
  humanSize,
  extOf,
} from '@/lib/utils';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg'];

export default function FileDropzone({
  files,
  onChange,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const list = Array.from(incoming);
      const next = [...files];
      for (const f of list) {
        if (!isAllowedFile(f.name)) {
          setError(`허용되지 않는 형식입니다: ${f.name}`);
          continue;
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          setError(`"${f.name}" 파일이 너무 큽니다 (최대 ${MAX_FILE_MB}MB).`);
          continue;
        }
        // 이름+크기로 중복 제거
        if (next.some((e) => e.name === f.name && e.size === f.size)) continue;
        if (next.length >= MAX_FILES) {
          setError(`첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);
          break;
        }
        next.push(f);
      }
      onChange(next);
    },
    [files, onChange]
  );

  const removeAt = (i: number) => {
    const next = files.filter((_, idx) => idx !== i);
    onChange(next);
    setError(null);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-all duration-200 ${
          dragging
            ? 'border-appleblue bg-appleblue/[0.04]'
            : 'border-black/15 bg-surface-gray/60 hover:border-black/25 hover:bg-surface-gray'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
          <Upload className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
        </div>
        <p className="text-sm font-medium text-ink">
          파일을 끌어다 놓거나 <span className="text-appleblue">클릭하여 선택</span>
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          이미지(PNG, JPG) · 문서(PDF, DOCX, HWP, ZIP) · 최대 {MAX_FILE_MB}MB · {MAX_FILES}개까지
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXT.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
          <X className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => {
            const isImg = IMAGE_EXT.includes(extOf(f.name));
            return (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3 py-2.5"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-gray text-ink-soft">
                  {isImg ? (
                    <ImageIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  ) : (
                    <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                  <p className="text-xs text-ink-muted">{humanSize(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-gray hover:text-ink disabled:opacity-40"
                  aria-label="첨부 삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {files.length === 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Paperclip className="h-3.5 w-3.5" /> 첨부파일은 선택 사항입니다.
        </p>
      )}
    </div>
  );
}
