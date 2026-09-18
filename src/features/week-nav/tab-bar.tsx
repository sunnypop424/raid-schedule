import Link from 'next/link';
import type { DateString } from '@/shared/lib/week';
import { CalendarIcon, UserIcon } from '@/shared/ui/icons';

export type WeekTab = 'team' | 'me';

export const tabHref = (tab: WeekTab, weekStart: DateString) =>
  `${tab === 'me' ? '/week/me' : '/week'}?w=${weekStart}`;

export function TabBar({ active, weekStart }: { active: WeekTab; weekStart: DateString }) {
  const tabs = [
    { tab: 'me', label: '내 일정', Icon: UserIcon },
    { tab: 'team', label: '전체 일정', Icon: CalendarIcon },
  ] as const;

  return (
    <nav
      aria-label="화면 전환"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-14 max-w-[640px]">
        {tabs.map(({ tab, label, Icon }) => (
          <li key={tab} className="flex-1">
            <Link
              href={tabHref(tab, weekStart)}
              replace
              aria-current={active === tab ? 'page' : undefined}
              className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                active === tab ? 'text-primary' : 'text-fg-muted'
              }`}
            >
              <Icon />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
