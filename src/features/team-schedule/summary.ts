import type { Availability, Member } from '@/shared/api/types';
import { RAID_SIZES } from '@/shared/config/constants';
import { commonStart } from '@/shared/lib/time';
import { getWeekDates, type DateString } from '@/shared/lib/week';
import type { StatusKey } from '@/shared/ui/status';

export interface DayCell {
  member: Member;
  /** 미입력이면 undefined */
  row: Availability | undefined;
  status: StatusKey;
}

export interface DaySummary {
  date: DateString;
  /** 멤버 sort_order 순 */
  cells: DayCell[];
  /** 가능(시작 시간 이른 순) → 미정 → 불가능 → 미입력. 막대·목록 표시용 */
  sorted: DayCell[];
  available: DayCell[];
  undecided: DayCell[];
  unavailable: DayCell[];
  none: DayCell[];
  /** 충족한 가장 큰 레이드 인원 (없으면 null) */
  raidSize: number | null;
  /** 전원 가능(가장 큰 기준 충족) */
  isFullRaid: boolean;
  /** 가능한 사람이 모두 모일 수 있는 시각(분). 전원 종일이거나 가능 인원이 없으면 null */
  start: number | null;
}

export interface WeekSummary {
  days: DaySummary[];
  submittedCount: number;
  /** 7일을 다 채우지 않은 멤버 */
  pendingMembers: Member[];
}

const byStart = (a: DayCell, b: DayCell) =>
  (a.row?.start_minutes ?? -1) - (b.row?.start_minutes ?? -1); // 종일이 맨 앞

export function summarizeWeek(
  weekStart: DateString,
  members: Member[],
  rows: Availability[],
  raidSizes: readonly number[] = RAID_SIZES,
): WeekSummary {
  const dates = getWeekDates(weekStart);
  const byKey = new Map(rows.map((r) => [`${r.member_id}:${r.date}`, r]));
  const maxSize = Math.max(...raidSizes);
  const sizesDesc = [...raidSizes].sort((a, b) => b - a);

  const days = dates.map((date): DaySummary => {
    const cells = members.map((member): DayCell => {
      const row = byKey.get(`${member.id}:${date}`);
      return { member, row, status: row?.status ?? 'none' };
    });
    const pick = (status: StatusKey) => cells.filter((c) => c.status === status);
    const available = pick('available').sort(byStart);
    const undecided = pick('undecided');
    const unavailable = pick('unavailable');
    const none = pick('none');
    const raidSize = sizesDesc.find((size) => available.length >= size) ?? null;

    return {
      date,
      cells,
      sorted: [...available, ...undecided, ...unavailable, ...none],
      available,
      undecided,
      unavailable,
      none,
      raidSize,
      isFullRaid: raidSize === maxSize,
      start: commonStart(available.map((c) => c.row?.start_minutes ?? null)),
    };
  });

  const pendingMembers = members.filter((m) => dates.some((date) => !byKey.has(`${m.id}:${date}`)));

  return { days, submittedCount: members.length - pendingMembers.length, pendingMembers };
}
