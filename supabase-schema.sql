-- ══════════════════════════════════════════════════════════════════
--  11-3 건의함 — Supabase 스키마
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ══════════════════════════════════════════════════════════════════

-- 1) 건의 테이블 ---------------------------------------------------------
create table if not exists public.suggestions (
  id           uuid primary key default gen_random_uuid(),
  type         varchar(10)  not null,                 -- 'ANONYMOUS' | 'NAMED'
  author_name  varchar(50),                           -- 일반 건의일 때 학생 이름
  content      text         not null,
  status       varchar(20)  default '접수됨',          -- '접수됨' | '완료'
  admin_reply  text,
  ticket_code  varchar(10)  unique not null,          -- 숫자 6자리 (예: 482913)
  created_at   timestamptz  not null default timezone('utc'::text, now())
);

-- 조회 성능용 인덱스
create index if not exists suggestions_ticket_code_idx on public.suggestions (ticket_code);
create index if not exists suggestions_created_at_idx  on public.suggestions (created_at desc);
create index if not exists suggestions_status_idx      on public.suggestions (status);

-- 2) 행 수준 보안(RLS) --------------------------------------------------
-- 이 앱의 모든 DB 접근은 서버 라우트에서 service_role 키로만 이루어집니다.
-- anon/public 키로는 어떤 행도 읽거나 쓸 수 없도록 RLS를 켜고 정책을 두지 않습니다.
-- (service_role 은 RLS를 우회하므로 서버 코드는 정상 동작합니다.)
alter table public.suggestions enable row level security;

-- 정책을 별도로 만들지 않음 → anon 클라이언트는 접근 불가(안전).
