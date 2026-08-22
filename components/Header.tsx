import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-content items-center justify-between px-5 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-ink transition-opacity hover:opacity-70"
        >
          <MessageSquareText className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight sm:text-base">
            11-3 건의함
          </span>
        </Link>
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
