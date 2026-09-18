import { describe, expect, it } from 'vitest';
import type { Availability, AvailabilityStatus } from '@/shared/api/types';
import { SEED_MEMBERS } from '@/shared/config/members';
import { getWeekDates } from '@/shared/lib/week';
import { summarizeWeek } from './summary';

const WEEK = '2026-09-23';

const row = (
  memberId: number,
  date: string,
  status: AvailabilityStatus,
  start: number | null = null,
): Availability => ({
  member_id: memberId,
  week_start: WEEK,
  date,
  status,
  start_minutes: status === 'available' ? start : null,
  updated_at: '2026-09-20T00:00:00Z',
});

describe('summarizeWeek', () => {
  it('가능/미정/불가능/미입력을 따로 묶는다', () => {
    const rows = [
      row(1, WEEK, 'available'),
      row(2, WEEK, 'available'),
      row(3, WEEK, 'undecided'),
      row(4, WEEK, 'unavailable'),
    ];
    const [wed] = summarizeWeek(WEEK, SEED_MEMBERS, rows).days;
    expect(wed.available).toHaveLength(2);
    expect(wed.undecided).toHaveLength(1);
    expect(wed.unavailable).toHaveLength(1);
    expect(wed.none).toHaveLength(4);
    expect(wed.raidSize).toBeNull();
    expect(wed.sorted.map((c) => c.status)).toEqual([
      'available', 'available', 'undecided', 'unavailable', 'none', 'none', 'none', 'none',
    ]);
  });

  it('미정은 레이드 인원에 넣지 않는다', () => {
    const seven = [1, 2, 3, 4, 5, 6, 7].map((id) => row(id, WEEK, 'available'));
    const day = summarizeWeek(WEEK, SEED_MEMBERS, [...seven, row(8, WEEK, 'undecided')]).days[0];
    expect(day).toMatchObject({ raidSize: 4, isFullRaid: false });
  });

  it('8명 전원이면 8인', () => {
    const eight = SEED_MEMBERS.map((m) => row(m.id, WEEK, 'available'));
    expect(summarizeWeek(WEEK, SEED_MEMBERS, eight).days[0]).toMatchObject({
      raidSize: 8,
      isFullRaid: true,
      start: null, // 전원 종일
    });
  });

  it('모이는 시각은 가장 늦은 시작 시간, 가능 목록은 이른 순', () => {
    const rows = [
      row(1, WEEK, 'available', 1320), // 22:00
      row(2, WEEK, 'available'), // 종일
      row(3, WEEK, 'available', 1230), // 20:30
      row(4, WEEK, 'available', 23 * 60 + 30), // 23:30
    ];
    const day = summarizeWeek(WEEK, SEED_MEMBERS, rows).days[0];
    expect(day.start).toBe(23 * 60 + 30);
    expect(day.available.map((c) => c.member.id)).toEqual([2, 3, 1, 4]);
  });

  it('7일을 모두 채운 멤버만 제출 완료 (미정도 제출로 인정)', () => {
    const dates = getWeekDates(WEEK);
    const rows = [
      ...dates.map((d) => row(1, d, 'undecided')),
      ...dates.slice(0, 6).map((d) => row(2, d, 'unavailable')),
    ];
    const summary = summarizeWeek(WEEK, SEED_MEMBERS, rows);
    expect(summary.submittedCount).toBe(1);
    expect(summary.pendingMembers.map((m) => m.id)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });
});
