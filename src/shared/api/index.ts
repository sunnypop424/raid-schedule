import { isSupabaseConfigured } from '@/shared/lib/supabase';
import { localApi } from './local-api';
import { supabaseApi } from './supabase-api';
import type { ScheduleApi } from './types';

export const api: ScheduleApi = isSupabaseConfigured ? supabaseApi : localApi;
export const isLocalMode = !isSupabaseConfigured;

export * from './types';
