import type { DateString } from '@/shared/lib/week';

export type AvailabilityStatus = 'available' | 'unavailable' | 'undecided';

export interface Member {
  id: number;
  nickname: string;
  color: string;
  sort_order: number;
}

export interface Availability {
  member_id: number;
  week_start: DateString;
  date: DateString;
  status: AvailabilityStatus;
  /** 가능 시작 시간(분). null = 종일. status 가 available 일 때만 의미가 있다 */
  start_minutes: number | null;
  updated_at: string;
}

export interface SetAvailabilityInput {
  memberId: number;
  date: DateString;
  /** null = 미입력으로 되돌림 */
  status: AvailabilityStatus | null;
  /** null = 종일 */
  startMinutes?: number | null;
}

export type ApiErrorCode = 'PAST_DATE' | 'TOO_FAR' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface ScheduleApi {
  listMembers(): Promise<Member[]>;
  listWeek(weekStart: DateString): Promise<Availability[]>;
  setAvailability(input: SetAvailabilityInput): Promise<void>;
  /** 다른 멤버의 변경을 구독. 해제 함수를 돌려준다. */
  subscribe(onChange: () => void): () => void;
}
