import { STORAGE_KEYS } from '@/shared/config/constants';
import { SEED_MEMBERS } from '@/shared/config/members';
import { addDays, getMaxWeekStart, getWeekStart, kstDate } from '@/shared/lib/week';
import { ApiError, type Availability, type ScheduleApi } from './types';

/**
 * Supabase 환경변수가 없을 때 쓰는 개발용 저장소.
 * localStorage 에 저장하고, 같은 브라우저의 다른 탭과는 BroadcastChannel 로 동기화한다.
 * RPC(set_availability)와 같은 규칙을 적용한다.
 */

const CHANNEL = 'raid-schedule:local-db';

function read(): Availability[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.localDb) ?? '[]') as Availability[];
  } catch {
    return [];
  }
}

function write(rows: Availability[]) {
  localStorage.setItem(STORAGE_KEYS.localDb, JSON.stringify(rows));
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage('changed');
  channel.close();
}

export const localApi: ScheduleApi = {
  async listMembers() {
    return SEED_MEMBERS;
  },

  async listWeek(weekStart) {
    return read().filter((row) => row.week_start === weekStart);
  },

  async setAvailability({ memberId, date, status, startMinutes }) {
    if (date < kstDate()) throw new ApiError('PAST_DATE', 'past date is read-only');
    if (date > addDays(getMaxWeekStart(), 6)) throw new ApiError('TOO_FAR', 'date is too far ahead');

    const rows = read().filter((row) => !(row.member_id === memberId && row.date === date));
    if (status) {
      rows.push({
        member_id: memberId,
        week_start: getWeekStart(date),
        date,
        status,
        start_minutes: status === 'available' ? (startMinutes ?? null) : null,
        updated_at: new Date().toISOString(),
      });
    }
    write(rows);
  },

  subscribe(onChange) {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = onChange;
    return () => channel.close();
  },
};
