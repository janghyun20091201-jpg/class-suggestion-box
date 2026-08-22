import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/constants';

/**
 * 관리자 영역(/admin, /api/admin)을 벗어나는 순간 관리자 세션을 끊습니다.
 *
 * - 홈(/)이나 건의 페이지로 "실제로 이동"하면 즉시 로그아웃됩니다.
 * - 탭만 전환하는 것은 요청이 없으므로 로그인 상태가 유지됩니다.
 * - Next.js가 미리 받아두는 prefetch 요청 때문에 로그아웃되면 안 되므로
 *   실제 페이지 이동(sec-fetch-mode: navigate)일 때만 세션을 지웁니다.
 *   (prefetch·데이터 요청은 cors/same-origin 으로 들어옵니다)
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 관리자 영역 안이면 그대로 통과
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // 세션이 없으면 할 일 없음
  if (!req.cookies.has(ADMIN_COOKIE)) {
    return NextResponse.next();
  }

  // 실제 페이지 이동인지 확인 (prefetch/데이터 요청이면 건드리지 않음)
  const mode = req.headers.get('sec-fetch-mode');
  const isRealNavigation = mode === null || mode === 'navigate';
  if (!isRealNavigation) {
    return NextResponse.next();
  }

  // 관리자 영역 밖으로 나갔으므로 세션 종료
  const res = NextResponse.next();
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
