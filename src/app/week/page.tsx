import { Suspense } from 'react';
import { WeekScreen } from '@/features/week-nav/week-screen';

export default function WeekPage() {
  return (
    <Suspense>
      <WeekScreen tab="team" />
    </Suspense>
  );
}
