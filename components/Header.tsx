import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';

// 홈 링크는 일반 <a> 를 씁니다.
// 관리자 페이지에서 홈으로 나갈 때 실제 페이지 이동이 일어나야
// 서버(미들웨어)가 관리자 세션을 끊을 수 있기 때문입니다.

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-content items-center justify-between px-5 sm:h-14 sm:px-6">
        <a
          href="/"
          className="group flex items-center gap-2 text-ink transition-opacity hover:opacity-70"
        >
          <MessageSquareText className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight sm:text-base">
            11-3 건의함
          </span>
        </a>
        <nav className="flex items-center text-[13px] sm:text-sm">
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-ink-soft transition-colors hover:bg-surface-gray hover:text-ink"
          >
            관리자
          </Link>
        </nav>
      </div>
    </header>
  );
}
