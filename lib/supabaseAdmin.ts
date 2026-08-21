import { createClient } from '@supabase/supabase-js';

/**
 * 서버 전용 Supabase 클라이언트.
 * service_role 키를 사용하므로 절대 클라이언트 컴포넌트에서 import 하지 마세요.
 * (route handler / server action 안에서만 사용)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  // 빌드 시 route 모듈을 import 할 때 createClient 가 빈 URL로 throw 하지 않도록
  // placeholder 로 대체합니다. 실제 요청은 환경변수가 설정되어야 정상 동작합니다.
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
  }
);

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'attachments';
