'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  api,
  ApiError,
  type Availability,
  type AvailabilityStatus,
  type SetAvailabilityInput,
} from '@/shared/api';
import { AUTOSAVE_DEBOUNCE_MS } from '@/shared/config/constants';
import { getWeekStart, type DateString } from '@/shared/lib/week';

const weekKey = (weekStart: DateString) => ['week', weekStart] as const;

export function useMembers() {
  return useQuery({ queryKey: ['members'], queryFn: api.listMembers, staleTime: Infinity });
}

export function useWeek(weekStart: DateString) {
  return useQuery({
    queryKey: weekKey(weekStart),
    queryFn: () => api.listWeek(weekStart),
    placeholderData: (prev) => prev,
  });
}

/** 다른 멤버의 변경을 받아 주차 데이터를 다시 불러온다 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  useEffect(
    () => api.subscribe(() => void queryClient.invalidateQueries({ queryKey: ['week'] })),
    [queryClient],
  );
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveChange {
  date: DateString;
  status: AvailabilityStatus | null;
  /** null = 종일 */
  startMinutes?: number | null;
}

/**
 * 낙관적 업데이트 + 날짜별 디바운스 자동 저장.
 * 실패하면 서버 상태로 되돌리고 에러 메시지를 돌려준다.
 */
export function useAutosave(memberId: number) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const timers = useRef(new Map<DateString, ReturnType<typeof setTimeout>>());
  const inflight = useRef(0);

  const flush = useCallback(
    async (input: SetAvailabilityInput) => {
      inflight.current += 1;
      try {
        await api.setAvailability(input);
        if (inflight.current === 1 && timers.current.size === 0) setState('saved');
      } catch (e) {
        setState('error');
        setError(
          e instanceof ApiError && e.code === 'PAST_DATE'
            ? '지난 날짜는 수정할 수 없습니다'
            : '저장하지 못했습니다. 다시 시도해 주세요.',
        );
        await queryClient.invalidateQueries({ queryKey: weekKey(getWeekStart(input.date)) });
      } finally {
        inflight.current -= 1;
      }
    },
    [queryClient],
  );

  const save = useCallback(
    (changes: SaveChange[]) => {
      if (changes.length === 0) return;
      setState('saving');
      setError(null);

      for (const { date, status, startMinutes = null } of changes) {
        const weekStart = getWeekStart(date);
        queryClient.setQueryData<Availability[]>(weekKey(weekStart), (rows = []) => {
          const rest = rows.filter((r) => !(r.member_id === memberId && r.date === date));
          if (!status) return rest;
          return [
            ...rest,
            {
              member_id: memberId,
              week_start: weekStart,
              date,
              status,
              start_minutes: status === 'available' ? startMinutes : null,
              updated_at: new Date().toISOString(),
            },
          ];
        });

        clearTimeout(timers.current.get(date));
        timers.current.set(
          date,
          setTimeout(() => {
            timers.current.delete(date);
            void flush({ memberId, date, status, startMinutes });
          }, AUTOSAVE_DEBOUNCE_MS),
        );
      }
    },
    [flush, memberId, queryClient],
  );

  return { save, state, error };
}
