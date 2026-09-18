'use client';

import Link from 'next/link';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import type { Availability, AvailabilityStatus, Member } from '@/shared/api/types';
import { useAutosave, useWeek, type SaveChange, type SaveState } from '@/shared/lib/queries';
import { slotLabel, TIME_SLOTS } from '@/shared/lib/time';
import {
  addWeeks,
  formatDay,
  getWeekDates,
  getWeekKind,
  isEditableDate,
  kstDate,
  weekdayLabel,
  weekdayTone,
  type DateString,
} from '@/shared/lib/week';
import { Avatar } from '@/shared/ui/avatar';
import { AlertIcon, CheckIcon, ChevronDown, LockIcon } from '@/shared/ui/icons';
import { STATUS_META, STATUS_ORDER } from '@/shared/ui/status';

interface MyScheduleProps {
  /** 멤버 목록을 아직 못 불러왔으면 undefined */
  member: Member | undefined;
  memberId: number;
  weekStart: DateString;
  now: Date;
}

const GLYPH: Record<AvailabilityStatus, string> = { available: '○', unavailable: '✕', undecided: '△' };
const ALL_DAY = 'all';
const ROW_GRID = 'grid grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2';

/** 확정 시안 3번: 날짜 | 가능 여부 셀렉트 | 시간 셀렉트 — 7일이 한 화면에 들어온다 */
export function MySchedule({ member, memberId, weekStart, now }: MyScheduleProps) {
  const week = useWeek(weekStart);
  const prevWeek = useWeek(addWeeks(weekStart, -1));
  const { save, state, error } = useAutosave(memberId);

  const dates = getWeekDates(weekStart);
  const today = kstDate(now);
  const editableDates = dates.filter((d) => isEditableDate(d, now));
  const mine = new Map(
    (week.data ?? []).filter((r) => r.member_id === memberId).map((r) => [r.date, r]),
  );
  const prevMine = (prevWeek.data ?? []).filter((r) => r.member_id === memberId);
  const readOnlyWeek = getWeekKind(weekStart, now) === 'past';
  const filled = dates.filter((d) => mine.has(d)).length;

  const setAll = (status: AvailabilityStatus) =>
    save(editableDates.map((date) => ({ date, status, startMinutes: null })));

  const copyPrevWeek = () => {
    const changes: SaveChange[] = [];
    for (const row of prevMine) {
      const date = dates[getWeekDates(row.week_start).indexOf(row.date)];
      if (date && editableDates.includes(date)) {
        changes.push({ date, status: row.status, startMinutes: row.start_minutes });
      }
    }
    save(changes);
  };

  if (week.isError) {
    return (
      <div className="rounded-card border border-line bg-card p-4">
        <p className="flex gap-2 text-fg-secondary">
          <AlertIcon className="shrink-0 text-unavailable" />
          일정을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => week.refetch()}
          className="mt-3 h-11 rounded-ctl bg-primary px-4 font-medium text-white active:bg-primary-strong"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <section aria-label="내 일정 입력" className="flex flex-col gap-3">
      {!readOnlyWeek && (
        <div className="grid grid-cols-3 gap-2">
          <QuickButton onClick={() => setAll('available')} disabled={editableDates.length === 0}>
            전부 가능
          </QuickButton>
          <QuickButton onClick={() => setAll('unavailable')} disabled={editableDates.length === 0}>
            전부 불가능
          </QuickButton>
          <QuickButton
            onClick={copyPrevWeek}
            disabled={editableDates.length === 0 || prevMine.length === 0}
          >
            지난주와 동일
          </QuickButton>
        </div>
      )}

      <div className="rounded-card bg-card lg:rounded-none lg:bg-transparent">
        <div className="flex items-center gap-2.5 border-b border-line px-3 py-3.5 lg:px-0 lg:pt-0">
          {member ? (
            <Avatar member={member} size={36} />
          ) : (
            <span className="size-9 shrink-0 animate-pulse-flat rounded-full bg-alt" />
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-bold">{member?.nickname}</p>
            <p className="flex flex-wrap items-center gap-x-1 text-xs text-fg-tertiary tabular-nums">
              <span>
                {readOnlyWeek ? (
                  '지난 주 일정은 조회만 가능합니다'
                ) : filled === 7 ? (
                  <span className="font-medium text-primary">제출 완료</span>
                ) : filled === 0 ? (
                  '가능 여부를 선택해 주세요'
                ) : (
                  `${filled}/7 입력`
                )}
              </span>
              <SaveIndicator state={state} error={error} />
            </p>
          </div>
          <Link
            href="/select"
            className="flex h-9 shrink-0 items-center rounded-ctl bg-primary-subtle px-3 text-sm font-medium text-on-primary-subtle"
          >
            닉네임 변경
          </Link>
        </div>
        <div
          className={`${ROW_GRID} h-9 border-b border-line px-3 text-xs text-fg-tertiary lg:px-0`}
          aria-hidden
        >
          <span>날짜</span>
          <span>가능 여부</span>
          <span>시간</span>
        </div>
        <ul className="divide-y divide-line">
          {dates.map((date) =>
            week.isPending ? (
              <li key={date} className="flex h-16 items-center px-3 lg:px-0">
                <div className="h-11 w-full animate-pulse-flat rounded-ctl bg-alt" />
              </li>
            ) : (
              <DayRow
                key={date}
                date={date}
                row={mine.get(date)}
                isToday={date === today}
                editable={isEditableDate(date, now)}
                onChange={(change) => save([{ date, ...change }])}
              />
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

function QuickButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="h-11 rounded-ctl bg-card text-sm font-medium transition-colors duration-100 active:bg-raised disabled:text-fg-disabled lg:bg-raised"
    />
  );
}

interface DayRowProps {
  date: DateString;
  row: Availability | undefined;
  isToday: boolean;
  editable: boolean;
  onChange: (change: Omit<SaveChange, 'date'>) => void;
}

function DayRow({ date, row, isToday, editable, onChange }: DayRowProps) {
  const status = row?.status ?? null;
  const meta = status ? STATUS_META[status] : null;
  const timeEnabled = editable && status === 'available';

  return (
    <li className={`${ROW_GRID} h-16 px-3 lg:px-0 ${editable ? '' : 'opacity-60'}`}>
      <div className="leading-tight">
        <p className={`flex items-center gap-1 text-[17px] font-bold ${weekdayTone(date)}`}>
          {weekdayLabel(date)}
          {!editable && <LockIcon width={12} height={12} aria-label="수정 불가" />}
        </p>
        <p className="text-sm font-medium text-fg-secondary tabular-nums">
          {date.slice(5).replace('-', '.')}
          {isToday && <span className="ml-1 text-xs font-bold text-primary">오늘</span>}
        </p>
      </div>

      <Select
        aria-label={`${formatDay(date)} 가능 여부`}
        disabled={!editable}
        value={status ?? ''}
        onChange={(e) => {
          const next = (e.target.value || null) as AvailabilityStatus | null;
          onChange({
            status: next,
            startMinutes: next === 'available' ? (row?.start_minutes ?? null) : null,
          });
        }}
        tone={
          meta
            ? `${meta.tint} ${meta.strong} border-current font-bold`
            : 'border-line-input bg-card text-fg-tertiary'
        }
      >
        <option value="">- 선택 -</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {GLYPH[s]} {STATUS_META[s].label}
          </option>
        ))}
      </Select>

      <Select
        aria-label={`${formatDay(date)} 시간`}
        disabled={!timeEnabled}
        value={status !== 'available' ? '' : (row?.start_minutes ?? ALL_DAY)}
        onChange={(e) =>
          onChange({
            status: 'available',
            startMinutes: e.target.value === ALL_DAY ? null : Number(e.target.value),
          })
        }
        tone="border-line-input bg-card text-fg tabular-nums disabled:bg-alt disabled:text-fg-disabled"
      >
        {status !== 'available' && <option value="">시간</option>}
        <option value={ALL_DAY}>{slotLabel(null)}</option>
        {TIME_SLOTS.map((m) => (
          <option key={m} value={m}>
            {slotLabel(m)}
          </option>
        ))}
      </Select>
    </li>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  tone: string;
  children: ReactNode;
}

function Select({ tone, children, className = '', ...props }: SelectProps) {
  return (
    <div className="relative min-w-0">
      <select
        {...props}
        className={`h-11 w-full appearance-none rounded-ctl border pr-8 pl-2.5 text-[15px] disabled:opacity-100 ${tone} ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        width={18}
        height={18}
        className={`pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 ${
          props.disabled ? 'text-fg-disabled' : 'text-fg-tertiary'
        }`}
      />
    </div>
  );
}

function SaveIndicator({ state, error }: { state: SaveState; error: string | null }) {
  if (state === 'saving') return <span>· 저장 중입니다</span>;
  if (state === 'saved') {
    return (
      <span className="flex items-center gap-0.5">
        · 저장되었습니다
        <CheckIcon width={14} height={14} className="text-primary" />
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span role="alert" className="flex items-center gap-1 text-fg-secondary">
        <AlertIcon width={14} height={14} className="text-unavailable" />
        {error}
      </span>
    );
  }
  return null;
}
