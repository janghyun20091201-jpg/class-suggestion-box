-- ══════════════════════════════════════════════════════════════════
--  관리자 로그인 잠금 기능 추가 (2026-08)
--  Supabase 대시보드 → SQL Editor 에 이 내용을 붙여넣고 Run 하세요.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.admin_login_attempts (
  id            text primary key,           -- 접속자 식별값(IP를 해시한 값)
  fail_count    int         not null default 0,
  locked_until  timestamptz,                -- 이 시각까지 로그인 시도 불가
  updated_at    timestamptz not null default timezone('utc'::text, now())
);

-- 서버(service_role)에서만 접근하므로 RLS를 켜고 정책은 두지 않습니다.
alter table public.admin_login_attempts enable row level security;
