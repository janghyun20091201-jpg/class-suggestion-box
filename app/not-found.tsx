import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-bold tracking-tight text-ink">404</p>
      <h1 className="mt-3 text-xl font-semibold text-ink">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-appleblue px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-appleblue-hover"
      >
        <Home className="h-4.5 w-4.5" /> 홈으로 돌아가기
      </Link>
    </div>
  );
}
