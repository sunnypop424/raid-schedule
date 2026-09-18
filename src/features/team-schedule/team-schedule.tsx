'use client';

import { useState } from 'react';
import { useMembers, useWeek } from '@/shared/lib/queries';
import { commonStartLabel, slotShort } from '@/shared/lib/time';
import {
  formatChangedAt,
  formatDay,
  isChangedAfterDeadline,
  kstDate,
  weekdayLabel,
  weekdayTone,
  type DateString,
} from '@/shared/lib/week';
import { AlertIcon } from '@/shared/ui/icons';
import { STATUS_META, StatusGlyph, type StatusKey } from '@/shared/ui/status';
import { summarizeWeek, type DayCell, type DaySummary, type WeekSummary } from './summary';

interface TeamScheduleProps {
  weekStart: DateString;
  now: Date;
  currentMemberId: number;
}

/**
 * 확정 시안 S4(모바일) / L4(데스크톱): 날짜마다 독립 카드, 전원 가능한 날은 퍼플 반전.
 * 카드를 누르면 닉네임·시간이 펼쳐진다.
 */
export function TeamSchedule({ weekStart, now, currentMemberId }: TeamScheduleProps) {
  const members = useMembers();
  const week = useWeek(weekStart);
  const [openDate, setOpenDate] = useState<DateString | null>(null);

  if (members.isError || week.isError) {
    return (
      <div className="rounded-card border border-line bg-card p-4">
        <p className="flex gap-2 text-fg-secondary">
          <AlertIcon className="shrink-0 text-unavailable" />
          일정을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => {
            void members.refetch();
            void week.refetch();
          }}
          className="mt-3 h-11 rounded-ctl bg-primary px-4 font-medium text-white active:bg-primary-strong"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!members.data || !week.data) {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        <div className="h-[68px] animate-pulse-flat rounded-card bg-alt" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-[92px] animate-pulse-flat rounded-card bg-alt lg:h-[76px]" />
        ))}
      </div>
    );
  }

  const summary = summarizeWeek(weekStart, members.data, week.data);
  const today = kstDate(now);

  return (
    <section
      aria-label="전체 일정"
      className={`flex flex-col gap-3 transition-opacity duration-200 ${
        week.isPlaceholderData ? 'opacity-60' : ''
      }`}
    >
      <Submission summary={summary} total={members.data.length} />
      <div className="flex justify-end px-1">
        <Legend />
      </div>

      <ul className="flex flex-col gap-2">
        {summary.days.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            weekStart={weekStart}
            now={now}
            isPast={day.date < today}
            isToday={day.date === today}
            open={openDate === day.date}
            onToggle={() => setOpenDate(openDate === day.date ? null : day.date)}
            currentMemberId={currentMemberId}
          />
        ))}
      </ul>
    </section>
  );
}

