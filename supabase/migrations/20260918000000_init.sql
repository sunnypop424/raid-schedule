-- 레이드 일정 공유 캘린더 — 초기 스키마
-- 쓰기는 RPC(set_availability)로만 허용하고, 테이블 직접 쓰기는 RLS로 막는다.

create table members (
  id          smallint primary key,
  nickname    text not null unique,
  color       text not null,          -- hex
  sort_order  smallint not null,
  pin_hash    text                    -- P1, nullable
);

create type availability_status as enum ('available', 'partial', 'unavailable');

create table availabilities (
  id          bigint generated always as identity primary key,
  member_id   smallint not null references members(id),
  week_start  date not null,          -- 해당 주 수요일 (트리거로 자동 계산)
  date        date not null,
  status      availability_status not null,
  note        text check (char_length(note) <= 40),
  updated_at  timestamptz not null default now(),
  unique (member_id, date)
);

create index availabilities_week_start_idx on availabilities (week_start);

-- P1: 마감 후 변경 이력
create table availability_logs (
  id          bigint generated always as identity primary key,
  member_id   smallint not null references members(id),
  date        date not null,
  prev_status availability_status,    -- null = 미입력
  next_status availability_status,    -- null = 미입력으로 되돌림
  changed_at  timestamptz not null default now()
);

create index availability_logs_date_idx on availability_logs (date, changed_at desc);

-- ---------------------------------------------------------------------------
-- 주차 계산 (수요일 시작). extract(dow): 0=일 ... 3=수
-- ---------------------------------------------------------------------------
create function week_start_of(d date) returns date
language sql immutable
as $$
  select d - ((extract(dow from d)::int - 3 + 7) % 7);
$$;

create function kst_today() returns date
language sql stable
as $$
  select (now() at time zone 'Asia/Seoul')::date;
$$;

create function availabilities_set_derived() returns trigger
language plpgsql
as $$
begin
  new.week_start := week_start_of(new.date);
  new.updated_at := now();
  return new;
end;
$$;

create trigger availabilities_set_derived
before insert or update on availabilities
for each row execute function availabilities_set_derived();

-- ---------------------------------------------------------------------------
-- 쓰기 RPC. p_status = null 이면 미입력으로 되돌림(row 삭제).
--  - 지난 날짜(KST) 수정 불가
--  - 다음 주차까지만 입력 가능 (constants.ts 의 MAX_WEEKS_AHEAD 와 맞출 것)
--  - 마감(주차 시작 수요일 00:00 KST) 이후의 상태 변경은 availability_logs 에 기록
-- ---------------------------------------------------------------------------
create function set_availability(
  p_member_id smallint,
  p_date      date,
  p_status    availability_status default null,
  p_note      text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today       date := kst_today();
  v_max_date    date := week_start_of(kst_today()) + 13;
  v_deadline    timestamptz := (week_start_of(p_date)::timestamp at time zone 'Asia/Seoul');
  v_prev        availability_status;
  v_note        text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if not exists (select 1 from members where id = p_member_id) then
    raise exception 'unknown member %', p_member_id using errcode = 'P0002';
  end if;

  if p_date < v_today then
    raise exception 'past date is read-only' using errcode = 'P0001', hint = 'PAST_DATE';
  end if;

  if p_date > v_max_date then
    raise exception 'date is too far ahead' using errcode = 'P0001', hint = 'TOO_FAR';
  end if;

  select status into v_prev
    from availabilities
   where member_id = p_member_id and date = p_date;

  if p_status is null then
    delete from availabilities where member_id = p_member_id and date = p_date;
  else
    insert into availabilities (member_id, week_start, date, status, note)
    values (
      p_member_id,
      week_start_of(p_date),
      p_date,
      p_status,
      case when p_status = 'partial' then v_note else null end
    )
    on conflict (member_id, date) do update
      set status = excluded.status,
          note   = excluded.note;
  end if;

  if now() >= v_deadline and v_prev is distinct from p_status then
    insert into availability_logs (member_id, date, prev_status, next_status)
    values (p_member_id, p_date, v_prev, p_status);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 권한 / RLS: anon 은 읽기 + RPC 실행만
-- ---------------------------------------------------------------------------
alter table members            enable row level security;
alter table availabilities     enable row level security;
alter table availability_logs  enable row level security;

create policy "read members"           on members           for select to anon, authenticated using (true);
create policy "read availabilities"    on availabilities    for select to anon, authenticated using (true);
create policy "read availability_logs" on availability_logs for select to anon, authenticated using (true);

-- pin_hash 는 클라이언트에 노출하지 않는다
revoke all on members, availabilities, availability_logs from anon, authenticated;
grant select (id, nickname, color, sort_order) on members to anon, authenticated;
grant select on availabilities, availability_logs to anon, authenticated;

revoke all on function set_availability(smallint, date, availability_status, text) from public;
grant execute on function set_availability(smallint, date, availability_status, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table availabilities;
