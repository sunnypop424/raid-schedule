-- 입력 모델 변경
--  · 상태: 가능 / 불가능 / 미정  ('partial' → 'undecided')
--  · 메모 대신 "가능 시작 시간"(30분 단위)을 날짜별로 받는다
--
-- start_minutes: 그날 00:00 기준 분. null = 종일.
--   00:00(0) ~ 23:30(1410), 30분 단위.
--   status = 'available' 일 때만 값을 가진다.

alter type availability_status rename value 'partial' to 'undecided';

alter table availabilities
  drop column note,
  add column start_minutes smallint
    check (start_minutes between 0 and 1410 and start_minutes % 30 = 0),
  add constraint availabilities_start_only_when_available
    check (start_minutes is null or status = 'available');

drop function set_availability(smallint, date, availability_status, text);

-- p_status = null 이면 미입력으로 되돌림(row 삭제).
create function set_availability(
  p_member_id     smallint,
  p_date          date,
  p_status        availability_status default null,
  p_start_minutes smallint default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today    date := kst_today();
  v_max_date date := week_start_of(kst_today()) + 13;
  v_deadline timestamptz := (week_start_of(p_date)::timestamp at time zone 'Asia/Seoul');
  v_prev     availability_status;
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
    insert into availabilities (member_id, week_start, date, status, start_minutes)
    values (
      p_member_id,
      week_start_of(p_date),
      p_date,
      p_status,
      case when p_status = 'available' then p_start_minutes else null end
    )
    on conflict (member_id, date) do update
      set status        = excluded.status,
          start_minutes = excluded.start_minutes;
  end if;

  if now() >= v_deadline and v_prev is distinct from p_status then
    insert into availability_logs (member_id, date, prev_status, next_status)
    values (p_member_id, p_date, v_prev, p_status);
  end if;
end;
$$;

revoke all on function set_availability(smallint, date, availability_status, smallint) from public;
grant execute on function set_availability(smallint, date, availability_status, smallint) to anon, authenticated;
