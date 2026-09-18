import { Suspense } from 'react';
import { WeekScreen } from '@/features/week-nav/week-screen';

export default function MyWeekPage() {
  return (
    <Suspense>
      <WeekScreen tab="me" />
    </Suspense>
  );
}
