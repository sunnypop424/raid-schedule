import { getSupabase } from '@/shared/lib/supabase';
import { ApiError, type Availability, type Member, type ScheduleApi } from './types';

export const supabaseApi: ScheduleApi = {
  async listMembers() {
    const { data, error } = await getSupabase()
      .from('members')
      .select('id, nickname, color, sort_order')
      .order('sort_order');
    if (error) throw new ApiError('UNKNOWN', error.message);
    return data as Member[];
  },

  async listWeek(weekStart) {
    const { data, error } = await getSupabase()
      .from('availabilities')
      .select('member_id, week_start, date, status, start_minutes, updated_at')
      .eq('week_start', weekStart);
    if (error) throw new ApiError('UNKNOWN', error.message);
    return data as Availability[];
  },

  async setAvailability({ memberId, date, status, startMinutes }) {
    const { error } = await getSupabase().rpc('set_availability', {
      p_member_id: memberId,
      p_date: date,
      p_status: status,
      p_start_minutes: status === 'available' ? (startMinutes ?? null) : null,
    });
    if (!error) return;
    const code = error.hint === 'PAST_DATE' || error.hint === 'TOO_FAR' ? error.hint : 'UNKNOWN';
    throw new ApiError(code, error.message);
  },

  subscribe(onChange) {
    const supabase = getSupabase();
    const channel = supabase
      .channel('availabilities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availabilities' }, onChange)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
