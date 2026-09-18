'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentMemberId } from '@/shared/lib/stores';

/** 사용자 미선택 → /select, 선택됨 → /week/me (내 일정 입력이 첫 화면) */
export default function Home() {
  const router = useRouter();
  const [memberId] = useCurrentMemberId();

  useEffect(() => {
    if (memberId === undefined) return;
    router.replace(memberId === null ? '/select' : '/week/me');
  }, [memberId, router]);

  return null;
}
