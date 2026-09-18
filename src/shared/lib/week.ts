import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import {
  DEADLINE_OFFSET_MS,
  MAX_WEEKS_AHEAD,
  TIME_ZONE,
} from '@/shared/config/constants';

/**
 * 주차·마감 계산. 모든 날짜는 KST 달력 날짜 문자열(`YYYY-MM-DD`)로 다룬다.
 * 브라우저 타임존에 의존하지 않도록 날짜 연산은 UTC 자정 기준으로만 한다.
 */

export type DateString = string; // YYYY-MM-DD

const DAY_MS = 86_400_000;
const WEDNESDAY = 3;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function toUtcMs(date: DateString): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): DateString {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isValidDateString(value: unknown): value is DateString {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return fromUtcMs(toUtcMs(value)) === value;
}

/** 주어진 시각의 KST 달력 날짜 */
export function kstDate(now: Date = new Date()): DateString {
  return formatInTimeZone(now, TIME_ZONE, 'yyyy-MM-dd');
}

export function addDays(date: DateString, days: number): DateString {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

export function addWeeks(weekStart: DateString, weeks: number): DateString {
  return addDays(weekStart, weeks * 7);
}

/** 0=일 ... 6=토 */
export function getWeekday(date: DateString): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

/** 해당 날짜 이전(당일 포함) 가장 가까운 수요일 */
export function getWeekStart(date: DateString | Date = new Date()): DateString {
  const d = typeof date === 'string' ? date : kstDate(date);
  const diff = (getWeekday(d) - WEDNESDAY + 7) % 7;
  return addDays(d, -diff);
}

export function isWeekStart(date: DateString): boolean {
  return getWeekday(date) === WEDNESDAY;
}

/** 수 → 화 7일 */
export function getWeekDates(weekStart: DateString): DateString[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** KST 자정의 실제 시각 */
export function kstMidnight(date: DateString): Date {
  return fromZonedTime(`${date}T00:00:00`, TIME_ZONE);
}

/** N주차 일정의 제출 마감 시각 (이 시각 이상이면 "마감 후") */
export function getDeadline(weekStart: DateString): Date {
  return new Date(kstMidnight(weekStart).getTime() + DEADLINE_OFFSET_MS);
}

export function isAfterDeadline(weekStart: DateString, at: Date = new Date()): boolean {
  return at.getTime() >= getDeadline(weekStart).getTime();
}

/** 마감 이후 수정된 칸인지 (`updated_at` 기준) */
export function isChangedAfterDeadline(updatedAt: string | Date, weekStart: DateString): boolean {
  return isAfterDeadline(weekStart, new Date(updatedAt));
}

/** 마감까지 남은 시간(시간 단위, 올림). 마감이 지났으면 0 */
export function hoursUntilDeadline(weekStart: DateString, now: Date = new Date()): number {
  const diff = getDeadline(weekStart).getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 3_600_000);
}

/** 이동/입력 가능한 가장 먼 주차 */
export function getMaxWeekStart(now: Date = new Date()): DateString {
  return addWeeks(getWeekStart(now), MAX_WEEKS_AHEAD);
}

/**
 * 앱에 들어왔을 때 기본으로 보여줄 주차 = 다음 주차.
 * 일정은 "다음 주 것을 이번 주 화요일까지" 내는 구조라, 지금 채워야 할 주차가 먼저 나온다.
 * 진행 중인 주차의 수정은 이전 주로 이동해서 한다.
 */
export function getDefaultWeekStart(now: Date = new Date()): DateString {
  return addWeeks(getWeekStart(now), 1);
}

/** 수정 가능 여부: KST 오늘 이후(당일 포함) && 허용된 가장 먼 주차 이내 */
export function isEditableDate(date: DateString, now: Date = new Date()): boolean {
  const today = kstDate(now);
  const lastEditable = addDays(getMaxWeekStart(now), 6);
  return date >= today && date <= lastEditable;
}

export type WeekKind = 'past' | 'current' | 'future';

export function getWeekKind(weekStart: DateString, now: Date = new Date()): WeekKind {
  const current = getWeekStart(now);
  if (weekStart < current) return 'past';
  return weekStart === current ? 'current' : 'future';
}

/** URL 파라미터 등 임의 입력을 유효한 주차 시작일로 보정 */
export function normalizeWeekStart(value: unknown, now: Date = new Date()): DateString {
  if (!isValidDateString(value)) return getDefaultWeekStart(now);
  const weekStart = getWeekStart(value);
  const max = getMaxWeekStart(now);
  return weekStart > max ? max : weekStart;
}

export function weekdayLabel(date: DateString): string {
  return WEEKDAY_LABELS[getWeekday(date)];
}

/** 토 = 파랑, 일 = 빨강 (글자에만 쓰는 Tailwind 클래스). 평일은 빈 문자열 */
export function weekdayTone(date: DateString): string {
  const day = getWeekday(date);
  return day === 6 ? 'text-sat' : day === 0 ? 'text-sun' : '';
}

/** `09.16(수)` */
export function formatDay(date: DateString): string {
  const [, m, d] = date.split('-');
  return `${m}.${d}(${weekdayLabel(date)})`;
}

/** `09.16(수) ~ 09.22(화)` */
export function formatWeekRange(weekStart: DateString): string {
  return `${formatDay(weekStart)} ~ ${formatDay(addDays(weekStart, 6))}`;
}

export function getYear(date: DateString): string {
  return date.slice(0, 4);
}

/** 24시간 이내는 상대 시간, 이후는 `MM.DD HH:mm` (KST) */
export function formatChangedAt(at: string | Date, now: Date = new Date()): string {
  const date = new Date(at);
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)}시간 전`;
  return formatInTimeZone(date, TIME_ZONE, 'MM.dd HH:mm');
}
