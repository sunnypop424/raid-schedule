'use client';

import Link from 'next/link';
import { DEADLINE_BANNER_HOURS, DEADLINE_URGENT_HOURS } from '@/shared/config/constants';
import { useWeek } from '@/shared/lib/queries';
import { addWeeks, getWeekDates, getWeekStart, hoursUntilDeadline } from '@/shared/lib/week';
import { ClockIcon } from '@/shared/ui/icons';

/** 마감 24시간 전부터, 다음 주차를 다 채우지 않은 본인에게만 노출 */
export function DeadlineBanner({ memberId, now }: { memberId: number; now: Date }) {
  const nextWeek = addWeeks(getWeekStart(now), 1);
  const hours = hoursUntilDeadline(nextWeek, now);
  const inWindow = hours > 0 && hours <= DEADLINE_BANNER_HOURS;
  const { data } = useWeek(nextWeek);

  if (!inWindow || !data) return null;
  const filled = new Set(data.filter((r) => r.member_id === memberId).map((r) => r.date));
  if (getWeekDates(nextWeek).every((d) => filled.has(d))) return null;

  const urgent = hours <= DEADLINE_URGENT_HOURS;
  return (
    <Link
      href={`/week/me?w=${nextWeek}`}
      className="mb-3 flex min-h-11 items-center gap-2 rounded-ctl bg-primary-faint px-3 text-sm font-medium"
    >
      <ClockIcon width={18} height={18} className={urgent ? 'text-unavailable' : 'text-primary'} />
      <span>
        다음 주 일정 마감까지{' '}
        <span className={`font-bold tabular-nums ${urgent ? 'text-unavailable' : ''}`}>{hours}시간</span>{' '}
        남았습니다
      </span>
    </Link>
  );
}
