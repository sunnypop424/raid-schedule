import { afterEach, describe, expect, it } from 'vitest';
import {
  addWeeks,
  formatDay,
  formatWeekRange,
  getDeadline,
  getDefaultWeekStart,
  getWeekDates,
  getWeekKind,
  getWeekStart,
  hoursUntilDeadline,
  isChangedAfterDeadline,
  isEditableDate,
  isValidDateString,
  kstDate,
  normalizeWeekStart,
} from './week';

/** KST 시각 문자열 → Date */
const kst = (s: string) => new Date(`${s}+09:00`);

describe('kstDate', () => {
  it('UTC로는 전날이어도 KST 날짜를 돌려준다', () => {
    expect(kstDate(new Date('2026-09-15T15:00:00Z'))).toBe('2026-09-16'); // KST 09.16 00:00
    expect(kstDate(new Date('2026-09-15T14:59:59Z'))).toBe('2026-09-15'); // KST 09.15 23:59
  });
});

describe('getWeekStart', () => {
  it('수요일은 자기 자신', () => {
    expect(getWeekStart('2026-09-16')).toBe('2026-09-16');
  });

  it('화요일은 6일 전 수요일', () => {
    expect(getWeekStart('2026-09-22')).toBe('2026-09-16');
  });

  it('요일별로 같은 주차에 묶인다', () => {
    for (const d of getWeekDates('2026-09-16')) {
      expect(getWeekStart(d)).toBe('2026-09-16');
    }
    expect(getWeekStart('2026-09-23')).toBe('2026-09-23');
  });

  it('화→수 자정 경계 (KST)', () => {
    expect(getWeekStart(kst('2026-09-22T23:59:59'))).toBe('2026-09-16');
    expect(getWeekStart(kst('2026-09-23T00:00:00'))).toBe('2026-09-23');
  });

  it('연말 연도 전환', () => {
    // 2026-12-30(수) ~ 2027-01-05(화)
    expect(getWeekStart('2026-12-31')).toBe('2026-12-30');
    expect(getWeekStart('2027-01-01')).toBe('2026-12-30');
    expect(getWeekStart('2027-01-05')).toBe('2026-12-30');
    expect(getWeekStart('2027-01-06')).toBe('2027-01-06');
    expect(getWeekDates('2026-12-30')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
      '2027-01-04',
      '2027-01-05',
    ]);
  });

  it('윤일 포함 주차', () => {
    expect(getWeekDates('2028-02-23')).toContain('2028-02-29');
    expect(addWeeks('2028-02-23', 1)).toBe('2028-03-01');
  });
});

describe('브라우저 타임존 무관', () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it.each(['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC'])('%s 에서도 동일', (tz) => {
    process.env.TZ = tz;
    const now = kst('2026-09-23T00:30:00');
    expect(kstDate(now)).toBe('2026-09-23');
    expect(getWeekStart(now)).toBe('2026-09-23');
    expect(getDeadline('2026-09-23').toISOString()).toBe('2026-09-22T15:00:00.000Z');
  });
});

describe('마감', () => {
  it('마감은 주차 시작 수요일 00:00 KST', () => {
    expect(getDeadline('2026-09-23').toISOString()).toBe('2026-09-22T15:00:00.000Z');
  });

  it('화요일 23:59:59 수정은 마감 전, 수요일 00:00 수정은 마감 후', () => {
    expect(isChangedAfterDeadline(kst('2026-09-22T23:59:59'), '2026-09-23')).toBe(false);
    expect(isChangedAfterDeadline(kst('2026-09-23T00:00:00'), '2026-09-23')).toBe(true);
  });

  it('남은 시간은 올림, 지나면 0', () => {
    expect(hoursUntilDeadline('2026-09-23', kst('2026-09-22T19:00:00'))).toBe(5);
    expect(hoursUntilDeadline('2026-09-23', kst('2026-09-22T19:30:00'))).toBe(5);
    expect(hoursUntilDeadline('2026-09-23', kst('2026-09-23T01:00:00'))).toBe(0);
  });
});

describe('isEditableDate', () => {
  const now = kst('2026-09-18T21:00:00'); // 금요일, 주차 09.16~09.22

  it('오늘과 이후 날짜는 수정 가능', () => {
    expect(isEditableDate('2026-09-18', now)).toBe(true);
    expect(isEditableDate('2026-09-22', now)).toBe(true);
  });

  it('지난 날짜는 이번 주차라도 불가', () => {
    expect(isEditableDate('2026-09-17', now)).toBe(false);
    expect(isEditableDate('2026-09-16', now)).toBe(false);
  });

  it('다음 주차까지만 가능', () => {
    expect(isEditableDate('2026-09-29', now)).toBe(true);
    expect(isEditableDate('2026-09-30', now)).toBe(false);
  });

  it('KST 자정에 오늘이 바뀐다', () => {
    expect(isEditableDate('2026-09-18', kst('2026-09-18T23:59:59'))).toBe(true);
    expect(isEditableDate('2026-09-18', kst('2026-09-19T00:00:00'))).toBe(false);
  });
});

describe('주차 분류/보정', () => {
  const now = kst('2026-09-18T12:00:00');

  it('getWeekKind', () => {
    expect(getWeekKind('2026-09-09', now)).toBe('past');
    expect(getWeekKind('2026-09-16', now)).toBe('current');
    expect(getWeekKind('2026-09-23', now)).toBe('future');
  });

  it('normalizeWeekStart', () => {
    // 파라미터가 없거나 잘못되면 기본 주차(다음 주차)
    expect(getDefaultWeekStart(now)).toBe('2026-09-23');
    expect(normalizeWeekStart(null, now)).toBe('2026-09-23');
    expect(normalizeWeekStart('garbage', now)).toBe('2026-09-23');
    expect(normalizeWeekStart('2026-02-30', now)).toBe('2026-09-23');
    expect(normalizeWeekStart('2026-09-20', now)).toBe('2026-09-16'); // 수요일 아님 → 그 주 수요일 (진행 중 주차 수정용)
    expect(normalizeWeekStart('2026-09-02', now)).toBe('2026-09-02'); // 과거는 조회 허용
    expect(normalizeWeekStart('2027-01-06', now)).toBe('2026-09-23'); // 너무 먼 미래 → 다음 주차
  });

  it('isValidDateString', () => {
    expect(isValidDateString('2026-09-16')).toBe(true);
    expect(isValidDateString('2026-9-16')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
  });
});

describe('포맷', () => {
  it('날짜/주차 범위', () => {
    expect(formatDay('2026-09-16')).toBe('09.16(수)');
    expect(formatWeekRange('2026-09-16')).toBe('09.16(수) ~ 09.22(화)');
  });
});
