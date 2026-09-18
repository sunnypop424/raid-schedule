export const TIME_ZONE = 'Asia/Seoul';

/** 레이드 추천 기준 인원 (오름차순). 가장 큰 값이 "전원" 강조. */
export const RAID_SIZES = [4, 8] as const;

/**
 * 주차 시작(수요일 00:00 KST) 기준 마감 오프셋(ms).
 * 0 = 화요일 23:59:59까지 제출로 인정, 수요일 00:00:00부터 "마감 후".
 */
export const DEADLINE_OFFSET_MS = 0;

/** 마감 몇 시간 전부터 배너를 띄울지 */
export const DEADLINE_BANNER_HOURS = 24;
/** 이 시간 이내면 배너 숫자를 강조 */
export const DEADLINE_URGENT_HOURS = 3;

/** 이번 주 기준 몇 주 앞까지 입력/이동 허용할지 (1 = 다음 주차까지) */
export const MAX_WEEKS_AHEAD = 1;

export const AUTOSAVE_DEBOUNCE_MS = 300;

export const STORAGE_KEYS = {
  memberId: 'raid-schedule:member-id',
  localDb: 'raid-schedule:local-db:v2',
} as const;