/** 확정 시안 P3: 큰 숫자 + 한 문장, 카드 아래 진행선 */
function Submission({ summary, total }: { summary: WeekSummary; total: number }) {
  const count = summary.submittedCount;
  const pending = summary.pendingMembers;
  const done = count === total;

  return (
    <div className="overflow-hidden rounded-card bg-card">
      <div className="flex items-center gap-4 p-4">
        <p className="flex items-baseline gap-px whitespace-nowrap">
          <span
            className={`text-[32px] leading-none font-bold tabular-nums ${done ? 'text-primary' : ''}`}
          >
            {count}
          </span>
          <span className="font-medium text-fg-tertiary">/{total}</span>
        </p>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] font-bold">
            {done
              ? '전원 제출을 완료했습니다'
              : count === 0
                ? '아직 제출한 공대원이 없습니다'
                : `${pending.length}명이 아직 제출하지 않았습니다`}
          </p>
          {!done && count > 0 && (
            <p className="text-[13px] leading-[1.45] text-fg-secondary">
              {pending.map((m) => m.nickname).join(', ')}
            </p>
          )}
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="제출 현황"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={count}
        className="flex h-1 bg-raised"
      >
        <span
          className="bg-primary transition-[width] duration-200"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

const LEGEND: StatusKey[] = ['available', 'undecided', 'unavailable', 'none'];

function Legend() {
  return (
    <ul className="flex shrink-0 gap-2.5 text-xs text-fg-tertiary" aria-label="범례">
      {LEGEND.map((status) => (
        <li key={status} className="flex items-center gap-0.5">
          <span className={STATUS_META[status].text}>
            <StatusGlyph status={status} size={12} />
          </span>
          {STATUS_META[status].label}
        </li>
      ))}
    </ul>
  );
}

const SEGMENT: Record<StatusKey, string> = {
  available: 'bg-available',
  undecided: 'bg-undecided',
  unavailable: 'bg-unavailable',
  none: 'bg-none',
};

function restCounts(day: DaySummary): string {
  return [
    day.undecided.length ? `미정 ${day.undecided.length}` : '',
    day.unavailable.length ? `불가 ${day.unavailable.length}` : '',
    day.none.length ? `미입력 ${day.none.length}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

interface DayCardProps {
  day: DaySummary;
  weekStart: DateString;
  now: Date;
  isPast: boolean;
  isToday: boolean;
  open: boolean;
  onToggle: () => void;
  currentMemberId: number;
}

function DayCard({ day, weekStart, now, isPast, isToday, open, onToggle, currentMemberId }: DayCardProps) {
  const inverse = day.isFullRaid;
  const count = day.available.length;
  const rest = restCounts(day);
  const raidLabel = day.raidSize ? `${day.raidSize}인 · ${commonStartLabel(day.start)}` : null;
  const changed = day.cells.some((c) => c.row && isChangedAfterDeadline(c.row.updated_at, weekStart));
  const sub = inverse ? 'text-white' : 'text-fg-secondary';

  return (
    <li
      className={`rounded-card border ${
        inverse
          ? 'border-transparent bg-primary text-white'
          : day.raidSize
            ? 'border-primary-subtle bg-card'
            : 'border-transparent bg-card'
      } ${isPast ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3.5 text-left lg:h-[76px] lg:grid-cols-[110px_minmax(0,1fr)_210px] lg:gap-x-6 lg:px-5 lg:py-0"
      >
        <span className="flex items-center gap-1.5 font-bold whitespace-nowrap tabular-nums lg:text-[17px]">
          <span aria-label={formatDay(day.date)}>
            {day.date.slice(5).replace('-', '.')}
            {/* 반전 카드는 글씨가 흰색이라 요일 색을 쓰지 않는다 */}
            <span className={inverse ? '' : weekdayTone(day.date)}>({weekdayLabel(day.date)})</span>
          </span>
          {isToday && (
            <span className={`text-xs font-medium ${inverse ? 'text-white' : 'text-primary'}`}>오늘</span>
          )}
          {changed && <span aria-label="마감 후 변경 있음" className="size-1.5 rounded-full bg-info" />}
        </span>

        {/* 모바일: 우측 한 줄 요약 / 데스크톱: 큰 숫자 + 보조 */}
        <span className="text-sm font-bold whitespace-nowrap tabular-nums lg:hidden">
          {day.raidSize ? `${day.raidSize}인 가능 · ${commonStartLabel(day.start)}` : `가능 ${count}명`}
        </span>

        <span className="col-span-2 flex min-w-0 flex-col gap-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <span className="flex gap-0.5" aria-hidden>
            {day.sorted.map((c) => (
              <span
                key={c.member.id}
                className={`h-2.5 flex-1 rounded-xs ${
                  inverse ? (c.status === 'available' ? 'bg-white' : 'bg-white/35') : SEGMENT[c.status]
                }`}
              />
            ))}
          </span>
          <span className={`text-xs tabular-nums lg:hidden ${sub}`}>
            가능 {count}
            {rest ? ` · ${rest}` : ' · 전원 가능'}
          </span>
          <span className={`hidden truncate text-xs tabular-nums lg:block ${sub}`}>
            {count
              ? day.available
                  .map((c) => `${c.member.nickname} ${slotShort(c.row?.start_minutes ?? null)}`)
                  .join(' · ')
              : '아직 가능한 공대원이 없습니다'}
          </span>
        </span>

        <span className="hidden flex-col items-end leading-tight lg:col-start-3 lg:row-start-1 lg:flex">
          <span className="text-xl font-bold tabular-nums">
            {count}
            <span className="text-[13px] font-medium"> /{day.cells.length} 가능</span>
          </span>
          <span
            className={`text-[13px] font-medium tabular-nums ${
              inverse ? 'text-white' : raidLabel ? 'text-primary-strong dark:text-on-primary-subtle' : 'text-fg-tertiary'
            }`}
          >
            {raidLabel ?? (rest || '인원 부족')}
          </span>
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-4 pb-3.5 lg:px-5 lg:pb-4">
          {count > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {day.available.map((c) => (
                <li key={c.member.id}>
                  <MemberChip
                    cell={c}
                    inverse={inverse}
                    isMe={c.member.id === currentMemberId}
                    changedAt={changedAt(c, weekStart, now)}
                  />
                </li>
              ))}
            </ul>
          )}
          <RestLine status="undecided" cells={day.undecided} inverse={inverse} />
          <RestLine status="unavailable" cells={day.unavailable} inverse={inverse} />
          <RestLine status="none" cells={day.none} inverse={inverse} />
        </div>
      )}
    </li>
  );
}

function changedAt(cell: DayCell, weekStart: DateString, now: Date): string | null {
  if (!cell.row || !isChangedAfterDeadline(cell.row.updated_at, weekStart)) return null;
  return formatChangedAt(cell.row.updated_at, now);
}

interface MemberChipProps {
  cell: DayCell;
  inverse: boolean;
  isMe: boolean;
  changedAt: string | null;
}

function MemberChip({ cell, inverse, isMe, changedAt }: MemberChipProps) {
  return (
    <span
      title={changedAt ? `마감 후 변경됨 · ${changedAt}` : undefined}
      className={`relative inline-flex h-8 items-center gap-1 rounded-ctl px-2 text-sm font-medium ${
        inverse ? 'bg-white/20' : 'bg-available-tint'
      } ${isMe ? `outline outline-1 -outline-offset-1 ${inverse ? 'outline-white' : 'outline-fg'}` : ''}`}
    >
      {!inverse && (
        <span className="text-available">
          <StatusGlyph status="available" size={12} />
        </span>
      )}
      {cell.member.nickname}
      <span className={`text-xs font-bold tabular-nums ${inverse ? '' : 'text-available-text'}`}>
        {slotShort(cell.row?.start_minutes ?? null)}
      </span>
      {changedAt && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-info" />}
    </span>
  );
}

function RestLine({ status, cells, inverse }: { status: StatusKey; cells: DayCell[]; inverse: boolean }) {
  if (cells.length === 0) return null;
  const meta = STATUS_META[status];
  return (
    <p className={`flex gap-1.5 text-[13px] leading-normal ${inverse ? 'text-white' : 'text-fg-secondary'}`}>
      <span className={`mt-[3px] shrink-0 ${inverse ? '' : meta.text}`}>
        <StatusGlyph status={status} size={12} />
      </span>
      <span>
        <span className={`font-medium ${inverse ? '' : meta.strong}`}>{meta.label}</span> ·{' '}
        {cells.map((c) => c.member.nickname).join(', ')}
      </span>
    </p>
  );
}
