import { createClient } from '@supabase/supabase-js';

/**
 * 서버 전용 Supabase 클라이언트.
 * service_role(secret) 키를 사용하므로 절대 클라이언트 컴포넌트에서 import 하지 마세요.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. (.env.local 확인)'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      // Next.js 가 fetch 결과를 캐시하면 삭제·수정된 건의가 계속 보일 수 있으므로
      // Supabase 요청은 항상 캐시 없이 최신 데이터를 읽습니다.
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  }
);
