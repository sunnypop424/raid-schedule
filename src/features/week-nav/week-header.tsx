'use client';

import Link from 'next/link';
import {
  addWeeks,
  formatWeekRange,
  getDefaultWeekStart,
  getMaxWeekStart,
  getWeekStart,
  getYear,
  type DateString,
} from '@/shared/lib/week';
import { ChevronLeft, ChevronRight } from '@/shared/ui/icons';

interface WeekHeaderProps {
  weekStart: DateString;
  now: Date;
  /** 주차만 바꾼 같은 화면의 href */
  hrefFor: (weekStart: DateString) => string;
}

export function WeekHeader({ weekStart, now, hrefFor }: WeekHeaderProps) {
  const current = getWeekStart(now);
  const home = getDefaultWeekStart(now);
  const hasNext = weekStart < getMaxWeekStart(now);
  const navButton = 'flex size-11 items-center justify-center rounded-full active:bg-raised';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center px-2 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1 lg:justify-start">
          <Link href={hrefFor(addWeeks(weekStart, -1))} aria-label="이전 주" className={navButton}>
            <ChevronLeft />
          </Link>
          <div className="text-center leading-tight">
            <p className="text-xs text-fg-muted">
              {getYear(weekStart)}
              {weekStart < current && ' · 지난 주 · 조회만 가능합니다'}
              {weekStart === current && ' · 진행 중 · 오늘부터 수정할 수 있습니다'}
              {weekStart > current && ' · 다음 주 일정'}
            </p>
            <p className="text-lg font-bold whitespace-nowrap tabular-nums max-[374px]:text-base">
              {formatWeekRange(weekStart)}
            </p>
          </div>
          {hasNext ? (
            <Link href={hrefFor(addWeeks(weekStart, 1))} aria-label="다음 주" className={navButton}>
              <ChevronRight />
            </Link>
          ) : (
            <span aria-disabled className={`${navButton} text-fg-disabled`}>
              <ChevronRight />
            </span>
          )}
          {weekStart !== home && (
            <Link
              href={hrefFor(home)}
              className="ml-1 hidden h-11 items-center lg:flex"
              aria-label="다음 주 일정으로 돌아가기"
            >
              <span className="rounded-ctl bg-primary-subtle px-2.5 py-1 text-sm font-medium text-on-primary-subtle">
                다음 주 일정
              </span>
            </Link>
          )}
        </div>
      </div>

      {weekStart !== home && (
        <div className="flex justify-center pb-2 lg:hidden">
          <Link href={hrefFor(home)} className="flex h-8 items-center">
            <span className="rounded-ctl bg-primary-subtle px-2.5 py-1 text-sm font-medium text-on-primary-subtle">
              다음 주 일정으로
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
