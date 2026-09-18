'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/shared/config/constants';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // 저장소를 못 쓰는 환경(사파리 프라이빗 등)에서는 세션 동안만 유지되지 않아도 동작은 한다
  }
  listeners.forEach((l) => l());
}

/** localStorage 값 구독. 서버 렌더/하이드레이션 중에는 `undefined` */
function useStoredValue(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readStorage(key),
    () => undefined,
  );
}

/** `undefined` = 아직 모름(하이드레이션 전), `null` = 미선택 */
export function useCurrentMemberId(): [number | null | undefined, (id: number | null) => void] {
  const raw = useStoredValue(STORAGE_KEYS.memberId);
  const set = useCallback(
    (id: number | null) => writeStorage(STORAGE_KEYS.memberId, id === null ? null : String(id)),
    [],
  );
  if (raw === undefined) return [undefined, set];
  const id = Number(raw);
  return [raw !== null && Number.isInteger(id) && id > 0 ? id : null, set];
}

/** 분 단위로 갱신되는 현재 시각 ("오늘"·마감 판정용). 하이드레이션 전에는 `null` */
let nowSnapshot: Date | null = null;

function subscribeNow(listener: () => void) {
  const id = setInterval(() => {
    nowSnapshot = new Date();
    listener();
  }, 60_000);
  return () => clearInterval(id);
}

export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribeNow,
    () => (nowSnapshot ??= new Date()),
    () => null,
  );
}

