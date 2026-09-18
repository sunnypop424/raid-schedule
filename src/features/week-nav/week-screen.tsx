'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { MySchedule } from '@/features/my-schedule/my-schedule';
import { TeamSchedule } from '@/features/team-schedule/team-schedule';
import { isLocalMode } from '@/shared/api';
import { TIME_ZONE } from '@/shared/config/constants';
import { useMembers, useRealtimeSync } from '@/shared/lib/queries';
import { useCurrentMemberId, useNow } from '@/shared/lib/stores';
import { kstDate, normalizeWeekStart } from '@/shared/lib/week';
import { DeadlineBanner } from './deadline-banner';
import { TabBar, tabHref, type WeekTab } from './tab-bar';
import { WeekHeader } from './week-header';

/**
 * `/week`(전체 일정)와 `/week/me`(내 일정)가 함께 쓰는 화면.
 * 모바일은 탭에 해당하는 패널만, 데스크톱(≥1024px)은 두 패널을 나란히 보여준다.
 */
export function WeekScreen({ tab }: { tab: WeekTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useNow();
  const [memberId] = useCurrentMemberId();
  const { data: members } = useMembers();
  useRealtimeSync();

  useEffect(() => {
    if (memberId === null) router.replace('/select');
  }, [memberId, router]);

  if (!now || !memberId) return null;

  const weekStart = normalizeWeekStart(searchParams.get('w'), now);
  const me = members?.find((m) => m.id === memberId);
  const hour = Number(formatInTimeZone(now, TIME_ZONE, 'H'));
  const beforeReset = kstDate(now) === weekStart && hour < 6;

  return (
    <>
      <WeekHeader weekStart={weekStart} now={now} hrefFor={(w) => tabHref(tab, w)} />

      <main className="mx-auto w-full max-w-[640px] px-4 pt-3 pb-[calc(72px+env(safe-area-inset-bottom))] sm:px-6 lg:max-w-[1200px] lg:px-8 lg:pt-6 lg:pb-8">
        {isLocalMode && (
          <p className="mb-3 rounded-ctl bg-raised px-3 py-2 text-xs text-fg-secondary">
            로컬 모드입니다. Supabase 환경변수를 설정하기 전까지는 이 브라우저에만 저장됩니다.
          </p>
        )}
        {beforeReset && (
          <p className="mb-3 px-1 text-xs text-fg-muted">아직 로아 초기화 전입니다 (06:00)</p>
        )}
        <DeadlineBanner memberId={memberId} now={now} />

        <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className={`${tab === 'me' ? '' : 'hidden'} lg:block lg:rounded-card lg:bg-card lg:p-4`}>
            <MySchedule member={me} memberId={memberId} weekStart={weekStart} now={now} />
          </div>
          <div className={`${tab === 'team' ? '' : 'hidden'} lg:block`}>
            <TeamSchedule weekStart={weekStart} now={now} currentMemberId={memberId} />
          </div>
        </div>
      </main>

      <TabBar active={tab} weekStart={weekStart} />
    </>
  );
}
