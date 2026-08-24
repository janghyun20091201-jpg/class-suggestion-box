'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const KEY = 'adminActive';

/**
 * 관리자 영역을 벗어나면 세션을 끊습니다.
 *
 * 미들웨어(서버)만으로는 브라우저가 페이지를 캐시에서 꺼내 보여줄 때
 * 서버에 요청이 가지 않아 로그아웃이 안 되는 문제가 있습니다.
 * 이 컴포넌트는 캐시로 열린 페이지에서도 실행되므로 확실하게 처리됩니다.
 *
 * - /admin 안에 있으면: '관리자 영역에 있음' 표시를 남김
 * - /admin 밖으로 나가면: 표시를 지우고 로그아웃 요청
 * - 탭 전환은 페이지 이동이 아니므로 아무 일도 하지 않음
 * - 표시는 탭 단위(sessionStorage)라 다른 탭에 영향을 주지 않음
 */
export default function AdminSessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdminArea = pathname?.startsWith('/admin') ?? false;

    const sync = () => {
      try {
        if (isAdminArea) {
          sessionStorage.setItem(KEY, '1');
          return;
        }
        if (sessionStorage.getItem(KEY) === '1') {
          sessionStorage.removeItem(KEY);
          fetch('/api/admin/logout', { method: 'POST', keepalive: true }).catch(() => {});
        }
      } catch {
        // sessionStorage 사용 불가한 환경은 미들웨어가 처리
      }
    };

    sync();

    // 뒤로가기로 캐시된 페이지가 복원될 때도 확인
    const onShow = () => sync();
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [pathname]);

  return null;
}
