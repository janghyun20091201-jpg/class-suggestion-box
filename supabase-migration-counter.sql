-- ══════════════════════════════════════════════════════════════════
--  누적 건의 번호 추가 (삭제해도 번호가 줄어들지 않음)
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하세요.
-- ══════════════════════════════════════════════════════════════════

-- 1) 번호를 발급하는 시퀀스 (한 번 발급한 번호는 다시 쓰지 않음)
create sequence if not exists public.suggestion_seq;

-- 2) 건의 표에 누적 번호 칸 추가
alter table public.suggestions
  add column if not exists seq bigint default nextval('public.suggestion_seq');

-- 3) 기존 건의에 번호 채우기 (오래된 순서대로 1, 2, 3...)
with ordered as (
  select id, row_number() over (order by created_at) as rn
  from public.suggestions
  where seq is null
)
update public.suggestions s
set seq = o.rn
from ordered o
where s.id = o.id;

-- 4) 시퀀스를 현재 최대 번호 뒤로 맞추기 (다음 건의부터 이어서 발급)
do $$
declare m bigint;
begin
  select coalesce(max(seq), 0) into m from public.suggestions;
  if m > 0 then
    perform setval('public.suggestion_seq', m);
  end if;
end $$;
