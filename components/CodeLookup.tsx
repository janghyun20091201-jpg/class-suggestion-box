'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function CodeLookup() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      setError('접수코드 6자리 숫자를 입력해 주세요.');
      return;
    }
    setError(null);
    setMoving(true);
    router.push(`/check/${digits}`);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-card sm:p-6"
    >
      <label htmlFor="code" className="block text-sm font-medium text-ink">
        내 건의 답변 확인
      </label>
      <p className="mt-1 text-[13px] text-ink-muted">
        건의할 때 받은 6자리 숫자 코드를 입력하세요.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="예) 482913"
          className="focus-ring w-full flex-1 rounded-xl border border-black/[0.12] bg-white px-4 py-3 font-mono text-[15px] tracking-widest text-ink placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-muted"
        />
        <button
          type="submit"
          disabled={moving}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {moving ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Search className="h-4.5 w-4.5" />
          )}
          조회
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </p>
      )}
    </form>
  );
}
