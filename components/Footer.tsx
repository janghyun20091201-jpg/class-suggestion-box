import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-surface-gray">
      <div className="mx-auto max-w-content px-5 py-8 sm:px-6">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          우리 반 건의함은 학급 구성원 누구나 솔직한 의견을 남길 수 있는 공간입니다.
          <br className="hidden sm:block" />
          제출한 건의는 학급 임원과 담임 선생님이 확인하고 답변합니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            홈
          </Link>
          <span className="text-black/10">·</span>
          <Link href="/check" className="transition-colors hover:text-ink">
            답변 확인하기
          </Link>
          <span className="text-black/10">·</span>
          <Link href="/admin" className="transition-colors hover:text-ink">
            관리자
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-muted/70">
          © {new Date().getFullYear()} 우리 반 건의함
        </p>
      </div>
    </footer>
  );
}
