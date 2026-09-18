/**
 * 가능 시작 시간. 그날 00:00 기준 분(minute). 00:00 ~ 23:30, 30분 단위.
 * `null` 은 "종일".
 */
export const START_MIN = 0; // 00:00
export const START_MAX = 23 * 60 + 30; // 23:30
export const START_STEP = 30;

export const TIME_SLOTS: number[] = [];
for (let m = START_MIN; m <= START_MAX; m += START_STEP) TIME_SLOTS.push(m);

/** 1230 → `20:30`, 30 → `00:30` */
export function formatSlot(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 셀렉트 옵션용: `종일` / `20:30 이후` */
export function slotLabel(minutes: number | null): string {
  return minutes === null ? '종일' : `${formatSlot(minutes)} 이후`;
}

/** 칩·표 표기용: `종일` / `20:30~` */
export function slotShort(minutes: number | null): string {
  return minutes === null ? '종일' : `${formatSlot(minutes)}~`;
}

/** 여러 명이 모두 모일 수 있는 가장 이른 시각 = 시작 시간 중 가장 늦은 값. 전원 종일이면 `null` */
export function commonStart(starts: (number | null)[]): number | null {
  const timed = starts.filter((s): s is number => s !== null);
  return timed.length ? Math.max(...timed) : null;
}

/** `22:00부터` / `종일 가능` */
export function commonStartLabel(minutes: number | null): string {
  return minutes === null ? '종일 가능' : `${formatSlot(minutes)}부터`;
}

export function isValidSlot(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= START_MIN &&
    minutes <= START_MAX &&
    minutes % START_STEP === 0
  );
}
